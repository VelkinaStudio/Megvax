# MEGVAX — API Contract (Backend Dev için)

Bu doküman, MEGVAX v1 (Meta-first) dashboard’ın backend ile konuşacağı **önerilen HTTP API kontratını** tanımlar.

- Frontend: `frontend/` (Next.js App Router)
- Backend: `backend/` (bu repo içinde; bu doküman **backend’i değiştirmez**, sadece kontratı netleştirir)
- Frontend base URL: `NEXT_PUBLIC_API_URL` (fallback: `http://localhost:4000`)

> Not: Frontend şu an bazı endpoint’leri çağırıyor (ör. `/api/meta/campaigns`). Bu kontrat, mevcut çağrılarla **uyumlu olacak şekilde** envelope formatlarını korur.

---

## 0) Genel Konvansiyonlar

### 0.1 Query parametreleri
- `accountId` (opsiyonel): Meta ad account seçimi
- `range`: `7d | 30d | custom`
- `from`, `to`: `YYYY-MM-DD` (range=`custom` için)
- `status`: `active | paused | archived | all`

### 0.2 Response şekli
- Liste endpoint’leri (kampanya/adset/ad): `{ campaigns: [...] }`, `{ adsets: [...] }`, `{ ads: [...] }`
- Overview metrikleri: `{ metrics: [...] }`
- Accounts: şimdilik frontend **array** bekliyor: `MetaAccountBackend[]` (aşağıda)

### 0.3 Hata standardı (önerilen)
- HTTP status: `4xx/5xx`
- JSON:
```json
{
  "error": {
    "code": "META_API_ERROR",
    "message": "Kullanıcıya gösterilebilir mesaj (TR)",
    "details": {}
  }
}
```

Frontend bazı yerlerde Meta API hata gövdesinden `error_user_msg` okumaya çalışıyor; mümkünse `details` içine ham Meta hatası eklenebilir.

### 0.4 Auth (v1 önerisi)
- v1 frontend şu an auth zorunlu kılmıyor (mock-first).
- Backend geldiğinde öneri:
  - User panel (`/app/*`) için cookie tabanlı session veya `Authorization: Bearer <token>`.
  - Admin (`/api/admin/*`) için ek gate (env + token). Minimum: `NEXT_PUBLIC_ADMIN_ENABLED=true` yalnızca UI gate; backend tarafında ayrıca doğrulama önerilir.

### 0.5 Pagination / cursor (özellikle Admin)
- User dashboard listeleri v1’de pagination zorunlu değil.
- Admin listeleri için öneri:
  - Query: `limit` (max 200) + `cursor` (opaque)
  - Response:
  ```json
  {
    "items": [ ... ],
    "nextCursor": "opaque_or_null"
  }
  ```

### 0.6 Idempotency (kritik POST işlemleri)
- `POST` ile varlık oluşturan endpoint’lerde opsiyonel `Idempotency-Key` header önerilir.
- Kullanım: aynı key ile tekrar gelen istek aynı sonucu döndürür (en azından “double create” riskini azaltır).

---

## 1) Types (Frontend referansı)
Bu tiplerin canonical referansı: `frontend/types/dashboard.ts`

- `KpiMetric[]`
- `Suggestion[]`
- `Campaign[]`
- `AdSet[]`
- `Ad[]`
- `InsightsSingleResponse` (önerilen)
- `OptimizationStrategy[]`
- `AutomationRule[]`
- `MetaAccount[]` (frontend iç tipi)
- `ActivityLogItem[]`

---

## 1.1) Sayfa → Endpoint Matrisi (Frontend’de fiilen kullanılan)

Bu tablo, “backend dev handoff” için en kritik kısımdır: frontend’in **bugün** beklediği/çağırdığı endpoint’leri özetler.

> Not: Birçok çağrıda dashboard context query parametreleri korunur:
> - `accountId` (veya bazı yerlerde `account`/`accountId`): Meta ad account
> - `range`: `7d | 30d | custom`
> - `from`, `to`: `YYYY-MM-DD` (range=`custom`)

