<script setup>
import { useDark, useToggle } from '@vueuse/core'
import { RouterView } from 'vue-router'
import { ElHeader, ElButton } from 'element-plus'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <!-- 使用Element Plus的el-header作为导航栏 -->
  <el-header class="navbar">
    <div class="navbar-title">
      <h1>LCD</h1>
    </div>
    <div class="navbar-actions">
      <el-button @click="toggleDark()" :icon="isDark ? 'Carbon:moon' : 'Carbon:sun'" type="text" size="large"
        class="theme-toggle-btn">
        {{ isDark ? 'Dark' : 'Light' }}
      </el-button>
    </div>
  </el-header>

  <!-- 路由视图 -->
  <div class="router-view-container">
    <RouterView />
  </div>
</template>

<style>
/* 重置默认样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
  overflow: hidden;
}
</style>

<style scoped>
/* 导航栏样式 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: var(--el-bg-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

/* 标题样式 */
.navbar-title h1 {
  margin: 0;
  font-size: 24px;
  color: var(--el-text-color-primary);
}

/* 右侧按钮区域样式 */
.navbar-actions {
  display: flex;
  align-items: center;
}

/* 路由视图容器样式 */
.router-view-container {
  padding: 20px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}
</style>