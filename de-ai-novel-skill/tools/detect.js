#!/usr/bin/env node

/**
 * AI 味检测工具
 *
 * 用途：扫描小说文本中的 AI 高频词，输出 AI 味评分和具体问题位置
 *
 * 用法：node detect.js <小说文件.txt> [--lang=zh|en|both] [--format=text|json]
 */

const fs = require('fs')
const path = require('path')

// ========== 颜色输出 ==========

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
}

function log(msg) { console.log(`${colors.green}✔${colors.reset} ${msg}`) }
function warn(msg) { console.log(`${colors.yellow}⚠${colors.reset} ${msg}`) }
function error(msg) { console.log(`${colors.red}✖${colors.reset} ${msg}`) }
function info(msg) { console.log(`${colors.blue}ℹ${colors.reset} ${msg}`) }

// ========== 禁词定义 ==========

const BANNED_WORDS_ZH = {
  emotion: {
    label: '情感类',
    severity: 5,
    words: [
      { word: '不禁', suggestion: '删除，直接写动作' },
      { word: '竟然', suggestion: '用具体反应替代' },
      { word: '五味杂陈', suggestion: '写出具体感受' },
      { word: '百感交集', suggestion: '写出具体感受' },
      { word: '心中一紧', suggestion: '改为身体反应' },
      { word: '不由得', suggestion: '改为主动动作' },
      { word: '不由自主', suggestion: '改为主动动作' },
      { word: '心头一震', suggestion: '改为具体反应' },
      { word: '暗自', suggestion: '通过行为展示内心' },
      { word: '强忍', suggestion: '写出具体怎么忍的' },
      { word: '仿佛', suggestion: '减少使用，改为直接描写' },
      { word: '若有所思', suggestion: '写出具体在想什么' },
      { word: '心领神会', suggestion: '用动作展示默契' },
      { word: '恍然大悟', suggestion: '写出具体想通了什么' },
      { word: '若有所悟', suggestion: '写出具体想通了什么' },
    ],
  },
  description: {
    label: '描写类',
    severity: 3,
    words: [
      { word: '目光深邃', suggestion: '写出目光里具体有什么' },
      { word: '嘴角微微上扬', suggestion: '写出笑的质感' },
      { word: '微微一笑', suggestion: '写出笑的质感' },
      { word: '不禁一颤', suggestion: '写出具体身体反应' },
      { word: '气质不凡', suggestion: '通过行为/衣着展示' },
      { word: '眉头紧锁', suggestion: '换用其他描写方式' },
      { word: '眼中闪过一丝', suggestion: '直接写眼神' },
      { word: '语重心长', suggestion: '通过说话方式展示' },
      { word: '意味深长', suggestion: '写出具体暗示了什么' },
      { word: '沉默不语', suggestion: '用具体动作替代沉默' },
    ],
  },
  transition: {
    label: '连接类',
    severity: 2,
    words: [
      { word: '值得注意的是', suggestion: '删除，直接说' },
      { word: '与此同时', suggestion: '用场景切换替代' },
      { word: '不仅如此', suggestion: '删除' },
      { word: '然而', suggestion: '换用"可""只是""倒是"' },
      { word: '因此', suggestion: '用行动展示因果' },
      { word: '总而言之', suggestion: '删除' },
      { word: '显而易见', suggestion: '删除' },
      { word: '不言而喻', suggestion: '删除' },
      { word: '事实上', suggestion: '删除' },
      { word: '毫无疑问', suggestion: '删除' },
      { word: '众所周知', suggestion: '删除' },
      { word: '更为重要的是', suggestion: '删除' },
      { word: '进一步来说', suggestion: '删除' },
      { word: '需要指出的是', suggestion: '删除' },
      { word: '不可否认', suggestion: '删除' },
      { word: '诚然', suggestion: '删除' },
      { word: '首先', suggestion: '删除序数词，打散重组' },
      { word: '其次', suggestion: '删除序数词，打散重组' },
      { word: '最后', suggestion: '删除序数词，打散重组' },
    ],
  },
  metaphor: {
    label: '比喻类',
    severity: 4,
    words: [
      { word: '温润如玉', suggestion: 'AI 最爱的男性气质标签，用角色经验替代' },
      { word: '静水深流', suggestion: 'AI 深度人物标配，写出具体行为特征' },
      { word: '春日暖阳', suggestion: 'AI 温暖万能意象，用具体感官替代' },
      { word: '刀削斧凿', suggestion: 'AI 男性外貌模板，写出具体特征' },
      { word: '深不见底', suggestion: 'AI 神秘标签，写出具体行为' },
      { word: '宛如', suggestion: 'AI 偏好的文言比喻词，换用"像""活像"' },
      { word: '犹如', suggestion: '同上' },
      { word: '恰似', suggestion: '同上' },
      { word: '好似', suggestion: '同上' },
      { word: '一池静水', suggestion: 'AI 经典意象，用角色经验替代' },
      { word: '薄霜', suggestion: 'AI 偏好的冷感意象，检查是否过于安全' },
      { word: '春日里', suggestion: 'AI 的时间意象模板' },
    ],
  },
}

const BANNED_WORDS_EN = {
  overused: {
    label: 'Overused Words',
    severity: 3,
    words: [
      { word: 'delve', suggestion: 'dig, go deep, explore' },
      { word: 'navigate', suggestion: 'go through, deal with' },
      { word: 'harness', suggestion: 'use, tap into' },
      { word: 'embark', suggestion: 'start, begin' },
      { word: 'foster', suggestion: 'build, grow' },
      { word: 'multifaceted', suggestion: 'complex, complicated' },
      { word: 'intricate', suggestion: 'detailed, complex' },
      { word: 'pivotal', suggestion: 'key, crucial' },
      { word: 'robust', suggestion: 'strong, solid' },
      { word: 'nuanced', suggestion: 'subtle, complicated' },
      { word: 'tapestry', suggestion: 'mix, blend' },
      { word: 'landscape', suggestion: 'field, area' },
      { word: 'realm', suggestion: 'world, domain' },
      { word: 'testament', suggestion: 'proof, sign' },
      { word: "It's worth noting", suggestion: '删除，直接说' },
      { word: 'In today\'s world', suggestion: '删除' },
      { word: 'Furthermore', suggestion: 'and, also, plus' },
      { word: 'Moreover', suggestion: '同上' },
      { word: 'In conclusion', suggestion: '删除' },
      { word: 'To sum up', suggestion: '删除' },
    ],
  },
}

// ========== 检测逻辑 ==========

function detectChinese(text) {
  const results = []
  const lines = text.split('\n')

  for (const [category, data] of Object.entries(BANNED_WORDS_ZH)) {
    for (const entry of data.words) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        let idx = 0
        while ((idx = line.indexOf(entry.word, idx)) !== -1) {
          results.push({
            line: i + 1,
            column: idx + 1,
            word: entry.word,
            category: data.label,
            severity: data.severity,
            suggestion: entry.suggestion,
            context: line.trim().substring(Math.max(0, idx - 10), idx + entry.word.length + 10),
          })
          idx += entry.word.length
        }
      }
    }
  }

  return results
}

