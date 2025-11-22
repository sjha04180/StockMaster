'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdjustment } from '@/lib/services/adjustments'
import type { Adjustment } from '@/lib/types'
import { format } from 'date-fns'

export default function AdjustmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const adjustmentId = params.id as string
  const [adjustment, setAdjustment] = useState<Adjustment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (adjustmentId) {
      loadAdjustment()
    }
  }, [adjustmentId])

  const loadAdjustment = async () => {
    try {
      const data = await getAdjustment(adjustmentId)
      setAdjustment(data)
    } catch (error) {
      console.error('Failed to load adjustment:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!adjustment) {
    return <div>Adjustment not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Adjustment Details</h1>
          <p className="text-muted-foreground">
            {format(new Date(adjustment.created_at), 'MMM dd, yyyy')}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adjustment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Product</p>
            <p className="font-medium">{adjustment.product?.name || '-'}</p>
            <p className="text-sm text-muted-foreground">{adjustment.product?.sku || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Warehouse</p>
            <p className="font-medium">{adjustment.warehouse?.name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Counted Quantity</p>
            <p className="font-medium">{adjustment.counted_qty}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Reason</p>
            <p className="font-medium">{adjustment.reason || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="font-medium">
              {format(new Date(adjustment.created_at), 'PPp')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

