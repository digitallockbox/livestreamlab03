// @ts-check
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Block Explorer API Routes
 * Real chain data from PostgreSQL — no mock data
 */

// GET /explorer/blocks - Latest 20 blocks
export async function getLatestBlocks(req, res) {
  try {
    const blocks = await prisma.block.findMany({
      orderBy: { height: 'desc' },
      take: 20,
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    return res.json({
      success: true,
      blocks: blocks.map((b) => ({
        height: b.height,
        hash: b.hash,
        timestamp: b.timestamp,
        txCount: b._count.transactions,
      })),
    });
  } catch (err) {
    console.error('getLatestBlocks error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

// GET /explorer/block/:id - Block by height or hash
export async function getBlock(req, res) {
  try {
    const { id } = req.params;
    let block;

    if (/^\d+$/.test(id)) {
      block = await prisma.block.findFirst({
        where: { height: parseInt(id, 10) },
        include: {
          transactions: {
            orderBy: { timestamp: 'desc' },
            take: 50,
          },
        },
      });
    } else {
      block = await prisma.block.findFirst({
        where: { hash: id },
        include: {
          transactions: {
            orderBy: { timestamp: 'desc' },
            take: 50,
          },
        },
      });
    }

    if (!block) {
      return res.status(404).json({
        success: false,
        error: 'Block not found',
      });
    }

    return res.json({
      success: true,
      block: {
        height: block.height,
        hash: block.hash,
        timestamp: block.timestamp,
        txCount: block.transactions.length,
      },
      transactions: block.transactions.map((tx) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        amount: tx.amount,
        status: tx.status,
        timestamp: tx.timestamp,
      })),
    });
  } catch (err) {
    console.error('getBlock error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

// GET /explorer/address/:address - Address info + transactions
export async function getAddress(req, res) {
  try {
    const { address } = req.params;

    const addr = await prisma.address.findFirst({
      where: { address },
    });

    if (!addr) {
      return res.status(404).json({
        success: false,
        error: 'Address not found',
      });
    }

    const txs = await prisma.transaction.findMany({
      where: {
        OR: [{ from: address }, { to: address }],
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
      include: {
        block: {
          select: { height: true, hash: true },
        },
      },
    });

    return res.json({
      success: true,
      address: {
        address: addr.address,
        balance: addr.balance,
        txCount: addr.txCount,
      },
      transactions: txs.map((tx) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        amount: tx.amount,
        status: tx.status,
        timestamp: tx.timestamp,
        blockHeight: tx.block?.height,
        blockHash: tx.block?.hash,
      })),
    });
  } catch (err) {
    console.error('getAddress error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

// GET /explorer/stats - Chain statistics
export async function getChainStats(req, res) {
  try {
    const latestBlock = await prisma.block.findFirst({
      orderBy: { height: 'desc' },
    });

    const totalTransactions = await prisma.transaction.count();
    const totalAddresses = await prisma.address.count();

    return res.json({
      success: true,
      stats: {
        latestHeight: latestBlock?.height || 0,
        latestHash: latestBlock?.hash || null,
        totalTransactions,
        totalAddresses,
      },
    });
  } catch (err) {
    console.error('getChainStats error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

// GET /explorer/transaction/:hash - Transaction details
export async function getTransaction(req, res) {
  try {
    const { hash } = req.params;

    const tx = await prisma.transaction.findFirst({
      where: { hash },
      include: {
        block: {
          select: { height: true, hash: true, timestamp: true },
        },
      },
    });

    if (!tx) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
    }

    return res.json({
      success: true,
      transaction: {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        amount: tx.amount,
        status: tx.status,
        timestamp: tx.timestamp,
        block: {
          height: tx.block.height,
          hash: tx.block.hash,
          timestamp: tx.block.timestamp,
        },
      },
    });
  } catch (err) {
    console.error('getTransaction error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

export default {
  getLatestBlocks,
  getBlock,
  getAddress,
  getChainStats,
  getTransaction,
};