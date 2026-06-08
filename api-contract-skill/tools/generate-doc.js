#!/usr/bin/env node
/**
 * API 文档生成工具 v4
 * 生成分级下钻结构的 Markdown 接口文档
 *
 * status 编码: "000000"=成功，六位字符串分层编码
 * data 规范: 查询=业务数据，非查询=true/false
 *
 * 用法: node generate-doc.js <api-definition.json> [output-file]
 */

const fs = require('fs');
const path = require('path');

function fieldTable(fields) {
  if (!fields || Object.keys(fields).length === 0) return '';
  const rows = Object.entries(fields).map(([name, def]) => {
    if (typeof def === 'string') return `| ${name} | - | - | ${def} |`;
    const type = def.type || '-';
    const required = def.required === true ? '是' : '否';
    const desc = [
      def.description || '',
      def.default !== undefined ? `默认: ${def.default}` : '',
      def.enum ? `可选: ${def.enum.join('/')}` : '',
    ].filter(Boolean).join('；');
    return `| ${name} | ${type} | ${required} | ${desc} |`;
  });
  return `| 字段名 | 类型 | 必填 | 说明 |\n| --- | --- | --- | --- |\n${rows.join('\n')}`;
}

function responseStructure(data) {
  if (!data) return '无额外数据';
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    const rows = Object.entries(data).map(([name, desc]) => {
      if (typeof desc === 'object' && desc !== null) return `| ${name} | object | 见下方 |`;
      return `| ${name} | - | ${desc} |`;
    });
    let table = `| 字段 | 类型 | 说明 |\n| --- | --- | --- |\n${rows.join('\n')}`;
    Object.entries(data).forEach(([name, desc]) => {
      if (typeof desc === 'object' && desc !== null) {
        table += `\n\n**${name} 结构:**\n\n| 字段 | 类型 | 说明 |\n| --- | --- | --- |\n`;
        Object.entries(desc).forEach(([k, v]) => { table += `| ${k} | - | ${v} |\n`; });
      }
    });
    return table;
  }
  return String(data);
}

function buildExample(method, data) {
  const isQuery = method === 'GET';
  if (isQuery) {
    const buildValue = (desc) => {
      if (typeof desc === 'string') {
        if (desc.includes('integer')) return 0;
        if (desc.includes('string')) return 'string';
        if (desc.includes('array')) return [];
        if (desc.includes('datetime')) return '2026-06-07 12:00:00';
        if (desc.includes('boolean')) return true;
        return desc;
      }
      if (typeof desc === 'object' && desc !== null) {
        const obj = {};
        Object.entries(desc).forEach(([k, v]) => { obj[k] = buildValue(v); });
        return obj;
      }
      return desc;
    };
    return { status: '000000', data: data ? buildValue(data) : null, message: 'success' };
  }
  return { status: '000000', data: true, message: 'success' };
}

// ─── 错误码表格 ───
function errorsTable(errs) {
  if (!errs || !errs.length) return '';
  const rows = errs.map(e => {
    const action = e.action ? ` — ${e.action}` : '';
    return `| ${e.status} | ${e.message || '-'}${action} |`;
  });
  return `| status | 说明 |\n| --- | --- |\n${rows.join('\n')}`;
}

