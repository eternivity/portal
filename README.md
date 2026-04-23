# PortalKit Production Hazırlık Rehberi

Bu proje build alıyor. Bundan sonra iş, dış servisleri doğru şekilde bağlamak: Supabase, Stripe, Resend ve Vercel.

## Benim Yerelde Ayarladıklarım

- `.env.local` dosyasını oluşturdum.
- `vercel.json` hazır.
- Wildcard subdomain middleware hazır.
- `/portal-subdomain/[slug]` hazır.
- `/api/health` hazır.
- React Email template dosyaları hazır.
- Production env kontrol script’i eklendi:

```bash
npm run check:env
```

Bu script eksik env değişkenlerini söyler.

## 1. Supabase Ayarları

Supabase dashboard’da yeni production project oluştur.

Sonra SQL Editor’da sırayla şunları çalıştır:

```text
supabase/migrations/001_init.sql
supabase/migrations/002_project_files_bucket.sql
```

Not: `supabase/migrations/20260423141000_initial_schema.sql` eski alternatif migration. Production’da ana kaynak olarak `001_init.sql` ve `002_project_files_bucket.sql` kullan.

Supabase Auth ayarları:

- Authentication → Providers → Email açık olsun.
- Email confirmations açık olsun.
- Authentication → URL Configuration:
  - Site URL: `https://portalkit.app`
  - Redirect URLs:
    - `https://portalkit.app/**`
    - `https://*.portalkit.app/**`

Supabase Storage:

- Bucket adı: `project-files`
- Public: kapalı
- Max file size: 50MB

Supabase Realtime:

- `messages` tablosu için Realtime aktif olmalı.

Supabase env değerleri:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Bunları hem `.env.local` içine hem Vercel Environment Variables içine koy.

## 2. Stripe Ayarları

Stripe dashboard’da live mode’a geçmeden önce test mode ile dene.

Products oluştur:

- Starter: `$9/month`
- Pro: `$29/month`
- Agency: `$59/month`

Her plan için recurring monthly price oluştur ve Price ID’leri al:

```env
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PRO=
STRIPE_PRICE_AGENCY=
```

Stripe API key:

```env
STRIPE_SECRET_KEY=
```

Webhook:

- Endpoint: `https://portalkit.app/api/webhooks/stripe`
- Events:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

Webhook secret değerini şuraya koy:

```env
STRIPE_WEBHOOK_SECRET=
```

## 3. Resend Ayarları

Resend’de domain doğrula:

```text
portalkit.app
```

DNS kayıtlarını ekledikten sonra Resend API key al:

```env
RESEND_API_KEY=
```

Kod şu gönderenleri kullanıyor:

- `PortalKit <invoices@portalkit.app>`
- `PortalKit <billing@portalkit.app>`

Domain doğrulanmadan production email gönderimi güvenilir çalışmaz.

## 4. Vercel Ayarları

Vercel’de projeyi bağla.

Environment Variables içine `.env.local` dosyasındaki tüm değerleri ekle:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PRO=
STRIPE_PRICE_AGENCY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=https://portalkit.app
```

Domain ayarları:

- Primary domain: `portalkit.app`
- Wildcard domain: `*.portalkit.app`

Wildcard domain için Vercel Pro gerekir.

## 5. Deploy Öncesi Yerel Kontrol

`.env.local` değerlerini doldurduktan sonra:

```bash
npm run check:env
npm run build
```

İkisi de başarılı olmalı.

## 6. Deploy Sonrası Test

Health check:

```bash
curl https://portalkit.app/api/health
```

Beklenen cevap:

```json
{
  "status": "ok",
  "timestamp": "...",
  "version": "1.0.0"
}
```

Uçtan uca test:

- Yeni kullanıcı oluştur.
- Onboarding tamamla.
- Subdomain seç: örnek `ali`.
- Supabase `profiles.subdomain` değerini kontrol et.
- Proje oluştur.
- Dosya yükle.
- Fatura oluştur.
- Faturayı gönder.
- Stripe test ödeme yap.
- Stripe webhook sonrası invoice `paid` oluyor mu kontrol et.
- Resend email gidiyor mu kontrol et.
- `https://ali.portalkit.app/project-slug` portalını aç.

## 7. Production’a Geçiş

Test mode sorunsuz çalıştıktan sonra:

- Stripe live key’leri gir.
- Resend production domain doğrulamasını tamamla.
- Supabase production project kullandığından emin ol.
- Vercel’de production env değerlerini güncelle.
- Tekrar deploy et.
