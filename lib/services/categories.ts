import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/types'

export async function getCategories() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data as Category[]
}

export async function getCategory(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Category
}

export async function createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single()
  
  if (error) throw error
  return data as Category
}

export async function updateCategory(id: string, category: Partial<Category>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Category
}

export async function deleteCategory(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

