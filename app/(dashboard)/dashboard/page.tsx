'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getDashboardStats } from '@/lib/services/dashboard'
import { Package, AlertTriangle, ShoppingCart, Truck, ArrowLeftRight } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    pendingReceipts: 0,
    pendingDeliveries: 0,
    scheduledTransfers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      description: 'Products in inventory',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems,
      icon: AlertTriangle,
      description: 'Below reorder level',
      variant: 'warning' as const,
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStockItems,
      icon: AlertTriangle,
      description: 'No stock available',
      variant: 'destructive' as const,
    },
    {
      title: 'Pending Receipts',
      value: stats.pendingReceipts,
      icon: ShoppingCart,
      description: 'Awaiting processing',
    },
    {
      title: 'Pending Deliveries',
      value: stats.pendingDeliveries,
      icon: Truck,
      description: 'Awaiting processing',
    },
    {
      title: 'Scheduled Transfers',
      value: stats.scheduledTransfers,
      icon: ArrowLeftRight,
      description: 'Internal transfers',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your inventory</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {stat.title}
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100">
                    <Icon className="h-5 w-5 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{stat.value}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

