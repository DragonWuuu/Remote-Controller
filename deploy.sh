#!/bin/bash

# 配置项
GITHUB_REPO="https://github.com/DragonWuuu/Remote-Controller.git" # GitHub仓库地址
IMAGE_NAME="remote-controller"
CONTAINER_NAME="remote-controller-app"
PORT=8001 # 宿主机端口

# 打印当前步骤
function log_step() {
    echo "\n========== $1 ==========\n"
}

# 检查命令是否执行成功
function check_success() {
    if [ $? -ne 0 ]; then
        echo "错误：$1 执行失败"
        exit 1
    fi
}

# 1. 更新代码
log_step "从GitHub拉取最新代码"
if [ -d ".git" ]; then
    git pull origin main
    check_success "git pull"
else
    echo "当前目录不是git仓库，开始从GitHub克隆代码..."
    git clone $GITHUB_REPO .
    check_success "git clone"
fi

# 2. 构建Docker镜像
log_step "构建Docker镜像"
docker build -t $IMAGE_NAME .
check_success "docker build"

# 3. 停止并移除旧容器
log_step "停止并移除旧容器"
if [ $(docker ps -aq -f name=$CONTAINER_NAME) ]; then
    docker stop $CONTAINER_NAME
    check_success "docker stop"
    docker rm $CONTAINER_NAME
    check_success "docker rm"
fi

# 4. 运行新容器
log_step "运行新容器"
docker run -d --name $CONTAINER_NAME -p $PORT:80 $IMAGE_NAME
check_success "docker run"

# 5. 显示部署结果
log_step "部署完成"
echo "应用已成功部署！"
echo "访问地址: http://localhost:$PORT"
docker ps -f name=$CONTAINER_NAME
