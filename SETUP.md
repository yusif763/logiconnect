# LogiConnect - Full Stack Project Setup Guide

## Project Overview

**LogiConnect** is a B2B Logistics/Freight Platform that connects suppliers with logistics companies. This project includes:

- **Backend**: NestJS + PostgreSQL + Prisma
- **Mobile App**: Flutter (iOS & Android)

---

## Prerequisites

| Tool | Version | Required For |
|------|---------|-------------|
| Node.js | 20+ | Backend |
| npm | 10+ | Backend |
| PostgreSQL | 14+ | Database |
| Flutter SDK | 3.2+ | Mobile App |
| Dart SDK | 3.2+ | Mobile App |

---

## 1. Database Setup

**Database URL artıq konfiqurasiya olunub** - orijinal layihə ilə eyni database istifadə olunur. Heç bir əlavə database qurmağa ehtiyac yoxdur.

`.env` faylında:
```
DATABASE_URL="postgres://44a6d0b2f0df64af7068f1d780a9212d1ee66581bb15e66c2d124c3dfecf19b8:sk_JnJVbiWJI2Cw6456P4ETQ@db.prisma.io:5432/postgres?sslmode=require"
```

---

## 2. Backend Setup (NestJS)

```bash
# Navigate to backend directory
cd /Users/yusif/Desktop/logiconnect-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database URL
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/logiconnect?schema=public"
# JWT_SECRET="your-super-secret-jwt-key-change-in-production"
# PORT=3001

# Generate Prisma client
npx prisma generate

# Run database migrations (uses same DB as original project)
npx prisma migrate dev --name init

# Start development server
npm run start:dev
```

Backend will be running at: **http://localhost:3001**
API Documentation (Swagger): **http://localhost:3001/api/docs**

### Backend API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register company |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/announcements` | List announcements |
| POST | `/api/announcements` | Create announcement |
| GET | `/api/announcements/:id` | Get announcement detail |
| PATCH | `/api/announcements/:id` | Update announcement |
| GET | `/api/offers` | List offers |
| POST | `/api/offers` | Submit offer |
| GET | `/api/offers/:id` | Get offer detail |
| PATCH | `/api/offers/:id` | Update offer |
| PATCH | `/api/offers/:id/status` | Accept/reject offer |
| GET | `/api/offers/:id/comments` | Get offer comments |
| POST | `/api/offers/:id/comments` | Add comment |
| GET | `/api/offers/:id/history` | Get offer history |
| GET | `/api/shipments` | List shipments |
| GET | `/api/shipments/:id` | Get shipment detail |
| POST | `/api/shipments/:id/milestone` | Add milestone |
| GET | `/api/notifications` | Get notifications |
| PATCH | `/api/notifications/read` | Mark as read |
| GET | `/api/reviews` | Get reviews |
| POST | `/api/reviews` | Create review |
| GET | `/api/companies` | List companies |
| PATCH | `/api/companies/:id/verify` | Verify company |
| GET | `/api/users` | List users |
| PATCH | `/api/users/:id` | Update profile |
| PATCH | `/api/users/:id/password` | Change password |
| GET | `/api/employees` | List employees |
| POST | `/api/employees` | Create employee |
| GET | `/api/reports/supplier` | Supplier report |
| GET | `/api/reports/logistics` | Logistics report |
| GET | `/api/reports/admin` | Admin report |
| GET | `/api/reports/employee/:id` | Employee report |
| GET | `/api/price-insight` | Price analysis |

---

## 3. Flutter Mobile App Setup

```bash
# Navigate to app directory
cd /Users/yusif/Desktop/logiconnect-app

# Install Flutter dependencies
flutter pub get

# Create asset directories
mkdir -p assets/images assets/icons assets/fonts

# Run the app
flutter run

# For specific platform
flutter run -d ios     # iOS Simulator
flutter run -d android # Android Emulator

# Build for release
flutter build ios      # iOS
flutter build apk      # Android APK
flutter build appbundle # Android App Bundle
```

### Configure API URL

Edit `lib/core/config/app_config.dart` to point to your backend:

```dart
baseUrl = 'http://localhost:3001';  // For local development
// For Android emulator use: 'http://10.0.2.2:3001'
// For iOS simulator use: 'http://localhost:3001'
// For physical device use your machine's IP: 'http://192.168.x.x:3001'
```

