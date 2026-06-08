#!/usr/bin/env node
/**
 * 前端 Vue 代码生成工具
 * 根据 API 定义生成 Vue3 + Axios + TypeScript 代码
 *
 * 生成产物:
 *   types/api.d.ts       — 接口类型定义
 *   api/request.ts       — Axios 封装（统一回参处理）
 *   api/{module}.ts      — 每个模块的 API 服务文件
 *
 * 用法: node generate-frontend.js <api-definition.json> [output-dir]
 */

const fs = require('fs');
const path = require('path');

// ─── 类型映射 ───
function tsType(field) {
  if (!field || !field.type) return 'any';
  switch (field.type) {
    case 'integer':
    case 'number': return 'number';
    case 'string':
    case 'datetime':
    case 'date': return 'string';
    case 'boolean': return 'boolean';
    case 'array': return 'any[]';
    case 'object': return 'Record<string, any>';
    default: return 'any';
  }
}

// ─── 从响应描述提取类型定义 ───
function extractTypes(dataDef, interfaceName) {
  if (!dataDef || typeof dataDef === 'string') return null;
  const fields = Object.entries(dataDef).map(([name, desc]) => {
    if (typeof desc === 'object' && desc !== null) {
      // 嵌套对象
      const subFields = Object.entries(desc).map(([k, v]) => {
        const type = typeof v === 'string' && v.includes('integer') ? 'number'
          : typeof v === 'string' && v.includes('array') ? 'any[]'
          : typeof v === 'string' && v.includes('datetime') ? 'string'
          : 'any';
        return `  ${k}: ${type};`;
      }).join('\n');
      return `  ${name}: {\n${subFields}\n  };`;
    }
    const type = typeof desc === 'string' && desc.includes('integer') ? 'number'
      : typeof desc === 'string' && desc.includes('array') ? 'any[]'
      : typeof desc === 'string' && desc.includes('datetime') ? 'string'
      : typeof desc === 'string' && desc.includes('boolean') ? 'boolean'
      : 'any';
    return `  ${name}: ${type};`;
  }).join('\n');
  return `export interface ${interfaceName} {\n${fields}\n}`;
}

// ─── 生成类型定义文件 ───
function generateTypes(modules) {
  let code = `/**\n * API 类型定义\n * 自动生成\n */\n\n`;

  // 基础类型
  code += `/** 统一响应结构 */\n`;
  code += `export interface ApiResult<T = any> {\n  status: string;\n  data: T;\n  message: string;\n}\n\n`;

  code += `/** 分页信息 */\n`;
  code += `export interface PageInfo {\n  pageNum: number;\n  pageSize: number;\n  total: number;\n  totalPages: number;\n}\n\n`;

  code += `/** 分页响应 */\n`;
  code += `export interface PageResult<T = any> {\n  list: T[];\n  pageInfo: PageInfo;\n}\n\n`;

  code += `/** 分页请求 */\n`;
  code += `export interface PageRequest {\n  pageNum?: number;\n  pageSize?: number;\n  keyword?: string;\n  [key: string]: any;\n}\n\n`;

  // 每个模块的类型
  Object.entries(modules).forEach(([key, mod]) => {
    const prefix = key.charAt(0).toUpperCase() + key.slice(1);
    code += `// ─── ${mod.name || key} ───\n\n`;

    mod.apis.forEach(api => {
      if (api.response?.data && typeof api.response.data === 'object') {
        const isList = api.path.includes('/list');
        const typeName = isList ? `${prefix}ListItem` : `${prefix}Detail`;
        const interfaceCode = extractTypes(api.response.data, typeName);
        if (interfaceCode) {
          code += interfaceCode + '\n\n';
        }
      }
    });
  });

  return code;
}

