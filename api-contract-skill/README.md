# API Contract Skill

前后端接口契约工具链 — 模块化组织、统一规范、分级文档。

## 核心规范

### 统一回参

```json
{ "status": "000000", "data": {}, "message": "success" }
```

### status 编码规范

六位数字字符串，`"000000"` = 成功，其他 = 失败。

**编码结构:** `ABCDEF`

| 位置 | 含义 | 说明 |
|------|------|------|
| 前两位 AB | 来源模块 | 00=基础设施，01~99=业务模块编号 |
| 第三位 C | 调用层级 | 在第几层服务/库出错 |
| 后三位 DEF | 具体原因 | 000~999，各模块自行定义 |

**基础错误码（000xxx，后三位对应 HTTP 状态码）:**

| status | HTTP | 说明 |
|--------|------|------|
| 000000 | 200 | 成功 |
| 000001 | - | 成功但需调用其他接口（半成功） |
| 000400 | 400 | 请求参数错误 |
| 000401 | 401 | 未登录或 Token 失效 |
| 000403 | 403 | 无权限访问 |
| 000404 | 404 | 接口不存在或资源不存在 |
| 000405 | 405 | 请求方法不允许 |
| 000408 | 408 | 请求超时 |
| 000409 | 409 | 资源冲突（如重复创建） |
| 000413 | 413 | 请求体过大 |
| 000415 | 415 | 不支持的 Content-Type |
| 000422 | 422 | 请求格式正确但语义错误 |
| 000429 | 429 | 请求频率超限 |
| 000500 | 500 | 服务器内部错误 |
| 000501 | 501 | 接口未实现 |
| 000502 | 502 | 网关错误 |
| 000503 | 503 | 服务不可用（维护/过载） |
| 000504 | 504 | 网关超时 |

**业务错误码示例:**

| status | 含义 | 前端处理 |
|--------|------|----------|
| 101001 | 模块01第1层：用户名已存在 | 提示用户修改 |
| 309000 | 模块30第9层：查询出错 | 根据 message 提示 |
| 000001 | 操作部分成功 | 跳转到指定接口 |

### data 字段规范

| 接口类型 | data 返回值 |
|----------|-------------|
| 查询详情 (GET) | 业务数据对象 |
| 列表 (GET /list) | `{ list, pageInfo }` |
| 新增/修改/删除 | `true` / `false` |

### 模块化组织

- 同一模块的所有接口集中在一个文件
- 所有接口通过统一路由层转发

## 快速开始

```bash
# 校验契约
node tools/validate.js api.json

# 生成前端代码 (Vue3 + Axios + TS)
node tools/generate-frontend.js api.json ./frontend

# 生成前端 mock
node tools/generate-mock.js api.json ./mocks
cd mocks && node index.js

# 生成接口文档
node tools/generate-doc.js api.json ./docs/API.md

# 生成后端模板
node tools/generate-backend.js api.json ./src --lang=java
node tools/generate-backend.js api.json ./src --lang=node
```

## 文件结构

```
api-contract/
├── README.md
├── spec/
│   ├── api-definition-schema.json  # 定义格式规范
│   ├── status-codes.json           # status 编码规范
│   └── example-api.json            # 示例定义（含 errors）
└── tools/
    ├── validate.js                 # 契约校验
    ├── generate-frontend.js        # 前端代码生成（Vue3 + Axios + TS）
    ├── generate-mock.js            # mock 生成（支持错误模拟）
    ├── generate-doc.js             # 文档生成（含错误码表）
    └── generate-backend.js         # 后端模板（Java/Node）
```
