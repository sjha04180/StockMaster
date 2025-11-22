'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getReceipts } from '@/lib/services/receipts'
import type { Receipt } from '@/lib/types'
import { Plus, Eye } from 'lucide-react'
import { format } from 'date-fns'

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReceipts()
  }, [])

  const loadReceipts = async () => {
    try {
      const data = await getReceipts()
      setReceipts(data)
    } catch (error) {
      console.error('Failed to load receipts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800'
      case 'ready':
        return 'bg-blue-100 text-blue-800'
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800'
      case 'canceled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Receipts</h1>
          <p className="text-muted-foreground">Manage incoming stock</p>
        </div>
        <Link href="/receipts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Receipt
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receipt List</CardTitle>
          <CardDescription>All incoming stock receipts</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No receipts found. Create your first receipt to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>
                      {format(new Date(receipt.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{receipt.supplier || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(receipt.status)}`}>
                        {receipt.status.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>{receipt.items?.length || 0} items</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/receipts/${receipt.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
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

