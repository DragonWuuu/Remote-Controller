import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import router from './router'
import 'element-plus/theme-chalk/dark/css-vars.css'

// 添加 Pinia 导入
import { createPinia } from 'pinia'

const app = createApp(App)

// 创建 Pinia 实例
const pinia = createPinia()

// 先使用 Pinia，再使用其他依赖
app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})

app.mount('#app')