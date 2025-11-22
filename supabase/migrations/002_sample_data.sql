-- Sample Categories
INSERT INTO public.categories (name) VALUES
  ('Electronics'),
  ('Clothing'),
  ('Food & Beverages'),
  ('Home & Garden'),
  ('Sports & Outdoors'),
  ('Books'),
  ('Toys & Games'),
  ('Health & Beauty')
ON CONFLICT (name) DO NOTHING;

-- Sample Warehouses
INSERT INTO public.warehouses (name, address) VALUES
  ('Main Warehouse', '123 Industrial Blvd, City, State 12345'),
  ('East Coast Distribution', '456 Commerce St, City, State 67890'),
  ('West Coast Distribution', '789 Logistics Ave, City, State 54321')
ON CONFLICT DO NOTHING;

-- Sample Products (will be inserted after categories exist)
-- Note: These will need category IDs from the categories table
-- You may need to adjust the category_id values based on your actual category IDs

DO $$
DECLARE
  electronics_id UUID;
  clothing_id UUID;
  food_id UUID;
  home_id UUID;
  sports_id UUID;
  books_id UUID;
  toys_id UUID;
  health_id UUID;
  main_warehouse_id UUID;
  east_warehouse_id UUID;
  west_warehouse_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO electronics_id FROM public.categories WHERE name = 'Electronics' LIMIT 1;
  SELECT id INTO clothing_id FROM public.categories WHERE name = 'Clothing' LIMIT 1;
  SELECT id INTO food_id FROM public.categories WHERE name = 'Food & Beverages' LIMIT 1;
  SELECT id INTO home_id FROM public.categories WHERE name = 'Home & Garden' LIMIT 1;
  SELECT id INTO sports_id FROM public.categories WHERE name = 'Sports & Outdoors' LIMIT 1;
  SELECT id INTO books_id FROM public.categories WHERE name = 'Books' LIMIT 1;
  SELECT id INTO toys_id FROM public.categories WHERE name = 'Toys & Games' LIMIT 1;
  SELECT id INTO health_id FROM public.categories WHERE name = 'Health & Beauty' LIMIT 1;

  -- Get warehouse IDs
  SELECT id INTO main_warehouse_id FROM public.warehouses WHERE name = 'Main Warehouse' LIMIT 1;
  SELECT id INTO east_warehouse_id FROM public.warehouses WHERE name = 'East Coast Distribution' LIMIT 1;
  SELECT id INTO west_warehouse_id FROM public.warehouses WHERE name = 'West Coast Distribution' LIMIT 1;

  -- Insert Sample Products
  INSERT INTO public.products (name, sku, category_id, uom, reorder_level) VALUES
    ('Laptop Pro 15"', 'LAP-001', electronics_id, 'pcs', 10),
    ('Wireless Mouse', 'MOU-001', electronics_id, 'pcs', 50),
    ('USB-C Cable', 'CAB-001', electronics_id, 'pcs', 100),
    ('Mechanical Keyboard', 'KEY-001', electronics_id, 'pcs', 25),
    ('Monitor 27" 4K', 'MON-001', electronics_id, 'pcs', 15),
    ('Cotton T-Shirt', 'TSH-001', clothing_id, 'pcs', 100),
    ('Denim Jeans', 'JEA-001', clothing_id, 'pcs', 50),
    ('Running Shoes', 'SHO-001', clothing_id, 'pcs', 30),
    ('Winter Jacket', 'JAC-001', clothing_id, 'pcs', 20),
    ('Coffee Beans Premium', 'COF-001', food_id, 'kg', 50),
    ('Organic Green Tea', 'TEA-001', food_id, 'pcs', 100),
    ('Energy Bar Pack', 'BAR-001', food_id, 'pcs', 200),
    ('Garden Tool Set', 'GAR-001', home_id, 'pcs', 15),
    ('Indoor Plant Pot', 'POT-001', home_id, 'pcs', 75),
    ('Yoga Mat', 'YOG-001', sports_id, 'pcs', 40),
    ('Dumbbell Set 10kg', 'DUM-001', sports_id, 'pcs', 20),
    ('Basketball', 'BAS-001', sports_id, 'pcs', 30),
    ('Programming Book', 'BOK-001', books_id, 'pcs', 25),
    ('Board Game Set', 'GAM-001', toys_id, 'pcs', 15),
    ('Face Moisturizer', 'BEA-001', health_id, 'pcs', 50)
  ON CONFLICT (sku) DO NOTHING;

  -- Insert Sample Stock Levels for Main Warehouse
  INSERT INTO public.stock_levels (product_id, warehouse_id, quantity)
  SELECT p.id, main_warehouse_id, 
    CASE 
      WHEN p.sku LIKE 'LAP%' THEN 25
      WHEN p.sku LIKE 'MOU%' THEN 150
      WHEN p.sku LIKE 'CAB%' THEN 300
      WHEN p.sku LIKE 'KEY%' THEN 75
      WHEN p.sku LIKE 'MON%' THEN 40
      WHEN p.sku LIKE 'TSH%' THEN 250
      WHEN p.sku LIKE 'JEA%' THEN 120
      WHEN p.sku LIKE 'SHO%' THEN 80
      WHEN p.sku LIKE 'JAC%' THEN 45
      WHEN p.sku LIKE 'COF%' THEN 200
      WHEN p.sku LIKE 'TEA%' THEN 350
      WHEN p.sku LIKE 'BAR%' THEN 500
      WHEN p.sku LIKE 'GAR%' THEN 30
      WHEN p.sku LIKE 'POT%' THEN 200
      WHEN p.sku LIKE 'YOG%' THEN 100
      WHEN p.sku LIKE 'DUM%' THEN 50
      WHEN p.sku LIKE 'BAS%' THEN 75
      WHEN p.sku LIKE 'BOK%' THEN 60
      WHEN p.sku LIKE 'GAM%' THEN 35
      WHEN p.sku LIKE 'BEA%' THEN 150
      ELSE 50
    END
  FROM public.products p
  WHERE NOT EXISTS (
    SELECT 1 FROM public.stock_levels sl 
    WHERE sl.product_id = p.id AND sl.warehouse_id = main_warehouse_id
  );

  -- Insert Sample Stock Levels for East Warehouse
  INSERT INTO public.stock_levels (product_id, warehouse_id, quantity)
  SELECT p.id, east_warehouse_id, 
    CASE 
      WHEN p.sku LIKE 'LAP%' THEN 15
      WHEN p.sku LIKE 'MOU%' THEN 100
      WHEN p.sku LIKE 'CAB%' THEN 200
      WHEN p.sku LIKE 'KEY%' THEN 50
      WHEN p.sku LIKE 'MON%' THEN 25
      WHEN p.sku LIKE 'TSH%' THEN 180
      WHEN p.sku LIKE 'JEA%' THEN 90
      WHEN p.sku LIKE 'SHO%' THEN 60
      WHEN p.sku LIKE 'JAC%' THEN 30
      WHEN p.sku LIKE 'COF%' THEN 150
      WHEN p.sku LIKE 'TEA%' THEN 250
      WHEN p.sku LIKE 'BAR%' THEN 400
      WHEN p.sku LIKE 'GAR%' THEN 20
      WHEN p.sku LIKE 'POT%' THEN 150
      WHEN p.sku LIKE 'YOG%' THEN 70
      WHEN p.sku LIKE 'DUM%' THEN 35
      WHEN p.sku LIKE 'BAS%' THEN 50
      WHEN p.sku LIKE 'BOK%' THEN 40
      WHEN p.sku LIKE 'GAM%' THEN 25
      WHEN p.sku LIKE 'BEA%' THEN 100
      ELSE 30
    END
  FROM public.products p
  WHERE NOT EXISTS (
    SELECT 1 FROM public.stock_levels sl 
    WHERE sl.product_id = p.id AND sl.warehouse_id = east_warehouse_id
  );

  -- Insert Sample Stock Levels for West Warehouse
  INSERT INTO public.stock_levels (product_id, warehouse_id, quantity)
  SELECT p.id, west_warehouse_id, 
    CASE 
      WHEN p.sku LIKE 'LAP%' THEN 20
      WHEN p.sku LIKE 'MOU%' THEN 120
      WHEN p.sku LIKE 'CAB%' THEN 250
      WHEN p.sku LIKE 'KEY%' THEN 60
      WHEN p.sku LIKE 'MON%' THEN 30
      WHEN p.sku LIKE 'TSH%' THEN 200
      WHEN p.sku LIKE 'JEA%' THEN 100
      WHEN p.sku LIKE 'SHO%' THEN 70
      WHEN p.sku LIKE 'JAC%' THEN 35
      WHEN p.sku LIKE 'COF%' THEN 180
      WHEN p.sku LIKE 'TEA%' THEN 300
      WHEN p.sku LIKE 'BAR%' THEN 450
      WHEN p.sku LIKE 'GAR%' THEN 25
      WHEN p.sku LIKE 'POT%' THEN 180
      WHEN p.sku LIKE 'YOG%' THEN 85
      WHEN p.sku LIKE 'DUM%' THEN 40
      WHEN p.sku LIKE 'BAS%' THEN 60
      WHEN p.sku LIKE 'BOK%' THEN 50
      WHEN p.sku LIKE 'GAM%' THEN 30
      WHEN p.sku LIKE 'BEA%' THEN 120
      ELSE 40
    END
  FROM public.products p
  WHERE NOT EXISTS (
    SELECT 1 FROM public.stock_levels sl 
    WHERE sl.product_id = p.id AND sl.warehouse_id = west_warehouse_id
  );

END $$;

