<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <router-view />
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { supabase } from './lib/supabase.js'

export default {
  name: 'App',
  setup() {
    const user = ref(null)
    const loading = ref(true)

    onMounted(async () => {
      // 检查当前用户状态
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      user.value = currentUser
      loading.value = false

      // 监听认证状态变化
      supabase.auth.onAuthStateChange((_, session) => {
        user.value = session?.user || null
      })
    })

    return {
      user,
      loading
    }
  }
}
</script>

<style>
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
