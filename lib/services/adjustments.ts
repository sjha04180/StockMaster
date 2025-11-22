import { createClient } from '@/lib/supabase/client'
import type { Adjustment } from '@/lib/types'

export async function getAdjustments() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('adjustments')
    .select('*, product:products(*), warehouse:warehouses(*)')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Adjustment[]
}

export async function getAdjustment(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('adjustments')
    .select('*, product:products(*), warehouse:warehouses(*)')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Adjustment
}

export async function createAdjustment(adjustment: Omit<Adjustment, 'id' | 'created_at'>) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get current stock level
  const { data: stockLevel } = await supabase
    .from('stock_levels')
    .select('*')
    .eq('product_id', adjustment.product_id)
    .eq('warehouse_id', adjustment.warehouse_id)
    .single()
  
  const expectedQty = stockLevel?.quantity || 0
  const difference = adjustment.counted_qty - expectedQty
  
  // Create adjustment record
  const { data, error } = await supabase
    .from('adjustments')
    .insert({ ...adjustment, created_by: user?.id })
    .select()
    .single()
  
  if (error) throw error
  
  // Update stock level
  if (stockLevel) {
    await supabase
      .from('stock_levels')
      .update({ quantity: adjustment.counted_qty })
      .eq('id', stockLevel.id)
  } else {
    await supabase
      .from('stock_levels')
      .insert({
        product_id: adjustment.product_id,
        warehouse_id: adjustment.warehouse_id,
        quantity: adjustment.counted_qty
      })
  }
  
  // Create stock move
  await supabase
    .from('stock_moves')
    .insert({
      product_id: adjustment.product_id,
      quantity: difference,
      move_type: 'ADJUSTMENT',
      from_location: adjustment.warehouse_id,
      to_location: adjustment.warehouse_id,
      reference_id: data.id,
      created_by: user?.id
    })
  
  return data as Adjustment
}

