#!/usr/bin/env node

/**
 * React Native Project Standard - Structure Validator
 *
 * 用途：校验现有 React Native 项目是否符合 React Native Project Standard 规范
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
 *   node tools/validate.js ./my-rn-app
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
  'src/app',
  'src/features',
  'src/navigation',
  'src/shared',
  'src/shared/components',
  'src/shared/hooks',
  'src/shared/api',
  'src/shared/utils',
  'src/shared/types',
  'src/theme',
  'src/assets',
]

const RECOMMENDED_DIRS = [
  'src/app/providers',
  'src/shared/components/ui',
  'src/shared/components/feedback',
  'src/shared/components/business',
  'src/shared/constants',
  'src/i18n',
  'src/assets/images',
  'src/assets/fonts',
  'src/assets/animations',
]

const REQUIRED_FILES = [
  'src/app/App.tsx',
  'src/navigation/AppNavigator.tsx',
  'src/navigation/navigation.types.ts',
  'src/shared/api/client.ts',
]

const RECOMMENDED_FILES = [
  'src/app/providers/index.ts',
  'src/app/providers/QueryProvider.tsx',
  'src/app/providers/ThemeProvider.tsx',
  'src/shared/api/types.ts',
  'src/shared/api/index.ts',
  'src/shared/components/ui/index.ts',
  'src/shared/components/feedback/ErrorBoundary.tsx',
  'src/shared/hooks/index.ts',
  'src/shared/types/common.ts',
  'src/shared/types/index.ts',
  'src/shared/constants/colors.ts',
  'src/shared/constants/dimensions.ts',
  'src/theme/colors.ts',
  'src/theme/spacing.ts',
  'src/theme/typography.ts',
  'src/theme/index.ts',
]

const ROOT_CONFIG_FILES = [
  'package.json',
  'tsconfig.json',
]

const ROOT_CONFIG_FILES_OPTIONAL = [
  'babel.config.js',
  'metro.config.js',
  '.eslintrc.js',
  'app.json',
  'index.js',
]

// ========== 命名规范检查 ==========

const NAMING_RULES = {
  // 页面组件：PascalCase + Screen 后缀
  screen: {
    pattern: /^[A-Z][a-zA-Z0-9]*Screen\.tsx$/,
    desc: '页面组件应使用 PascalCase + Screen 后缀（如 LoginScreen.tsx）',
    test: (filename, filepath) =>
      filename.endsWith('Screen.tsx') &&
      (filepath.includes('screens/') || filepath.includes('views/')),
  },

  // UI 组件：PascalCase
  component: {
    pattern: /^[A-Z][a-zA-Z0-9]*\.tsx$/,
    desc: '组件应使用 PascalCase 命名（如 Button.tsx、UserAvatar.tsx）',
    test: (filename, filepath) =>
      filename.endsWith('.tsx') &&
      !filename.endsWith('Screen.tsx') &&
      !filename.endsWith('Navigator.tsx') &&
      !filename.endsWith('Provider.tsx') &&
      !filename.endsWith('Layout.tsx') &&
      filepath.includes('components/'),
  },

  // Hook 文件：use 前缀
  hook: {
    pattern: /^use[A-Z][a-zA-Z0-9]*\.ts$/,
    desc: 'Hook 应使用 use 前缀 + PascalCase（如 useAuth.ts）',
    test: (filename, filepath) =>
      filename.endsWith('.ts') &&
      !filename.endsWith('.d.ts') &&
      filename.startsWith('use') &&
      /[A-Z]/.test(filename[3]) &&
      filepath.includes('hooks/'),
  },

  // Zustand Store 文件：xxxStore.ts
  zustandStore: {
    pattern: /^[a-z][a-zA-Z0-]*Store\.ts$/,
    desc: 'Zustand Store 应使用 camelCase + Store 后缀（如 authStore.ts）',
    test: (filename, filepath) =>
      filename.endsWith('Store.ts') &&
      /^[a-z]/.test(filename) &&
      filepath.includes('store/'),
  },

  // MST Model 文件：XxxModel.ts
  mstModel: {
    pattern: /^[A-Z][a-zA-Z0-9]*Model\.ts$/,
    desc: 'MST Model 应使用 PascalCase + Model 后缀（如 AuthModel.ts）',
    test: (filename) => filename.endsWith('Model.ts'),
  },

  // Navigator 文件：XxxNavigator.tsx
  navigator: {
    pattern: /^[A-Z][a-zA-Z0-9]*Navigator\.tsx$/,
    desc: 'Navigator 应使用 PascalCase + Navigator 后缀（如 AppNavigator.tsx）',
    test: (filename) => filename.endsWith('Navigator.tsx'),
  },

  // Provider 文件：XxxProvider.tsx
  provider: {
    pattern: /^[A-Z][a-zA-Z0-9]*Provider\.tsx$/,
    desc: 'Provider 应使用 PascalCase + Provider 后缀（如 ThemeProvider.tsx）',
    test: (filename) => filename.endsWith('Provider.tsx'),
  },

  // API 模块文件：xxx.api.ts
  apiModule: {
    pattern: /^[a-z][a-zA-Z0-9]*\.api\.ts$/,
    desc: 'API 模块应使用 camelCase + .api.ts 后缀（如 auth.api.ts）',
    test: (filename, filepath) =>
      filename.endsWith('.api.ts') &&
      filepath.includes('api/'),
  },

  // 类型文件：xxx.types.ts
  typeFile: {
    pattern: /^[a-z][a-zA-Z0-9]*\.types\.ts$/,
    desc: '类型文件应使用 camelCase + .types.ts 后缀（如 auth.types.ts）',
    test: (filename) => filename.endsWith('.types.ts'),
  },

  // 测试文件：与源文件同名 + .test.ts(x)
  testFile: {
    pattern: /^[a-zA-Z0-9]+\.(test|spec)\.(ts|tsx)$/,
    desc: '测试文件应使用同名 + .test.ts(x) 后缀',
    test: (filename) => filename.endsWith('.test.ts') || filename.endsWith('.test.tsx'),
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
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === 'android' || entry.name === 'ios') continue

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

  info('可选配置文件:')
  for (const file of ROOT_CONFIG_FILES_OPTIONAL) {
    const fullPath = path.join(rootDir, file)
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      pass(file)
      passCount++
    } else {
      warn(`${file} — 建议创建`)
      warnCount++
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

  // 检查页面组件命名（Screen 后缀）
  info('页面组件命名（PascalCase + Screen 后缀）:')
  const screenFiles = files.filter(f =>
    f.type === 'file' &&
    f.name.endsWith('.tsx') &&
    (f.path.includes('screens/') || f.path.includes('views/')) &&
    f.name !== 'index.tsx'
  )
  for (const file of screenFiles) {
    if (NAMING_RULES.screen.pattern.test(file.name)) {
      passCount++
    } else {
      fail(`${file.path} — 应使用 PascalCase + Screen 后缀（如 ${toPascalCase(file.name.replace('.tsx', ''))}Screen.tsx）`)
      failCount++
    }
  }

  // 检查 Hook 命名（use 前缀）
  info('Hook 命名（use 前缀）:')
  const hookFiles = files.filter(f =>
    f.type === 'file' &&
    f.name.endsWith('.ts') &&
    !f.name.endsWith('.d.ts') &&
    !f.name.endsWith('.test.ts') &&
    !f.name.endsWith('.spec.ts') &&
    f.path.includes('hooks/') &&
    !f.name.startsWith('index')
  )
  for (const file of hookFiles) {
    if (file.name.startsWith('use') && NAMING_RULES.hook.pattern.test(file.name)) {
      passCount++
    } else {
      fail(`${file.path} — 应使用 use 前缀（如 use${capitalize(file.name.replace('.ts', ''))}.ts）`)
      failCount++
    }
  }

  // 检查 Zustand Store 命名（xxxStore.ts）
  info('Zustand Store 命名（camelCase + Store 后缀）:')
  const storeFiles = files.filter(f =>
    f.type === 'file' &&
    f.name.endsWith('.ts') &&
    f.path.includes('store/') &&
    !f.name.startsWith('index') &&
    !f.name.endsWith('.types.ts') &&
    !f.name.endsWith('Model.ts')
  )
  for (const file of storeFiles) {
    if (NAMING_RULES.zustandStore.pattern.test(file.name)) {
      passCount++
    } else {
      fail(`${file.path} — 应使用 camelCase + Store 后缀（如 ${file.name.replace('.ts', '')}Store.ts）`)
      failCount++
    }
  }

  // 检查 Navigator 命名（XxxNavigator.tsx）
  info('Navigator 命名（PascalCase + Navigator 后缀）:')
  const navigatorFiles = files.filter(f =>
    f.type === 'file' &&
    f.name.endsWith('.tsx') &&
    f.path.includes('navigation/') &&
    !f.name.startsWith('index') &&
    !f.name.endsWith('.types.ts')
  )
  for (const file of navigatorFiles) {
    if (file.name.includes('Navigator') || file.name.includes('.types.')) {
      passCount++
    } else {
      warn(`${file.path} — 建议使用 PascalCase + Navigator 后缀`)
    }
  }

  // 检查 API 模块命名（xxx.api.ts）
  info('API 模块命名（camelCase + .api.ts 后缀）:')
  const apiFiles = files.filter(f =>
    f.type === 'file' &&
    f.name.endsWith('.ts') &&
    f.path.includes('/api/') &&
    !f.name.startsWith('index') &&
    !f.name.endsWith('.types.ts') &&
    f.name !== 'client.ts'
  )
  for (const file of apiFiles) {
    if (NAMING_RULES.apiModule.pattern.test(file.name)) {
      passCount++
    } else {
      fail(`${file.path} — 应使用 camelCase + .api.ts 后缀`)
      failCount++
    }
  }

  // 检查类型文件命名（xxx.types.ts）
  info('类型文件命名（camelCase + .types.ts 后缀）:')
  const typeFiles = files.filter(f =>
    f.type === 'file' &&
    f.name.endsWith('.ts') &&
    f.path.includes('types/') &&
    !f.name.startsWith('index') &&
    !f.name.endsWith('.d.ts')
  )
  for (const file of typeFiles) {
    if (NAMING_RULES.typeFile.pattern.test(file.name) || file.name === 'common.ts') {
      passCount++
    } else {
      warn(`${file.path} — 建议使用 camelCase + .types.ts 后缀`)
    }
  }

  return { passCount, failCount, warnCount: 0 }
}

// ========== 工具函数 ==========

function toPascalCase(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (_, c) => c.toUpperCase())
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
    console.log('  node tools/validate.js ./my-rn-app')
    process.exit(1)
  }

  const rootDir = path.resolve(targetDir)

  if (!fs.existsSync(rootDir)) {
    console.error(`路径不存在: ${rootDir}`)
    process.exit(1)
  }

  console.log('')
  console.log(`${colors.cyan}╔══════════════════════════════════════════════════╗${colors.reset}`)
  console.log(`${colors.cyan}║ React Native Project Standard - Structure Check ║${colors.reset}`)
  console.log(`${colors.cyan}╚══════════════════════════════════════════════════╝${colors.reset}`)
  info(`检查路径: ${rootDir}`)

  const dirResult = checkDirectories(rootDir)
  const fileResult = checkFiles(rootDir)
  const nameResult = checkNaming(rootDir)

  const totalPass = dirResult.passCount + fileResult.passCount + nameResult.passCount
  const totalFail = dirResult.failCount + fileResult.failCount + nameResult.failCount
  const totalWarn = dirResult.warnCount + fileResult.warnCount + nameResult.warnCount

  console.log('')
  console.log(`${colors.cyan}══════════════════════════════════════════════════${colors.reset}`)

  if (totalFail === 0 && totalWarn === 0) {
    console.log(`${colors.green}  🎉 完全符合 React Native Project Standard 规范！${colors.reset}`)
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
