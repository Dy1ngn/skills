#!/usr/bin/env node

/**
 * Node.js Project Standard - Structure Validator
 *
 * 用途：校验现有 NestJS 项目是否符合 Node.js Project Standard 规范
 *
 * 使用方法：
 *   node tools/validate.js <项目路径>
 *
 * 检查项：
 *   1. 标准目录结构是否存在
 *   2. 关键文件是否存在
 *   3. 文件命名是否符合规范（kebab-case + 类型后缀）
 *
 * 示例：
 *   node tools/validate.js ./my-nestjs-app
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
  'src/modules',
  'src/common',
  'src/common/decorators',
  'src/common/filters',
  'src/common/guards',
  'src/common/interceptors',
  'src/common/pipes',
  'src/common/dto',
  'src/config',
]

const RECOMMENDED_DIRS = [
  'src/common/middleware',
  'src/database',
  'src/database/migrations',
  'src/database/seeds',
  'src/shared',
  'src/shared/utils',
  'src/shared/interfaces',
  'test',
]

const REQUIRED_FILES = [
  'src/main.ts',
  'src/app.module.ts',
  'src/common/filters/http-exception.filter.ts',
  'src/common/interceptors/transform.interceptor.ts',
  'src/common/guards/roles.guard.ts',
  'src/common/decorators/roles.decorator.ts',
  'src/common/decorators/public.decorator.ts',
  'src/common/decorators/current-user.decorator.ts',
  'src/common/dto/page-meta.dto.ts',
  'src/common/dto/page.dto.ts',
  'src/config/app.config.ts',
  'src/config/database.config.ts',
]

const RECOMMENDED_FILES = [
  'src/common/interceptors/logging.interceptor.ts',
  'src/common/middleware/correlation-id.middleware.ts',
  'src/common/pipes/parse-date.pipe.ts',
]

const ROOT_CONFIG_FILES = [
  'package.json',
  'tsconfig.json',
  'tsconfig.build.json',
  'nest-cli.json',
]

// ========== 命名规范检查 ==========

const NAMING_RULES = [
  {
    suffix: '.module.ts',
    desc: '模块文件',
    pattern: /^[a-z][a-z0-9-]*\.module\.ts$/,
  },
  {
    suffix: '.controller.ts',
    desc: '控制器文件',
    pattern: /^[a-z][a-z0-9-]*\.controller\.ts$/,
  },
  {
    suffix: '.service.ts',
    desc: '服务文件',
    pattern: /^[a-z][a-z0-9-]*\.service\.ts$/,
  },
  {
    suffix: '.dto.ts',
    desc: 'DTO 文件',
    pattern: /^[a-z][a-z0-9-]*\.dto\.ts$/,
  },
  {
    suffix: '.entity.ts',
    desc: '实体文件',
    pattern: /^[a-z][a-z0-9-]*\.entity\.ts$/,
  },
  {
    suffix: '.guard.ts',
    desc: 'Guard 文件',
    pattern: /^[a-z][a-z0-9-]*\.guard\.ts$/,
  },
  {
    suffix: '.interceptor.ts',
    desc: '拦截器文件',
    pattern: /^[a-z][a-z0-9-]*\.interceptor\.ts$/,
  },
  {
    suffix: '.filter.ts',
    desc: '过滤器文件',
    pattern: /^[a-z][a-z0-9-]*\.filter\.ts$/,
  },
  {
    suffix: '.pipe.ts',
    desc: '管道文件',
    pattern: /^[a-z][a-z0-9-]*\.pipe\.ts$/,
  },
  {
    suffix: '.middleware.ts',
    desc: '中间件文件',
    pattern: /^[a-z][a-z0-9-]*\.middleware\.ts$/,
  },
  {
    suffix: '.decorator.ts',
    desc: '装饰器文件',
    pattern: /^[a-z][a-z0-9-]*\.decorator\.ts$/,
  },
  {
    suffix: '.strategy.ts',
    desc: '策略文件',
    pattern: /^[a-z][a-z0-9-]*\.strategy\.ts$/,
  },
  {
    suffix: '.config.ts',
    desc: '配置文件',
    pattern: /^[a-z][a-z0-9-]*\.config\.ts$/,
  },
  {
    suffix: '.spec.ts',
    desc: '测试文件',
    pattern: /^[a-z][a-z0-9-]*\.spec\.ts$/,
  },
  {
    suffix: '.e2e-spec.ts',
    desc: 'E2E 测试文件',
    pattern: /^[a-z][a-z0-9-]*\.e2e-spec\.ts$/,
  },
  {
    suffix: '.command.ts',
    desc: '命令文件',
    pattern: /^[a-z][a-z0-9-]*\.command\.ts$/,
  },
  {
    suffix: '.event.ts',
    desc: '事件文件',
    pattern: /^[a-z][a-z0-9-]*\.event\.ts$/,
  },
]

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

  // 检查目录命名（kebab-case）
  info('目录命名（kebab-case）:')
  const dirs = files.filter(f => f.type === 'dir')
  for (const dir of dirs) {
    const dirname = dir.name
    if (dirname.startsWith('.') || dirname.startsWith('@')) continue
    if (/^[a-z][a-z0-9-]*$/.test(dirname)) {
      passCount++
    } else {
      fail(`${dir.path}/ — 不符合 kebab-case（应为 ${toKebabCase(dirname)}）`)
      failCount++
    }
  }

  // 检查各类型文件命名
  const tsFiles = files.filter(f => f.type === 'file' && f.name.endsWith('.ts'))

  for (const rule of NAMING_RULES) {
    const matchingFiles = tsFiles.filter(f => f.name.endsWith(rule.suffix))
    if (matchingFiles.length === 0) continue

    info(`${rule.desc}命名检查:`)
    for (const file of matchingFiles) {
      if (rule.pattern.test(file.name)) {
        passCount++
      } else {
        fail(`${file.path} — 不符合 ${rule.desc} 命名规范（应为 kebab-case）`)
        failCount++
      }
    }
  }

  return { passCount, failCount, warnCount: 0 }
}

// ========== 工具函数 ==========

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
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
    console.log('  node tools/validate.js ./my-nestjs-app')
    process.exit(1)
  }

  const rootDir = path.resolve(targetDir)

  if (!fs.existsSync(rootDir)) {
    console.error(`路径不存在: ${rootDir}`)
    process.exit(1)
  }

  console.log('')
  console.log(`${colors.cyan}╔══════════════════════════════════════════════╗${colors.reset}`)
  console.log(`${colors.cyan}║  Node.js Project Standard - Structure Check  ║${colors.reset}`)
  console.log(`${colors.cyan}╚══════════════════════════════════════════════╝${colors.reset}`)
  info(`检查路径: ${rootDir}`)

  const dirResult = checkDirectories(rootDir)
  const fileResult = checkFiles(rootDir)
  const nameResult = checkNaming(rootDir)

  const totalPass = dirResult.passCount + fileResult.passCount + nameResult.passCount
  const totalFail = dirResult.failCount + fileResult.failCount + nameResult.failCount
  const totalWarn = dirResult.warnCount + fileResult.warnCount + nameResult.warnCount

  console.log('')
  console.log(`${colors.cyan}══════════════════════════════════════════════${colors.reset}`)

  if (totalFail === 0 && totalWarn === 0) {
    console.log(`${colors.green}  🎉 完全符合 Node.js Project Standard 规范！${colors.reset}`)
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
