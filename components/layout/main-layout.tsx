'use client'

import { Sidebar } from './sidebar'

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/20 to-indigo-50/30">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

