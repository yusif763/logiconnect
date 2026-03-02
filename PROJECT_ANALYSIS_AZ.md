# LogiConnect - Tam Layihə Analizi

## 🎯 Layihənin Məqsədi

**LogiConnect** - Təchizatçı şirkətləri və logistika şirkətlərini birləşdirən B2B (Business-to-Business) logistika marketplace platformasıdır.

### Əsas Konsepsiya
LogiConnect "Amazon for Shipping" - yəni yük göndərmək üçün Amazon kimi işləyir:
- Təchizatçılar yük elanları yerləşdirir
- Logistika şirkətləri rəqabətli təkliflər göndərir
- Ən yaxşı təklif qazanır
- Şəffaf qiymətləndirmə və real-vaxt izləmə

---

## 👥 İstifadəçi Qrupları

### 1. Təchizatçılar (Suppliers)
**Kim**: Avadanlıq və təchizat şirkətləri, yük göndərməyə ehtiyacı olan şirkətlər

**Ehtiyacları**:
- Yük göndərmək üçün logistika xidmətləri
- Ən yaxşı qiymətləri tapmaq
- Etibarlı logistika partnyorları
- Göndərişləri izləmək

**Platform Həlli**:
- Elan yaradaraq bir neçə dəqiqədə çoxlu təklif alma
- Qiymət və müddətin şəffaf müqayisəsi
- Yoxlanmış logistika şirkətləri
- Real-vaxt izləmə sistemi

### 2. Logistika Şirkətləri (Logistics Companies)
**Kim**: Daşıma və logistika xidmətləri təklif edən şirkətlər

**Ehtiyacları**:
- Yeni müştərilər tapmaq
- Boş daşıma gücünü doldurmaq
- Rəqabətli qiymət təyin etmək
- Əməliyyatları effektiv idarə etmək

**Platform Həlli**:
- Gündəlik 100+ aktiv elan
- Avtomatik müştəri əldə etmə
- Bazar qiymət analizi
- Uğur dərəcəsi və performans izləmə

### 3. Admin
**Kim**: Platform administratorları

**Vəzifələri**:
- Şirkətləri yoxlamaq və təsdiqləmək
- Platformanı monitorinq etmək
- İstifadəçiləri idarə etmək
- Platformanın təhlükəsizliyini təmin etmək

---

## 🌟 Əsas Funksiyalar

### A. Elanlar (Announcements)

**Yaratma**:
- Başlıq və təsvir
- Yük növü (cargo type)
- Çəki (kg) və həcm (m³)
- Çıxış nöqtəsi (origin)
- Təyinat nöqtəsi (destination)
- Son tarix (deadline)

**İdarəetmə**:
- Status: Aktiv, Bağlı, Ləğv edilmiş
- Alınan təklifləri görüntüləmə
- Təklifləri müqayisə etmə
- Qəbul/Rədd etmə

**Filtrlər**:
- Çıxış nöqtəsinə görə
- Təyinat nöqtəsinə görə
- Yük növünə görə
- Son tarixə görə

### B. Təkliflər (Offers)

**Çoxsaylı Nəqliyyat Növləri**:
Eyni elan üçün 4 fərqli nəqliyyat növü ilə təklif:
- ✈️ Hava (AIR)
- 🚢 Dəniz (SEA)
- 🚂 Dəmir yolu (RAIL)
- 🚛 Avtomobil (ROAD)

Hər nəqliyyat növü üçün:
- Qiymət
- Valyuta (AZN, USD, EUR, TRY)
- Çatdırılma müddəti (gün)
- Qeydlər

**Xüsusiyyətlər**:
- Təklif göndərmə və redaktə
- Təklif tarixçəsi (change history)
- Şərhlər və müzakirə
- Status: Gözləyir, Qəbul edildi, Rədd edildi
- Təklif məlumatlarını yeniləmə

**Bazar Qiymət Analizi**:
- Marşrut üzrə orta qiymətlər
- Qazanan təkliflərin qiymətləri
- Rəqabətli/Orta/Yüksək göstəriciləri
- Uğur ehtimalı hesablaması

