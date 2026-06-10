// server.js - Main Express Application Entry Point
import express from 'npm:express@4.18.2';
import cookieParser from 'npm:cookie-parser@1.4.6';
import cors from 'npm:cors@2.8.5';
import authRoutes from './src/routes/authRoutes.js';
import creatorApiRoutes from './src/routes/creatorApi.js';
import adminApiRoutes from './src/routes/adminApi.js';
import { requireCreator, requireAdmin } from './src/middleware/authGuards.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true // Allow cookies to be sent with requests
}));

// ==========================================
// PUBLIC AUTH ENDPOINTS
// ==========================================
app.use(authRoutes);

// ==========================================
// ISOLATED ENGINE ROUTING LAYERS
// ==========================================

// Creator API Routes - Protected by requireCreator guard
// Handles coin, wallet, streaming, content endpoints
app.use('/api/creator', requireCreator, creatorApiRoutes);

// Admin API Routes - Protected by requireAdmin guard  
// Handles overwatch, ledger, system engines
app.use('/api/admin', requireAdmin, adminApiRoutes);

// ==========================================
// HEALTH CHECK (Public)
// ==========================================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==========================================
// ERROR HANDLING
// ==========================================
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 TridentOS Backend running on port ${PORT}`);
  console.log(`   Creator API: /api/creator/*`);
  console.log(`   Admin API: /api/admin/*`);
  console.log(`   Auth: /auth/*`);
});