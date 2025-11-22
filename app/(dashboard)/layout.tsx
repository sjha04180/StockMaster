import { MainLayout } from '@/components/layout/main-layout'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect('/auth/login')
    }

    return <MainLayout>{children}</MainLayout>
  } catch (error) {
    // If there's an error (e.g., missing env vars), redirect to login
    console.error('Error in dashboard layout:', error)
    redirect('/auth/login')
  }
}

