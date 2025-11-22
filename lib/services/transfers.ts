import { createClient } from '@/lib/supabase/client'
import type { InternalTransfer, TransferItem } from '@/lib/types'

export async function getTransfers() {
  const supabase = createClient()
  const { data: transfers, error } = await supabase
    .from('internal_transfers')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  // Fetch related data separately
  const transfersWithRelations = await Promise.all(
    (transfers || []).map(async (transfer) => {
      const supabaseClient = createClient()
      const [fromWarehouse, toWarehouse, items] = await Promise.all([
        supabaseClient.from('warehouses').select('*').eq('id', transfer.from_warehouse_id).single(),
        supabaseClient.from('warehouses').select('*').eq('id', transfer.to_warehouse_id).single(),
        supabaseClient
          .from('transfer_items')
          .select('*, product:products(*)')
          .eq('transfer_id', transfer.id),
      ])
      
      return {
        ...transfer,
        from_warehouse: fromWarehouse.data,
        to_warehouse: toWarehouse.data,
        items: items.data || [],
      }
    })
  )
  
  return transfersWithRelations as InternalTransfer[]
}

export async function getTransfer(id: string) {
  const supabase = createClient()
  const { data: transfer, error } = await supabase
    .from('internal_transfers')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  
  // Fetch related data
  const supabaseClient = createClient()
  const [fromWarehouse, toWarehouse, items] = await Promise.all([
    supabaseClient.from('warehouses').select('*').eq('id', transfer.from_warehouse_id).single(),
    supabaseClient.from('warehouses').select('*').eq('id', transfer.to_warehouse_id).single(),
    supabaseClient
      .from('transfer_items')
      .select('*, product:products(*)')
      .eq('transfer_id', transfer.id),
  ])
  
  return {
    ...transfer,
    from_warehouse: fromWarehouse.data,
    to_warehouse: toWarehouse.data,
    items: items.data || [],
  } as InternalTransfer
}

export async function createTransfer(transfer: Omit<InternalTransfer, 'id' | 'created_at' | 'updated_at' | 'items' | 'from_warehouse' | 'to_warehouse'>) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('internal_transfers')
    .insert({ ...transfer, created_by: user?.id })
    .select()
    .single()
  
  if (error) throw error
  return data as InternalTransfer
}

export async function updateTransfer(id: string, transfer: Partial<InternalTransfer>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('internal_transfers')
    .update(transfer)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as InternalTransfer
}

export async function addTransferItem(item: Omit<TransferItem, 'id' | 'created_at'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('transfer_items')
    .insert(item)
    .select()
    .single()
  
  if (error) throw error
  return data as TransferItem
}

export async function removeTransferItem(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('transfer_items')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function validateTransfer(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get transfer with items
  const transfer = await getTransfer(id)
  if (!transfer || !transfer.items) throw new Error('Transfer not found')
  
  // Update stock levels and create stock moves
  for (const item of transfer.items) {
    // Check stock availability at source
    const { data: fromStock } = await supabase
      .from('stock_levels')
      .select('*')
      .eq('product_id', item.product_id)
      .eq('warehouse_id', transfer.from_warehouse_id)
      .single()
    
    if (!fromStock || fromStock.quantity < item.qty) {
      throw new Error(`Insufficient stock at source warehouse for product ${item.product_id}`)
    }
    
    // Deduct from source
    await supabase
      .from('stock_levels')
      .update({ quantity: fromStock.quantity - item.qty })
      .eq('id', fromStock.id)
    
    // Add to destination
    const { data: toStock } = await supabase
      .from('stock_levels')
      .select('*')
      .eq('product_id', item.product_id)
      .eq('warehouse_id', transfer.to_warehouse_id)
      .single()
    
    if (toStock) {
      await supabase
        .from('stock_levels')
        .update({ quantity: toStock.quantity + item.qty })
        .eq('id', toStock.id)
    } else {
      await supabase
        .from('stock_levels')
        .insert({
          product_id: item.product_id,
          warehouse_id: transfer.to_warehouse_id,
          quantity: item.qty
        })
    }
    
    // Create stock move
    await supabase
      .from('stock_moves')
      .insert({
        product_id: item.product_id,
        quantity: item.qty,
        move_type: 'TRANSFER',
        from_location: transfer.from_warehouse_id,
        to_location: transfer.to_warehouse_id,
        reference_id: id,
        created_by: user?.id
      })
  }
  
  // Update transfer status
  return updateTransfer(id, { status: 'done' })
}

