<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- 顶部导航栏 -->
    <nav class="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-gray-600 hover:text-gray-900">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </router-link>
            <h2 class="ml-4 text-lg font-semibold text-gray-900">{{ isNewNote ? '新建笔记' : '编辑笔记' }}</h2>
          </div>
          
          <div class="flex items-center space-x-4">
            <button @click="saveNote" :disabled="isSaving" class="btn-primary disabled:opacity-50">
              <span v-if="isSaving" class="loading-spinner mr-2"></span>
              {{ isSaving ? '保存中...' : '保存' }}
            </button>
            <button v-if="!isNewNote" @click="showDeleteModal = true" class="btn-danger">
              删除
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 编辑器区域 -->
    <div class="flex-grow max-w-4xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8">
      <div v-if="loading" class="flex justify-center items-center h-full">
        <div class="loading-spinner"></div>
      </div>
      
      <div v-else class="bg-white rounded-lg shadow-md border border-gray-200 h-full flex flex-col">
        <!-- 标题输入框 -->
        <div class="p-4 border-b border-gray-200">
          <input
            v-model="note.title"
            type="text"
            placeholder="笔记标题"
            class="w-full text-2xl font-bold focus:outline-none"
          />
        </div>
        
        <!-- 内容编辑器 -->
        <div class="flex-grow p-4">
          <textarea
            v-model="note.content"
            placeholder="开始写作..."
            class="w-full h-full resize-none focus:outline-none"
          ></textarea>
        </div>
        
        <!-- 底部工具栏 -->
        <div class="p-4 border-t border-gray-200 flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <!-- 分类选择 -->
            <div class="relative">
              <button @click="showCategoryDropdown = !showCategoryDropdown" class="flex items-center text-sm text-gray-600 hover:text-gray-900">
                <span class="category-dot" :style="{ backgroundColor: selectedCategory?.color || '#ccc' }"></span>
                {{ selectedCategory?.name || '选择分类' }}
              </button>
              
              <div v-if="showCategoryDropdown" class="absolute bottom-full mb-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <button @click="selectCategory(null)" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">未分类</button>
                <button
                  v-for="category in categories"
                  :key="category.id"
                  @click="selectCategory(category)"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {{ category.name }}
                </button>
              </div>
            </div>
            
            <!-- 标签输入 (简化版) -->
            <div class="flex-grow">
              <input
                v-model="tagsInput"
                @keydown.enter.prevent="addTag"
                type="text"
                placeholder="添加标签 (回车确认)"
                class="text-sm focus:outline-none"
              />
            </div>
          </div>
          
          <div class="text-xs text-gray-500">
            最后更新于: {{ formatDate(note.updated_at) }}
          </div>
        </div>
        
        <!-- 标签显示 -->
        <div v-if="note.tags && note.tags.length > 0" class="px-4 pb-4 border-t border-gray-200">
          <div class="flex flex-wrap gap-2 pt-3">
            <span v-for="(tag, index) in note.tags" :key="index" class="tag">
              {{ tag }}
              <button @click="removeTag(index)" class="ml-1 text-blue-800 hover:text-blue-900">×</button>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="text-lg font-semibold mb-4">确认删除</h3>
        <p class="text-gray-600 mb-6">您确定要删除这篇笔记吗？此操作无法撤销。</p>
        <div class="flex justify-end space-x-3">
          <button @click="showDeleteModal = false" class="btn-secondary">取消</button>
          <button @click="deleteNote" class="btn-danger">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase, notesAPI, categoriesAPI } from '../lib/supabase.js'