| Ekran | Route | Endpoint’ler |
| --- | --- | --- |
| Genel Bakış | `/app/dashboard` | `GET /api/overview`<br/>`GET /api/overview/suggestions`<br/>`GET /api/meta/campaigns` |
| Kampanyalar/Adsetler/Reklamlar | Canonical: `/app/campaigns`<br/>Deep-link: `?focusLevel=campaign\|adset\|ad&focusId=<id>`<br/>Legacy (redirect): `/app/campaigns/{campaignId}`<br/>`/app/campaigns/{campaignId}/adsets/{adSetId}`<br/>`/app/campaigns/{campaignId}/ads/{adId}` | `GET /api/meta/campaigns`<br/>`GET /api/meta/adsets`<br/>`GET /api/meta/ads`<br/>`PATCH /api/meta/campaigns/{id}`<br/>`PATCH /api/meta/adsets/{id}`<br/>`PATCH /api/meta/ads/{id}`<br/>`POST /api/meta/campaigns/{id}/duplicate`<br/>`POST /api/meta/adsets/{id}/duplicate`<br/>`POST /api/meta/ads/{id}/duplicate` |
| Kampanya Wizard | (modal) | `POST /api/meta/campaigns` (create)<br/>`PATCH /api/meta/campaigns/{id}` (undo → archive) |
| AdSet Create | (modal) | `GET /api/meta/campaigns` (select list)<br/>`POST /api/meta/adsets` (create)<br/>`PATCH /api/meta/adsets/{id}` (undo → archive) |
| Ad Create | (modal) | `GET /api/meta/adsets` (select list)<br/>`POST /api/meta/ads` (create)<br/>`PATCH /api/meta/ads/{id}` (undo → archive) |
| Optimizasyonlar | `/app/optimizations` | `GET /api/optimizations/strategies`<br/>`PATCH /api/optimizations/strategies/{id}`<br/>`GET /api/suggestions/{id}`<br/>`POST /api/suggestions/{id}/decision`<br/>`POST /api/suggestions/{id}/apply` |
| Otomasyonlar | `/app/automations` | `GET /api/automations/rules`<br/>`PATCH /api/automations/rules/{id}` |
| Hesaplar | `/app/accounts` | `GET /api/meta/accounts` (query: `accountId`, `range`, `from`, `to`) |
| Finans | `/app/finance` | (v1 mock-first) öneri: `GET /api/billing/overview`, `GET /api/billing/invoices`, `GET /api/meta/spend/overview` |
| Admin | `/admin/*` | öneri: `GET /api/admin/stripe/overview`, `GET /api/admin/stripe/users`, `GET /api/admin/stripe/subscriptions`, `GET /api/admin/stripe/invoices` |

---

## 2) Overview (Genel Bakış)

### 2.1 KPI metrikleri
**GET** `/api/overview?accountId={id}&range=7d`

**200**
```json
{
  "metrics": [
    {
      "id": "spend",
      "label": "Toplam Harcama",
      "value": "₺12.340",
      "trend": "+12%",
      "status": "up",
      "description": "Son 7 gün Meta harcaman."
    }
  ]
}
```

### 2.2 Öneriler (AI Suggestions)
**GET** `/api/overview/suggestions?accountId={id}&range=7d`

Önerilen **200**:
```json
{
  "suggestions": [
    {
      "id": "s1",
      "title": "Düşük CTR’lı reklamları durdur",
      "description": "CTR 3 gündür %1’in altında olan reklamlar tespit edildi.",
      "impactLevel": "Yüksek",
      "impactMetric": "+%12 ROAS potansiyeli"
    }
  ]
}
```

> Not: Frontend’de şu an suggestions UI tam bağlanmış değil. Entegrasyon sırasında bu endpoint kullanılacak.

### 2.3 Öneri inceleme / onay akışı (incele → onayla/ret/ertele)
Bu akış v1’de UI tarafında simüle edilebilir; backend geldiğinde aşağıdaki kontrat önerilir.

#### 2.3.1 Öneri detay
**GET** `/api/suggestions/{id}`

**200**
```json
{
  "suggestion": {
    "id": "s1",
    "title": "...",
    "description": "...",
    "impactLevel": "Yüksek",
    "impactMetric": "+..."
  }
}
```

#### 2.3.2 Öneri kararı (approve / dismiss / snooze)
**POST** `/api/suggestions/{id}/decision`

