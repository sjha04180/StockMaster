# Deploying StockMaster to Vercel

Complete guide to deploy your StockMaster inventory management system to Vercel.

## Prerequisites

1. **GitHub Account** (or GitLab/Bitbucket)
2. **Vercel Account** (free tier works)
   - Sign up at: https://vercel.com
3. **Supabase Project** (already set up)
4. **Your code pushed to GitHub**

---

## Step 1: Push Code to GitHub

### 1.1 Initialize Git Repository (if not already done)

```bash
# In your project root directory
git init
git add .
git commit -m "Initial commit: StockMaster inventory system"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com
2. Click **"New repository"**
3. Name it: `StockMaster` (or any name)
4. **Don't** initialize with README (you already have one)
5. Click **"Create repository"**

### 1.3 Push to GitHub

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/StockMaster.git

# Push your code
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username**

---

## Step 2: Set Up Vercel Project

### 2.1 Sign in to Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"** (or **"Log In"** if you have an account)
3. Sign in with GitHub (recommended for easy integration)

### 2.2 Import Your Project

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. You'll see your GitHub repositories
3. Find **"StockMaster"** and click **"Import"**

### 2.3 Configure Project

Vercel will auto-detect Next.js settings:
- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `./` (leave as is)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

**Click "Deploy"** (don't deploy yet - we need to add environment variables first)

---

## Step 3: Add Environment Variables

### 3.1 Before Deploying

Before clicking "Deploy", click **"Environment Variables"** section

### 3.2 Add Your Supabase Credentials

Add these three environment variables:

1. **`NEXT_PUBLIC_SUPABASE_URL`**
   - Value: Your Supabase project URL
   - Example: `https://abcdefghijklmnop.supabase.co`
   - Environment: Production, Preview, Development (select all)

2. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
   - Value: Your Supabase anon/public key
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Environment: Production, Preview, Development (select all)

3. **`SUPABASE_SERVICE_ROLE_KEY`** (optional, for admin operations)
   - Value: Your Supabase service role key
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Environment: Production, Preview, Development (select all)
   - **Note:** Keep this secret! Don't expose it in client-side code.

### 3.3 Where to Find Supabase Keys

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. You'll see:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → Use for `SUPABASE_SERVICE_ROLE_KEY` (optional)

---

## Step 4: Deploy

### 4.1 Start Deployment

1. After adding environment variables, click **"Deploy"**
2. Vercel will:
   - Install dependencies
   - Build your Next.js app
   - Deploy to production

### 4.2 Wait for Build

- Build time: Usually 2-5 minutes
- You'll see build logs in real-time
- If build fails, check the error messages

---

## Step 5: Post-Deployment Setup

### 5.1 Update Supabase Auth Settings

After deployment, you need to update Supabase Auth redirect URLs:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Redirect URLs**:
   - `https://your-project.vercel.app/auth/callback`
   - `https://your-project.vercel.app/**`
3. Add to **Site URL**:
   - `https://your-project.vercel.app`

### 5.2 Update Password Reset Redirect

1. In Supabase Dashboard → **Authentication** → **Email Templates**
2. Update the password reset template redirect URL to:
   - `https://your-project.vercel.app/auth/reset-password`

Or update the code in `app/auth/forgot-password/page.tsx` to use your production URL.

---

## Step 6: Verify Deployment

### 6.1 Test Your Live Site

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. You should see the login page
3. Try logging in with your credentials
4. Test creating a product, receipt, etc.

### 6.2 Common Issues

**Issue: "Missing Supabase environment variables"**
- **Solution:** Check that all env vars are added in Vercel dashboard

**Issue: "Cannot connect to Supabase"**
- **Solution:** Verify your Supabase project is active (not paused)

**Issue: "Redirect URL mismatch"**
- **Solution:** Update Supabase Auth redirect URLs (Step 5.1)

**Issue: "Database tables not found"**
- **Solution:** Make sure you ran the migration SQL in Supabase

---

## Step 7: Custom Domain (Optional)

### 7.1 Add Custom Domain

1. In Vercel dashboard → Your project → **Settings** → **Domains**
2. Enter your domain name
3. Follow Vercel's DNS configuration instructions
4. Wait for DNS propagation (can take up to 24 hours)

---

## Step 8: Continuous Deployment

### 8.1 Automatic Deployments

Vercel automatically deploys when you:
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployment
- Open a Pull Request → Preview deployment

### 8.2 Manual Deployment

You can also trigger deployments manually:
1. Go to Vercel dashboard
2. Click **"Deployments"** tab
3. Click **"Redeploy"** on any deployment

---

## Step 9: Environment-Specific Settings

### 9.1 Production vs Preview

- **Production:** Uses `main` branch, production URL
- **Preview:** Uses other branches/PRs, preview URLs
- Both can have different environment variables if needed

### 9.2 Update Environment Variables

1. Go to Vercel dashboard → Your project → **Settings** → **Environment Variables**
2. Add/edit variables as needed
3. Redeploy for changes to take effect

---

## Step 10: Monitoring & Analytics

### 10.1 Vercel Analytics (Optional)

1. In Vercel dashboard → Your project → **Analytics**
2. Enable Vercel Analytics (free tier available)
3. Monitor performance, page views, etc.

### 10.2 Error Monitoring

- Check Vercel **Logs** tab for runtime errors
- Use browser DevTools for client-side errors
- Check Supabase logs for database errors

---

## Quick Checklist

Before deploying, ensure:

- [ ] Code is pushed to GitHub
- [ ] Supabase project is set up
- [ ] Database migration is run
- [ ] Environment variables are ready
- [ ] `.env.local` is NOT committed (it's in `.gitignore`)

After deploying:

- [ ] Environment variables are added in Vercel
- [ ] Supabase redirect URLs are updated
- [ ] Site is accessible
- [ ] Login works
- [ ] Can create products/receipts/etc.

---

## Troubleshooting

### Build Fails

**Check:**
- Node.js version compatibility
- Missing dependencies in `package.json`
- TypeScript errors
- Build logs in Vercel dashboard

### Runtime Errors

**Check:**
- Environment variables are set correctly
- Supabase project is active
- Database tables exist
- RLS policies are correct

### Authentication Issues

**Check:**
- Supabase Auth redirect URLs
- Email templates redirect URLs
- CORS settings in Supabase

---

## Cost Estimate

### Vercel (Free Tier)
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic SSL
- ✅ Custom domains
- ✅ Preview deployments

### Supabase (Free Tier)
- ✅ 500MB database
- ✅ 2GB bandwidth
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests

**Total Cost: $0/month** (for small to medium usage)

---

## Next Steps After Deployment

1. **Set up monitoring** - Enable Vercel Analytics
2. **Add custom domain** - Use your own domain name
3. **Set up backups** - Export Supabase data regularly
4. **Enable 2FA** - Secure your Vercel account
5. **Set up alerts** - Get notified of deployment failures

---

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Supabase Docs:** https://supabase.com/docs

---

**Your app should now be live! 🚀**

Visit your Vercel URL and start using StockMaster in production!

