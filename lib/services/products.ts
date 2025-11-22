import { createClient } from '@/lib/supabase/client'
import type { Product, StockLevel } from '@/lib/types'

export async function getProducts() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Product[]
}

export async function getProduct(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Product
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()
  
  if (error) throw error
  return data as Product
}

export async function updateProduct(id: string, product: Partial<Product>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Product
}

export async function deleteProduct(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getProductStockLevels(productId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('stock_levels')
    .select('*, warehouse:warehouses(*), product:products(*)')
    .eq('product_id', productId)
  
  if (error) throw error
  return data as StockLevel[]
}

export async function getTotalStock(productId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('stock_levels')
    .select('quantity')
    .eq('product_id', productId)
  
  if (error) throw error
  return data.reduce((sum, item) => sum + item.quantity, 0)
}

