// routes/creatorApi.js
import { Router } from 'npm:express@4.18.2';
import { requireCreator } from './middleware/authGuards.js';

const router = Router();

// All creator routes are protected by requireCreator guard
// These handle coin, wallet, streaming, content, and creator-specific endpoints

// Example: Creator Dashboard Data
router.get('/dashboard', (req, res) => {
  const creator = req.creator;
  // TODO: Fetch creator-specific dashboard data from database
  res.json({
    success: true,
    data: {
      creator_id: creator.id,
      email: creator.email,
      message: "Creator dashboard data would go here"
    }
  });
});

// Example: Creator Wallet
router.get('/wallet/balance', (req, res) => {
  res.json({
    success: true,
    balance: 0,
    streaming_balance: 0
  });
});

// Example: Creator Content
router.get('/content/streams', (req, res) => {
  res.json({
    success: true,
    streams: []
  });
});

router.get('/content/videos', (req, res) => {
  res.json({
    success: true,
    videos: []
  });
});

router.get('/content/podcasts', (req, res) => {
  res.json({
    success: true,
    podcasts: []
  });
});

// Example: Creator Store
router.get('/store/products', (req, res) => {
  res.json({
    success: true,
    products: []
  });
});

// Example: Creator Affiliates
router.get('/affiliates/links', (req, res) => {
  res.json({
    success: true,
    links: []
  });
});

export default router;