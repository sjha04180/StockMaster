'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getTransfers } from '@/lib/services/transfers'
import type { InternalTransfer } from '@/lib/types'
import { Plus, Eye } from 'lucide-react'
import { format } from 'date-fns'

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<InternalTransfer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransfers()
  }, [])

  const loadTransfers = async () => {
    try {
      const data = await getTransfers()
      setTransfers(data)
    } catch (error) {
      console.error('Failed to load transfers:', error)
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
          <h1 className="text-3xl font-bold">Internal Transfers</h1>
          <p className="text-muted-foreground">Manage stock transfers between warehouses</p>
        </div>
        <Link href="/transfers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Transfer
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer List</CardTitle>
          <CardDescription>All internal stock transfers</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : transfers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transfers found. Create your first transfer to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      {format(new Date(transfer.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{transfer.from_warehouse?.name || '-'}</TableCell>
                    <TableCell>{transfer.to_warehouse?.name || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                        {transfer.status.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>{transfer.items?.length || 0} items</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/transfers/${transfer.id}`}>
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

