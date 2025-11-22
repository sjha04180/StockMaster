# StockMaster - Local Setup Guide

Follow these exact steps to run the project locally on your machine.

## Prerequisites

Before starting, ensure you have:

1. **Node.js 18+** installed
   - Check version: `node --version`
   - Download from: https://nodejs.org/

2. **npm** (comes with Node.js)
   - Check version: `npm --version`

3. **A Supabase account** (free tier works)
   - Sign up at: https://supabase.com

---

## Step 1: Install Dependencies

Open your terminal in the project root directory and run:

```bash
npm install
```

This will install all required packages including Next.js, React, Supabase, and UI components.

**Expected time:** 2-5 minutes

---

## Step 2: Create Supabase Project

1. Go to https://supabase.com and sign in (or create an account)
2. Click **"New Project"**
3. Fill in the details:
   - **Name:** StockMaster (or any name you prefer)
   - **Database Password:** Create a strong password (save it securely)
   - **Region:** Choose the closest region to you
4. Click **"Create new project"**
5. Wait for the project to be set up (2-3 minutes)

---

## Step 3: Get Supabase Credentials

Once your Supabase project is ready:

1. In your Supabase dashboard, go to **Settings** → **API**
2. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (a long JWT token)

3. Copy both values - you'll need them in the next step

---

## Step 4: Set Up Environment Variables

1. In your project root, create a file named `.env.local`
   - If you're on Windows and can't create it directly, use:
     ```bash
     type nul > .env.local
     ```

2. Open `.env.local` in a text editor and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example_key_here
```

**Important:** 
- Replace `your_project_url_here` with your actual Project URL
- Replace `your_anon_key_here` with your actual anon/public key
- Do NOT commit this file to git (it's already in .gitignore)

---

## Step 5: Run Database Migration

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file `supabase/migrations/001_initial_schema.sql` from your project
4. Copy **ALL** the contents of that file (Ctrl+A, Ctrl+C)
5. Paste it into the Supabase SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. Wait for the query to complete - you should see "Success. No rows returned"

**What this does:**
- Creates all database tables (users, products, warehouses, etc.)
- Sets up Row Level Security (RLS) policies
- Creates indexes for performance
- Sets up automatic timestamp updates

**Expected time:** 10-30 seconds

---

## Step 6: Verify Database Setup

1. In Supabase dashboard, go to **Table Editor** (left sidebar)
2. You should see these tables:
   - users
   - warehouses
   - categories
   - products
   - stock_levels
   - receipts
   - receipt_items
   - deliveries
   - delivery_items
   - internal_transfers
   - transfer_items
   - adjustments
   - stock_moves

If you see all these tables, the migration was successful! ✅

---

## Step 7: Start the Development Server

Back in your terminal (in the project root), run:

```bash
npm run dev
```

You should see output like:
```
▲ Next.js 14.2.5
- Local:        http://localhost:3000
- Ready in 2.3s
```

---

## Step 8: Open the Application

1. Open your web browser
2. Navigate to: **http://localhost:3000**
3. You should see the login page

---

## Step 9: Create Your First Account

1. Click **"Sign up"** on the login page
2. Enter:
   - **Name:** Your name
   - **Email:** Your email address
   - **Password:** At least 6 characters
3. Click **"Sign up"**
4. You'll be redirected to the login page
5. **Important:** Check your email and click the verification link from Supabase
6. After verification, log in with your credentials
7. You should be redirected to the Dashboard! 🎉

---

## Step 10: Initial Setup (Recommended)

After logging in, set up some basic data:

1. **Go to Settings** (left sidebar)
2. **Create at least one Warehouse:**
   - Click "Add Warehouse"
   - Enter name (e.g., "Main Warehouse")
   - Enter address (optional)
   - Click "Create"

3. **Create at least one Category:**
   - Switch to "Categories" tab
   - Click "Add Category"
   - Enter name (e.g., "Electronics")
   - Click "Create"

4. **Create your first Product:**
   - Go to "Products" (left sidebar)
   - Click "Add Product"
   - Fill in the form:
     - Name: "Sample Product"
     - SKU: "SKU-001"
     - Category: Select the category you created
     - UOM: "pcs"
     - Reorder Level: 10
     - Initial Stock: 100 (optional)
     - Warehouse: Select your warehouse (if you added initial stock)
   - Click "Create Product"

Now you're ready to use the system! 🚀

---

## Troubleshooting

### Issue: `npm install` fails
**Solution:** 
- Make sure you have Node.js 18+ installed
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again

### Issue: "Invalid API key" error
**Solution:**
- Double-check your `.env.local` file
- Make sure there are no extra spaces or quotes
- Verify the keys in Supabase Settings → API

### Issue: Database tables not showing
**Solution:**
- Go back to SQL Editor in Supabase
- Re-run the migration SQL
- Check for any error messages

### Issue: Port 3000 already in use
**Solution:**
- Stop any other Next.js apps running
- Or use a different port: `npm run dev -- -p 3001`

### Issue: "Module not found" errors
**Solution:**
- Run `npm install` again
- Make sure you're in the project root directory

### Issue: Can't sign up/login
**Solution:**
- Check your Supabase project is active (not paused)
- Verify email confirmation is enabled in Supabase Auth settings
- Check browser console for error messages

---

## Next Steps

Once everything is running:

1. **Explore the Dashboard** - See your KPIs
2. **Add more products** - Build your inventory
3. **Create a receipt** - Add incoming stock
4. **Create a delivery** - Process outgoing stock
5. **Try a transfer** - Move stock between warehouses
6. **Check Move History** - See all stock movements

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## Need Help?

- Check the main README.md for more information
- Review Supabase documentation: https://supabase.com/docs
- Check Next.js documentation: https://nextjs.org/docs

---

**You're all set! Happy coding! 🎉**





