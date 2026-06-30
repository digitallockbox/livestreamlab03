import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const FREENAME_BASE = 'https://apis.freename.io';
const DEFAULT_REGISTRANT_UUID = '00023a69-7ac9-475f-bd85-360e9a05e2bc';
// Read Freename reseller secrets lazily so the function can run before they are configured.
const fnEnv = (key) => Deno.env.get("FREENAME_" + key);

// Map the app's wallet chain to the Freename minting chain value.
const mapChain = (chain) => {
  if (!chain) return 'POLYGON';
  const c = String(chain).toLowerCase();
  if (c === 'solana') return 'SOLANA';
  if (c === 'evm' || c === 'ethereum') return 'POLYGON';
  return String(chain).toUpperCase();
};

// Cryptographically prove the caller owns the wallet in the payload.
const verifyOwnership = async (base44, body, requiredWallet) => {
  try {
    const res = await base44.functions.invoke('verifyWalletSignature', {
      wallet_address: body.auth_wallet,
      message: body.auth_message,
      signature: body.auth_signature,
      chain: body.chain,
    });
    const d = res?.data || res;
    if (!d?.valid) return { ok: false, status: 401, error: 'Wallet signature invalid' };
    if (requiredWallet && d.wallet_address !== requiredWallet) {
      return { ok: false, status: 403, error: 'Wallet not authorized for this action' };
    }
    return { ok: true, wallet_address: d.wallet_address };
  } catch (_e) {
    return { ok: false, status: 401, error: 'Wallet verification failed' };
  }
};

async function freenameLogin() {
  const username = fnEnv('USERNAME');
  const password = fnEnv('PASSWORD');
  if (!username || !password) return null;
  const r = await fetch(`${FREENAME_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    throw new Error(`Freename login failed (${r.status}): ${t}`);
  }
  const data = await r.json();
  return data.access_token;
}

async function mintOnFreename(zoneName, walletAddress, chain) {
  const token = await freenameLogin();
  const registrantUuid = fnEnv('REGISTRANT_UUID') || DEFAULT_REGISTRANT_UUID;
  if (!fnEnv('REGISTRANT_UUID')) {
    console.warn('FREENAME_REGISTRANT_UUID not set; using documented test registrant UUID');
  }

  // 1) Availability check
  const availRes = await fetch(
    `${FREENAME_BASE}/api/v1/reseller-logic/zones/availability/${encodeURIComponent(zoneName)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!availRes.ok) {
    const t = await availRes.text().catch(() => '');
    return { ok: false, error: `Availability check failed (${availRes.status}): ${t}` };
  }
  const availJson = await availRes.json();
  if (availJson.data === false) {
    return { ok: false, error: 'Domain is not available' };
  }

  // 2) Create + mint the zone to the caller's wallet
  const body = {
    name: zoneName,
    status: 'OK',
    chain: mapChain(chain),
    walletAddress,
    registrantUuid,
    registrationDate: new Date().toISOString(),
  };
  const createRes = await fetch(`${FREENAME_BASE}/api/v1/reseller-logic/zones?mint=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!createRes.ok) {
    const t = await createRes.text().catch(() => '');
    return { ok: false, error: `Create/mint failed (${createRes.status}): ${t}` };
  }
  const createJson = await createRes.json();
  const zone = createJson.data || {};
  return { ok: true, order_id: zone.uuid || '', tx_hash: zone.tokenId || zone.uuid || '', zone };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Wallet-only creators have no Base44 user session; authenticate write actions via
    // on-chain wallet signature verification (verifyOwnership) instead of auth.me().
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'list';

    if (action === 'purchase') {
      const domain = (body.domain || '').trim().toLowerCase();
      const wallet = (body.wallet || '').trim();
      const chain = body.chain || 'evm';
      if (!domain || !wallet) {
        return Response.json({ error: 'domain and wallet are required' }, { status: 400 });
      }
      const v = await verifyOwnership(base44, body, wallet);
      if (!v.ok) return Response.json({ error: v.error }, { status: v.status });

      // Record the purchase locally first (status pending).
      const record = await base44.asServiceRole.entities.Domain.create({
        domain,
        wallet,
        chain,
        status: 'pending',
      });

      const hasCreds = !!(fnEnv('USERNAME') && fnEnv('PASSWORD'));
      if (!hasCreds) {
        return Response.json({
          domain: record,
          minted: false,
          message: 'Domain recorded locally. Freename credentials are not configured yet — minting will run once they are added.',
        });
      }

      try {
        const mint = await mintOnFreename(domain, wallet, chain);
        if (!mint.ok) {
          await base44.asServiceRole.entities.Domain.update(record.id, { status: 'failed' });
          return Response.json({ error: mint.error, domain: record }, { status: 502 });
        }
        const updated = await base44.asServiceRole.entities.Domain.update(record.id, {
          status: 'minted',
          freename_order_id: mint.order_id,
          tx_hash: mint.tx_hash,
        });
        return Response.json({ domain: updated, minted: true, freename: mint.zone });
      } catch (e) {
        await base44.asServiceRole.entities.Domain.update(record.id, { status: 'failed' });
        return Response.json({ error: e.message, domain: record }, { status: 502 });
      }
    }

    if (action === 'list') {
      const wallet = (body.wallet || '').trim();
      if (!wallet) return Response.json({ error: 'wallet required' }, { status: 400 });
      const domains = await base44.asServiceRole.entities.Domain.filter(
        { wallet },
        '-created_date',
        50
      );
      return Response.json({ domains, count: domains.length });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});