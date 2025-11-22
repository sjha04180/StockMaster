'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getProduct, updateProduct } from '@/lib/services/products'
import { getCategories } from '@/lib/services/categories'
import type { Product, Category } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category_id: z.string().optional(),
  uom: z.string().min(1, 'Unit of measure is required'),
  reorder_level: z.number().min(0),
})

type ProductFormData = z.infer<typeof productSchema>

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const productId = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  })

  useEffect(() => {
    if (productId) {
      loadData()
    }
  }, [productId])

  const loadData = async () => {
    try {
      const [prod, cats] = await Promise.all([
        getProduct(productId),
        getCategories(),
      ])
      setProduct(prod)
      setCategories(cats)
      
      // Set form values
      setValue('name', prod.name)
      setValue('sku', prod.sku)
      setValue('category_id', prod.category_id || '')
      setValue('uom', prod.uom)
      setValue('reorder_level', prod.reorder_level)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load product',
        variant: 'destructive',
      })
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      await updateProduct(productId, {
        ...data,
        category_id: data.category_id === 'none' || !data.category_id ? null : data.category_id,
      })

      toast({
        title: 'Success',
        description: 'Product updated successfully',
      })

      router.push(`/products/${productId}`)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update product',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!product) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground">Update product information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Update product information</CardDescription>
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

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Product'}
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