// ─── 生成 Axios 封装 ───
function generateRequest() {
  return `/**
 * Axios 封装
 * 统一处理 status / 错误码 / Token
 */

import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResult } from '@/types/api';

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截：注入 Token
request.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

// 响应拦截：统一处理 status
request.interceptors.response.use(
  (response: AxiosResponse<ApiResult>) => {
    const { status, data, message } = response.data;

    // 成功
    if (status === '000000') {
      return response.data as any;
    }

    // Token 失效
    if (status === '000401') {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error(message));
    }

    // 无权限
    if (status === '000403') {
      console.error('无权限:', message);
      return Promise.reject(new Error(message));
    }

    // 服务不可用
    if (status === '000503') {
      console.error('服务维护中:', message);
      return Promise.reject(new Error(message));
    }

    // 其他错误
    return Promise.reject(new Error(message));
  },
  (error) => {
    // 网络错误 / 超时
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时'));
    }
    if (!error.response) {
      return Promise.reject(new Error('网络异常'));
    }

    const status = String(error.response.status);
    const statusMap: Record<string, string> = {
      '400': '请求参数错误',
      '401': '未登录或登录已过期',
      '403': '无权限访问',
      '404': '接口不存在',
      '500': '服务器内部错误',
      '502': '网关错误',
      '503': '服务不可用',
    };

    return Promise.reject(new Error(statusMap[status] || \`请求失败 (\${status})\`));
  }
);

export default request;
`;
}

