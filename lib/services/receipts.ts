import { createClient } from '@/lib/supabase/client'
import { ensureUserProfile } from '@/lib/utils/user'
import type { Receipt, ReceiptItem } from '@/lib/types'

export async function getReceipts() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('receipts')
    .select('*, items:receipt_items(*, product:products(*), warehouse:warehouses(*))')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Receipt[]
}

export async function getReceipt(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('receipts')
    .select('*, items:receipt_items(*, product:products(*), warehouse:warehouses(*))')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Receipt
}

export async function createReceipt(receipt: Omit<Receipt, 'id' | 'created_at' | 'updated_at' | 'items'>) {
  const supabase = createClient()
  const userId = await ensureUserProfile()
  
  const { data, error } = await supabase
    .from('receipts')
    .insert({ ...receipt, created_by: userId })
    .select()
    .single()
  
  if (error) throw error
  return data as Receipt
}

export async function updateReceipt(id: string, receipt: Partial<Receipt>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('receipts')
    .update(receipt)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Receipt
}

export async function addReceiptItem(item: Omit<ReceiptItem, 'id' | 'created_at'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('receipt_items')
    .insert(item)
    .select()
    .single()
  
  if (error) throw error
  return data as ReceiptItem
}

export async function removeReceiptItem(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('receipt_items')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function validateReceipt(id: string) {
  const supabase = createClient()
  const userId = await ensureUserProfile()
  
  // Get receipt with items
  const receipt = await getReceipt(id)
  if (!receipt || !receipt.items) throw new Error('Receipt not found')
  
  // Update stock levels and create stock moves
  for (const item of receipt.items) {
    // Update stock level
    const { data: stockLevel } = await supabase
      .from('stock_levels')
      .select('*')
      .eq('product_id', item.product_id)
      .eq('warehouse_id', item.warehouse_id)
      .single()
    
    if (stockLevel) {
      await supabase
        .from('stock_levels')
        .update({ quantity: stockLevel.quantity + item.qty })
        .eq('id', stockLevel.id)
    } else {
      await supabase
        .from('stock_levels')
        .insert({
          product_id: item.product_id,
          warehouse_id: item.warehouse_id,
          quantity: item.qty
        })
    }
    
    // Create stock move
    await supabase
      .from('stock_moves')
      .insert({
        product_id: item.product_id,
        quantity: item.qty,
        move_type: 'RECEIPT',
        to_location: item.warehouse_id,
        reference_id: id,
        created_by: userId
      })
  }
  
  // Update receipt status
  return updateReceipt(id, { status: 'done' })
}

