import { HttpClient } from './http-client'
import type { RequestConfig, CustomResponse } from './http-client'

// 创建HttpClient实例
const http = new HttpClient()

/**
 * API响应数据类型泛型
 */
export type ApiResponse<T = any> = Promise<CustomResponse<T>>

/**
 * 基础API服务类
 */
class BaseApiService {
  protected http: HttpClient

  constructor() {
    this.http = http
  }

  /**
   * 扩展请求配置
   */
  protected extendConfig(config?: RequestConfig): RequestConfig {
    return {
      autoError: true,
      ...config
    }
  }
}

/**
 * 用户相关API服务
 */
export class UserApiService extends BaseApiService {
  /**
   * 登录接口
   */
  login(data: {
    username: string
    password: string
  }, config?: RequestConfig): ApiResponse<{
    token: string
    userInfo: {
      id: number
      username: string
      role: string
      [key: string]: any
    }
  }> {
    return this.http.post('/api/auth/login', data, this.extendConfig(config))
  }

  /**
   * 获取用户信息
   */
  getUserInfo(config?: RequestConfig): ApiResponse<{
    id: number
    username: string
    role: string
    avatar?: string
    permissions: string[]
    [key: string]: any
  }> {
    return this.http.get('/api/users/info', this.extendConfig(config))
  }

  /**
   * 更新用户信息
   */
  updateUserInfo(data: Partial<{
    username: string
    avatar: string
    [key: string]: any
  }>, config?: RequestConfig): ApiResponse<boolean> {
    return this.http.put('/api/users/info', data, this.extendConfig(config))
  }
}

/**
 * 示例模块API服务
 */
export class ExampleApiService extends BaseApiService {
  /**
   * 获取示例列表
   */
  getExampleList(params?: {
    page?: number
    pageSize?: number
    keyword?: string
    [key: string]: any
  }, config?: RequestConfig): ApiResponse<{
    list: Array<{
      id: number
      name: string
      createdAt: string
      [key: string]: any
    }>
    total: number
    page: number
    pageSize: number
  }> {
    return this.http.get('/api/examples', this.extendConfig({ params, ...config }))
  }

  /**
   * 获取示例详情
   */
  getExampleDetail(id: number | string, config?: RequestConfig): ApiResponse<{
    id: number
    name: string
    description?: string
    content: any
    createdAt: string
    updatedAt: string
    [key: string]: any
  }> {
    return this.http.get(`/api/examples/${id}`, this.extendConfig(config))
  }

  /**
   * 创建示例
   */
  createExample(data: {
    name: string
    description?: string
    content: any
    [key: string]: any
  }, config?: RequestConfig): ApiResponse<{
    id: number
    name: string
    [key: string]: any
  }> {
    return this.http.post('/api/examples', data, this.extendConfig(config))
  }

  /**
   * 更新示例
   */
  updateExample(id: number | string, data: Partial<{
    name: string
    description?: string
    content: any
    [key: string]: any
  }>, config?: RequestConfig): ApiResponse<boolean> {
    return this.http.put(`/api/examples/${id}`, data, this.extendConfig(config))
  }

  /**
   * 删除示例
   */
  deleteExample(id: number | string, config?: RequestConfig): ApiResponse<boolean> {
    return this.http.delete(`/api/examples/${id}`, this.extendConfig(config))
  }
}

/**
 * 文件相关API服务
 */
export class FileApiService extends BaseApiService {
  /**
   * 上传文件
   */
  uploadFile(file: File, config?: RequestConfig): ApiResponse<{
    url: string
    fileName: string
    fileSize: number
    [key: string]: any
  }> {
    const formData = new FormData()
    formData.append('file', file)
    
    return this.http.post('/api/files/upload', formData, this.extendConfig({
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    }))
  }
}

/**
 * API服务统一导出
 */
export const apiService = {
  user: new UserApiService(),
  example: new ExampleApiService(),
  file: new FileApiService()
}

/**
 * 导出工厂函数，用于创建自定义配置的API服务
 */
export function createApiService(config?: RequestConfig) {
  const customHttp = new HttpClient(config)
  
  return {
    user: new UserApiService(),
    example: new ExampleApiService(),
    file: new FileApiService()
  }
}

// 默认导出
export default apiService

/*
使用示例
// 在组件或业务逻辑中使用
import { apiService } from '@/libs/api-service'

// 登录示例
async function handleLogin(username: string, password: string) {
  try {
    const response = await apiService.user.login({ username, password })
    // 处理成功响应
    console.log('登录成功:', response.data)
    return response.data
  } catch (error) {
    // 处理错误
    console.error('登录失败:', error)
    throw error
  }
}

// 获取示例列表
async function fetchExamples(page: number = 1, pageSize: number = 10) {
  try {
    const response = await apiService.example.getExampleList({
      page,
      pageSize
    })
    return response.data
  } catch (error) {
    console.error('获取示例列表失败:', error)
    throw error
  }
}
  */