#!/usr/bin/env node

/**
 * Java Project Standard - Structure Validator
 *
 * 用途：校验现有 Java 项目是否符合 Java Project Standard 规范
 *
 * 使用方法：
 *   node tools/validate.js <项目路径>
 *
 * 检查项：
 *   1. 标准目录结构是否存在
 *   2. 关键配置文件是否存在
 *   3. Java 文件命名是否符合规范（Controller、Service、Mapper 等）
 *   4. 目录名是否全小写
 *   5. 多模块结构是否合理
 *
 * 示例：
 *   node tools/validate.js ./my-java-app
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

// 单模块模式：必需目录
const SINGLE_REQUIRED_DIRS = [
  'src',
  'src/main',
  'src/main/java',
  'src/main/resources',
  'src/test',
]

// 单模块模式：推荐目录（在 basePackage 下）
const SINGLE_RECOMMENDED_PACKAGES = [
  'controller',
  'service',
  'service/impl',
  'mapper',
  'entity',
  'dto',
  'vo',
  'config',
  'constant',
  'enums',
  'exception',
  'util',
  'common',
]

// 多模块模式：必需模块
const MULTIMODULE_REQUIRED = [
  'admin',
  'common',
  'framework',
]

// 多模块模式：推荐模块
const MULTIMODULE_RECOMMENDED = [
  'system',
]

// 关键配置文件
const REQUIRED_FILES = [
  'pom.xml',
]

const SINGLE_RECOMMENDED_FILES = [
  'src/main/resources/application.yml',
  'src/main/resources/application-dev.yml',
  'src/main/resources/application-prod.yml',
]

const MULTIMODULE_RECOMMENDED_FILES = [
  'application.yml',
  'application-dev.yml',
  'application-prod.yml',
]

// ========== 命名规范检查 ==========

const NAMING_RULES = {
  // Controller 文件：*Controller.java
  controller: {
    pattern: /^[A-Z][a-zA-Z0-9]*Controller\.java$/,
    desc: 'Controller 文件应使用 PascalCase + Controller 后缀',
    test: (filename) => filename.endsWith('Controller.java'),
  },
  // Service 接口文件：*Service.java 或 I*Service.java
  service: {
    pattern: /^(I[A-Z][a-zA-Z0-9]*|[A-Z][a-zA-Z0-9]*)Service\.java$/,
    desc: 'Service 接口应使用 I*Service 或 *Service 命名',
    test: (filename) => filename.endsWith('Service.java') && !filename.endsWith('ServiceImpl.java'),
  },
  // ServiceImpl 文件：*ServiceImpl.java
  serviceImpl: {
    pattern: /^[A-Z][a-zA-Z0-9]*ServiceImpl\.java$/,
    desc: 'Service 实现类应使用 *ServiceImpl 命名',
    test: (filename) => filename.endsWith('ServiceImpl.java'),
  },
  // Mapper 文件：*Mapper.java
  mapper: {
    pattern: /^[A-Z][a-zA-Z0-9]*Mapper\.java$/,
    desc: 'Mapper 文件应使用 *Mapper 命名',
    test: (filename) => filename.endsWith('Mapper.java'),
  },
  // Entity 文件：PascalCase.java（无特定后缀要求）
  entity: {
    pattern: /^[A-Z][a-zA-Z0-9]*\.java$/,
    desc: '实体文件应使用 PascalCase 命名',
    test: (filename) => {
      if (!filename.endsWith('.java')) return false
      // 排除已知后缀的文件
      const knownSuffixes = ['Controller', 'Service', 'ServiceImpl', 'Mapper', 'Repository',
        'DTO', 'VO', 'BO', 'Config', 'Configuration', 'Utils', 'Util', 'Exception',
        'Aspect', 'Interceptor', 'Filter', 'Test', 'Application']
      for (const suffix of knownSuffixes) {
        if (filename.endsWith(suffix + '.java')) return false
      }
      return true
    },
  },
  // Config 文件：*Config.java 或 *Configuration.java
  config: {
    pattern: /^[A-Z][a-zA-Z0-9]*(Config|Configuration)\.java$/,
    desc: '配置类应使用 *Config 或 *Configuration 命名',
    test: (filename) => filename.endsWith('Config.java') || filename.endsWith('Configuration.java'),
  },
  // Utils 文件：*Utils.java 或 *Util.java
  utils: {
    pattern: /^[A-Z][a-zA-Z0-9]*(Utils|Util)\.java$/,
    desc: '工具类应使用 *Utils 或 *Util 命名',
    test: (filename) => filename.endsWith('Utils.java') || filename.endsWith('Util.java'),
  },
  // Exception 文件：*Exception.java
  exception: {
    pattern: /^[A-Z][a-zA-Z0-9]*Exception\.java$/,
    desc: '异常类应使用 *Exception 命名',
    test: (filename) => filename.endsWith('Exception.java'),
  },
  // Aspect 文件：*Aspect.java
  aspect: {
    pattern: /^[A-Z][a-zA-Z0-9]*Aspect\.java$/,
    desc: '切面类应使用 *Aspect 命名',
    test: (filename) => filename.endsWith('Aspect.java'),
  },
  // 测试文件：*Test.java
  test: {
    pattern: /^[A-Z][a-zA-Z0-9]*Test\.java$/,
    desc: '测试类应使用 *Test 命名',
    test: (filename) => filename.endsWith('Test.java'),
  },
  // Repository 文件：*Repository.java（JPA）
  repository: {
    pattern: /^[A-Z][a-zA-Z0-9]*Repository\.java$/,
    desc: 'Repository 文件应使用 *Repository 命名',
    test: (filename) => filename.endsWith('Repository.java'),
  },
  // VO 文件：*VO.java
  vo: {
    pattern: /^[A-Z][a-zA-Z0-9]*VO\.java$/,
    desc: 'VO 文件应使用 *VO 命名',
    test: (filename) => filename.endsWith('VO.java'),
  },
  // DTO 文件：*DTO.java、*Req.java、*Query.java
  dto: {
    pattern: /^[A-Z][a-zA-Z0-9]*(DTO|Req|Query|Request)\.java$/,
    desc: 'DTO 文件应使用 *DTO、*Req 或 *Query 命名',
    test: (filename) => filename.endsWith('DTO.java') || filename.endsWith('Req.java') ||
      filename.endsWith('Query.java') || filename.endsWith('Request.java'),
  },
  // BO 文件：*BO.java
  bo: {
    pattern: /^[A-Z][a-zA-Z0-9]*BO\.java$/,
    desc: 'BO 文件应使用 *BO 命名',
    test: (filename) => filename.endsWith('BO.java'),
  },
}

// ========== 核心逻辑 ==========

/**
 * 扫描目录下所有文件和目录（递归）
 */
