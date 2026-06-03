# 使用 bun 官方镜像作为构建阶段
FROM oven/bun:1.3.14 AS builder

WORKDIR /app

# 复制 package.json 和 lockfile 以及子模块的 package.json 以便利用缓存
COPY package.json bun.lock ./
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/
COPY packages/constants/package.json ./packages/constants/

# 安装依赖
RUN bun install --frozen-lockfile

# 复制项目所有文件
COPY . .

# 执行构建 (编译前端静态文件及进行 TypeScript 类型检查)
RUN bun run build

# 生产运行镜像使用轻量版 bun 镜像
FROM oven/bun:1.3.14-slim AS runner

WORKDIR /app

# 复制必要文件
COPY --from=builder /app/package.json /app/bun.lock ./
COPY --from=builder /app/apps/server ./apps/server
COPY --from=builder /app/apps/web/dist ./apps/web/dist
COPY --from=builder /app/packages/constants ./packages/constants
COPY --from=builder /app/node_modules ./node_modules

# 暴露服务端口
EXPOSE 300

# 默认设置环境变量
ENV PORT=300
ENV NODE_ENV=production
# 默认将 SQLite 数据库放在 /data/ 目录下，方便挂载持久化卷
ENV DB_PATH=/data/tiku.db

# 启动服务器
CMD ["bun", "run", "apps/server/src/server.ts"]
