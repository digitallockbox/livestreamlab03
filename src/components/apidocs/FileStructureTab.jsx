import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FolderOpen, Folder, FileCode2, FileText, FileJson, File,
  ChevronDown, ChevronRight, Copy, Check, Eye, Clock, HardDrive
} from "lucide-react";

// ── FILE TREE DATA ────────────────────────────────────────────────────────────
const FILE_TREE = [
  {
    name: "apps/api/src/",
    type: "root",
    children: [
      {
        name: "routes/",
        type: "folder",
        desc: "REST endpoints — one file per route group",
        badge: "12 files",
        badgeColor: "bg-chart-3/10 text-chart-3 border-chart-3/20",
        children: [
          {
            name: "auth/",
            type: "folder",
            files: [
              { name: "login.ts",   size: "1.2 KB", modified: "2026-03-28", desc: "POST /auth/login — validates credentials, issues JWT",   preview: `import { Router } from 'express';\nimport { authService } from '../services/authService';\n\nconst router = Router();\n\nrouter.post('/login', async (req, res) => {\n  const { email, password } = req.body;\n  const result = await authService.login(email, password);\n  return res.json({ token: result.token, user: result.user });\n});\n\nexport default router;` },
              { name: "signup.ts",  size: "1.8 KB", modified: "2026-03-28", desc: "POST /auth/signup — creates new creator account",          preview: `import { Router } from 'express';\nimport { authService } from '../services/authService';\n\nconst router = Router();\n\nrouter.post('/signup', async (req, res) => {\n  const { email, password, username } = req.body;\n  const user = await authService.createUser({ email, password, username });\n  const token = authService.issueToken(user);\n  return res.status(201).json({ token, user });\n});\n\nexport default router;` },
              { name: "me.ts",      size: "0.6 KB", modified: "2026-03-29", desc: "GET /auth/me — returns authenticated user profile",        preview: `import { Router } from 'express';\nimport { requireAuth } from '../middleware/auth';\n\nconst router = Router();\n\nrouter.get('/me', requireAuth, (req, res) => {\n  return res.json(req.user);\n});\n\nexport default router;` },
            ],
          },
          {
            name: "creator/",
            type: "folder",
            files: [
              { name: "profile.ts",     size: "2.1 KB", modified: "2026-04-01", desc: "GET / PATCH /creator/profile",           preview: `router.get('/profile', requireAuth, async (req, res) => {\n  const profile = await creatorService.getProfile(req.user.id);\n  return res.json(profile);\n});\n\nrouter.patch('/profile', requireAuth, async (req, res) => {\n  const updated = await creatorService.updateProfile(req.user.id, req.body);\n  return res.json({ updated: true, profile: updated });\n});` },
              { name: "onboarding.ts",  size: "1.6 KB", modified: "2026-04-01", desc: "POST/GET /creator/onboarding",           preview: `router.post('/onboarding/start', requireAuth, async (req, res) => {\n  const workflow = await onboardingService.start(req.user.id);\n  return res.json({ status: 'initiated', workflow_id: workflow.id });\n});\n\nrouter.get('/onboarding/status', requireAuth, async (req, res) => {\n  const status = await onboardingService.getStatus(req.user.id);\n  return res.json(status);\n});` },
              { name: "segment.ts",     size: "0.9 KB", modified: "2026-03-30", desc: "GET/POST /creator/segment — Overwatch",  preview: `router.get('/segment', requireAuth, async (req, res) => {\n  const seg = await overwatch.getSegment(req.user.id);\n  return res.json(seg);\n});\n\nrouter.post('/segment/refresh', requireAuth, async (req, res) => {\n  const result = await overwatch.refresh(req.user.id);\n  return res.json(result);\n});` },
              { name: "risk.ts",        size: "0.9 KB", modified: "2026-03-30", desc: "GET/POST /creator/risk — Aegis",         preview: `router.get('/risk', requireAuth, async (req, res) => {\n  const risk = await aegis.getRisk(req.user.id);\n  return res.json(risk);\n});\n\nrouter.post('/risk/refresh', requireAuth, async (req, res) => {\n  const result = await aegis.refresh(req.user.id);\n  return res.json(result);\n});` },
            ],
          },
          {
            name: "stream/",
            type: "folder",
            files: [
              { name: "start.ts",   size: "2.4 KB", modified: "2026-04-02", desc: "POST /stream/start — creates live session",  preview: `router.post('/start', requireAuth, async (req, res) => {\n  const { title, category } = req.body;\n  const stream = await streamService.create({ userId: req.user.id, title, category });\n  return res.status(201).json({\n    stream_id: stream.id,\n    stream_key: stream.key,\n    rtmp_url: stream.rtmpUrl\n  });\n});` },
              { name: "end.ts",     size: "1.1 KB", modified: "2026-04-02", desc: "POST /stream/end — ends active session",     preview: `router.post('/end', requireAuth, async (req, res) => {\n  const { stream_id } = req.body;\n  const result = await streamService.end(stream_id, req.user.id);\n  return res.json({ ended: true, duration_minutes: result.duration });\n});` },
              { name: "details.ts", size: "0.8 KB", modified: "2026-03-29", desc: "GET /stream/:id — public stream info",       preview: `router.get('/:id', async (req, res) => {\n  const stream = await streamService.getById(req.params.id);\n  if (!stream) return res.status(404).json({ error: 'Stream not found' });\n  return res.json(stream);\n});` },
              { name: "chat.ts",    size: "1.3 KB", modified: "2026-04-02", desc: "GET/POST /stream/:id/chat",                  preview: `router.get('/:id/chat', async (req, res) => {\n  const messages = await chatService.getRecent(req.params.id);\n  return res.json({ messages });\n});\n\nrouter.post('/:id/chat', requireAuth, async (req, res) => {\n  await chatService.send(req.params.id, req.user.id, req.body.text);\n  return res.json({ sent: true });\n});` },
              { name: "tip.ts",     size: "1.9 KB", modified: "2026-04-03", desc: "POST /stream/:id/tip — Omega payout split",  preview: `router.post('/:id/tip', requireAuth, async (req, res) => {\n  const { amount, currency } = req.body;\n  const tip = await omega.routeTip({\n    streamId: req.params.id,\n    from: req.user.id,\n    amount,\n    currency\n  });\n  return res.json({ tip_id: tip.id, routed: true });\n});` },
            ],
          },
          {
            name: "content/",
            type: "folder",
            files: [
              { name: "upload.ts",  size: "2.7 KB", modified: "2026-04-01", desc: "POST /content/upload — video/audio/podcast",  preview: `router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {\n  const { type, title } = req.body;\n  const content = await contentService.ingest({\n    userId: req.user.id, type, title,\n    fileUrl: req.file?.location\n  });\n  return res.status(201).json({ content_id: content.id, status: 'processing' });\n});` },
              { name: "list.ts",    size: "0.7 KB", modified: "2026-03-30", desc: "GET /content/list",                           preview: `router.get('/list', requireAuth, async (req, res) => {\n  const items = await contentService.listByUser(req.user.id);\n  return res.json({ items });\n});` },
              { name: "details.ts", size: "0.6 KB", modified: "2026-03-30", desc: "GET /content/:id",                            preview: `router.get('/:id', async (req, res) => {\n  const item = await contentService.getById(req.params.id);\n  return res.json(item);\n});` },
              { name: "delete.ts",  size: "0.6 KB", modified: "2026-04-01", desc: "DELETE /content/:id",                         preview: `router.delete('/:id', requireAuth, async (req, res) => {\n  await contentService.delete(req.params.id, req.user.id);\n  return res.json({ deleted: true });\n});` },
            ],
          },
          {
            name: "store/",
            type: "folder",
            files: [
              { name: "createItem.ts", size: "1.5 KB", modified: "2026-03-25", desc: "POST /store/item",            preview: `router.post('/item', requireAuth, async (req, res) => {\n  const item = await storeService.create({ userId: req.user.id, ...req.body });\n  return res.status(201).json({ item_id: item.id, status: 'published' });\n});` },
              { name: "listItems.ts",  size: "0.7 KB", modified: "2026-03-25", desc: "GET /store/items",            preview: `router.get('/items', requireAuth, async (req, res) => {\n  const items = await storeService.listByUser(req.user.id);\n  return res.json({ items });\n});` },
              { name: "purchase.ts",   size: "2.2 KB", modified: "2026-04-03", desc: "POST /store/purchase — Omega", preview: `router.post('/purchase', requireAuth, async (req, res) => {\n  const { item_id, payment } = req.body;\n  const order = await omega.processStorePurchase({\n    buyerId: req.user.id, itemId: item_id, payment\n  });\n  return res.json({ order_id: order.id, download_url: order.downloadUrl });\n});` },
            ],
          },
          {
            name: "payouts/",
            type: "folder",
            files: [
              { name: "summary.ts",  size: "1.4 KB", modified: "2026-04-02", desc: "GET /payouts/summary — Omega",  preview: `router.get('/summary', requireAuth, async (req, res) => {\n  const summary = await omega.getPayoutSummary(req.user.id);\n  return res.json(summary);\n});` },
              { name: "request.ts",  size: "1.8 KB", modified: "2026-04-02", desc: "POST /payouts/request",         preview: `router.post('/request', requireAuth, async (req, res) => {\n  const { amount, method } = req.body;\n  const payout = await omega.requestWithdrawal({ userId: req.user.id, amount, method });\n  return res.json({ request_id: payout.id, status: 'processing' });\n});` },
              { name: "methods.ts",  size: "0.6 KB", modified: "2026-03-28", desc: "GET /payouts/methods",          preview: `router.get('/methods', requireAuth, async (req, res) => {\n  const methods = await omega.getPayoutMethods(req.user.id);\n  return res.json({ methods });\n});` },
            ],
          },
          {
            name: "analytics/",
            type: "folder",
            files: [
              { name: "overview.ts",         size: "1.0 KB", modified: "2026-04-01", desc: "GET /analytics/overview",      preview: `router.get('/overview', requireAuth, async (req, res) => {\n  const data = await analyticsService.overview(req.user.id);\n  return res.json(data);\n});` },
              { name: "streamAnalytics.ts",  size: "0.8 KB", modified: "2026-04-01", desc: "GET /analytics/stream/:id",   preview: `router.get('/stream/:id', requireAuth, async (req, res) => {\n  const data = await analyticsService.byStream(req.params.id);\n  return res.json(data);\n});` },
              { name: "contentAnalytics.ts", size: "0.8 KB", modified: "2026-04-01", desc: "GET /analytics/content/:id",  preview: `router.get('/content/:id', requireAuth, async (req, res) => {\n  const data = await analyticsService.byContent(req.params.id);\n  return res.json(data);\n});` },
            ],
          },
          {
            name: "system/",
            type: "folder",
            files: [
              { name: "health.ts",        size: "0.4 KB", modified: "2026-03-20", desc: "GET /system/health",   preview: `router.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));` },
              { name: "enginesHealth.ts", size: "0.7 KB", modified: "2026-03-20", desc: "GET /engines/health",  preview: `router.get('/engines/health', async (req, res) => {\n  const [o, a, ow] = await Promise.all([omega.ping(), aegis.ping(), overwatch.ping()]);\n  return res.json({ omega: o, aegis: a, overwatch: ow });\n});` },
            ],
          },
        ],
      },
      {
        name: "controllers/",
        type: "folder",
        desc: "Receive requests and delegate to services",
        badge: "10 files",
        badgeColor: "bg-chart-4/10 text-chart-4 border-chart-4/20",
        files: [
          { name: "authController.ts",        size: "3.1 KB", modified: "2026-03-28", desc: "Auth flow: login, signup, token refresh",          preview: `export class AuthController {\n  async login(req, res) { /* delegates to authService.login() */ }\n  async signup(req, res) { /* delegates to authService.createUser() */ }\n  async refreshToken(req, res) { /* delegates to authService.refresh() */ }\n}` },
          { name: "creatorController.ts",     size: "4.2 KB", modified: "2026-04-01", desc: "Profile, onboarding, segment, risk",               preview: `export class CreatorController {\n  async getProfile(req, res) { ... }\n  async updateProfile(req, res) { ... }\n  async startOnboarding(req, res) { ... }\n  async getSegment(req, res) { ... }\n  async refreshRisk(req, res) { ... }\n}` },
          { name: "streamController.ts",      size: "5.0 KB", modified: "2026-04-02", desc: "Stream lifecycle: start, end, chat, tips",         preview: `export class StreamController {\n  async startStream(req, res) { ... }\n  async endStream(req, res) { ... }\n  async getChat(req, res) { ... }\n  async sendChat(req, res) { ... }\n  async processTip(req, res) { ... }\n}` },
          { name: "contentController.ts",     size: "3.8 KB", modified: "2026-04-01", desc: "Upload, list, retrieve, delete content",           preview: `export class ContentController {\n  async upload(req, res) { ... }\n  async list(req, res) { ... }\n  async getById(req, res) { ... }\n  async delete(req, res) { ... }\n}` },
          { name: "storeController.ts",       size: "3.4 KB", modified: "2026-03-25", desc: "Store items and purchase processing",              preview: `export class StoreController {\n  async createItem(req, res) { ... }\n  async listItems(req, res) { ... }\n  async purchase(req, res) { ... }\n}` },
          { name: "payoutsController.ts",     size: "3.0 KB", modified: "2026-04-02", desc: "Payout requests and summaries",                    preview: `export class PayoutsController {\n  async getSummary(req, res) { ... }\n  async requestWithdrawal(req, res) { ... }\n  async getMethods(req, res) { ... }\n}` },
          { name: "analyticsController.ts",   size: "2.8 KB", modified: "2026-04-01", desc: "Overview, stream & content analytics",             preview: `export class AnalyticsController {\n  async overview(req, res) { ... }\n  async streamAnalytics(req, res) { ... }\n  async contentAnalytics(req, res) { ... }\n}` },
          { name: "tenantController.ts",      size: "2.5 KB", modified: "2026-03-22", desc: "Enterprise tenant registration & management",      preview: `export class TenantController {\n  async register(req, res) { ... }\n  async listCreators(req, res) { ... }\n  async inviteCreator(req, res) { ... }\n}` },
          { name: "marketplaceController.ts", size: "2.1 KB", modified: "2026-03-22", desc: "Marketplace listing and affiliate purchases",      preview: `export class MarketplaceController {\n  async listProducts(req, res) { ... }\n  async purchase(req, res) { ... }\n}` },
          { name: "systemController.ts",      size: "0.9 KB", modified: "2026-03-20", desc: "Health checks for system and engines",             preview: `export class SystemController {\n  async health(req, res) { res.json({ status: 'ok' }); }\n  async enginesHealth(req, res) { ... }\n}` },
        ],
      },
      {
        name: "services/",
        type: "folder",
        desc: "Business logic — calls engine façades, never touches HTTP",
        badge: "6 files",
        badgeColor: "bg-accent/10 text-accent border-accent/20",
        files: [
          { name: "authService.ts",        size: "5.5 KB", modified: "2026-03-28", desc: "JWT issuance, bcrypt hashing, session management",     preview: `export const authService = {\n  async login(email, password) {\n    const user = await db.users.findByEmail(email);\n    await bcrypt.compare(password, user.passwordHash);\n    return { token: jwt.sign({ id: user.id }, SECRET), user };\n  },\n  async createUser(data) { ... },\n  async refresh(token) { ... }\n};` },
          { name: "onboardingService.ts",  size: "6.1 KB", modified: "2026-04-01", desc: "Aegis baseline + Overwatch segment + Omega payout init",preview: `export const onboardingService = {\n  async start(userId) {\n    await aegis.runBaseline(userId);\n    await overwatch.segment(userId);\n    await omega.initPayoutAccount(userId);\n    return workflowService.create(userId, 'onboarding');\n  }\n};` },
          { name: "streamService.ts",      size: "7.2 KB", modified: "2026-04-02", desc: "Stream lifecycle, RTMP key generation, recording",     preview: `export const streamService = {\n  async create({ userId, title, category }) {\n    const key = crypto.randomBytes(20).toString('hex');\n    return db.streams.create({ userId, title, category, key, status: 'live' });\n  },\n  async end(streamId, userId) { ... }\n};` },
          { name: "contentService.ts",     size: "6.8 KB", modified: "2026-04-01", desc: "Upload pipeline, transcoding queue, metadata store",   preview: `export const contentService = {\n  async ingest({ userId, type, title, fileUrl }) {\n    const content = await db.content.create({ userId, type, title, fileUrl, status: 'processing' });\n    await transcodeQueue.add({ contentId: content.id, fileUrl });\n    return content;\n  }\n};` },
          { name: "payoutsService.ts",     size: "5.9 KB", modified: "2026-04-02", desc: "Omega payout orchestration, split calculation",        preview: `export const payoutsService = {\n  async requestWithdrawal({ userId, amount, method }) {\n    const split = await omega.calculateSplit(userId, amount);\n    return omega.executePayout({ userId, split, method });\n  }\n};` },
          { name: "analyticsService.ts",   size: "4.4 KB", modified: "2026-04-01", desc: "Aggregates events from DB and time-series store",      preview: `export const analyticsService = {\n  async overview(userId) {\n    const [streams, content, revenue] = await Promise.all([\n      db.streams.countByUser(userId),\n      db.content.countByUser(userId),\n      omega.getRevenueSummary(userId)\n    ]);\n    return { streams, content, total_revenue: revenue };\n  }\n};` },
        ],
      },
      {
        name: "engines/",
        type: "folder",
        desc: "Façade layer ONLY — private engines are never in this repo",
        badge: "private façade",
        badgeColor: "bg-destructive/10 text-destructive border-destructive/20",
        isEngine: true,
        files: [
          { name: "omega.ts",      size: "8.3 KB", modified: "2026-04-03", desc: "Omega façade — revenue routing, payouts, tips, splits",    preview: `// ⚠️  FAÇADE ONLY — Omega engine runs in an isolated trust zone\n// No business logic here. All calls go over mTLS to omega-engine:443\nimport { bridge } from './bridge';\n\nexport const omega = {\n  routeTip:          (p) => bridge.call('omega', 'routeTip', p),\n  processStorePurchase: (p) => bridge.call('omega', 'storePurchase', p),\n  getPayoutSummary:  (p) => bridge.call('omega', 'payoutSummary', p),\n  requestWithdrawal: (p) => bridge.call('omega', 'withdraw', p),\n  initPayoutAccount: (p) => bridge.call('omega', 'initAccount', p),\n  calculateSplit:    (p) => bridge.call('omega', 'calcSplit', p),\n  ping:              () => bridge.ping('omega'),\n};` },
          { name: "aegis.ts",      size: "6.1 KB", modified: "2026-04-03", desc: "Aegis façade — risk scoring, fraud detection, trust",      preview: `// ⚠️  FAÇADE ONLY — Aegis engine runs in an isolated trust zone\nimport { bridge } from './bridge';\n\nexport const aegis = {\n  runBaseline: (p) => bridge.call('aegis', 'baseline', p),\n  getRisk:     (p) => bridge.call('aegis', 'getRisk', p),\n  refresh:     (p) => bridge.call('aegis', 'refresh', p),\n  ping:        () => bridge.ping('aegis'),\n};` },
          { name: "overwatch.ts",  size: "5.8 KB", modified: "2026-04-03", desc: "Overwatch façade — creator segmentation, tier management", preview: `// ⚠️  FAÇADE ONLY — Overwatch engine runs in an isolated trust zone\nimport { bridge } from './bridge';\n\nexport const overwatch = {\n  segment:    (p) => bridge.call('overwatch', 'segment', p),\n  getSegment: (p) => bridge.call('overwatch', 'getSegment', p),\n  refresh:    (p) => bridge.call('overwatch', 'refresh', p),\n  ping:       () => bridge.ping('overwatch'),\n};` },
          { name: "bridge.ts",     size: "4.2 KB", modified: "2026-04-03", desc: "Secure connector — mTLS, retries, circuit breaker",        preview: `import https from 'https';\nimport fs from 'fs';\n\nconst CERTS = {\n  cert: fs.readFileSync('/etc/tls/client.crt'),\n  key:  fs.readFileSync('/etc/tls/client.key'),\n  ca:   fs.readFileSync('/etc/tls/ca.crt'),\n};\n\nexport const bridge = {\n  async call(engine, method, payload) {\n    // mTLS request to internal engine cluster\n    // retries: 3, timeout: 5000ms, circuit-breaker enabled\n  },\n  async ping(engine) { ... }\n};` },
        ],
      },
      {
        name: "middleware/",
        type: "folder",
        desc: "Auth guards, CORS, rate limiting, error handling",
        badge: "4 files",
        badgeColor: "bg-primary/10 text-primary border-primary/20",
        files: [
          { name: "auth.ts",         size: "2.1 KB", modified: "2026-03-28", desc: "JWT verification middleware — attaches req.user",    preview: `export const requireAuth = async (req, res, next) => {\n  const token = req.headers.authorization?.split(' ')[1];\n  if (!token) return res.status(401).json({ error: 'Unauthorized' });\n  try {\n    req.user = jwt.verify(token, process.env.JWT_SECRET);\n    next();\n  } catch {\n    return res.status(401).json({ error: 'Invalid token' });\n  }\n};` },
          { name: "cors.ts",         size: "1.0 KB", modified: "2026-03-20", desc: "CORS policy — allowlist for known origins",           preview: `export const corsPolicy = cors({\n  origin: ['https://app.livestreamlab.live', 'https://creator.livestreamlab.live'],\n  methods: ['GET','POST','PATCH','DELETE'],\n  allowedHeaders: ['Authorization','Content-Type'],\n  credentials: true,\n});` },
          { name: "errorHandler.ts", size: "1.5 KB", modified: "2026-03-28", desc: "Global error handler — structured JSON errors",       preview: `export const errorHandler = (err, req, res, next) => {\n  const status = err.status || 500;\n  return res.status(status).json({\n    error: err.message,\n    code:  err.code || 'INTERNAL_ERROR',\n    ts:    new Date().toISOString(),\n  });\n};` },
          { name: "rateLimit.ts",    size: "0.9 KB", modified: "2026-03-20", desc: "Rate limiting — 200 req/min per IP via Redis",        preview: `export const rateLimiter = rateLimit({\n  windowMs: 60 * 1000,\n  max: 200,\n  store: new RedisStore({ client: redisClient }),\n  message: { error: 'Too many requests' },\n});` },
        ],
      },
      {
        name: "utils/",
        type: "folder",
        desc: "Shared helpers — JWT, uploader, validator, logger",
        badge: "4 files",
        badgeColor: "bg-secondary text-muted-foreground border-border",
        files: [
          { name: "jwt.ts",       size: "1.3 KB", modified: "2026-03-28", desc: "JWT sign / verify / decode helpers",                preview: `import jwt from 'jsonwebtoken';\nconst SECRET = process.env.JWT_SECRET!;\n\nexport const jwtUtils = {\n  sign:   (payload, exp = '7d') => jwt.sign(payload, SECRET, { expiresIn: exp }),\n  verify: (token) => jwt.verify(token, SECRET),\n  decode: (token) => jwt.decode(token),\n};` },
          { name: "uploader.ts",  size: "2.2 KB", modified: "2026-04-01", desc: "S3/R2 multipart upload handler",                     preview: `import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';\nconst s3 = new S3Client({ region: process.env.AWS_REGION });\n\nexport const uploadToStorage = async (file, key) => {\n  await s3.send(new PutObjectCommand({ Bucket: process.env.BUCKET, Key: key, Body: file.buffer }));\n  return \`https://\${process.env.CDN_HOST}/\${key}\`;\n};` },
          { name: "validator.ts", size: "1.8 KB", modified: "2026-03-28", desc: "Zod-based request body validator",                   preview: `import { z } from 'zod';\n\nexport const loginSchema = z.object({\n  email:    z.string().email(),\n  password: z.string().min(8),\n});\n\nexport const validate = (schema) => (req, res, next) => {\n  const result = schema.safeParse(req.body);\n  if (!result.success) return res.status(400).json({ error: result.error });\n  next();\n};` },
          { name: "logger.ts",    size: "1.1 KB", modified: "2026-03-20", desc: "Structured JSON logger via pino",                    preview: `import pino from 'pino';\n\nexport const logger = pino({\n  level: process.env.LOG_LEVEL ?? 'info',\n  transport: process.env.NODE_ENV === 'development'\n    ? { target: 'pino-pretty' }\n    : undefined,\n});` },
        ],
      },
      {
        name: "index.ts",
        type: "file",
        fileData: { name: "index.ts", size: "2.8 KB", modified: "2026-04-03", desc: "Bootstraps Express server — mounts routes, middleware, starts listener", preview: `import express from 'express';\nimport { corsPolicy } from './middleware/cors';\nimport { rateLimiter } from './middleware/rateLimit';\nimport { errorHandler } from './middleware/errorHandler';\nimport authRoutes from './routes/auth';\nimport creatorRoutes from './routes/creator';\nimport streamRoutes from './routes/stream';\nimport contentRoutes from './routes/content';\nimport storeRoutes from './routes/store';\nimport payoutsRoutes from './routes/payouts';\nimport analyticsRoutes from './routes/analytics';\nimport systemRoutes from './routes/system';\n\nconst app = express();\napp.use(corsPolicy, rateLimiter, express.json());\n\napp.use('/auth',      authRoutes);\napp.use('/creator',   creatorRoutes);\napp.use('/stream',    streamRoutes);\napp.use('/content',   contentRoutes);\napp.use('/store',     storeRoutes);\napp.use('/payouts',   payoutsRoutes);\napp.use('/analytics', analyticsRoutes);\napp.use('/system',    systemRoutes);\n\napp.use(errorHandler);\napp.listen(process.env.PORT ?? 8080);\nconsole.log('API server started');` },
      },
    ],
  },
  {
    name: "config/",
    type: "root",
    children: [
      {
        name: "",
        type: "flat",
        files: [
          { name: "tsconfig.json",      size: "0.9 KB", modified: "2026-03-15", desc: "TypeScript compiler options — strict mode, path aliases",  preview: `{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "NodeNext",\n    "strict": true,\n    "paths": { "@/*": ["./src/*"] },\n    "outDir": "./dist"\n  }\n}` },
          { name: "package.json",       size: "2.1 KB", modified: "2026-04-03", desc: "Node dependencies and scripts",                             preview: `{\n  "name": "@livestreamlab/api",\n  "scripts": {\n    "dev":   "tsx watch src/index.ts",\n    "build": "tsc",\n    "start": "node dist/index.js",\n    "test":  "vitest"\n  },\n  "dependencies": {\n    "express": "^4.18",\n    "jsonwebtoken": "^9",\n    "zod": "^3",\n    "pino": "^8"\n  }\n}` },
          { name: ".env.example",       size: "0.4 KB", modified: "2026-03-15", desc: "Required environment variables template",                   preview: `JWT_SECRET=your_secret_here\nPORT=8080\nDATABASE_URL=postgres://...\nAWS_REGION=us-east-1\nBUCKET=livestreamlab-media\nCDN_HOST=cdn.livestreamlab.live\nREDIS_URL=redis://...\nOMEGA_HOST=omega-engine:443\nAEGIS_HOST=aegis-engine:443\nOVERWATCH_HOST=overwatch-engine:443` },
          { name: "docker-compose.yml", size: "1.6 KB", modified: "2026-04-02", desc: "Local dev stack — API, Postgres, Redis",                   preview: `version: '3.9'\nservices:\n  api:\n    build: .\n    ports: ['8080:8080']\n    environment:\n      DATABASE_URL: postgres://dev:dev@db:5432/livestreamlab\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: dev\n  redis:\n    image: redis:7-alpine` },
        ],
      },
    ],
  },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function getFileIcon(name) {
  if (name.endsWith(".json"))  return <FileJson className="w-3.5 h-3.5 text-chart-3 shrink-0" />;
  if (name.endsWith(".ts"))    return <FileCode2 className="w-3.5 h-3.5 text-primary shrink-0" />;
  if (name.endsWith(".yml") || name.endsWith(".yaml")) return <FileText className="w-3.5 h-3.5 text-accent shrink-0" />;
  if (name.startsWith(".env")) return <FileText className="w-3.5 h-3.5 text-chart-4 shrink-0" />;
  return <File className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
}

// ── FILE ROW ─────────────────────────────────────────────────────────────────
function FileRow({ file, depth = 0 }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyPreview = () => {
    navigator.clipboard.writeText(file.preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div>
      <div
        style={{ paddingLeft: depth * 16 }}
        className="group flex items-center gap-2 py-1 px-2 -mx-2 rounded-lg hover:bg-secondary/60 cursor-pointer transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        {getFileIcon(file.name)}
        <span className="text-xs font-mono text-foreground flex-1">{file.name}</span>
        <span className="text-xs text-muted-foreground/60 hidden sm:block">{file.desc}</span>
        <span className="text-xs text-muted-foreground/50 hidden md:block ml-2 shrink-0">{file.size}</span>
        <span className="text-xs text-muted-foreground/40 hidden lg:block ml-2 shrink-0">{file.modified}</span>
        <button className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => { e.stopPropagation(); setOpen(o => !o); }}>
          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      {open && (
        <div style={{ marginLeft: depth * 16 }} className="mt-1 mb-2 bg-background border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/40">
            <div className="flex items-center gap-2">
              {getFileIcon(file.name)}
              <span className="text-xs font-mono text-foreground">{file.name}</span>
              <Badge className="text-xs border bg-secondary text-muted-foreground border-border">{file.size}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />{file.modified}
              </div>
              <button onClick={copyPreview}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                {copied ? <Check className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
          <pre className="text-xs font-mono text-foreground/80 p-3 overflow-x-auto leading-relaxed whitespace-pre">{file.preview}</pre>
        </div>
      )}
    </div>
  );
}

// ── FOLDER NODE ───────────────────────────────────────────────────────────────
function FolderNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(depth < 1);

  if (node.type === "flat") {
    return (
      <div>
        {node.files?.map((f, i) => <FileRow key={i} file={f} depth={depth} />)}
      </div>
    );
  }

  if (node.type === "file") {
    return <FileRow file={node.fileData} depth={depth} />;
  }

  const isEngine = node.isEngine;
  const pl = depth * 16;

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ paddingLeft: pl }}
        className="flex items-center gap-2 py-1.5 w-full text-left group hover:bg-secondary/40 rounded-lg px-2 -mx-2 transition-colors"
      >
        {open
          ? <FolderOpen className={`w-3.5 h-3.5 shrink-0 ${isEngine ? "text-destructive" : "text-chart-3"}`} />
          : <Folder className={`w-3.5 h-3.5 shrink-0 ${isEngine ? "text-destructive" : "text-chart-3"}`} />}
        <span className={`text-xs font-mono font-semibold ${isEngine ? "text-destructive" : "text-foreground"}`}>{node.name}</span>
        {node.badge && (
          <Badge className={`text-[10px] border py-0 px-1.5 ml-1 ${node.badgeColor}`}>{node.badge}</Badge>
        )}
        {node.desc && (
          <span className="text-xs text-muted-foreground/60 hidden sm:block ml-1 truncate max-w-xs">— {node.desc}</span>
        )}
        <span className="ml-auto">
          {open
            ? <ChevronDown className="w-3 h-3 text-muted-foreground" />
            : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
        </span>
      </button>
      {open && (
        <div className="mt-0.5">
          {node.children?.map((child, i) => <FolderNode key={i} node={child} depth={depth + 1} />)}
          {node.files?.map((f, i) => <FileRow key={i} file={f} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function FileStructureTab() {
  const [search, setSearch] = useState("");

  // Flat list of all files for search
  const allFiles = [];
  const collectFiles = (nodes) => {
    for (const node of nodes) {
      if (node.type === "file" && node.fileData) allFiles.push(node.fileData);
      if (node.files) node.files.forEach(f => allFiles.push(f));
      if (node.children) collectFiles(node.children);
    }
  };
  FILE_TREE.forEach(root => root.children && collectFiles(root.children));

  const searchResults = search.trim()
    ? allFiles.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.desc.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  const totalFiles = allFiles.length;
  const totalSize  = allFiles.reduce((acc, f) => {
    const kb = parseFloat(f.size);
    return acc + (isNaN(kb) ? 0 : kb);
  }, 0);

  return (
    <div className="space-y-5">
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Files",    value: totalFiles,                   color: "text-primary",          icon: FileCode2 },
          { label: "Source Size",    value: `${totalSize.toFixed(1)} KB`, color: "text-chart-3",          icon: HardDrive },
          { label: "Route Groups",   value: "9",                          color: "text-accent",            icon: Folder },
          { label: "Engine Façades", value: "3",                          color: "text-destructive",       icon: FileText },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
            <p className="text-xl font-bold font-display text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search files by name or description..."
          className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs">
            ✕
          </button>
        )}
      </div>

      {/* Tree / Search Results */}
      <div className="bg-card border border-border rounded-2xl p-5">
        {searchResults ? (
          <div>
            <p className="text-xs text-muted-foreground mb-3">{searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for <span className="text-foreground font-medium">"{search}"</span></p>
            {searchResults.length === 0
              ? <p className="text-sm text-muted-foreground text-center py-6">No files matched.</p>
              : searchResults.map((f, i) => <FileRow key={i} file={f} depth={0} />)
            }
          </div>
        ) : (
          <div className="font-mono space-y-0.5">
            {FILE_TREE.map((root, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
                  <FolderOpen className="w-4 h-4 text-accent" />
                  <span className="text-xs font-mono font-bold text-foreground">{root.name}</span>
                </div>
                {root.children?.map((child, j) => <FolderNode key={j} node={child} depth={0} />)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground px-1">
        {[
          { dot: "bg-primary", label: ".ts — TypeScript source" },
          { dot: "bg-chart-3", label: ".json — Config" },
          { dot: "bg-accent",  label: ".yml — Docker / CI" },
          { dot: "bg-destructive", label: "engines/ — Private façade only" },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${item.dot}`} />
            {item.label}
          </div>
        ))}
        <span className="ml-auto">Click any file to preview its code</span>
      </div>
    </div>
  );
}