Body:
```json
{
  "decision": "approve",
  "note": "Opsiyonel kullanıcı notu",
  "snoozeUntil": "2025-12-31"
}
```

**200**
```json
{ "ok": true }
```

#### 2.3.3 Öneri uygulanması (kritik aksiyon)
**POST** `/api/suggestions/{id}/apply`

Body (opsiyonel):
```json
{
  "dryRun": false,
  "options": {},
  "actionPlan": {
    "items": [
      {
        "entity": "ad",
        "id": "a_123",
        "patch": { "status": "paused" },
        "reason": "CTR < %1.0 (son 3 gün)"
      }
    ]
  }
}
```

**200**
```json
{
  "ok": true,
  "appliedAt": "2025-12-16T12:00:00Z",
  "dryRun": false,
  "result": {
    "items": [
      {
        "entity": "ad",
        "id": "a_123",
        "ok": true,
        "meta": {
          "requested": { "status": "paused" }
        }
      }
    ]
  }
}
```

> Not (Meta uyumu): `actionPlan.items[].patch` alanları “minimal değişiklik” hedefiyle tasarlanır.
> - `entity=campaign|adset|ad`
> - `patch` sadece gerekli alanları içerir (örn. `status`, `dailyBudget`, `bidStrategy` gibi).
> - `dryRun=true` iken backend gerçek PATCH atmaz; sadece “ne yapılacaktı?” çıktısı döner.

---

## 3) Campaigns / AdSets / Ads

### 3.1 Kampanyalar liste
**GET** `/api/meta/campaigns?accountId={id}&range=7d&status=all`

**200**
```json
{
  "campaigns": [
    {
      "id": "c1",
      "name": "Retargeting - Satış",
      "status": "active",
      "spend": "₺1.240",
      "roas": "3.20",
      "conversions": 14
    }
  ]
}
```

> Not (frontend uyumu): UI’da bazı akışlar kampanya “select list” için query’siz çağrı yapıyor:
> - **GET** `/api/meta/campaigns`
> Backend tarafında iki yaklaşım kabul edilebilir:
> - Query zorunlu kıl (frontend adapter sonra güncellenir)
> - Query yoksa varsayılan uygula (`range=7d`, `status=all`, `accountId` user session’dan)

### 3.2 Adset liste
**GET** `/api/meta/adsets?accountId={id}&campaignId={cid}&range=7d&status=all`

**200**
```json
{
  "adsets": [
    {
      "id": "as1",
      "name": "Kadın 25-34",
      "status": "active",
      "campaignId": "c1",
      "campaignName": "Retargeting - Satış",
      "bidStrategy": "lowest_cost",
      "dailyBudget": "₺250",
      "spend": "₺600",
      "roas": "2.10",
      "conversions": 3
    }
  ]
}
```

> Not (frontend uyumu): UI’da bazı akışlar adset “select list” için query’siz çağrı yapıyor:
> - **GET** `/api/meta/adsets`
> Backend tarafında query yoksa minimum alanlarla liste dönmek (id, name) yeterli.

### 3.3 Ads liste
**GET** `/api/meta/ads?accountId={id}&adSetId={asid}&range=7d&status=all`

**200**
```json
{
  "ads": [
    {
      "id": "a1",
      "name": "Story_Video_v1",
      "status": "active",
      "adSetId": "as1",
      "adSetName": "Kadın 25-34",
      "previewUrl": "https://...",
      "ctr": "%1.2",
      "spend": "₺120",
      "roas": "1.8",
      "conversions": 1
    }
  ]
}
```

### 3.4 Update (status/budget)
Öneri: v1’de sadece kampanya için değil, **adset** ve **ad** için de PATCH desteklenmeli.

#### 3.4.1 Campaign update
**PATCH** `/api/meta/campaigns/{id}`

Body (örnek):
```json
{ "status": "paused" }
```

Body (opsiyonel alanlar, UI’da kullanılıyor):
```json
{ "name": "Yeni İsim", "dailyBudget": 300 }
```

#### 3.4.2 AdSet update
**PATCH** `/api/meta/adsets/{id}`

Body (örnek):
```json
{ "status": "paused", "dailyBudget": 300 }
```

