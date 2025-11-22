import { createClient } from '@/lib/supabase/client'

export async function getDashboardStats() {
  const supabase = createClient()
  
  // Total products
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
  
  // Low stock items (below reorder level)
  const { data: products } = await supabase
    .from('products')
    .select('id, reorder_level')
  
  const { data: stockLevels } = await supabase
    .from('stock_levels')
    .select('product_id, quantity')
  
  const lowStockItems = products?.filter(product => {
    const totalStock = stockLevels
      ?.filter(sl => sl.product_id === product.id)
      .reduce((sum, sl) => sum + sl.quantity, 0) || 0
    return totalStock <= product.reorder_level
  }).length || 0
  
  // Out of stock items
  const outOfStockItems = products?.filter(product => {
    const totalStock = stockLevels
      ?.filter(sl => sl.product_id === product.id)
      .reduce((sum, sl) => sum + sl.quantity, 0) || 0
    return totalStock === 0
  }).length || 0
  
  // Pending receipts
  const { count: pendingReceipts } = await supabase
    .from('receipts')
    .select('*', { count: 'exact', head: true })
    .in('status', ['draft', 'waiting', 'ready'])
  
  // Pending deliveries
  const { count: pendingDeliveries } = await supabase
    .from('deliveries')
    .select('*', { count: 'exact', head: true })
    .in('status', ['draft', 'waiting', 'ready'])
  
  // Scheduled transfers
  const { count: scheduledTransfers } = await supabase
    .from('internal_transfers')
    .select('*', { count: 'exact', head: true })
    .in('status', ['draft', 'waiting', 'ready'])
  
  return {
    totalProducts: totalProducts || 0,
    lowStockItems,
    outOfStockItems,
    pendingReceipts: pendingReceipts || 0,
    pendingDeliveries: pendingDeliveries || 0,
    scheduledTransfers: scheduledTransfers || 0,
  }
}

