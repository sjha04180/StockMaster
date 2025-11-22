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
import { createProduct } from '@/lib/services/products'
import { getCategories } from '@/lib/services/categories'
import { getWarehouses } from '@/lib/services/warehouses'
import { ensureUserProfile } from '@/lib/utils/user'
import type { Category, Warehouse } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category_id: z.string().optional(),
  uom: z.string().min(1, 'Unit of measure is required'),
  reorder_level: z.number().min(0),
  initial_stock: z.number().min(0).optional(),
  warehouse_id: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      uom: 'pcs',
      reorder_level: 0,
    },
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [cats, whs] = await Promise.all([
        getCategories(),
        getWarehouses(),
      ])
      setCategories(cats)
      setWarehouses(whs)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      const { category_id, initial_stock, warehouse_id, ...productData } = data
      
      const product = await createProduct({
        ...productData,
        category_id: category_id === 'none' || !category_id ? null : category_id,
      })

      // If initial stock is provided, create stock level
      if (initial_stock && warehouse_id) {
        const supabase = createClient()
        const userId = await ensureUserProfile()
        
        await supabase.from('stock_levels').insert({
          product_id: product.id,
          warehouse_id,
          quantity: initial_stock,
        })

        // Create initial stock move
        await supabase.from('stock_moves').insert({
          product_id: product.id,
          quantity: initial_stock,
          move_type: 'ADJUSTMENT',
          to_location: warehouse_id,
          reference_id: product.id,
          created_by: userId,
        })
      }

      toast({
        title: 'Success',
        description: 'Product created successfully',
      })

      router.push('/products')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create product',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Product</h1>
        <p className="text-muted-foreground">Add a new product to your inventory</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Enter product information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Product name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                {...register('sku')}
                placeholder="SKU-001"
              />
              {errors.sku && (
                <p className="text-sm text-destructive">{errors.sku.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Category (Optional)</Label>
              <Select
                value={watch('category_id') || undefined}
                onValueChange={(value) => setValue('category_id', value || '')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="uom">Unit of Measure *</Label>
              <Input
                id="uom"
                {...register('uom')}
                placeholder="pcs, kg, liters, etc."
              />
              {errors.uom && (
                <p className="text-sm text-destructive">{errors.uom.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorder_level">Reorder Level *</Label>
              <Input
                id="reorder_level"
                type="number"
                {...register('reorder_level', { valueAsNumber: true })}
                min={0}
              />
              {errors.reorder_level && (
                <p className="text-sm text-destructive">{errors.reorder_level.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="initial_stock">Initial Stock (Optional)</Label>
              <Input
                id="initial_stock"
                type="number"
                {...register('initial_stock', { valueAsNumber: true })}
                min={0}
              />
            </div>

            {watch('initial_stock') && watch('initial_stock')! > 0 && (
              <div className="space-y-2">
                <Label htmlFor="warehouse_id">Warehouse for Initial Stock</Label>
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
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Product'}
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

