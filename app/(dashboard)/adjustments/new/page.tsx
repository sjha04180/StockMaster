'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createAdjustment } from '@/lib/services/adjustments'
import { getProducts } from '@/lib/services/products'
import { getWarehouses } from '@/lib/services/warehouses'
import type { Product, Warehouse } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

const adjustmentSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  warehouse_id: z.string().min(1, 'Warehouse is required'),
  counted_qty: z.number().min(0, 'Counted quantity must be 0 or greater'),
  reason: z.string().optional(),
})

type AdjustmentFormData = z.infer<typeof adjustmentSchema>

export default function NewAdjustmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
  })

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

  const onSubmit = async (data: AdjustmentFormData) => {
    setLoading(true)
    try {
      await createAdjustment({
        ...data,
        reason: data.reason || null,
      })

      toast({
        title: 'Success',
        description: 'Adjustment created and stock updated',
      })

      router.push('/adjustments')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create adjustment',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Adjustment</h1>
        <p className="text-muted-foreground">Create a stock count adjustment</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adjustment Details</CardTitle>
          <CardDescription>Enter adjustment information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product_id">Product *</Label>
              <Select
                value={watch('product_id') || ''}
                onValueChange={(value) => setValue('product_id', value)}
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
              {errors.product_id && (
                <p className="text-sm text-destructive">{errors.product_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="warehouse_id">Warehouse *</Label>
              <Select
                value={watch('warehouse_id') || ''}
                onValueChange={(value) => setValue('warehouse_id', value)}
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
              {errors.warehouse_id && (
                <p className="text-sm text-destructive">{errors.warehouse_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="counted_qty">Counted Quantity *</Label>
              <Input
                id="counted_qty"
                type="number"
                min="0"
                {...register('counted_qty', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.counted_qty && (
                <p className="text-sm text-destructive">{errors.counted_qty.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                {...register('reason')}
                placeholder="Damage, lost, count difference, etc."
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Adjustment'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

