# Quick Start: Deploy to Vercel in 5 Minutes

## Fast Track Deployment

### 1. Push to GitHub (2 min)

```bash
# If not already a git repo
git init
git add .
git commit -m "Ready for deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/StockMaster.git
git push -u origin main
```

### 2. Deploy to Vercel (3 min)

1. **Go to:** https://vercel.com/new
2. **Import** your GitHub repository
3. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key
   ```
4. **Click "Deploy"**
5. **Wait 2-3 minutes** for build

### 3. Update Supabase (1 min)

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs:**
   - `https://your-project.vercel.app/auth/callback`
   - `https://your-project.vercel.app/**`
3. Update **Site URL:** `https://your-project.vercel.app`

### 4. Done! ✅

Visit your Vercel URL and test the app!

---

## Important Notes

- ✅ Your `.env.local` file is NOT pushed to GitHub (it's in `.gitignore`)
- ✅ Add environment variables in Vercel dashboard, not in code
- ✅ Update Supabase redirect URLs after deployment
- ✅ Database migration must be run in Supabase (not Vercel)

---

## Need Help?

See `VERCEL_DEPLOYMENT.md` for detailed instructions.

