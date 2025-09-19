<script setup>
import { ref } from 'vue'
import { ElSwitch } from 'element-plus'

// 开关状态
const bulbStatus = ref(false)
</script>

<template>
    <div class="bulb-switch-container">
        <span class="switch-label">灯泡：</span>
        <el-switch v-model="bulbStatus" active-color="#13ce66" inactive-color="#ff4949" inline-prompt active-text="开"
            inactive-text="关" />
    </div>
</template>

<style scoped>
.bulb-switch-container {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.switch-label {
    margin-right: 10px;
    font-size: 16px;
    color: var(--el-text-color-primary);
}
</style>