import { createClient } from '@/lib/supabase/client'

/**
 * Ensures the user profile exists in the users table
 * Creates it if it doesn't exist
 */
export async function ensureUserProfile() {
  const supabase = createClient()
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !authUser) {
    throw new Error('User not authenticated')
  }

  // Check if user profile exists
  const { data: existingProfile } = await supabase
    .from('users')
    .select('id')
    .eq('id', authUser.id)
    .single()

  // If profile doesn't exist, create it
  if (!existingProfile) {
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email!,
        name: authUser.email?.split('@')[0] || null,
        role: 'user',
      })

    if (insertError) {
      // If insert fails, it might already exist (race condition), so check again
      const { data: checkProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', authUser.id)
        .single()

      if (!checkProfile) {
        throw new Error(`Failed to create user profile: ${insertError.message}`)
      }
    }
  }

  return authUser.id
}

