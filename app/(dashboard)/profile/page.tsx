'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { User } from '@/lib/types'
import { User as UserIcon, Mail, Calendar, Save } from 'lucide-react'
import { format } from 'date-fns'

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [authUser, setAuthUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const supabase = createClient()
      const { data: { user: authUserData }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Auth error:', authError)
        toast({
          title: 'Error',
          description: 'Failed to load user session',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      if (!authUserData) {
        toast({
          title: 'Error',
          description: 'No user session found',
          variant: 'destructive',
        })
        router.push('/auth/login')
        setLoading(false)
        return
      }

      setAuthUser(authUserData)
      setEmail(authUserData.email || '')

      // Try to get profile from users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUserData.id)
        .single()
      
      if (profile) {
        setUser(profile)
        setName(profile.name || authUserData.email?.split('@')[0] || '')
      } else if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUserData.id,
            email: authUserData.email!,
            name: authUserData.email?.split('@')[0] || null,
            role: 'user',
          })
          .select()
          .single()
        
        if (insertError) {
          console.error('Failed to create profile:', insertError)
          // Use auth user data as fallback
          setName(authUserData.email?.split('@')[0] || '')
        } else if (newProfile) {
          setUser(newProfile)
          setName(newProfile.name || authUserData.email?.split('@')[0] || '')
        } else {
          // Fallback to auth user data
          setName(authUserData.email?.split('@')[0] || '')
        }
      } else if (profileError) {
        console.error('Profile error:', profileError)
        // Use auth user data as fallback
        setName(authUserData.email?.split('@')[0] || '')
      }
    } catch (error: any) {
      console.error('Failed to load profile:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load profile',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authUser) {
      toast({
        title: 'Error',
        description: 'No user session found',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const supabase = createClient()
      
      // Update or insert profile
      if (user) {
        const { error } = await supabase
          .from('users')
          .update({ name: name || null })
          .eq('id', user.id)
        
        if (error) throw error
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile, error } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email!,
            name: name || null,
            role: 'user',
          })
          .select()
          .single()
        
        if (error) throw error
        if (newProfile) setUser(newProfile)
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })

      await loadProfile()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your profile information</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-muted-foreground">Loading profile...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your profile information</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Unable to load user profile</p>
              <Button onClick={() => router.push('/auth/login')}>
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Profile
        </h1>
        <p className="text-muted-foreground">Manage your profile information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100">
                <UserIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your profile details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              {user && (
                <div className="space-y-2 pt-4 border-t">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Account Information
                  </Label>
                  <div className="grid gap-4 md:grid-cols-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Member since</p>
                      <p className="font-medium">
                        {format(new Date(user.created_at), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Role</p>
                      <p className="font-medium capitalize">{user.role || 'User'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setName(user?.name || authUser.email?.split('@')[0] || '')}
                >
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <p className="text-sm font-medium text-purple-900 mb-1">Password</p>
              <p className="text-xs text-purple-700 mb-3">
                Last updated: {user?.updated_at ? format(new Date(user.updated_at), 'MMM dd, yyyy') : 'Never'}
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/auth/forgot-password')}
                className="w-full"
              >
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Your activity summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50">
                <span className="text-sm text-gray-600">Account Status</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50">
                <span className="text-sm text-gray-600">Email Verified</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  authUser.email_confirmed_at 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {authUser.email_confirmed_at ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

