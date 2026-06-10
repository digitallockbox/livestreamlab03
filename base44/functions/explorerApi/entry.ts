/**
 * Block Explorer API
 * Returns sample chain data for demo
 * For production: integrate with Trident Ledger API or PostgreSQL
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Sample data generator
function generateSampleData() {
  const blocks = [];
  const transactions = [];
  
  for (let i = 12340; i <= 12350; i++) {
    const blockHash = `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    
    blocks.push({
      height: i,
      hash: blockHash,
      timestamp: new Date(Date.now() - (12350 - i) * 60000).toISOString(),
      txCount: Math.floor(Math.random() * 20) + 5,
    });
    
    // Create 3-7 transactions per block
    const txCount = Math.floor(Math.random() * 5) + 3;
    for (let j = 0; j < txCount; j++) {
      transactions.push({
        hash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        blockHash,
        blockHeight: i,
        from: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        to: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        amount: Math.floor(Math.random() * 1000) + 10,
        status: 'confirmed',
        timestamp: new Date(Date.now() - (12350 - i) * 60000).toISOString(),
      });
    }
  }
  
  return { blocks, transactions };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const url = new URL(req.url);
    const path = url.pathname;
    const segments = path.split('/').filter(Boolean);
    
    // GET /explorer/blocks
    if (path === '/explorer/blocks') {
      const { blocks } = generateSampleData();
      return new Response(JSON.stringify({
        success: true,
        blocks: blocks.slice(-20).reverse(),
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // GET /explorer/block/:id
    if (path.match(/^\/explorer\/block\/(.+)$/)) {
      const id = segments[2];
      const { blocks, transactions } = generateSampleData();
      let block;
      
      if (/^\d+$/.test(id)) {
        block = blocks.find(b => b.height === parseInt(id));
      } else {
        block = blocks.find(b => b.hash === id);
      }
      
      if (!block) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Block not found',
        }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      
      const blockTxs = transactions.filter(tx => tx.blockHash === block.hash);
      
      return new Response(JSON.stringify({
        success: true,
        block,
        transactions: blockTxs,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // GET /explorer/address/:address
    if (path.match(/^\/explorer\/address\/(.+)$/)) {
      const address = decodeURIComponent(segments[2]);
      const { transactions } = generateSampleData();
      
      const addrTxs = transactions.filter(tx => 
        tx.from === address || tx.to === address
      );
      
      const balance = addrTxs.reduce((acc, tx) => {
        return tx.to === address ? acc + tx.amount : acc - tx.amount;
      }, 5000); // Start with base balance
      
      return new Response(JSON.stringify({
        success: true,
        address: {
          address,
          balance: Math.max(0, balance),
          txCount: addrTxs.length,
        },
        transactions: addrTxs.slice(-50),
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // GET /explorer/stats
    if (path === '/explorer/stats') {
      const { blocks, transactions } = generateSampleData();
      const latestBlock = blocks[blocks.length - 1];
      
      return new Response(JSON.stringify({
        success: true,
        stats: {
          latestHeight: latestBlock.height,
          latestHash: latestBlock.hash,
          totalTransactions: transactions.length,
          totalAddresses: 150,
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // GET /explorer/transaction/:hash
    if (path.match(/^\/explorer\/transaction\/(.+)$/)) {
      const hash = segments[2];
      const { transactions } = generateSampleData();
      const tx = transactions.find(t => t.hash === hash);
      
      if (!tx) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Transaction not found',
        }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      
      return new Response(JSON.stringify({
        success: true,
        transaction: tx,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('explorerApi error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});