function scanFiles(dir, baseDir = '', maxDepth = 10, currentDepth = 0) {
  const results = []
  if (!fs.existsSync(dir) || currentDepth > maxDepth) return results

  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch (e) {
    return results
  }

  for (const entry of entries) {
    // 跳过不需要检查的目录
    if (['node_modules', '.git', 'dist', 'target', '.idea', '.vscode', 'build', '.mvn'].includes(entry.name)) {
      continue
    }

    const relativePath = path.join(baseDir, entry.name)
    if (entry.isDirectory()) {
      results.push({ type: 'dir', name: entry.name, path: relativePath })
      results.push(...scanFiles(path.join(dir, entry.name), relativePath, maxDepth, currentDepth + 1))
    } else {
      results.push({ type: 'file', name: entry.name, path: relativePath })
    }
  }
  return results
}

/**
 * 查找 Java 源码根目录
 */
function findJavaSourceRoot(rootDir) {
  // 尝试常见的源码路径
  const candidates = [
    'src/main/java',
    'src',
  ]

  for (const candidate of candidates) {
    const fullPath = path.join(rootDir, candidate)
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      return fullPath
    }
  }

  return null
}

/**
 * 查找基础包路径（在 src/main/java 下的第一个有效包）
 */
function findBasePackage(javaRoot) {
  if (!javaRoot || !fs.existsSync(javaRoot)) return null

  const entries = fs.readdirSync(javaRoot, { withFileTypes: true })
  // 查找 com/ 或其他顶级包
  for (const entry of entries) {
    if (entry.isDirectory() && /^[a-z]/.test(entry.name)) {
      const comPath = path.join(javaRoot, entry.name)
      const subEntries = fs.readdirSync(comPath, { withFileTypes: true })
      for (const subEntry of subEntries) {
        if (subEntry.isDirectory()) {
          const companyPath = path.join(comPath, subEntry.name)
          const projectEntries = fs.readdirSync(companyPath, { withFileTypes: true })
          for (const projEntry of projectEntries) {
            if (projEntry.isDirectory()) {
              return path.join(entry.name, subEntry.name, projEntry.name)
            }
          }
        }
      }
    }
  }

  return null
}

