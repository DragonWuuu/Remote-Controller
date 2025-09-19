<script setup>
import { ref } from 'vue'
import { ElInput, ElRow, ElCol, ElButton } from 'element-plus'

// 坐标和内容
const xCoordinate = ref('')
const yCoordinate = ref('')
const displayContent = ref('')

// 提交按钮的点击事件处理函数
const handleSubmit = () => {
    // 提交逻辑
    console.log('提交数据:', {
        x: xCoordinate.value,
        y: yCoordinate.value,
        content: displayContent.value
    })
}
</script>

<template>
    <div class="screen-display-container">
        <ElRow :gutter="20" class="input-row">
            <ElCol :span="12">
                <el-input v-model="xCoordinate" placeholder="X轴坐标" type="number" class="coordinate-input" />
            </ElCol>
            <ElCol :span="12">
                <el-input v-model="yCoordinate" placeholder="Y轴坐标" type="number" class="coordinate-input" />
            </ElCol>
        </ElRow>

        <ElRow class="content-row">
            <ElCol :span="24">
                <el-input v-model="displayContent" placeholder="显示内容" type="textarea" :rows="2" class="content-input" />
            </ElCol>
        </ElRow>

        <ElRow class="submit-row">
            <ElCol :span="24" style="text-align: left;">
                <el-button type="primary" @click="handleSubmit">
                    提交
                </el-button>
            </ElCol>
        </ElRow>
    </div>
</template>

<style scoped>
.screen-display-container {
    width: 100%;
}

.input-row,
.content-row {
    margin-bottom: 15px;
}

.submit-row {
    margin-top: 20px;
}

.coordinate-input,
.content-input {
    width: 100%;
}
</style>