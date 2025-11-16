import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nillgujwozluchozxuvv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pbGxndWp3b3psdWNob3p4dXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNzU5NzgsImV4cCI6MjA3ODg1MTk3OH0.kSACj7wwSRQe3FOwPqdXHRXkoSS3O6L_UTY1ipwxbHc'

export const supabase = createClient(supabaseUrl, supabaseKey)

// 认证相关的辅助函数
export const auth = {
  // 注册
  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  // 登录
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // 登出
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // 获取当前用户
  getCurrentUser() {
    return supabase.auth.getUser()
  },

  // 监听认证状态变化
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// 笔记相关的数据库操作
export const notesAPI = {
  // 获取用户的所有笔记
  async getNotes(userId) {
    const { data, error } = await supabase
      .from('notes')
      .select(`
        *,
        categories (
          id,
          name,
          color
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    
    return { data, error }
  },

  // 创建新笔记
  async createNote(noteData) {
    const { data, error } = await supabase
      .from('notes')
      .insert([noteData])
      .select()
    
    return { data, error }
  },

  // 更新笔记
  async updateNote(noteId, updates) {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', noteId)
      .select()
    
    return { data, error }
  },

  // 删除笔记
  async deleteNote(noteId) {
    const { data, error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
    
    return { data, error }
  }
}

// 分类相关的数据库操作
export const categoriesAPI = {
  // 获取用户的所有分类
  async getCategories(userId) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    
    return { data, error }
  },

  // 创建新分类
  async createCategory(categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
    
    return { data, error }
  },

  // 更新分类
  async updateCategory(categoryId, updates) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
    
    return { data, error }
  },

  // 删除分类
  async deleteCategory(categoryId) {
    const { data, error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
    
    return { data, error }
  }
}
