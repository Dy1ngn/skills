#!/usr/bin/env node

/**
 * 去 AI 化改写建议工具
 *
 * 用途：检测 AI 高频词并给出具体的改写建议，支持自动替换
 *
 * 用法：
 *   node humanize.js <小说文件.txt>                    # 显示改写建议
 *   node humanize.js <小说文件.txt> --apply            # 自动替换并输出到新文件
 *   node humanize.js <小说文件.txt> --apply --inplace  # 原地替换（覆盖原文件）
 */

const fs = require('fs')
const path = require('path')

// ========== 颜色输出 ==========

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
}

function log(msg) { console.log(`${colors.green}✔${colors.reset} ${msg}`) }

// ========== 直接替换规则（可安全自动替换的） ==========

const AUTO_REPLACEMENTS = [
  // 连接类：直接删除
  { find: '值得注意的是，', replace: '', category: '连接类', reason: '删除说明文语气' },
  { find: '值得注意的是,', replace: '', category: '连接类', reason: '删除说明文语气' },
  { find: '与此同时，', replace: '', category: '连接类', reason: '删除万能连接' },
  { find: '不仅如此，', replace: '', category: '连接类', reason: '删除递进模板' },
  { find: '总而言之，', replace: '', category: '连接类', reason: '删除总结模板' },
  { find: '显而易见，', replace: '', category: '连接类', reason: '删除强调模板' },
  { find: '不言而喻，', replace: '', category: '连接类', reason: '删除强调模板' },
  { find: '事实上，', replace: '', category: '连接类', reason: '删除强调模板' },
  { find: '毫无疑问，', replace: '', category: '连接类', reason: '删除强调模板' },
  { find: '众所周知，', replace: '', category: '连接类', reason: '删除强调模板' },
  { find: '更为重要的是，', replace: '', category: '连接类', reason: '删除递进模板' },
  { find: '进一步来说，', replace: '', category: '连接类', reason: '删除递进模板' },
  { find: '需要指出的是，', replace: '', category: '连接类', reason: '删除说明文语气' },
  { find: '不可否认，', replace: '', category: '连接类', reason: '删除假谦虚' },
  { find: '诚然，', replace: '', category: '连接类', reason: '删除假谦虚' },

  // 连接类：替换为更自然的表达
  { find: '然而，', replace: '可', category: '连接类', reason: '换用更口语的转折词' },
  { find: '因此，', replace: '', category: '连接类', reason: '删除因果模板，靠行动展示因果' },
]

// ========== 建议替换规则（需要人工判断的） ==========

const SUGGESTED_REPLACEMENTS = [
  // 情感类
  { find: '不禁', category: '情感类', suggestions: ['删除，直接写动作', '改为具体反应'] },
  { find: '竟然', category: '情感类', suggestions: ['用具体反应替代', '改为：愣住/手里的杯子差点掉了'] },
  { find: '五味杂陈', category: '情感类', suggestions: ['写出具体感受', '改为：想笑又想哭'] },
  { find: '百感交集', category: '情感类', suggestions: ['写出具体感受', '改为：鼻子酸了，说不出话'] },
  { find: '心中一紧', category: '情感类', suggestions: ['改为身体反应', '改为：呼吸一滞/手心冒汗'] },
  { find: '不由得', category: '情感类', suggestions: ['删除，改为主动动作'] },
  { find: '不由自主', category: '情感类', suggestions: ['删除，改为主动动作'] },
  { find: '心头一震', category: '情感类', suggestions: ['改为具体反应', '改为：手里的筷子掉了'] },
  { find: '若有所思', category: '情感类', suggestions: ['写出具体在想什么'] },
  { find: '恍然大悟', category: '情感类', suggestions: ['写出具体想通了什么'] },
  { find: '若有所悟', category: '情感类', suggestions: ['写出具体想通了什么'] },
  { find: '心领神会', category: '情感类', suggestions: ['用动作展示默契：两人对视一眼，都没说话'] },
  { find: '暗自', category: '情感类', suggestions: ['通过行为展示内心：他嘴上说没事，手却在桌子底下攥成了拳头'] },
  { find: '强忍', category: '情感类', suggestions: ['写出具体怎么忍的：她咬着嘴唇，指甲掐进掌心'] },

  // 描写类
  { find: '目光深邃', category: '描写类', suggestions: ['写出具体：眼窝深陷/瞳色暗/目光锐利'] },
  { find: '嘴角微微上扬', category: '描写类', suggestions: ['写出笑的质感：咧嘴一笑/苦笑/抿嘴笑'] },
  { find: '微微一笑', category: '描写类', suggestions: ['写出笑的质感'] },
  { find: '不禁一颤', category: '描写类', suggestions: ['写出具体身体反应：手指抖了/脚底发软'] },
  { find: '气质不凡', category: '描写类', suggestions: ['通过行为/衣着/他人反应来展示'] },
  { find: '眉头紧锁', category: '描写类', suggestions: ['换用：揉了揉眉心/叹了口气'] },
  { find: '沉默不语', category: '描写类', suggestions: ['用具体动作替代：转过身去/端起杯子'] },
  { find: '眼中闪过一丝', category: '描写类', suggestions: ['直接写眼神：盯着他/避开目光/眼神空洞'] },
  { find: '语重心长', category: '描写类', suggestions: ['通过说话方式展示：停顿了很久才开口/声音放低了'] },
  { find: '意味深长', category: '描写类', suggestions: ['写出具体暗示了什么，或让读者自己判断'] },
  { find: '仿佛', category: '描写类', suggestions: ['减少使用，改为直接描写'] },
]

