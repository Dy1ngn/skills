#!/usr/bin/env node

/**
 * Vue Project Standard - Structure Validator
 *
 * 用途：校验现有 Vue 项目是否符合 Vue Project Standard 规范
 *
 * 使用方法：
 *   node tools/validate.js <项目路径>
 *
 * 检查项：
 *   1. 标准目录结构是否存在
 *   2. 文件命名是否符合规范
 *   3. 关键配置文件是否存在
 *
 * 示例：
 *   node tools/validate.js ./my-vue-app
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

function pass(msg) { console.log(`${colors.green}  ✔${colors.reset} ${msg}`) }
function fail(msg) { console.log(`${colors.red}  ✖${colors.reset} ${msg}`) }
function warn(msg) { console.log(`${colors.yellow}  ⚠${colors.reset} ${msg}`) }
function info(msg) { console.log(`${colors.blue}  ℹ${colors.reset} ${msg}`) }
function title(msg) { console.log(`\n${colors.cyan}▸ ${msg}${colors.reset}`) }

// ========== 检查规则 ==========

const REQUIRED_DIRS = [
  'src',
  'src/router',
  'src/stores',
  'src/services',
  'src/assets',
  'src/assets/styles',
  'src/shared',
  'src/shared/types',
  'src/shared/composables',
  'src/shared/utils',
  'src/shared/components',
  'src/layouts',
  'src/config',
]

const RECOMMENDED_DIRS = [
  'src/features',
  'src/router/routes',
  'src/stores/modules',
  'src/shared/constants',
  'src/shared/components/ui',
  'src/shared/components/business',
  'src/shared/components/feedback',
  'src/layouts/components',
  'src/plugins',
  'src/directives',
  'src/locales',
  'public',
]

const REQUIRED_FILES = [
  'src/main.ts',
  'src/App.vue',
  'src/router/index.ts',
  'src/stores/index.ts',
  'src/services/http.ts',
]

const RECOMMENDED_FILES = [
  'src/shared/types/env.d.ts',
  'src/shared/types/api.ts',
  'src/shared/types/common.ts',
  'src/shared/types/index.ts',
  'src/shared/constants/enums.ts',
  'src/router/guards.ts',
  'src/router/types.ts',
  'src/assets/styles/main.scss',
  'src/assets/styles/_variables.scss',
  'src/config/app.config.ts',
  'src/config/api.config.ts',
]

const ROOT_CONFIG_FILES = [
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
]

// ========== 命名规范检查 ==========

const NAMING_RULES = {
  // Vue 组件文件：PascalCase, 多词
  vueComponent: {
    pattern: /^[A-Z][a-zA-Z0-9]+[A-Z][a-zA-Z0-9]*\.vue$/,
    desc: 'Vue 组件应使用 PascalCase 多词命名（如 UserProfile.vue）',
    test: (filename) => filename.endsWith('.vue') && filename !== 'App.vue',
  },
  // Composable 文件：use 前缀
  composable: {
    pattern: /^use[A-Z][a-zA-Z0-9]*\.ts$/,
    desc: 'Composable 应使用 use 前缀 + PascalCase（如 useAuth.ts）',
    test: (filename) => filename.endsWith('.ts') && !filename.endsWith('.d.ts') && filename.startsWith('use') && /[A-Z]/.test(filename[3]),
  },
  // Store 文件：use...Store
  store: {
    pattern: /^use[A-Z][a-zA-Z0-9]*Store\.ts$/,
    desc: 'Store 应使用 use...Store 命名（如 useUserStore.ts）',
    test: (filename) => {
      const dir = '' // 由调用者传入上下文
      return filename.endsWith('.ts') && filename.startsWith('use') && filename.endsWith('Store.ts')
    },
  },
  // Service 文件：...Service.ts
  service: {
    pattern: /^[a-z][a-zA-Z0-9]*Service\.ts$/,
    desc: 'Service 应使用 camelCase + Service 后缀（如 userService.ts）',
    test: (filename) => filename.endsWith('Service.ts') && /^[a-z]/.test(filename),
  },
  // 目录名：kebab-case
  directory: {
    pattern: /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/,
    desc: '目录名应使用 kebab-case（如 user-profile/）',
    test: (dirname) => !dirname.startsWith('.') && !dirname.startsWith('@') && !dirname.startsWith('_'),
  },
}

/**
 * 扫描目录下所有文件
 */
