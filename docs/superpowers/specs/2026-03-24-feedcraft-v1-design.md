# FeedCraft v1 — Product Catalog Creative Automation

**Date:** 2026-03-24
**Status:** Approved
**Repo:** `D:/FeedCraft/` → https://github.com/MischieS/FeedCraft

---

## 1. Product Vision

**One sentence:** Turn any product feed into branded, template-based creatives and publish them directly to Meta product catalogs.

**Problem:** E-commerce businesses spend hours manually creating product images for ads and catalogs. Tools like Canva aren't built for bulk operations. Confect.io charges €199+/mo and targets enterprise. Turkish market has zero native alternatives.

**Target users:** Turkish e-commerce operators (Shopify, WooCommerce, manual CSV), digital marketing agencies managing multiple brands, MegVax users who want automated creative generation alongside ad management.

**Core loop:**
```
Import Feed → Build Template → Bulk Render → Publish to Meta Catalog
```

**Relationship to MegVax:** FeedCraft is a standalone product with its own auth, billing, and domain. MegVax users get a deep integration (shared Meta connection, creative library access from MegVax dashboard). API-level integration, not code-level.

---

## 2. Architecture

### System Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Next.js 16  │────▶│  NestJS 11   │────▶│  PostgreSQL   │
│  (Vercel)    │     │  (Railway)   │     │  (Neon)       │
│              │     │              │     └──────────────┘
│  - Landing   │     │  - REST API  │
│  - Dashboard │     │  - Auth      │            │
│  - Template  │     │  - Feeds     │     ┌──────────────┐
│    Builder   │     │  - Templates │     │  Redis        │
│  - Gallery   │     │  - Creatives │     │  (Upstash)    │
└──────────────┘     │  - Meta API  │     └──────────────┘
                     └──────┬───────┘            │
                            │              ┌─────┴────────┐
                     ┌──────▼───────┐      │  BullMQ      │
                     │  Worker      │◀─────│  Queues       │
                     │  (Railway)   │      └──────────────┘
                     │              │
                     │  - Puppeteer │     ┌──────────────┐
                     │    HTML→PNG  │────▶│  S3 / MinIO   │
                     │  - Bulk jobs │     │  (Storage)    │
                     └──────────────┘     └──────────────┘
