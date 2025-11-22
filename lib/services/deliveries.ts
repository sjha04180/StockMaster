import { createClient } from '@/lib/supabase/client'
import type { Delivery, DeliveryItem } from '@/lib/types'

export async function getDeliveries() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('deliveries')
    .select('*, items:delivery_items(*, product:products(*), warehouse:warehouses(*))')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Delivery[]
}

export async function getDelivery(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('deliveries')
    .select('*, items:delivery_items(*, product:products(*), warehouse:warehouses(*))')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Delivery
}

export async function createDelivery(delivery: Omit<Delivery, 'id' | 'created_at' | 'updated_at' | 'items'>) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('deliveries')
    .insert({ ...delivery, created_by: user?.id })
    .select()
    .single()
  
  if (error) throw error
  return data as Delivery
}

export async function updateDelivery(id: string, delivery: Partial<Delivery>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('deliveries')
    .update(delivery)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Delivery
}

export async function addDeliveryItem(item: Omit<DeliveryItem, 'id' | 'created_at'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('delivery_items')
    .insert(item)
    .select()
    .single()
  
  if (error) throw error
  return data as DeliveryItem
}

export async function removeDeliveryItem(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('delivery_items')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function validateDelivery(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get delivery with items
  const delivery = await getDelivery(id)
  if (!delivery || !delivery.items) throw new Error('Delivery not found')
  
  // Update stock levels and create stock moves
  for (const item of delivery.items) {
    // Check stock availability
    const { data: stockLevel } = await supabase
      .from('stock_levels')
      .select('*')
      .eq('product_id', item.product_id)
      .eq('warehouse_id', item.warehouse_id)
      .single()
    
    if (!stockLevel || stockLevel.quantity < item.qty) {
      throw new Error(`Insufficient stock for product ${item.product_id}`)
    }
    
    // Update stock level
    await supabase
      .from('stock_levels')
      .update({ quantity: stockLevel.quantity - item.qty })
      .eq('id', stockLevel.id)
    
    // Create stock move
    await supabase
      .from('stock_moves')
      .insert({
        product_id: item.product_id,
        quantity: -item.qty,
        move_type: 'DELIVERY',
        from_location: item.warehouse_id,
        reference_id: id,
        created_by: user?.id
      })
  }
  
  // Update delivery status
  return updateDelivery(id, { status: 'done' })
}