// ========== 改写公式 ==========

const REWRITE_FORMULAS = {
  '感到紧张': { rewrite: '手指不自觉地攥紧了衣角', formula: '身体部位 + 具体动作' },
  '感到害怕': { rewrite: '后背一阵发凉，汗毛竖了起来', formula: '身体部位 + 具体动作' },
  '感到高兴': { rewrite: '嘴角怎么也压不下去', formula: '身体部位 + 具体动作' },
  '感到悲伤': { rewrite: '鼻子一酸，眼眶发烫', formula: '身体部位 + 具体动作' },
  '感到愤怒': { rewrite: '牙关咬得咯咯响，太阳穴突突地跳', formula: '身体部位 + 具体动作' },
  '感到惊讶': { rewrite: '嘴张了半天合不上', formula: '身体部位 + 具体动作' },
  '感到困惑': { rewrite: '眉头拧成了一个疙瘩', formula: '身体部位 + 具体动作' },
  '感到孤独': { rewrite: '房间里安静得能听到冰箱的嗡嗡声', formula: '环境 + 感官细节' },
}

// ========== 核心逻辑 ==========

function analyzeFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf-8')
  const lines = text.split('\n')
  const issues = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    // 检查自动替换规则
    for (const rule of AUTO_REPLACEMENTS) {
      if (line.includes(rule.find)) {
        issues.push({
          line: lineNum,
          type: 'auto',
          word: rule.find,
          category: rule.category,
          reason: rule.reason,
          replacement: rule.replace,
          context: line.trim(),
        })
      }
    }

    // 检查建议替换规则
    for (const rule of SUGGESTED_REPLACEMENTS) {
      if (line.includes(rule.find)) {
        issues.push({
          line: lineNum,
          type: 'suggest',
          word: rule.find,
          category: rule.category,
          suggestions: rule.suggestions,
          context: line.trim(),
        })
      }
    }

    // 检查改写公式
    for (const [pattern, formula] of Object.entries(REWRITE_FORMULAS)) {
      if (line.includes(pattern)) {
        issues.push({
          line: lineNum,
          type: 'formula',
          word: pattern,
          category: '情感公式',
          formula: formula.formula,
          rewrite: formula.rewrite,
          context: line.trim(),
        })
      }
    }
  }

  return { text, lines, issues }
}

