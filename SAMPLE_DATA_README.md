# Sample Data Setup

This file contains instructions for adding sample product data to your StockMaster database.

## How to Add Sample Data

1. **Go to your Supabase Dashboard**
   - Navigate to SQL Editor

2. **Run the Sample Data Migration**
   - Open the file: `supabase/migrations/002_sample_data.sql`
   - Copy ALL the contents
   - Paste into Supabase SQL Editor
   - Click "Run"

3. **What Gets Added:**
   - **8 Categories**: Electronics, Clothing, Food & Beverages, Home & Garden, Sports & Outdoors, Books, Toys & Games, Health & Beauty
   - **3 Warehouses**: Main Warehouse, East Coast Distribution, West Coast Distribution
   - **20 Sample Products** with realistic names and SKUs:
     - Electronics: Laptops, Mice, Cables, Keyboards, Monitors
     - Clothing: T-Shirts, Jeans, Shoes, Jackets
     - Food: Coffee, Tea, Energy Bars
     - Home: Garden Tools, Plant Pots
     - Sports: Yoga Mats, Dumbbells, Basketballs
     - Books: Programming Books
     - Toys: Board Games
     - Health: Face Moisturizer
   - **Stock Levels**: Each product has stock distributed across the 3 warehouses

4. **Verify the Data**
   - Go to your app → Products page
   - You should see 20 products
   - Go to Settings → Warehouses to see 3 warehouses
   - Go to Settings → Categories to see 8 categories

## Notes

- The migration uses `ON CONFLICT DO NOTHING` so it's safe to run multiple times
- Stock levels are automatically calculated and distributed
- All products have realistic reorder levels set

Enjoy exploring the system with sample data! 🎉

