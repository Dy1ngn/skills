#!/usr/bin/env node
/**
 * 后端接口模板生成工具 v4
 * 按模块生成，支持六位 status 编码
 *
 * status: "000000"=成功，六位字符串分层编码
 * data: 查询=业务数据，非查询=true/false
 *
 * 用法: node generate-backend.js <api-definition.json> [output-dir] [--lang=java|node]
 */

const fs = require('fs');
const path = require('path');

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function pascal(s) { return s.split(/[-_]/).map(capitalize).join(''); }

// ─── Java ───
function generateJava(def, outputDir) {
  const baseUrl = def.baseUrl || '/api';
  const modules = def.modules || {};

  const resultCode = `package com.example.common;

import lombok.Data;

/**
 * 统一返回结果
 * status: "000000"=成功，六位字符串分层编码
 * 查询接口 data 返回业务数据，非查询接口 data 返回 Boolean
 */
@Data
public class Result<T> {
    private String status;
    private T data;
    private String message;

    /** 查询接口成功 */
    public static <T> Result<T> success(T data) {
        Result<T> r = new Result<>();
        r.setStatus("000000"); r.setData(data); r.setMessage("success");
        return r;
    }

    /** 非查询接口成功: data = true */
    public static Result<Boolean> ok() {
        Result<Boolean> r = new Result<>();
        r.setStatus("000000"); r.setData(true); r.setMessage("success");
        return r;
    }

    /** 非查询接口失败: data = false */
    public static Result<Boolean> fail(String status, String message) {
        Result<Boolean> r = new Result<>();
        r.setStatus(status); r.setData(false); r.setMessage(message);
        return r;
    }

    /** 查询接口失败: data = null */
    public static <T> Result<T> error(String status, String message) {
        Result<T> r = new Result<>();
        r.setStatus(status); r.setData(null); r.setMessage(message);
        return r;
    }

    /** 成功但需调用其他接口 */
    public static Result<Boolean> partialOk(String message) {
        Result<Boolean> r = new Result<>();
        r.setStatus("000001"); r.setData(true); r.setMessage(message);
        return r;
    }
}
`;

  const pageReqCode = `package com.example.common;

import lombok.Data;

@Data
public class PageRequest {
    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String keyword;
    private String sortBy;
    private String sortOrder = "desc";
}
`;

  const pageResCode = `package com.example.common;

import lombok.Data;
import java.util.List;

@Data
public class PageResult<T> {
    private List<T> list;
    private PageInfo pageInfo;

    @Data
    public static class PageInfo {
        private Integer pageNum;
        private Integer pageSize;
        private Long total;
        private Integer totalPages;

        public static PageInfo of(int pageNum, int pageSize, long total) {
            PageInfo p = new PageInfo();
            p.setPageNum(pageNum); p.setPageSize(pageSize);
            p.setTotal(total); p.setTotalPages((int) Math.ceil((double) total / pageSize));
            return p;
        }
    }

    public static <T> PageResult<T> of(List<T> list, int pageNum, int pageSize, long total) {
        PageResult<T> r = new PageResult<>();
        r.setList(list); r.setPageInfo(PageInfo.of(pageNum, pageSize, total));
        return r;
    }
}
`;

  const commonDir = path.join(outputDir, 'common');
  fs.mkdirSync(commonDir, { recursive: true });
  fs.writeFileSync(path.join(commonDir, 'Result.java'), resultCode, 'utf-8');
  fs.writeFileSync(path.join(commonDir, 'PageRequest.java'), pageReqCode, 'utf-8');
  fs.writeFileSync(path.join(commonDir, 'PageResult.java'), pageResCode, 'utf-8');
  console.log('  common: Result, PageRequest, PageResult');

  // Controller
  const ctrlDir = path.join(outputDir, 'controller');
  fs.mkdirSync(ctrlDir, { recursive: true });

  Object.entries(modules).forEach(([key, mod]) => {
    const className = pascal(key) + 'Controller';
    const serviceName = pascal(key) + 'Service';
    const varName = key + 'Service';

    let code = `package com.example.controller;

import com.example.common.Result;
import com.example.common.PageRequest;
import com.example.common.PageResult;
import com.example.service.${serviceName};
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

/**
 * ${mod.name || key}
 * ${mod.description || ''}
 */
@RestController
@RequestMapping("${baseUrl}")
@RequiredArgsConstructor
public class ${className} {

    private final ${serviceName} ${varName};
`;

    mod.apis.forEach((api, apiIndex) => {
      // 方法名: 用完整路径生成，去掉开头的 /
      const methodName = api.path.replace(/^\/+/, '').replace(/\/:(\w+)/g, '/$1').replace(/\//g, '_').replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      // 加序号避免方法名冲突
      const uniqueMethodName = methodName + (apiIndex > 0 ? apiIndex : '');
      const httpMethod = capitalize(api.method.toLowerCase());
      // mapping 用完整路径（类级别只有 baseUrl）
      const mapping = api.path.replace(/:(\w+)/g, '{$1}');
      const isQuery = api.method === 'GET';
      const isList = api.path.includes('/list');

      code += `\n    /**\n     * ${api.name}\n${api.description ? `     * ${api.description}\n` : ''}     */\n`;
      code += `    @${httpMethod}Mapping("${mapping}")\n`;

      const params = [];
      if (api.request?.params) Object.entries(api.request.params).forEach(([name, def]) => {
        params.push(`@PathVariable ${def.type === 'integer' ? 'Long' : 'String'} ${name}`);
      });
      if (api.request?.query) params.push('PageRequest pageRequest');
      if (api.request?.body && !isQuery) params.push(`@RequestBody Object body`);

      let returnType = isList ? `Result<PageResult<Object>>` : isQuery ? `Result<Object>` : `Result<Boolean>`;
      code += `    public ${returnType} ${uniqueMethodName}(${params.join(', ')}) {\n`;

      if (!isQuery) {
        code += `        // TODO: 业务逻辑，成功返回 Result.ok()，失败返回 Result.fail("status码", "message")\n`;
        code += `        return Result.ok();\n`;
      } else if (isList) {
        code += `        // TODO: 分页查询\n`;
        code += `        return Result.success(null);\n`;
      } else {
        code += `        // TODO: 查询详情\n`;
        code += `        return Result.success(null);\n`;
      }
      code += `    }\n`;
    });

    code += '}\n';
    fs.writeFileSync(path.join(ctrlDir, `${className}.java`), code, 'utf-8');
    console.log(`  controller: ${className}.java (${mod.apis.length} 个接口)`);
  });

  // Service
  const svcDir = path.join(outputDir, 'service');
  fs.mkdirSync(svcDir, { recursive: true });

  Object.entries(modules).forEach(([key, mod]) => {
    const className = pascal(key) + 'Service';
    let code = `package com.example.service;\n\nimport com.example.common.PageRequest;\nimport com.example.common.PageResult;\nimport org.springframework.stereotype.Service;\n\n@Service\npublic class ${className} {\n`;

    mod.apis.forEach((api, apiIndex) => {
      const methodName = api.path.replace(/^\/+/, '').replace(/\/:(\w+)/g, '/$1').replace(/\//g, '_').replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      const uniqueMethodName = methodName + (apiIndex > 0 ? apiIndex : '');
      const isQuery = api.method === 'GET';
      const isList = api.path.includes('/list');

      if (isList) {
        code += `\n    public PageResult<Object> ${uniqueMethodName}(PageRequest pageRequest) {\n        // TODO\n        return null;\n    }\n`;
      } else if (isQuery) {
        code += `\n    public Object ${uniqueMethodName}() {\n        // TODO\n        return null;\n    }\n`;
      } else {
        code += `\n    public boolean ${uniqueMethodName}() {\n        // TODO: 成功返回 true，失败返回 false\n        return false;\n    }\n`;
      }
    });

    code += '}\n';
    fs.writeFileSync(path.join(svcDir, `${className}.java`), code, 'utf-8');
    console.log(`  service: ${className}.java`);
  });
}

// ─── Node.js ───
function generateNode(def, outputDir) {
  const baseUrl = def.baseUrl || '/api';
  const modules = def.modules || {};

  const middlewareCode = `/**
 * 统一回参中间件
 * status: "000000"=成功，六位字符串分层编码
 */
function resultMiddleware(req, res, next) {
  /** 查询接口成功 */
  res.success = (data, message = 'success') => res.json({ status: '000000', data, message });

  /** 非查询接口成功 */
  res.ok = (message = 'success') => res.json({ status: '000000', data: true, message });

  /** 非查询接口失败 */
  res.fail = (status, message) => res.json({ status, data: false, message });

  /** 查询接口失败 */
  res.error = (status, message) => res.json({ status, data: null, message });

  /** 列表接口成功 */
  res.page = (list, total, pageNum, pageSize) => res.success({
    list, pageInfo: { pageNum, pageSize, total, totalPages: Math.ceil(total / pageSize) }
  });

  next();
}
module.exports = resultMiddleware;
`;

  const mwDir = path.join(outputDir, 'middleware');
  fs.mkdirSync(mwDir, { recursive: true });
  fs.writeFileSync(path.join(mwDir, 'result.js'), middlewareCode, 'utf-8');
  console.log('  middleware: result.js');

  const routesDir = path.join(outputDir, 'routes');
  fs.mkdirSync(routesDir, { recursive: true });

  Object.entries(modules).forEach(([key, mod]) => {
    let code = `/**\n * ${mod.name || key}\n * ${mod.description || ''}\n */\n\n`;
    code += `const express = require('express');\nconst router = express.Router();\n\n`;

    mod.apis.forEach(api => {
      const method = api.method.toLowerCase();
      const isQuery = api.method === 'GET';
      const isList = api.path.includes('/list');

      code += `/**\n * ${api.name}\n${api.description ? ` * ${api.description}\n` : ''} */\n`;
      code += `router.${method}('${api.path}', async (req, res) => {\n  try {\n`;

      if (api.request?.params) code += `    const { ${Object.keys(api.request.params).join(', ')} } = req.params;\n`;
      if (api.request?.query) code += `    const { ${Object.keys(api.request.query).join(', ')} } = req.query;\n`;
      if (api.request?.body) code += `    const body = req.body;\n`;

      code += `    // TODO: 业务逻辑\n`;

      if (isList) {
        code += `    const list = [];\n    const total = 0;\n`;
        code += `    res.page(list, total, Number(req.query.pageNum) || 1, Number(req.query.pageSize) || 10);\n`;
      } else if (isQuery) {
        code += `    res.success(null);\n`;
      } else {
        code += `    res.ok();\n`;
      }

      code += `  } catch (e) { res.fail('000500', e.message); }\n});\n\n`;
    });

    code += `module.exports = router;\n`;
    fs.writeFileSync(path.join(routesDir, `${key}.js`), code, 'utf-8');
    console.log(`  routes: ${key}.js (${mod.apis.length} 个接口)`);
  });

  let indexCode = `/**\n * 路由统一注册入口\n */\n\nconst resultMiddleware = require('./middleware/result');\n\n`;
  Object.keys(modules).forEach(key => { indexCode += `const ${key}Routes = require('./routes/${key}');\n`; });
  indexCode += `\nfunction registerRoutes(app) {\n  app.use(resultMiddleware);\n\n`;
  Object.keys(modules).forEach(key => { indexCode += `  app.use('${baseUrl}', ${key}Routes);\n`; });
  indexCode += `}\n\nmodule.exports = registerRoutes;\n`;

  fs.writeFileSync(path.join(outputDir, 'index.js'), indexCode, 'utf-8');
  console.log('  index.js — 统一路由注册');
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('后端模板生成工具 v4');
    console.log('\n用法: node generate-backend.js <api-definition.json> [output-dir] [--lang=java|node]');
    process.exit(0);
  }

  const filePath = path.resolve(args[0]);
  let outputDir, lang = 'java';
  args.slice(1).forEach(arg => {
    if (arg.startsWith('--lang=')) lang = arg.split('=')[1];
    else if (!outputDir) outputDir = path.resolve(arg);
  });

  if (!fs.existsSync(filePath)) { console.error(`文件不存在: ${filePath}`); process.exit(1); }
  if (!outputDir) outputDir = path.join(path.dirname(filePath), `backend-${lang}`);

  const def = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  fs.mkdirSync(outputDir, { recursive: true });

  console.log(`\n生成 ${lang.toUpperCase()} 后端模板...\n`);
  if (lang === 'java') generateJava(def, outputDir);
  else if (lang === 'node') generateNode(def, outputDir);
  else { console.error(`不支持: ${lang}`); process.exit(1); }
  console.log(`\n完成: ${outputDir}`);
}

main();
