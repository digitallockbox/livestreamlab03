# Block Explorer Backend Setup Guide

## Overview
This implements a real Block Explorer backend with PostgreSQL database, replacing all mock data with live chain data.

## Architecture
```
Trident Ledger API → Ingestion Worker → PostgreSQL → Express API → Block Explorer UI
```

## Setup Steps

### 1. Database Setup (PostgreSQL)

Install PostgreSQL:
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS (Homebrew)
brew install postgresql
brew services start postgresql

# Or use Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=yourpassword postgres:15
```

Create database:
```bash
createdb trident_explorer
```

### 2. Install Dependencies

In your Express backend directory:
```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

### 3. Configure Prisma

Copy `functions/README.prisma` to `prisma/schema.prisma` in your Express backend repo.

Update `.env`:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/trident_explorer?schema=public"
```

### 4. Run Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Wire API Routes

In your Express `server.ts`:
```typescript
import {
  getLatestBlocks,
  getBlock,
  getAddress,
  getChainStats,
  getTransaction,
} from './routes/explorerRoutes';

app.get('/explorer/blocks', getLatestBlocks);
app.get('/explorer/block/:id', getBlock);
app.get('/explorer/address/:address', getAddress);
app.get('/explorer/stats', getChainStats);
app.get('/explorer/transaction/:hash', getTransaction);
```

### 6. Run Ingestion Worker

**Option A: Continuous Worker**
```typescript
import { startIngestionWorker } from './workers/chainIngestionWorker';

// Start in server.ts or separate worker process
startIngestionWorker();
```

**Option B: Cron Job (every 5 seconds)**
```bash
# crontab -e
*/1 * * * * cd /path/to/express-backend && node -e "require('./workers/chainIngestionWorker').syncOnce()"
```

**Option C: Manual Sync**
```bash
node -e "require('./workers/chainIngestionWorker').syncOnce()"
```

## API Endpoints

### GET /explorer/blocks
Returns latest 20 blocks.
```json
{
  "success": true,
  "blocks": [
    {
      "height": 12345,
      "hash": "0xabc...",
      "timestamp": "2024-01-15T10:30:00Z",
      "txCount": 42
    }
  ]
}
```

### GET /explorer/block/:id
Returns block details + transactions (id can be height or hash).
```json
{
  "success": true,
  "block": { "height": 12345, "hash": "0xabc...", "txCount": 42 },
  "transactions": [...]
}
```

### GET /explorer/address/:address
Returns address balance + transaction history.
```json
{
  "success": true,
  "address": { "address": "0x123...", "balance": 5000, "txCount": 15 },
  "transactions": [...]
}
```

### GET /explorer/stats
Returns chain statistics.
```json
{
  "success": true,
  "stats": {
    "latestHeight": 12345,
    "latestHash": "0xabc...",
    "totalTransactions": 50000,
    "totalAddresses": 8500
  }
}
```

### GET /explorer/transaction/:hash
Returns transaction details.
```json
{
  "success": true,
  "transaction": {
    "hash": "0xdef...",
    "from": "0x123...",
    "to": "0x456...",
    "amount": 1000,
    "status": "confirmed",
    "block": { "height": 12345, "hash": "0xabc..." }
  }
}
```

## Frontend Integration

Update your Block Explorer UI (`pages/explorer/BlockExplorer.jsx`) to call these endpoints via tridentProxy:

```javascript
import { base44 } from '@/api/base44Client';

// Fetch chain stats
const stats = await base44.functions.invoke('tridentProxy', {
  method: 'GET',
  path: '/explorer/stats',
});

// Fetch latest blocks
const blocks = await base44.functions.invoke('tridentProxy', {
  method: 'GET',
  path: '/explorer/blocks',
});
```

## Monitoring

Check ingestion worker logs:
```bash
# In server.ts or worker process
[IngestionWorker] Processing 5 blocks from height 12340
[IngestionWorker] Synced block 12340
[IngestionWorker] Synced block 12341
[IngestionWorker] Batch complete. New height: 12345
```

Query database directly:
```bash
npx prisma studio
```

## Troubleshooting

**No blocks showing:**
- Check ingestion worker is running
- Verify Trident Ledger API is accessible
- Check DATABASE_URL is correct

**Database connection errors:**
- Ensure PostgreSQL is running
- Verify credentials in .env
- Run `npx prisma generate` after schema changes

**API returns 500:**
- Check server logs for Prisma errors
- Verify database migrations ran successfully
- Ensure all required fields are provided

## Next Steps

1. Set up PostgreSQL database
2. Run Prisma migrations
3. Wire API routes in Express server
4. Start ingestion worker
5. Update Block Explorer UI to use real endpoints
6. Add search functionality (by block height, tx hash, address)
7. Implement pagination for large result sets
8. Add caching layer (Redis) for high-traffic endpoints