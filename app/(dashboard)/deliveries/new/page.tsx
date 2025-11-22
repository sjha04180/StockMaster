'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createDelivery, addDeliveryItem, validateDelivery } from '@/lib/services/deliveries'
import { getProducts } from '@/lib/services/products'
import { getWarehouses } from '@/lib/services/warehouses'
import type { Product, Warehouse } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2 } from 'lucide-react'

export default function NewDeliveryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [customer, setCustomer] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [items, setItems] = useState<Array<{ product_id: string; warehouse_id: string; qty: number }>>([])
  const [deliveryId, setDeliveryId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

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

  const handleCreateDelivery = async () => {
    if (!customer.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a customer name',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const delivery = await createDelivery({
        customer,
        status: 'draft',
        created_by: null,
      })
      setDeliveryId(delivery.id)
      toast({
        title: 'Success',
        description: 'Delivery created. Add items below.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create delivery',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = () => {
    setItems([...items, { product_id: '', warehouse_id: '', qty: 0 }])
  }

  const handleUpdateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSaveItem = async (index: number) => {
    const item = items[index]
    if (!deliveryId || !item.product_id || !item.warehouse_id || item.qty <= 0) {
      toast({
        title: 'Error',
        description: 'Please fill all fields and ensure quantity is greater than 0',
        variant: 'destructive',
      })
      return
    }

    try {
      await addDeliveryItem({
        delivery_id: deliveryId,
        product_id: item.product_id,
        warehouse_id: item.warehouse_id,
        qty: item.qty,
      })
      toast({
        title: 'Success',
        description: 'Item added to delivery',
      })
      setItems(items.filter((_, i) => i !== index))
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add item',
        variant: 'destructive',
      })
    }
  }

  const handleValidate = async () => {
    if (!deliveryId) return

    setLoading(true)
    try {
      await validateDelivery(deliveryId)
      toast({
        title: 'Success',
        description: 'Delivery validated and stock updated',
      })
      router.push('/deliveries')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to validate delivery',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Delivery</h1>
        <p className="text-muted-foreground">Create a new outgoing stock delivery</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Information</CardTitle>
          <CardDescription>Enter customer and add items</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer *</Label>
            <Input
              id="customer"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Customer name"
              disabled={!!deliveryId}
            />
          </div>

          {!deliveryId ? (
            <Button onClick={handleCreateDelivery} disabled={loading}>
              Create Delivery
            </Button>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Items</h3>
                  <Button onClick={handleAddItem} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                {items.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                          <Label>Product</Label>
                          <Select
                            value={item.product_id}
                            onValueChange={(value) => handleUpdateItem(index, 'product_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} ({product.sku})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Warehouse</Label>
                          <Select
                            value={item.warehouse_id}
                            onValueChange={(value) => handleUpdateItem(index, 'warehouse_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select warehouse" />
                            </SelectTrigger>
                            <SelectContent>
                              {warehouses.map((wh) => (
                                <SelectItem key={wh.id} value={wh.id}>
                                  {wh.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.qty || ''}
                            onChange={(e) => handleUpdateItem(index, 'qty', parseInt(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <Button
                            onClick={() => handleSaveItem(index)}
                            size="sm"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => handleRemoveItem(index)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-4">
                <Button onClick={handleValidate} disabled={loading}>
                  Validate & Update Stock
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/deliveries')}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

