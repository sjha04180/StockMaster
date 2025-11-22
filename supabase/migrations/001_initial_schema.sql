-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Warehouses table
CREATE TABLE IF NOT EXISTS public.warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  uom TEXT NOT NULL DEFAULT 'pcs',
  reorder_level INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Stock levels table
CREATE TABLE IF NOT EXISTS public.stock_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(product_id, warehouse_id)
);

-- Receipts table
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'waiting', 'ready', 'done', 'canceled')),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Receipt items table
CREATE TABLE IF NOT EXISTS public.receipt_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_id UUID NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  qty INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Deliveries table
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'waiting', 'ready', 'done', 'canceled')),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Delivery items table
CREATE TABLE IF NOT EXISTS public.delivery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id UUID NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  qty INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Internal transfers table
CREATE TABLE IF NOT EXISTS public.internal_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  to_warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'waiting', 'ready', 'done', 'canceled')),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Transfer items table
CREATE TABLE IF NOT EXISTS public.transfer_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transfer_id UUID NOT NULL REFERENCES public.internal_transfers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  qty INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Adjustments table
CREATE TABLE IF NOT EXISTS public.adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  counted_qty INTEGER NOT NULL,
  reason TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Stock moves table (ledger)
CREATE TABLE IF NOT EXISTS public.stock_moves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  move_type TEXT NOT NULL CHECK (move_type IN ('RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT')),
  from_location UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  to_location UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  reference_id UUID,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_stock_levels_product ON public.stock_levels(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_warehouse ON public.stock_levels(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt ON public.receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_receipt_items_product ON public.receipt_items(product_id);
CREATE INDEX IF NOT EXISTS idx_delivery_items_delivery ON public.delivery_items(delivery_id);
CREATE INDEX IF NOT EXISTS idx_delivery_items_product ON public.delivery_items(product_id);
CREATE INDEX IF NOT EXISTS idx_transfer_items_transfer ON public.transfer_items(transfer_id);
CREATE INDEX IF NOT EXISTS idx_stock_moves_product ON public.stock_moves(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_moves_type ON public.stock_moves(move_type);
CREATE INDEX IF NOT EXISTS idx_stock_moves_created_at ON public.stock_moves(created_at);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_moves ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can read/write their own data and all authenticated users can read/write inventory data
-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Warehouses policies (all authenticated users)
CREATE POLICY "Authenticated users can view warehouses" ON public.warehouses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage warehouses" ON public.warehouses
  FOR ALL USING (auth.role() = 'authenticated');

-- Categories policies
CREATE POLICY "Authenticated users can view categories" ON public.categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage categories" ON public.categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Products policies
CREATE POLICY "Authenticated users can view products" ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage products" ON public.products
  FOR ALL USING (auth.role() = 'authenticated');

-- Stock levels policies
CREATE POLICY "Authenticated users can view stock levels" ON public.stock_levels
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage stock levels" ON public.stock_levels
  FOR ALL USING (auth.role() = 'authenticated');

-- Receipts policies
CREATE POLICY "Authenticated users can view receipts" ON public.receipts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage receipts" ON public.receipts
  FOR ALL USING (auth.role() = 'authenticated');

-- Receipt items policies
CREATE POLICY "Authenticated users can view receipt items" ON public.receipt_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage receipt items" ON public.receipt_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Deliveries policies
CREATE POLICY "Authenticated users can view deliveries" ON public.deliveries
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage deliveries" ON public.deliveries
  FOR ALL USING (auth.role() = 'authenticated');

-- Delivery items policies
CREATE POLICY "Authenticated users can view delivery items" ON public.delivery_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage delivery items" ON public.delivery_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Internal transfers policies
CREATE POLICY "Authenticated users can view transfers" ON public.internal_transfers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage transfers" ON public.internal_transfers
  FOR ALL USING (auth.role() = 'authenticated');

-- Transfer items policies
CREATE POLICY "Authenticated users can view transfer items" ON public.transfer_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage transfer items" ON public.transfer_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Adjustments policies
CREATE POLICY "Authenticated users can view adjustments" ON public.adjustments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage adjustments" ON public.adjustments
  FOR ALL USING (auth.role() = 'authenticated');

-- Stock moves policies
CREATE POLICY "Authenticated users can view stock moves" ON public.stock_moves
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage stock moves" ON public.stock_moves
  FOR ALL USING (auth.role() = 'authenticated');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON public.warehouses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_levels_updated_at BEFORE UPDATE ON public.stock_levels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON public.receipts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_internal_transfers_updated_at BEFORE UPDATE ON public.internal_transfers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

