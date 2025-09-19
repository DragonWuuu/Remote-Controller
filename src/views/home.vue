<script setup>
import { ElButton } from 'element-plus'
import BulbSwitch from '../component/BulbSwitch.vue'
import ScreenDisplay from '../component/ScreenDisplay.vue'
</script>

<template>
    <div class="home-container">
        <h2>hello</h2>
        <div class="button-group">
            <!-- 灯泡开关组件 -->
            <BulbSwitch />

            <!-- 屏幕显示组件 -->
            <ScreenDisplay />
        </div>
    </div>
</template>

<style scoped>
.home-container {
    padding: 20px;
    text-align: left;
}

.home-container h2 {
    margin-bottom: 30px;
    color: var(--el-text-color-primary);
}
</style>