/**
 * 检测项目模式（单模块 or 多模块）
 */
function detectMode(rootDir) {
  // 检查是否存在子模块 pom.xml 或子模块目录
  const entries = fs.readdirSync(rootDir, { withFileTypes: true })
  const subModules = entries.filter(e =>
    e.isDirectory() && (
      e.name.endsWith('-admin') ||
      e.name.endsWith('-common') ||
      e.name.endsWith('-framework') ||
      e.name.endsWith('-system')
    )
  )

  if (subModules.length >= 2) {
    return 'multimodule'
  }

  return 'single'
}

/**
 * 检查单模块目录结构
 */
function checkSingleModuleStructure(rootDir, basePackagePath) {
  title('单模块目录结构检查')

  let passCount = 0
  let failCount = 0
  let warnCount = 0

  // 必需目录
  info('必需目录:')
  for (const dir of SINGLE_REQUIRED_DIRS) {
    const fullPath = path.join(rootDir, dir)
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      pass(`${dir}/`)
      passCount++
    } else {
      fail(`${dir}/ — 缺失`)
      failCount++
    }
  }

  // 推荐包目录
  if (basePackagePath) {
    info('推荐包目录:')
    for (const pkg of SINGLE_RECOMMENDED_PACKAGES) {
      const fullPath = path.join(rootDir, 'src', 'main', 'java', basePackagePath, pkg)
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        pass(`${basePackagePath}/${pkg}/`)
        passCount++
      } else {
        warn(`${basePackagePath}/${pkg}/ — 建议创建`)
        warnCount++
      }
    }
  } else {
    warn('未能自动检测基础包路径，跳过包目录检查')
    warnCount++
  }

  return { passCount, failCount, warnCount }
}

/**
 * 检查多模块目录结构
 */
function checkMultimoduleStructure(rootDir, projectName) {
  title('多模块 Maven 目录结构检查')

  let passCount = 0
  let failCount = 0
  let warnCount = 0

  // 检查父 pom.xml
  const parentPom = path.join(rootDir, 'pom.xml')
  if (fs.existsSync(parentPom)) {
    pass('pom.xml — 父 POM')
    passCount++
  } else {
    fail('pom.xml — 父 POM 缺失')
    failCount++
  }

  // 检查子模块
  info('子模块检查:')
  const suffixes = [...MULTIMODULE_REQUIRED, ...MULTIMODULE_RECOMMENDED]
  for (const suffix of suffixes) {
    const moduleName = projectName ? `${projectName}-${suffix}` : suffix
    const moduleDir = path.join(rootDir, moduleName)
    const isRequired = MULTIMODULE_REQUIRED.includes(suffix)

    if (fs.existsSync(moduleDir) && fs.statSync(moduleDir).isDirectory()) {
      pass(`${moduleName}/`)

      // 检查子模块 pom.xml
      const modulePom = path.join(moduleDir, 'pom.xml')
      if (fs.existsSync(modulePom)) {
        pass(`${moduleName}/pom.xml`)
      } else {
        fail(`${moduleName}/pom.xml — 缺失`)
        failCount++
      }
      passCount++
    } else {
      if (isRequired) {
        fail(`${moduleName}/ — 缺失（必需模块）`)
        failCount++
      } else {
        warn(`${moduleName}/ — 建议创建`)
        warnCount++
      }
    }
  }

  return { passCount, failCount, warnCount }
}

