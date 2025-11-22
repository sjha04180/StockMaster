Demo Video Link: https://drive.google.com/file/d/1QCf951j2ff1Iqn4fNCxfHrpkGw4P1t5-/view?usp=sharing
# StockMaster - Full-Stack Inventory Management System

A modern, production-ready inventory management system built with Next.js 14, Supabase, and TailwindCSS.

## 🚀 Features

- **Authentication**: Sign up, login, and OTP-based password reset
- **Dashboard**: Real-time KPIs and statistics
- **Products Management**: Complete CRUD operations with stock tracking
- **Receipts**: Manage incoming stock with status workflow
- **Deliveries**: Handle outgoing stock with validation
- **Internal Transfers**: Move stock between warehouses
- **Stock Adjustments**: Handle count differences, damage, and losses
- **Move History**: Complete ledger of all stock movements
- **Settings**: Manage warehouses, categories, and user profile

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: TailwindCSS + shadcn/ui
- **State Management**: Zustand
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL with Row Level Security
- **ORM/Queries**: Supabase JS Client
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## 🔧 Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd StockMaster
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration file:
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and execute in Supabase SQL Editor

### 4. Configure environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

You can find these values in your Supabase project settings under API.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
StockMaster/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── dashboard/       # Dashboard page
│   │   ├── products/        # Products module
│   │   ├── receipts/        # Receipts module
│   │   ├── deliveries/      # Deliveries module
│   │   ├── transfers/       # Internal transfers module
│   │   ├── adjustments/     # Stock adjustments module
│   │   ├── move-history/    # Stock movement ledger
│   │   ├── settings/        # Settings page
│   │   └── profile/         # User profile
│   ├── auth/                # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Layout components
│   └── settings/            # Settings components
├── lib/
│   ├── services/            # API service functions
│   ├── store/               # Zustand stores
│   ├── supabase/            # Supabase client config
│   └── types.ts             # TypeScript types
├── supabase/
│   └── migrations/          # Database migrations
└── public/                  # Static assets
```

## 🗄️ Database Schema

The system uses the following main tables:

- `users` - User profiles
- `warehouses` - Warehouse locations
- `categories` - Product categories
- `products` - Product catalog
- `stock_levels` - Current stock by warehouse
- `receipts` & `receipt_items` - Incoming stock
- `deliveries` & `delivery_items` - Outgoing stock
- `internal_transfers` & `transfer_items` - Internal transfers
- `adjustments` - Stock adjustments
- `stock_moves` - Complete movement ledger

## 🔐 Authentication

The app uses Supabase Auth with:
- Email/password authentication
- OTP-based password reset
- Row Level Security (RLS) for data protection
- Automatic user profile creation on signup

## 📊 Business Logic

### Stock Movements

All stock operations automatically:
1. Update `stock_levels` table
2. Create entries in `stock_moves` ledger
3. Track user and timestamp

### Status Workflows

- **Receipts/Deliveries/Transfers**: Draft → Waiting → Ready → Done
- **Validation**: Only "done" status updates stock levels

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

The app is optimized for Vercel deployment with Next.js 14.

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Supabase, and TailwindCSS