function scanFiles(dir, baseDir = '') {
  const results = []
  if (!fs.existsSync(dir)) return results

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue

    const relativePath = path.join(baseDir, entry.name)
    if (entry.isDirectory()) {
      results.push({ type: 'dir', name: entry.name, path: relativePath })
      results.push(...scanFiles(path.join(dir, entry.name), relativePath))
    } else {
      results.push({ type: 'file', name: entry.name, path: relativePath })
    }
  }
  return results
}

/**
 * 检查目录结构
 */
function checkDirectories(rootDir) {
  title('目录结构检查')

  let passCount = 0
  let failCount = 0
  let warnCount = 0

  // 必需目录
  info('必需目录:')
  for (const dir of REQUIRED_DIRS) {
    const fullPath = path.join(rootDir, dir)
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      pass(`${dir}/`)
      passCount++
    } else {
      fail(`${dir}/ — 缺失`)
      failCount++
    }
  }

  // 推荐目录
  info('推荐目录:')
  for (const dir of RECOMMENDED_DIRS) {
    const fullPath = path.join(rootDir, dir)
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      pass(`${dir}/`)
      passCount++
    } else {
      warn(`${dir}/ — 建议创建`)
      warnCount++
    }
  }

  return { passCount, failCount, warnCount }
}

/**
 * 检查关键文件
 */
function checkFiles(rootDir) {
  title('关键文件检查')

  let passCount = 0
  let failCount = 0
  let warnCount = 0

  // 根目录配置文件
  info('项目配置文件:')
  for (const file of ROOT_CONFIG_FILES) {
    const fullPath = path.join(rootDir, file)
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      pass(file)
      passCount++
    } else {
      fail(`${file} — 缺失`)
      failCount++
    }
  }

  // 必需源文件
  info('必需源文件:')
  for (const file of REQUIRED_FILES) {
    const fullPath = path.join(rootDir, file)
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      pass(file)
      passCount++
    } else {
      fail(`${file} — 缺失`)
      failCount++
    }
  }

  // 推荐源文件
  info('推荐源文件:')
  for (const file of RECOMMENDED_FILES) {
    const fullPath = path.join(rootDir, file)
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      pass(file)
      passCount++
    } else {
      warn(`${file} — 建议创建`)
      warnCount++
    }
  }

  return { passCount, failCount, warnCount }
}

/**
 * 检查命名规范
 */
