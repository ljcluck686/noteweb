<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">📝 我的笔记</h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- 搜索框 -->
            <div class="search-box">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索笔记..."
                class="search-input"
              />
              <svg class="search-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            
            <!-- 新建笔记按钮 -->
            <button @click="createNewNote" class="btn-primary">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              新建笔记
            </button>
            
            <!-- 用户菜单 -->
            <div class="relative">
              <button @click="showUserMenu = !showUserMenu" class="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {{ userInitial }}
                </div>
              </button>
              
              <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <router-link to="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">设置</router-link>
                <button @click="handleLogout" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">退出登录</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex gap-8">
        <!-- 侧边栏 -->
        <div class="w-64 sidebar custom-scrollbar">
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">分类</h3>
            
            <!-- 所有笔记 -->
            <div class="space-y-2">
              <button
                @click="selectedCategory = null"
                :class="[
                  'w-full text-left px-3 py-2 rounded-lg transition-colors',
                  selectedCategory === null ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                ]"
              >
                📄 所有笔记 ({{ notes.length }})
              </button>
              
              <button
                @click="showFavorites = !showFavorites"
                :class="[
                  'w-full text-left px-3 py-2 rounded-lg transition-colors',
                  showFavorites ? 'bg-yellow-50 text-yellow-700' : 'text-gray-600 hover:bg-gray-50'
                ]"
              >
                ⭐ 收藏笔记 ({{ favoriteNotes.length }})
              </button>
            </div>
            
            <!-- 分类列表 -->
            <div class="mt-6">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-sm font-medium text-gray-500">自定义分类</h4>
                <button @click="showCategoryModal = true" class="text-blue-600 hover:text-blue-700">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </button>
              </div>
              
              <div class="space-y-1">
                <button
                  v-for="category in categories"
                  :key="category.id"
                  @click="selectedCategory = category.id"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center',
                    selectedCategory === category.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  ]"
                >
                  <span class="category-dot" :style="{ backgroundColor: category.color }"></span>
                  {{ category.name }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 主内容区域 -->
        <div class="flex-1">
          <div v-if="loading" class="flex justify-center items-center h-64">
            <div class="loading-spinner"></div>
          </div>
          
          <div v-else-if="filteredNotes.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">暂无笔记</h3>
            <p class="mt-1 text-sm text-gray-500">开始创建您的第一篇笔记吧！</p>
            <div class="mt-6">
              <button @click="createNewNote" class="btn-primary">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                创建笔记
              </button>
            </div>
          </div>
          
          <div v-else class="notes-grid">
            <div
              v-for="note in filteredNotes"
              :key="note.id"
              @click="editNote(note.id)"
              class="card-hover"
            >
              <div class="flex items-start justify-between mb-3">
                <h3 class="text-lg font-semibold text-gray-900 truncate">{{ note.title || '无标题' }}</h3>
                <button
                  @click.stop="toggleFavorite(note)"
                  class="text-gray-400 hover:text-yellow-500 transition-colors"
                >
                  <svg class="w-5 h-5" :class="{ 'text-yellow-500': note.is_favorite }" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </button>
              </div>
              
              <p class="text-gray-600 text-sm mb-4 line-clamp-3">
                {{ note.content || '暂无内容' }}
              </p>
              
              <div class="flex items-center justify-between text-xs text-gray-500">
                <div class="flex items-center">
                  <span v-if="note.categories" class="category-dot" :style="{ backgroundColor: note.categories.color }"></span>
                  <span>{{ note.categories?.name || '未分类' }}</span>
                </div>
                <span>{{ formatDate(note.updated_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类创建模态框 -->
    <div v-if="showCategoryModal" class="modal-overlay" @click="showCategoryModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="text-lg font-semibold mb-4">创建新分类</h3>
        <form @submit.prevent="createCategory">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">分类名称</label>
            <input
              v-model="newCategory.name"
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
                @click="newCategory.color = color"
                :class="[
                  'w-8 h-8 rounded-full border-2',
                  newCategory.color === color ? 'border-gray-400' : 'border-gray-200'
                ]"
                :style="{ backgroundColor: color }"
              ></button>
            </div>
          </div>
          <div class="flex justify-end space-x-3">
            <button type="button" @click="showCategoryModal = false" class="btn-secondary">取消</button>
            <button type="submit" class="btn-primary">创建</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase, auth, notesAPI, categoriesAPI } from '../lib/supabase.js'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    const loading = ref(true)
    const notes = ref([])
    const categories = ref([])
    const searchQuery = ref('')
    const selectedCategory = ref(null)
    const showFavorites = ref(false)
    const showUserMenu = ref(false)
    const showCategoryModal = ref(false)
    const user = ref(null)

    const newCategory = ref({
      name: '',
      color: '#3b82f6'
    })

    const categoryColors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
      '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'
    ]

    // 计算属性
    const userInitial = computed(() => {
      if (user.value?.email) {
        return user.value.email.charAt(0).toUpperCase()
      }
      return 'U'
    })

    const favoriteNotes = computed(() => {
      return notes.value.filter(note => note.is_favorite)
    })

    const filteredNotes = computed(() => {
      let filtered = notes.value

      // 根据搜索查询过滤
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(note =>
          note.title?.toLowerCase().includes(query) ||
          note.content?.toLowerCase().includes(query)
        )
      }

      // 根据分类过滤
      if (selectedCategory.value) {
        filtered = filtered.filter(note => note.category_id === selectedCategory.value)
      }

      // 根据收藏状态过滤
      if (showFavorites.value) {
        filtered = filtered.filter(note => note.is_favorite)
      }

      return filtered
    })

    // 方法
    const loadData = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) {
          router.push('/login')
          return
        }

        user.value = currentUser

        // 加载笔记和分类
        const [notesResult, categoriesResult] = await Promise.all([
          notesAPI.getNotes(currentUser.id),
          categoriesAPI.getCategories(currentUser.id)
        ])

        if (notesResult.error) throw notesResult.error
        if (categoriesResult.error) throw categoriesResult.error

        notes.value = notesResult.data || []
        categories.value = categoriesResult.data || []
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        loading.value = false
      }
    }

    const createNewNote = () => {
      router.push('/note')
    }

    const editNote = (noteId) => {
      router.push(`/note/${noteId}`)
    }

    const toggleFavorite = async (note) => {
      try {
        const { error } = await notesAPI.updateNote(note.id, {
          is_favorite: !note.is_favorite
        })

        if (error) throw error

        // 更新本地状态
        const index = notes.value.findIndex(n => n.id === note.id)
        if (index !== -1) {
          notes.value[index].is_favorite = !notes.value[index].is_favorite
        }
      } catch (error) {
        console.error('更新收藏状态失败:', error)
      }
    }

    const createCategory = async () => {
      try {
        if (!newCategory.value.name.trim()) return

        const { data, error } = await categoriesAPI.createCategory({
          user_id: user.value.id,
          name: newCategory.value.name.trim(),
          color: newCategory.value.color
        })

        if (error) throw error

        categories.value.push(data[0])
        showCategoryModal.value = false
        newCategory.value = { name: '', color: '#3b82f6' }
      } catch (error) {
        console.error('创建分类失败:', error)
      }
    }

    const handleLogout = async () => {
      try {
        await auth.signOut()
        router.push('/login')
      } catch (error) {
        console.error('登出失败:', error)
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) return '今天'
      if (diffDays === 2) return '昨天'
      if (diffDays <= 7) return `${diffDays} 天前`

      return date.toLocaleDateString('zh-CN')
    }

    onMounted(() => {
      loadData()
    })

    return {
      loading,
      notes,
      categories,
      searchQuery,
      selectedCategory,
      showFavorites,
      showUserMenu,
      showCategoryModal,
      newCategory,
      categoryColors,
      userInitial,
      favoriteNotes,
      filteredNotes,
      createNewNote,
      editNote,
      toggleFavorite,
      createCategory,
      handleLogout,
      formatDate
    }
  }
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