export default {
  name: 'NoteEditor',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const loading = ref(true)
    const isSaving = ref(false)
    const showDeleteModal = ref(false)
    const showCategoryDropdown = ref(false)
    const categories = ref([])
    const selectedCategory = ref(null)
    const tagsInput = ref('')
    const user = ref(null)

    const note = ref({
      id: null,
      title: '',
      content: '',
      tags: [],
      category_id: null,
      is_favorite: false,
      created_at: null,
      updated_at: null
    })

    const isNewNote = computed(() => !route.params.id)

    // 自动保存功能
    let saveTimeout = null
    const autoSave = () => {
      if (saveTimeout) clearTimeout(saveTimeout)
      saveTimeout = setTimeout(() => {
        if (!isNewNote.value && (note.value.title || note.value.content)) {
          saveNote(true) // 静默保存
        }
      }, 2000)
    }

    // 监听内容变化进行自动保存
    watch([() => note.value.title, () => note.value.content], autoSave)

    const loadNote = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) {
          router.push('/login')
          return
        }

        user.value = currentUser

        // 加载分类
        const { data: categoriesData, error: categoriesError } = await categoriesAPI.getCategories(currentUser.id)
        if (categoriesError) throw categoriesError
        categories.value = categoriesData || []

        if (!isNewNote.value) {
          // 加载现有笔记
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
            .eq('id', route.params.id)
            .eq('user_id', currentUser.id)
            .single()

          if (error) throw error
          if (!data) {
            router.push('/')
            return
          }

          note.value = { ...data }
          if (data.categories) {
            selectedCategory.value = data.categories
          }
        } else {
          // 新笔记，重置数据
          note.value = {
            id: null,
            title: '',
            content: '',
            tags: [],
            category_id: null,
            is_favorite: false,
            created_at: null,
            updated_at: new Date().toISOString()
          }
        }
      } catch (error) {
        console.error('加载笔记失败:', error)
        router.push('/')
      } finally {
        loading.value = false
      }
    }

    const saveNote = async (silent = false) => {
      if (!silent) isSaving.value = true

      try {
        const noteData = {
          title: note.value.title || '无标题',
          content: note.value.content || '',
          tags: note.value.tags || [],
          category_id: selectedCategory.value?.id || null,
          user_id: user.value.id
        }

        if (isNewNote.value) {
          // 创建新笔记
          const { data, error } = await notesAPI.createNote(noteData)
          if (error) throw error

          note.value = { ...data[0] }
          // 更新路由到编辑模式
          router.replace(`/note/${data[0].id}`)
        } else {
          // 更新现有笔记
          const { data, error } = await notesAPI.updateNote(note.value.id, noteData)
          if (error) throw error

          note.value.updated_at = data[0].updated_at
        }

        if (!silent) {
          // 显示保存成功提示
          console.log('笔记保存成功')
        }
      } catch (error) {
        console.error('保存笔记失败:', error)
      } finally {
        if (!silent) isSaving.value = false
      }
    }

    const deleteNote = async () => {
      try {
        const { error } = await notesAPI.deleteNote(note.value.id)
        if (error) throw error

        router.push('/')
      } catch (error) {
        console.error('删除笔记失败:', error)
      }
    }

    const selectCategory = (category) => {
      selectedCategory.value = category
      showCategoryDropdown.value = false
    }

    const addTag = () => {
      const tag = tagsInput.value.trim()
      if (tag && !note.value.tags.includes(tag)) {
        note.value.tags.push(tag)
        tagsInput.value = ''
      }
    }

    const removeTag = (index) => {
      note.value.tags.splice(index, 1)
    }

    const formatDate = (dateString) => {
      if (!dateString) return '刚刚'

      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffMinutes = Math.floor(diffTime / (1000 * 60))

      if (diffMinutes < 1) return '刚刚'
      if (diffMinutes < 60) return `${diffMinutes} 分钟前`

      const diffHours = Math.floor(diffMinutes / 60)
      if (diffHours < 24) return `${diffHours} 小时前`

      const diffDays = Math.floor(diffHours / 24)
      if (diffDays < 7) return `${diffDays} 天前`

      return date.toLocaleDateString('zh-CN')
    }

    onMounted(() => {
      loadNote()
    })

    return {
      loading,
      isSaving,
      showDeleteModal,
      showCategoryDropdown,
      categories,
      selectedCategory,
      tagsInput,
      note,
      isNewNote,
      saveNote,
      deleteNote,
      selectCategory,
      addTag,
      removeTag,
      formatDate
    }
  }
}
</script>
