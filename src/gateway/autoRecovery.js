const recovery = {};

function init(engine) {
  if (!recovery[engine]) {
    recovery[engine] = {
      unhealthySince: null,
      restarting: false,
      cooldownMs: 30000
    };
  }
}

export async function markFailureAndMaybeRecover(engine, restartUrl) {
  init(engine);
  const r = recovery[engine];

  if (!r.unhealthySince) {
    r.unhealthySince = Date.now();
    return;
  }

  const downFor = Date.now() - r.unhealthySince;
  if (downFor < r.cooldownMs || r.restarting) return;

  r.restarting = true;
  try {
    await fetch(restartUrl, { method: "POST" });
  } finally {
    r.restarting = false;
    r.unhealthySince = Date.now(); // reset cooldown window
  }
}

export function markSuccess(engine) {
  init(engine);
  recovery[engine].unhealthySince = null;
}