function generate(def) {
  const baseUrl = def.baseUrl || '/api';
  const modules = def.modules || {};
  let md = '';

  md += `# ${def.title || 'API 文档'}\n\n`;
  if (def.description) md += `${def.description}\n\n`;
  md += `**版本:** ${def.version || '1.0.0'}  \n`;
  md += `**基础路径:** \`${baseUrl}\`\n\n`;

  // ─── 1. 统一规范 ───
  md += `---\n\n## 1. 统一规范\n\n`;

  md += `### 1.1 返回格式\n\n`;
  md += `\`\`\`json\n{\n  "status": "000000",\n  "data": {},\n  "message": "success"\n}\n\`\`\`\n\n`;

  md += `### 1.2 status 编码规范\n\n`;
  md += `六位数字字符串，\`"000000"\` = 成功，其他 = 失败。\n\n`;
  md += `**编码结构:** \`ABCDEF\`\n\n`;
  md += `| 位置 | 含义 | 说明 |\n| --- | --- | --- |\n`;
  md += `| 前两位 AB | 来源模块 | 00=基础设施，01~99=业务模块编号 |\n`;
  md += `| 第三位 C | 调用层级 | 标识在第几层服务/库出错 |\n`;
  md += `| 后三位 DEF | 具体原因 | 000~999，各模块自行定义 |\n\n`;

  md += `**基础错误码（000xxx，后三位对应 HTTP 状态码）:**\n\n`;
  md += `| status | HTTP | 说明 |\n| --- | --- | --- |\n`;
  md += `| 000000 | 200 | 成功 |\n`;
  md += `| 000001 | - | 成功但需调用其他接口（半成功） |\n`;
  md += `| 000400 | 400 | 请求参数错误 |\n`;
  md += `| 000401 | 401 | 未登录或 Token 失效 |\n`;
  md += `| 000403 | 403 | 无权限访问 |\n`;
  md += `| 000404 | 404 | 接口不存在或资源不存在 |\n`;
  md += `| 000405 | 405 | 请求方法不允许 |\n`;
  md += `| 000408 | 408 | 请求超时 |\n`;
  md += `| 000409 | 409 | 资源冲突（如重复创建） |\n`;
  md += `| 000413 | 413 | 请求体过大 |\n`;
  md += `| 000415 | 415 | 不支持的 Content-Type |\n`;
  md += `| 000422 | 422 | 请求格式正确但语义错误 |\n`;
  md += `| 000429 | 429 | 请求频率超限 |\n`;
  md += `| 000500 | 500 | 服务器内部错误 |\n`;
  md += `| 000501 | 501 | 接口未实现 |\n`;
  md += `| 000502 | 502 | 网关错误 |\n`;
  md += `| 000503 | 503 | 服务不可用（维护/过载） |\n`;
  md += `| 000504 | 504 | 网关超时 |\n\n`;

  md += `**判断逻辑:**\n\n`;
  md += `\`\`\`javascript\n`;
  md += `const isSuccess = response.status === '000000';\n`;
  md += `const needRedirect = response.status === '000001'; // 需要调用其他接口\n`;
  md += `const isInfraError = response.status.startsWith('000'); // 基础设施错误\n`;
  md += `\`\`\`\n\n`;

  md += `### 1.3 data 字段规范\n\n`;
  md += `| 接口类型 | data 返回值 |\n| --- | --- |\n`;
  md += `| 查询详情 (GET) | 业务数据对象 |\n`;
  md += `| 列表查询 (GET /list) | \`{ list, pageInfo }\` |\n`;
  md += `| 新增 (POST) | \`true\` / \`false\` |\n`;
  md += `| 修改 (PUT/PATCH) | \`true\` / \`false\` |\n`;
  md += `| 删除 (DELETE) | \`true\` / \`false\` |\n\n`;

  md += `### 1.4 分页规范\n\n`;
  md += `列表接口入参:\n\n`;
  md += `| 字段 | 类型 | 必填 | 说明 |\n| --- | --- | --- | --- |\n`;
  md += `| pageNum | integer | 否 | 页码，默认1 |\n| pageSize | integer | 否 | 每页条数，默认10 |\n\n`;
  md += `列表接口响应 data:\n\n`;
  md += `\`\`\`json\n{\n  "status": "000000",\n  "data": {\n    "list": [],\n    "pageInfo": {\n      "pageNum": 1,\n      "pageSize": 10,\n      "total": 100,\n      "totalPages": 10\n    }\n  },\n  "message": "success"\n}\n\`\`\`\n\n`;

  md += `### 1.5 模块组织规范\n\n`;
  md += `- 同一功能模块的所有接口集中在同一个文件中\n`;
  md += `- 所有接口通过统一的路由层转发\n\n`;

  // ─── 目录 ───
  md += `---\n\n## 目录\n\n`;
  let mi = 2;
  Object.entries(modules).forEach(([key, mod]) => {
    md += `### ${mi}. ${mod.name || key}\n\n`;
    mod.apis.forEach((api, i) => { md += `- ${mi}.${i + 1} [${api.name}](#${mi}-${i + 1}) \` ${api.method} ${api.path}\`\n`; });
    md += '\n';
    mi++;
  });

  // ─── 各模块 ───
  mi = 2;
  Object.entries(modules).forEach(([key, mod]) => {
    md += `---\n\n## ${mi}. ${mod.name || key}\n\n`;
    if (mod.description) md += `${mod.description}\n\n`;

    mod.apis.forEach((api, i) => {
      const num = `${mi}.${i + 1}`;
      const isQuery = api.method === 'GET';

      md += `### ${num} ${api.name}\n\n`;
      md += `> \`${api.method}\` \`${baseUrl}${api.path}\`\n\n`;
      if (api.description) md += `${api.description}\n\n`;

      // 请求参数
      md += `#### ${num}.1 请求参数\n\n`;
      let hasParams = false;
      if (api.request?.params && Object.keys(api.request.params).length) {
        md += `**路径参数:**\n\n${fieldTable(api.request.params)}\n\n`;
        hasParams = true;
      }
      if (api.request?.query && Object.keys(api.request.query).length) {
        md += `**查询参数:**\n\n${fieldTable(api.request.query)}\n\n`;
        hasParams = true;
      }
      if (api.request?.body && Object.keys(api.request.body).length) {
        md += `**请求体:**\n\n${fieldTable(api.request.body)}\n\n`;
        hasParams = true;
      }
      if (!hasParams) md += `无额外参数\n\n`;

      // 响应
      md += `#### ${num}.2 响应\n\n`;
      if (isQuery) {
        md += `**data 结构:**\n\n${responseStructure(api.response?.data)}\n\n`;
      } else {
        md += `**data:** \`true\`（成功）或 \`false\`（失败）\n\n`;
      }

      const example = buildExample(api.method, api.response?.data);
      md += `**成功响应:**\n\n\`\`\`json\n${JSON.stringify(example, null, 2)}\n\`\`\`\n\n`;

      // 错误码
      if (api.response?.errors?.length) {
        md += `#### ${num}.3 错误码\n\n`;
        md += errorsTable(api.response.errors) + '\n\n';

        // 错误响应示例
        const errExample = {
          status: api.response.errors[0].status,
          data: isQuery ? null : false,
          message: api.response.errors[0].message
        };
        md += `**错误响应示例:**\n\n\`\`\`json\n${JSON.stringify(errExample, null, 2)}\n\`\`\`\n\n`;
      }
    });

    mi++;
  });

  return md;
}

// ─── 入口 ───
function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('API 文档生成工具 v4');
    console.log('\n用法: node generate-doc.js <api-definition.json> [output-file]');
    process.exit(0);
  }

  const filePath = path.resolve(args[0]);
  const outputFile = args[1] ? path.resolve(args[1]) : path.join(path.dirname(filePath), 'API.md');
  if (!fs.existsSync(filePath)) { console.error(`文件不存在: ${filePath}`); process.exit(1); }

  const def = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const md = generate(def);
  fs.writeFileSync(outputFile, md, 'utf-8');
  console.log(`文档已生成: ${outputFile}`);
}

main();