#### 3.4.3 Ad update
**PATCH** `/api/meta/ads/{id}`

Body (örnek):
```json
{ "status": "paused" }
```

Body (UI’da kullanılan — kreatif swap):
```json
{ "previewUrl": "https://..." }
```

**200** (önerilen)
```json
{ "ok": true }
```

### 3.4.4 ID ilişkileri (önerilen, frontend ile uyumlu)
Frontend v1’de entity ilişkilerini **ID üzerinden** takip eder:

- `AdSet.campaignId` (zorunlu)
- `Ad.adSetId` (zorunlu)

Geriye uyumluluk için aşağıdaki alanlar **opsiyonel** kalabilir:

- `AdSet.campaignName` (fallback display)
- `Ad.adSetName` (fallback display)

Bu sayede eski payload’lar da UI’ı tamamen kırmadan çalışabilir.

### 3.5 Duplicate (Ajans aksiyonu)

Not: Frontend, kopya oluşturma aksiyonunu entity seviyesinde çalıştırır ve başarı durumunda yeni entity ID’sini (özellikle campaign için) alıp detail sayfasına yönlendirebilir.

#### 3.5.1 Campaign duplicate
**POST** `/api/meta/campaigns/{id}/duplicate`

**200/201**
```json
{ "id": "c_duplicated_123" }
```
veya
```json
{ "campaign": { "id": "c_duplicated_123" } }
```

#### 3.5.2 AdSet duplicate
**POST** `/api/meta/adsets/{id}/duplicate`

**200/201**
```json
{ "id": "as_duplicated_123" }
```
veya
```json
{ "adset": { "id": "as_duplicated_123" } }
```

#### 3.5.3 Ad duplicate
**POST** `/api/meta/ads/{id}/duplicate`

**200/201**
```json
{ "id": "a_duplicated_123" }
```
veya
```json
{ "ad": { "id": "a_duplicated_123" } }
```

### 3.6 Create
#### 3.6.1 Campaign create
**POST** `/api/meta/campaigns`

Body (frontend şu an gönderiyor):
```json
{ "name": "Megvax - Satış", "objective": "sales" }
```

**201/200** (önerilen; frontend her ikisini de tolere edebilir):
```json
{ "id": "c_123" }
```
veya
```json
{ "campaign": { "id": "c_123" } }
```

#### 3.6.2 AdSet create
**POST** `/api/meta/adsets`

Body (frontend şu an gönderiyor):
```json
{ "campaignId": "c1", "name": "TR - 25-45", "dailyBudget": 250 }
```

Body (preset UI — genişletilmiş öneri, geriye uyumlu):
```json
{
  "campaignId": "c1",
  "name": "TR - 25-45",
  "dailyBudget": 250,

  "schedule": {
    "startAt": "2025-12-18T09:00",
    "endAt": "2025-12-25T23:59"
  },

  "placements": {
    "mode": "advantage",
    "placements": ["facebook_feed", "instagram_feed", "instagram_story", "instagram_reels"]
  },

  "optimization": {
    "goal": "CONVERSIONS",
    "bidStrategy": "LOWEST_COST",
    "bidAmount": 35
  }
}
```

> Notlar:
> - `schedule.endAt` opsiyoneldir.
> - `placements.mode=advantage` iken `placements.placements` backend tarafından ignore edilebilir.
> - `optimization.bidAmount` sadece `bidStrategy` düşük maliyet dışında ise beklenebilir.
> - Backend bu alanları desteklemiyorsa, frontend v1’de minimal body ile tekrar deneyebilir:
>   `{ campaignId, name, dailyBudget }`

**201/200** (önerilen):
```json
{ "id": "as_123" }
```
veya
```json
{ "adset": { "id": "as_123" } }
```

#### 3.6.3 Ad create
**POST** `/api/meta/ads`

Body (frontend örneği):
```json
{
  "adSetId": "as1",
  "pageId": "1234567890",
  "linkUrl": "https://...",
  "name": "Story_Video_v1",
  "message": "..."
}
```

