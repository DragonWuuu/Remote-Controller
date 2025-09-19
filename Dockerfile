# 第一阶段：构建阶段
FROM node:20.19.0-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --production=false

# 复制源代码
COPY . .

# 构建项目
RUN npm run build

# 第二阶段：运行阶段
FROM nginx:alpine

# 复制构建产物到Nginx的html目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制Nginx配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露80端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]