### C. Göndərişlər (Shipments)

**6 Mərhələli İzləmə**:
1. Sifariş Edildi (BOOKED)
2. Götürüldü (PICKED_UP)
3. Tranzitdə (IN_TRANSIT)
4. Gömrük Rəsmiləşdirməsi (CUSTOMS_CLEARANCE)
5. Çatdırılmaya Göndərildi (OUT_FOR_DELIVERY)
6. Çatdırıldı (DELIVERED)

**Hər Status Yeniləməsi üçün**:
- Tarix və vaxt
- Məkan
- Qeyd
- Yeniləyən şəxs

**Timeline Vizualizasiyası**:
- Vizual xətt diaqramı
- Tamamlanmış və gözləyən mərhələlər
- Hər mərhələnin detalları

### D. Hesabatlar və Analitika

**Dashboard (Rol-spesifik)**:

*Təchizatçılar üçün*:
- Ümumi elanlar sayı
- Aktiv elanlar
- Alınan təkliflər
- Qəbul edilmiş təkliflər
- Qəbul dərəcəsi
- Son elanlar

*Logistika üçün*:
- Göndərilmiş təkliflər
- Qazanılan təkliflər (accepted)
- Uğur dərəcəsi (win rate)
- Pool ölçüsü (aktiv elanlar)
- Gəlir statistikası
- Son təkliflər

**Ətraflı Hesabatlar**:
- Tarix aralığı seçimi
- Qrafiklər və chartlar (Recharts)
- Nəqliyyat növü bölgüsü
- Marşrut analizi
- Yük növü statistikası
- CSV ixracı

**Performans İzləmə**:
- Dövr seçimi (1 ay, 3 ay, 6 ay, 1 il)
- Rəqabət balı (competitiveness score)
- Trend analizi (inkişaf/azalma/sabit)
- Bazar müqayisəsi
- Win rate tendensiyaları

### E. Komanda İdarəetməsi

**İşçilər (Employees)**:
- Çoxsaylı işçi əlavə etmə
- Rol: Şirkət Admini / İşçi
- Hər işçinin fərdi performansı
- İşçi üzrə elan və təklif statistikası
- E-poçt ilə dəvət sistemi

**Performans Hesabatları**:
- İşçi başına elan sayı
- İşçi başına təklif sayı
- Qəbul/Uğur dərəcəsi
- Müqayisəli analiz

### F. Admin Panel

**Şirkət İdarəetməsi**:
- Gözləyən (pending) şirkətləri görüntüləmə
- Yoxlama (verification)
- Dayandırma (suspension)
- Aktivləşdirmə
- Şirkət növü: Təchizatçı/Logistika

**İstifadəçi İdarəetməsi**:
- Bütün istifadəçilərin siyahısı
- İstifadəçi məlumatları
- Aktivlik monitorinqi

**Platform Statistikası**:
- Ümumi şirkətlər
- Gözləyən yoxlamalar
- Aktiv göndərişlər
- Platform aktivliyi

---

## 🎨 İstifadəçi İnterfeysi

### Dizayn Sistemi
- **Framework**: Tailwind CSS
- **Komponentlər**: Radix UI (shadcn/ui)
- **İkonlar**: Lucide React (30+ ikon)
- **Rəng Sxemi**:
  - Mavi tonlar: Əsas aksent
  - Slate/Boz: Fon və mətn
  - Yaşıl: Uğur və təsdiq
  - Qırmızı: Xəta və rədd
  - Sarı: Xəbərdarlıq

### Responsive Dizayn
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobil (< 768px)
- Grid sistemi və flexbox

### UI Komponentləri
- Button (variant: default, outline, ghost)
- Card və Paper
- Table (data-table)
- Form (react-hook-form + zod)
- Dialog və Modal
- Dropdown və Select
- Badge və Tag
- Toast bildirişləri
- Timeline vizualizasiya
- Chart və qrafiklər (Recharts)