function printSuggestions(filePath, analysis) {
  const { issues } = analysis

  console.log('')
  console.log(`${colors.cyan}╔══════════════════════════════════════╗${colors.reset}`)
  console.log(`${colors.cyan}║    去 AI 化改写建议                  ║${colors.reset}`)
  console.log(`${colors.cyan}╚══════════════════════════════════════╝${colors.reset}`)
  console.log('')
  console.log(`  文件: ${filePath}`)
  console.log(`  问题数: ${issues.length}`)
  console.log('')

  if (issues.length === 0) {
    console.log(`${colors.green}✔ 未发现需要改写的问题，文本质量良好！${colors.reset}`)
    console.log('')
    return
  }

  // 按类型分组
  const autoIssues = issues.filter(i => i.type === 'auto')
  const suggestIssues = issues.filter(i => i.type === 'suggest')
  const formulaIssues = issues.filter(i => i.type === 'formula')

  if (autoIssues.length > 0) {
    console.log(`${colors.bold}▸ 可自动替换（${autoIssues.length} 处）${colors.reset}`)
    console.log('')
    for (const issue of autoIssues) {
      console.log(`  ${colors.dim}第${issue.line}行${colors.reset}  ${colors.red}"${issue.word}"${colors.reset}`)
      console.log(`  ${colors.dim}原文: ${issue.context}${colors.reset}`)
      console.log(`  ${colors.green}→ 删除"${issue.word}"${colors.reset}（${issue.reason}）`)
      console.log('')
    }
  }

  if (suggestIssues.length > 0) {
    console.log(`${colors.bold}▸ 需人工判断（${suggestIssues.length} 处）${colors.reset}`)
    console.log('')
    for (const issue of suggestIssues) {
      console.log(`  ${colors.dim}第${issue.line}行${colors.reset}  ${colors.yellow}"${issue.word}"${colors.reset}`)
      console.log(`  ${colors.dim}原文: ${issue.context}${colors.reset}`)
      for (const s of issue.suggestions) {
        console.log(`  ${colors.green}→ ${s}${colors.reset}`)
      }
      console.log('')
    }
  }

  if (formulaIssues.length > 0) {
    console.log(`${colors.bold}▸ 可套用改写公式（${formulaIssues.length} 处）${colors.reset}`)
    console.log('')
    for (const issue of formulaIssues) {
      console.log(`  ${colors.dim}第${issue.line}行${colors.reset}  ${colors.cyan}"${issue.word}"${colors.reset}`)
      console.log(`  ${colors.dim}原文: ${issue.context}${colors.reset}`)
      console.log(`  ${colors.green}→ 公式: ${issue.formula}${colors.reset}`)
      console.log(`  ${colors.green}→ 示例: ${issue.rewrite}${colors.reset}`)
      console.log('')
    }
  }

  // 统计
  console.log(`${colors.bold}📊 统计${colors.reset}`)
  console.log(`  可自动替换: ${autoIssues.length} 处`)
  console.log(`  需人工判断: ${suggestIssues.length} 处`)
  console.log(`  可套用公式: ${formulaIssues.length} 处`)
  console.log('')
  console.log(`  ${colors.dim}使用 --apply 参数可自动替换可自动替换的部分${colors.reset}`)
  console.log('')
}

function applyReplacements(filePath, analysis, inplace) {
  const { text, issues } = analysis
  const autoIssues = issues.filter(i => i.type === 'auto')

  if (autoIssues.length === 0) {
    console.log('没有可自动替换的内容。')
    return
  }

  let result = text
  let count = 0

  for (const issue of autoIssues) {
    const before = result
    // 只替换第一个匹配（避免重复替换）
    result = result.replace(issue.word, issue.replacement)
    if (result !== before) count++
  }

  if (inplace) {
    fs.writeFileSync(filePath, result, 'utf-8')
    log(`已原地替换 ${count} 处，文件已更新: ${filePath}`)
  } else {
    const ext = path.extname(filePath)
    const base = path.basename(filePath, ext)
    const dir = path.dirname(filePath)
    const outputPath = path.join(dir, `${base}.humanized${ext}`)
    fs.writeFileSync(outputPath, result, 'utf-8')
    log(`已替换 ${count} 处，输出到: ${outputPath}`)
  }
}

// ========== 参数解析 ==========

function parseArgs(argv) {
  const args = argv.slice(2)
  const result = {
    file: null,
    apply: false,
    inplace: false,
  }

  for (const arg of args) {
    if (arg === '--apply') result.apply = true
    else if (arg === '--inplace') result.inplace = true
    else if (!arg.startsWith('--')) result.file = arg
  }

  return result
}

// ========== 主函数 ==========

function main() {
  const { file, apply, inplace } = parseArgs(process.argv)

  if (!file) {
    console.error('请指定小说文件路径')
    console.log('')
    console.log('用法:')
    console.log('  node humanize.js <小说文件.txt>                    # 显示改写建议')
    console.log('  node humanize.js <小说文件.txt> --apply            # 自动替换并输出到新文件')
    console.log('  node humanize.js <小说文件.txt> --apply --inplace  # 原地替换')
    process.exit(1)
  }

  const filePath = path.resolve(file)
  if (!fs.existsSync(filePath)) {
    console.error(`文件不存在: ${filePath}`)
    process.exit(1)
  }

  const analysis = analyzeFile(filePath)

  if (apply) {
    applyReplacements(filePath, analysis, inplace)
  } else {
    printSuggestions(filePath, analysis)
  }
}

main()
