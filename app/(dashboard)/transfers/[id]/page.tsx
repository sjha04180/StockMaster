'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getTransfer, validateTransfer, updateTransfer } from '@/lib/services/transfers'
import type { InternalTransfer } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

export default function TransferDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const transferId = params.id as string
  const [transfer, setTransfer] = useState<InternalTransfer | null>(null)
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)

  useEffect(() => {
    if (transferId) {
      loadTransfer()
    }
  }, [transferId])

  const loadTransfer = async () => {
    try {
      const data = await getTransfer(transferId)
      setTransfer(data)
    } catch (error) {
      console.error('Failed to load transfer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    if (!transfer) return

    setValidating(true)
    try {
      await updateTransfer(transferId, { status: status as any })
      await loadTransfer()
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
    if (!transfer) return

    setValidating(true)
    try {
      await validateTransfer(transferId)
      toast({
        title: 'Success',
        description: 'Transfer validated and stock updated',
      })
      await loadTransfer()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to validate transfer',
        variant: 'destructive',
      })
    } finally {
      setValidating(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!transfer) {
    return <div>Transfer not found</div>
  }

  const canValidate = transfer.status !== 'done' && transfer.status !== 'canceled' && transfer.items && transfer.items.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transfer Details</h1>
          <p className="text-muted-foreground">
            {format(new Date(transfer.created_at), 'MMM dd, yyyy')}
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
            <CardTitle>Transfer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">From Warehouse</p>
              <p className="font-medium">{transfer.from_warehouse?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">To Warehouse</p>
              <p className="font-medium">{transfer.to_warehouse?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{transfer.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">
                {format(new Date(transfer.created_at), 'PPp')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Management</CardTitle>
            <CardDescription>Update transfer status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {['draft', 'waiting', 'ready', 'done', 'canceled'].map((status) => (
              <Button
                key={status}
                variant={transfer.status === status ? 'default' : 'outline'}
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
          <CardDescription>{transfer.items?.length || 0} items in this transfer</CardDescription>
        </CardHeader>
        <CardContent>
          {transfer.items && transfer.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfer.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product?.name || '-'}</TableCell>
                    <TableCell>{item.product?.sku || '-'}</TableCell>
                    <TableCell className="text-right">{item.qty}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No items in this transfer</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

