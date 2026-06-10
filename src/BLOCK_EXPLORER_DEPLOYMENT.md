# Trident Block Explorer - Complete Deployment Guide

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Ingestion      │────▶│  Express API     │────▶│  PostgreSQL     │
│  Worker (Node)  │     │  + Prisma        │     │  Database       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               ▲
                               │
                               │ HTTPS
                               │
                        ┌─────────────────┐
                        │  Base44 UI      │
                        │  (tridentProxy) │
                        └─────────────────┘
```

## Components

1. **Ingestion Worker** - Node.js service that fetches blocks from Trident Ledger
2. **Express API** - REST API with Prisma ORM for data queries
3. **PostgreSQL Database** - Persistent storage for blockchain data
4. **Base44 UI** - Frontend already integrated via tridentProxy

---

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Docker (optional, for easier deployment)
- Trident Ledger API access: `https://api.tridentsystem.live`

---

## Step 1: PostgreSQL Database Setup

### Option A: Docker (Recommended)

```bash
docker run -d \
  --name trident-explorer-db \
  -e POSTGRES_USER=trident \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=trident_explorer \
  -p 5432:5432 \
  -v trident_db_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

### Option B: Managed Service (Production)

Use services like:
- **Supabase** (free tier available)
- **Neon** (serverless PostgreSQL)
- **AWS RDS**
- **Railway**

Create database and note the connection string:
```
postgresql://user:password@host:5432/trident_explorer
```

---

## Step 2: Project Setup

```bash
mkdir trident-block-explorer
cd trident-block-explorer
npm init -y
npm install express @prisma/client cors dotenv
npm install -D prisma nodemon
npx prisma init
```

---

## Step 3: Prisma Schema

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Block {
  id        Int      @id @default(autoincrement())
  height    Int      @unique
  hash      String   @unique
  timestamp DateTime
  txCount   Int
  txs       Transaction[]
  createdAt DateTime @default(now())
  
  @@index([height])
  @@index([timestamp])
}

model Transaction {
  id        Int      @id @default(autoincrement())
  hash      String   @unique
  blockId   Int
  block     Block    @relation(fields: [blockId], references: [id])
  type      String
  status    String
  amount    Decimal
  fromAddr  String?
  toAddr    String?
  fee       Decimal?
  slot      Int
  timestamp DateTime
  createdAt DateTime @default(now())
  
  @@index([blockId])
  @@index([hash])
  @@index([fromAddr])
  @@index([toAddr])
  @@index([timestamp])
}

model Address {
  address        String   @id
  balance        Decimal  @default(0)
  transactionCount Int    @default(0)
  lastActivity   DateTime?
  transactions   Transaction[]
  createdAt      DateTime @default(now())
  
  @@index([balance])
  @@index([transactionCount])
}
```

---

## Step 4: Environment Variables

Create `.env`:

