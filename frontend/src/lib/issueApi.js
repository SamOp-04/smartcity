import { supabase } from './supabase'

// Fetch all issues with proper error handling
export async function fetchIssues() {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching issues:', error)
    throw error
  }
}

export async function updateIssueStatus(id, status) {
  try {
    const updateData = { 
      status,
      updated_at: new Date().toISOString()
    }

    // If status is resolved, add resolved timestamp
    if (status === 'Resolved') {
      updateData.resolved_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('issues')
      .update(updateData)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error updating issue status:', error)
    throw error
  }
}

// Create new issue
export async function createIssue(issueData) {
  try {
    const newIssue = {
      ...issueData,
      status: issueData.status || 'Assessed',
      priority: issueData.priority || 'Medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('issues')
      .insert([newIssue])
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error creating issue:', error)
    throw error
  }
}

// Update issue details
export async function updateIssue(id, updateData) {
  try {
    const { data, error } = await supabase
      .from('issues')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error updating issue:', error)
    throw error
  }
}

// Delete issue (soft delete by updating status)
export async function deleteIssue(id) {
  try {
    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting issue:', error)
    throw error
  }
}

// Get issue by ID
export async function getIssueById(id) {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching issue:', error)
    throw error
  }
}

// Get comprehensive issue statistics
export async function getIssueStats() {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('status, category, priority, created_at')
    
    if (error) throw error
    
    const stats = {
      total: data.length,
      resolved: data.filter(issue => issue.status === 'Resolved').length,
      inProgress: data.filter(issue => issue.status === 'In Progress').length,
      assessed: data.filter(issue => issue.status === 'Assessed').length,
      categories: {},
      priorities: {},
      monthlyTrends: {}
    }
    
    // Count issues by category
    data.forEach(issue => {
      if (issue.category) {
        stats.categories[issue.category] = (stats.categories[issue.category] || 0) + 1
      }
      
      if (issue.priority) {
        stats.priorities[issue.priority] = (stats.priorities[issue.priority] || 0) + 1
      }
      
      // Monthly trends
      if (issue.created_at) {
        const month = new Date(issue.created_at).toISOString().slice(0, 7) // YYYY-MM
        stats.monthlyTrends[month] = (stats.monthlyTrends[month] || 0) + 1
      }
    })
    
    return stats
  } catch (error) {
    console.error('Error fetching issue stats:', error)
    throw error
  }
}

// Search issues with multiple filters
export async function searchIssues(searchTerm = '', status = null, category = null, priority = null) {
  try {
    let query = supabase
      .from('issues')
      .select('*')
    
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,user_name.ilike.%${searchTerm}%,user_email.ilike.%${searchTerm}%`)
    }
    
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error searching issues:', error)
    throw error
  }
}

// Get issues by status
export async function getIssuesByStatus(status) {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching issues by status:', error)
    throw error
  }
}

// Get issues by category
export async function getIssuesByCategory(category) {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching issues by category:', error)
    throw error
  }
}

// Get recent issues (last 30 days)
export async function getRecentIssues(limit = 10) {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching recent issues:', error)
    throw error
  }
}

// Assign issue to user
export async function assignIssue(issueId, assignedTo) {
  try {
    const { data, error } = await supabase
      .from('issues')
      .update({ 
        assigned_to: assignedTo,
        status: 'In Progress', // Auto-update status when assigned
        updated_at: new Date().toISOString()
      })
      .eq('id', issueId)
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error assigning issue:', error)
    throw error
  }
}

// Get available categories (from existing issues)
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('category')
      .not('category', 'is', null)
    
    if (error) throw error
    
    const categories = [...new Set(data.map(issue => issue.category))].filter(Boolean)
    return categories.sort()
  } catch (error) {
    console.error('Error fetching categories:', error)
    return ['Road', 'Water', 'Electricity', 'Sanitation', 'Garbage'] // fallback categories
  }
}

// Bulk update issues
export async function bulkUpdateIssues(issueIds, updateData) {
  try {
    const { data, error } = await supabase
      .from('issues')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .in('id', issueIds)
      .select()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error bulk updating issues:', error)
    throw error
  }
}