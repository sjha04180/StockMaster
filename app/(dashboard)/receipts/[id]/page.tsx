'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getReceipt, validateReceipt, updateReceipt } from '@/lib/services/receipts'
import type { Receipt } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

export default function ReceiptDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const receiptId = params.id as string
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)

  useEffect(() => {
    if (receiptId) {
      loadReceipt()
    }
  }, [receiptId])

  const loadReceipt = async () => {
    try {
      const data = await getReceipt(receiptId)
      setReceipt(data)
    } catch (error) {
      console.error('Failed to load receipt:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    if (!receipt) return

    setValidating(true)
    try {
      await updateReceipt(receiptId, { status: status as any })
      await loadReceipt()
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
    if (!receipt) return

    setValidating(true)
    try {
      await validateReceipt(receiptId)
      toast({
        title: 'Success',
        description: 'Receipt validated and stock updated',
      })
      await loadReceipt()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to validate receipt',
        variant: 'destructive',
      })
    } finally {
      setValidating(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!receipt) {
    return <div>Receipt not found</div>
  }

  const canValidate = receipt.status !== 'done' && receipt.status !== 'canceled' && receipt.items && receipt.items.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Receipt Details</h1>
          <p className="text-muted-foreground">
            {format(new Date(receipt.created_at), 'MMM dd, yyyy')}
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
            <CardTitle>Receipt Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Supplier</p>
              <p className="font-medium">{receipt.supplier || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{receipt.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">
                {format(new Date(receipt.created_at), 'PPp')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Management</CardTitle>
            <CardDescription>Update receipt status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {['draft', 'waiting', 'ready', 'done', 'canceled'].map((status) => (
              <Button
                key={status}
                variant={receipt.status === status ? 'default' : 'outline'}
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
          <CardDescription>{receipt.items?.length || 0} items in this receipt</CardDescription>
        </CardHeader>
        <CardContent>
          {receipt.items && receipt.items.length > 0 ? (
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
                {receipt.items.map((item) => (
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
            <p className="text-center text-muted-foreground py-8">No items in this receipt</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