```

### Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 16, React 19, Tailwind v4 | Same as MegVax — shared knowledge |
| Backend API | NestJS 11 | Same as MegVax — shared patterns |
| Database | PostgreSQL (Neon Pro) | Shared Neon instance, separate database |
| Cache/Queues | Redis (Upstash Pro) | BullMQ for render jobs |
| Worker | Node.js + Puppeteer + BullMQ | HTML→PNG rendering at scale |
| Storage | S3-compatible (MinIO dev, AWS S3 prod) | Creative asset storage |
| Template Editor | Konva.js (React-Konva) | Canvas-based layer editor |
| Auth | JWT (RS256, access+refresh) | Same pattern as MegVax |
| Hosting | Railway (API + Worker), Vercel (Frontend) | Same as MegVax |

### Monorepo Structure

```
D:/FeedCraft/
├── apps/
│   ├── api/                    # NestJS 11 backend
│   │   ├── src/
│   │   │   ├── auth/           # JWT auth module
│   │   │   ├── users/          # User management
│   │   │   ├── workspaces/     # Multi-tenant workspaces
│   │   │   ├── feeds/          # Feed import & sync
│   │   │   ├── products/       # Product data management
│   │   │   ├── templates/      # Template CRUD
│   │   │   ├── creatives/      # Creative management
│   │   │   ├── render/         # Render job dispatch
│   │   │   ├── storage/        # S3/MinIO abstraction
│   │   │   ├── meta/           # Meta Graph API integration
│   │   │   └── common/         # Guards, decorators, filters
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   ├── worker/                 # BullMQ render worker
│   │   ├── src/
│   │   │   ├── renderer.ts     # Puppeteer HTML→PNG
│   │   │   ├── processor.ts    # Job processor
│   │   │   └── uploader.ts     # S3 upload
│   │   └── package.json
│   └── web/                    # Next.js 16 frontend
│       ├── app/
│       │   ├── page.tsx        # Landing page
│       │   ├── login/
│       │   ├── signup/
│       │   └── app/            # Dashboard (authed)
│       │       ├── page.tsx    # Dashboard home
│       │       ├── feeds/      # Feed management
│       │       ├── templates/  # Template list + builder
│       │       ├── creatives/  # Creative gallery
│       │       ├── publish/    # Meta catalog publish
│       │       └── settings/   # Workspace settings
│       ├── components/
│       │   ├── ui/             # Shared UI components
│       │   ├── editor/         # Konva template editor
│       │   ├── marketing/      # Landing page components
│       │   └── layouts/        # Dashboard layout
│       ├── lib/
│       │   ├── api.ts          # API client
│       │   ├── auth.ts         # Auth utilities
│       │   └── utils.ts        # Helpers
│       └── package.json
├── packages/
│   └── shared/                 # Shared types & constants
│       ├── src/
│       │   ├── types.ts        # TemplateLayer, DynamicRule, etc.
│       │   ├── constants.ts    # Formats, limits, system fields
│       │   └── helpers.ts      # evaluateLayerRules, resolveLayerContent
│       └── package.json
├── turbo.json
├── package.json
├── .env.example
└── CLAUDE.md
```

---

## 3. Data Model

### Core Entities

```prisma
// ─── Auth & Tenancy ───

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  name          String?
  avatarUrl     String?
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  memberships   WorkspaceMember[]
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model Workspace {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  plan      PlanTier @default(FREE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  members         WorkspaceMember[]
  feeds           Feed[]
  templates       Template[]
  renderJobs      RenderJob[]
  metaConnections MetaConnection[]
}

model WorkspaceMember {
  id          String     @id @default(cuid())
  userId      String
  workspaceId String
  role        MemberRole @default(MEMBER)
  createdAt   DateTime   @default(now())

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([userId, workspaceId])
}

// ─── Feed & Products ───

model Feed {
  id          String     @id @default(cuid())
  workspaceId String
  name        String
  type        FeedType
  sourceUrl   String?    // CSV URL, Shopify store URL, WooCommerce URL
  apiKey      String?    // Encrypted — for Shopify/WooCommerce
  apiSecret   String?    // Encrypted
  status      FeedStatus @default(PENDING)
  lastSyncAt  DateTime?
  syncError   String?
  fieldMapping Json?     // Maps source fields to system fields
  productCount Int       @default(0)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  products  Product[]
}

model Product {
  id           String   @id @default(cuid())
  feedId       String
  externalId   String   // Product ID from source
  title        String
  description  String?
  price        Float
  comparePrice Float?   // Original price (for sale display)
  currency     String   @default("TRY")
  imageUrl     String?  // Primary product image
  images       Json?    // Array of additional image URLs
  category     String?
  brand        String?
  sku          String?
  inStock      Boolean  @default(true)
  customFields Json?    // Any extra fields from feed
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  feed      Feed       @relation(fields: [feedId], references: [id], onDelete: Cascade)
  creatives Creative[]

  @@unique([feedId, externalId])
}

// ─── Templates ───

model Template {
  id          String          @id @default(cuid())
  workspaceId String
  name        String
  format      CreativeFormat  @default(SQUARE)
  width       Int
  height      Int
  version     Int             @default(1)
  config      Json            // LayerTemplateConfig: { version, backgroundColor, layers[] }
  thumbnail   String?         // S3 URL of template preview
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  workspace  Workspace   @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  renderJobs RenderJob[]
}

// ─── Rendering ───

model RenderJob {
  id          String       @id @default(cuid())
  workspaceId String
  templateId  String
  feedId      String?      // If rendering from a feed
  status      RenderStatus @default(QUEUED)
  totalCount  Int          @default(0)
  doneCount   Int          @default(0)
  failedCount Int          @default(0)
  startedAt   DateTime?
  finishedAt  DateTime?
  error       String?
  createdAt   DateTime     @default(now())

  workspace Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  template  Template   @relation(fields: [templateId], references: [id])
  creatives Creative[]
}

model Creative {
  id          String         @id @default(cuid())
  renderJobId String
  productId   String?
  imageUrl    String         // S3 URL of rendered image
  width       Int
  height      Int
  format      CreativeFormat
  fileSize    Int?           // Bytes
  status      CreativeStatus @default(PENDING)
  error       String?
  metadata    Json?          // Render params snapshot
  createdAt   DateTime       @default(now())

  renderJob RenderJob @relation(fields: [renderJobId], references: [id], onDelete: Cascade)
  product   Product?  @relation(fields: [productId], references: [id])
}

// ─── Meta Integration ───

model MetaConnection {
  id           String   @id @default(cuid())
  workspaceId  String
  accessToken  String   // Encrypted
  userId       String   // Meta user ID
  userName     String?
  catalogId    String?  // Selected catalog ID
  catalogName  String?
  tokenExpiry  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
}

// ─── Enums ───

enum PlanTier {
  FREE
  PRO
  AGENCY
}

enum MemberRole {
  OWNER
  ADMIN
  MEMBER
}

enum FeedType {
  CSV
  SHOPIFY
  WOOCOMMERCE
  MANUAL
}

enum FeedStatus {
  PENDING
  SYNCING
  ACTIVE
  ERROR
}

enum CreativeFormat {
  SQUARE      // 1080x1080
  PORTRAIT    // 1080x1350
  STORY       // 1080x1920
  LANDSCAPE   // 1200x628
}

enum RenderStatus {
  QUEUED
  PROCESSING
  COMPLETED
  FAILED
}

enum CreativeStatus {
  PENDING
  RENDERED
  PUBLISHED
  FAILED
}
```

### Key Relationships

- User → many Workspaces (via WorkspaceMember)
- Workspace → many Feeds → many Products
- Workspace → many Templates
- Template + Feed → RenderJob → many Creatives
- Creative → one Product (optional, for non-product creatives)
- Workspace → MetaConnection (for catalog publish)

---

## 4. Shared Types (packages/shared)

```typescript
// ─── Creative Formats ───

export const CREATIVE_FORMATS = {
  SQUARE:    { width: 1080, height: 1080, label: 'Kare (1:1)' },
  PORTRAIT:  { width: 1080, height: 1350, label: 'Portre (4:5)' },
  STORY:     { width: 1080, height: 1920, label: 'Story (9:16)' },
  LANDSCAPE: { width: 1200, height: 628,  label: 'Yatay (1.91:1)' },
} as const;

// ─── Plan Limits ───

export const PLAN_LIMITS = {
  FREE:   { products: 50,    renders: 100,    templates: 3,  feeds: 1  },
  PRO:    { products: 5000,  renders: 10000,  templates: 50, feeds: 10 },
  AGENCY: { products: Infinity, renders: Infinity, templates: Infinity, feeds: Infinity },
} as const;

// ─── System Fields (product data binding) ───

export const SYSTEM_FIELDS = [
  'product_id',
  'product_title',
  'product_description',
  'product_price',
  'product_compare_price',
  'product_currency',
  'product_image',
  'product_category',
  'product_brand',
  'product_sku',
] as const;

// ─── Layer Types ───

export type LayerType = 'text' | 'image' | 'product_image' | 'shape';

export interface TemplateLayer {
  id: string;
  type: LayerType;
  name: string;
  visible: boolean;
  locked: boolean;

  // Position & size (percentage-based for responsive rendering)
  x: number;      // 0-100
  y: number;      // 0-100
  width: number;  // 0-100
  height: number; // 0-100
  rotation: number;
  zIndex: number;
  opacity: number; // 0-1

  // Text properties
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  textDecoration?: 'none' | 'underline' | 'line-through';
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';

  // Image properties
  imageUrl?: string;
  imageFit?: 'contain' | 'cover' | 'fill';

  // Shape properties
  shapeType?: 'rectangle' | 'circle' | 'ellipse';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;

  // Data binding
  binding?: string;         // e.g., 'product_title', 'product_price'
  bindingFormat?: string;   // e.g., '{{value}} TL', '%{{value}} İndirim'

  // Effects
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };

  // Dynamic visibility rules
  dynamicRules?: DynamicRule[];
}

