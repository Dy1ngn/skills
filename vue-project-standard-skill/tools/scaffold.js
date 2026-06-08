#!/usr/bin/env node

/**
 * Vue Project Standard - Scaffold Generator
 *
 * 用途：生成符合 Vue Project Standard 规范的标准目录结构
 *
 * 使用方法：
 *   node tools/scaffold.js <项目路径> [--mode=single|monorepo] [--features=auth,dashboard,system]
 *
 * 参数说明：
 *   <项目路径>          目标目录路径（相对或绝对）
 *   --mode=single       单应用模式（默认）
 *   --mode=monorepo     多应用 Monorepo 模式
 *   --features=a,b,c    预创建的业务模块名称列表
 *
 * 示例：
 *   node tools/scaffold.js ./my-app
 *   node tools/scaffold.js ./my-app --mode=single --features=auth,dashboard,order
 *   node tools/scaffold.js ./my-monorepo --mode=monorepo
 */

const fs = require('fs')
const path = require('path')

// ========== 颜色输出 ==========

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
}

function log(msg) { console.log(`${colors.green}✔${colors.reset} ${msg}`) }
function warn(msg) { console.log(`${colors.yellow}⚠${colors.reset} ${msg}`) }
function info(msg) { console.log(`${colors.blue}ℹ${colors.reset} ${msg}`) }
function error(msg) { console.error(`${colors.red}✖${colors.reset} ${msg}`) }
function title(msg) { console.log(`\n${colors.cyan}${msg}${colors.reset}`) }

// ========== 目录定义 ==========

const SINGLE_APP_DIRS = [
  // 核心文件占位（不创建文件，仅确保父目录存在）
  'src',

  // features/ 业务模块（按需创建，此处列出子目录模板）
  // 实际创建由 --features 参数控制

  // shared/ 跨模块共享
  'src/shared/components/ui/atoms',
  'src/shared/components/ui/molecules',
  'src/shared/components/ui/organisms',
  'src/shared/components/business',
  'src/shared/components/feedback',
  'src/shared/composables',
  'src/shared/utils',
  'src/shared/types',
  'src/shared/constants',

  // layouts/ 应用布局
  'src/layouts/components',

  // router/ 路由
  'src/router/routes',

  // stores/ 全局状态
  'src/stores/modules',

  // services/ 全局 API 服务
  'src/services',

  // assets/ 静态资源
  'src/assets/styles',
  'src/assets/images',
  'src/assets/fonts',

  // config/ 应用配置
  'src/config',

  // plugins/ 插件
  'src/plugins',

  // directives/ 自定义指令
  'src/directives',

  // locales/ 国际化
  'src/locales/lang',

  // public/ 静态文件
  'public',
]

const FEATURE_SUB_DIRS = [
  'components',
  'composables',
  'services',
  'stores',
  'types',
  'views',
  'utils',
  'constants',
]

const MONOREPO_DIRS = [
  // apps/
  'apps/web/src',
  'apps/admin/src',
  'apps/mobile/src',

  // packages/
  'packages/@proj/core/shared',
  'packages/@proj/core/composables',
  'packages/@proj/core/stores',
  'packages/@proj/core/utils',
  'packages/@proj/core/design',
  'packages/@proj/core/locales',
  'packages/@proj/core/layouts',
  'packages/@proj/ui',
  'packages/@proj/effects',
  'packages/@proj/tsconfig',

  // internal/
  'internal/eslint-config',
  'internal/vite-config',
  'internal/lint-staged-config',
]

// ========== 模板文件 ==========