function checkNaming(rootDir) {
  title('命名规范检查')

  let passCount = 0
  let failCount = 0
  const srcDir = path.join(rootDir, 'src')

  if (!fs.existsSync(srcDir)) {
    warn('src/ 目录不存在，跳过命名检查')
    return { passCount, failCount }
  }

  const files = scanFiles(srcDir)

  // 检查目录命名
  info('目录命名（kebab-case）:')
  const dirs = files.filter(f => f.type === 'dir')
  for (const dir of dirs) {
    const dirname = dir.name
    if (dirname.startsWith('.') || dirname.startsWith('@') || dirname.startsWith('_')) continue
    if (NAMING_RULES.directory.test(dirname)) {
      passCount++
    } else {
      fail(`${dir.path}/ — 不符合 kebab-case（应为 ${toKebabCase(dirname)}）`)
      failCount++
    }
  }

  // 检查 Vue 组件命名
  info('Vue 组件命名（PascalCase 多词）:')
  const vueFiles = files.filter(f => f.type === 'file' && f.name.endsWith('.vue') && f.name !== 'App.vue')
  for (const file of vueFiles) {
    if (NAMING_RULES.vueComponent.test(file.name)) {
      passCount++
    } else {
      fail(`${file.path} — 应使用 PascalCase 多词命名`)
      failCount++
    }
  }

  // 检查 Composable 命名
  info('Composable 命名（use 前缀）:')
  const composableFiles = files.filter(f =>
    f.type === 'file' &&
    f.name.endsWith('.ts') &&
    !f.name.endsWith('.d.ts') &&
    !f.name.endsWith('.spec.ts') &&
    !f.name.endsWith('.test.ts') &&
    f.path.includes('composable') &&
    !f.name.startsWith('index')
  )
  for (const file of composableFiles) {
    if (file.name.startsWith('use') && NAMING_RULES.composable.pattern.test(file.name)) {
      passCount++
    } else {
      fail(`${file.path} — 应使用 use 前缀（如 use${capitalize(file.name.replace('.ts', ''))}.ts）`)
      failCount++
    }
  }

  // 检查 Service 命名
  info('Service 命名（camelCase + Service 后缀）:')
  const serviceFiles = files.filter(f =>
    f.type === 'file' &&
    f.name.endsWith('.ts') &&
    f.path.includes('service') &&
    !f.name.startsWith('index') &&
    f.name !== 'http.ts' &&
    f.name !== 'types.ts'
  )
  for (const file of serviceFiles) {
    if (NAMING_RULES.service.pattern.test(file.name)) {
      passCount++
    } else {
      fail(`${file.path} — 应使用 camelCase + Service 后缀`)
      failCount++
    }
  }

  return { passCount, failCount }
}

// ========== 工具函数 ==========

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// ========== 主函数 ==========

function main() {
  const targetDir = process.argv[2]

  if (!targetDir) {
    console.error('请指定项目路径')
    console.log('')
    console.log('用法: node tools/validate.js <项目路径>')
    console.log('')
    console.log('示例:')
    console.log('  node tools/validate.js ./my-vue-app')
    process.exit(1)
  }

  const rootDir = path.resolve(targetDir)

  if (!fs.existsSync(rootDir)) {
    console.error(`路径不存在: ${rootDir}`)
    process.exit(1)
  }

  console.log('')
  console.log(`${colors.cyan}╔══════════════════════════════════════════╗${colors.reset}`)
  console.log(`${colors.cyan}║  Vue Project Standard - Structure Check  ║${colors.reset}`)
  console.log(`${colors.cyan}╚══════════════════════════════════════════╝${colors.reset}`)
  info(`检查路径: ${rootDir}`)

  const dirResult = checkDirectories(rootDir)
  const fileResult = checkFiles(rootDir)
  const nameResult = checkNaming(rootDir)

  const totalPass = dirResult.passCount + fileResult.passCount + nameResult.passCount
  const totalFail = dirResult.failCount + fileResult.failCount + nameResult.failCount
  const totalWarn = dirResult.warnCount + fileResult.warnCount + nameResult.warnCount

  console.log('')
  console.log(`${colors.cyan}══════════════════════════════════════════${colors.reset}`)

  if (totalFail === 0 && totalWarn === 0) {
    console.log(`${colors.green}  🎉 完全符合 Vue Project Standard 规范！${colors.reset}`)
  } else if (totalFail === 0) {
    console.log(`${colors.green}  ✅ 核心规范检查通过${colors.reset}`)
    console.log(`${colors.yellow}  ⚠ 有 ${totalWarn} 项建议优化${colors.reset}`)
  } else {
    console.log(`${colors.red}  ❌ 发现 ${totalFail} 项不符合规范${colors.reset}`)
    if (totalWarn > 0) {
      console.log(`${colors.yellow}  ⚠ 有 ${totalWarn} 项建议优化${colors.reset}`)
    }
  }

  console.log('')
  console.log(`  ${colors.green}✔ 通过: ${totalPass}${colors.reset}  ${colors.red}✖ 失败: ${totalFail}${colors.reset}  ${colors.yellow}⚠ 警告: ${totalWarn}${colors.reset}`)
  console.log('')

  if (totalFail > 0) {
    process.exit(1)
  }
}

main()
