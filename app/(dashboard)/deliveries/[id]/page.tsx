'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getDelivery, validateDelivery, updateDelivery } from '@/lib/services/deliveries'
import type { Delivery } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

export default function DeliveryDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const deliveryId = params.id as string
  const [delivery, setDelivery] = useState<Delivery | null>(null)
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)

  useEffect(() => {
    if (deliveryId) {
      loadDelivery()
    }
  }, [deliveryId])

  const loadDelivery = async () => {
    try {
      const data = await getDelivery(deliveryId)
      setDelivery(data)
    } catch (error) {
      console.error('Failed to load delivery:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    if (!delivery) return

    setValidating(true)
    try {
      await updateDelivery(deliveryId, { status: status as any })
      await loadDelivery()
      toast({
        title: 'Success',
        description: 'Status updated',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      })
    } finally {
      setValidating(false)
    }
  }

  const handleValidate = async () => {
    if (!delivery) return

    setValidating(true)
    try {
      await validateDelivery(deliveryId)
      toast({
        title: 'Success',
        description: 'Delivery validated and stock updated',
      })
      await loadDelivery()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to validate delivery',
        variant: 'destructive',
      })
    } finally {
      setValidating(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!delivery) {
    return <div>Delivery not found</div>
  }

  const canValidate = delivery.status !== 'done' && delivery.status !== 'canceled' && delivery.items && delivery.items.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Delivery Details</h1>
          <p className="text-muted-foreground">
            {format(new Date(delivery.created_at), 'MMM dd, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          {canValidate && (
            <Button onClick={handleValidate} disabled={validating}>
              {validating ? 'Validating...' : 'Validate & Update Stock'}
            </Button>
          )}
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium">{delivery.customer || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{delivery.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">
                {format(new Date(delivery.created_at), 'PPp')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Management</CardTitle>
            <CardDescription>Update delivery status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {['draft', 'waiting', 'ready', 'done', 'canceled'].map((status) => (
              <Button
                key={status}
                variant={delivery.status === status ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => handleStatusChange(status)}
                disabled={validating}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
          <CardDescription>{delivery.items?.length || 0} items in this delivery</CardDescription>
        </CardHeader>
        <CardContent>
          {delivery.items && delivery.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {delivery.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product?.name || '-'}</TableCell>
                    <TableCell>{item.product?.sku || '-'}</TableCell>
                    <TableCell>{item.warehouse?.name || '-'}</TableCell>
                    <TableCell className="text-right">{item.qty}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No items in this delivery</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