export interface DynamicRule {
  field: string;          // Product field to check
  condition: 'has_value' | 'no_value' | 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value?: string | number;
  action: 'show' | 'hide';
}

export interface LayerTemplateConfig {
  version: 2;
  backgroundColor: string;
  layers: TemplateLayer[];
}

// ─── Helper Functions ───

export function evaluateLayerRules(layer: TemplateLayer, product: Record<string, any>): boolean {
  if (!layer.dynamicRules?.length) return layer.visible;

  return layer.dynamicRules.every(rule => {
    const fieldValue = product[rule.field];
    let result: boolean;

    switch (rule.condition) {
      case 'has_value':    result = fieldValue != null && fieldValue !== ''; break;
      case 'no_value':     result = fieldValue == null || fieldValue === ''; break;
      case 'equals':       result = String(fieldValue) === String(rule.value); break;
      case 'not_equals':   result = String(fieldValue) !== String(rule.value); break;
      case 'greater_than': result = Number(fieldValue) > Number(rule.value); break;
      case 'less_than':    result = Number(fieldValue) < Number(rule.value); break;
      case 'contains':     result = String(fieldValue).includes(String(rule.value)); break;
      default:             result = true;
    }

    return rule.action === 'show' ? result : !result;
  });
}

export function resolveLayerContent(layer: TemplateLayer, product: Record<string, any>): string {
  if (!layer.binding) return layer.text || '';

  const value = product[layer.binding];
  if (value == null) return '';

  if (layer.bindingFormat) {
    return layer.bindingFormat.replace('{{value}}', String(value));
  }

  return String(value);
}
```

---

## 5. API Endpoints

### Auth

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, returns access+refresh tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Revoke refresh token |
| GET | `/auth/me` | Get current user |

### Workspaces

| Method | Path | Description |
|---|---|---|
| POST | `/workspaces` | Create workspace |
| GET | `/workspaces` | List user's workspaces |
| GET | `/workspaces/:id` | Get workspace details |
| PATCH | `/workspaces/:id` | Update workspace |
| POST | `/workspaces/:id/members` | Invite member |
| DELETE | `/workspaces/:id/members/:memberId` | Remove member |

### Feeds

| Method | Path | Description |
|---|---|---|
| POST | `/feeds` | Create feed (CSV upload, Shopify/WooCommerce connect) |
| GET | `/feeds` | List workspace feeds |
| GET | `/feeds/:id` | Get feed with stats |
| PATCH | `/feeds/:id` | Update feed config |
| DELETE | `/feeds/:id` | Delete feed and products |
| POST | `/feeds/:id/sync` | Trigger feed sync |
| GET | `/feeds/:id/products` | List products (paginated, searchable) |
| GET | `/feeds/:id/products/:productId` | Get single product |
| PUT | `/feeds/:id/mapping` | Update field mapping |

**Feed Import Logic:**
- **CSV:** Upload file → parse headers → user maps columns to system fields → import products
- **Shopify:** Enter store URL + API key → fetch products via Shopify Admin API → auto-map fields
- **WooCommerce:** Enter store URL + consumer key/secret → fetch via WC REST API → auto-map fields
- **Sync:** Re-fetch from source, update existing products (match by externalId), add new, mark removed

### Templates

| Method | Path | Description |
|---|---|---|
| POST | `/templates` | Create template (with default layers) |
| GET | `/templates` | List workspace templates |
| GET | `/templates/:id` | Get template with full config |
| PATCH | `/templates/:id` | Update template (name, format) |
| PUT | `/templates/:id/config` | Save template layer config |
| DELETE | `/templates/:id` | Delete template |
| POST | `/templates/:id/preview` | Render single preview with sample product |
| POST | `/templates/:id/duplicate` | Duplicate template |

### Render Jobs

| Method | Path | Description |
|---|---|---|
| POST | `/render` | Start bulk render (templateId + feedId + optional productIds) |
| GET | `/render` | List render jobs |
| GET | `/render/:id` | Get job status + progress |
| DELETE | `/render/:id` | Cancel queued/processing job |

### Creatives

| Method | Path | Description |
|---|---|---|
| GET | `/creatives` | List creatives (filterable by job, product, status) |
| GET | `/creatives/:id` | Get creative details |
| DELETE | `/creatives/:id` | Delete creative |
| POST | `/creatives/bulk-delete` | Delete multiple creatives |
| GET | `/creatives/:id/download` | Download creative image |
| POST | `/creatives/bulk-download` | Download as ZIP |

### Meta Integration

| Method | Path | Description |
|---|---|---|
| POST | `/meta/connect` | Start OAuth flow for Meta Business |
| GET | `/meta/callback` | OAuth callback |
| GET | `/meta/catalogs` | List available catalogs |
| POST | `/meta/catalogs/:catalogId/select` | Select catalog for workspace |
| POST | `/meta/publish` | Publish creatives to selected catalog |
| GET | `/meta/publish/:jobId` | Get publish job status |
| DELETE | `/meta/disconnect` | Disconnect Meta account |

**Meta Catalog Publish Flow:**
1. User connects Meta Business account via OAuth
2. App fetches available product catalogs via Graph API
3. User selects target catalog
4. On publish: match creatives to products by externalId → update catalog items with custom_image_url via Batch API
5. Track publish status per creative (PENDING → PUBLISHED / FAILED)

---

## 6. Rendering Pipeline

### Architecture

```
Client clicks "Render All"
         │
         ▼
   API: POST /render
   { templateId, feedId }
         │
         ▼
   Create RenderJob (QUEUED)
   Fetch products from feed
   For each product → enqueue BullMQ job
         │
         ▼
   Worker picks up jobs from queue
   For each job:
     1. Load template config (layers)
     2. Load product data
     3. Evaluate dynamic rules → filter layers
     4. Resolve bindings → inject product data
     5. Compile HTML template (Handlebars)
     6. Launch Puppeteer → set viewport → screenshot
     7. Upload PNG to S3
     8. Create Creative record
     9. Update RenderJob progress
         │
         ▼
   All done → RenderJob.status = COMPLETED
   Frontend polls /render/:id for progress