> Not (compose yaklaşımı — önerilen): v1’de frontend tek bir `POST /api/meta/ads` çağrısı yapar.
> Backend, gerekirse şu zinciri içeride yönetir:
> - media upload (image/video)
> - ad creative create
> - ad create
>
> Frontend bu sırada “kreatif” alanlarını tek body içinde gönderir.
> Aşağıdaki genişletilmiş body **geriye uyumlu** olacak şekilde opsiyonel alanlarla önerilir.

Body (compose — genişletilmiş öneri):
```json
{
  "adSetId": "as1",
  "pageId": "1234567890",
  "linkUrl": "https://...",
  "name": "Story_Video_v1",
  "message": "...",

  "creative": {
    "source": "upload",
    "mediaType": "video",
    "format": "9:16",

    "thumbnail": {
      "source": "auto"
    },

    "primaryText": "...",
    "headline": "...",
    "description": "...",
    "callToAction": "LEARN_MORE"
  }
}
```

> Not: `creative` objesi gönderilmezse backend mevcut minimal body ile çalışmaya devam edebilir.
> `creative.source=upload` için dosya iletimi iki opsiyonla ele alınabilir:
> - Opsiyon A (önerilen): `multipart/form-data` + `creative` JSON field + `file` binary
> - Opsiyon B: Önce ayrı upload endpoint (v2)

**201/200** (önerilen):
```json
{ "id": "ad_123" }
```
veya
```json
{ "ad": { "id": "ad_123" } }
```

### 3.7 Insights (Tekil + Aggregate)
Bu alan, frontend’de “İstatistik” sekmesi (tekil) ve `/app/campaigns` içindeki “İstatistikler” sekmesi (aggregate) için gereklidir.

#### 3.7.1 Tekil insights
**GET** `/api/meta/insights/{level}/{id}?accountId={id}&range=7d&from=YYYY-MM-DD&to=YYYY-MM-DD`

- `level`: `account | campaign | adset | ad`

**200** (önerilen)
```json
{
  "level": "ad",
  "entityId": "a1",
  "summary": {
    "spend": 1240,
    "roas": 3.2,
    "conversions": 14,
    "ctr": 1.2,
    "cpc": 5.4,
    "cpm": 78.2,
    "impressions": 120000,
    "reach": 65000,
    "frequency": 1.84
  },
  "timeseries": [
    { "date": "2025-12-10", "spend": 120, "roas": 2.1, "conversions": 1, "ctr": 1.0 }
  ],
  "breakdowns": {
    "placement": [ { "key": "feed", "label": "Feed", "spend": 620, "roas": 2.3, "conversions": 7, "ctr": 1.1 } ],
    "age": [ { "key": "25-34", "label": "25–34", "spend": 410, "roas": 3.1, "conversions": 4, "ctr": 1.4 } ],
    "gender": [ { "key": "female", "label": "Kadın", "spend": 800, "roas": 3.5, "conversions": 9, "ctr": 1.3 } ],
    "device": [ { "key": "ios", "label": "iOS", "spend": 540, "roas": 2.8, "conversions": 6, "ctr": 1.2 } ]
  }
}
```

#### 3.7.2 Account aggregate (tüm hesaplar)
**GET** `/api/meta/insights/account/all?accountId={id}&range=7d&from=YYYY-MM-DD&to=YYYY-MM-DD`

**200** (önerilen)
```json
{
  "level": "account",
  "summary": {
    "spend": 12400,
    "roas": 3.2,
    "conversions": 140,
    "ctr": 1.2,
    "cpc": 5.4,
    "cpm": 78.2,
    "impressions": 1200000,
    "reach": 650000,
    "frequency": 1.84
  },
  "timeseries": [
    { "date": "2025-12-10", "spend": 1200, "roas": 2.1, "conversions": 10, "ctr": 1.0 }
  ],
  "breakdowns": {
    "placement": [ { "key": "feed", "label": "Feed", "spend": 6200, "roas": 2.3, "conversions": 70, "ctr": 1.1 } ],
    "age": [ { "key": "25-34", "label": "25–34", "spend": 4100, "roas": 3.1, "conversions": 40, "ctr": 1.4 } ],
    "gender": [ { "key": "female", "label": "Kadın", "spend": 8000, "roas": 3.5, "conversions": 90, "ctr": 1.3 } ],
    "device": [ { "key": "ios", "label": "iOS", "spend": 5400, "roas": 2.8, "conversions": 60, "ctr": 1.2 } ]
  }
}
```

