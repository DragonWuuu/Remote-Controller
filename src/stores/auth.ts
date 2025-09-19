import { defineStore } from 'pinia'
import { apiService } from '@/libs/api-service'

interface AuthState {
    token: string | null
    userInfo: any | null
    isLogin: boolean
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        token: localStorage.getItem('token') || null,
        userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
        isLogin: !!localStorage.getItem('token')
    }),

    getters: {
        // 获取用户权限等计算属性
        hasPermission: (state) => (permission: string) => {
            // 根据实际需求实现权限判断逻辑
            return true
        }
    },

    actions: {
        // 设置令牌
        setToken(token: string) {
            this.token = token
            this.isLogin = true
            localStorage.setItem('token', token)
        },

        // 设置用户信息
        setUserInfo(userInfo: any) {
            this.userInfo = userInfo
            localStorage.setItem('userInfo', JSON.stringify(userInfo))
        },

        // 清除令牌和用户信息
        clearToken() {
            this.token = null
            this.userInfo = null
            this.isLogin = false
            localStorage.removeItem('token')
            localStorage.removeItem('userInfo')
        },

        // 登录方法
        async login(credentials: {
            username: string
            password: string
        }) {

            // 调用API服务登录
            try {

                const response = await apiService.user.login({ username: credentials.username, password: credentials.password })
                // 处理成功响应
                console.log('登录成功:', response.data)
                this.setToken(response.data.token)
                this.setUserInfo(response.data.userInfo)
                return response.data
            } catch (error) {
                // 处理错误
                console.error('登录失败:', error)
                throw error
            }

        },

        // 登出方法
        logout() {
            this.clearToken()
            // 可选：重定向到登录页
            // router.replace('/Login')
        }
    }
})

// 使用示例
// <script setup lang="ts">
// import { useAuthStore } from '@/stores/auth'

// const authStore = useAuthStore()

// 访问状态
// console.log(authStore.token)
// console.log(authStore.isLogin)

// 调用方法
// authStore.login({ username: 'admin', password: 'password' })
//   .then(() => {
//     console.log('登录成功')
//   })
//   .catch(error => {
//     console.error('登录失败', error)
//   })
// </script>