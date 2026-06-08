#!/usr/bin/env node
/**
 * API 契约校验工具 v4
 *
 * status 编码规范:
 *   - "000000" = 成功
 *   - 六位字符串，前三位=来源定位，后三位=具体原因
 *   - 000xxx = 基础设施错误 (404/500等)
 *   - ABCDEF = 业务错误 (AB=模块, C=调用层级, DEF=原因)
 *
 * 用法: node validate.js <api-definition.json>
 */

const fs = require('fs');
const path = require('path');

const c = {
  red: s => `\x1b[31m${s}\x1b[0m`,
  green: s => `\x1b[32m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  cyan: s => `\x1b[36m${s}\x1b[0m`,
  bold: s => `\x1b[1m${s}\x1b[0m`,
};

const errors = [];
const warnings = [];
function error(msg, loc) { errors.push({ msg, loc }); }
function warn(msg, loc) { warnings.push({ msg, loc }); }

const VALID_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const VALID_TYPES = ['integer', 'number', 'string', 'boolean', 'array', 'object', 'datetime', 'date'];

function isQueryApi(api) { return api.method === 'GET'; }

// ─── 校验 status 格式 ───
function validateStatus(status, loc) {
  if (typeof status !== 'string') error('status 必须是字符串', loc);
  else if (!/^\d{6}$/.test(status)) error(`status "${status}" 必须是六位数字字符串`, loc);
}

// ─── 校验 errors 定义 ───
function validateErrors(errs, loc) {
  if (!Array.isArray(errs)) return;
  errs.forEach((err, i) => {
    const errLoc = `${loc}.errors[${i}]`;
    if (!err.status) error('错误定义缺少 status', errLoc);
    else validateStatus(err.status, errLoc);
    if (!err.message) warn('错误定义建议添加 message（前端需要知道怎么处理）', errLoc);
  });
}

// ─── 校验响应 ───
function validateResponse(api, loc) {
  if (!api.response) { warn('接口建议定义 response', loc); return; }

  const isQuery = isQueryApi(api);
  const dataDesc = api.response.data;

  if (dataDesc !== undefined) {
    if (isQuery) {
      if (typeof dataDesc === 'string' && dataDesc.toLowerCase().includes('boolean')) {
        warn('查询接口 (GET) 的 data 应返回业务数据，不是 boolean', loc);
      }
    } else {
      if (typeof dataDesc === 'string' && !dataDesc.toLowerCase().includes('boolean')) {
        warn('非查询接口的 data 建议返回 boolean (true/false)', loc);
      }
    }
  }

  // 校验 errors
  validateErrors(api.response.errors, `${loc}.response`);
}

// ─── 校验字段 ───
function validateFieldDef(field, name, loc) {
  if (!field.type) warn(`字段 "${name}" 建议定义 type`, loc);
  else if (!VALID_TYPES.includes(field.type)) error(`字段 "${name}" 类型 "${field.type}" 不合法`, loc);
  if (field.required === undefined) warn(`字段 "${name}" 建议明确 required`, loc);
}

// ─── 校验请求 ───
function validateRequest(req, loc) {
  if (!req) return;
  ['params', 'query', 'body'].forEach(part => {
    if (req[part]) {
      if (typeof req[part] !== 'object') { error(`${part} 必须是对象`, loc); return; }
      Object.entries(req[part]).forEach(([name, def]) => {
        if (typeof def === 'object' && def !== null) validateFieldDef(def, name, `${loc}.${part}`);
      });
    }
  });
}

// ─── 校验接口 ───
function validateApi(api, loc) {
  if (!api.name) error('接口缺少 name', loc);
  if (!api.method) error('接口缺少 method', loc);
  else if (!VALID_METHODS.includes(api.method)) error(`method "${api.method}" 不合法`, loc);
  if (!api.path) error('接口缺少 path', loc);
  if (api.request) validateRequest(api.request, `${loc}.request`);
  validateResponse(api, loc);
}

// ─── 校验模块 ───
function validateModule(mod, moduleName) {
  const loc = `modules.${moduleName}`;
  if (!mod.name) error('模块缺少 name', loc);
  if (!Array.isArray(mod.apis) || mod.apis.length === 0) { error('模块必须包含非空 apis 数组', loc); return; }
  const paths = [];
  mod.apis.forEach((api, i) => {
    const apiLoc = `${loc}.apis[${i}]`;
    validateApi(api, apiLoc);
    const key = `${api.method} ${api.path}`;
    if (paths.includes(key)) warn(`接口路径重复: ${key}`, apiLoc);
    paths.push(key);
  });
}

// ─── 入口 ───
function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log(c.bold('API 契约校验工具 v4'));
    console.log('\n用法: node validate.js <api-definition.json>\n');
    console.log('校验内容:');
    console.log('  - status 格式（六位字符串）');
    console.log('  - 查询接口 data 应返回业务数据');
    console.log('  - 非查询接口 data 应返回 boolean');
    console.log('  - errors 定义格式（status + message）');
    console.log('  - 字段类型、路径重复等');
    process.exit(0);
  }

  const filePath = path.resolve(args[0]);
  if (!fs.existsSync(filePath)) { console.error(c.red(`文件不存在: ${filePath}`)); process.exit(1); }

  let def;
  try { def = JSON.parse(fs.readFileSync(filePath, 'utf-8')); }
  catch (e) { console.error(c.red(`JSON 解析失败: ${e.message}`)); process.exit(1); }

  console.log(c.bold(`\n校验: ${filePath}\n`));
  if (!def.modules || typeof def.modules !== 'object') { error('缺少 modules 定义'); }
  else {
    Object.keys(def.modules).forEach(name => {
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) error(`模块名 "${name}" 必须是合法标识符`);
      validateModule(def.modules[name], name);
    });
  }

  if (errors.length) {
    console.log(c.red(c.bold(`${errors.length} 个错误:\n`)));
    errors.forEach((e, i) => console.log(c.red(`  ${i + 1}. [${e.loc}] ${e.msg}`)));
  }
  if (warnings.length) {
    console.log(c.yellow(c.bold(`\n${warnings.length} 个警告:\n`)));
    warnings.forEach((w, i) => console.log(c.yellow(`  ${i + 1}. [${w.loc}] ${w.msg}`)));
  }
  if (!errors.length && !warnings.length) console.log(c.green(c.bold('校验通过 ✓')));
  else if (!errors.length) console.log(c.green(c.bold('\n校验通过（有警告）✓')));
  else { console.log(c.red(c.bold('\n校验失败 ✗'))); process.exit(1); }

  console.log(c.cyan('\n统计:'));
  Object.entries(def.modules || {}).forEach(([name, mod]) => {
    const q = mod.apis.filter(a => a.method === 'GET').length;
    console.log(`  ${mod.name || name}: ${mod.apis.length} 个接口（${q} 查询 / ${mod.apis.length - q} 写入）`);
  });
  console.log('');
}

main();