```

### HTML Template (Handlebars)

The renderer compiles a Handlebars template that positions layers using absolute CSS:

```html
<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: {{width}}px; height: {{height}}px; overflow: hidden; }
  .canvas { position: relative; width: 100%; height: 100%; background: {{backgroundColor}}; }
  .layer { position: absolute; }
</style>
</head>
<body>
<div class="canvas">
  {{#each layers}}
  <div class="layer" style="
    left: {{pct this.x ../width}}px;
    top: {{pct this.y ../height}}px;
    width: {{pct this.width ../width}}px;
    height: {{pct this.height ../height}}px;
    z-index: {{this.zIndex}};
    opacity: {{this.opacity}};
    transform: rotate({{this.rotation}}deg);
    {{#if this.shadow}}box-shadow: {{this.shadow.offsetX}}px {{this.shadow.offsetY}}px {{this.shadow.blur}}px {{this.shadow.color}};{{/if}}
  ">
    {{#if (eq this.type "text")}}
      <div style="
        font-family: '{{this.fontFamily}}', sans-serif;
        font-size: {{this.fontSize}}px;
        font-weight: {{this.fontWeight}};
        color: {{this.color}};
        text-align: {{this.textAlign}};
        line-height: {{this.lineHeight}};
        letter-spacing: {{this.letterSpacing}}px;
        text-transform: {{this.textTransform}};
        width: 100%; height: 100%;
        display: flex; align-items: center;
        {{#if this.fontStyle}}font-style: {{this.fontStyle}};{{/if}}
      ">{{this.resolvedText}}</div>
    {{/if}}
    {{#if (eq this.type "product_image")}}
      <img src="{{this.resolvedImageUrl}}" style="width:100%;height:100%;object-fit:{{this.imageFit}};" />
    {{/if}}
    {{#if (eq this.type "image")}}
      <img src="{{this.imageUrl}}" style="width:100%;height:100%;object-fit:{{this.imageFit}};" />
    {{/if}}
    {{#if (eq this.type "shape")}}
      <div style="
        width: 100%; height: 100%;
        background: {{this.fill}};
        {{#if this.stroke}}border: {{this.strokeWidth}}px solid {{this.stroke}};{{/if}}
        {{#if this.borderRadius}}border-radius: {{this.borderRadius}}px;{{/if}}
        {{#if (eq this.shapeType "circle")}}border-radius: 50%;{{/if}}
      "></div>
    {{/if}}
  </div>
  {{/each}}
</div>
</body>
</html>
```

### Puppeteer Renderer

```typescript
// Singleton browser instance
let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });
  }
  return browser;
}

async function renderCreative(input: {
  template: LayerTemplateConfig;
  product: Record<string, any>;
  width: number;
  height: number;
}): Promise<Buffer> {
  const { template, product, width, height } = input;

  // 1. Filter layers by dynamic rules
  const visibleLayers = template.layers
    .filter(l => evaluateLayerRules(l, product))
    .map(l => ({
      ...l,
      resolvedText: l.type === 'text' ? resolveLayerContent(l, product) : undefined,
      resolvedImageUrl: l.type === 'product_image' ? product[l.binding || 'product_image'] : undefined,
    }));

  // 2. Compile HTML
  const html = compiledTemplate({
    width, height,
    backgroundColor: template.backgroundColor,
    layers: visibleLayers
  });

  // 3. Render
  const b = await getBrowser();
  const page = await b.newPage();
  await page.setViewport({ width, height });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const buffer = await page.screenshot({ type: 'png' });
  await page.close();

  return buffer;
}
```

### Performance Targets

| Metric | Target |
|---|---|
| Single render | < 3s |
| Batch of 100 | < 2 min |
| Concurrent workers | 4 per Railway instance |
| Max image size | 1080x1920 (Story) |

---

## 7. Template Builder (Konva.js)

### Editor Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Templates    Template Name    [Preview] [Save]   │
├──────────┬──────────────────────────────┬───────────────────┤
│          │                              │                   │
│  Layers  │        Canvas               │  Properties       │
│  Panel   │        (Konva Stage)        │  Panel            │
│          │                              │                   │
│  □ Title │   ┌──────────────────┐      │  Position         │
│  □ Price │   │                  │      │  x: [___] y:[___] │
│  □ Image │   │   Product Image  │      │  w: [___] h:[___] │
│  □ Badge │   │                  │      │                   │
│  □ BG    │   │   Product Title  │      │  Text             │
│          │   │   ₺99.90         │      │  Font: [________] │
│          │   │                  │      │  Size: [___]      │
│          │   │   [SALE]         │      │  Color: [___]     │
│          │   │                  │      │                   │
│  [+ Add] │   └──────────────────┘      │  Binding          │
│          │                              │  Field: [v]       │
│          │   Format: [1080x1080 ▾]     │  Format: [___]    │
│          │   Zoom: [- 80% +]           │                   │
│          │   Product: [Sample ▾]       │  Rules            │
│          │                              │  [+ Add Rule]     │
├──────────┴──────────────────────────────┴───────────────────┤
│  Toolbar: [Text] [Image] [Shape] [Product Image] | [Undo] [Redo] │
└─────────────────────────────────────────────────────────────┘
```

### Key Features

1. **Layer panel** — drag to reorder (z-index), toggle visibility, lock/unlock, rename
2. **Canvas** — Konva Stage with Transformer for drag/resize/rotate
3. **Properties panel** — context-sensitive: shows relevant props for selected layer type
4. **Data binding** — dropdown of system fields + custom fields from feed
5. **Binding format** — template string like `{{value}} TL` or `%{{value}} İndirim`
6. **Dynamic rules** — show/hide layers based on product data (e.g., show "SALE" badge only if compare_price exists)
7. **Live preview** — switch between sample products to see how binding looks
8. **Format switcher** — change canvas size (keeps layer percentages)
9. **Undo/redo** — command pattern stack
10. **Auto-save** — debounced save to API on config change

### Layer Types

| Type | What it renders | Configurable |
|---|---|---|
| `text` | Static or data-bound text | Font, size, color, weight, alignment, binding, format |
| `image` | Static uploaded image | URL, fit mode |
| `product_image` | Product's image from feed | Binding (which image field), fit mode |
| `shape` | Rectangle, circle, ellipse | Fill, stroke, border radius |

---

## 8. Meta Catalog Integration

### OAuth Flow

1. Frontend redirects to Meta Login Dialog:
   ```
   https://www.facebook.com/v21.0/dialog/oauth?
     client_id={APP_ID}&
     redirect_uri={CALLBACK_URL}&
     scope=catalog_management,business_management&
     state={CSRF_TOKEN}
   ```

2. Callback receives auth code → exchange for long-lived access token

3. Fetch catalogs:
   ```
   GET /me/businesses?fields=product_catalogs{name,product_count}
   ```

4. User selects target catalog

### Publish Flow

```
POST /meta/publish
{ creativeIds: [...], catalogId: "..." }
```

1. For each creative with a linked product:
   - Find product's `externalId` (maps to retailer_id in Meta catalog)
   - Upload creative image to a public URL (S3)
   - Update catalog item via Batch API:
     ```
     POST /{catalog_id}/items_batch
     {
       "requests": [{
         "method": "UPDATE",
         "retailer_id": "{product.externalId}",
         "data": {
           "additional_image_urls": ["{creative.imageUrl}"],
           "image_url": "{creative.imageUrl}"  // optionally replace main image
         }
       }]
     }
     ```

2. Track batch handle → poll for completion
3. Update creative status: PUBLISHED or FAILED with error

### Permissions Required

- `catalog_management` — read/write product catalogs
- `business_management` — access business assets

---

## 9. Frontend Pages

### Landing Page (`/`)

Same design language as MegVax — dark, bold, Space Grotesk headings. But FeedCraft-specific:

```
Nav → Hero → WhatItDoes → HowItWorks → Pricing → CTA → Footer
```

- Hero: "Ürün Görsellerinizi Otomatikleştirin." + template builder screenshot
- WhatItDoes: 3 cards (Feed Import, Template Builder, Bulk Publish)
- HowItWorks: 3 steps (Feed Bağla → Şablon Oluştur → Yayınla)
- Pricing: 3 tiers (Free, Pro ₺299/ay, Agency ₺999/ay)

### Auth Pages

- `/login` — email + password
- `/signup` — name + email + password
- `/forgot-password` — email input → reset flow

### Dashboard (`/app`)

- `/app` — Overview: recent renders, active feeds, template count, usage stats
- `/app/feeds` — Feed list, add new (CSV/Shopify/WooCommerce), sync status
- `/app/feeds/[id]` — Feed detail: products table (paginated), field mapping, sync controls
- `/app/templates` — Template grid (thumbnails), create new, duplicate, delete
- `/app/templates/[id]` — Full Konva editor (see section 7)
- `/app/creatives` — Creative gallery: grid view, filter by job/feed/status, bulk select, download, delete
- `/app/publish` — Meta connection status, catalog selection, publish selected creatives
- `/app/settings` — Workspace name, members, plan, billing

### Key UX Patterns

- **Empty states everywhere** — "No feeds yet. Import your first product feed." with action button
- **Loading skeletons** — not spinners
- **Optimistic updates** — delete, rename, toggle actions
- **Real-time progress** — render job progress bar with polling
- **Keyboard shortcuts** — in template editor (Del, Ctrl+Z, Ctrl+Shift+Z, Ctrl+S, Ctrl+D)
- **Responsive** — dashboard works on tablet, template editor desktop-only with warning on mobile

---

## 10. i18n

Turkish default, English secondary. Same pattern as MegVax: `messages/tr.json`, `messages/en.json`, `useTranslations()` hook.

Key namespaces:
- `common.*` — shared labels (save, cancel, delete, loading)
- `landing.*` — landing page content
- `auth.*` — login/signup forms
- `feeds.*` — feed management
- `templates.*` — template builder
- `creatives.*` — creative gallery
- `publish.*` — Meta publish flow
- `settings.*` — workspace settings

---

## 11. What Does NOT Change

- MegVax codebase — untouched
- MegVax database — separate database on same Neon instance
- MegVax API — no code changes needed for v1

### Future Integration Points (v2)

- MegVax dashboard shows "FeedCraft" tab if user has both accounts
- Shared Meta connection (SSO or API key exchange)
- MegVax autopilot can trigger creative refresh via FeedCraft API
- Unified billing across both products

---

## 12. Execution Phases

### Phase 1: Foundation (this build)
1. Scaffold Turbo monorepo
2. Prisma schema + migrations
3. Auth module (register, login, refresh, JWT)
4. Workspace module (CRUD, members)
5. Feed module (CSV import, product CRUD)
6. Template module (CRUD, config storage)
7. Shared package (types, constants, helpers)

### Phase 2: Core Features
8. Template builder (Konva.js editor, all layer types)
9. Render pipeline (BullMQ worker, Puppeteer, S3 upload)
10. Creative gallery (list, filter, download)
11. Feed sync (Shopify API, WooCommerce API)

### Phase 3: Publish + Polish
12. Meta OAuth + catalog integration
13. Publish flow (batch API, status tracking)
14. Landing page
15. i18n (TR/EN)
16. Error handling, loading states, empty states

### Phase 4: Launch
17. TypeScript verification
18. Environment setup (Railway, Vercel, S3)
19. Push to GitHub
20. Documentation (README, .env.example)

---

## 13. Environment Variables

```env
# Database
DATABASE_URL=postgresql://...@neon.tech/feedcraft

# Redis
REDIS_URL=redis://...@upstash.io:6379

# Auth
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Storage (S3-compatible)
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=feedcraft-creatives
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_REGION=eu-central-1

# Meta
META_APP_ID=...
META_APP_SECRET=...
META_REDIRECT_URI=https://api.feedcraft.io/meta/callback

# App
API_URL=http://localhost:3001
WEB_URL=http://localhost:3000
WORKER_CONCURRENCY=4
```

---

## 14. Pricing Model

| Tier | Price | Products | Renders/mo | Templates | Feeds |
|---|---|---|---|---|---|
| Free | ₺0 | 50 | 100 | 3 | 1 |
| Pro | ₺299/ay | 5,000 | 10,000 | 50 | 10 |
| Agency | ₺999/ay | Unlimited | Unlimited | Unlimited | Unlimited |

Comparable to confect.io (€99-€399/mo) but positioned for Turkish market at ~30-40% lower price point.