// ─── 生成模块 API 文件 ───
function generateModuleApi(moduleName, module, baseUrl) {
  const apis = module.apis || [];
  const resName = module.name || moduleName;

  let code = `/**\n * ${resName} API\n * 自动生成\n */\n\n`;
  code += `import request from '../request';\n`;
  code += `import type { ApiResult, PageResult, PageRequest } from '@/types/api';\n\n`;

  apis.forEach(api => {
    const methodName = api.path
      .replace(/\/:(\w+)/g, '/$1')
      .replace(/\//g, '_')
      .replace(/^_/, '')
      .replace(/_([a-z])/g, (_, c) => c.toUpperCase());

    const isQuery = api.method === 'GET';
    const isList = api.path.includes('/list');
    const fullPath = `${baseUrl}${api.path}`;

    // 参数类型
    const paramTypes = [];
    if (api.request?.params) {
      Object.entries(api.request.params).forEach(([name, def]) => {
        paramTypes.push(`${name}: ${tsType(def)}`);
      });
    }
    if (api.request?.query) {
      paramTypes.push(`params: PageRequest`);
    }
    if (api.request?.body) {
      const bodyFields = Object.entries(api.request.body).map(([name, def]) => {
        const optional = def.required === true ? '' : '?';
        return `  ${name}${optional}: ${tsType(def)};`;
      }).join('\n');
      paramTypes.push(`data: {\n${bodyFields}\n}`);
    }

    // 返回类型
    let returnType;
    if (isList) {
      returnType = `ApiResult<PageResult>`;
    } else if (isQuery) {
      returnType = `ApiResult`;
    } else {
      returnType = `ApiResult<boolean>`;
    }

    // 路径参数替换
    const pathParams = api.request?.params ? Object.keys(api.request.params) : [];
    let axiosPath = fullPath;
    pathParams.forEach(p => {
      axiosPath = axiosPath.replace(`:${p}`, `\${${p}}`);
    });

    code += `/**\n * ${api.name}\n${api.description ? ` * ${api.description}\n` : ''} */\n`;

    if (isQuery) {
      code += `export function ${methodName}(${paramTypes.join(', ')}): Promise<${returnType}> {\n`;
      code += `  return request.get(\`${axiosPath}\`${api.request?.query ? ', { params }' : ''});\n`;
    } else {
      const method = api.method.toLowerCase();
      code += `export function ${methodName}(${paramTypes.join(', ')}): Promise<${returnType}> {\n`;
      code += `  return request.${method}(\`${axiosPath}\`${api.request?.body ? ', data' : ''});\n`;
    }
    code += `}\n\n`;
  });

  return code;
}

// ─── 生成 Vue 页面模板 ───
function generateVuePage(moduleName, module, baseUrl) {
  const resName = module.name || moduleName;
  const listApi = module.apis.find(a => a.path.includes('/list'));
  const detailApi = module.apis.find(a => a.method === 'GET' && !a.path.includes('/list'));
  const createApi = module.apis.find(a => a.method === 'POST');
  const deleteApi = module.apis.find(a => a.method === 'DELETE');

  const listMethodName = listApi ? listApi.path
    .replace(/\/:(\w+)/g, '/$1').replace(/\//g, '_').replace(/^_/, '')
    .replace(/_([a-z])/g, (_, c) => c.toUpperCase()) : 'getList';

  let vue = `<template>
  <div class="${moduleName}-page">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input v-model="searchKeyword" placeholder="搜索" @keyup.enter="handleSearch" />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      ${createApi ? '<el-button type="success" @click="handleCreate">新增</el-button>' : ''}
    </div>

    <!-- 数据表格 -->
    <el-table :data="tableData" v-loading="loading" border>
${detailApi && typeof detailApi.response?.data === 'object'
  ? Object.entries(detailApi.response.data)
      .filter(([k]) => !['id'].includes(k))
      .slice(0, 6)
      .map(([name, desc]) => `      <el-table-column prop="${name}" label="${typeof desc === 'string' ? desc.split('—')[0].trim() : name}" />`)
      .join('\n')
  : '      <el-table-column prop="id" label="ID" />'
}
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          ${deleteApi ? '<el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>' : ''}
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pageNum"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      @change="fetchList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ${listMethodName} } from '@/api/${moduleName}';
import type { PageResult } from '@/types/api';
import { ElMessage, ElMessageBox } from 'element-plus';

const loading = ref(false);
const tableData = ref<any[]>([]);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchKeyword = ref('');

async function fetchList() {
  loading.value = true;
  try {
    const res = await ${listMethodName}({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value || undefined,
    });
    if (res.status === '000000') {
      tableData.value = res.data.list;
      total.value = res.data.pageInfo.total;
    }
  } catch (e: any) {
    ElMessage.error(e.message || '查询失败');
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pageNum.value = 1;
  fetchList();
}

function handleCreate() {
  // TODO: 打开新增弹窗
  ElMessage.info('新增功能待实现');
}

function handleEdit(row: any) {
  // TODO: 打开编辑弹窗
  ElMessage.info(\`编辑 \${row.id}\`);
}

${deleteApi ? `async function handleDelete(row: any) {
  await ElMessageBox.confirm('确认删除？', '提示');
  try {
    // TODO: 调用删除接口
    ElMessage.success('删除成功');
    fetchList();
  } catch (e: any) {
    ElMessage.error(e.message || '删除失败');
  }
}` : ''}

onMounted(() => fetchList());
</script>
`;

  return vue;
}

// ─── 主流程 ───
function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('前端 Vue 代码生成工具');
    console.log('\n用法: node generate-frontend.js <api-definition.json> [output-dir]');
    console.log('\n生成产物:');
    console.log('  types/api.d.ts    — 类型定义');
    console.log('  api/request.ts    — Axios 封装');
    console.log('  api/{module}.ts   — 每个模块的 API');
    console.log('  views/{module}.vue — 每个模块的页面模板');
    process.exit(0);
  }

  const filePath = path.resolve(args[0]);
  const outputDir = args[1] ? path.resolve(args[1]) : path.join(path.dirname(filePath), 'frontend');
  if (!fs.existsSync(filePath)) { console.error(`文件不存在: ${filePath}`); process.exit(1); }

  const def = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const baseUrl = def.baseUrl || '/api';
  const modules = def.modules || {};

  // types
  const typesDir = path.join(outputDir, 'types');
  fs.mkdirSync(typesDir, { recursive: true });
  fs.writeFileSync(path.join(typesDir, 'api.d.ts'), generateTypes(modules), 'utf-8');
  console.log('  types/api.d.ts');

  // api/request.ts
  const apiDir = path.join(outputDir, 'api');
  fs.mkdirSync(apiDir, { recursive: true });
  fs.writeFileSync(path.join(apiDir, 'request.ts'), generateRequest(), 'utf-8');
  console.log('  api/request.ts');

  // api/{module}.ts
  Object.entries(modules).forEach(([name, mod]) => {
    fs.writeFileSync(path.join(apiDir, `${name}.ts`), generateModuleApi(name, mod, baseUrl), 'utf-8');
    console.log(`  api/${name}.ts — ${mod.name || name} (${mod.apis.length} 个接口)`);
  });

  // views/{module}.vue
  const viewsDir = path.join(outputDir, 'views');
  fs.mkdirSync(viewsDir, { recursive: true });
  Object.entries(modules).forEach(([name, mod]) => {
    fs.writeFileSync(path.join(viewsDir, `${name}.vue`), generateVuePage(name, mod, baseUrl), 'utf-8');
    console.log(`  views/${name}.vue — ${mod.name || name} 页面模板`);
  });

  console.log(`\n生成完成: ${outputDir}`);
}

main();
