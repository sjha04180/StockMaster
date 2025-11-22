'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getStockMoves } from '@/lib/services/stock-moves'
import { getProducts } from '@/lib/services/products'
import { getWarehouses } from '@/lib/services/warehouses'
import type { StockMove, Product, Warehouse } from '@/lib/types'
import { format } from 'date-fns'

export default function MoveHistoryPage() {
  const [moves, setMoves] = useState<StockMove[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [filters, setFilters] = useState<{
    product_id: string
    move_type: string
    warehouse_id: string
  }>({
    product_id: '',
    move_type: '',
    warehouse_id: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadMoves()
  }, [filters])

  const loadData = async () => {
    try {
      const [prods, whs] = await Promise.all([
        getProducts(),
        getWarehouses(),
      ])
      setProducts(prods)
      setWarehouses(whs)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const loadMoves = async () => {
    setLoading(true)
    try {
      const data = await getStockMoves({
        product_id: filters.product_id || undefined,
        move_type: filters.move_type || undefined,
        from_location: filters.warehouse_id || undefined,
        to_location: filters.warehouse_id || undefined,
      })
      setMoves(data)
    } catch (error) {
      console.error('Failed to load stock moves:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMoveTypeColor = (type: string) => {
    switch (type) {
      case 'RECEIPT':
        return 'bg-green-100 text-green-800'
      case 'DELIVERY':
        return 'bg-red-100 text-red-800'
      case 'TRANSFER':
        return 'bg-blue-100 text-blue-800'
      case 'ADJUSTMENT':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Move History</h1>
        <p className="text-muted-foreground">Stock movement ledger</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter stock movements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select
                value={filters.product_id || undefined}
                onValueChange={(value) => setFilters({ ...filters, product_id: value === 'all' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All products</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Move Type</Label>
              <Select
                value={filters.move_type || undefined}
                onValueChange={(value) => setFilters({ ...filters, move_type: value === 'all' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="RECEIPT">Receipt</SelectItem>
                  <SelectItem value="DELIVERY">Delivery</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Warehouse</Label>
              <Select
                value={filters.warehouse_id || undefined}
                onValueChange={(value) => setFilters({ ...filters, warehouse_id: value === 'all' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All warehouses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All warehouses</SelectItem>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>
                      {wh.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stock Movements</CardTitle>
          <CardDescription>All stock movements in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : moves.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No stock movements found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moves.map((move) => (
                  <TableRow key={move.id}>
                    <TableCell>
                      {format(new Date(move.created_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      {move.product?.name || '-'}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {move.product?.sku || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoveTypeColor(move.move_type)}`}>
                        {move.move_type}
                      </span>
                    </TableCell>
                    <TableCell className={move.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                      {move.quantity > 0 ? '+' : ''}{move.quantity}
                    </TableCell>
                    <TableCell>{move.from_warehouse?.name || '-'}</TableCell>
                    <TableCell>{move.to_warehouse?.name || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