```env
# Database
DATABASE_URL="postgresql://trident:your_secure_password@localhost:5432/trident_explorer"

# Server
PORT=3001
NODE_ENV=production

# Trident API
TRIDENT_API_URL=https://api.tridentsystem.live

# Rate Limiting (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Step 5: Express API Server

Create `server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get latest blocks
app.get('/explorer/blocks', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const blocks = await prisma.block.findMany({
      take: limit,
      orderBy: { height: 'desc' },
      include: { txs: { take: 5 } }
    });
    res.json({ success: true, blocks, count: blocks.length });
  } catch (error) {
    console.error('Error fetching blocks:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific block
app.get('/explorer/block/:heightOrHash', async (req, res) => {
  try {
    const { heightOrHash } = req.params;
    const block = await prisma.block.findFirst({
      where: {
        OR: [
          { height: parseInt(heightOrHash) },
          { hash: heightOrHash }
        ]
      },
      include: { txs: true }
    });
    
    if (!block) {
      return res.status(404).json({ success: false, error: 'Block not found' });
    }
    
    res.json({ success: true, block });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get address info
app.get('/explorer/address/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const addressData = await prisma.address.findUnique({
      where: { address },
      include: { 
        transactions: { 
          take: 20, 
          orderBy: { timestamp: 'desc' },
          include: { block: true }
        }
      }
    });
    
    if (!addressData) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }
    
    res.json({ success: true, address: addressData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get transaction by hash
app.get('/explorer/transaction/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const tx = await prisma.transaction.findUnique({
      where: { hash },
      include: { block: true }
    });
    
    if (!tx) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    
    res.json({ success: true, transaction: tx });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get network stats
app.get('/explorer/stats', async (req, res) => {
  try {
    const [latestBlock, totalTxs, totalAddresses] = await Promise.all([
      prisma.block.findFirst({ orderBy: { height: 'desc' } }),
      prisma.transaction.count(),
      prisma.address.count()
    ]);
    
    res.json({
      success: true,
      stats: {
        latestHeight: latestBlock?.height || 0,
        totalTransactions: totalTxs,
        totalAddresses: totalAddresses,
        blocksTracked: await prisma.block.count()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Trident Explorer API running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
});
```

---

## Step 6: Ingestion Worker

Create `worker/ingestionWorker.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const TRIDENT_API = process.env.TRIDENT_API_URL || 'https://api.tridentsystem.live';
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS) || 10000; // 10 seconds

async function fetchBlockData(height) {
  try {
    const response = await fetch(`${TRIDENT_API}/explorer/block/${height}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch block ${height}:`, error.message);
    return null;
  }
}

async function ingestBlock(blockData) {
  try {
    // Upsert block
    const block = await prisma.block.upsert({
      where: { height: blockData.height },
      update: {
        hash: blockData.hash,
        txCount: blockData.txCount,
        timestamp: new Date(blockData.timestamp)
      },
      create: {
        height: blockData.height,
        hash: blockData.hash,
        txCount: blockData.txCount,
        timestamp: new Date(blockData.timestamp)
      }
    });

    // Upsert transactions
    if (blockData.transactions && blockData.transactions.length > 0) {
      for (const tx of blockData.transactions) {
        await prisma.transaction.upsert({
          where: { hash: tx.hash },
          update: {
            blockId: block.id,
            type: tx.type,
            status: tx.status,
            amount: tx.amount,
            fromAddr: tx.from,
            toAddr: tx.to,
            fee: tx.fee,
            slot: tx.slot,
            timestamp: new Date(tx.timestamp)
          },
          create: {
            hash: tx.hash,
            blockId: block.id,
            type: tx.type,
            status: tx.status,
            amount: tx.amount,
            fromAddr: tx.from,
            toAddr: tx.to,
            fee: tx.fee,
            slot: tx.slot,
            timestamp: new Date(tx.timestamp)
          }
        });

        // Update address balances
        if (tx.from) await updateAddress(tx.from, tx);
        if (tx.to) await updateAddress(tx.to, tx);
      }
    }

    console.log(`✅ Ingested block ${blockData.height} with ${blockData.transactions?.length || 0} transactions`);
  } catch (error) {
    console.error('Error ingesting block:', error.message);
  }
}

async function updateAddress(address, tx) {
  try {
    await prisma.address.upsert({
      where: { address },
      update: {
        transactionCount: { increment: 1 },
        lastActivity: new Date(tx.timestamp)
      },
      create: {
        address,
        transactionCount: 1,
        lastActivity: new Date(tx.timestamp)
      }
    });
  } catch (error) {
    console.error(`Error updating address ${address}:`, error.message);
  }
}

async function getLatestHeight() {
  try {
    const response = await fetch(`${TRIDENT_API}/explorer/stats`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.stats?.latestHeight || 0;
  } catch (error) {
    console.error('Failed to fetch latest height:', error.message);
    return 0;
  }
}

async function sync() {
  try {
    const latestHeight = await getLatestHeight();
    const localLatest = await prisma.block.findFirst({
      orderBy: { height: 'desc' },
      select: { height: true }
    });
    
    const startHeight = localLatest ? localLatest.height + 1 : 0;
    
    console.log(`🔄 Syncing from block ${startHeight} to ${latestHeight}`);
    
    for (let height = startHeight; height <= latestHeight; height++) {
      const blockData = await fetchBlockData(height);
      if (blockData && blockData.success) {
        await ingestBlock(blockData.block);
      }
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error('Sync error:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Trident Block Explorer Ingestion Worker');
  console.log(`📡 Trident API: ${TRIDENT_API}`);
  console.log(`⏱️  Poll interval: ${POLL_INTERVAL_MS / 1000}s`);
  
  // Initial sync
  await sync();
  
  // Continuous polling
  setInterval(async () => {
    await sync();
  }, POLL_INTERVAL_MS);
}

main().catch(console.error);
```

---

## Step 7: Deployment Scripts

### Docker Compose (All-in-One)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: trident
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: trident_explorer
    volumes:
      - trident_db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U trident"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build: .
    environment:
      DATABASE_URL: postgresql://trident:${DB_PASSWORD}@db:5432/trident_explorer
      PORT: 3001
      TRIDENT_API_URL: https://api.tridentsystem.live
    ports:
      - "3001:3001"
    depends_on:
      db:
        condition: service_healthy
    command: sh -c "npx prisma migrate deploy && node server.js"

  worker:
    build: .
    environment:
      DATABASE_URL: postgresql://trident:${DB_PASSWORD}@db:5432/trident_explorer
      TRIDENT_API_URL: https://api.tridentsystem.live
      POLL_INTERVAL_MS: 10000
    depends_on:
      - api
    command: node worker/ingestionWorker.js

volumes:
  trident_db_data:
```

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3001

CMD ["node", "server.js"]
```

---

## Step 8: Deployment Commands

### Local Development

```bash
# 1. Start database
docker-compose up -d db

# 2. Run migrations
npx prisma migrate dev

# 3. Start API server
node server.js

# 4. Start worker (in another terminal)
node worker/ingestionWorker.js
```

### Production (Docker)

```bash
# 1. Build and deploy
docker-compose up -d --build

# 2. View logs
docker-compose logs -f api
docker-compose logs -f worker

# 3. Stop all
docker-compose down
```

### Production (Cloud - Railway/Render)

1. **Database**: Create PostgreSQL instance
2. **API Service**: 
   - Build command: `npm install && npx prisma generate`
   - Start command: `npx prisma migrate deploy && node server.js`
   - Set `DATABASE_URL` environment variable
3. **Worker Service**:
   - Start command: `node worker/ingestionWorker.js`
   - Set same `DATABASE_URL`

---

## Step 9: Base44 Integration

The Base44 UI is already configured to call the Express API via tridentProxy.

Update `functions/tridentProxy.js` TRIDENT_BASE URL to point to your deployed API:

```javascript
const TRIDENT_BASE = "https://your-deployed-api.com"; // Change from api.tridentsystem.live
```

Or keep using `api.tridentsystem.live` if it's already proxying to your Express API.

---

## Step 10: Monitoring & Maintenance

### Health Checks

```bash
# API health
curl https://your-api.com/health

# Database stats
curl https://your-api.com/explorer/stats

# Latest blocks
curl https://your-api.com/explorer/blocks?limit=5
```

### Database Maintenance

```bash
# Connect to PostgreSQL
docker exec -it trident-explorer-db psql -U trident -d trident_explorer

# Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Vacuum and analyze
VACUUM ANALYZE;
```

### Logs

```bash
# Docker logs
docker-compose logs -f api
docker-compose logs -f worker

# PM2 (if using process manager)
pm2 logs api
pm2 logs worker
```

---

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check `DATABASE_URL` format
   - Ensure PostgreSQL is running
   - Verify firewall rules

2. **Worker not syncing**
   - Check Trident API accessibility
   - Verify POLL_INTERVAL_MS isn't too aggressive
   - Review worker logs for errors

3. **API returning 500**
   - Check Prisma client initialization
   - Verify database migrations ran
   - Review error logs

---

## Next Steps

1. ✅ Deploy PostgreSQL database
2. ✅ Deploy Express API server
3. ✅ Deploy ingestion worker
4. ✅ Update Base44 tridentProxy URL if needed
5. ✅ Monitor initial sync progress
6. ✅ Set up monitoring/alerting

---

**Estimated Setup Time**: 30-60 minutes  
**Monthly Cost**: $0-50 (depending on hosting choice)