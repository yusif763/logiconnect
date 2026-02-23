# LogiConnect - B2B Logistics Platform

A Next.js 14 B2B platform connecting suppliers with logistics companies.

## Features

- Multi-tenant B2B platform for suppliers and logistics companies
- Real-time shipment tracking
- Offer management system
- Multi-language support (EN, AZ, RU, TR)
- Role-based access control
- Email notifications
- Dashboard analytics

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TailwindCSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **Auth:** NextAuth.js v5
- **Email:** Resend
- **i18n:** next-intl

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and update with your values:
```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/logistics"
AUTH_SECRET="your-secret-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="your_resend_api_key"
```

### 3. Setup database
```bash
npx prisma db push
npm run db:seed
```

### 4. Run development server
```bash
npm run dev
```
App runs at http://localhost:3000

## Demo Accounts
- Admin: admin@platform.com / admin123
- Supplier: supplier@azimport.az / supplier123
- Logistics: logistics@swiftcargo.az / logistics123
- Unverified: test@newstartup.az / test123

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Netlify deployment instructions.

Quick deploy:
1. Push to GitHub
2. Connect repository to Netlify
3. Set environment variables
4. Deploy

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/               # Database schema & migrations
├── messages/             # i18n translations
└── middleware.ts         # i18n & auth middleware
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with test data
npm run db:studio    # Open Prisma Studio
```

## License

MIT
