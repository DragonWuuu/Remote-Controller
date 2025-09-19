import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'
import { ElMessage } from 'element-plus'

// 1. 类型定义扩展 -------------------------------------------------
export type RequestConfig<T = any> = AxiosRequestConfig<T> & {
  /**
   * 是否自动处理错误（默认true）
   * true: 统一弹出错误提示
   * false: 需手动处理错误
   */
  autoError?: boolean
  /**
   * 重试配置
   */
  retry?: {
    attempts: number // 最大重试次数
    delay: number // 重试延迟(ms)
  }
}

export interface CustomResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 2. 创建 Axios 实例 -------------------------------------------------
export class HttpClient {
  private instance: AxiosInstance
  private pendingRequests = new Map<string, AbortController>()
  // 缓存 authStore 实例
  private authStore = useAuthStore()

  constructor(config: AxiosRequestConfig = {}) {
    // 从环境变量获取基础配置，提供默认值
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090'
    const timeout = import.meta.env.VITE_API_TIMEOUT ? parseInt(import.meta.env.VITE_API_TIMEOUT) : 15000

    this.instance = axios.create({
      baseURL,
      timeout,
      headers: { 'Content-Type': 'application/json' },
      ...config
    })

    this.setupInterceptors()
  }

  // 3. 拦截器配置 -------------------------------------------------
  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 自动携带 Token（使用缓存的 authStore 实例）
        const token = this.authStore.token
        if (token) {
          config.headers.Authorization = `Bearer ${token}` // 添加 Bearer 前缀，更符合标准
        }

        // 请求防重复（取消相同请求）
        const requestKey = this.generateRequestKey(config)
        if (this.pendingRequests.has(requestKey)) {
          this.pendingRequests.get(requestKey)?.abort()
          this.pendingRequests.delete(requestKey)
        }

        const controller = new AbortController()
        config.signal = controller.signal
        this.pendingRequests.set(requestKey, controller)

        return config
      },
      (error) => Promise.reject(error)
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<CustomResponse>) => {
        // 请求完成移除 pending 状态
        const requestKey = this.generateRequestKey(response.config)
        this.pendingRequests.delete(requestKey)

        // 统一响应结构处理
        if (response.data.code !== 200) {
          // 业务错误处理
          if (response.data.code === 401) {
            // 401 处理
            this.authStore.clearToken()
            router.replace('/Login')
            throw new Error("登录过期!请重新登录")
          }
          throw new Error(response.data.message)
        }
        return response.data.data
      },
      // http级错误处理
      async (error) => {
        // 请求完成移除 pending 状态
        if (error.config) {
          const requestKey = this.generateRequestKey(error.config)
          this.pendingRequests.delete(requestKey)
        }

        // 网络错误处理
        if (!error.response) {
          // 请求被取消的情况
          if (error.name === 'CanceledError') {
            return Promise.reject({ code: -2, message: '请求已取消', isCanceled: true })
          }
          return Promise.reject({ code: -1, message: '网络连接异常' })
        }

        // 401 处理
        if (error.response.status === 401) {
          this.authStore.clearToken()
          router.replace('/Login')
          return Promise.reject({ code: 401, message: '登录已过期' })
        }

        // 自动重试逻辑
        const config = error.config as RequestConfig
        if (config?.retry) {
          config.retry.attempts = config.retry.attempts || 3
          config.retry.delay = config.retry.delay || 1000

          if (config.retry.attempts > 0) {
            config.retry.attempts--
            await new Promise(resolve => setTimeout(resolve, config.retry.delay))
            return this.instance(config)
          }
        }

        return Promise.reject({
          code: error.response.status,
          message: error.response.data?.message || '请求失败',
          response: error.response
        })
      }
    )
  }

  // 4. 核心请求方法 -------------------------------------------------
  async request<T = any>(config: RequestConfig): Promise<T> {
    try {
      return await this.instance.request<CustomResponse<T>, T>(config)
    } catch (error: any) {
      // 统一错误处理，跳过被取消的请求
      if (config.autoError !== false && !error.isCanceled) {
        ElMessage.error(error.message || '请求失败')
      }
      throw error
    }
  }

  // 完整的 HTTP 方法支持
  get<T = any>(url: string, config?: RequestConfig) {
    return this.request<T>({ ...config, method: 'GET', url })
  }

  post<T = any>(url: string, data?: any, config?: RequestConfig) {
    return this.request<T>({ ...config, method: 'POST', url, data })
  }

  put<T = any>(url: string, data?: any, config?: RequestConfig) {
    return this.request<T>({...config, method: 'PUT', url, data })
  }

  delete<T = any>(url: string, config?: RequestConfig) {
    return this.request<T>({ ...config, method: 'DELETE', url })
  }

  // 添加缺少的 HTTP 方法
  patch<T = any>(url: string, data?: any, config?: RequestConfig) {
    return this.request<T>({ ...config, method: 'PATCH', url, data })
  }

  head<T = any>(url: string, config?: RequestConfig) {
    return this.request<T>({ ...config, method: 'HEAD', url })
  }

  options<T = any>(url: string, config?: RequestConfig) {
    return this.request<T>({ ...config, method: 'OPTIONS', url })
  }

  // 5. 高级功能 -------------------------------------------------
  private generateRequestKey(config: AxiosRequestConfig) {
    // 更稳定的请求键生成方式，避免某些场景下的问题
    const { method, url, params, data } = config
    const paramsStr = params ? JSON.stringify(params) : ''
    const dataStr = data && typeof data === 'object' ? JSON.stringify(data) : ''
    return [method, url, paramsStr, dataStr].join('&')
  }

  cancelAllRequests() {
    this.pendingRequests.forEach(controller => controller.abort())
    this.pendingRequests.clear()
  }

  // 取消特定请求的方法
  cancelRequest(config: RequestConfig) {
    const requestKey = this.generateRequestKey(config)
    if (this.pendingRequests.has(requestKey)) {
      this.pendingRequests.get(requestKey)?.abort()
      this.pendingRequests.delete(requestKey)
      return true
    }
    return false
  }

  // 获取当前活跃请求数量
  getPendingRequestCount() {
    return this.pendingRequests.size
  }
}

// 6. 创建实例 & 导出 -------------------------------------------------
export const httpClient = new HttpClient({})

// 导出常用的 HTTP 方法，方便直接调用
export const { get, post, put, delete: del, patch, head, options } = httpClient

// 7. 使用示例 -------------------------------------------------
/*
// 基础请求
httpClient.get<User[]>('/users')
  .then(users => console.log(users))

// 直接使用导出的方法
import { get } from '@/libs/http-client'
get<User[]>('/users')
  .then(users => console.log(users))

// 带类型和配置的请求
interface Post {
  id: number
  title: string
}

httpClient.get<Post[]>('/posts', {
  params: { page: 1 },
  retry: { attempts: 3, delay: 1000 }
})

// 提交表单（自动处理 FormData）
const formData = new FormData()
formData.append('file', file)
httpClient.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})

// 手动错误处理
httpClient.post('/submit', data, { autoError: false })
  .catch(err => {
    // 自定义错误处理
  })
*/