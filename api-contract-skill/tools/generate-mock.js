#!/usr/bin/env node
/**
 * Mock 数据生成工具 v4
 * 按模块生成 mock 文件，支持错误码模拟
 *
 * status 编码: "000000"=成功，六位字符串分层编码
 * data 规范: 查询=业务数据，非查询=true/false
 *
 * 用法: node generate-mock.js <api-definition.json> [output-dir]
 */

const fs = require('fs');
const path = require('path');

function mockValue(name, type) {
  const n = (name || '').toLowerCase();
  if (n === 'id') return Math.floor(Math.random() * 1000) + 1;
  if (n.includes('time') || n.includes('date') || type === 'datetime') return '2026-06-07 12:00:00';
  if (n.includes('email')) return 'user@example.com';
  if (n.includes('phone')) return '13800138000';
  if (n.includes('status')) return 1;
  if (n.includes('count') || n.includes('total')) return Math.floor(Math.random() * 100);
  if (n.includes('name') || n.includes('title')) return `mock_${name}`;
  if (type === 'integer') return Math.floor(Math.random() * 100) + 1;
  if (type === 'boolean') return true;
  if (type === 'array') return [];
  if (type === 'number') return parseFloat((Math.random() * 100).toFixed(2));
  return `mock_${name || 'value'}`;
}

function buildMockData(dataDef) {
  if (!dataDef || typeof dataDef === 'string') return {};
  const obj = {};
  Object.entries(dataDef).forEach(([name, desc]) => {
    if (typeof desc === 'object' && desc !== null) {
      const sub = {};
      Object.entries(desc).forEach(([k, v]) => { sub[k] = mockValue(k, null); });
      obj[name] = sub;
    } else {
      obj[name] = mockValue(name, null);
    }
  });
  return obj;
}

function generateModuleMock(moduleName, module, baseUrl) {
  const apis = module.apis || [];
  const resName = module.name || moduleName;

  let code = `/**\n * ${resName} Mock\n * 自动生成\n */\n\nmodule.exports = {\n`;

  apis.forEach(api => {
    const fullPath = `${baseUrl}${api.path}`;
    const isQuery = api.method === 'GET';
    const isList = api.path.includes('/list');
    const routePath = fullPath.replace(/:(\w+)/g, ':$1');

    let mockBody;

    if (isQuery) {
      if (isList) {
        const listItems = [];
        for (let j = 0; j < 5; j++) {
          listItems.push({ id: j + 1, name: `item_${j + 1}` });
        }
        mockBody = {
          status: '000000',
          data: { list: listItems, pageInfo: { pageNum: 1, pageSize: 10, total: 50, totalPages: 5 } },
          message: 'success'
        };
      } else {
        mockBody = { status: '000000', data: buildMockData(api.response?.data), message: 'success' };
      }
    } else {
      mockBody = { status: '000000', data: true, message: 'success' };
    }

    code += `\n  // ${api.name} (成功)\n`;
    code += `  '${api.method} ${routePath}': (params, query, body) => (${JSON.stringify(mockBody, null, 4).replace(/\n/g, '\n  ')}),\n`;

    // 生成错误响应 mock（如果有 errors 定义）
    if (api.response?.errors?.length) {
      const firstErr = api.response.errors[0];
      const errBody = {
        status: firstErr.status,
        data: isQuery ? null : false,
        message: firstErr.message
      };
      code += `\n  // ${api.name} (错误示例: ${firstErr.status})\n`;
      code += `  '${api.method} ${routePath}__error': (params, query, body) => (${JSON.stringify(errBody, null, 4).replace(/\n/g, '\n  ')}),\n`;
    }
  });

  code += '};\n';
  return code;
}

function generateUtils() {
  return `/**
 * Mock 服务器工具
 */

const http = require('http');
const url = require('url');

function startMockServer(routes, port = 3001) {
  const server = http.createServer((req, res) => {
    const parsed = url.parse(req.url, true);
    const method = req.method;
    const pathname = parsed.pathname;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { body = body ? JSON.parse(body) : {}; } catch { body = {}; }

      // 支持 ?__error=true 查询参数触发错误响应
      const wantError = parsed.query.__error;
      const lookupPath = wantError ? pathname + '__error' : pathname;

      const handler = matchRoute(routes, method, lookupPath) || matchRoute(routes, method, pathname);
      if (handler) {
        const result = typeof handler === 'function' ? handler(handler.params || {}, parsed.query, body) : handler;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: '000404', data: null, message: \`接口不存在: \${method} \${pathname}\` }));

      }
    });
  });

  server.listen(port, () => console.log(\`Mock 服务器: http://localhost:\${port}\`));
}

function matchRoute(routes, method, pathname) {
  const exactKey = \`\${method} \${pathname}\`;
  if (routes[exactKey]) return routes[exactKey];

  for (const [pattern, handler] of Object.entries(routes)) {
    const [pMethod, pPath] = pattern.split(' ');
    if (pMethod !== method) continue;

    const pParts = pPath.split('/');
    const aParts = pathname.split('/');
    if (pParts.length !== aParts.length) continue;

    const params = {};
    let match = true;
    for (let i = 0; i < pParts.length; i++) {
      if (pParts[i].startsWith(':')) {
        params[pParts[i].slice(1)] = aParts[i];
      } else if (pParts[i] !== aParts[i]) {
        match = false; break;
      }
    }
    if (match) {
      const fn = typeof handler === 'function' ? handler : () => handler;
      fn.params = params;
      return fn;
    }
  }
  return null;
}

module.exports = { startMockServer };
`;
}

function generateIndex(moduleNames) {
  const imports = moduleNames.map(n => `const ${n}Routes = require('./${n}');`).join('\n');
  const merges = moduleNames.map(n => `  ...${n}Routes,`).join('\n');

  return `/**
 * Mock 统一入口
 */

const { startMockServer } = require('./_utils');

${imports}

const allRoutes = {
${merges}
};

if (require.main === module) {
  startMockServer(allRoutes, process.env.MOCK_PORT || 3001);
}

module.exports = allRoutes;
`;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Mock 数据生成工具 v4');
    console.log('\n用法: node generate-mock.js <api-definition.json> [output-dir]');
    console.log('\n特性:');
    console.log('  - 成功/错误双响应 mock');
    console.log('  - 添加 ?__error=true 查询参数可触发错误响应');
    console.log('  - status 使用六位字符串编码');
    process.exit(0);
  }

  const filePath = path.resolve(args[0]);
  const outputDir = args[1] ? path.resolve(args[1]) : path.join(path.dirname(filePath), 'mocks');
  if (!fs.existsSync(filePath)) { console.error(`文件不存在: ${filePath}`); process.exit(1); }

  const def = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const baseUrl = def.baseUrl || '/api';
  const modules = def.modules || {};

  fs.mkdirSync(outputDir, { recursive: true });

  Object.entries(modules).forEach(([name, mod]) => {
    fs.writeFileSync(path.join(outputDir, `${name}.js`), generateModuleMock(name, mod, baseUrl), 'utf-8');
    console.log(`  ${name}.js — ${mod.name || name} (${mod.apis.length} 个接口)`);
  });

  fs.writeFileSync(path.join(outputDir, '_utils.js'), generateUtils(), 'utf-8');
  fs.writeFileSync(path.join(outputDir, 'index.js'), generateIndex(Object.keys(modules)), 'utf-8');

  console.log(`\n生成完成: ${outputDir}`);
  console.log(`启动: cd ${outputDir} && node index.js`);
  console.log(`测试错误: curl http://localhost:3001${baseUrl}/xxx?__error=true`);
}

main();
