'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Truck, 
  ArrowLeftRight, 
  Sliders,
  History,
  Settings,
  User,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/receipts', label: 'Receipts', icon: Receipt },
  { href: '/deliveries', label: 'Deliveries', icon: Truck },
  { href: '/transfers', label: 'Transfers', icon: ArrowLeftRight },
  { href: '/adjustments', label: 'Adjustments', icon: Sliders },
  { href: '/move-history', label: 'Move History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/profile', label: 'Profile', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    })
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gradient-to-b from-purple-600 to-indigo-700 text-white shadow-xl">
      <div className="flex h-16 items-center border-b border-purple-500/30 px-6 bg-purple-700/50">
        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">StockMaster</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30'
                  : 'text-purple-100 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-purple-500/30 p-4 bg-purple-700/30">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-purple-100 hover:bg-white/10 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )
}