---

## 4) Optimizasyonlar (Strategies)

...
**GET** `/api/optimizations/strategies?accountId={id}`

**200**
```json
{ "strategies": [ { "id": "1", "title": "...", "description": "...", "status": "waiting", "iconCategory": "budget" } ] }
```

### 4.2 Toggle / status
**PATCH** `/api/optimizations/strategies/{id}`

Body:
```json
{ "status": "active" }
```

### 4.3 Strategy Settings (scope + threshold) — önerilen (UI hazır)

Frontend’de strateji ayar modalı şu alanları yönetiyor:
- `targetLevel`: `campaign | adset | ad`
- `targetMode`: `all | selected`
- `targetIds`: `string[]`

Önerilen endpoint’ler:

#### 4.3.1 Settings read
**GET** `/api/optimizations/strategies/{id}/settings?accountId={id}`

**200**
```json
{
  "settings": {
    "targetLevel": "campaign",
    "targetMode": "all",
    "targetIds": []
  }
}
```

#### 4.3.2 Settings upsert
**PUT** `/api/optimizations/strategies/{id}/settings?accountId={id}`

Body:
```json
{
  "targetLevel": "adset",
  "targetMode": "selected",
  "targetIds": ["as1", "as2"]
}
```

**200**
```json
{ "ok": true }
```

---

## 5) Otomasyon Kuralları

### 5.1 Liste
**GET** `/api/automations/rules?accountId={id}`

**200**
```json
{ "rules": [ { "id": "1", "title": "...", "condition": "...", "action": "...", "frequency": "...", "executionCount": 0, "status": "active", "iconCategory": "alert", "source": "template", "templateId": "tpl_roas_pause_ads" } ] }
```

### 5.2 Toggle
**PATCH** `/api/automations/rules/{id}`

Body:
```json
{ "status": "paused" }
```

### 5.3 Create / Update + Settings (scope) — önerilen (UI editor hazır)

Frontend’de kural editörü şu alanları yönetiyor:
- Rule core: `title`, `condition`, `action`, `frequency`, `status`, `iconCategory`
- Scope settings: `targetLevel`, `targetMode`, `targetIds`
- Meta (v1): `source` (`template | custom`), `templateId` (template seçildiyse)

Önerilen şekilde backend tarafında `settings` objesi ile dönmek/almaktır.

#### 5.3.1 Create
**POST** `/api/automations/rules?accountId={id}`

Body (örnek):
```json
{
  "source": "template",
  "templateId": "tpl_roas_pause_ads",
  "title": "ROAS düşükse durdur",
  "condition": "ROAS < 1.2 (son 3 gün)",
  "action": "Reklamları durdur",
  "frequency": "Günlük",
  "status": "paused",
  "iconCategory": "alert",
  "settings": {
    "targetLevel": "ad",
    "targetMode": "selected",
    "targetIds": ["a1", "a2"]
  }
}
```

**201/200**
```json
{ "id": "rule_123" }
```

#### 5.3.2 Update
**PUT** `/api/automations/rules/{id}?accountId={id}`

Body: (create body ile aynı)

**200**
```json
{ "ok": true }
```

### 5.4 Meta Ads Automated Rules (AdRule) uyumu — önerilen (backend compose)

MEGVAX v1 otomasyonları “template” tabanlı tutulur (`templateId`).
Backend, bu template’leri Meta’nın native “Automated Rules / AdRule Engine” modeline çevirebilir:

- `condition` → `evaluation_spec`
- `action` → `execution_spec`
- `frequency` → `schedule_spec`
- `settings.targetLevel/targetIds` → scope (campaign/adset/ad)

Bu yaklaşım:
- Ads Manager ile parity sağlar,
- Rule history/preview gibi kabiliyetleri doğal olarak açar,
- “kendi scheduler’ını yazma” ihtiyacını azaltır.

#### 5.4.1 Preview (hangi varlıkları etkiler?)
**POST** `/api/automations/rules/{id}/preview?accountId={id}`

**200**
```json
{
  "preview": {
    "items": [
      { "entity": "ad", "id": "a_123", "name": "...", "reason": "CTR < %1.0 (son 3 gün)" }
    ]
  }
}
```

