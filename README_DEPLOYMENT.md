# 🚀 Deploy StockMaster to Vercel

## Quick Deployment Steps

### 1. Push to GitHub

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/StockMaster.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

1. **Go to:** https://vercel.com/new
2. **Sign in** with GitHub
3. **Import** your `StockMaster` repository
4. **Add Environment Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key
5. **Click "Deploy"**
6. **Wait 2-3 minutes** for build to complete

### 3. Update Supabase Settings

After deployment, update Supabase:

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs:**
   ```
   https://your-project.vercel.app/auth/callback
   https://your-project.vercel.app/**
   ```
3. Set **Site URL:** `https://your-project.vercel.app`

### 4. Test Your Live Site

Visit: `https://your-project.vercel.app`

---

## Environment Variables in Vercel

Add these in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Value | Where to Find |
|----------|-------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase Dashboard → Settings → API |

**Important:** Select all environments (Production, Preview, Development)

---

## Post-Deployment Checklist

- [ ] Environment variables added in Vercel
- [ ] Supabase redirect URLs updated
- [ ] Site is accessible
- [ ] Login works
- [ ] Can create products
- [ ] Database migration is run in Supabase

---

## Troubleshooting

**Build fails?**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`

**"Missing env vars" error?**
- Verify environment variables are set in Vercel
- Make sure variable names match exactly

**Auth not working?**
- Update Supabase redirect URLs
- Check Supabase project is active

---

## Cost

- **Vercel:** Free tier (unlimited deployments)
- **Supabase:** Free tier (500MB database)
- **Total:** $0/month for small-medium usage

---

For detailed instructions, see `VERCEL_DEPLOYMENT.md`

