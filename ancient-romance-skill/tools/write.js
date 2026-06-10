#!/usr/bin/env node

/**
 * 古风言情写作提词生成工具
 *
 * 用途：根据题材、人物原型、场景生成写作提词，可直接复制到 AI 对话中
 *
 * 用法：
 *   node write.js --genre=rebirth                        # 生成重生题材的第一章提词
 *   node write.js --genre=palace --chapter=1             # 生成宫斗题材的第一章提词
 *   node write.js --scene=waking --setting=boudoir       # 生成特定场景的提词
 *   node write.js --list-genres                          # 列出所有题材
 *   node write.js --list-scenes                          # 列出所有场景
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
function info(msg) { console.log(`${colors.blue}ℹ${colors.reset} ${msg}`) }

// ========== 加载 spec 数据 ==========

const specDir = path.join(__dirname, '..', 'spec')

function loadSpec(name) {
  return JSON.parse(fs.readFileSync(path.join(specDir, name), 'utf-8'))
}

// ========== 提词模板 ==========

const GLOBAL_CONSTRAINTS = `【全局约束 — 必须遵守】
1. 禁用词：不禁、竟然、五味杂陈、百感交集、心中一紧、不由得、不由自主、
   目光深邃、嘴角微微上扬、微微一笑、温润如玉、静水深流、春日暖阳、
   倾国倾城、沉鱼落雁、闭月羞花、国色天香、风华绝代、仿佛（每段最多1个）
2. 比喻必须来自角色的生活经验，不要用通用意象
3. 每段至少 1 个感官细节（视/听/嗅/味/触）
4. 段落长度要有变化——不要每段都差不多长
5. 对白要有潜台词——角色说的话≠角色想说的话
6. 情感不要直说——用身体反应展示
7. 每章至少 2 个闲笔（跟情节无关的细节）
8. 每章至少 1 处直接讲述（"她恨他"、"这事儿荒唐"）
9. 结尾不要总结——留悬念
10. 时间标记不要太精确——"过了几天"比"三天后"好`

function generateChapterPrompts(genre, femaleType, maleType) {
  const plots = loadSpec('plot-templates.json')
  const characters = loadSpec('character-archetypes.json')
  const scenes = loadSpec('scene-templates.json')

  const genreData = plots.genres[genre]
  if (!genreData) {
    console.error(`未知题材: ${genre}`)
    console.log(`可用题材: ${Object.keys(plots.genres).join(', ')}`)
    process.exit(1)
  }

  const femaleData = characters.femaleLeads[femaleType] || characters.femaleLeads.resilient
  const maleData = characters.maleLeads[maleType] || characters.maleLeads.cold

  const prompts = []

  // Step 1: 开头钩子
  prompts.push({
    step: 'Step 1: 开头钩子（3-5 句）',
    prompt: `请用以下约束写一个古风言情小说的开头（3-5 句）：

【约束】
1. 第一句话必须是感官刺激或动作，不要环境描写
2. 不要用"她睁开眼睛"、"这是一个…"开头
3. 不要用任何 AI 高频词（不禁、竟然、五味杂陈、心中一紧）
4. 必须在前 3 句内建立悬念或冲突
5. 感官描写至少涉及 2 种（视/听/嗅/味/触）
6. 比喻必须来自角色的生活经验，不要通用意象

【题材】${genreData.label}
【核心冲突】${genreData.coreConflict}
【主角】${femaleData.label}型女主
【参考风格】
- "沈昭宁是被疼醒的。不是梦里的疼，是实打实的、后脑勺磕在青砖地上磕出来的钝痛。"
- "刀架在脖子上的时候，她还在想晚饭吃什么。"
- "院子里的桂花开了三天，她才闻到。"

${GLOBAL_CONSTRAINTS}

请生成：`
  })

  // Step 2: 环境与身份确认
  prompts.push({
    step: 'Step 2: 环境与身份确认（10-15 句）',
    prompt: `继续上文，写主角确认当前处境的段落（10-15 句）：

【约束】
1. 不要用"她意识到自己重生了"——要通过感官细节让读者自己判断
2. 环境描写要服务于情绪，不要为写而写
3. 至少加入 1 个闲笔（跟情节无关但增加真实感的细节）
4. 身体感受要具体——不要"浑身酸痛"
5. 铜镜是模糊的，不要写"铜镜中映出倾国倾城的容颜"
6. 时间/空间要有具体锚点（几时了、初几、哪个院子）
7. 用感官触发回忆，不要线性叙述

${GLOBAL_CONSTRAINTS}

请生成：`
  })

  // Step 3: 前世碎片回忆
  prompts.push({
    step: 'Step 3: 前世碎片回忆（5-8 句）',
    prompt: `继续上文，写主角回忆前世的段落（5-8 句）：

【约束】
1. 不要线性叙述前世——用感官触发碎片记忆
2. 不要一次回忆完——只回忆当前场景相关的片段
3. 回忆要有碎片感——不完整的画面、断裂的声音、模糊的气味
4. 回忆中混入当下的感官刺激（窗外的声音、空气的味道）
5. 不要用"她想起了…"开头——用感官触发
6. 回忆的情感要克制——不要大段抒情
7. 可以在回忆中混入当下的感官刺激

${GLOBAL_CONSTRAINTS}

请生成：`
  })

  // Step 4: 第一个关键人物出场
  prompts.push({
    step: 'Step 4: 第一个关键人物出场（8-12 句）',
    prompt: `继续上文，写第一个关键人物出场的段落（8-12 句）：

【约束】
1. 人物出场不要用外貌描写开头——用动作或声音
2. 人物的说话方式必须独特——遮住名字能分辨出是谁
3. 对白要有潜台词——角色说的话≠角色想说的话
4. 对白中加入打断、犹豫、未说完的句子
5. 用动作替代"XX说"——她把茶碗放下，"让她进来。"
6. 不要用"不禁"、"竟然"、"心中一紧"
7. 人物出场要有情绪张力——主角看到这个人时的身体反应

${GLOBAL_CONSTRAINTS}

请生成：`
  })

  // Step 5: 布局/冲突展开
  prompts.push({
    step: 'Step 5: 布局/冲突展开（10-15 句）',
    prompt: `继续上文，写主角开始行动/冲突展开的段落（10-15 句）：

【约束】
1. 主角的行动要有逻辑——为什么这么做，基于什么信息
2. 不要让主角一上来就全知全能——要试探、要犯错
3. 行动要有代价——免费的行动没有张力
4. 穿插环境描写——但要服务于情绪
5. 节奏要有变化——紧张处短句，舒缓处长句
6. 加入至少 1 个闲笔
7. 加入至少 1 处直接讲述

${GLOBAL_CONSTRAINTS}

请生成：`
  })

  // Step 6: 章末悬念
  prompts.push({
    step: 'Step 6: 章末悬念（3-5 句）',
    prompt: `继续上文，写本章结尾（3-5 句）：

【约束】
1. 不要总结本章——要留未完成的事
2. 结尾要有新的问题或新的威胁
3. 最后一句话要有画面感——不要抽象
4. 不要用"新的一天开始了"、"她决定好好规划未来"结尾
5. 可以用物件、声音、动作结尾

【好的结尾示例】
- "三天后，帖子来了。"
- "她把信折好，塞进袖子里。门外的脚步声越来越近。"
- "春芜走了以后，她才发现手心里全是汗。"
- "她盯着这四个字，把它们一笔一划又描了一遍。墨透过纸背，洇到桌面上。"

${GLOBAL_CONSTRAINTS}

请生成：`
  })

  return prompts
}

function generateScenePrompt(sceneType, setting) {
  const scenes = loadSpec('scene-templates.json')
  const sceneData = scenes.scenes[sceneType]
  if (!sceneData) {
    console.error(`未知场景: ${sceneType}`)
    console.log(`可用场景: ${Object.keys(scenes.scenes).join(', ')}`)
    process.exit(1)
  }

  return {
    step: `场景提词: ${sceneData.label}`,
    prompt: `请写一个古风言情的${sceneData.label}场景（8-15 句）：

【约束】
1. 必须涉及以下感官：${sceneData.sensoryChecklist.join('、')}
2. 常见错误要避免：${sceneData.commonMistakes.join('；')}
3. 正确的开头方式：${sceneData.goodOpening}
4. 不要用任何 AI 高频词
5. 比喻必须来自角色经验
6. 加入至少 1 个闲笔
7. 情感不要直说——用身体反应展示

【场景设定】${setting || '根据题材自定'}

${GLOBAL_CONSTRAINTS}

请生成：`
  }
}

// ========== 参数解析 ==========

function parseArgs(argv) {
  const args = argv.slice(2)
  const result = {
    genre: null,
    chapter: 1,
    female: 'resilient',
    male: 'cold',
    scene: null,
    setting: null,
    listGenres: false,
    listScenes: false,
  }

  for (const arg of args) {
    if (arg.startsWith('--genre=')) result.genre = arg.split('=')[1]
    else if (arg.startsWith('--chapter=')) result.chapter = parseInt(arg.split('=')[1])
    else if (arg.startsWith('--female=')) result.female = arg.split('=')[1]
    else if (arg.startsWith('--male=')) result.male = arg.split('=')[1]
    else if (arg.startsWith('--scene=')) result.scene = arg.split('=')[1]
    else if (arg.startsWith('--setting=')) result.setting = arg.split('=')[1]
    else if (arg === '--list-genres') result.listGenres = true
    else if (arg === '--list-scenes') result.listScenes = true
  }

  return result
}

// ========== 主函数 ==========

function main() {
  const args = parseArgs(process.argv)

  // 列出题材
  if (args.listGenres) {
    const plots = loadSpec('plot-templates.json')
    console.log(`\n${colors.bold}可用题材：${colors.reset}\n`)
    for (const [key, data] of Object.entries(plots.genres)) {
      console.log(`  ${colors.cyan}${key}${colors.reset} — ${data.label}`)
      console.log(`    核心冲突：${data.coreConflict}`)
      console.log(`    代表作：${data.examples.join('、')}`)
      console.log('')
    }
    return
  }

  // 列出场景
  if (args.listScenes) {
    const scenes = loadSpec('scene-templates.json')
    console.log(`\n${colors.bold}可用场景：${colors.reset}\n`)
    for (const [key, data] of Object.entries(scenes.scenes)) {
      console.log(`  ${colors.cyan}${key}${colors.reset} — ${data.label}`)
      console.log(`    感官清单：${data.sensoryChecklist.slice(0, 3).join('、')}…`)
      console.log('')
    }
    return
  }

  // 生成场景提词
  if (args.scene) {
    const result = generateScenePrompt(args.scene, args.setting)
    console.log(`\n${colors.bold}${'═'.repeat(60)}${colors.reset}`)
    console.log(`${colors.cyan}${result.step}${colors.reset}`)
    console.log(`${colors.bold}${'═'.repeat(60)}${colors.reset}\n`)
    console.log(result.prompt)
    console.log(`\n${colors.dim}${'─'.repeat(60)}${colors.reset}\n`)
    return
  }

  // 生成章节提词
  if (!args.genre) {
    console.error('请指定题材，例如：node write.js --genre=rebirth')
    console.log('使用 --list-genres 查看所有可用题材')
    process.exit(1)
  }

  const prompts = generateChapterPrompts(args.genre, args.female, args.male)

  console.log(`\n${colors.bold}古风言情写作提词 — ${args.genre} 题材${colors.reset}`)
  console.log(`${colors.dim}第一章，共 ${prompts.length} 步${colors.reset}\n`)

  for (const p of prompts) {
    console.log(`${colors.bold}${'═'.repeat(60)}${colors.reset}`)
    console.log(`${colors.cyan}${p.step}${colors.reset}`)
    console.log(`${colors.bold}${'═'.repeat(60)}${colors.reset}\n`)
    console.log(p.prompt)
    console.log(`\n${colors.dim}${'─'.repeat(60)}${colors.reset}\n`)
  }

  console.log(`${colors.green}✔ 提词生成完毕，共 ${prompts.length} 步${colors.reset}`)
  console.log(`${colors.dim}将以上提词依次复制到 AI 对话中，每步生成后检查再进入下一步${colors.reset}`)
  console.log(`${colors.dim}生成完成后用 selfcheck.js 自检：node tools/selfcheck.js <文件.txt>${colors.reset}\n`)
}

main()
