'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAdjustments } from '@/lib/services/adjustments'
import type { Adjustment } from '@/lib/types'
import { Plus, Eye } from 'lucide-react'
import { format } from 'date-fns'

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAdjustments()
  }, [])

  const loadAdjustments = async () => {
    try {
      const data = await getAdjustments()
      setAdjustments(data)
    } catch (error) {
      console.error('Failed to load adjustments:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stock Adjustments</h1>
          <p className="text-muted-foreground">Manage stock count adjustments</p>
        </div>
        <Link href="/adjustments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Adjustment
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adjustment List</CardTitle>
          <CardDescription>All stock adjustments</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : adjustments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No adjustments found. Create your first adjustment to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Counted Qty</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustments.map((adjustment) => (
                  <TableRow key={adjustment.id}>
                    <TableCell>
                      {format(new Date(adjustment.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{adjustment.product?.name || '-'}</TableCell>
                    <TableCell>{adjustment.warehouse?.name || '-'}</TableCell>
                    <TableCell>{adjustment.counted_qty}</TableCell>
                    <TableCell>{adjustment.reason || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/adjustments/${adjustment.id}`}>
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

