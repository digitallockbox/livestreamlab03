/**
 * Chain Data Ingestion Worker
 * Syncs blocks, transactions, and addresses from Trident ledger to PostgreSQL
 * Run this periodically (cron) or as a continuous worker
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration
const TRIDENT_LEDGER_API = 'https://api.tridentsystem.live/ledger/blocks';
const BATCH_SIZE = 100;
const POLL_INTERVAL_MS = 5000; // 5 seconds

/**
 * Fetch latest blocks from Trident ledger
 */
async function fetchLatestBlocks(fromHeight, limit = BATCH_SIZE) {
  try {
    const response = await fetch(
      `${TRIDENT_LEDGER_API}?from=${fromHeight}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Ledger API error: ${response.status}`);
    }

    const data = await response.json();
    return data.blocks || [];
  } catch (err) {
    console.error('fetchLatestBlocks error:', err);
    return [];
  }
}

/**
 * Upsert block and its transactions to PostgreSQL
 */
async function upsertBlock(blockData) {
  try {
    // Upsert block
    const block = await prisma.block.upsert({
      where: { height: blockData.height },
      update: {
        hash: blockData.hash,
        timestamp: new Date(blockData.timestamp),
        txCount: blockData.transactions?.length || 0,
      },
      create: {
        height: blockData.height,
        hash: blockData.hash,
        timestamp: new Date(blockData.timestamp),
        txCount: blockData.transactions?.length || 0,
      },
    });

    // Upsert transactions
    if (blockData.transactions && blockData.transactions.length > 0) {
      const txOperations = blockData.transactions.map((tx) =>
        prisma.transaction.upsert({
          where: { hash: tx.hash },
          update: {
            blockId: block.id,
            from: tx.from,
            to: tx.to,
            amount: tx.amount,
            status: tx.status,
            timestamp: new Date(tx.timestamp),
          },
          create: {
            hash: tx.hash,
            blockId: block.id,
            from: tx.from,
            to: tx.to,
            amount: tx.amount,
            status: tx.status,
            timestamp: new Date(tx.timestamp),
          },
        })
      );

      await prisma.$transaction(txOperations);
    }

    // Update address balances and tx counts
    const addressUpdates = new Map();

    blockData.transactions?.forEach((tx) => {
      // From address
      addressUpdates.set(tx.from, {
        address: tx.from,
        balanceChange: -tx.amount,
        txIncrement: 1,
      });

      // To address
      const existing = addressUpdates.get(tx.to) || {
        address: tx.to,
        balanceChange: 0,
        txIncrement: 0,
      };
      addressUpdates.set(tx.to, {
        ...existing,
        balanceChange: existing.balanceChange + tx.amount,
        txIncrement: existing.txIncrement + 1,
      });
    });

    // Apply address updates
    const addressOperations = Array.from(addressUpdates.values()).map(
      ({ address, balanceChange, txIncrement }) =>
        prisma.address.upsert({
          where: { address },
          update: {
            balance: { increment: balanceChange },
            txCount: { increment: txIncrement },
          },
          create: {
            address,
            balance: balanceChange,
            txCount: txIncrement,
          },
        })
    );

    if (addressOperations.length > 0) {
      await prisma.$transaction(addressOperations);
    }

    return block;
  } catch (err) {
    console.error('upsertBlock error:', err);
    throw err;
  }
}

/**
 * Get current max block height from database
 */
async function getCurrentMaxHeight() {
  const latest = await prisma.block.findFirst({
    orderBy: { height: 'desc' },
    select: { height: true },
  });
  return latest?.height || 0;
}

/**
 * Main ingestion loop - runs continuously
 */
export async function startIngestionWorker() {
  console.log('[IngestionWorker] Starting...');

  while (true) {
    try {
      const currentHeight = await getCurrentMaxHeight();
      const blocks = await fetchLatestBlocks(currentHeight + 1);

      if (blocks.length === 0) {
        console.log(
          `[IngestionWorker] No new blocks. Current height: ${currentHeight}`
        );
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        continue;
      }

      console.log(
        `[IngestionWorker] Processing ${blocks.length} blocks from height ${
          currentHeight + 1
        }`
      );

      for (const block of blocks) {
        await upsertBlock(block);
        console.log(`[IngestionWorker] Synced block ${block.height}`);
      }

      console.log(
        `[IngestionWorker] Batch complete. New height: ${
          currentHeight + blocks.length
        }`
      );
    } catch (err) {
      console.error('[IngestionWorker] Error:', err);
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
}

/**
 * One-time sync - run once and exit
 */
export async function syncOnce() {
  try {
    const currentHeight = await getCurrentMaxHeight();
    const blocks = await fetchLatestBlocks(currentHeight + 1);

    if (blocks.length === 0) {
      console.log('[SyncOnce] No new blocks to sync');
      return { synced: 0 };
    }

    for (const block of blocks) {
      await upsertBlock(block);
    }

    console.log(`[SyncOnce] Synced ${blocks.length} blocks`);
    return { synced: blocks.length };
  } catch (err) {
    console.error('[SyncOnce] Error:', err);
    throw err;
  }
}

// Export for use as CLI or module
export default {
  startIngestionWorker,
  syncOnce,
};