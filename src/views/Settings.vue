<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-gray-600 hover:text-gray-900">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </router-link>
            <h1 class="ml-4 text-xl font-bold text-gray-900">设置</h1>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="space-y-8">
        <!-- 用户信息 -->
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">用户信息</h2>
          
          <div v-if="loading" class="flex justify-center py-8">
            <div class="loading-spinner"></div>
          </div>
          
          <form v-else @submit.prevent="updateProfile" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">邮箱地址</label>
              <input
                id="email"
                :value="user?.email"
                type="email"
                disabled
                class="input-field mt-1 bg-gray-50 cursor-not-allowed"
              />
              <p class="mt-1 text-xs text-gray-500">邮箱地址无法修改</p>
            </div>
            
            <div>
              <label for="fullName" class="block text-sm font-medium text-gray-700">姓名</label>
              <input
                id="fullName"
                v-model="profile.full_name"
                type="text"
                class="input-field mt-1"
                placeholder="请输入您的姓名"
              />
            </div>
            
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">用户名</label>
              <input
                id="username"
                v-model="profile.username"
                type="text"
                class="input-field mt-1"
                placeholder="请输入用户名"
              />
            </div>
            
            <div v-if="profileError" class="text-red-600 text-sm">
              {{ profileError }}
            </div>
            
            <div>
              <button
                type="submit"
                :disabled="profileSaving"
                class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="profileSaving" class="loading-spinner mr-2"></span>
                {{ profileSaving ? '保存中...' : '保存更改' }}
              </button>
            </div>
          </form>
        </div>

        <!-- 分类管理 -->
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">分类管理</h2>
          
          <div class="space-y-4">
            <div
              v-for="category in categories"
              :key="category.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center">
                <span class="category-dot" :style="{ backgroundColor: category.color }"></span>
                <span class="font-medium">{{ category.name }}</span>
              </div>
              
              <div class="flex items-center space-x-2">
                <button
                  @click="editCategory(category)"
                  class="text-blue-600 hover:text-blue-700 text-sm"
                >
                  编辑
                </button>
                <button
                  @click="deleteCategory(category)"
                  class="text-red-600 hover:text-red-700 text-sm"
                >
                  删除
                </button>
              </div>
            </div>
            
            <button @click="showCategoryModal = true" class="btn-secondary w-full">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              添加新分类
            </button>
          </div>
        </div>

        <!-- 数据统计 -->
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">数据统计</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ stats.totalNotes }}</div>
              <div class="text-sm text-gray-500">总笔记数</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-600">{{ stats.favoriteNotes }}</div>
              <div class="text-sm text-gray-500">收藏笔记</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ stats.totalCategories }}</div>
              <div class="text-sm text-gray-500">分类数量</div>
            </div>
          </div>
        </div>

        <!-- 危险操作 -->
        <div class="card border-red-200">
          <h2 class="text-lg font-semibold text-red-900 mb-6">危险操作</h2>
          
          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-medium text-gray-900">导出所有数据</h3>
              <p class="text-sm text-gray-500 mb-3">将您的所有笔记导出为 JSON 文件</p>
              <button @click="exportData" class="btn-secondary">
                导出数据
              </button>
            </div>
            
            <div class="border-t border-gray-200 pt-4">
              <h3 class="text-sm font-medium text-red-900">删除账户</h3>
              <p class="text-sm text-gray-500 mb-3">永久删除您的账户和所有数据，此操作无法撤销</p>
              <button @click="showDeleteAccountModal = true" class="btn-danger">
                删除账户
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类编辑模态框 -->
    <div v-if="showCategoryModal" class="modal-overlay" @click="showCategoryModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="text-lg font-semibold mb-4">{{ editingCategory ? '编辑分类' : '创建新分类' }}</h3>
        <form @submit.prevent="saveCategoryChanges">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">分类名称</label>
            <input
              v-model="categoryForm.name"
              type="text"
              required
              class="input-field"
              placeholder="输入分类名称"
            />
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">颜色</label>
            <div class="flex space-x-2">
              <button
                v-for="color in categoryColors"
                :key="color"
                type="button"
                @click="categoryForm.color = color"
                :class="[
                  'w-8 h-8 rounded-full border-2',
                  categoryForm.color === color ? 'border-gray-400' : 'border-gray-200'
                ]"
                :style="{ backgroundColor: color }"
              ></button>
            </div>
          </div>
          <div class="flex justify-end space-x-3">
            <button type="button" @click="cancelCategoryEdit" class="btn-secondary">取消</button>
            <button type="submit" class="btn-primary">{{ editingCategory ? '保存' : '创建' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 删除账户确认模态框 -->
    <div v-if="showDeleteAccountModal" class="modal-overlay" @click="showDeleteAccountModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="text-lg font-semibold text-red-900 mb-4">确认删除账户</h3>
        <p class="text-gray-600 mb-4">此操作将永久删除您的账户和所有数据，包括：</p>
        <ul class="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
          <li>所有笔记内容</li>
          <li>所有分类设置</li>
          <li>用户配置信息</li>
        </ul>
        <p class="text-red-600 font-medium mb-6">此操作无法撤销！</p>
        <div class="flex justify-end space-x-3">
          <button @click="showDeleteAccountModal = false" class="btn-secondary">取消</button>
          <button @click="deleteAccount" class="btn-danger">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase, auth, notesAPI, categoriesAPI } from '../lib/supabase.js'

export default {
  name: 'Settings',
  setup() {
    const router = useRouter()
    const loading = ref(true)
    const profileSaving = ref(false)
    const profileError = ref('')
    const showCategoryModal = ref(false)
    const showDeleteAccountModal = ref(false)
    const editingCategory = ref(null)

    const user = ref(null)
    const profile = ref({
      full_name: '',
      username: ''
    })

    const categories = ref([])
    const notes = ref([])

    const categoryForm = ref({
      name: '',
      color: '#3b82f6'
    })

    const categoryColors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
      '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'
    ]

    // 计算统计数据
    const stats = computed(() => ({
      totalNotes: notes.value.length,
      favoriteNotes: notes.value.filter(note => note.is_favorite).length,
      totalCategories: categories.value.length
    }))

    const loadData = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) {
          router.push('/login')
          return
        }

        user.value = currentUser

        // 加载用户配置
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        if (profileData) {
          profile.value = {
            full_name: profileData.full_name || '',
            username: profileData.username || ''
          }
        }

        // 加载分类和笔记数据
        const [categoriesResult, notesResult] = await Promise.all([
          categoriesAPI.getCategories(currentUser.id),
          notesAPI.getNotes(currentUser.id)
        ])

        if (categoriesResult.data) categories.value = categoriesResult.data
        if (notesResult.data) notes.value = notesResult.data

      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        loading.value = false
      }
    }

    const updateProfile = async () => {
      profileSaving.value = true
      profileError.value = ''

      try {
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.value.id,
            full_name: profile.value.full_name,
            username: profile.value.username
          })

        if (error) throw error

        console.log('个人信息更新成功')
      } catch (error) {
        profileError.value = error.message
      } finally {
        profileSaving.value = false
      }
    }

    const editCategory = (category) => {
      editingCategory.value = category
      categoryForm.value = {
        name: category.name,
        color: category.color
      }
      showCategoryModal.value = true
    }

    const deleteCategory = async (category) => {
      if (!confirm(`确定要删除分类"${category.name}"吗？`)) return

      try {
        const { error } = await categoriesAPI.deleteCategory(category.id)
        if (error) throw error

        categories.value = categories.value.filter(c => c.id !== category.id)
      } catch (error) {
        console.error('删除分类失败:', error)
      }
    }

    const saveCategoryChanges = async () => {
      try {
        if (editingCategory.value) {
          // 更新现有分类
          const { data, error } = await categoriesAPI.updateCategory(
            editingCategory.value.id,
            categoryForm.value
          )
          if (error) throw error

          const index = categories.value.findIndex(c => c.id === editingCategory.value.id)
          if (index !== -1) {
            categories.value[index] = { ...categories.value[index], ...data[0] }
          }
        } else {
          // 创建新分类
          const { data, error } = await categoriesAPI.createCategory({
            user_id: user.value.id,
            ...categoryForm.value
          })
          if (error) throw error

          categories.value.push(data[0])
        }

        cancelCategoryEdit()
      } catch (error) {
        console.error('保存分类失败:', error)
      }
    }

    const cancelCategoryEdit = () => {
      showCategoryModal.value = false
      editingCategory.value = null
      categoryForm.value = { name: '', color: '#3b82f6' }
    }

    const exportData = async () => {
      try {
        const exportData = {
          notes: notes.value,
          categories: categories.value,
          profile: profile.value,
          exportDate: new Date().toISOString()
        }

        const dataStr = JSON.stringify(exportData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })

        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `notes-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('导出数据失败:', error)
      }
    }

    const deleteAccount = async () => {
      try {
        // 删除用户数据
        await Promise.all([
          supabase.from('notes').delete().eq('user_id', user.value.id),
          supabase.from('categories').delete().eq('user_id', user.value.id),
          supabase.from('user_profiles').delete().eq('id', user.value.id)
        ])

        // 删除认证用户
        await supabase.auth.admin.deleteUser(user.value.id)

        // 登出并跳转
        await auth.signOut()
        router.push('/login')
      } catch (error) {
        console.error('删除账户失败:', error)
      }
    }

    onMounted(() => {
      loadData()
    })

    return {
      loading,
      profileSaving,
      profileError,
      showCategoryModal,
      showDeleteAccountModal,
      editingCategory,
      user,
      profile,
      categories,
      categoryForm,
      categoryColors,
      stats,
      updateProfile,
      editCategory,
      deleteCategory,
      saveCategoryChanges,
      cancelCategoryEdit,
      exportData,
      deleteAccount
    }
  }
}
</script>
