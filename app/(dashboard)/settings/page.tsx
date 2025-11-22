'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WarehousesTab } from '@/components/settings/warehouses-tab'
import { CategoriesTab } from '@/components/settings/categories-tab'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage system settings</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="warehouses" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
            <TabsContent value="warehouses">
              <WarehousesTab />
            </TabsContent>
            <TabsContent value="categories">
              <CategoriesTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

