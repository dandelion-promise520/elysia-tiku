# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

⚠️ **重要提醒**：请始终使用中文进行交流和文档编写，以匹配项目团队的本地化需求。

## 项目概述
Elysia Tiku 是一个使用 Turborepo 管理的 Monorepo 项目，包含：

- **后端服务** (`apps/server`)：基于 ElysiaJS + Bun 运行时的 AI 答题 API 服务
- **前端管理面板** (`apps/web`)：基于 React + Vite + TypeScript 的可视化控制面板

## 开发命令

### Monorepo 管理
```bash
# 安装依赖
bun install

# 启动开发环境（同时启动服务端和前端）
bun run dev

# 构建所有应用
bun run build

# 运行测试
bun run test
```

### 服务端开发
```bash
# 启动服务端开发模式（端口 300）
cd apps/server
bun run dev

# 启动服务端生产模式
bun run start
```

### 前端开发
```bash
# 启动前端开发服务器（端口 5173）
cd apps/web
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### Docker 操作
```bash
# 构建 Docker 镜像
docker build -t elysia-tiku:latest .

# 保存为 tar 归档
docker save elysia-tiku:latest -o elysia-tiku.tar
```

## 架构概览

### 后端 (`apps/server`)
- **框架**：ElysiaJS 配合 Bun 运行时
- **核心功能**：
  - 动态配置管理（运行时更新，无需重启）
  - AI 答题服务，兼容 OpenAI 格式 API
  - 调试模式，支持查看原始提示词和 AI 响应
  - 为前端提供静态文件服务
- **关键文件**：
  - `src/server.ts`：主服务入口点
  - `src/app.ts`：Elysia 应用配置
  - `src/db.ts`：配置存储
  - `src/modules/`：功能模块（答题、配置等）

### 前端 (`apps/web`)
- **框架**：React 19 + Vite + TypeScript
- **样式**：Tailwind CSS 配合 Radix UI 组件
- **功能特性**：
  - AI 配置管理
  - OCS（网课辅助脚本）配置生成
  - 内置测试工作台
  - 暗色主题配合玻璃拟态设计
- **关键目录**：
  - `src/components/`：React 组件
  - `src/components/ui/`：可复用 UI 组件
  - `src/api.ts`：后端 API 客户端

## API 架构

### 后端接口
- `GET /api/config`：获取当前配置
- `POST /api/config`：更新配置
- `POST /api/answer`：提交题目进行 AI 处理
- `GET /api/ocs-config`：生成 OCS 兼容配置
- `GET /api/logs`：获取系统日志
- `POST /api/test`：测试 API 连接性

### 前后端通信
- 通过 `apps/web/src/api.ts` 配置
- 使用存储在 `localStorage` 中的管理员令牌认证
- 自动令牌管理和错误处理

## 配置系统

### 动态配置
- 运行时配置更新，无需重启服务器
- 支持 AI 提供商设置（URL、API 密钥、模型、温度参数等）
- 管理面板的管理员密码保护
- 开发和故障排除的调试模式

### 环境配置
- 开发环境：使用 Bun 的内置环境处理
- 生产环境：优化的 Docker 容器构建

## 测试策略

### 后端测试
- 使用 Bun 的内置测试运行器
- API 端点测试，包含请求/响应验证
- 配置持久化测试

### 前端测试
- 使用 Vitest 进行单元和集成测试
- React Testing Library 进行组件测试
- Playwright 支持浏览器测试功能

## 构建和部署

### 开发环境
- 前后端热模块替换
- 使用 Turborepo 的并发开发
- TypeScript 编译和类型检查

### 生产环境
- 优化的 Docker 构建
- 后端提供静态资源服务
- 环境特定配置

## 代码组织

### 共享模式
- 全程使用 TypeScript 确保类型安全
- ESLint 和 Prettier 保证代码一致性
- 前端的组件化架构
- 后端的模块化设计，功能分离

### 关键技术
- **运行时**：Bun 1.3.11+
- **后端**：ElysiaJS、TypeScript
- **前端**：React 19、Vite、Tailwind CSS、Radix UI
- **构建工具**：Turborepo
- **样式系统**：Tailwind CSS 配合自定义 Radix 色彩系统

---

**语言提醒**：请确保在此项目中使用中文进行所有交流和文档编写。