const TEMPLATE_FILES = {
  single: {
    'src/main.ts': `import { createApp } from 'vue'
import App from './App.vue'
import { setupPlugins } from './plugins'
import { setupRouterGuards } from './router/guards'
import router from './router'
import 'assets/styles/main.scss'

const app = createApp(App)

setupPlugins(app)
setupRouterGuards(router)

app.use(router)
app.mount('#app')
`,

    'src/App.vue': `<script setup lang="ts">
// App root component
</script>

<template>
  <router-view />
</template>
`,

    'src/router/index.ts': `import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

export default router
`,

    'src/router/routes/index.ts': `import type { RouteRecordRaw } from 'vue-router'
import authRoutes from './auth'
import dashboardRoutes from './dashboard'
import errorRoutes from './error'

export const routes: RouteRecordRaw[] = [
  ...authRoutes,
  ...dashboardRoutes,
  ...errorRoutes,
]
`,

    'src/router/guards.ts': `import type { Router } from 'vue-router'

export function setupRouterGuards(router: Router) {
  router.beforeEach((to, _from, next) => {
    document.title = \`\${(to.meta.title as string) ?? ''} - MyApp\`
    next()
  })
}
`,

    'src/router/types.ts': `import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    requiresAuth?: boolean
    roles?: string[]
    hidden?: boolean
    keepAlive?: boolean
  }
}
`,

    'src/stores/index.ts': `import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia
`,

    'src/services/http.ts': `import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
})

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token && config.headers) {
    config.headers.Authorization = \`Bearer \${token}\`
  }
  return config
})

http.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export { http }
`,

    'src/shared/types/env.d.ts': `/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
`,

    'src/shared/types/api.ts': `/** 统一 API 响应格式 */
export interface ApiResponse<T = unknown> {
  /** 六位状态码，000000 表示成功 */
  status: string
  /** 响应数据 */
  data: T
  /** 响应消息 */
  message: string
}

/** 分页信息 */
export interface PageInfo {
  page: number
  pageSize: number
  total: number
}

/** 分页列表响应 */
export interface PaginatedList<T> {
  list: T[]
  pageInfo: PageInfo
}
`,

    'src/shared/types/common.ts': `/** 可为空 */
export type Nullable<T> = T | null

/** 可选 */
export type Optional<T> = T | undefined

/** 深度只读 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/** 基础 ID 实体 */
export interface BaseEntity {
  id: string
  createdAt?: string
  updatedAt?: string
}
`,

    'src/shared/types/index.ts': `export * from './api'
export * from './common'
`,

    'src/shared/constants/enums.ts': `/** 通用状态 */
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

/** 请求方法 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}
`,

    'src/config/app.config.ts': `export const appConfig = {
  title: 'MyApp',
  version: '1.0.0',
  /** 默认语言 */
  defaultLocale: 'zh-CN',
  /** 默认主题 */
  defaultTheme: 'light' as 'light' | 'dark',
}
`,

    'src/config/api.config.ts': `export const apiConfig = {
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
}
`,

    'src/assets/styles/main.scss': `@use 'variables' as *;
@use 'base';
@use 'utilities';
@use 'transitions';
`,

    'src/assets/styles/_variables.scss': `// ========== 颜色 ==========
$color-primary: #1677ff;
$color-success: #52c41a;
$color-warning: #faad14;
$color-error: #ff4d4f;
$color-info: #1677ff;

// 文本颜色
$color-text: #333;
$color-text-secondary: #666;
$color-text-placeholder: #999;
$color-text-disabled: #ccc;

// 背景颜色
$color-bg: #fff;
$color-bg-secondary: #f5f5f5;
$color-bg-mask: rgba(0, 0, 0, 0.45);

// 边框
$color-border: #d9d9d9;
$color-border-light: #f0f0f0;

// ========== 间距 ==========
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

// ========== 字体 ==========
$font-size-xs: 12px;
$font-size-sm: 14px;
$font-size-md: 16px;
$font-size-lg: 20px;
$font-size-xl: 24px;

$font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

// ========== 圆角 ==========
$radius-sm: 4px;
$radius-md: 8px;
$radius-lg: 12px;
$radius-full: 9999px;

// ========== 阴影 ==========
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
$shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);

// ========== 断点 ==========
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;
$breakpoint-xxl: 1600px;
`,

    'src/assets/styles/_base.scss': `*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: $font-family;
  color: $color-text;
  background-color: $color-bg;
}

a {
  color: $color-primary;
  text-decoration: none;
}
`,

    'src/assets/styles/_utilities.scss': `// 通用工具类
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-left { text-align: left; }

.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.gap-sm { gap: $spacing-sm; }
.gap-md { gap: $spacing-md; }
.gap-lg { gap: $spacing-lg; }

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
`,

    'src/assets/styles/_transitions.scss': `// Vue 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from {
  transform: translateX(100%);
}

.slide-right-leave-to {
  transform: translateX(-100%);
}
`,

    'src/plugins/index.ts': `import type { App } from 'vue'
// import router from '@/router'
// import pinia from '@/stores'

export function setupPlugins(app: App) {
  // app.use(pinia)
  // app.use(router)
}
`,
  },

  monorepo: {
    'pnpm-workspace.yaml': `packages:
  - 'apps/*'
  - 'packages/*'
  - 'internal/*'
`,

    'turbo.json': `{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {}
  }
}
`,
  },
}

// ========== 核心逻辑 ==========

/**
 * 创建目录（递归）
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    return true
  }
  return false
}

/**
 * 写入文件（仅当文件不存在时）
 */
function writeFileIfNotExists(filePath, content) {
  if (!fs.existsSync(filePath)) {
    ensureDir(path.dirname(filePath))
    fs.writeFileSync(filePath, content, 'utf-8')
    return true
  }
  return false
}

/**
 * 生成单应用模式的目录结构
 */
