'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getProduct, getProductStockLevels, getTotalStock } from '@/lib/services/products'
import type { Product, StockLevel } from '@/lib/types'
import { Edit, Package } from 'lucide-react'

export default function ProductDetailsPage() {
  const params = useParams()
  const productId = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([])
  const [totalStock, setTotalStock] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  const loadProduct = async () => {
    try {
      const [prod, levels, total] = await Promise.all([
        getProduct(productId),
        getProductStockLevels(productId),
        getTotalStock(productId),
      ])
      setProduct(prod)
      setStockLevels(levels)
      setTotalStock(total)
    } catch (error) {
      console.error('Failed to load product:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground">Product details and stock information</p>
        </div>
        <Link href={`/products/${productId}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Product
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">SKU</p>
              <p className="font-medium">{product.sku}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{product.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{product.category?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unit of Measure</p>
              <p className="font-medium">{product.uom}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reorder Level</p>
              <p className="font-medium">{product.reorder_level}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <p className="text-2xl font-bold">{totalStock}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Stock by Warehouse</p>
              {stockLevels.length === 0 ? (
                <p className="text-sm text-muted-foreground">No stock in any warehouse</p>
              ) : (
                <div className="space-y-2">
                  {stockLevels.map((level) => (
                    <div key={level.id} className="flex justify-between">
                      <span className="text-sm">{level.warehouse?.name || 'Unknown'}</span>
                      <span className="font-medium">{level.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

