import { createClient } from '@/lib/supabase/client'
import type { StockMove } from '@/lib/types'

export async function getStockMoves(filters?: {
  product_id?: string
  move_type?: string
  from_location?: string
  to_location?: string
  start_date?: string
  end_date?: string
}) {
  const supabase = createClient()
  let query = supabase
    .from('stock_moves')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (filters?.product_id) {
    query = query.eq('product_id', filters.product_id)
  }
  if (filters?.move_type) {
    query = query.eq('move_type', filters.move_type)
  }
  if (filters?.from_location) {
    query = query.eq('from_location', filters.from_location)
  }
  if (filters?.to_location) {
    query = query.eq('to_location', filters.to_location)
  }
  if (filters?.start_date) {
    query = query.gte('created_at', filters.start_date)
  }
  if (filters?.end_date) {
    query = query.lte('created_at', filters.end_date)
  }
  
  const { data: moves, error } = await query
  
  if (error) throw error
  
  // Fetch related data separately
  const supabaseClient = createClient()
  const movesWithRelations = await Promise.all(
    (moves || []).map(async (move) => {
      const [product, fromWarehouse, toWarehouse] = await Promise.all([
        move.product_id ? supabaseClient.from('products').select('*').eq('id', move.product_id).single() : Promise.resolve({ data: null }),
        move.from_location ? supabaseClient.from('warehouses').select('*').eq('id', move.from_location).single() : Promise.resolve({ data: null }),
        move.to_location ? supabaseClient.from('warehouses').select('*').eq('id', move.to_location).single() : Promise.resolve({ data: null }),
      ])
      
      return {
        ...move,
        product: product.data,
        from_warehouse: fromWarehouse.data,
        to_warehouse: toWarehouse.data,
      }
    })
  )
  
  return movesWithRelations as StockMove[]
}