---

## 4. Demo Accounts

After seeding the database:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@platform.com | admin123 |
| Supplier Admin | supplier@azimport.az | supplier123 |
| Logistics Admin | logistics@swiftcargo.az | logistics123 |

---

## 5. Project Structure

### Backend (NestJS)
```
logiconnect-backend/
├── src/
│   ├── main.ts                          # Entry point
│   ├── app.module.ts                    # Root module
│   ├── common/                          # Shared utilities
│   │   ├── prisma/                      # Prisma service
│   │   ├── decorators/                  # Custom decorators
│   │   ├── guards/                      # Auth guard
│   │   └── validators/                  # Custom validators
│   └── modules/
│       ├── auth/                        # Authentication
│       ├── companies/                   # Company management
│       ├── users/                       # User management
│       ├── announcements/               # Cargo announcements
│       ├── offers/                      # Offer/bidding system
│       ├── shipments/                   # Shipment tracking
│       ├── reviews/                     # Reviews & ratings
│       ├── notifications/               # Notifications
│       ├── reports/                     # Analytics & reports
│       ├── employees/                   # Employee management
│       └── price-insight/               # Price analysis
├── prisma/
│   └── schema.prisma                    # Database schema
└── package.json
```

### Mobile App (Flutter)
```
logiconnect-app/
├── lib/
│   ├── main.dart                        # Entry point
│   ├── core/
│   │   ├── config/                      # App configuration
│   │   ├── constants/                   # App constants
│   │   ├── theme/                       # Theme & colors
│   │   ├── utils/                       # Utility functions
│   │   └── errors/                      # Error classes
│   ├── data/
│   │   ├── models/                      # Data models
│   │   ├── providers/                   # API provider
│   │   ├── repositories/                # Data repositories
│   │   └── sources/                     # Data sources
│   └── presentation/
│       ├── providers/                   # State management (Provider)
│       ├── screens/                     # UI Screens
│       │   ├── auth/                    # Login, Register
│       │   ├── dashboard/               # Main dashboard
│       │   ├── announcements/           # Announcements list/detail/create
│       │   ├── offers/                  # Offers list/detail/submit
│       │   ├── shipments/               # Shipments list/detail
│       │   ├── profile/                 # User profile
│       │   ├── notifications/           # Notifications
│       │   ├── reports/                 # Analytics
│       │   ├── admin/                   # Admin panel
│       │   └── guide/                   # User guide
│       └── widgets/                     # Reusable widgets
├── assets/
└── pubspec.yaml
```

---

## 6. Quick Start Commands

### Start Everything
```bash
# Terminal 1 - Database
brew services start postgresql

# Terminal 2 - Backend
cd /Users/yusif/Desktop/logiconnect-backend
npm run start:dev

# Terminal 3 - Mobile App
cd /Users/yusif/Desktop/logiconnect-app
flutter run
```

---

## 7. Troubleshooting

### Backend Issues

**Prisma client not generated:**
```bash
npx prisma generate
```

**Database connection error:**
- Verify PostgreSQL is running: `brew services list | grep postgresql`
- Check DATABASE_URL in .env
- Verify database exists: `psql -U postgres -l | grep logiconnect`

**Port already in use:**
```bash
# Change PORT in .env to another port (e.g., 3002)
```

### Flutter Issues

**Package resolution failed:**
```bash
flutter clean
flutter pub get
```

**iOS build issues:**
```bash
cd ios
pod install
cd ..
flutter run
```

**Android build issues:**
```bash
flutter clean
flutter pub get
flutter run
```

**Hot reload not working:**
- Press `r` in terminal for hot reload
- Press `R` for hot restart

---

## 8. Technology Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **ORM**: Prisma 6
- **Database**: PostgreSQL
- **Auth**: JWT (cookie-based sessions)
- **Validation**: class-validator + class-transformer
- **API Docs**: Swagger/OpenAPI
- **Password Hashing**: bcryptjs

### Mobile App
- **Framework**: Flutter (Dart)
- **State Management**: Provider
- **HTTP Client**: http package
- **Charts**: fl_chart
- **Maps**: flutter_map
- **Storage**: shared_preferences + flutter_secure_storage
- **UI**: Material Design 3