---

## 🌐 Beynəlmiləlləşmə (i18n)

### Dəstəklənən Dillər
1. **Azərbaycan (az)** - Əsas dil
2. **İngilis (en)**
3. **Rus (ru)**
4. **Türk (tr)**

### Texniki Həll
- **next-intl** paketi
- Middleware ilə dil təyini
- `/[locale]/` route structure
- `messages/` qovluğunda JSON faylları
- `useTranslations` hook
- Server-side translations: `getTranslations`

### Çevrilmiş Elementlər
- Bütün UI mətnləri
- Form etiketləri
- Xəta mesajları
- E-poçt şablonları
- Bildirişlər

---

## 🔐 Təhlükəsizlik və Autentifikasiya

### NextAuth.js
- **Strategiya**: Credentials provider
- **Session**: JWT-based
- **Middleware**: Route qoruması

### Rol-based Access Control (RBAC)
- **SUPPLIER**: Təchizatçı imkanları
- **LOGISTICS**: Logistika imkanları
- **ADMIN**: Admin paneli girişi

### Qorunan Route-lar
```
/[locale]/dashboard/*
/[locale]/announcements/*
/[locale]/offers/*
/[locale]/shipments/*
/[locale]/reports/*
/[locale]/employees/*
/[locale]/admin/*
```

### Şirkət Yoxlanması
- Yeni şirkətlər: PENDING status
- Admin təsdiqi: VERIFIED status
- Dayandırılmış: SUSPENDED status

### Password Security
- bcrypt ilə hash
- Minimum uzunluq: 6 simvol
- Şifrə dəyişdirmə funksiyası

---

## 💾 Məlumat Bazası Strukturu

### Texnologiya
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Hosting**: (dəyişən, .env-də konfiqurasiya)

### Əsas Modellər

**User**
- id, email, password, name, role
- companyId (relation)
- createdAt, updatedAt

**Company**
- id, name, type (SUPPLIER/LOGISTICS)
- email, phone, address
- verificationStatus (PENDING/VERIFIED/SUSPENDED)
- users (relation)
- createdAt, updatedAt

**Announcement**
- id, title, description
- cargoType, weight, volume
- origin, destination
- deadline, status
- companyId, createdById
- offers (relation)
- createdAt, updatedAt

**Offer**
- id, notes, status
- announcementId, companyId, createdById
- transportItems (relation)
- shipment (relation)
- comments, changeHistory (JSON)
- createdAt, updatedAt

**TransportItem**
- id, transportType (AIR/SEA/RAIL/ROAD)
- price, currency
- deliveryDays, notes
- offerId
- createdAt, updatedAt

**Shipment**
- id, offerId
- currentStatus
- statusUpdates (JSON)
- createdAt, updatedAt

### Əlaqələr
- User ↔ Company (many-to-one)
- Company ↔ Announcement (one-to-many)
- Announcement ↔ Offer (one-to-many)
- Offer ↔ TransportItem (one-to-many)
- Offer ↔ Shipment (one-to-one)

---

## 🚀 Texniki Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Komponentləri**: Radix UI (shadcn/ui)
- **İkonlar**: Lucide React
- **Forms**: react-hook-form + zod
- **Charts**: Recharts
- **i18n**: next-intl
- **Date**: date-fns

### Backend
- **Framework**: Next.js API Routes
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: NextAuth.js
- **Validation**: Zod
- **Email**: Resend

### DevOps
- **Hosting**: Netlify
- **Runtime**: Node.js
- **Package Manager**: npm
- **Version Control**: Git

### Dependencies (Əsas)
```json
{
  "next": "14.x",
  "react": "18.x",
  "typescript": "5.x",
  "prisma": "^5.x",
  "@prisma/client": "^5.x",
  "next-auth": "^4.x",
  "next-intl": "^3.x",
  "tailwindcss": "^3.x",
  "@radix-ui/react-*": "^1.x",
  "recharts": "^2.x",
  "zod": "^3.x",
  "react-hook-form": "^7.x",
  "lucide-react": "latest",
  "bcrypt": "^5.x",
  "date-fns": "^3.x"
}
```

