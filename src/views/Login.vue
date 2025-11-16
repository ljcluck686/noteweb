<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="max-w-md w-full space-y-8 p-8">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          {{ isLogin ? '登录到笔记本' : '创建新账户' }}
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          {{ isLogin ? '欢迎回来！请登录您的账户' : '开始您的笔记之旅' }}
        </p>
      </div>
      
      <div class="card">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="!isLogin">
            <label for="fullName" class="block text-sm font-medium text-gray-700">姓名</label>
            <input
              id="fullName"
              v-model="form.fullName"
              type="text"
              class="input-field mt-1"
              placeholder="请输入您的姓名"
            />
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">邮箱</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input-field mt-1"
              placeholder="请输入邮箱地址"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">密码</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="input-field mt-1"
              placeholder="请输入密码"
            />
          </div>
          
          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>
          
          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="loading-spinner mr-2"></span>
              {{ isLogin ? '登录' : '注册' }}
            </button>
          </div>
          
          <div class="text-center">
            <button
              type="button"
              @click="toggleMode"
              class="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              {{ isLogin ? '没有账户？立即注册' : '已有账户？立即登录' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../lib/supabase.js'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const isLogin = ref(true)
    const loading = ref(false)
    const error = ref('')
    
    const form = ref({
      email: '',
      password: '',
      fullName: ''
    })

    const toggleMode = () => {
      isLogin.value = !isLogin.value
      error.value = ''
    }

    const handleSubmit = async () => {
      loading.value = true
      error.value = ''

      try {
        if (isLogin.value) {
          const { error: signInError } = await auth.signIn(form.value.email, form.value.password)
          if (signInError) throw signInError
        } else {
          const { error: signUpError } = await auth.signUp(
            form.value.email,
            form.value.password,
            { full_name: form.value.fullName }
          )
          if (signUpError) throw signUpError
        }
        
        router.push('/')
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    return {
      isLogin,
      loading,
      error,
      form,
      toggleMode,
      handleSubmit
    }
  }
}
</script>
