# Netlify Deployment Qələviyi / Deployment Guide

Bu sənəd LogiConnect platformasını Netlify-da deploy etmək üçün addım-addım təlimatdır.

This document provides step-by-step instructions for deploying the LogiConnect platform on Netlify.

## Ön Tələblər / Prerequisites

1. Netlify hesabı (https://netlify.com)
2. PostgreSQL məlumat bazası (tövsiyə olunan: Neon, Supabase, və ya Railway)
3. GitHub/GitLab repository
4. Resend API açarı (email göndərmək üçün)

---

## 1. Məlumat Bazasının Qurulması / Database Setup

### Tövsiyə olunan servislər / Recommended Services:

- **Neon** (https://neon.tech) - Pulsuz PostgreSQL
- **Supabase** (https://supabase.com) - Pulsuz PostgreSQL
- **Railway** (https://railway.app) - PostgreSQL hosting

### Addımlar / Steps:

1. Yuxarıdakı servislərdən birində PostgreSQL bazası yaradın
2. `DATABASE_URL` connection string-i əldə edin
3. Məlumat bazası yaradıldıqdan sonra Prisma migration-ları icra edin:

```bash
npx prisma db push
```

---

## 2. Netlify-də Layihənin Qurulması / Netlify Project Setup

### GitHub ilə Deploy / Deploy with GitHub:

1. Netlify-ə daxil olun: https://app.netlify.com
2. "Add new site" > "Import an existing project" seçin
3. GitHub repository-nizi seçin
4. Build parametrləri avtomatik tanınacaq:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`

---

## 3. Environment Variables Təyin Edilməsi / Setting Environment Variables

Netlify dashboard-da: **Site settings** > **Environment variables** bölməsinə keçin.

Aşağıdakı dəyişənləri əlavə edin:

### DATABASE_URL
```
postgresql://username:password@host:5432/database_name
```
Məlumat bazası connection string-inizi daxil edin.

### AUTH_SECRET
```bash
# Terminal-da random secret yaratmaq üçün:
openssl rand -base64 32
```
Yaranmış dəyəri buraya əlavə edin (minimum 32 simvol).

### NEXTAUTH_URL
```
https://your-app-name.netlify.app
```
Netlify subdomain-inizi buraya yazın (deploy olduqdan sonra əldə edəcəksiniz).

### RESEND_API_KEY
```
re_your_api_key
```
Resend.com-dan əldə etdiyiniz API açarını daxil edin.

---

## 4. İlk Deploy / Initial Deployment

1. Environment variables təyin edildikdən sonra "Deploy site" düyməsinə basın
2. Build prosesi başlayacaq (təqribən 2-5 dəqiqə)
3. Deploy uğurlu olduqda, sizə URL veriləcək: `https://your-app-name.netlify.app`

---

## 5. Məlumat Bazasına İlkin Məlumat Əlavə Edilməsi / Database Seeding

Deploy olduqdan sonra, test hesabları yaratmaq üçün:

1. Lokal mühitdə (və ya Netlify Functions vasitəsilə):
```bash
npm run db:seed
```

2. Bu, aşağıdakı test hesablarını yaradacaq:
   - **Admin:** admin@platform.com / admin123
   - **Supplier:** supplier@azimport.az / supplier123
   - **Logistics:** logistics@swiftcargo.az / logistics123

⚠️ **Təhlükəsizlik:** Production-da bu hesabları dəyişdirin və ya silin!

---

## 6. Custom Domain (İstəyə bağlı) / Custom Domain (Optional)

1. Netlify dashboard-da **Domain settings** seçin
2. "Add custom domain" düyməsinə basın
3. Domain-inizi daxil edin (məs: logiconnect.az)
4. DNS təlimatlarına əməl edin

---

## 7. SSL Sertifikatı / SSL Certificate

Netlify avtomatik olaraq Let's Encrypt SSL sertifikatı təmin edir. Deploy olduqdan 1-2 dəqiqə sonra HTTPS aktiv olacaq.

---

## 8. Problemlərin Həlli / Troubleshooting

### Build Xətaları / Build Errors

Build loglarını yoxlayın:
```
Netlify Dashboard > Deploys > [Failed Deploy] > Deploy log
```

### Məlumat Bazası Connection Xətası

1. `DATABASE_URL` düzgün formatda olduğundan əmin olun
2. Məlumat bazası host-u internetdən əlçatan olmalıdır
3. SSL mode əlavə edin (bəzi servislər tələb edir):
```
?sslmode=require
```

### Environment Variables Yüklənmir

1. Environment variables-ları yenidən deploy edən zaman yeniləyin
2. "Redeploy" düyməsinə basaraq yenidən deploy edin

---

## 9. Continuous Deployment

GitHub-a hər push edildikdə avtomatik deploy olacaq:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Netlify avtomatik olaraq:
1. Yeni commit-i aşkar edəcək
2. Build prosesini başladacaq
3. Uğurlu olduqda production-a deploy edəcək

---

## 10. Monitoring və Analytics

Netlify dashboard-da bu məlumatları izləyə bilərsiniz:

- Deploy tarixçəsi
- Build zamanları
- Bandwidth istifadəsi
- Forms submissions
- Function invocations

---

## Əlaqə / Contact

Problemlə qarşılaşdıqda:
- Netlify Support: https://docs.netlify.com
- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs

---

## Sürətli Xülasə / Quick Summary

```bash
# 1. Database yaradın (Neon/Supabase/Railway)
# 2. Netlify-də repository import edin
# 3. Environment variables təyin edin:
DATABASE_URL=postgresql://...
AUTH_SECRET=random-32-char-string
NEXTAUTH_URL=https://your-app.netlify.app
RESEND_API_KEY=re_...

# 4. Deploy site düyməsinə basın
# 5. Gözləyin (2-5 dəqiqə)
# 6. Hazırdır! 🚀
```

Uğurlar! / Good luck!