#### 5.4.2 Execute (manuel çalıştır)
**POST** `/api/automations/rules/{id}/execute?accountId={id}`

Body (opsiyonel):
```json
{ "dryRun": false }
```

**200**
```json
{ "ok": true, "executedAt": "2025-12-16T12:00:00Z" }
```

#### 5.4.3 History (çalışma geçmişi)
**GET** `/api/automations/rules/{id}/history?accountId={id}`

**200**
```json
{
  "history": [
    {
      "id": "h_1",
      "executedAt": "2025-12-15T09:00:00Z",
      "result": { "applied": 3, "errors": 0 }
    }
  ]
}
```

> Not: İstenirse backend bu endpoint’leri Meta AdRule `/preview`, `/execute`, `/history` edge’lerine proxy eder.

---

## 6) Accounts (Meta bağlantıları)

Frontend şu an **array** bekliyor ve map ediyor.

### 6.1 Liste
**GET** `/api/meta/accounts?accountId={id}&range=7d&from=&to=`

**200**
```json
[
  {
    "id": "1",
    "name": "Megvax Demo A.Ş.",
    "metaAccountId": "act_123456789",
    "status": "connected",
    "lastSyncAt": "2025-12-16T12:00:00Z"
  }
]
```

> Not: Frontend hem `MetaAccountBackend[]` (array) hem de `{ accounts: [...] }` wrapper’ını tolere edebiliyor.

### 6.2 Manual sync
**POST** `/api/meta/accounts/{id}/sync`

**200**
```json
{ "ok": true }
```

---

## 7) Billing / Finance (User)

Bu bölüm, kullanıcı panelindeki `/app/finance` sayfası için öneridir.

### 7.1 Billing overview
**GET** `/api/billing/overview`

**200** (önerilen)
```json
{
  "plan": { "name": "Pro", "billingPeriod": "monthly", "status": "active" },
  "credits": { "available": 1200, "unit": "kredi" }
}
```

### 7.2 Invoices
**GET** `/api/billing/invoices?limit=20`

**200** (önerilen)
```json
{
  "invoices": [
    { "id": "in_1", "amount": 499, "currency": "TRY", "status": "paid", "issuedAt": "2025-12-01" }
  ]
}
```

### 7.3 Ad spend overview (opsiyonel)
**GET** `/api/meta/spend/overview?accountId={id}&range=7d`

**200** (önerilen)
```json
{
  "summary": { "spend": 12400 },
  "timeseries": [ { "date": "2025-12-10", "spend": 1200 } ]
}
```

---

## 8) Admin (Internal / Stripe)

Bu bölüm, MEGVAX internal admin paneli `/admin/*` için öneridir.

### 8.1 Stripe overview
**GET** `/api/admin/stripe/overview`

**200** (önerilen)
```json
{
  "kpis": [
    { "id": "mrr", "label": "MRR", "value": "₺120.000" },
    { "id": "activeSubs", "label": "Aktif Abonelik", "value": "340" }
  ]
}
```

### 8.2 Users
**GET** `/api/admin/stripe/users?limit=50&cursor=`

### 8.3 Subscriptions
**GET** `/api/admin/stripe/subscriptions?status=active&limit=50&cursor=`

### 8.4 Invoices
**GET** `/api/admin/stripe/invoices?status=paid&limit=50&cursor=`

---

## 9) Activity Log (opsiyonel v1 / P2)

### 9.1 Liste
**GET** `/api/activity?accountId={id}&limit=50`

**200**
```json
{ "items": [ { "id": "al1", "timestamp": "...", "action": "...", "entityName": "...", "details": "...", "type": "info" } ] }
```

---

## 10) Bulk İşlemler Notu
v1 için iki yaklaşım mümkün:

- Yaklaşım A (basit): Frontend seçili öğeler için **tek tek PATCH** çağırır (fan-out).
- Yaklaşım B (ileri): Backend bir **bulk endpoint** sağlar (ör. `POST /api/meta/ads/bulk`).

Şimdilik v1’de A yaklaşımı yeterli kabul edilebilir; ileride performans gerekirse bulk endpoint eklenebilir.
