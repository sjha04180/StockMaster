import { createClient } from '@/lib/supabase/client'
import type { Warehouse } from '@/lib/types'

export async function getWarehouses() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data as Warehouse[]
}

export async function getWarehouse(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Warehouse
}

export async function createWarehouse(warehouse: Omit<Warehouse, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('warehouses')
    .insert(warehouse)
    .select()
    .single()
  
  if (error) throw error
  return data as Warehouse
}

export async function updateWarehouse(id: string, warehouse: Partial<Warehouse>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('warehouses')
    .update(warehouse)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Warehouse
}

export async function deleteWarehouse(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('warehouses')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

