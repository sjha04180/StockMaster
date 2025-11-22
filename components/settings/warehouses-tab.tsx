'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '@/lib/services/warehouses'
import type { Warehouse } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2 } from 'lucide-react'

export function WarehousesTab() {
  const { toast } = useToast()
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
  const [formData, setFormData] = useState({ name: '', address: '' })

  useEffect(() => {
    loadWarehouses()
  }, [])

  const loadWarehouses = async () => {
    try {
      const data = await getWarehouses()
      setWarehouses(data)
    } catch (error) {
      console.error('Failed to load warehouses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (warehouse?: Warehouse) => {
    if (warehouse) {
      setEditingWarehouse(warehouse)
      setFormData({ name: warehouse.name, address: warehouse.address || '' })
    } else {
      setEditingWarehouse(null)
      setFormData({ name: '', address: '' })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingWarehouse(null)
    setFormData({ name: '', address: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingWarehouse) {
        await updateWarehouse(editingWarehouse.id, formData)
        toast({
          title: 'Success',
          description: 'Warehouse updated successfully',
        })
      } else {
        await createWarehouse(formData)
        toast({
          title: 'Success',
          description: 'Warehouse created successfully',
        })
      }
      handleCloseDialog()
      loadWarehouses()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save warehouse',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return

    try {
      await deleteWarehouse(id)
      toast({
        title: 'Success',
        description: 'Warehouse deleted successfully',
      })
      loadWarehouses()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete warehouse',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Warehouses</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Warehouse
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingWarehouse ? 'Edit Warehouse' : 'New Warehouse'}
              </DialogTitle>
              <DialogDescription>
                {editingWarehouse ? 'Update warehouse information' : 'Create a new warehouse'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingWarehouse ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : warehouses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No warehouses found. Create your first warehouse.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouses.map((warehouse) => (
              <TableRow key={warehouse.id}>
                <TableCell className="font-medium">{warehouse.name}</TableCell>
                <TableCell>{warehouse.address || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(warehouse)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(warehouse.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

