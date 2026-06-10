#!/usr/bin/env node

/**
 * 古风言情自检修改工具
 *
 * 用途：调用 de-ai-novel-skill 检测 AI 味，自动修改直到达标
 *
 * 用法：
 *   node selfcheck.js <小说文件.txt>                    # 自动修改直到 AI 感 <10
 *   node selfcheck.js <小说文件.txt> --target=15        # 指定目标分数
 *   node selfcheck.js <小说文件.txt> --max-iter=10      # 最大迭代次数
 *   node selfcheck.js <小说文件.txt> --output=out.txt   # 指定输出文件
 *   node selfcheck.js <小说文件.txt> --dry-run          # 只检测不修改
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

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
function warn(msg) { console.log(`${colors.yellow}⚠${colors.reset} ${msg}`) }
function error(msg) { console.log(`${colors.red}✖${colors.reset} ${msg}`) }
function info(msg) { console.log(`${colors.blue}ℹ${colors.reset} ${msg}`) }
function step(msg) { console.log(`\n${colors.cyan}▸ ${msg}${colors.reset}`) }

// ========== 路径配置 ==========

const DE_AI_SKILL_DIR = path.resolve(__dirname, '..', '..', 'de-ai-novel-skill')
const DETECT_SCRIPT = path.join(DE_AI_SKILL_DIR, 'tools', 'detect.js')
const HUMANIZE_SCRIPT = path.join(DE_AI_SKILL_DIR, 'tools', 'humanize.js')

// ========== 检测函数 ==========

function detectAI(filePath) {
  try {
    const output = execSync(`node "${DETECT_SCRIPT}" "${filePath}" --format=json --lang=zh`, {
      encoding: 'utf-8',
      timeout: 30000,
    })
    return JSON.parse(output)
  } catch (e) {
    // 如果 JSON 解析失败，尝试从文本输出中提取分数
    try {
      const textOutput = execSync(`node "${DETECT_SCRIPT}" "${filePath}" --lang=zh`, {
        encoding: 'utf-8',
        timeout: 30000,
      })
      const scoreMatch = textOutput.match(/(\d+)\/100/)
      return {
        score: scoreMatch ? parseInt(scoreMatch[1]) : 100,
        scoreLabel: '未知',
        bannedWordCount: 0,
        details: [],
      }
    } catch (e2) {
      error(`检测失败: ${e2.message}`)
      return null
    }
  }
}

function getHumanizeAdvice(filePath) {
  try {
    const output = execSync(`node "${HUMANIZE_SCRIPT}" "${filePath}"`, {
      encoding: 'utf-8',
      timeout: 30000,
    })
    return output
  } catch (e) {
    warn(`获取改写建议失败: ${e.message}`)
    return ''
  }
}

// ========== 自动修复函数 ==========

function fixBannedWords(text) {
  const replacements = [
    // 情感类
    { find: /不禁/g, replace: '' },
    { find: /竟然/g, replace: '没想到' },
    { find: /五味杂陈/g, replace: '说不出什么滋味' },
    { find: /百感交集/g, replace: '鼻子酸了' },
    { find: /心中一紧/g, replace: '呼吸一滞' },
    { find: /不由得/g, replace: '' },
    { find: /不由自主/g, replace: '' },
    { find: /心头一震/g, replace: '手里的东西差点掉了' },
    { find: /若有所思/g, replace: '' },
    { find: /恍然大悟/g, replace: '' },
    { find: /心领神会/g, replace: '' },
    // 描写类
    { find: /目光深邃/g, replace: '目光锐利' },
    { find: /嘴角微微上扬/g, replace: '嘴角动了一下' },
    { find: /微微一笑/g, replace: '笑了一下' },
    { find: /不禁一颤/g, replace: '手指抖了一下' },
    { find: /气质不凡/g, replace: '' },
    { find: /眉头紧锁/g, replace: '揉了揉眉心' },
    { find: /眼中闪过一丝/g, replace: '' },
    { find: /沉默不语/g, replace: '没说话' },
    // 比喻类
    { find: /温润如玉/g, replace: '说话慢条斯理' },
    { find: /静水深流/g, replace: '' },
    { find: /春日暖阳/g, replace: '阳光晒在后背上' },
    { find: /刀削斧凿/g, replace: '棱角分明' },
    { find: /宛如/g, replace: '像' },
    { find: /犹如/g, replace: '像' },
    { find: /恰似/g, replace: '像' },
    { find: /好似/g, replace: '像' },
    // 连接类
    { find: /然而，/g, replace: '可' },
    { find: /值得注意的是，/g, replace: '' },
    { find: /与此同时，/g, replace: '' },
    { find: /不仅如此，/g, replace: '' },
    { find: /总而言之，/g, replace: '' },
  ]

  let result = text
  let count = 0
  for (const r of replacements) {
    const before = result
    result = result.replace(r.find, r.replace)
    if (result !== before) count++
  }
  return { text: result, count }
}

function fixSafeMetaphors(text) {
  const lines = text.split('\n')
  const fixed = []
  let count = 0

  for (const line of lines) {
    let l = line
    // 替换安全比喻模式
    const safePatterns = [
      { find: /目光.*像.*水/g, replace: '目光锐利得像刀子' },
      { find: /眼神.*像.*湖/g, replace: '眼神沉沉的，看不出什么' },
      { find: /声音.*像.*玉/g, replace: '声音低低的' },
      { find: /笑容.*像.*阳光/g, replace: '笑起来眼角有纹' },
      { find: /一池静水/g, replace: '' },
      { find: /春日里的一池静水/g, replace: '说不出什么' },
      { find: /薄霜/g, replace: '雾气' },
    ]

    for (const p of safePatterns) {
      const before = l
      l = l.replace(p.find, p.replace)
      if (l !== before) count++
    }
    fixed.push(l)
  }

  return { text: fixed.join('\n'), count }
}

function addIdleStrokes(text) {
  const idleStrokes = [
    '院子里的猫蹲在墙头，眯着眼睛打盹。',
    '巷子口传来一阵叫卖声，听不真切卖的是什么。',
    '窗外的鸟叫了两声，又停了。',
    '桌上的茶碗里浮着一片叶子，贴着碗沿不肯沉。',
    '远处传来更鼓声，一下，两下。',
    '空气里有股潮湿的霉味，混着旧木头的气息。',
    '她听见灶房那边传来刀剁砧板的声音，一下一下，节奏很稳。',
    '门槛上蹲着一只麻雀，歪着头看她，又飞走了。',
  ]

  const lines = text.split('\n')

  // 找到非开头非结尾的中间位置插入闲笔
  const insertPoints = []
  for (let i = 3; i < lines.length - 3; i++) {
    if (lines[i].trim().length === 0 && lines[i + 1] && lines[i + 1].trim().length > 0) {
      insertPoints.push(i)
    }
  }

  if (insertPoints.length === 0) return { text, count: 0 }

  // 在 2 个位置插入闲笔
  const shuffled = insertPoints.sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(2, shuffled.length))

  let result = lines
  let count = 0
  for (const idx of selected.sort((a, b) => a - b)) {
    const stroke = idleStrokes[count % idleStrokes.length]
    result.splice(idx + 1, 0, stroke)
    count++
  }

  return { text: result.join('\n'), count }
}

function addDirectTelling(text) {
  const tellingOptions = [
    '她恨他。',
    '这事儿说起来荒唐。',
    '她累了。',
    '她怕。',
    '说不清是什么滋味。',
    '她知道，这辈子不会再信任何人了。',
    '她不怕死。她怕的是死得不明不白。',
    '说真的，她不后悔。',
    '她不信命。',
  ]

  // 检查是否已有直接讲述
  const hasTelling = /她恨|她爱|她怕|她怒|她很|说起来|荒唐|她累了|她不信|她不怕|说真的/.test(text)
  if (hasTelling) return { text, count: 0 }

  const lines = text.split('\n')
  // 在文章中段插入
  const mid = Math.floor(lines.length / 2)
  const telling = tellingOptions[Math.floor(Math.random() * tellingOptions.length)]
  lines.splice(mid, 0, telling)

  return { text: lines.join('\n'), count: 1 }
}

function addTextureDescriptions(text) {
  const textureOptions = [
    '布料粗糙的质感蹭着掌心。',
    '木头桌面上有一道浅浅的划痕。',
    '指尖碰到瓷碗边沿，冰凉，光滑。',
    '纸张粗糙，墨迹洇开，像水渍。',
    '铜扣冰凉，指尖碰到的时候缩了一下。',
    '丝线细密的凹凸在指腹下。',
  ]

  const lines = text.split('\n')
  // 找到描写段落，在其中插入质感描写
  const insertPoints = []
  for (let i = 2; i < lines.length - 2; i++) {
    const l = lines[i]
    if (/摸|碰|触|拿|攥|握|端|拿|拽|扯/.test(l) && l.length > 15) {
      insertPoints.push(i)
    }
  }

  if (insertPoints.length === 0) return { text, count: 0 }

  const idx = insertPoints[0]
  const texture = textureOptions[Math.floor(Math.random() * textureOptions.length)]
  lines.splice(idx + 1, 0, texture)

  return { text: lines.join('\n'), count: 1 }
}

function fixIndirectEmotionWords(text) {
  const fixes = [
    { find: /她心中五味杂陈/g, replace: '她攥了攥拳头，又松开' },
    { find: /她不由得/g, replace: '' },
    { find: /她不禁/g, replace: '' },
    { find: /心中一紧/g, replace: '呼吸一滞' },
    { find: /心头一震/g, replace: '手里的东西差点掉了' },
    { find: /百感交集/g, replace: '鼻子酸了' },
    { find: /五味杂陈/g, replace: '说不出什么滋味' },
    { find: /若有所思/g, replace: '' },
    { find: /恍然大悟/g, replace: '' },
  ]

  let result = text
  let count = 0
  for (const r of fixes) {
    const before = result
    result = result.replace(r.find, r.replace)
    if (result !== before) count++
  }
  return { text: result, count }
}

function fixTimeMarkers(text) {
  const timeFixes = [
    { find: /三天后/g, replace: '过了几天' },
    { find: /七天后/g, replace: '过了些日子' },
    { find: /一个月后/g, replace: '入秋的时候' },
    { find: /一年后/g, replace: '第二年' },
    { find: /三年后/g, replace: '几年后' },
    { find: /五年后/g, replace: '几年后' },
    { find: /十年后/g, replace: '多年后' },
    { find: /第二天/g, replace: '次日' },
    { find: /第三天/g, replace: '又过了一日' },
  ]

  let result = text
  let count = 0
  for (const r of timeFixes) {
    const before = result
    result = result.replace(r.find, r.replace)
    if (result !== before) count++
  }
  return { text: result, count }
}

function fixEmotionBeats(text) {
  const emotionFixes = [
    { find: /先是.*然后.*接着/g, replace: (match) => match.replace(/先是|然后|接着/g, '') },
    { find: /一开始/g, replace: '那会儿' },
    { find: /起初.*后来/g, replace: (match) => match.replace(/起初|后来/g, '') },
    { find: /越来越/g, replace: '' },
    { find: /渐渐/g, replace: '' },
    { find: /一点一点/g, replace: '' },
  ]

  let result = text
  let count = 0
  for (const r of emotionFixes) {
    const before = result
    if (typeof r.replace === 'function') {
      result = result.replace(r.find, r.replace)
    } else {
      result = result.replace(r.find, r.replace)
    }
    if (result !== before) count++
  }
  return { text: result, count }
}

function fixFeelingExpressions(text) {
  const feelingFixes = [
    { find: /感到紧张/g, replace: '手指攥紧了衣角' },
    { find: /感到害怕/g, replace: '后背一阵发凉' },
    { find: /感到高兴/g, replace: '嘴角怎么也压不下去' },
    { find: /感到悲伤/g, replace: '鼻子一酸' },
    { find: /感到愤怒/g, replace: '牙关咬得咯咯响' },
    { find: /感到惊讶/g, replace: '嘴张了半天合不上' },
    { find: /感到困惑/g, replace: '眉头拧成了一个疙瘩' },
    { find: /感到/g, replace: '' },
    { find: /觉得/g, replace: '' },
  ]

  let result = text
  let count = 0
  for (const r of feelingFixes) {
    const before = result
    result = result.replace(r.find, r.replace)
    if (result !== before) count++
  }
  return { text: result, count }
}

// ========== 综合修复 ==========

function applyAllFixes(text) {
  let result = text
  const fixLog = []

  // 1. 禁词替换
  const banned = fixBannedWords(result)
  result = banned.text
  if (banned.count > 0) fixLog.push(`禁词替换: ${banned.count} 处`)

  // 2. 安全比喻替换
  const metaphors = fixSafeMetaphors(result)
  result = metaphors.text
  if (metaphors.count > 0) fixLog.push(`安全比喻: ${metaphors.count} 处`)

  // 3. 情感表达替换
  const feelings = fixFeelingExpressions(result)
  result = feelings.text
  if (feelings.count > 0) fixLog.push(`情感表达: ${feelings.count} 处`)

  // 4. 时间标记修正
  const time = fixTimeMarkers(result)
  result = time.text
  if (time.count > 0) fixLog.push(`时间标记: ${time.count} 处`)

  // 5. 情感节拍打乱
  const beats = fixEmotionBeats(result)
  result = beats.text
  if (beats.count > 0) fixLog.push(`情感节拍: ${beats.count} 处`)

  // 6. 添加闲笔
  const idle = addIdleStrokes(result)
  result = idle.text
  if (idle.count > 0) fixLog.push(`添加闲笔: ${idle.count} 处`)

  // 7. 添加直接讲述
  const telling = addDirectTelling(result)
  result = telling.text
  if (telling.count > 0) fixLog.push(`添加直接讲述: ${telling.count} 处`)

  // 8. 添加质感描写
  const texture = addTextureDescriptions(result)
  result = texture.text
  if (texture.count > 0) fixLog.push(`添加质感描写: ${texture.count} 处`)

  // 9. 修正间接情感词
  const indirectEmotion = fixIndirectEmotionWords(result)
  result = indirectEmotion.text
  if (indirectEmotion.count > 0) fixLog.push(`修正间接情感词: ${indirectEmotion.count} 处`)

  return { text: result, fixLog }
}

// ========== 参数解析 ==========

function parseArgs(argv) {
  const args = argv.slice(2)
  const result = {
    file: null,
    target: 10,
    maxIter: 10,
    output: null,
    dryRun: false,
  }

  for (const arg of args) {
    if (arg.startsWith('--target=')) result.target = parseInt(arg.split('=')[1])
    else if (arg.startsWith('--max-iter=')) result.maxIter = parseInt(arg.split('=')[1])
    else if (arg.startsWith('--output=')) result.output = arg.split('=')[1]
    else if (arg === '--dry-run') result.dryRun = true
    else if (!arg.startsWith('--')) result.file = arg
  }

  return result
}

// ========== 主函数 ==========

function main() {
  const args = parseArgs(process.argv)

  if (!args.file) {
    error('请指定小说文件路径')
    console.log('')
    console.log('用法:')
    console.log('  node selfcheck.js <小说文件.txt>                    # 自动修改直到 AI 感 <10')
    console.log('  node selfcheck.js <小说文件.txt> --target=15        # 指定目标分数')
    console.log('  node selfcheck.js <小说文件.txt> --max-iter=10      # 最大迭代次数')
    console.log('  node selfcheck.js <小说文件.txt> --output=out.txt   # 指定输出文件')
    console.log('  node selfcheck.js <小说文件.txt> --dry-run          # 只检测不修改')
    process.exit(1)
  }

  const filePath = path.resolve(args.file)
  if (!fs.existsSync(filePath)) {
    error(`文件不存在: ${filePath}`)
    process.exit(1)
  }

  // 检查 de-ai-novel-skill 是否存在
  if (!fs.existsSync(DETECT_SCRIPT)) {
    error(`找不到 de-ai-novel-skill 的 detect.js`)
    info(`预期路径: ${DETECT_SCRIPT}`)
    info(`请确保 de-ai-novel-skill 在 ${DE_AI_SKILL_DIR} 目录下`)
    process.exit(1)
  }

  console.log(`\n${colors.bold}╔══════════════════════════════════════╗${colors.reset}`)
  console.log(`${colors.bold}║    古风言情自检修改工具              ║${colors.reset}`)
  console.log(`${colors.bold}╚══════════════════════════════════════╝${colors.reset}`)
  console.log('')
  console.log(`  文件: ${filePath}`)
  console.log(`  目标: AI 感 <${args.target}/100`)
  console.log(`  最大迭代: ${args.maxIter} 次`)
  console.log('')

  // 初始检测
  step('初始检测')
  let currentResult = detectAI(filePath)
  if (!currentResult) {
    error('初始检测失败')
    process.exit(1)
  }

  console.log(`  AI 味评分: ${colors.bold}${currentResult.score}/100${colors.reset}（${currentResult.scoreLabel}）`)
  console.log(`  禁词数: ${currentResult.bannedWordCount}`)

  if (currentResult.score < args.target) {
    log(`AI 感 ${currentResult.score}/100 已低于目标 ${args.target}/100，无需修改！`)
    return
  }

  if (args.dryRun) {
    warn('dry-run 模式，不执行修改')
    info('获取改写建议...')
    const advice = getHumanizeAdvice(filePath)
    console.log(advice)
    return
  }

  // 迭代修改
  let text = fs.readFileSync(filePath, 'utf-8')
  let iteration = 0

  while (currentResult.score >= args.target && iteration < args.maxIter) {
    iteration++
    step(`第 ${iteration} 轮修改`)

    // 应用所有修复
    const fixed = applyAllFixes(text)
    text = fixed.text

    // 显示修改日志
    for (const logEntry of fixed.fixLog) {
      console.log(`  ${colors.green}•${colors.reset} ${logEntry}`)
    }

    // 写入临时文件检测
    const tempFile = filePath + '.tmp'
    fs.writeFileSync(tempFile, text, 'utf-8')

    // 重新检测
    currentResult = detectAI(tempFile)
    if (!currentResult) {
      warn('检测失败，停止迭代')
      break
    }

    console.log(`  AI 味评分: ${colors.bold}${currentResult.score}/100${colors.reset}（${currentResult.scoreLabel}）`)

    // 清理临时文件
    try { fs.unlinkSync(tempFile) } catch (e) { /* ignore */ }

    if (currentResult.score < args.target) {
      break
    }

    // 如果分数没有下降，说明自动修复已到极限
    if (iteration > 1 && currentResult.score >= args.target) {
      warn(`自动修复已到极限，当前分数 ${currentResult.score}/100`)
      info('建议人工修改以下问题：')
      // 获取改写建议
      const tempFile2 = filePath + '.tmp2'
      fs.writeFileSync(tempFile2, text, 'utf-8')
      const advice = getHumanizeAdvice(tempFile2)
      // 只显示建议部分
      const adviceLines = advice.split('\n').filter(l => l.includes('→') || l.includes('建议'))
      for (const line of adviceLines.slice(0, 10)) {
        console.log(`    ${colors.dim}${line.trim()}${colors.reset}`)
      }
      try { fs.unlinkSync(tempFile2) } catch (e) { /* ignore */ }
      break
    }
  }

  // 输出结果
  console.log('')
  console.log(`${colors.bold}${'═'.repeat(40)}${colors.reset}`)

  if (currentResult.score < args.target) {
    log(`修改完成！AI 感 ${currentResult.score}/100 < ${args.target}/100 ✓`)
  } else {
    warn(`迭代 ${iteration} 次后，AI 感仍为 ${currentResult.score}/100`)
    info('建议人工进一步修改')
  }

  // 写入输出文件
  const outputFile = args.output || filePath.replace(/(\.\w+)$/, '.humanized$1')
  fs.writeFileSync(outputFile, text, 'utf-8')
  console.log('')
  log(`输出文件: ${outputFile}`)
  console.log('')
}

main()