/**
 * 检查关键配置文件
 */
function checkFiles(rootDir, mode) {
  title('关键文件检查')

  let passCount = 0
  let failCount = 0
  let warnCount = 0

  // 根目录必需文件
  info('项目配置文件:')
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

  // 推荐配置文件
  info('推荐配置文件:')
  const recommendFiles = mode === 'multimodule'
    ? MULTIMODULE_RECOMMENDED_FILES.map(f => `${getAdminModuleName(rootDir)}/src/main/resources/${f}`)
    : SINGLE_RECOMMENDED_FILES

  for (const file of recommendFiles) {
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
 * 获取 admin 模块名
 */
function getAdminModuleName(rootDir) {
  if (!fs.existsSync(rootDir)) return ''
  const entries = fs.readdirSync(rootDir, { withFileTypes: true })
  const adminModule = entries.find(e => e.isDirectory() && e.name.endsWith('-admin'))
  return adminModule ? adminModule.name : ''
}

/**
 * 检查 Java 命名规范
 */
function checkNaming(rootDir) {
  title('Java 命名规范检查')

  let passCount = 0
  let failCount = 0

  const files = scanFiles(rootDir)

  // 分类文件
  const javaFiles = files.filter(f => f.type === 'file' && f.name.endsWith('.java'))
  const directories = files.filter(f => f.type === 'dir')

  // ---- 检查目录命名（全小写） ----
  info('目录命名（全小写）:')
  const javaRelatedDirs = directories.filter(d => {
    // 只检查 Java 源码相关的目录
    const pathParts = d.path.split(path.sep)
    return pathParts.some(p => p === 'java' || p === 'main' || p === 'src') ||
      d.path.includes('src' + path.sep + 'main')
  })

  for (const dir of javaRelatedDirs) {
    const dirname = dir.name
    if (dirname.startsWith('.') || dirname.startsWith('@')) continue

    if (/^[a-z][a-z0-9]*$/.test(dirname) || /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(dirname)) {
      passCount++
    } else {
      fail(`${dir.path}/ — 目录名应全小写（当前: ${dirname}）`)
      failCount++
    }
  }

  // ---- 检查各类型文件命名 ----
  for (const [ruleName, rule] of Object.entries(NAMING_RULES)) {
    const matchingFiles = javaFiles.filter(f => rule.test(f.name))

    if (matchingFiles.length > 0) {
      const label = {
        controller: 'Controller 命名',
        service: 'Service 接口命名',
        serviceImpl: 'ServiceImpl 命名',
        mapper: 'Mapper 命名',
        entity: 'Entity 命名',
        config: 'Config 类命名',
        utils: 'Utils 类命名',
        exception: 'Exception 类命名',
        aspect: 'Aspect 类命名',
        test: 'Test 类命名',
        repository: 'Repository 命名',
        vo: 'VO 命名',
        dto: 'DTO 命名',
        bo: 'BO 命名',
      }[ruleName] || ruleName

      info(`${label}:`)
      for (const file of matchingFiles) {
        if (rule.pattern.test(file.name)) {
          passCount++
        } else {
          fail(`${file.path} — ${rule.desc}`)
          failCount++
        }
      }
    }
  }

  return { passCount, failCount }
}

/**
 * 检查布尔字段命名（如果能找到实体文件）
 */
function checkBooleanFieldNaming(rootDir) {
  title('布尔字段命名检查（is 前缀）')

  let passCount = 0
  let warnCount = 0

  const files = scanFiles(rootDir)
  const entityFiles = files.filter(f =>
    f.type === 'file' &&
    f.name.endsWith('.java') &&
    (f.path.includes('entity') || f.path.includes('domain'))
  )

  if (entityFiles.length === 0) {
    info('未找到实体文件，跳过布尔字段检查')
    return { passCount, warnCount }
  }

  // 简单检查：在实体文件中查找 is 开头的布尔字段
  const isFieldPattern = /(?:private|protected)\s+Boolean\s+is([A-Z])/
  const isFieldPatternPrimitive = /(?:private|protected)\s+boolean\s+is([A-Z])/

  for (const file of entityFiles) {
    const fullPath = path.join(rootDir, file.path)
    try {
      const content = fs.readFileSync(fullPath, 'utf-8')
      const lines = content.split('\n')

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (isFieldPattern.test(line) || isFieldPatternPrimitive.test(line)) {
          warn(`${file.path}:${i + 1} — 布尔字段不应使用 is 前缀: ${line}`)
          warnCount++
        }
      }

      if (warnCount === 0) {
        passCount++
      }
    } catch (e) {
      // 忽略读取错误
    }
  }

  if (warnCount === 0 && entityFiles.length > 0) {
    info(`检查了 ${entityFiles.length} 个实体文件，未发现 is 前缀布尔字段`)
  }

  return { passCount, warnCount }
}

// ========== 工具函数 ==========

// (无额外工具函数)

// ========== 主函数 ==========

function main() {
  const targetDir = process.argv[2]

  if (!targetDir) {
    console.error('请指定项目路径')
    console.log('')
    console.log('用法: node tools/validate.js <项目路径>')
    console.log('')
    console.log('示例:')
    console.log('  node tools/validate.js ./my-java-app')
    process.exit(1)
  }

  const rootDir = path.resolve(targetDir)

  if (!fs.existsSync(rootDir)) {
    console.error(`路径不存在: ${rootDir}`)
    process.exit(1)
  }

  console.log('')
  console.log(`${colors.cyan}╔══════════════════════════════════════════════╗${colors.reset}`)
  console.log(`${colors.cyan}║  Java Project Standard - Structure Check     ║${colors.reset}`)
  console.log(`${colors.cyan}╚══════════════════════════════════════════════╝${colors.reset}`)
  info(`检查路径: ${rootDir}`)

  // 检测项目模式
  const mode = detectMode(rootDir)
  info(`检测到项目模式: ${mode === 'multimodule' ? '多模块 Maven' : '单模块 Spring Boot'}`)

  // 查找基础包路径
  const javaRoot = findJavaSourceRoot(rootDir)
  const basePackagePath = findBasePackage(javaRoot)
  if (basePackagePath) {
    info(`检测到基础包路径: ${basePackagePath}`)
  }

  // 推导项目名（多模块模式需要）
  const projectName = path.basename(rootDir)

  // 执行各项检查
  let structureResult
  if (mode === 'multimodule') {
    structureResult = checkMultimoduleStructure(rootDir, projectName)
  } else {
    structureResult = checkSingleModuleStructure(rootDir, basePackagePath)
  }

  const fileResult = checkFiles(rootDir, mode)
  const nameResult = checkNaming(rootDir)
  const boolResult = checkBooleanFieldNaming(rootDir)

  // 汇总结果
  const totalPass = structureResult.passCount + fileResult.passCount + nameResult.passCount + boolResult.passCount
  const totalFail = structureResult.failCount + fileResult.failCount + nameResult.failCount
  const totalWarn = structureResult.warnCount + fileResult.warnCount + boolResult.warnCount

  console.log('')
  console.log(`${colors.cyan}══════════════════════════════════════════════${colors.reset}`)

  if (totalFail === 0 && totalWarn === 0) {
    console.log(`${colors.green}  🎉 完全符合 Java Project Standard 规范！${colors.reset}`)
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
