# LogiConnect - B2B Logistics Platform

A Next.js 14 B2B platform connecting suppliers with logistics companies.

## Quick Start

### 1. Configure environment
Edit `.env` with your PostgreSQL connection:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/logistics"
AUTH_SECRET="your-secret-min-32-chars"
```

### 2. Setup database
```bash
npx prisma db push
npm run db:seed
```

### 3. Run
```bash
npm run dev
```
App runs at http://localhost:3000

## Demo Accounts
- Admin: admin@platform.com / admin123
- Supplier: supplier@azimport.az / supplier123
- Logistics: logistics@swiftcargo.az / logistics123
- Unverified: test@newstartup.az / test123
