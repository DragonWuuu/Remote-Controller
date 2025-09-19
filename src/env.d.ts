interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT: string
  // 其他环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}