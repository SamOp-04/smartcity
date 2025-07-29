import { supabase } from './supabase'

// Fetch all users with their profiles
export async function fetchUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        email,
        status,
        role,
        created_at,
        updated_at,
        auth:auth.users!inner(
          id,
          email,
          created_at,
          last_sign_in_at,
          email_confirmed_at
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

// Alternative approach if the above join doesn't work - fetch profiles and auth separately
export async function fetchUsersAlternative() {
  try {
    // Fetch profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (profilesError) throw profilesError

    // For admin dashboard, we can get basic user info from profiles
    // The auth.users table is typically not directly accessible for security
    return profiles
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

// Update user status (Active/Blocked)
export async function updateUserStatus(userId, status) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error updating user status:', error)
    throw error
  }
}

// Update user profile
export async function updateUserProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

// Delete user (soft delete by setting status to 'Deleted')
export async function deleteUser(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        status: 'Deleted',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

// Get user by ID
export async function getUserById(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

// Get user statistics
export async function getUserStats() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('status')
    
    if (error) throw error
    
    const stats = data.reduce((acc, user) => {
      acc[user.status] = (acc[user.status] || 0) + 1
      return acc
    }, {})
    
    return {
      total: data.length,
      active: stats.Active || 0,
      blocked: stats.Blocked || 0,
      deleted: stats.Deleted || 0
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    throw error
  }
}

// Search users
export async function searchUsers(searchTerm, status = null) {
  try {
    let query = supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error searching users:', error)
    throw error
  }
}