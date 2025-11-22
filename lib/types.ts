export type User = {
  id: string
  name: string | null
  email: string
  role: string
  created_at: string
  updated_at: string
}

export type Warehouse = {
  id: string
  name: string
  address: string | null
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  name: string
  sku: string
  category_id: string | null
  uom: string
  reorder_level: number
  created_at: string
  updated_at: string
  category?: Category
}

export type StockLevel = {
  id: string
  product_id: string
  warehouse_id: string
  quantity: number
  created_at: string
  updated_at: string
  product?: Product
  warehouse?: Warehouse
}

export type Receipt = {
  id: string
  supplier: string | null
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'canceled'
  created_by: string | null
  created_at: string
  updated_at: string
  items?: ReceiptItem[]
}

export type ReceiptItem = {
  id: string
  receipt_id: string
  product_id: string
  warehouse_id: string
  qty: number
  created_at: string
  product?: Product
  warehouse?: Warehouse
}

export type Delivery = {
  id: string
  customer: string | null
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'canceled'
  created_by: string | null
  created_at: string
  updated_at: string
  items?: DeliveryItem[]
}

export type DeliveryItem = {
  id: string
  delivery_id: string
  product_id: string
  warehouse_id: string
  qty: number
  created_at: string
  product?: Product
  warehouse?: Warehouse
}

export type InternalTransfer = {
  id: string
  from_warehouse_id: string
  to_warehouse_id: string
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'canceled'
  created_by: string | null
  created_at: string
  updated_at: string
  from_warehouse?: Warehouse
  to_warehouse?: Warehouse
  items?: TransferItem[]
}

export type TransferItem = {
  id: string
  transfer_id: string
  product_id: string
  qty: number
  created_at: string
  product?: Product
}

export type Adjustment = {
  id: string
  product_id: string
  warehouse_id: string
  counted_qty: number
  reason: string | null
  created_by: string | null
  created_at: string
  product?: Product
  warehouse?: Warehouse
}

export type StockMove = {
  id: string
  product_id: string
  quantity: number
  move_type: 'RECEIPT' | 'DELIVERY' | 'TRANSFER' | 'ADJUSTMENT'
  from_location: string | null
  to_location: string | null
  reference_id: string | null
  created_by: string | null
  created_at: string
  product?: Product
  from_warehouse?: Warehouse
  to_warehouse?: Warehouse
}

export type DocumentType = 'RECEIPT' | 'DELIVERY' | 'TRANSFER' | 'ADJUSTMENT'
export type DocumentStatus = 'draft' | 'waiting' | 'ready' | 'done' | 'canceled'