---

## 📁 Layihə Strukturu

```
logiconnect/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx                    # Landing page
│   │   ├── presentation/
│   │   │   └── page.tsx                # Satış təqdimatı səhifəsi
│   │   ├── login/
│   │   ├── register/
│   │   │   ├── supplier/
│   │   │   └── logistics/
│   │   ├── dashboard/
│   │   ├── announcements/
│   │   │   ├── page.tsx                # Elan siyahısı
│   │   │   ├── [id]/
│   │   │   ├── create/
│   │   │   └── pool/
│   │   ├── offers/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   └── create/
│   │   ├── shipments/
│   │   ├── reports/
│   │   ├── employees/
│   │   ├── profile/
│   │   └── admin/
│   ├── api/
│   │   ├── auth/
│   │   ├── announcements/
│   │   ├── offers/
│   │   ├── shipments/
│   │   ├── companies/
│   │   ├── employees/
│   │   └── reports/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                             # shadcn/ui komponentləri
│   ├── dashboard/
│   ├── announcements/
│   ├── offers/
│   ├── shipments/
│   └── layout/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── messages/
│   ├── az.json
│   ├── en.json
│   ├── ru.json
│   └── tr.json
├── public/
├── types/
├── i18n/
├── middleware.ts
├── next.config.mjs
├── tailwind.config.ts
├── package.json
└── .env
```

---

## 🔄 İş Axını (Workflow)

### Təchizatçı Axını
1. **Qeydiyyat** → PENDING status
2. **Admin təsdiqi** → VERIFIED status
3. **Elan yaratma** → Yük detalları daxil edir
4. **Təklifləri gözləmə** → 24-48 saat
5. **Təklifləri müqayisə** → Qiymət, müddət, nəqliyyat növü
6. **Ən yaxşısını seçmə** → Təklifi ACCEPT edir
7. **Göndəriş** → SHIPMENT yaranır
8. **İzləmə** → Real-vaxt status yeniləmələri
9. **Çatdırılma** → DELIVERED status
10. **Hesabat** → Analytics və performans

### Logistika Axını
1. **Qeydiyyat** → PENDING status
2. **Admin təsdiqi** → VERIFIED status
3. **Pool-a baxma** → Aktiv elanları filtrləmə
4. **Təklif göndərmə** → Multi-transport seçimləri
5. **Gözləmə** → Təchizatçının qərarı
6. **Qazanma** → ACCEPTED status
7. **Göndəriş başlatma** → Yükü götürmə
8. **Status yeniləmələri** → Hər mərhələdə update
9. **Çatdırma** → DELIVERED
10. **Hesabat** → Win rate, gəlir analizi

### Admin Axını
1. **Yeni şirkət bildirişi**
2. **Şirkət məlumatlarını yoxlama**
3. **VERIFY və ya SUSPEND**
4. **Platform monitorinqi**
5. **İstifadəçi dəstəyi**

---

## 📊 Əsas Metrikalar

### Platform KPI-ları
- Ümumi şirkətlər (Təchizatçı + Logistika)
- Gündəlik yeni elanlar
- Orta elan başına təklif sayı
- Ümumi qəbul dərəcəsi (acceptance rate)
- Orta uğur dərəcəsi (win rate)
- Platform aktivliyi (DAU, MAU)

### Təchizatçı Metrikaları
- Yaradılmış elanlar
- Alınan təkliflər
- Qəbul edilmiş təkliflər
- Orta qənaət faizi
- Tamamlanmış göndərişlər

### Logistika Metrikaları
- Göndərilmiş təkliflər
- Qazanılmış təkliflər
- Uğur dərəcəsi (win rate)
- Gəlir (revenue)
- Rəqabət balı

---

## 🎯 Biznes Modeli

