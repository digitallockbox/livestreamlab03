import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  FolderOpen, Folder, FileCode2, FileText, FileJson, File,
  ChevronDown, ChevronRight, Copy, Check, Eye, Clock, HardDrive,
  Database, GitBranch, Terminal, Shield, TestTube, Cloud
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const FILE_TREE = [
  // ── apps/api/src/ ──────────────────────────────────────────────────────────
  {
    name: "apps/api/src/",
    type: "root",
    rootIcon: FileCode2,
    rootColor: "text-primary",
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
              { name: "login.ts",   size: "1.2 KB", modified: "2026-03-28", desc: "POST /auth/login",   preview: `import { Router } from 'express';\nimport { authService } from '../../services/authService';\n\nconst router = Router();\n\nrouter.post('/login', async (req, res) => {\n  const { email, password } = req.body;\n  const result = await authService.login(email, password);\n  return res.json({ token: result.token, user: result.user });\n});\n\nexport default router;` },
              { name: "signup.ts",  size: "1.8 KB", modified: "2026-03-28", desc: "POST /auth/signup",  preview: `import { Router } from 'express';\nimport { authService } from '../../services/authService';\nimport { validate } from '../../utils/validator';\nimport { signupSchema } from '../../utils/schemas';\n\nconst router = Router();\n\nrouter.post('/signup', validate(signupSchema), async (req, res) => {\n  const { email, password, username } = req.body;\n  const user = await authService.createUser({ email, password, username });\n  const token = authService.issueToken(user);\n  return res.status(201).json({ token, user });\n});\n\nexport default router;` },
              { name: "me.ts",      size: "0.6 KB", modified: "2026-03-29", desc: "GET /auth/me",       preview: `import { Router } from 'express';\nimport { requireAuth } from '../../middleware/auth';\n\nconst router = Router();\n\nrouter.get('/me', requireAuth, (req, res) => {\n  return res.json(req.user);\n});\n\nexport default router;` },
              { name: "refresh.ts", size: "0.9 KB", modified: "2026-04-01", desc: "POST /auth/refresh", preview: `router.post('/refresh', async (req, res) => {\n  const { refresh_token } = req.body;\n  const result = await authService.refresh(refresh_token);\n  return res.json({ token: result.token });\n});` },
            ],
          },
          {
            name: "creator/",
            type: "folder",
            files: [
              { name: "profile.ts",    size: "2.1 KB", modified: "2026-04-01", desc: "GET/PATCH /creator/profile",    preview: `router.get('/profile', requireAuth, async (req, res) => {\n  const profile = await creatorService.getProfile(req.user.id);\n  return res.json(profile);\n});\n\nrouter.patch('/profile', requireAuth, async (req, res) => {\n  const updated = await creatorService.updateProfile(req.user.id, req.body);\n  return res.json({ updated: true, profile: updated });\n});` },
              { name: "onboarding.ts", size: "1.6 KB", modified: "2026-04-01", desc: "POST/GET /creator/onboarding", preview: `router.post('/onboarding/start', requireAuth, async (req, res) => {\n  const workflow = await onboardingService.start(req.user.id);\n  return res.json({ status: 'initiated', workflow_id: workflow.id });\n});` },
              { name: "segment.ts",    size: "0.9 KB", modified: "2026-03-30", desc: "GET/POST /creator/segment",    preview: `router.get('/segment', requireAuth, async (req, res) => {\n  const seg = await overwatch.getSegment(req.user.id);\n  return res.json(seg);\n});` },
              { name: "risk.ts",       size: "0.9 KB", modified: "2026-03-30", desc: "GET/POST /creator/risk",       preview: `router.get('/risk', requireAuth, async (req, res) => {\n  const risk = await aegis.getRisk(req.user.id);\n  return res.json(risk);\n});` },
            ],
          },
          {
            name: "stream/",
            type: "folder",
            files: [
              { name: "start.ts",   size: "2.4 KB", modified: "2026-04-02", desc: "POST /stream/start",        preview: `router.post('/start', requireAuth, async (req, res) => {\n  const { title, category } = req.body;\n  const stream = await streamService.create({ userId: req.user.id, title, category });\n  return res.status(201).json({\n    stream_id: stream.id,\n    stream_key: stream.key,\n    rtmp_url: stream.rtmpUrl\n  });\n});` },
              { name: "end.ts",     size: "1.1 KB", modified: "2026-04-02", desc: "POST /stream/end",          preview: `router.post('/end', requireAuth, async (req, res) => {\n  const { stream_id } = req.body;\n  const result = await streamService.end(stream_id, req.user.id);\n  return res.json({ ended: true, duration_minutes: result.duration });\n});` },
              { name: "details.ts", size: "0.8 KB", modified: "2026-03-29", desc: "GET /stream/:id",           preview: `router.get('/:id', async (req, res) => {\n  const stream = await streamService.getById(req.params.id);\n  if (!stream) return res.status(404).json({ error: 'Stream not found' });\n  return res.json(stream);\n});` },
              { name: "chat.ts",    size: "1.3 KB", modified: "2026-04-02", desc: "GET/POST /stream/:id/chat", preview: `router.get('/:id/chat', async (req, res) => {\n  const messages = await chatService.getRecent(req.params.id);\n  return res.json({ messages });\n});\n\nrouter.post('/:id/chat', requireAuth, async (req, res) => {\n  await chatService.send(req.params.id, req.user.id, req.body.text);\n  return res.json({ sent: true });\n});` },
              { name: "tip.ts",     size: "1.9 KB", modified: "2026-04-03", desc: "POST /stream/:id/tip",      preview: `router.post('/:id/tip', requireAuth, async (req, res) => {\n  const { amount, currency } = req.body;\n  const tip = await omega.routeTip({ streamId: req.params.id, from: req.user.id, amount, currency });\n  return res.json({ tip_id: tip.id, routed: true });\n});` },
            ],
          },
          {
            name: "content/",
            type: "folder",
            files: [
              { name: "upload.ts",  size: "2.7 KB", modified: "2026-04-01", desc: "POST /content/upload",  preview: `router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {\n  const { type, title } = req.body;\n  const content = await contentService.ingest({ userId: req.user.id, type, title, fileUrl: req.file?.location });\n  return res.status(201).json({ content_id: content.id, status: 'processing' });\n});` },
              { name: "list.ts",    size: "0.7 KB", modified: "2026-03-30", desc: "GET /content/list",     preview: `router.get('/list', requireAuth, async (req, res) => {\n  const items = await contentService.listByUser(req.user.id);\n  return res.json({ items });\n});` },
              { name: "details.ts", size: "0.6 KB", modified: "2026-03-30", desc: "GET /content/:id",      preview: `router.get('/:id', async (req, res) => {\n  const item = await contentService.getById(req.params.id);\n  return res.json(item);\n});` },
              { name: "delete.ts",  size: "0.6 KB", modified: "2026-04-01", desc: "DELETE /content/:id",   preview: `router.delete('/:id', requireAuth, async (req, res) => {\n  await contentService.delete(req.params.id, req.user.id);\n  return res.json({ deleted: true });\n});` },
            ],
          },
          {
            name: "store/",
            type: "folder",
            files: [
              { name: "createItem.ts", size: "1.5 KB", modified: "2026-03-25", desc: "POST /store/item",       preview: `router.post('/item', requireAuth, async (req, res) => {\n  const item = await storeService.create({ userId: req.user.id, ...req.body });\n  return res.status(201).json({ item_id: item.id, status: 'published' });\n});` },
              { name: "listItems.ts",  size: "0.7 KB", modified: "2026-03-25", desc: "GET /store/items",       preview: `router.get('/items', requireAuth, async (req, res) => {\n  const items = await storeService.listByUser(req.user.id);\n  return res.json({ items });\n});` },
              { name: "purchase.ts",   size: "2.2 KB", modified: "2026-04-03", desc: "POST /store/purchase",   preview: `router.post('/purchase', requireAuth, async (req, res) => {\n  const { item_id, payment } = req.body;\n  const order = await omega.processStorePurchase({ buyerId: req.user.id, itemId: item_id, payment });\n  return res.json({ order_id: order.id, download_url: order.downloadUrl });\n});` },
            ],
          },
          {
            name: "payouts/",
            type: "folder",
            files: [
              { name: "summary.ts", size: "1.4 KB", modified: "2026-04-02", desc: "GET /payouts/summary",  preview: `router.get('/summary', requireAuth, async (req, res) => {\n  const summary = await omega.getPayoutSummary(req.user.id);\n  return res.json(summary);\n});` },
              { name: "request.ts", size: "1.8 KB", modified: "2026-04-02", desc: "POST /payouts/request", preview: `router.post('/request', requireAuth, async (req, res) => {\n  const { amount, method } = req.body;\n  const payout = await omega.requestWithdrawal({ userId: req.user.id, amount, method });\n  return res.json({ request_id: payout.id, status: 'processing' });\n});` },
              { name: "methods.ts", size: "0.6 KB", modified: "2026-03-28", desc: "GET /payouts/methods",  preview: `router.get('/methods', requireAuth, async (req, res) => {\n  const methods = await omega.getPayoutMethods(req.user.id);\n  return res.json({ methods });\n});` },
            ],
          },
          {
            name: "analytics/",
            type: "folder",
            files: [
              { name: "overview.ts",         size: "1.0 KB", modified: "2026-04-01", desc: "GET /analytics/overview",     preview: `router.get('/overview', requireAuth, async (req, res) => {\n  const data = await analyticsService.overview(req.user.id);\n  return res.json(data);\n});` },
              { name: "streamAnalytics.ts",  size: "0.8 KB", modified: "2026-04-01", desc: "GET /analytics/stream/:id",  preview: `router.get('/stream/:id', requireAuth, async (req, res) => {\n  return res.json(await analyticsService.byStream(req.params.id));\n});` },
              { name: "contentAnalytics.ts", size: "0.8 KB", modified: "2026-04-01", desc: "GET /analytics/content/:id", preview: `router.get('/content/:id', requireAuth, async (req, res) => {\n  return res.json(await analyticsService.byContent(req.params.id));\n});` },
            ],
          },
          {
            name: "system/",
            type: "folder",
            files: [
              { name: "health.ts",        size: "0.4 KB", modified: "2026-03-20", desc: "GET /system/health",  preview: `router.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));` },
              { name: "enginesHealth.ts", size: "0.7 KB", modified: "2026-03-20", desc: "GET /engines/health", preview: `router.get('/engines/health', async (req, res) => {\n  const [o, a, ow] = await Promise.all([omega.ping(), aegis.ping(), overwatch.ping()]);\n  return res.json({ omega: o, aegis: a, overwatch: ow });\n});` },
            ],
          },
        ],
      },
      {
        name: "controllers/",
        type: "folder",
        desc: "HTTP request handlers — delegate to services",
        badge: "10 files",
        badgeColor: "bg-chart-4/10 text-chart-4 border-chart-4/20",
        files: [
          { name: "authController.ts",        size: "3.1 KB", modified: "2026-03-28", desc: "Login, signup, refresh",         preview: `export class AuthController {\n  async login(req, res) {\n    const result = await authService.login(req.body.email, req.body.password);\n    return res.json(result);\n  }\n  async signup(req, res) {\n    const user = await authService.createUser(req.body);\n    return res.status(201).json(user);\n  }\n  async refresh(req, res) {\n    return res.json(await authService.refresh(req.body.refresh_token));\n  }\n}` },
          { name: "creatorController.ts",     size: "4.2 KB", modified: "2026-04-01", desc: "Profile, onboarding, segment",  preview: `export class CreatorController {\n  async getProfile(req, res) { ... }\n  async updateProfile(req, res) { ... }\n  async startOnboarding(req, res) { ... }\n  async getSegment(req, res) { ... }\n  async refreshRisk(req, res) { ... }\n}` },
          { name: "streamController.ts",      size: "5.0 KB", modified: "2026-04-02", desc: "Stream lifecycle & chat",       preview: `export class StreamController {\n  async startStream(req, res) { ... }\n  async endStream(req, res) { ... }\n  async getChat(req, res) { ... }\n  async sendChat(req, res) { ... }\n  async processTip(req, res) { ... }\n}` },
          { name: "contentController.ts",     size: "3.8 KB", modified: "2026-04-01", desc: "Upload, list, delete content",  preview: `export class ContentController {\n  async upload(req, res) { ... }\n  async list(req, res) { ... }\n  async getById(req, res) { ... }\n  async delete(req, res) { ... }\n}` },
          { name: "storeController.ts",       size: "3.4 KB", modified: "2026-03-25", desc: "Store CRUD & purchases",        preview: `export class StoreController {\n  async createItem(req, res) { ... }\n  async listItems(req, res) { ... }\n  async purchase(req, res) { ... }\n}` },
          { name: "payoutsController.ts",     size: "3.0 KB", modified: "2026-04-02", desc: "Payout requests/summaries",    preview: `export class PayoutsController {\n  async getSummary(req, res) { ... }\n  async requestWithdrawal(req, res) { ... }\n  async getMethods(req, res) { ... }\n}` },
          { name: "analyticsController.ts",   size: "2.8 KB", modified: "2026-04-01", desc: "Analytics aggregation",        preview: `export class AnalyticsController {\n  async overview(req, res) { ... }\n  async streamAnalytics(req, res) { ... }\n  async contentAnalytics(req, res) { ... }\n}` },
          { name: "tenantController.ts",      size: "2.5 KB", modified: "2026-03-22", desc: "Enterprise tenant mgmt",       preview: `export class TenantController {\n  async register(req, res) { ... }\n  async listCreators(req, res) { ... }\n  async inviteCreator(req, res) { ... }\n}` },
          { name: "marketplaceController.ts", size: "2.1 KB", modified: "2026-03-22", desc: "Marketplace & affiliates",     preview: `export class MarketplaceController {\n  async listProducts(req, res) { ... }\n  async purchase(req, res) { ... }\n}` },
          { name: "systemController.ts",      size: "0.9 KB", modified: "2026-03-20", desc: "Health checks",               preview: `export class SystemController {\n  health(req, res) { res.json({ status: 'ok' }); }\n  async enginesHealth(req, res) { ... }\n}` },
        ],
      },
      {
        name: "services/",
        type: "folder",
        desc: "Business logic — never touches HTTP layer",
        badge: "6 files",
        badgeColor: "bg-accent/10 text-accent border-accent/20",
        files: [
          { name: "authService.ts",       size: "5.5 KB", modified: "2026-03-28", desc: "JWT issuance, bcrypt, sessions",      preview: `export const authService = {\n  async login(email, password) {\n    const user = await db.users.findByEmail(email);\n    if (!user) throw new AppError(401, 'Invalid credentials');\n    await bcrypt.compare(password, user.passwordHash);\n    const token = jwtUtils.sign({ id: user.id, role: user.role });\n    const refresh = jwtUtils.sign({ id: user.id }, '30d');\n    return { token, refresh_token: refresh, user: sanitize(user) };\n  },\n  async createUser(data) {\n    const hash = await bcrypt.hash(data.password, 12);\n    return db.users.create({ ...data, passwordHash: hash });\n  },\n};` },
          { name: "onboardingService.ts", size: "6.1 KB", modified: "2026-04-01", desc: "Aegis + Overwatch + Omega init",      preview: `export const onboardingService = {\n  async start(userId) {\n    const [risk, segment] = await Promise.all([\n      aegis.runBaseline(userId),\n      overwatch.segment(userId),\n    ]);\n    await omega.initPayoutAccount({ userId, segment: segment.tier });\n    return workflowService.create(userId, 'onboarding', { risk, segment });\n  },\n  async getStatus(userId) {\n    return workflowService.getLatest(userId, 'onboarding');\n  },\n};` },
          { name: "streamService.ts",     size: "7.2 KB", modified: "2026-04-02", desc: "RTMP keys, recording, lifecycle",    preview: `export const streamService = {\n  async create({ userId, title, category }) {\n    const key = crypto.randomBytes(20).toString('hex');\n    const stream = await db.streams.create({\n      userId, title, category, key,\n      rtmpUrl: \`rtmp://live.trident.io/app/\${key}\`,\n      status: 'live',\n    });\n    await recordingService.startCapture(stream.id);\n    return stream;\n  },\n  async end(streamId, userId) {\n    await recordingService.stopCapture(streamId);\n    return db.streams.update(streamId, { status: 'ended', endedAt: new Date() });\n  }\n};` },
          { name: "contentService.ts",    size: "6.8 KB", modified: "2026-04-01", desc: "Upload pipeline, transcode queue",   preview: `export const contentService = {\n  async ingest({ userId, type, title, fileUrl }) {\n    const content = await db.content.create({ userId, type, title, fileUrl, status: 'processing' });\n    await transcodeQueue.add({ contentId: content.id, fileUrl, type });\n    await analyticsService.trackUpload(userId, type);\n    return content;\n  },\n  async listByUser(userId) {\n    return db.content.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });\n  }\n};` },
          { name: "payoutsService.ts",    size: "5.9 KB", modified: "2026-04-02", desc: "Omega payout orchestration",        preview: `export const payoutsService = {\n  async requestWithdrawal({ userId, amount, method }) {\n    const creator = await db.creators.findById(userId);\n    if (creator.pendingBalance < amount) throw new AppError(400, 'Insufficient balance');\n    const split = await omega.calculateSplit(userId, amount);\n    const payout = await omega.executePayout({ userId, split, method });\n    await db.payouts.create({ userId, amount, method, payoutId: payout.id });\n    return payout;\n  }\n};` },
          { name: "analyticsService.ts",  size: "4.4 KB", modified: "2026-04-01", desc: "Event aggregation, time-series",    preview: `export const analyticsService = {\n  async overview(userId) {\n    const [streams, content, revenue, tips] = await Promise.all([\n      db.streams.countByUser(userId),\n      db.content.countByUser(userId),\n      omega.getRevenueSummary(userId),\n      db.tips.sumByCreator(userId),\n    ]);\n    return { streams, content, total_revenue: revenue, tips };\n  }\n};` },
        ],
      },
      {
        name: "engines/",
        type: "folder",
        desc: "Façade layer ONLY — private engines never in this repo",
        badge: "private façade",
        badgeColor: "bg-destructive/10 text-destructive border-destructive/20",
        isEngine: true,
        files: [
          { name: "omega.ts",     size: "8.3 KB", modified: "2026-04-03", desc: "Revenue, payouts, tips façade",        preview: `// ⚠️  FAÇADE ONLY — Omega runs in an isolated trust zone\n// All calls go over mTLS to omega-engine:443\nimport { bridge } from './bridge';\n\nexport const omega = {\n  routeTip:             (p) => bridge.call('omega', 'routeTip', p),\n  processStorePurchase: (p) => bridge.call('omega', 'storePurchase', p),\n  getPayoutSummary:     (p) => bridge.call('omega', 'payoutSummary', p),\n  requestWithdrawal:    (p) => bridge.call('omega', 'withdraw', p),\n  initPayoutAccount:    (p) => bridge.call('omega', 'initAccount', p),\n  calculateSplit:       (p) => bridge.call('omega', 'calcSplit', p),\n  getRevenueSummary:    (p) => bridge.call('omega', 'revenueSummary', p),\n  ping:                 () => bridge.ping('omega'),\n};` },
          { name: "aegis.ts",     size: "6.1 KB", modified: "2026-04-03", desc: "Risk scoring, fraud detection façade", preview: `// ⚠️  FAÇADE ONLY — Aegis runs in an isolated trust zone\nimport { bridge } from './bridge';\n\nexport const aegis = {\n  runBaseline: (p) => bridge.call('aegis', 'baseline', p),\n  getRisk:     (p) => bridge.call('aegis', 'getRisk', p),\n  refresh:     (p) => bridge.call('aegis', 'refresh', p),\n  flag:        (p) => bridge.call('aegis', 'flag', p),\n  ping:        () => bridge.ping('aegis'),\n};` },
          { name: "overwatch.ts", size: "5.8 KB", modified: "2026-04-03", desc: "Creator segmentation façade",          preview: `// ⚠️  FAÇADE ONLY — Overwatch runs in an isolated trust zone\nimport { bridge } from './bridge';\n\nexport const overwatch = {\n  segment:    (p) => bridge.call('overwatch', 'segment', p),\n  getSegment: (p) => bridge.call('overwatch', 'getSegment', p),\n  refresh:    (p) => bridge.call('overwatch', 'refresh', p),\n  ping:       () => bridge.ping('overwatch'),\n};` },
          { name: "bridge.ts",    size: "4.2 KB", modified: "2026-04-03", desc: "mTLS connector with circuit breaker",  preview: `import https from 'https';\nimport fs from 'fs';\n\nconst CERTS = {\n  cert: fs.readFileSync('/etc/tls/client.crt'),\n  key:  fs.readFileSync('/etc/tls/client.key'),\n  ca:   fs.readFileSync('/etc/tls/ca.crt'),\n};\n\nconst HOSTS = {\n  omega:     process.env.OMEGA_HOST,\n  aegis:     process.env.AEGIS_HOST,\n  overwatch: process.env.OVERWATCH_HOST,\n};\n\nexport const bridge = {\n  async call(engine, method, payload, retries = 3) {\n    // mTLS POST to internal engine cluster\n    // circuit-breaker: opens after 5 consecutive failures\n  },\n  async ping(engine) {\n    return this.call(engine, '__ping', {}, 1);\n  }\n};` },
        ],
      },
      {
        name: "middleware/",
        type: "folder",
        desc: "Auth, CORS, rate limiting, error handling",
        badge: "5 files",
        badgeColor: "bg-primary/10 text-primary border-primary/20",
        files: [
          { name: "auth.ts",         size: "2.1 KB", modified: "2026-03-28", desc: "JWT verification, attaches req.user",    preview: `export const requireAuth = async (req, res, next) => {\n  const token = req.headers.authorization?.split(' ')[1];\n  if (!token) return res.status(401).json({ error: 'Unauthorized' });\n  try {\n    req.user = jwtUtils.verify(token);\n    next();\n  } catch {\n    return res.status(401).json({ error: 'Invalid token' });\n  }\n};\n\nexport const requireAdmin = [requireAuth, (req, res, next) => {\n  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });\n  next();\n}];` },
          { name: "cors.ts",         size: "1.0 KB", modified: "2026-03-20", desc: "CORS allowlist for known origins",        preview: `export const corsPolicy = cors({\n  origin: [\n    'https://app.livestreamlab.live',\n    'https://creator.livestreamlab.live',\n    'https://admin.livestreamlab.live',\n  ],\n  methods: ['GET','POST','PATCH','DELETE','OPTIONS'],\n  allowedHeaders: ['Authorization','Content-Type','X-Request-ID'],\n  credentials: true,\n});` },
          { name: "errorHandler.ts", size: "1.5 KB", modified: "2026-03-28", desc: "Global JSON error handler",              preview: `export const errorHandler = (err, req, res, next) => {\n  logger.error({ err, path: req.path, method: req.method });\n  const status = err.status || 500;\n  return res.status(status).json({\n    error:   err.message || 'Internal Server Error',\n    code:    err.code    || 'INTERNAL_ERROR',\n    request_id: req.headers['x-request-id'],\n    ts:      new Date().toISOString(),\n  });\n};` },
          { name: "rateLimit.ts",    size: "0.9 KB", modified: "2026-03-20", desc: "200 req/min per IP via Redis",            preview: `export const rateLimiter = rateLimit({\n  windowMs: 60 * 1000,\n  max: 200,\n  store: new RedisStore({ client: redisClient, prefix: 'rl:' }),\n  message: { error: 'Too many requests', retry_after: 60 },\n  standardHeaders: true,\n});` },
          { name: "requestId.ts",    size: "0.5 KB", modified: "2026-03-28", desc: "Injects X-Request-ID on every request",  preview: `import { randomUUID } from 'crypto';\n\nexport const requestId = (req, res, next) => {\n  const id = req.headers['x-request-id'] || randomUUID();\n  req.id = id;\n  res.setHeader('X-Request-ID', id);\n  next();\n};` },
        ],
      },
      {
        name: "utils/",
        type: "folder",
        desc: "Shared helpers",
        badge: "5 files",
        badgeColor: "bg-secondary text-muted-foreground border-border",
        files: [
          { name: "jwt.ts",       size: "1.3 KB", modified: "2026-03-28", desc: "JWT sign / verify / decode",    preview: `import jwt from 'jsonwebtoken';\nconst SECRET = process.env.JWT_SECRET!;\n\nexport const jwtUtils = {\n  sign:   (payload, exp = '7d') => jwt.sign(payload, SECRET, { expiresIn: exp }),\n  verify: (token) => jwt.verify(token, SECRET) as JwtPayload,\n  decode: (token) => jwt.decode(token),\n};` },
          { name: "uploader.ts",  size: "2.2 KB", modified: "2026-04-01", desc: "S3/R2 multipart upload",       preview: `import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';\nconst s3 = new S3Client({ region: process.env.AWS_REGION });\n\nexport const uploadToStorage = async (file, key: string) => {\n  await s3.send(new PutObjectCommand({\n    Bucket: process.env.BUCKET, Key: key, Body: file.buffer,\n    ContentType: file.mimetype,\n  }));\n  return \`https://\${process.env.CDN_HOST}/\${key}\`;\n};` },
          { name: "validator.ts", size: "1.8 KB", modified: "2026-03-28", desc: "Zod request body validator",   preview: `import { z } from 'zod';\nimport { AppError } from './errors';\n\nexport const validate = (schema: z.ZodSchema) => (req, res, next) => {\n  const result = schema.safeParse(req.body);\n  if (!result.success) {\n    return res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });\n  }\n  req.body = result.data;\n  next();\n};` },
          { name: "logger.ts",    size: "1.1 KB", modified: "2026-03-20", desc: "Structured pino logger",        preview: `import pino from 'pino';\n\nexport const logger = pino({\n  level: process.env.LOG_LEVEL ?? 'info',\n  base: { service: 'livestreamlab-api', env: process.env.NODE_ENV },\n  transport: process.env.NODE_ENV === 'development'\n    ? { target: 'pino-pretty', options: { colorize: true } }\n    : undefined,\n});` },
          { name: "errors.ts",    size: "0.8 KB", modified: "2026-03-28", desc: "AppError class with status",   preview: `export class AppError extends Error {\n  status: number;\n  code: string;\n\n  constructor(status: number, message: string, code = 'APP_ERROR') {\n    super(message);\n    this.status = status;\n    this.code = code;\n    Error.captureStackTrace(this, AppError);\n  }\n}` },
        ],
      },
      {
        name: "index.ts",
        type: "file",
        fileData: {
          name: "index.ts", size: "2.8 KB", modified: "2026-04-03",
          desc: "Bootstraps Express — mounts routes, middleware, starts listener",
          preview: `import express from 'express';\nimport { corsPolicy }    from './middleware/cors';\nimport { rateLimiter }  from './middleware/rateLimit';\nimport { errorHandler } from './middleware/errorHandler';\nimport { requestId }    from './middleware/requestId';\nimport authRoutes       from './routes/auth';\nimport creatorRoutes    from './routes/creator';\nimport streamRoutes     from './routes/stream';\nimport contentRoutes    from './routes/content';\nimport storeRoutes      from './routes/store';\nimport payoutsRoutes    from './routes/payouts';\nimport analyticsRoutes  from './routes/analytics';\nimport systemRoutes     from './routes/system';\n\nconst app = express();\n\napp.use(requestId, corsPolicy, rateLimiter, express.json({ limit: '10mb' }));\n\napp.use('/auth',      authRoutes);\napp.use('/creator',   creatorRoutes);\napp.use('/stream',    streamRoutes);\napp.use('/content',   contentRoutes);\napp.use('/store',     storeRoutes);\napp.use('/payouts',   payoutsRoutes);\napp.use('/analytics', analyticsRoutes);\napp.use('/system',    systemRoutes);\n\napp.use(errorHandler);\n\napp.listen(process.env.PORT ?? 8080, () => {\n  console.log(\`[API] Listening on port \${process.env.PORT ?? 8080}\`);\n});`,
        },
      },
    ],
  },

  // ── db/ ────────────────────────────────────────────────────────────────────
  {
    name: "db/",
    type: "root",
    rootIcon: Database,
    rootColor: "text-chart-3",
    children: [
      {
        name: "migrations/",
        type: "folder",
        desc: "Ordered SQL migration files",
        badge: "8 migrations",
        badgeColor: "bg-chart-3/10 text-chart-3 border-chart-3/20",
        files: [
          { name: "001_create_users.sql",       size: "1.4 KB", modified: "2026-01-10", desc: "Users table — auth, role, profile",       preview: `CREATE TABLE users (\n  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  email       TEXT UNIQUE NOT NULL,\n  username    TEXT UNIQUE NOT NULL,\n  password_hash TEXT NOT NULL,\n  role        TEXT NOT NULL DEFAULT 'creator',\n  full_name   TEXT,\n  avatar_url  TEXT,\n  bio         TEXT,\n  created_at  TIMESTAMPTZ DEFAULT now(),\n  updated_at  TIMESTAMPTZ DEFAULT now()\n);\n\nCREATE INDEX idx_users_email    ON users(email);\nCREATE INDEX idx_users_username ON users(username);` },
          { name: "002_create_streams.sql",     size: "1.1 KB", modified: "2026-01-12", desc: "Streams table — live sessions",            preview: `CREATE TABLE streams (\n  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n  title        TEXT NOT NULL,\n  category     TEXT,\n  stream_key   TEXT UNIQUE NOT NULL,\n  rtmp_url     TEXT NOT NULL,\n  status       TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live','ended','scheduled')),\n  viewer_count INT DEFAULT 0,\n  peak_viewers INT DEFAULT 0,\n  tips_earned  NUMERIC(18,2) DEFAULT 0,\n  started_at   TIMESTAMPTZ DEFAULT now(),\n  ended_at     TIMESTAMPTZ,\n  created_at   TIMESTAMPTZ DEFAULT now()\n);\n\nCREATE INDEX idx_streams_user_id ON streams(user_id);\nCREATE INDEX idx_streams_status  ON streams(status);` },
          { name: "003_create_content.sql",     size: "1.3 KB", modified: "2026-01-15", desc: "Content table — video/audio/podcast",      preview: `CREATE TABLE content (\n  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n  type         TEXT NOT NULL CHECK (type IN ('video','audio','podcast')),\n  title        TEXT NOT NULL,\n  description  TEXT,\n  file_url     TEXT,\n  thumbnail_url TEXT,\n  status       TEXT NOT NULL DEFAULT 'processing',\n  views        INT DEFAULT 0,\n  revenue      NUMERIC(18,2) DEFAULT 0,\n  is_premium   BOOLEAN DEFAULT false,\n  unlock_price NUMERIC(18,2) DEFAULT 0,\n  created_at   TIMESTAMPTZ DEFAULT now()\n);\n\nCREATE INDEX idx_content_user_id ON content(user_id);\nCREATE INDEX idx_content_type    ON content(type);` },
          { name: "004_create_store_items.sql", size: "1.0 KB", modified: "2026-01-20", desc: "Store products table",                     preview: `CREATE TABLE store_items (\n  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n  name            TEXT NOT NULL,\n  description     TEXT,\n  price_usd       NUMERIC(18,2) DEFAULT 0,\n  price_streaming NUMERIC(18,2) DEFAULT 0,\n  file_url        TEXT,\n  image_url       TEXT,\n  status          TEXT DEFAULT 'published',\n  sales_count     INT DEFAULT 0,\n  revenue         NUMERIC(18,2) DEFAULT 0,\n  created_at      TIMESTAMPTZ DEFAULT now()\n);\n` },
          { name: "005_create_tips.sql",        size: "0.9 KB", modified: "2026-01-25", desc: "Tips table — stream & video tips",         preview: `CREATE TABLE tips (\n  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  from_user   UUID REFERENCES users(id),\n  to_creator  UUID NOT NULL REFERENCES users(id),\n  stream_id   UUID REFERENCES streams(id),\n  amount      NUMERIC(18,2) NOT NULL,\n  currency    TEXT NOT NULL DEFAULT 'STREAMING',\n  omega_ref   TEXT,\n  created_at  TIMESTAMPTZ DEFAULT now()\n);\n\nCREATE INDEX idx_tips_creator ON tips(to_creator);\nCREATE INDEX idx_tips_stream  ON tips(stream_id);` },
          { name: "006_create_payouts.sql",     size: "1.0 KB", modified: "2026-02-01", desc: "Payouts table — withdrawal history",       preview: `CREATE TABLE payouts (\n  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id      UUID NOT NULL REFERENCES users(id),\n  amount       NUMERIC(18,2) NOT NULL,\n  method       TEXT NOT NULL,\n  status       TEXT NOT NULL DEFAULT 'pending',\n  omega_ref    TEXT,\n  processed_at TIMESTAMPTZ,\n  created_at   TIMESTAMPTZ DEFAULT now()\n);\n\nCREATE INDEX idx_payouts_user_id ON payouts(user_id);\nCREATE INDEX idx_payouts_status  ON payouts(status);` },
          { name: "007_create_tenants.sql",     size: "1.1 KB", modified: "2026-02-10", desc: "Enterprise tenants & memberships",         preview: `CREATE TABLE tenants (\n  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  name       TEXT NOT NULL,\n  domain     TEXT UNIQUE,\n  plan       TEXT DEFAULT 'enterprise',\n  status     TEXT DEFAULT 'active',\n  created_at TIMESTAMPTZ DEFAULT now()\n);\n\nCREATE TABLE tenant_members (\n  tenant_id  UUID NOT NULL REFERENCES tenants(id),\n  user_id    UUID NOT NULL REFERENCES users(id),\n  role       TEXT DEFAULT 'creator',\n  joined_at  TIMESTAMPTZ DEFAULT now(),\n  PRIMARY KEY (tenant_id, user_id)\n);` },
          { name: "008_create_analytics.sql",   size: "1.2 KB", modified: "2026-02-15", desc: "Analytics events table",                  preview: `CREATE TABLE analytics_events (\n  id          BIGSERIAL PRIMARY KEY,\n  user_id     UUID REFERENCES users(id),\n  event_type  TEXT NOT NULL,\n  entity_id   UUID,\n  entity_type TEXT,\n  metadata    JSONB DEFAULT '{}',\n  ip_addr     INET,\n  created_at  TIMESTAMPTZ DEFAULT now()\n);\n\nCREATE INDEX idx_analytics_user    ON analytics_events(user_id);\nCREATE INDEX idx_analytics_type    ON analytics_events(event_type);\nCREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);\nCREATE INDEX idx_analytics_entity  ON analytics_events(entity_id);` },
        ],
      },
      {
        name: "seeds/",
        type: "folder",
        desc: "Development seed data",
        badge: "3 files",
        badgeColor: "bg-accent/10 text-accent border-accent/20",
        files: [
          { name: "seed_users.ts",   size: "1.6 KB", modified: "2026-02-20", desc: "Seed 20 creator accounts",        preview: `import { db } from '../src/db';\nimport bcrypt from 'bcryptjs';\n\nconst CREATORS = [\n  { username: 'djphantom',   email: 'phantom@test.com',  full_name: 'DJ Phantom' },\n  { username: 'streamking',  email: 'king@test.com',     full_name: 'Stream King' },\n  { username: 'techcast',    email: 'tech@test.com',     full_name: 'TechCast' },\n  // ... 17 more\n];\n\nexport async function seedUsers() {\n  const hash = await bcrypt.hash('password123', 10);\n  for (const creator of CREATORS) {\n    await db.users.upsert({ where: { email: creator.email }, create: { ...creator, password_hash: hash } });\n  }\n  console.log(\`✓ Seeded \${CREATORS.length} creator accounts\`);\n}` },
          { name: "seed_streams.ts", size: "1.2 KB", modified: "2026-02-20", desc: "Seed sample streams with tips",    preview: `export async function seedStreams() {\n  const users = await db.users.findMany({ take: 5 });\n  for (const user of users) {\n    await db.streams.create({\n      data: {\n        userId: user.id,\n        title: \`\${user.full_name}'s Test Stream\`,\n        category: 'Music',\n        streamKey: randomBytes(20).toString('hex'),\n        rtmpUrl: 'rtmp://live.trident.io/app/...',\n        status: 'ended',\n        viewerCount: Math.floor(Math.random() * 2000),\n        tipsEarned: Math.random() * 500,\n      }\n    });\n  }\n}` },
          { name: "seed_content.ts", size: "1.4 KB", modified: "2026-02-20", desc: "Seed videos, audio, podcasts",    preview: `const SAMPLE_CONTENT = [\n  { type: 'video',   title: 'Building a Stream Studio',    status: 'published' },\n  { type: 'podcast', title: 'Creator Economy Episode 1',   status: 'published' },\n  { type: 'audio',   title: 'Lofi Beats Vol. 1',           status: 'published' },\n];\n\nexport async function seedContent() {\n  const users = await db.users.findMany({ take: 3 });\n  for (const user of users) {\n    for (const content of SAMPLE_CONTENT) {\n      await db.content.create({ data: { userId: user.id, ...content } });\n    }\n  }\n}` },
        ],
      },
      {
        name: "schema.prisma",
        type: "file",
        fileData: {
          name: "schema.prisma", size: "5.2 KB", modified: "2026-04-01",
          desc: "Prisma ORM schema — all models and relations",
          preview: `generator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\nmodel User {\n  id           String   @id @default(uuid())\n  email        String   @unique\n  username     String   @unique\n  passwordHash String   @map("password_hash")\n  role         String   @default("creator")\n  fullName     String?  @map("full_name")\n  avatarUrl    String?  @map("avatar_url")\n  bio          String?\n  createdAt    DateTime @default(now()) @map("created_at")\n  streams      Stream[]\n  content      Content[]\n  tips         Tip[]    @relation("ReceivedTips")\n  payouts      Payout[]\n  @@map("users")\n}\n\nmodel Stream {\n  id          String   @id @default(uuid())\n  userId      String   @map("user_id")\n  title       String\n  category    String?\n  streamKey   String   @unique @map("stream_key")\n  status      String   @default("live")\n  viewerCount Int      @default(0) @map("viewer_count")\n  tipsEarned  Decimal  @default(0) @map("tips_earned")\n  startedAt   DateTime @default(now()) @map("started_at")\n  endedAt     DateTime? @map("ended_at")\n  user        User     @relation(fields: [userId], references: [id])\n  tips        Tip[]\n  @@map("streams")\n}`,
        },
      },
    ],
  },

  // ── tests/ ─────────────────────────────────────────────────────────────────
  {
    name: "tests/",
    type: "root",
    rootIcon: TestTube,
    rootColor: "text-accent",
    children: [
      {
        name: "unit/",
        type: "folder",
        desc: "Unit tests — isolated service & util tests",
        badge: "8 files",
        badgeColor: "bg-accent/10 text-accent border-accent/20",
        files: [
          { name: "authService.test.ts",     size: "3.2 KB", modified: "2026-04-02", desc: "Login, signup, token tests",     preview: `import { describe, it, expect, vi } from 'vitest';\nimport { authService } from '../../src/services/authService';\n\ndescribe('authService.login', () => {\n  it('returns token and user on valid credentials', async () => {\n    const result = await authService.login('test@example.com', 'password123');\n    expect(result.token).toBeDefined();\n    expect(result.user.email).toBe('test@example.com');\n  });\n\n  it('throws 401 on invalid password', async () => {\n    await expect(authService.login('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials');\n  });\n});` },
          { name: "streamService.test.ts",   size: "2.8 KB", modified: "2026-04-02", desc: "Stream create/end tests",       preview: `describe('streamService.create', () => {\n  it('generates a unique stream key', async () => {\n    const s1 = await streamService.create({ userId: 'u1', title: 'Test', category: 'Gaming' });\n    const s2 = await streamService.create({ userId: 'u1', title: 'Test 2', category: 'Gaming' });\n    expect(s1.key).not.toBe(s2.key);\n  });\n\n  it('sets status to live on creation', async () => {\n    const stream = await streamService.create({ userId: 'u1', title: 'Test', category: 'Music' });\n    expect(stream.status).toBe('live');\n  });\n});` },
          { name: "jwtUtils.test.ts",        size: "1.6 KB", modified: "2026-03-28", desc: "JWT sign/verify tests",         preview: `describe('jwtUtils', () => {\n  it('signs and verifies a payload', () => {\n    const payload = { id: 'user-123', role: 'creator' };\n    const token = jwtUtils.sign(payload);\n    const decoded = jwtUtils.verify(token);\n    expect(decoded.id).toBe('user-123');\n  });\n\n  it('throws on expired token', () => {\n    const token = jwtUtils.sign({ id: 'u1' }, '0s');\n    expect(() => jwtUtils.verify(token)).toThrow();\n  });\n});` },
          { name: "validator.test.ts",       size: "1.4 KB", modified: "2026-03-28", desc: "Zod validation middleware test", preview: `describe('validate middleware', () => {\n  it('passes valid body to next()', () => {\n    const req = { body: { email: 'a@b.com', password: 'pass1234' } };\n    const next = vi.fn();\n    validate(loginSchema)(req, mockRes, next);\n    expect(next).toHaveBeenCalled();\n  });\n\n  it('returns 400 on invalid body', () => {\n    const req = { body: { email: 'not-an-email' } };\n    validate(loginSchema)(req, mockRes, vi.fn());\n    expect(mockRes.status).toHaveBeenCalledWith(400);\n  });\n});` },
          { name: "payoutsService.test.ts",  size: "2.1 KB", modified: "2026-04-02", desc: "Payout balance & split tests",  preview: `describe('payoutsService.requestWithdrawal', () => {\n  it('throws if balance insufficient', async () => {\n    mockCreator({ pendingBalance: 50 });\n    await expect(payoutsService.requestWithdrawal({ userId: 'u1', amount: 200, method: 'bank' }))\n      .rejects.toThrow('Insufficient balance');\n  });\n});` },
          { name: "analyticsService.test.ts",size: "1.9 KB", modified: "2026-04-01", desc: "Overview aggregation tests",    preview: `describe('analyticsService.overview', () => {\n  it('returns correct revenue total', async () => {\n    const result = await analyticsService.overview('user-123');\n    expect(typeof result.total_revenue).toBe('number');\n    expect(result.streams).toBeGreaterThanOrEqual(0);\n  });\n});` },
          { name: "bridge.test.ts",          size: "2.4 KB", modified: "2026-04-03", desc: "Engine bridge retry tests",     preview: `describe('bridge.call', () => {\n  it('retries up to 3 times on failure', async () => {\n    const callSpy = vi.fn().mockRejectedValueOnce(new Error('timeout'))\n                           .mockResolvedValueOnce({ ok: true });\n    const result = await bridge.call('omega', 'test', {});\n    expect(callSpy).toHaveBeenCalledTimes(2);\n    expect(result.ok).toBe(true);\n  });\n});` },
          { name: "errors.test.ts",          size: "0.8 KB", modified: "2026-03-28", desc: "AppError class tests",          preview: `describe('AppError', () => {\n  it('sets status and code correctly', () => {\n    const err = new AppError(404, 'Not found', 'NOT_FOUND');\n    expect(err.status).toBe(404);\n    expect(err.code).toBe('NOT_FOUND');\n    expect(err.message).toBe('Not found');\n  });\n});` },
        ],
      },
      {
        name: "integration/",
        type: "folder",
        desc: "Integration tests — real DB, supertest HTTP",
        badge: "5 files",
        badgeColor: "bg-primary/10 text-primary border-primary/20",
        files: [
          { name: "auth.int.test.ts",     size: "3.8 KB", modified: "2026-04-02", desc: "Full auth flow over HTTP",         preview: `import request from 'supertest';\nimport app from '../../src/index';\n\ndescribe('POST /auth/signup', () => {\n  it('creates user and returns JWT', async () => {\n    const res = await request(app)\n      .post('/auth/signup')\n      .send({ email: 'new@test.com', password: 'pass1234', username: 'newuser' });\n    expect(res.status).toBe(201);\n    expect(res.body.token).toBeDefined();\n  });\n});\n\ndescribe('POST /auth/login', () => {\n  it('returns 401 on wrong password', async () => {\n    const res = await request(app)\n      .post('/auth/login')\n      .send({ email: 'new@test.com', password: 'wrongpass' });\n    expect(res.status).toBe(401);\n  });\n});` },
          { name: "stream.int.test.ts",   size: "3.2 KB", modified: "2026-04-02", desc: "Stream start/end/chat flow",      preview: `describe('Stream lifecycle', () => {\n  let token: string;\n  let streamId: string;\n\n  beforeAll(async () => {\n    const res = await request(app).post('/auth/login').send(TEST_CREDS);\n    token = res.body.token;\n  });\n\n  it('starts a stream and returns RTMP url', async () => {\n    const res = await request(app)\n      .post('/stream/start')\n      .set('Authorization', \`Bearer \${token}\`)\n      .send({ title: 'Test Stream', category: 'Gaming' });\n    expect(res.status).toBe(201);\n    expect(res.body.rtmp_url).toMatch(/^rtmp:/);\n    streamId = res.body.stream_id;\n  });\n\n  it('ends the stream', async () => {\n    const res = await request(app)\n      .post('/stream/end')\n      .set('Authorization', \`Bearer \${token}\`)\n      .send({ stream_id: streamId });\n    expect(res.body.ended).toBe(true);\n  });\n});` },
          { name: "content.int.test.ts",  size: "2.6 KB", modified: "2026-04-01", desc: "Upload & list content",          preview: `describe('Content upload', () => {\n  it('accepts a video upload', async () => {\n    const res = await request(app)\n      .post('/content/upload')\n      .set('Authorization', \`Bearer \${token}\`)\n      .send({ type: 'video', title: 'My Video', file_url: 'https://cdn.example.com/v.mp4' });\n    expect(res.status).toBe(201);\n    expect(res.body.status).toBe('processing');\n  });\n});` },
          { name: "store.int.test.ts",    size: "2.9 KB", modified: "2026-03-25", desc: "Create item & purchase flow",    preview: `describe('Store purchase', () => {\n  it('creates a store item', async () => {\n    const res = await request(app)\n      .post('/store/item')\n      .set('Authorization', \`Bearer \${token}\`)\n      .send({ name: 'Beat Pack Vol.1', price: 29.99, streaming_price: 150 });\n    expect(res.status).toBe(201);\n    expect(res.body.status).toBe('published');\n  });\n});` },
          { name: "payouts.int.test.ts",  size: "2.3 KB", modified: "2026-04-02", desc: "Payout summary & request flow", preview: `describe('GET /payouts/summary', () => {\n  it('returns creator payout summary', async () => {\n    const res = await request(app)\n      .get('/payouts/summary')\n      .set('Authorization', \`Bearer \${token}\`);\n    expect(res.status).toBe(200);\n    expect(res.body).toHaveProperty('creator_share');\n    expect(res.body).toHaveProperty('pending');\n  });\n});` },
        ],
      },
      {
        name: "setup.ts",
        type: "file",
        fileData: {
          name: "setup.ts", size: "1.4 KB", modified: "2026-04-01",
          desc: "Vitest global test setup — test DB, mocks",
          preview: `import { beforeAll, afterAll, beforeEach } from 'vitest';\nimport { db } from '../src/db';\nimport { seedUsers } from './fixtures/users';\n\nbeforeAll(async () => {\n  // Use a separate test database\n  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;\n  await db.$connect();\n  await db.$executeRaw\`TRUNCATE users, streams, content, tips, payouts CASCADE\`;\n  await seedUsers();\n});\n\nbeforeEach(async () => {\n  // Mock all engine façades\n  vi.mock('../src/engines/omega');\n  vi.mock('../src/engines/aegis');\n  vi.mock('../src/engines/overwatch');\n});\n\nafterAll(async () => {\n  await db.$disconnect();\n});`,
        },
      },
    ],
  },

  // ── .github/ ───────────────────────────────────────────────────────────────
  {
    name: ".github/",
    type: "root",
    rootIcon: GitBranch,
    rootColor: "text-chart-4",
    children: [
      {
        name: "workflows/",
        type: "folder",
        desc: "GitHub Actions CI/CD pipelines",
        badge: "4 workflows",
        badgeColor: "bg-chart-4/10 text-chart-4 border-chart-4/20",
        files: [
          { name: "ci.yml",        size: "2.1 KB", modified: "2026-04-01", desc: "Run tests on every PR",        preview: `name: CI\non:\n  pull_request:\n    branches: [main, develop]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    services:\n      postgres:\n        image: postgres:16\n        env:\n          POSTGRES_PASSWORD: test\n        ports: ['5432:5432']\n      redis:\n        image: redis:7-alpine\n        ports: ['6379:6379']\n\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n          cache: 'npm'\n      - run: npm ci\n      - run: npm run db:migrate:test\n      - run: npm test\n        env:\n          TEST_DATABASE_URL: postgres://postgres:test@localhost:5432/test_db\n          JWT_SECRET: ci-test-secret` },
          { name: "deploy.yml",    size: "2.8 KB", modified: "2026-04-03", desc: "Deploy to production on push to main", preview: `name: Deploy\non:\n  push:\n    branches: [main]\n\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Build Docker image\n        run: docker build -t livestreamlab-api:${"${{ github.sha }}"} .\n      - name: Push to ECR\n        uses: aws-actions/amazon-ecr-login@v2\n      - run: |\n          docker tag livestreamlab-api:${"${{ github.sha }}"} $ECR_REGISTRY/api:latest\n          docker push $ECR_REGISTRY/api:latest\n      - name: Deploy to ECS\n        run: aws ecs update-service --cluster prod --service api --force-new-deployment` },
          { name: "release.yml",   size: "1.6 KB", modified: "2026-03-20", desc: "Auto-generate changelogs on release", preview: `name: Release\non:\n  push:\n    tags: ['v*']\n\njobs:\n  release:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n        with:\n          fetch-depth: 0\n      - name: Generate changelog\n        uses: orhun/git-cliff-action@v3\n        with:\n          config: cliff.toml\n      - name: Create GitHub Release\n        uses: actions/create-release@v1\n        with:\n          tag_name: ${"${{ github.ref }}"}\n          release_name: Release ${"${{ github.ref }}"}\n          body_path: CHANGELOG.md` },
          { name: "lint.yml",      size: "1.0 KB", modified: "2026-03-15", desc: "ESLint + Prettier on every push",    preview: `name: Lint\non: [push]\n\njobs:\n  lint:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '20'\n          cache: 'npm'\n      - run: npm ci\n      - run: npm run lint\n      - run: npm run format:check` },
        ],
      },
      {
        name: "PULL_REQUEST_TEMPLATE.md",
        type: "file",
        fileData: {
          name: "PULL_REQUEST_TEMPLATE.md", size: "0.7 KB", modified: "2026-03-10",
          desc: "PR description template",
          preview: `## Summary\n<!-- Describe what this PR does -->\n\n## Type of Change\n- [ ] Bug fix\n- [ ] New feature\n- [ ] Breaking change\n- [ ] Documentation update\n\n## Testing\n- [ ] Unit tests pass\n- [ ] Integration tests pass\n- [ ] Manually tested\n\n## Engine Impact\n- [ ] Changes affect Omega façade\n- [ ] Changes affect Aegis façade\n- [ ] Changes affect Overwatch façade\n\n## Checklist\n- [ ] Code follows project style guide\n- [ ] No secrets committed\n- [ ] Migration included (if DB change)`,
        },
      },
    ],
  },

  // ── infra/ ─────────────────────────────────────────────────────────────────
  {
    name: "infra/",
    type: "root",
    rootIcon: Cloud,
    rootColor: "text-chart-2",
    children: [
      {
        name: "terraform/",
        type: "folder",
        desc: "Infrastructure-as-code — AWS via Terraform",
        badge: "6 files",
        badgeColor: "bg-chart-2/10 text-chart-2 border-chart-2/20",
        files: [
          { name: "main.tf",       size: "3.2 KB", modified: "2026-03-30", desc: "Root Terraform config",              preview: `terraform {\n  required_providers {\n    aws = { source = "hashicorp/aws", version = "~> 5.0" }\n  }\n  backend "s3" {\n    bucket = "livestreamlab-tfstate"\n    key    = "api/terraform.tfstate"\n    region = "us-east-1"\n  }\n}\n\nprovider "aws" {\n  region = var.aws_region\n}\n\nmodule "vpc"     { source = "./modules/vpc" }\nmodule "ecs"     { source = "./modules/ecs" }\nmodule "rds"     { source = "./modules/rds" }\nmodule "redis"   { source = "./modules/redis" }\nmodule "alb"     { source = "./modules/alb" }` },
          { name: "variables.tf",  size: "1.1 KB", modified: "2026-03-30", desc: "Input variables",                   preview: `variable "aws_region"     { default = "us-east-1" }\nvariable "environment"    { description = "prod | staging | dev" }\nvariable "api_image_tag"  { description = "Docker image tag to deploy" }\nvariable "db_instance"    { default = "db.t3.medium" }\nvariable "api_cpu"        { default = 512 }\nvariable "api_memory"     { default = 1024 }\nvariable "api_min_count"  { default = 2 }\nvariable "api_max_count"  { default = 10 }` },
          { name: "outputs.tf",    size: "0.8 KB", modified: "2026-03-30", desc: "Output values",                     preview: `output "alb_dns_name" { value = module.alb.dns_name }\noutput "rds_endpoint"  { value = module.rds.endpoint }\noutput "ecr_repo_url"  { value = module.ecs.ecr_repo_url }\noutput "redis_host"    { value = module.redis.primary_endpoint }` },
          { name: "ecs.tf",        size: "4.1 KB", modified: "2026-04-01", desc: "ECS Fargate cluster & service",     preview: `resource "aws_ecs_cluster" "api" {\n  name = "livestreamlab-\${var.environment}"\n}\n\nresource "aws_ecs_task_definition" "api" {\n  family                   = "api"\n  requires_compatibilities = ["FARGATE"]\n  cpu                      = var.api_cpu\n  memory                   = var.api_memory\n  network_mode             = "awsvpc"\n  container_definitions = jsonencode([{\n    name  = "api",\n    image = "\${aws_ecr_repository.api.repository_url}:\${var.api_image_tag}",\n    portMappings = [{ containerPort = 8080 }],\n    environment  = local.env_vars,\n    logConfiguration = { logDriver = "awslogs", options = local.log_opts }\n  }])\n}` },
          { name: "rds.tf",        size: "2.4 KB", modified: "2026-03-30", desc: "PostgreSQL RDS instance",           preview: `resource "aws_db_instance" "api" {\n  identifier        = "livestreamlab-\${var.environment}"\n  engine            = "postgres"\n  engine_version    = "16.1"\n  instance_class    = var.db_instance\n  allocated_storage = 100\n  storage_encrypted = true\n  db_name           = "livestreamlab"\n  username          = "api_user"\n  password          = random_password.db.result\n  vpc_security_group_ids = [aws_security_group.rds.id]\n  multi_az               = var.environment == "prod"\n  backup_retention_period = 7\n  skip_final_snapshot    = false\n}` },
          { name: "Dockerfile",    size: "0.9 KB", modified: "2026-04-03", desc: "Multi-stage Docker build",         preview: `FROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine AS runner\nWORKDIR /app\nENV NODE_ENV=production\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/node_modules ./node_modules\nCOPY package.json .\n\nRUN addgroup -S appgroup && adduser -S appuser -G appgroup\nUSER appuser\n\nEXPOSE 8080\nCMD ["node", "dist/index.js"]` },
        ],
      },
      {
        name: "scripts/",
        type: "folder",
        desc: "Utility scripts for ops & deployment",
        badge: "4 files",
        badgeColor: "bg-muted text-muted-foreground border-border",
        files: [
          { name: "deploy.sh",       size: "1.2 KB", modified: "2026-04-03", desc: "One-command production deploy",   preview: `#!/bin/bash\nset -euo pipefail\n\nENV=\${1:-staging}\nSHA=$(git rev-parse --short HEAD)\n\necho "→ Building API image (\${SHA})..."\ndocker build -t livestreamlab-api:\${SHA} .\n\necho "→ Pushing to ECR..."\naws ecr get-login-password | docker login --username AWS --password-stdin \$ECR_REGISTRY\ndocker push \$ECR_REGISTRY/api:\${SHA}\n\necho "→ Applying Terraform..."\ncd infra/terraform\nterraform apply -var="api_image_tag=\${SHA}" -var="environment=\${ENV}" -auto-approve\n\necho "✓ Deployed \${SHA} to \${ENV}"` },
          { name: "db_migrate.sh",   size: "0.8 KB", modified: "2026-03-28", desc: "Run Prisma migrations",          preview: `#!/bin/bash\nset -euo pipefail\n\nENV=\${1:-development}\n\necho "→ Running migrations on [\${ENV}]..."\nnpx prisma migrate deploy\necho "✓ Migrations complete"` },
          { name: "rollback.sh",     size: "1.0 KB", modified: "2026-04-01", desc: "Roll ECS back to previous tag",  preview: `#!/bin/bash\nset -euo pipefail\n\nPREV_TAG=$(aws ecs describe-services \\\n  --cluster livestreamlab-prod \\\n  --services api \\\n  --query 'services[0].deployments[1].taskDefinition' \\\n  --output text | grep -oP 'api:\K.*')\n\necho "→ Rolling back to \${PREV_TAG}..."\naws ecs update-service --cluster livestreamlab-prod --service api \\\n  --task-definition api:\${PREV_TAG} --force-new-deployment\necho "✓ Rollback initiated"` },
          { name: "health_check.sh", size: "0.5 KB", modified: "2026-03-20", desc: "Smoke-test all endpoints",       preview: `#!/bin/bash\nBASE=\${API_URL:-https://api.livestreamlab.live}\n\ncurl -sf "\${BASE}/system/health"   || exit 1\ncurl -sf "\${BASE}/engines/health"  || exit 1\necho "✓ All health checks passed"` },
        ],
      },
    ],
  },

  // ── config/ ────────────────────────────────────────────────────────────────
  {
    name: "config/",
    type: "root",
    rootIcon: Terminal,
    rootColor: "text-muted-foreground",
    children: [
      {
        name: "",
        type: "flat",
        files: [
          { name: "tsconfig.json",      size: "0.9 KB", modified: "2026-03-15", desc: "TypeScript strict config",       preview: `{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "NodeNext",\n    "moduleResolution": "NodeNext",\n    "strict": true,\n    "esModuleInterop": true,\n    "skipLibCheck": true,\n    "paths": { "@/*": ["./src/*"] },\n    "outDir": "./dist"\n  },\n  "include": ["src/**/*", "tests/**/*"],\n  "exclude": ["node_modules", "dist"]\n}` },
          { name: "package.json",       size: "2.1 KB", modified: "2026-04-03", desc: "Node dependencies & scripts",   preview: `{\n  "name": "@livestreamlab/api",\n  "version": "1.4.0",\n  "scripts": {\n    "dev":           "tsx watch src/index.ts",\n    "build":         "tsc",\n    "start":         "node dist/index.js",\n    "test":          "vitest run",\n    "test:watch":    "vitest",\n    "lint":          "eslint src/ tests/",\n    "format":        "prettier --write .",\n    "db:migrate":    "prisma migrate deploy",\n    "db:seed":       "tsx db/seeds/index.ts"\n  },\n  "dependencies": {\n    "express": "^4.18",\n    "jsonwebtoken": "^9",\n    "bcryptjs": "^2.4",\n    "zod": "^3",\n    "pino": "^8",\n    "@prisma/client": "^5"\n  },\n  "devDependencies": {\n    "vitest": "^1",\n    "supertest": "^6",\n    "prisma": "^5"\n  }\n}` },
          { name: ".env.example",       size: "0.6 KB", modified: "2026-03-15", desc: "Required env vars template",    preview: `# Application\nJWT_SECRET=change-me\nPORT=8080\nNODE_ENV=development\nLOG_LEVEL=info\n\n# Database\nDATABASE_URL=postgres://dev:dev@localhost:5432/livestreamlab\nTEST_DATABASE_URL=postgres://dev:dev@localhost:5432/livestreamlab_test\n\n# Storage\nAWS_REGION=us-east-1\nBUCKET=livestreamlab-media\nCDN_HOST=cdn.livestreamlab.live\n\n# Cache\nREDIS_URL=redis://localhost:6379\n\n# Trident Engines (private — never commit real values)\nOMEGA_HOST=omega-engine:443\nAEGIS_HOST=aegis-engine:443\nOVERWATCH_HOST=overwatch-engine:443` },
          { name: "docker-compose.yml", size: "1.6 KB", modified: "2026-04-02", desc: "Local dev stack",              preview: `version: '3.9'\nservices:\n  api:\n    build: .\n    ports: ['8080:8080']\n    depends_on: [db, redis]\n    environment:\n      DATABASE_URL: postgres://dev:dev@db:5432/livestreamlab\n      REDIS_URL: redis://redis:6379\n      JWT_SECRET: local-dev-secret\n    volumes:\n      - ./src:/app/src  # hot reload\n\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_USER: dev\n      POSTGRES_PASSWORD: dev\n      POSTGRES_DB: livestreamlab\n    ports: ['5432:5432']\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n\n  redis:\n    image: redis:7-alpine\n    ports: ['6379:6379']\n\nvolumes:\n  pgdata:` },
          { name: ".eslintrc.json",     size: "0.8 KB", modified: "2026-03-15", desc: "ESLint config",                preview: `{\n  "extends": [\n    "eslint:recommended",\n    "plugin:@typescript-eslint/recommended"\n  ],\n  "parser": "@typescript-eslint/parser",\n  "plugins": ["@typescript-eslint"],\n  "rules": {\n    "no-console": ["warn", { "allow": ["warn", "error"] }],\n    "@typescript-eslint/no-explicit-any": "error",\n    "@typescript-eslint/explicit-function-return-type": "off"\n  },\n  "ignorePatterns": ["dist/", "node_modules/"]\n}` },
          { name: ".prettierrc",        size: "0.3 KB", modified: "2026-03-15", desc: "Prettier formatting config",   preview: `{\n  "semi": true,\n  "singleQuote": true,\n  "tabWidth": 2,\n  "trailingComma": "all",\n  "printWidth": 100,\n  "arrowParens": "avoid"\n}` },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function getFileIcon(name) {
  if (name.endsWith(".json") || name.endsWith(".prisma")) return <FileJson className="w-3.5 h-3.5 text-chart-3 shrink-0" />;
  if (name.endsWith(".ts") || name.endsWith(".tsx"))       return <FileCode2 className="w-3.5 h-3.5 text-primary shrink-0" />;
  if (name.endsWith(".yml") || name.endsWith(".yaml"))     return <FileText className="w-3.5 h-3.5 text-accent shrink-0" />;
  if (name.endsWith(".tf"))  return <FileCode2 className="w-3.5 h-3.5 text-chart-2 shrink-0" />;
  if (name.endsWith(".sh"))  return <Terminal className="w-3.5 h-3.5 text-chart-3 shrink-0" />;
  if (name.endsWith(".md"))  return <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
  if (name.endsWith(".sql")) return <Database className="w-3.5 h-3.5 text-chart-4 shrink-0" />;
  if (name.startsWith("."))  return <Shield className="w-3.5 h-3.5 text-chart-4 shrink-0" />;
  return <File className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE ROW
// ─────────────────────────────────────────────────────────────────────────────
function FileRow({ file, depth = 0 }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <div>
      <div
        style={{ paddingLeft: depth * 16 }}
        className="group flex items-center gap-2 py-1 px-2 -mx-2 rounded-lg hover:bg-secondary/60 cursor-pointer transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        {getFileIcon(file.name)}
        <span className="text-xs font-mono text-foreground flex-1">{file.name}</span>
        <span className="text-xs text-muted-foreground/50 hidden sm:block truncate max-w-[240px]">{file.desc}</span>
        <span className="text-xs text-muted-foreground/40 hidden md:flex items-center gap-1 ml-2 shrink-0">
          <HardDrive className="w-2.5 h-2.5" />{file.size}
        </span>
        <span className="text-xs text-muted-foreground/30 hidden lg:flex items-center gap-1 ml-2 shrink-0">
          <Clock className="w-2.5 h-2.5" />{file.modified}
        </span>
        <Eye className="w-3.5 h-3.5 text-muted-foreground ml-2 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
      </div>

      {open && (
        <div style={{ marginLeft: depth * 16 }} className="mt-1 mb-2 bg-background border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/40">
            <div className="flex items-center gap-2 min-w-0">
              {getFileIcon(file.name)}
              <span className="text-xs font-mono text-foreground truncate">{file.name}</span>
              <Badge className="text-xs border bg-secondary text-muted-foreground border-border shrink-0">{file.size}</Badge>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(file.preview); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-2">
              {copied ? <Check className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <pre className="text-xs font-mono text-foreground/75 p-3 overflow-x-auto leading-relaxed whitespace-pre">{file.preview}</pre>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOLDER NODE
// ─────────────────────────────────────────────────────────────────────────────
function FolderNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(depth < 1);

  if (node.type === "flat") return <div>{node.files?.map((f, i) => <FileRow key={i} file={f} depth={depth} />)}</div>;
  if (node.type === "file") return <FileRow file={node.fileData} depth={depth} />;

  const isEngine = node.isEngine;

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ paddingLeft: depth * 16 }}
        className="flex items-center gap-2 py-1.5 w-full text-left hover:bg-secondary/40 rounded-lg px-2 -mx-2 transition-colors"
      >
        {open
          ? <FolderOpen className={`w-3.5 h-3.5 shrink-0 ${isEngine ? "text-destructive" : "text-chart-3"}`} />
          : <Folder    className={`w-3.5 h-3.5 shrink-0 ${isEngine ? "text-destructive" : "text-chart-3"}`} />}
        <span className={`text-xs font-mono font-semibold ${isEngine ? "text-destructive" : "text-foreground"}`}>{node.name}</span>
        {node.badge && <Badge className={`text-[10px] border py-0 px-1.5 ml-0.5 ${node.badgeColor}`}>{node.badge}</Badge>}
        {node.desc && <span className="text-xs text-muted-foreground/50 hidden sm:block ml-1 truncate max-w-xs">— {node.desc}</span>}
        <span className="ml-auto">
          {open ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
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

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function FileStructureTab() {
  const [search, setSearch] = useState("");

  // Flatten all files for search
  const allFiles = [];
  const collect = (nodes) => {
    for (const n of nodes) {
      if (n.type === "file" && n.fileData) allFiles.push(n.fileData);
      if (n.files) n.files.forEach(f => allFiles.push(f));
      if (n.children) collect(n.children);
    }
  };
  FILE_TREE.forEach(root => root.children && collect(root.children));

  const results = search.trim()
    ? allFiles.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.desc.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  const totalSize = allFiles.reduce((acc, f) => acc + (parseFloat(f.size) || 0), 0);

  const STATS = [
    { label: "Total Files",     value: allFiles.length,             color: "text-primary",      Icon: FileCode2 },
    { label: "Source Size",     value: `${totalSize.toFixed(0)} KB`,color: "text-chart-3",      Icon: HardDrive },
    { label: "DB Migrations",   value: "8",                         color: "text-chart-4",      Icon: Database },
    { label: "CI/CD Workflows", value: "4",                         color: "text-accent",       Icon: GitBranch },
    { label: "Test Files",      value: "13",                        color: "text-chart-2",      Icon: TestTube },
    { label: "Engine Façades",  value: "3",                         color: "text-destructive",  Icon: Shield },
  ];

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STATS.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <s.Icon className={`w-3.5 h-3.5 ${s.color}`} />
              <p className="text-[11px] text-muted-foreground leading-tight">{s.label}</p>
            </div>
            <p className="text-lg font-bold font-display text-foreground">{s.value}</p>
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs">✕</button>
        )}
      </div>

      {/* Tree */}
      <div className="bg-card border border-border rounded-2xl p-5">
        {results ? (
          <div>
            <p className="text-xs text-muted-foreground mb-3">
              {results.length} result{results.length !== 1 ? "s" : ""} for <span className="text-foreground font-medium">"{search}"</span>
            </p>
            {results.length === 0
              ? <p className="text-sm text-muted-foreground text-center py-8">No files matched.</p>
              : results.map((f, i) => <FileRow key={i} file={f} depth={0} />)}
          </div>
        ) : (
          <div className="space-y-4">
            {FILE_TREE.map((root, i) => {
              const RootIcon = root.rootIcon || FolderOpen;
              return (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
                    <RootIcon className={`w-4 h-4 ${root.rootColor || "text-muted-foreground"}`} />
                    <span className="text-xs font-mono font-bold text-foreground">{root.name}</span>
                  </div>
                  {root.children?.map((child, j) => <FolderNode key={j} node={child} depth={0} />)}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground px-1">
        {[
          { dot: "bg-primary",     label: ".ts — TypeScript" },
          { dot: "bg-chart-4",     label: ".sql — Migrations" },
          { dot: "bg-chart-3",     label: ".json / Prisma" },
          { dot: "bg-accent",      label: ".yml — CI/CD" },
          { dot: "bg-chart-2",     label: ".tf — Terraform" },
          { dot: "bg-destructive", label: "engines/ — Private façade" },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${item.dot}`} />
            {item.label}
          </div>
        ))}
        <span className="ml-auto opacity-60">Click any file to preview its code</span>
      </div>
    </div>
  );
}