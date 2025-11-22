# Runtime Error Fixes

## Common Runtime Errors and Solutions

### 1. Missing Environment Variables Error

**Error:** `Missing Supabase environment variables`

**Solution:**
1. Create a `.env.local` file in the project root
2. Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Restart the dev server after adding environment variables

### 2. Supabase Client Initialization Error

**Error:** `Cannot read property of undefined` or similar

**Solution:**
- The code now includes proper error handling
- Check that your `.env.local` file is in the root directory
- Ensure variable names match exactly (case-sensitive)

### 3. Middleware Errors

**Error:** Middleware crashes on startup

**Solution:**
- The middleware now gracefully handles missing environment variables
- It will redirect to login page if env vars are missing

### 4. Window Object Errors

**Error:** `window is not defined`

**Solution:**
- Fixed in forgot-password page
- All `window` usage is now properly guarded with `typeof window !== 'undefined'`

## What Was Fixed

1. ✅ Added environment variable validation in Supabase clients
2. ✅ Added error handling in middleware for missing env vars
3. ✅ Fixed `window` object usage in client components
4. ✅ Added try-catch in dashboard layout
5. ✅ Improved error messages for debugging

## Testing the Fixes

After applying these fixes:

1. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Check the terminal** - you should see:
   - No environment variable errors
   - Server starting successfully
   - No middleware errors

3. **If you still see errors:**
   - Share the exact error message
   - Check that `.env.local` exists and has correct values
   - Verify Supabase project is active

## Next Steps

If errors persist, please share:
- The exact error message from terminal
- Which page/route triggers the error
- Your `.env.local` file structure (without actual keys)