function detectEnglish(text) {
  const results = []
  const lines = text.split('\n')

  for (const [category, data] of Object.entries(BANNED_WORDS_EN)) {
    for (const entry of data.words) {
      const regex = new RegExp(`\\b${entry.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        let match
        while ((match = regex.exec(line)) !== null) {
          results.push({
            line: i + 1,
            column: match.index + 1,
            word: match[0],
            category: data.label,
            severity: data.severity,
            suggestion: entry.suggestion,
            context: line.trim().substring(Math.max(0, match.index - 15), match.index + match[0].length + 15),
          })
        }
      }
    }
  }

  return results
}

function calculateScore(results, totalLines, deepChecks) {
  let score = 0

  // 每个禁词扣分（按严重程度）
  for (const r of results) {
    score += r.severity
  }

  // 密度惩罚（每100行的禁词数）
  const density = (results.length / Math.max(totalLines, 1)) * 100
  if (density > 5) score += 10
  if (density > 10) score += 20

  // 深层结构扣分（v2 新增）
  if (deepChecks) {
    const deepFails = deepChecks.filter(c => !c.pass && c.threshold !== '人工检查' && c.threshold !== '有更好')
    for (const fail of deepFails) {
      // 深层结构问题权重更高
      if (fail.id >= 101 && fail.id <= 103) score += 8  // 比喻安全区
      else if (fail.id === 104) score += 5  // 信息密度
      else if (fail.id === 105) score += 4  // 闲笔
      else if (fail.id === 106) score += 6  // Show+Tell 平衡
      else if (fail.id === 108) score += 5  // 情感节拍
      else if (fail.id === 117) score += 4  // 时间标记
      else if (fail.id === 120) score += 3  // 整体评估
      else score += 2
    }
  }

  // 上限100
  return Math.min(100, Math.max(0, score))
}

// ========== 评分标签 ==========

function getScoreLabel(score) {
  if (score <= 15) return { label: '人味十足', color: colors.green }
  if (score <= 30) return { label: '轻微机器感', color: colors.yellow }
  if (score <= 50) return { label: '中等 AI 味', color: colors.yellow }
  if (score <= 75) return { label: '明显 AI 味', color: colors.red }
  return { label: '纯机器输出', color: colors.red }
}

// ========== 辅助函数 ==========

function regexHits(lines, regex) {
  const hits = []
  for (let i = 0; i < lines.length; i++) {
    let m; while ((m = regex.exec(lines[i])) !== null) hits.push({ line: i+1, word: m[0] })
    regex.lastIndex = 0
  }
  return hits
}

function den(count, totalChars) { return (count / Math.max(totalChars, 1)) * 1000 }

// ========== 100 项自检 ==========

function quickCheck100(text) {
  const lines = text.split('\n')
  const tc = text.replace(/\s/g, '').length
  const all = lines.join('')
  const checks = []
  const C = (id, name, pass, detail, threshold, items=[]) => checks.push({ id, name, pass, detail, threshold, items })

  // ═══ 语言层（20 项）═══

  // 1. AI 高频副词
  const h1 = regexHits(lines, /微微|淡淡|缓缓|轻轻|慢慢|悄悄|默默|静静/g)
  C(1,'AI 高频副词',den(h1.length,tc)<=2,`${h1.length}个`,'≤2/千字',h1.slice(0,5))

  // 2. 重复句首
  const h2=[]
  const fw=lines.map(l=>l.trim().substring(0,2)).filter(w=>w.length>0)
  for(let i=1;i<fw.length;i++) if(fw[i]===fw[i-1]&&fw[i].length>=1) h2.push({line:i+1,word:`连续以"${fw[i]}"开头`})
  C(2,'重复句首',h2.length===0,h2.length?`${h2.length}处`:'无重复','0处',h2.slice(0,5))

  // 3. 万能连接词
  const h3=regexHits(lines,/然而|因此|同时|此外|而且|并且|不过|可是|只是|但是|于是|所以|然后/g)
  C(3,'万能连接词',den(h3.length,tc)<=3,`${h3.length}个`,'≤3/千字',h3.slice(0,5))

  // 4. 抽象名词
  const h4=regexHits(lines,/问题|情况|事情|方面|过程|状态|因素|原因|结果|影响|作用|意义|价值/g)
  C(4,'抽象名词',den(h4.length,tc)<=5,`${h4.length}个`,'≤5/千字',h4.slice(0,5))

  // 5. 段落长度方差
  const pLen=lines.filter(l=>l.trim().length>0).map(l=>l.trim().length)
  const h5=[]
  for(let i=2;i<pLen.length;i++){const avg=(pLen[i]+pLen[i-1]+pLen[i-2])/3;const d=Math.abs(pLen[i]-avg)+Math.abs(pLen[i-1]-avg)+Math.abs(pLen[i-2]-avg);if(d<8&&avg>15)h5.push({line:i+1,detail:`${pLen[i-2]}/${pLen[i-1]}/${pLen[i]}`})}
  C(5,'段落长度方差',h5.length<=1,h5.length?`${h5.length}处过于均匀`:'长短错落','≤1处',h5.slice(0,3))

  // 6. 句式单调
  const h6=[]
  for(let i=2;i<lines.length;i++){const a=lines[i-2].trim(),b=lines[i-1].trim(),c=lines[i].trim();if(a.length>5&&b.length>5&&c.length>5&&/^[他她我你他们她们我们]/.test(a)&&/^[他她我你他们她们我们]/.test(b)&&/^[他她我你他们她们我们]/.test(c))h6.push({line:i+1,detail:'连续三句以人称代词开头'})}
  C(6,'句式单调',h6.length===0,h6.length?`${h6.length}处`:'句式有变化','0处',h6.slice(0,5))

  // 7. 重复用词
  const h7=[]
  for(let i=0;i<lines.length;i++){const w=lines[i].match(/[一-龥]{2,}/g)||[];const f={};w.forEach(x=>{f[x]=(f[x]||0)+1});for(const[k,v]of Object.entries(f))if(v>=3&&k.length>=2)h7.push({line:i+1,word:`"${k}"×${v}`})}
  C(7,'重复用词',h7.length===0,h7.length?`${h7.length}处`:'无重复','0处',h7.slice(0,5))

  // 8. 成语堆砌
  const idiomR=/五味杂陈|百感交集|若有所思|恍然大悟|心领神会|意味深长|语重心长|沉默不语|目光深邃|嘴角上扬|微微一笑|眉头紧锁|心中一紧|不由自主|莫名其妙|不知不觉|情不自禁|小心翼翼|全神贯注|聚精会神|目不转睛|心不在焉|漫不经心|无动于衷|视而不见|充耳不闻|置之不理|置若罔闻|熟视无睹|习以为常|司空见惯|理所当然|天经地义|无可厚非|不言而喻|显而易见|有目共睹|众所周知|不置可否|不以为然|嗤之以鼻|不屑一顾|泰然自若|处之泰然|安之若素|不动声色|面不改色|镇定自若|从容不迫|气定神闲|悠然自得|心旷神怡|赏心悦目|美不胜收|目不暇接|眼花缭乱|应接不暇|琳琅满目|丰富多彩|多姿多彩|千姿百态|千变万化|瞬息万变|变幻莫测|扑朔迷离|错综复杂|盘根错节|根深蒂固|积重难返|不可收拾/g
  const h8=[]
  for(let i=0;i<lines.length;i++){const m=lines[i].match(idiomR)||[];if(m.length>=2)h8.push({line:i+1,detail:`${m.length}个:${m.slice(0,3).join('、')}`})}
  C(8,'成语堆砌',h8.length===0,h8.length?`${h8.length}处`:'无堆砌','0处',h8.slice(0,3))

  // 9. "的"字密度
  const deN=(all.match(/的/g)||[]).length
  C(9,'"的"字密度',den(deN,tc)<=40,`${deN}个(${den(deN,tc).toFixed(1)}/千字)`,'≤40/千字')

  // 10. "了"字密度
  const leN=(all.match(/了/g)||[]).length
  C(10,'"了"字密度',den(leN,tc)<=25,`${leN}个(${den(leN,tc).toFixed(1)}/千字)`,'≤25/千字')

  // 11. 万能动词
  const h11=regexHits(lines,/做|干|弄|搞/g)
  C(11,'万能动词',den(h11.length,tc)<=3,`${h11.length}个`,'≤3/千字',h11.slice(0,5))

  // 12. 万能形容词
  const h12=regexHits(lines,/大|小|多|少|好|坏/g)
  C(12,'万能形容词',den(h12.length,tc)<=5,`${h12.length}个`,'≤5/千字',h12.slice(0,5))

  // 13. 否定堆砌
  const h13=regexHits(lines,/不|没有|不是|不会|不能|不要|不该|不必|未曾|未/g)
  C(13,'否定词密度',den(h13.length,tc)<=10,`${h13.length}个`,'≤10/千字')

  // 14. "是"字句密度
  const shiN=(all.match(/是/g)||[]).length
  C(14,'"是"字句密度',den(shiN,tc)<=10,`${shiN}个`,'≤10/千字')

  // 15. 被动句式
  const h15=regexHits(lines,/被|遭到|遭受|遭遇/g)
  C(15,'被动句式',den(h15.length,tc)<=3,`${h15.length}个`,'≤3/千字',h15.slice(0,3))

  // 16. 排比句式
  const h16=[]
  for(let i=2;i<lines.length;i++){const a=lines[i-2].trim(),b=lines[i-1].trim(),c=lines[i].trim();if(a.length>10&&b.length>10&&c.length>10&&Math.abs(a.length-b.length)<5&&Math.abs(b.length-c.length)<5)h16.push({line:i+1,detail:`${a.length}/${b.length}/${c.length}`})}
  C(16,'排比句式',h16.length<=1,h16.length?`${h16.length}处`:'无排比','≤1处',h16.slice(0,3))

  // 17. 万能量词
  const h17=regexHits(lines,/一个|一些|一点|几个|有些|有点/g)
  C(17,'万能量词',den(h17.length,tc)<=5,`${h17.length}个`,'≤5/千字',h17.slice(0,5))

  // 18. "会"字句密度
  const huiN=(all.match(/会/g)||[]).length
  C(18,'"会"字句密度',den(huiN,tc)<=5,`${huiN}个`,'≤5/千字')

  // 19. "能"字句密度
  const nengN=(all.match(/能|能够/g)||[]).length
  C(19,'"能"字句密度',den(nengN,tc)<=5,`${nengN}个`,'≤5/千字')

  // 20. "把"字句密度
  const baN=(all.match(/把/g)||[]).length
  C(20,'"把"字句密度',den(baN,tc)<=10,`${baN}个(${den(baN,tc).toFixed(1)}/千字)`,'≤10/千字')

  // ═══ 情绪层（12 项）═══

  // 21. 情绪直白词
  const h21=regexHits(lines,/感到|觉得|心中|心里|不禁|不由得|不由自主|暗自|强忍/g)
  C(21,'情绪直白词',den(h21.length,tc)<=1,`${h21.length}个`,'≤1/千字',h21.slice(0,5))

  // 22. 万能表情词
  const h22=regexHits(lines,/目光深邃|嘴角微微上扬|微微一笑|眉头紧锁|眼中闪过|沉默不语|若有所思|恍然大悟|心领神会|意味深长|语重心长|嘴角上扬|眉头一皱|眼神一暗|脸色一沉/g)
  C(22,'万能表情词',h22.length===0,`${h22.length}个`,'0个',h22.slice(0,5))

  // 23. 情绪标签词
  const h23=regexHits(lines,/高兴|难过|生气|害怕|紧张|担心|愤怒|伤心|开心|痛苦|焦虑|恐惧|悲伤|愉快|兴奋|沮丧|失望|绝望|无奈|愧疚|羞耻|嫉妒|羡慕|感激|感动|惊喜|意外|震惊|震撼/g)
  C(23,'情绪标签词',den(h23.length,tc)<=2,`${h23.length}个`,'≤2/千字',h23.slice(0,5))

  // 24. 情绪有动作支撑
  const h24=[]
  for(let i=0;i<lines.length;i++){const hasE=/感到|觉得|心中|心里|不禁/.test(lines[i]);const hasB=/手|脚|眼|脸|嘴|肩|头|背|胸|牙|拳|指|汗|泪|抖|颤|攥|咬|瞪|盯/.test(lines[i]);if(hasE&&!hasB)h24.push({line:i+1,detail:'有情绪词但无身体动作'})}
  C(24,'情绪有动作支撑',h24.length<=1,h24.length?`${h24.length}处缺动作`:'全部有动作','≤1处',h24.slice(0,3))

  // 25. 情绪有环境折射
  const h25=[]
  for(let i=0;i<lines.length;i++){if(/感到|觉得|心中|心里/.test(lines[i])&&/天|风|雨|阳光|月|灯|暗|冷|热|安静|喧闹/.test(lines[i]))h25.push({line:i+1,detail:'情绪有环境折射'})}
  C(25,'情绪有环境折射',true,h25.length?`${h25.length}处有折射`:'未检测到','有更好')

  // 26. 情绪有他人反应
  const h26=[]
  for(let i=0;i<lines.length;i++){if(/感到|觉得|心中|心里/.test(lines[i])&&/他|她|人|大家|众人|对方/.test(lines[i]))h26.push({line:i+1,detail:'情绪有他人反应'})}
  C(26,'情绪有他人反应',true,h26.length?`${h26.length}处有他人反应`:'未检测到','有更好')

  // 27. 情绪递进
  C(27,'情绪递进',true,'人工检查：情绪是否有从弱到强的变化','人工检查')

  // 28. 情绪反差
  C(28,'情绪反差',true,'人工检查：是否有先笑后哭等反差','人工检查')

  // 29. 情绪层次
  C(29,'情绪层次',true,'人工检查：是否有多重情绪交织','人工检查')

  // 30. 情绪铺垫
  C(30,'情绪铺垫',true,'人工检查：爆发前是否有铺垫','人工检查')

  // 31. 情绪留白
  const h31=regexHits(lines,/沉默|没说话|没有回答|没有开口|许久|很久|半晌|良久/g)
  C(31,'情绪留白',h31.length>=1,`${h31.length}处留白`,'≥1处',h31.slice(0,3))

  // 32. 情绪矛盾
  const h32=regexHits(lines,/想.*却|嘴上.*手上|笑着.*哭着|高兴.*难过|想说.*没说/g)
  C(32,'情绪矛盾',true,h32.length?`${h32.length}处矛盾`:'未检测到','有更好',h32.slice(0,3))

  // ═══ 对白层（12 项）═══

  // 33. 连续纯对白
  const h33=[];let cd=0
  for(let i=0;i<lines.length;i++){const isD=/^[""「]/.test(lines[i].trim());if(isD){cd++;if(cd>=3)h33.push({line:i+1,detail:`连续${cd}句`})}else cd=0}
  C(33,'连续纯对白',h33.length===0,h33.length?`${h33.length}处`:'合格','0处',h33.slice(0,5))

  // 34. 对白标签多样性
  const saidN=(all.match(/说[：:]/g)||[]).length
  const otherN=(all.match(/(?:道|问|答|喊|叫|骂|笑|哼|叹|嘟囔|嘀咕|低语|吼|嚷)[：:]/g)||[]).length
  C(34,'对白标签多样性',!(saidN>3&&otherN===0),saidN>3&&otherN===0?`${saidN}个"说"无其他`:'标签有变化','有变化')

  // 35. 对白潜台词
  const h35=[]
  for(let i=0;i<lines.length;i++){if(/[""「].*没事.*[""」]/.test(lines[i])){const ctx=(lines[i-1]||'')+(lines[i+1]||'');if(/叹|抖|攥|咬|沉默|转过|低下|避开/.test(ctx))h35.push({line:i+1,detail:'"没事"有矛盾动作'})}}
  C(35,'对白潜台词',true,h35.length?`${h35.length}处有潜台词`:'未检测到','有更好',h35.slice(0,3))

  // 36. 信息倾倒
  const h36=regexHits(lines,/[""「].*(?:你知道|你应该知道|我告诉你|让我告诉你|你不知道吗)/g)
  C(36,'信息倾倒',h36.length===0,h36.length?`${h36.length}处`:'无倾倒','0处',h36.slice(0,3))

  // 37. 对白长度变化
  const dlgL=lines.filter(l=>/^[""「]/.test(l.trim())).map(l=>l.trim().length)
  const dlgV=dlgL.length>2?Math.max(...dlgL)-Math.min(...dlgL):0
  C(37,'对白长度变化',dlgV>=8||dlgL.length<=2,`最长${Math.max(...dlgL||[0])}字/最短${Math.min(...dlgL||[0])}字`,'有变化')

  // 38. 对白有打断/犹豫
  const h38=regexHits(lines,/……|—|…|嗯|呃|啊|额|那个|就是说|怎么说呢/g)
  C(38,'对白有打断/犹豫',h38.length>=1,`${h38.length}处`,'≥1处',h38.slice(0,3))

  // 39. 对白有省略
  const h39=regexHits(lines,/[""「].*……[""」]|[""「].*—[""」]/g)
  C(39,'对白有省略',true,h39.length?`${h39.length}处`:'未检测到','有更好')

  // 40. 对白有动作穿插
  const h40=[]
  for(let i=0;i<lines.length;i++){if(!/^[""「]/.test(lines[i].trim())&&/说|道|问|答|笑|叹|哼|骂|吼|嚷/.test(lines[i])&&/着|了|一下/.test(lines[i]))h40.push({line:i+1,detail:'对白有动作穿插'})}
  C(40,'对白有动作穿插',h40.length>=1,`${h40.length}处`,'≥1处',h40.slice(0,3))

  // 41. 对白有环境穿插
  C(41,'对白有环境穿插',true,'人工检查：对白间是否穿插环境描写','人工检查')

  // 42. 对白有冲突
  C(42,'对白有冲突',true,'人工检查：对白中是否有观点碰撞','人工检查')

  // ═══ 描写层（12 项）═══

  // 43. 五感覆盖
  const sn={s:0,so:0,sm:0,t:0,tc:0}
  for(const l of lines){if(/看|望|盯|瞥|瞧|见|视|目光|眼睛|眼|色|光|亮|暗|红|白|黑|蓝|绿|灰/g.test(l))sn.s++;if(/听|响|声|音|嗡|啪|叮|咚|嘎|吱|沙|呼|喊|叫|笑|哭|叹|吼|嚷/g.test(l))sn.so++;if(/闻|味|气息|臭|香|霉|烟|油|腥|刺鼻/g.test(l))sn.sm++;if(/尝|吃|喝|嚼|咽|吞|苦|甜|酸|辣|咸|淡|腻|涩/g.test(l))sn.t++;if(/摸|触|碰|抓|握|攥|捏|拍|打|推|拉|扯|挠|掐|抖|颤|凉|热|冷|暖|湿|干|硬|软/g.test(l))sn.tc++}
  const snN=Object.values(sn).filter(v=>v>0).length
  C(43,'五感覆盖',snN>=3,`${snN}种(视${sn.s}/听${sn.so}/嗅${sn.sm}/味${sn.t}/触${sn.tc})`,'≥3种')

  // 44. 景物与情绪关联
  const h44=[];const sR=/^(天空|阳光|月光|风|雨|雪|山|河|湖|海|树|花|草|云|雾|星|月亮|太阳|路灯|街道|房间里|窗外)/;const cR=/[他她我你人物]/
  for(let i=0;i<lines.length;i++){const l=lines[i].trim();if(l.length>20&&sR.test(l)&&!cR.test(l))h44.push({line:i+1,text:l.substring(0,30)})}
  C(44,'景物与情绪关联',h44.length<=2,`${h44.length}处纯景物`,'≤2处',h44.slice(0,5))

  // 45. 描写有色彩
  const h45=regexHits(lines,/红|白|黑|蓝|绿|灰|黄|紫|粉|棕|金|银|碧|青|赤|橙|绯|翠|黛/g)
  C(45,'描写有色彩',h45.length>=1,`${h45.length}处`,'≥1处',h45.slice(0,3))

  // 46. 描写有光影
  const h46=regexHits(lines,/光|亮|暗|影|闪|耀|辉|灿|明|幽|昏|朦|胧|曦|晖|映|照|射|投|洒|泻/g)
  C(46,'描写有光影',h46.length>=1,`${h46.length}处`,'≥1处')

  // 47. 描写有声音
  const h47=regexHits(lines,/听|响|声|音|嗡|啪|叮|咚|嘎|吱|沙|呼|喊|叫|笑|哭|叹|吼|嚷|轰|隆|噼|咔|嚓|噗|嗤|嗖|呜/g)
  C(47,'描写有声音',h47.length>=1,`${h47.length}处`,'≥1处')

  // 48. 描写有气味
  const h48=regexHits(lines,/闻|味|气息|臭|香|霉|烟|油|腥|刺鼻|清新|腐烂|潮湿|干燥/g)
  C(48,'描写有气味',h48.length>=1,`${h48.length}处`,'≥1处')

  // 49. 描写有温度
  const h49=regexHits(lines,/凉|热|冷|暖|温|烫|冰|冻|寒|暑|炎/g)
  C(49,'描写有温度',h49.length>=1,`${h49.length}处`,'≥1处')

  // 50. 描写有质感
  const h50=regexHits(lines,/粗糙|光滑|柔软|坚硬|细腻/g)
  C(50,'描写有质感',h50.length>=1,`${h50.length}处`,'≥1处')

  // 51. 描写有层次
  C(51,'描写有层次',true,'人工检查：是否由远到近/由大到小','人工检查')

  // 52. 描写有留白
  C(52,'描写有留白',true,'人工检查：是否写满/是否有省略','人工检查')

  // ═══ 节奏层（12 项）═══

  // 53. 长短句交替
  const sL=lines.filter(l=>l.trim().length>0).map(l=>l.trim().length)
  const h53=[]
  for(let i=2;i<sL.length;i++){const d=Math.abs(sL[i]-sL[i-1])+Math.abs(sL[i-1]-sL[i-2]);if(d<10&&sL[i]>10)h53.push({line:i+1,detail:`${sL[i-2]}/${sL[i-1]}/${sL[i]}`})}
  C(53,'长短句交替',h53.length<=1,h53.length?`${h53.length}处过于均匀`:'长短交替','≤1处',h53.slice(0,3))

  // 54. 段落长度分布
  const pl=[];let cp=0;for(const l of lines){if(l.trim().length===0){if(cp>0)pl.push(cp);cp=0}else cp++}if(cp>0)pl.push(cp)
  const sP=pl.filter(l=>l<=2).length,mP=pl.filter(l=>l>=3&&l<=4).length,lP=pl.filter(l=>l>=5).length
  const hV=(sP>0?1:0)+(mP>0?1:0)+(lP>0?1:0)
  C(54,'段落长度分布',hV>=2||pl.length<20,`短${sP}/中${mP}/长${lP}`,'至少两种')

  // 55. 场景切换标记
  const blankN=lines.filter(l=>l.trim().length===0).length
  C(55,'场景切换标记',blankN>=2,`${blankN}个空行`,'≥2个')

  // 56. 紧张场景短句化
  C(56,'紧张场景短句化',true,'人工检查：紧张处是否用短句','人工检查')

  // 57. 详略得当
  C(57,'详略得当',true,'人工检查：重要场景是否展开/不重要是否略写','人工检查')

  // 58. 快慢交替
  C(58,'快慢交替',true,'人工检查：是否有快节奏和慢节奏交替','人工检查')

  // 59. 高潮有加速感
  C(59,'高潮有加速感',true,'人工检查：高潮处句子是否变短变快','人工检查')

  // 60. 低谷有停顿感
  C(60,'低谷有停顿感',true,'人工检查：低谷处是否用长句慢节奏','人工检查')

  // 61. 过渡自然
  C(61,'过渡自然',true,'人工检查：场景切换是否有过渡','人工检查')

  // 62. 不拖沓
  C(62,'不拖沓',true,'人工检查：是否有无关紧要的段落','人工检查')

  // 63. 不仓促
  C(63,'不仓促',true,'人工检查：重要场景是否一笔带过','人工检查')

  // 64. 节奏有变化
  C(64,'节奏有变化',true,'人工检查：全文节奏是否单调','人工检查')

  // ═══ 结构层（12 项）═══

  // 65. 开头钩子
  const fP=lines.find(l=>l.trim().length>0)||''
  const hasHook=/推|砸|摔|撞|冲|跑|逃|追|打|杀|死|血|枪|刀|信|电话|门|窗|灯|暗|黑|静|空|冷|热|雨|雪|风|响|声|叫|喊|吼|骂|哭|笑|叹|惊|恐|怕|疑|奇|怪|异/.test(fP)
  C(65,'开头钩子',hasHook||fP.length<10,hasHook?'有冲突/悬念':'无明显钩子','有钩子')

  // 66. 章末悬念
  const lastP=[...lines].reverse().find(l=>l.trim().length>0)||''
  const hasCliff=/[？?！!]$|……$|\.{3}$/.test(lastP.trim())||/电话|门|灯|暗|静|空|冷|热|响|声|叫|喊|吼|骂|哭|笑|叹|惊|恐|怕/.test(lastP)
  C(66,'章末悬念',hasCliff,hasCliff?'有悬念':'无明显悬念','有更好')

  // 67. 时间线标记
  const h67=regexHits(lines,/早上|上午|中午|下午|傍晚|晚上|夜里|凌晨|半夜|清晨|黄昏|午后|三天后|第二天|过了|之后|后来|从前|以前|小时候|多年后|当时|那时|此刻|此时|这时/g)
  C(67,'时间线标记',h67.length>=1,`${h67.length}个`,'≥1个',h67.slice(0,3))

  // 68. 空间标记
  const h68=regexHits(lines,/房间|客厅|卧室|厨房|门口|窗边|街上|路上|车上|船上|飞机|火车|办公室|学校|医院|商店|超市|饭店|咖啡馆|酒吧|公园|广场|车站|机场|码头|桥上|山顶|河边|海边|湖边|森林|沙漠|草原|田野|村庄|城市|小镇|大楼|楼顶|地下室|电梯里|走廊|楼梯|天台|阳台/g)
  C(68,'空间标记',h68.length>=1,`${h68.length}个`,'≥1个',h68.slice(0,3))

  // 69. 有伏笔
  C(69,'有伏笔',true,'人工检查：前文是否有后文呼应的细节','人工检查')

  // 70. 有呼应
  C(70,'有呼应',true,'人工检查：后文是否回应前文伏笔','人工检查')

  // 71. 有悬念推进
  C(71,'有悬念推进',true,'人工检查：悬念是否逐步推进','人工检查')

  // 72. 有冲突升级
  C(72,'有冲突升级',true,'人工检查：冲突是否逐步升级','人工检查')

  // 73. 有转折点
  C(73,'有转折点',true,'人工检查：是否有出人意料的转折','人工检查')

  // 74. 有高潮
  C(74,'有高潮',true,'人工检查：是否有情绪/冲突的最高点','人工检查')

  // 75. 有结局感
  C(75,'有结局感',true,'人工检查：结尾是否有收束感','人工检查')

  // 76. 有余韵
  C(76,'有余韵',true,'人工检查：读完是否有回味','人工检查')

  // ═══ 角色层（12 项）═══

  // 77. 视角一致性
  let fPP=0,tPP=0
  for(const l of lines){const fm=l.match(/(?<![「""])(?:我(?:的|们|想|看|听|说|走|跑|站|坐))/g);const tm=l.match(/(?:他|她)(?:的|们|想|看|听|说|走|跑|站|坐)/g);if(fm)fPP+=fm.length;if(tm)tPP+=tm.length}
  C(77,'视角一致性',!(fPP>5&&tPP>5),`第一${fPP}处/第三${tPP}处`,'不混用')

  // 78. 角色数量控制
  const charN=new Set()
  for(const l of lines){const m=l.match(/[一-龥]{1,4}(?:说|道|问|答|想)/g);if(m)m.forEach(x=>charN.add(x.replace(/说|道|问|答|想/g,'')))}
  C(78,'角色数量控制',charN.size<=5,`${charN.size}个角色`,'≤5个/短篇',charN.size>5?[{detail:[...charN].join('、')}]:[])

  // 79. 角色有独特语言
  C(79,'角色有独特语言',true,'人工检查：不同角色说话方式是否不同','人工检查')

  // 80. 角色有独特动作
  C(80,'角色有独特动作',true,'人工检查：不同角色是否有标志性动作','人工检查')

  // 81. 角色有外貌描写
  const h81=regexHits(lines,/脸|眼|鼻|嘴|耳|头发|身高|胖|瘦|老|年轻|皱纹|胡须|胡子|疤痕|痣|眼镜/g)
  C(81,'角色有外貌描写',h81.length>=1,`${h81.length}处`,'≥1处',h81.slice(0,3))

  // 82. 角色有心理描写
  const h82=regexHits(lines,/想|觉得|感到|认为|以为|琢磨|寻思|暗想|心想|回忆|想起|想到/g)
  C(82,'角色有心理描写',h82.length>=1,`${h82.length}处`,'≥1处',h82.slice(0,3))

  // 83. 角色有动机
  C(83,'角色有动机',true,'人工检查：角色行为是否有明确动机','人工检查')

  // 84. 角色有成长
  C(84,'角色有成长',true,'人工检查：角色是否有变化/成长','人工检查')

  // 85. 角色有矛盾
  C(85,'角色有矛盾',true,'人工检查：角色内心是否有矛盾','人工检查')

  // 86. 角色有关系
  C(86,'角色有关系',true,'人工检查：角色之间是否有关系网','人工检查')

  // 87. 角色有弱点
  C(87,'角色有弱点',true,'人工检查：角色是否有缺点/弱点','人工检查')

  // 88. 角色有选择
  C(88,'角色有选择',true,'人工检查：角色是否面临选择/困境','人工检查')

  // ═══ Show vs Tell 层（12 项）═══

  // 89. 用行动展示
  const h89=regexHits(lines,/走|跑|站|坐|拿|放|推|拉|扯|拽|抱|背|扛|挑|抬|举|摔|砸|扔|丢|踢|踹|踩|踏|跳|跃|爬|翻|滚|钻|挤|靠|躺|卧|跪|蹲|趴|倒/g)
  C(89,'用行动展示',h89.length>=3,`${h89.length}处动作`,'≥3处',h89.slice(0,3))

  // 90. 用细节展示
  const h90=regexHits(lines,/\d+|红|白|黑|蓝|绿|灰|木|铁|钢|玻璃|石头|布|纸|砖|水泥/g)
  C(90,'用细节展示',h90.length>=3,`${h90.length}处具体细节`,'≥3处')

  // 91. 用对话展示
  const dlgN=lines.filter(l=>/^[""「]/.test(l.trim())).length
  C(91,'用对话展示',dlgN>=2,`${dlgN}句对白`,'≥2句')

  // 92. 用冲突展示
  C(92,'用冲突展示',true,'人工检查：是否通过冲突展示而非说明','人工检查')

  // 93. 用对比展示
  C(93,'用对比展示',true,'人工检查：是否通过对比展示','人工检查')

  // 94. 用象征展示
  C(94,'用象征展示',true,'人工检查：是否通过象征/意象展示','人工检查')

  // 95. 不直接陈述情感
  const h95=regexHits(lines,/感到|觉得|心中|心里|不禁|情绪|心情|感情/g)
  C(95,'不直接陈述情感',den(h95.length,tc)<=2,`${h95.length}个`,'≤2/千字',h95.slice(0,5))

  // 96. 不直接评价角色
  const h96=regexHits(lines,/是一个|这个人|他很|她很|他真是|她真是|他就是|她就是/g)
  C(96,'不直接评价角色',h96.length===0,`${h96.length}个`,'0个',h96.slice(0,3))

  // 97. 不直接解释动机
  const h97=regexHits(lines,/因为|之所以|原因是|为了|目的是|动机是/g)
  C(97,'不直接解释动机',den(h97.length,tc)<=3,`${h97.length}个`,'≤3/千字',h97.slice(0,3))

  // 98. 不直接告诉读者感受
  const h98=regexHits(lines,/读者|你会|你会感到|让人|令人|使人|叫人/g)
  C(98,'不直接告诉读者感受',h98.length===0,`${h98.length}个`,'0个',h98.slice(0,3))

  // 99. 比喻词不过多
  const h99=regexHits(lines,/仿佛|好像|似乎|像是|犹如|宛如|恰似|好似/g)
  C(99,'比喻词不过多',den(h99.length,tc)<=3,`${h99.length}个`,'≤3/千字',h99.slice(0,3))

  // 100. "突然"不过多
  const h100=regexHits(lines,/突然|忽然|猛然|骤然|陡然|蓦然|乍然/g)
  C(100,'"突然"不过多',h100.length<=2,`${h100.length}个`,'≤2个',h100.slice(0,3))

  // ═══ 深层结构层（20 项，v2 新增）═══

  // 101. 安全比喻检测
  const h101=regexHits(lines,/温润如玉|静水深流|春日暖阳|刀削斧凿|深不见底|宛如|犹如|恰似|好似|一池静水|薄霜般|春日里.*静水|目光.*像.*水|眼神.*像.*湖/g)
  C(101,'安全比喻',h101.length<=1,`${h101.length}个安全意象`,'≤1个',h101.slice(0,5))

  // 102. 明喻密度（X像Y结构）
  const h102=regexHits(lines,/像[^。，！？]{2,}一样|像[^。，！？]{2,}似的|如同[^。，！？]{2,}一般|仿佛[^。，！？]{2,}般/g)
  C(102,'明喻密度',den(h102.length,tc)<=1,`${h102.length}个`,'≤1/千字',h102.slice(0,3))

  // 103. 比喻距离检测（本体喻体是否太近/太安全）
  const h103=regexHits(lines,/目光.*像.*水|眼神.*像.*湖|声音.*像.*玉|笑容.*像.*阳光|眼泪.*像.*珍珠|心.*像.*刀|脸.*像.*花/g)
  C(103,'比喻距离',h103.length===0,`${h103.length}个安全比喻`,'0个（用角色经验替代）',h103.slice(0,3))

  // 104. 信息密度方差（连续段落的信息量是否过于均匀）
  const h104=[]
  const nonEmptyLines=lines.filter(l=>l.trim().length>0)
  for(let i=2;i<nonEmptyLines.length;i++){
    const a=nonEmptyLines[i-2].trim().length,b=nonEmptyLines[i-1].trim().length,c=nonEmptyLines[i].trim().length
    const avg=(a+b+c)/3
    if(avg>15&&Math.abs(a-avg)<avg*0.15&&Math.abs(b-avg)<avg*0.15&&Math.abs(c-avg)<avg*0.15){
      h104.push({line:i+1,detail:`${a}/${b}/${c}字（密度过于均匀）`})
    }
  }
  C(104,'信息密度方差',h104.length<=1,h104.length?`${h104.length}处过于均匀`:'有详略差异','≤1处',h104.slice(0,3))

  // 105. 闲笔检测（是否有与情节无关的感官/环境细节）
  // 检测方法：看是否有纯环境/感官描写段落（不含人物动作和情感词）
  const h105=[]
  for(let i=0;i<lines.length;i++){
    const l=lines[i].trim()
    if(l.length<10) continue
    const hasEnv=/树|花|草|云|风|雨|阳光|月光|鸟|猫|狗|虫|鱼|水|石头|墙|瓦|砖|窗|门|桌|椅|灯|缸|巷|路|街/.test(l)
    const hasChar=/她|他|我|你|人|角色|姑娘|公子|小姐|老爷|太太|嬷嬷|丫头/.test(l)
    const hasEmotion=/感到|觉得|心中|心里|恨|爱|怕|怒|喜|悲|惊|急|愁|想|念|记|忘/.test(l)
    const hasAction=/走|跑|站|坐|拿|放|推|拉|说|问|答|看|听|吃|喝/.test(l)
    if(hasEnv&&!hasChar&&!hasEmotion&&!hasAction) h105.push({line:i+1,text:l.substring(0,30)})
  }
  C(105,'闲笔存在',h105.length>=1,`${h105.length}处纯环境描写`,'≥1处（闲笔让人味更浓）',h105.slice(0,3))

  // 106. Show don't tell 过度执行（全文无直接情感陈述）
  const h106=regexHits(lines,/她恨|她爱|她怕|她怒|她喜|她悲|他恨|他爱|他怕|他怒|他喜|他悲|我恨|我爱|我怕|我很|她很|他很|真是|实在是|确实是/g)
  C(106,'直接讲述存在',h106.length>=1,`${h106.length}处直接陈述`,'≥1处（Show+Tell混合更自然）',h106.slice(0,3))

  // 107. 叙述者存在感（是否有叙述者评论/插入语）
  const h107=regexHits(lines,/说起来|这事儿|说白了|说到底|说实话|老实说|其实|反正|大概|也许|可能|说不定|谁知道呢|也怪|也巧|也是|倒也是|可不是|谁想到|搁谁|换谁/g)
  C(107,'叙述者存在感',h107.length>=1,`${h107.length}处叙述者声音`,'≥1处',h107.slice(0,3))

  // 108. 情感节拍是否过于整齐（铺垫→触发→爆发→余韵完整链条）
  // 检测方法：看是否有连续的情感递进词
  const h108=regexHits(lines,/先是|然后.*接着|先.*再.*最后|一开始|起初.*后来|从.*到|越来越|渐渐|逐渐|慢慢|一点一点/g)
  C(108,'情感节拍自然度',h108.length<=2,`${h108.length}个递进标记`,'≤2个（太多=太整齐）',h108.slice(0,3))

  // 109. 标点个性化（破折号使用频率）
  const dashN=(all.match(/——/g)||[]).length
  C(109,'破折号使用',dashN>=1,`${dashN}个破折号`,'≥1个（个人风格标记）')

  // 110. 段首词多样性（避免连续段首重复）
  const h110=[]
  const firstChars=nonEmptyLines.map(l=>l.charAt(0))
  for(let i=2;i<firstChars.length;i++){
    if(firstChars[i]===firstChars[i-1]&&firstChars[i]===firstChars[i-2]&&/[一-鿿]/.test(firstChars[i])){
      h110.push({line:i+1,detail:`连续三段以"${firstChars[i]}"开头`})
    }
  }
  C(110,'段首词多样性',h110.length===0,h110.length?`${h110.length}处`:'段首词有变化','0处',h110.slice(0,3))

  // 111. 句式节奏变化（短句/长句交替是否自然）
  const sentenceLens=nonEmptyLines.map(l=>l.trim().length)
  let rhythmBreaks=0
  for(let i=1;i<sentenceLens.length;i++){
    const ratio=Math.max(sentenceLens[i],sentenceLens[i-1])/Math.max(Math.min(sentenceLens[i],sentenceLens[i-1]),1)
    if(ratio>3) rhythmBreaks++
  }
  C(111,'句式节奏突变',rhythmBreaks>=2,`${rhythmBreaks}处突变`,'≥2处（长短交替自然）')

  // 112. 细节功能性检测（每个细节是否都有叙事功能）
  // 检测方法：看是否有"多余"的数字/颜色/材质描写
  const h112=regexHits(lines,/一个|一只|一条|一块|一把|一双|一层|一片|一阵|一道|一抹|一缕|一丝|一线/g)
  C(112,'细节密度适中',den(h112.length,tc)<=8,`${h112.length}个`,'≤8/千字（太多=每个细节都有功能=AI）')

  // 113. 对白自然度（是否有口语化表达）
  const h113=regexHits(lines,/嗯|啊|呃|哦|嘛|吧|呢|呀|哈|嘿|喂|哎|唉|啧|哼|呸|啦|噢|呦|嘻/g)
  C(113,'对白口语化',h113.length>=2,`${h113.length}处口语词`,'≥2处')

  // 114. 方言/俗语存在
  const h114=regexHits(lines,/咋|咋的|咋回事|干啥|啥事|啥时候|哪能|哪有|咋整|得嘞|好嘞|成嘞|行嘞|甭|别介|哪知道|谁知道|说不准|搞不好|说不定|八成|大概齐|差不多/g)
  C(114,'方言俗语',true,h114.length?`${h114.length}处`:'未检测到','有更好',h114.slice(0,3))

  // 115. 叙述语气波动（是否有语气变化标记）
  const h115=regexHits(lines,/说真的|说白了|说到底|说实话|老实说|其实吧|反正|管他呢|爱咋咋|随他去|算了|得了|好了|行了|够了/g)
  C(115,'语气波动',true,h115.length?`${h115.length}处语气变化`:'未检测到','有更好',h115.slice(0,3))

  // 116. 结构可预测性（场景功能是否过于单一）
  // 检测方法：看是否有场景功能混杂（回忆段中出现当下感官、布局段中出现闲笔）
  const h116=[]
  for(let i=0;i<lines.length;i++){
    const l=lines[i]
    // 回忆标记
    const isMemory=/前世|当年|那时|那时候|从前|以前|记得|想起|回忆|过去/.test(l)
    // 当下感官标记
    const isPresent=/窗外|灶房|院子里|阳光|风|雨|冷|热|凉|热/.test(l)
    if(isMemory&&isPresent) h116.push({line:i+1,detail:'回忆与当下感官混杂（好的）'})
  }
  C(116,'场景功能混杂',true,h116.length?`${h116.length}处混杂`:'未检测到','有更好',h116.slice(0,3))

  // 117. 时间标记自然度（是否有过于精确的时间）
  const h117=regexHits(lines,/三天后|七天后|一个月后|一年后|三年后|五年后|十年后|第二天|第三天|第四天|第五天|第六天|第七天/g)
  C(117,'时间标记自然度',h117.length<=2,`${h117.length}个精确时间`,'≤2个（太多=太整齐）')

  // 118. 因果链自然度（是否有过于整齐的因果标记）
  const h118=regexHits(lines,/因为.*所以|由于.*因此|之所以.*是因为|既然.*就|只要.*就|只有.*才|除非.*否则|如果.*那么/g)
  C(118,'因果链自然度',den(h118.length,tc)<=1,`${h118.length}个因果标记`,'≤1/千字')

  // 119. 段落结构多样性（是否有多种段落类型）
  let typeA=0,typeB=0,typeC=0 // 短段/中段/长段
  for(const l of nonEmptyLines){
    if(l.trim().length<=15) typeA++
    else if(l.trim().length<=40) typeB++
    else typeC++
  }
  const typeN=(typeA>0?1:0)+(typeB>0?1:0)+(typeC>0?1:0)
  C(119,'段落结构多样性',typeN>=2,`短${typeA}/中${typeB}/长${typeC}`,'至少两种长度')

  // 120. 整体人味综合评估
  const autoFails=checks.filter(c=>!c.pass&&c.threshold!=='人工检查'&&c.threshold!=='有更好').length
  C(120,'整体人味评估',autoFails<=5,`${autoFails}项自动检测未通过`,'≤5项未通过')

  return checks
}

function printQuickCheck(filePath, text) {
  const checks = quickCheck100(text)
  const passCount = checks.filter(c => c.pass).length
  const failCount = checks.filter(c => !c.pass).length

  console.log(`  ${colors.bold}▸ 快速自检 ${checks.length} 项${colors.reset}（${passCount}/${checks.length} 通过）`)
  console.log('')

  // 按类别分组显示
  const categories = [
    { name: '语言层', ids: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] },
    { name: '情绪层', ids: [21,22,23,24,25,26,27,28,29,30,31,32] },
    { name: '对白层', ids: [33,34,35,36,37,38,39,40,41,42] },
    { name: '描写层', ids: [43,44,45,46,47,48,49,50,51,52] },
    { name: '节奏层', ids: [53,54,55,56,57,58,59,60,61,62,63,64] },
    { name: '结构层', ids: [65,66,67,68,69,70,71,72,73,74,75,76] },
    { name: '角色层', ids: [77,78,79,80,81,82,83,84,85,86,87,88] },
    { name: 'Show vs Tell', ids: [89,90,91,92,93,94,95,96,97,98,99,100] },
    { name: '深层结构层', ids: [101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120] },
  ]

  for (const cat of categories) {
    const catChecks = checks.filter(c => cat.ids.includes(c.id))
    const catPass = catChecks.filter(c => c.pass).length
    console.log(`    ${colors.bold}${cat.name}${colors.reset}（${catPass}/${catChecks.length}）`)
    for (const check of catChecks) {
      const icon = check.pass ? `${colors.green}✔${colors.reset}` : `${colors.red}✖${colors.reset}`
      const isManual = check.threshold === '人工检查' || check.threshold === '有更好'
      const tag = isManual ? `${colors.dim}[人工]${colors.reset}` : ''
      console.log(`      ${icon} ${check.id}. ${check.name}: ${check.detail} ${tag}`)
      if (!check.pass && check.items && check.items.length > 0) {
        for (const item of check.items.slice(0, 2)) {
          const loc = item.line ? `第${item.line}行` : ''
          const content = item.word || item.text || item.detail || ''
          console.log(`         ${colors.dim}${loc} ${content}${colors.reset}`)
        }
      }
    }
    console.log('')
  }
}

function printTextReport(filePath, results, score, totalLines) {
  const scoreInfo = getScoreLabel(score)

  console.log('')
  console.log(`${colors.cyan}╔══════════════════════════════════════╗${colors.reset}`)
  console.log(`${colors.cyan}║    AI 味检测报告                     ║${colors.reset}`)
  console.log(`${colors.cyan}╚══════════════════════════════════════╝${colors.reset}`)
  console.log('')
  console.log(`  文件: ${filePath}`)
  console.log(`  总行数: ${totalLines}`)
  console.log(`  检出禁词: ${results.length} 个`)
  console.log('')
  console.log(`  AI 味评分: ${scoreInfo.color}${colors.bold}${score}/100${colors.reset}（${scoreInfo.label}）`)
  console.log('')

  if (results.length === 0) {
    log('未检出 AI 高频词，文本质量良好！')
    console.log('')
    return
  }

  // 按类别分组
  const grouped = {}
  for (const r of results) {
    if (!grouped[r.category]) grouped[r.category] = []
    grouped[r.category].push(r)
  }

  for (const [category, items] of Object.entries(grouped)) {
    console.log(`  ${colors.bold}▸ ${category}${colors.reset}（${items.length} 处）`)
    for (const item of items.slice(0, 10)) {
      console.log(`    ${colors.dim}第${item.line}行${colors.reset}  "${colors.red}${item.word}${colors.reset}"`)
      console.log(`    ${colors.dim}上下文: ...${item.context}...${colors.reset}`)
      console.log(`    ${colors.green}建议: ${item.suggestion}${colors.reset}`)
      console.log('')
    }
    if (items.length > 10) {
      console.log(`    ${colors.dim}... 还有 ${items.length - 10} 处${colors.reset}`)
      console.log('')
    }
  }

  // 统计汇总
  console.log(`  ${colors.bold}📊 统计汇总${colors.reset}`)
  for (const [category, items] of Object.entries(grouped)) {
    console.log(`    ${category}: ${items.length} 处`)
  }
  console.log('')
}

function printJsonReport(filePath, results, score, totalLines) {
  const output = {
    file: filePath,
    totalLines,
    bannedWordCount: results.length,
    score,
    scoreLabel: getScoreLabel(score).label,
    categories: {},
    details: results,
  }

  for (const r of results) {
    if (!output.categories[r.category]) output.categories[r.category] = 0
    output.categories[r.category]++
  }

  console.log(JSON.stringify(output, null, 2))
}

// ========== 参数解析 ==========

function parseArgs(argv) {
  const args = argv.slice(2)
  const result = {
    file: null,
    lang: 'both',
    format: 'text',
  }

  for (const arg of args) {
    if (arg.startsWith('--lang=')) {
      result.lang = arg.split('=')[1]
    } else if (arg.startsWith('--format=')) {
      result.format = arg.split('=')[1]
    } else if (!arg.startsWith('--')) {
      result.file = arg
    }
  }

  return result
}

// ========== 主函数 ==========

function main() {
  const { file, lang, format } = parseArgs(process.argv)

  if (!file) {
    error('请指定小说文件路径')
    console.log('')
    console.log('用法: node detect.js <小说文件.txt> [--lang=zh|en|both] [--format=text|json]')
    console.log('')
    console.log('示例:')
    console.log('  node detect.js novel.txt')
    console.log('  node detect.js novel.txt --lang=zh')
    console.log('  node detect.js novel.txt --format=json')
    process.exit(1)
  }

  const filePath = path.resolve(file)
  if (!fs.existsSync(filePath)) {
    error(`文件不存在: ${filePath}`)
    process.exit(1)
  }

  const text = fs.readFileSync(filePath, 'utf-8')
  const lines = text.split('\n')
  const totalLines = lines.length

  let results = []

  if (lang === 'zh' || lang === 'both') {
    results.push(...detectChinese(text))
  }
  if (lang === 'en' || lang === 'both') {
    results.push(...detectEnglish(text))
  }

  // 按行号排序
  results.sort((a, b) => a.line - b.line || a.column - b.column)

  // 计算深层结构检测结果（用于评分）
  const deepChecks = quickCheck100(text)
  const score = calculateScore(results, totalLines, deepChecks)

  if (format === 'json') {
    printJsonReport(filePath, results, score, totalLines)
  } else {
    printTextReport(filePath, results, score, totalLines)
    printQuickCheck(filePath, text)
  }
}

main()
