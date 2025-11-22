'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getDeliveries } from '@/lib/services/deliveries'
import type { Delivery } from '@/lib/types'
import { Plus, Eye } from 'lucide-react'
import { format } from 'date-fns'

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDeliveries()
  }, [])

  const loadDeliveries = async () => {
    try {
      const data = await getDeliveries()
      setDeliveries(data)
    } catch (error) {
      console.error('Failed to load deliveries:', error)
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
          <h1 className="text-3xl font-bold">Deliveries</h1>
          <p className="text-muted-foreground">Manage outgoing stock</p>
        </div>
        <Link href="/deliveries/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Delivery
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery List</CardTitle>
          <CardDescription>All outgoing stock deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No deliveries found. Create your first delivery to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>
                      {format(new Date(delivery.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{delivery.customer || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                        {delivery.status.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>{delivery.items?.length || 0} items</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/deliveries/${delivery.id}`}>
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