function scaffoldSingleApp(rootDir, features) {
  title('📁 创建单应用目录结构...')

  let dirCount = 0
  for (const dir of SINGLE_APP_DIRS) {
    const fullPath = path.join(rootDir, dir)
    if (ensureDir(fullPath)) {
      log(`目录: ${dir}/`)
      dirCount++
    }
  }

  // 创建业务模块
  if (features.length > 0) {
    title('🧩 创建业务模块...')
    for (const feature of features) {
      for (const subDir of FEATURE_SUB_DIRS) {
        const featurePath = path.join(rootDir, 'src', 'features', feature, subDir)
        if (ensureDir(featurePath)) {
          log(`目录: src/features/${feature}/${subDir}/`)
          dirCount++
        }
      }
      // 创建模块 barrel export
      const indexPath = path.join(rootDir, 'src', 'features', feature, 'index.ts')
      if (writeFileIfNotExists(indexPath, `// ${feature} module public exports\n`)) {
        log(`文件: src/features/${feature}/index.ts`)
      }
    }
  }

  return dirCount
}

/**
 * 生成 Monorepo 模式的目录结构
 */
function scaffoldMonorepo(rootDir) {
  title('📁 创建 Monorepo 目录结构...')

  let dirCount = 0
  for (const dir of MONOREPO_DIRS) {
    const fullPath = path.join(rootDir, dir)
    if (ensureDir(fullPath)) {
      log(`目录: ${dir}/`)
      dirCount++
    }
  }

  // 每个 app 内部也使用单应用结构
  const apps = ['apps/web', 'apps/admin', 'apps/mobile']
  for (const app of apps) {
    const appSrc = path.join(rootDir, app, 'src')
    if (fs.existsSync(appSrc)) {
      for (const dir of SINGLE_APP_DIRS) {
        if (dir === 'src') continue
        const relativeDir = dir.replace(/^src\//, '')
        const fullPath = path.join(appSrc, relativeDir)
        if (ensureDir(fullPath)) {
          dirCount++
        }
      }
    }
  }

  return dirCount
}

/**
 * 生成模板文件
 */
function scaffoldFiles(rootDir, mode) {
  title('📝 创建模板文件...')

  const files = { ...TEMPLATE_FILES.single }
  if (mode === 'monorepo') {
    Object.assign(files, TEMPLATE_FILES.monorepo)
  }

  let fileCount = 0
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(rootDir, relativePath)
    if (writeFileIfNotExists(fullPath, content)) {
      log(`文件: ${relativePath}`)
      fileCount++
    } else {
      warn(`跳过（已存在）: ${relativePath}`)
    }
  }

  return fileCount
}

/**
 * 参数解析
 */
function parseArgs(argv) {
  const args = argv.slice(2)
  const result = {
    targetDir: null,
    mode: 'single',
    features: [],
  }

  for (const arg of args) {
    if (arg.startsWith('--mode=')) {
      result.mode = arg.split('=')[1]
    } else if (arg.startsWith('--features=')) {
      result.features = arg.split('=')[1].split(',').map(s => s.trim()).filter(Boolean)
    } else if (!arg.startsWith('--')) {
      result.targetDir = arg
    }
  }

  return result
}

/**
 * 主函数
 */
function main() {
  const { targetDir, mode, features } = parseArgs(process.argv)

  if (!targetDir) {
    error('请指定项目路径')
    console.log('')
    console.log('用法: node tools/scaffold.js <项目路径> [--mode=single|monorepo] [--features=auth,dashboard]')
    console.log('')
    console.log('示例:')
    console.log('  node tools/scaffold.js ./my-app')
    console.log('  node tools/scaffold.js ./my-app --features=auth,dashboard,order')
    console.log('  node tools/scaffold.js ./my-monorepo --mode=monorepo')
    process.exit(1)
  }

  if (!['single', 'monorepo'].includes(mode)) {
    error(`无效的模式: ${mode}，可选值: single, monorepo`)
    process.exit(1)
  }

  const rootDir = path.resolve(targetDir)

  console.log('')
  console.log(`${colors.cyan}╔══════════════════════════════════════════╗${colors.reset}`)
  console.log(`${colors.cyan}║   Vue Project Standard - Scaffold Tool   ║${colors.reset}`)
  console.log(`${colors.cyan}╚══════════════════════════════════════════╝${colors.reset}`)
  console.log('')
  info(`目标路径: ${rootDir}`)
  info(`项目模式: ${mode}`)
  if (features.length > 0) {
    info(`业务模块: ${features.join(', ')}`)
  }

  // 创建根目录
  ensureDir(rootDir)

  // 生成目录结构
  let dirCount = 0
  if (mode === 'single') {
    dirCount = scaffoldSingleApp(rootDir, features)
  } else {
    dirCount = scaffoldMonorepo(rootDir)
  }

  // 生成模板文件
  const fileCount = scaffoldFiles(rootDir, mode)

  // 完成
  console.log('')
  console.log(`${colors.green}══════════════════════════════════════════${colors.reset}`)
  log(`完成！共创建 ${dirCount} 个目录，${fileCount} 个模板文件`)
  console.log('')
  info('下一步:')
  console.log(`  cd ${targetDir}`)
  console.log('  pnpm install')
  console.log('  pnpm dev')
  console.log('')
}

main()