### Gəlir Mənbələri (Potensial)
1. **Komissiya**: Uğurlu əməliyyatlardan faiz
2. **Premium Abunəlik**: Əlavə xüsusiyyətlər
3. **Reklamlar**: Xüsusi göstərilmə
4. **Analitika Paketləri**: Təkmilləşdirilmiş hesabatlar

### Dəyər Təklifi
- **Təchizatçılar üçün**: 20-40% qənaət + vaxt qənaəti
- **Logistika üçün**: Müştəri əldə etmə xərcini azaltma
- **Hər iki tərəf üçün**: Şəffaflıq və etibarlılıq

---

## 🚀 Deployment

### Netlify Konfiqurasiyası
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Environment Variables (.env)
```bash
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
RESEND_API_KEY=
```

### Build Process
1. `npm install` - Dependencies yükləmə
2. `npx prisma generate` - Prisma client yaratma
3. `npm run build` - Next.js build
4. Deploy to Netlify

---

## 📱 Mobil Optimallaşdırma

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobil Xüsusiyyətləri
- Touch-friendly düymələr
- Mobil navigation menu
- Swipe gesture dəstəyi
- Optimized table görünüşü
- Reduced data for mobile

### PWA Potensialı
- Service Worker (gələcək)
- Offline mode (gələcək)
- Push notifications (gələcək)

---

## 🔮 Gələcək İnkişaf İmkanları

### Funksional
- [ ] Chat sistemi (real-time)
- [ ] Video görüşlər
- [ ] Ödəniş inteqrasiyası
- [ ] Sənəd idarəetməsi
- [ ] E-imza sistemi
- [ ] Mobil tətbiq (React Native)
- [ ] AI-powered qiymət tövsiyələri
- [ ] Avtomatik marşrut optimallaşdırması

### Texniki
- [ ] GraphQL API
- [ ] Redis caching
- [ ] WebSocket (real-time updates)
- [ ] Elasticsearch (axtarış)
- [ ] CDN inteqrasiyası
- [ ] Microservices arxitekturası

### Biznes
- [ ] Multi-currency avtomatik çevrilmə
- [ ] Gömrük məlumatları inteqrasiyası
- [ ] Sığorta xidmətləri
- [ ] Maliyyə hesabatları
- [ ] CRM inteqrasiyası
- [ ] ERP inteqrasiyası

---

## 📈 Rəqabət Üstünlükləri

### Texniki
✅ Modern tech stack (Next.js 14, TypeScript)
✅ Real-time izləmə
✅ Multi-transport flexibility
✅ Comprehensive analytics
✅ 4 dil dəstəyi

### Biznes
✅ Şəffaflıq (transparent bidding)
✅ Qənaət (20-40%)
✅ Avtomatlaşdırma
✅ Yoxlanmış partnyorlar
✅ End-to-end həll

---

## 📞 Dəstək və Əlaqə

### Texniki Dəstək
- 24/7 mövcudluq
- E-poçt: support@logiconnect.az
- Telefon: +994 XX XXX XX XX

### Dokumentasiya
- Platform təlimatı
- Video tutorial
- FAQ bölməsi
- API docs (gələcək)

---

## 📝 Xülasə

LogiConnect - təchizatçılar və logistika şirkətləri arasında körpü rolunu oynayan, müasir texnologiyalarla qurulmuş, istifadəçi dostu, şəffaf və effektiv B2B platformadır.

### Əsas Güclü Tərəfləri:
1. **Tam Funksional**: Elan → Təklif → Göndəriş → Analitika
2. **Multi-Transport**: 4 nəqliyyat növü dəstəyi
3. **Şəffaflıq**: Açıq qiymət müqayisəsi
4. **Analitika**: Comprehensive reporting
5. **Beynəlmiləl**: 4 dil dəstəyi
6. **Scalable**: Modern arxitektura

### Hədəf Bazarlar:
- 🇦🇿 Azərbaycan (əsas)
- 🇹🇷 Türkiyə
- 🇷🇺 Rusiya
- 🌍 Beynəlxalq

**LogiConnect - Logistikada Yeni Dövr! 🚀**