# Vue Project Standard

Vue 3 前端项目工程规范 Skill，用于在 Claude 开发过程中自动按规范放置文件、命名变量，并生成标准化的项目骨架。

基于 vue-element-admin、Vben Admin、Arco Design Vue Pro、Naive UI Admin 等大型商用 Vue 项目的最佳实践总结而成。

---

## 技术栈基线

| 类别 | 推荐方案 |
|------|----------|
| 框架 | Vue 3.4+ |
| 语言 | TypeScript 5.x |
| 构建工具 | Vite 5+ |
| 状态管理 | Pinia |
| HTTP 客户端 | Axios |
| CSS 方案 | UnoCSS / Tailwind CSS + SCSS |
| 包管理器 | pnpm |
| 测试 | Vitest + Vue Test Utils + Playwright |
| 代码规范 | ESLint (flat config) + Husky + lint-staged |

---

## 项目结构规范

### 模式 A：单应用 Feature-Based（推荐，适用于 5+ 业务模块）

```
src/
├── App.vue
├── main.ts
│
├── features/                          # 业务功能模块（按领域划分）
│   ├── auth/                          # 认证模块
│   │   ├── components/                # 模块私有组件
│   │   │   ├── LoginForm.vue
│   │   │   └── RegisterForm.vue
│   │   ├── composables/               # 模块私有组合式函数
│   │   │   └── useLoginForm.ts
│   │   ├── services/                  # 模块私有 API 调用
│   │   │   └── authService.ts
│   │   ├── stores/                    # 模块私有 Pinia Store
│   │   │   └── auth.ts
│   │   ├── types/                     # 模块私有类型
│   │   │   └── auth.types.ts
│   │   ├── views/                     # 页面视图
│   │   │   ├── Login.vue
│   │   │   └── Register.vue
│   │   ├── utils/                     # 模块私有工具函数
│   │   ├── constants/                 # 模块私有常量
│   │   └── index.ts                   # 模块公共导出（barrel export）
│   │
│   ├── dashboard/                     # 仪表盘模块
│   │   ├── components/
│   │   │   ├── StatsCard.vue
│   │   │   └── ChartPanel.vue
│   │   ├── composables/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   ├── views/
│   │   │   └── Dashboard.vue
│   │   └── index.ts
│   │
│   └── ...                            # 其他业务模块
│
├── shared/                            # 跨模块共享代码
│   ├── components/                    # 全局复用组件
│   │   ├── ui/                        # 通用 UI 原子组件
│   │   │   ├── atoms/                 # 最小粒度：Button、Input、Icon
│   │   │   ├── molecules/             # 组合组件：SearchBar、Dropdown
│   │   │   ├── organisms/             # 复合组件：DataTable、FormBuilder
│   │   │   └── index.ts
│   │   ├── business/                  # 业务感知的共享组件
│   │   │   ├── UserAvatar.vue
│   │   │   ├── StatusBadge.vue
│   │   │   └── PermissionGuard.vue
│   │   └── feedback/                  # 状态反馈组件
│   │       ├── ErrorBoundary.vue
│   │       ├── LoadingSpinner.vue
│   │       └── EmptyState.vue
│   ├── composables/                   # 全局组合式函数
│   │   ├── useAuth.ts
│   │   ├── usePermission.ts
│   │   ├── usePagination.ts
│   │   ├── useDebounce.ts
│   │   └── index.ts
│   ├── utils/                         # 纯工具函数
│   │   ├── format.ts                  # 格式化工具
│   │   ├── validate.ts               # 校验工具
│   │   ├── storage.ts                # 本地存储封装
│   │   └── index.ts
│   ├── types/                         # 全局共享类型
│   │   ├── api.ts                     # API 响应/请求类型
│   │   ├── router.ts                  # 路由 Meta 类型扩展
│   │   ├── common.ts                  # 通用工具类型
│   │   ├── env.d.ts                   # Vite 环境变量类型
│   │   ├── global.d.ts                # 全局声明
│   │   └── index.ts
│   ├── constants/                     # 全局常量/枚举
│   │   ├── enums.ts
│   │   └── index.ts
│   └── hooks/                         # 兼容目录名（等同 composables）
│
├── layouts/                           # 应用布局壳
│   ├── DefaultLayout.vue             # 默认后台布局
│   ├── AuthLayout.vue                # 认证页布局
│   ├── BlankLayout.vue               # 空白布局
│   └── components/                   # 布局子组件
│       ├── AppSidebar.vue
│       ├── AppHeader.vue
│       ├── AppBreadcrumb.vue
│       └── AppFooter.vue
│
├── router/                            # 路由
│   ├── index.ts                       # createRouter() 实例
│   ├── guards.ts                      # 全局前置守卫
│   ├── routes/                        # 路由模块拆分
│   │   ├── index.ts                   # 合并所有路由
│   │   ├── auth.ts                    # 认证相关路由
│   │   ├── dashboard.ts              # 仪表盘路由
│   │   ├── system.ts                  # 系统管理路由
│   │   ├── error.ts                   # 错误页路由 (404, 403, 500)
│   │   └── public.ts                  # 公开路由
│   └── types.ts                       # 路由 Meta 类型声明
│
├── stores/                            # 全局 Pinia Store
│   ├── index.ts                       # createPinia() 实例
│   ├── modules/
│   │   ├── app.ts                     # 应用全局状态（侧边栏、主题等）
│   │   ├── user.ts                    # 用户信息
│   │   └── notification.ts           # 消息通知
│   └── types.ts
│
├── services/                          # 全局 API 服务层
│   ├── http.ts                        # Axios 实例 + 拦截器
│   ├── types.ts                       # 共享 DTO 类型
│   ├── userService.ts
│   ├── fileService.ts
│   └── index.ts
│
├── assets/                            # 静态资源
│   ├── styles/
│   │   ├── main.scss                  # 样式入口
│   │   ├── _variables.scss            # 主题变量（颜色、间距、字体）
│   │   ├── _mixins.scss               # SCSS 混入
│   │   ├── _base.scss                 # 基础重置样式
│   │   ├── _utilities.scss            # 工具类
│   │   └── _transitions.scss          # Vue 过渡动画类
│   ├── images/
│   └── fonts/
│
├── config/                            # 应用配置
│   ├── index.ts
│   ├── app.config.ts                  # 应用标题、版本、默认值
│   ├── theme.config.ts                # 主题配置
│   ├── layout.config.ts               # 布局配置
│   └── api.config.ts                  # API 地址、超时时间
│
├── plugins/                           # Vue 插件注册
│   └── index.ts
│
├── directives/                        # 自定义指令
│   ├── v-permission.ts
│   ├── v-loading.ts
│   └── index.ts
│
├── locales/                           # 国际化
│   ├── index.ts
│   ├── lang/
│   │   ├── zh-CN.ts
│   │   └── en-US.ts
│   └── types.ts
│
└── public/                            # 不经 Vite 处理的静态文件
    └── favicon.ico
```

### 模式 B：Monorepo 多应用（适用于多端/多应用共享代码）

```
project-root/
├── apps/                              # 可部署应用
│   ├── web/                           # 主 Web 应用
│   │   ├── src/                       # 遵循模式 A 的 src 结构
│   │   ├── vite.config.ts
│   │   └── package.json
│   ├── admin/                         # 管理后台
│   │   └── ...
│   └── mobile/                        # 移动端 H5
│       └── ...
│
├── packages/                          # 共享包
│   ├── @proj/core/                    # 核心框架
│   │   ├── shared/                    # 共享工具与类型
│   │   ├── composables/               # 共享组合式函数
│   │   ├── stores/                    # 共享 Store
│   │   ├── utils/                     # 工具函数
│   │   ├── design/                    # 设计 Token 与样式
│   │   ├── locales/                   # 国际化
│   │   └── layouts/                   # 布局组件
│   ├── @proj/ui/                      # 共享 UI 组件库
│   ├── @proj/effects/                 # 插件包
│   └── @proj/tsconfig/               # 共享 TS 配置
│
├── internal/                          # 内部工具链
│   ├── eslint-config/
│   ├── vite-config/
│   └── lint-staged-config/
│
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

---

## 命名规范速查表

### 文件命名

| 类别 | 规范 | 示例 |
|------|------|------|
| Vue 组件 | **PascalCase**，多词（避免与 HTML 标签冲突） | `UserProfile.vue`、`DataTable.vue`、`AppHeader.vue` |
| 组合式函数 | **camelCase**，`use` 前缀 | `useAuth.ts`、`usePagination.ts` |
| Pinia Store | **camelCase**，`use...Store` 后缀 | `useUserStore.ts`、`useCartStore.ts` |
| API 服务 | **camelCase**，`Service` 后缀 | `userService.ts`、`orderService.ts` |
| 类型文件 | **camelCase**，`.types.ts` 后缀 | `user.types.ts`、`auth.types.ts` |
| 声明文件 | **camelCase**，`.d.ts` 后缀 | `env.d.ts`、`global.d.ts` |
| 路由文件 | **camelCase**，按业务域命名 | `dashboard.ts`、`system.ts` |
| 样式局部文件 | **下划线前缀** | `_variables.scss`、`_mixins.scss` |
| 枚举文件 | **camelCase** | `enums.ts`、`status.enum.ts` |
| 目录 | **kebab-case** | `user-profile/`、`data-table/` |
| 测试文件 | 与源文件同目录，`.spec.ts` 或 `.test.ts` | `useAuth.spec.ts`、`LoginForm.test.ts` |
| 环境变量文件 | `.env.[mode]` | `.env.development`、`.env.production` |
| 自定义指令 | **camelCase**，`v-` 前缀 | `v-permission.ts`、`v-loading.ts` |

### 变量与类型命名

| 类别 | 规范 | 示例 |
|------|------|------|
| 组件 Props | camelCase（JS 中） / kebab-case（模板中） | `userName` / `:user-name` |
| 组件 Events | kebab-case | `update:modelValue`、`click:submit` |
| 响应式变量 | camelCase，语义化 | `isLoading`、`userList`、`formData` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`、`API_BASE_URL` |
| 接口（interface） | PascalCase，不加 `I` 前缀 | `UserInfo`、`ApiResponse` |
| 类型别名（type） | PascalCase | `UserRole`、`RouteMeta` |
| 枚举（enum） | PascalCase 名称 + UPPER_SNAKE 值 | `enum Status { ACTIVE, INACTIVE }` |
| 泛型参数 | 单大写字母或语义缩写 | `T`、`TData`、`TResponse` |
| Store ID | 小写域名片段（Pinia defineStore 第一个参数） | `'user'`、`'auth'`、`'cart'` |

---

## 组件内部命名规范

> 以下规范基于 Vben Admin V5、Arco Design Vue、Ant Design Vue、Naive UI Admin、Vue Pure Admin、Arco Design Pro Vue 等大型商用项目的实际代码总结。

### Props 命名规则

#### 布尔型 Props：用形容词/状态词，**禁止** `is` 前缀

`is` 前缀保留给组件内部的 computed 属性和局部变量，Props 本身不使用。

| 场景 | 命名模式 | 示例 | 来源 |
|------|----------|------|------|
| 基础状态 | 形容词 | `closable`、`draggable`、`disabled`、`loading`、`visible` | 全项目通用 |
| 显示子功能 | `showXxx` | `showCancelButton`、`showConfirmButton`、`showDefaultActions`、`showSearchForm` | Vben Admin |
| 隐藏子功能 | `hideXxx` | `hideCancel`、`hideFooter`、`hideTitle` | Arco Design |
| 生命周期标志 | `xxxOnClose` | `destroyOnClose`、`unmountOnClose` | Ant Design Vue |
| 操作状态 | 动词-ing | `submitting`、`confirmLoading`、`confirmDisabled` | Vben Admin |
| 布尔开关 | `xxxButton` | `fullscreenButton`、`showCancelButton` | Vben Admin |

```typescript
// ✅ 正确
const props = defineProps<{
  visible?: boolean
  closable?: boolean
  draggable?: boolean
  showCancelButton?: boolean
  hideFooter?: boolean
  destroyOnClose?: boolean
  confirmLoading?: boolean
  submitting?: boolean
}>()

// ❌ 错误：Props 不使用 is 前缀
const props = defineProps<{
  isVisible?: boolean      // 错！is 保留给内部 computed
  isClosable?: boolean
  isDraggable?: boolean
}>()
```

#### 回调型 Props：`onXxx` 或 `handleXxx`

| 场景 | 命名模式 | 示例 | 来源 |
|------|----------|------|------|
| 生命周期回调 | `onBeforeXxx` / `onXxx` / `onAfterXxx` | `onBeforeOk`、`onBeforeCancel`、`onClosed`、`onOpened`、`onOpenChange` | Arco Design / Vben Admin |
| 动作回调 | `handleXxx` | `handleSubmit`、`handleReset`、`handleCollapsedChange` | Vben Admin Form |
| 数据变更回调 | `onXxxChange` | `onOpenChange`、`onValueChange` | Vben Admin |

```typescript
// ✅ 作为 Props 传入的回调函数
const props = withDefaults(defineProps<{
  onBeforeClose?: () => MaybePromise<boolean | undefined>
  onCancel?: () => void
  onConfirm?: () => void
  handleSubmit?: (values: FormData) => void
  handleReset?: () => void
}>(), {
  onBeforeClose: undefined,
  onCancel: undefined,
  onConfirm: undefined,
  handleSubmit: undefined,
  handleReset: undefined,
})
```

#### 数据型 Props

| 场景 | 命名模式 | 示例 | 来源 |
|------|----------|------|------|
| 配置对象 | `xxxOptions` / `xxxCnfig` | `gridOptions`、`formOptions`、`toolbarConfig`、`submitButtonOptions` | Vben Admin |
| 数据数组 | `xxxData` / `xxxList` | `tableData`、`dataList` | Naive UI Admin |
| 标题文本 | `xxxTitle` | `tableTitle`、`tableTitleHelp`、`title` | Vben Admin |
| 表单数据 | `formInline` / `formModel` | `formInline`（来自父组件的初始值） | Vue Pure Admin |
| 样式类名 | `xxxClass` / `xxxStyle` | `actionWrapperClass`、`wrapperClass`、`modalClass` | Vben Admin |

```typescript
// ✅ 数据型 Props
const props = withDefaults(defineProps<{
  title: string
  tableData?: Record<string, unknown>[]
  gridOptions?: GridOptions
  formInline?: Record<string, unknown>
  submitButtonOptions?: ButtonOptions
  wrapperClass?: string
}>(), {
  tableData: () => [],
  gridOptions: () => ({}),
  formInline: () => ({}),
  submitButtonOptions: () => ({}),
  wrapperClass: '',
})
```

#### 默认值规范

| 类型 | 规则 | 示例 |
|------|------|------|
| 基本类型 | 直接赋值 | `count: 0`、`size: 'md'`、`visible: false` |
| 对象/数组 | 工厂函数 `() => ({})` | `formInline: () => ({ name: '' })`、`items: () => []` |
| 可选不设 | `undefined` | `onConfirm: undefined` |
| 字符串空值 | 空字符串 `''` | `wrapperClass: ''` |

---

### Event Emit 命名规则

Emits 统一使用 **kebab-case**，与模板 `@event-name` 写法一致。

| 场景 | 命名模式 | 示例 | 来源 |
|------|----------|------|------|
| v-model 双向绑定 | `update:xxx` | `update:modelValue`、`update:visible`、`update:open`、`update:value`、`update:checked-row-keys` | Vue 标准 |
| 动作事件 | 单词动词 | `ok`、`cancel`、`confirm`、`close`、`open`、`change` | Arco Design / Ant Design |
| 生命周期事件 | `beforeXxx` / `xxxed` | `beforeOpen`、`beforeClose`、`opened`、`closed` | Arco Design |
| 复合名称 | kebab-case | `fetch-success`、`fetch-error`、`edit-end`、`search-change`、`page-change` | Naive UI Admin |
| 带 on 前缀 | `on-xxx` | `on-close`、`on-ok`、`on-cancel` | Naive UI Admin |

```typescript
// ✅ 推荐：使用类型声明式
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:visible': [visible: boolean]
  'ok': [e: Event]
  'cancel': [e: Event]
  'beforeOpen': []
  'closed': []
  'fetch-success': [data: unknown[]]
  'page-change': [page: number]
}>()

// ✅ 也可以使用数组声明式（简单场景）
const emit = defineEmits([
  'update:modelValue',
  'ok',
  'cancel',
  'fetch-success',
  'page-change',
])

// ❌ 错误：不使用 camelCase 作为 emit 名
emit('fetchSuccess')   // 错！应为 'fetch-success'
emit('pageChange')     // 错！应为 'page-change'
```

---

### 方法/函数命名规则

#### 事件处理函数：`handleXxx`（主流模式）

`handleXxx` 用于模板 `@click`、`@close` 等 DOM/组件事件的处理方法。这是 Vben Admin、Arco Design、Ant Design Vue 的统一模式。

| 场景 | 命名模式 | 示例 | 来源 |
|------|----------|------|------|
| 模板事件处理 | `handleXxx` | `handleOk`、`handleCancel`、`handleSubmit`、`handleReset`、`handleClose`、`handleFullscreen`、`handleSearch` | Vben / Arco / Ant Design |
| DOM 事件处理 | `handleXxxYyy` | `handleMaskClick`、`handleGlobalKeyDown`、`handleOpenAutoFocus`、`handleFocusOutside` | Arco Design / Vben Admin |
| 工具栏/按钮点击 | `onXxxClick` | `onSearchBtnClick`、`onToolbarToolClick`、`onPageChange` | Vben Admin |

```typescript
// ✅ 模板事件处理统一用 handleXxx
function handleOk(e: Event) { ... }
function handleCancel(e: Event) { ... }
function handleMaskClick(e: Event) { ... }
function handleFullscreen() { ... }
async function handleSubmit(e: Event) { ... }
async function handleReset(e: Event) { ... }

// ✅ 视图级按钮点击可用 onXxxClick
function onSearchBtnClick() { ... }
function onPageChange(page: number) { ... }

// ❌ 错误：模板事件处理不用 onXxx（onXxx 保留给 composable 回调）
function onOk() { ... }      // 歧义：是回调 prop 还是事件处理？
function onCancel() { ... }
```

#### 异步数据获取：`fetchXxx`

| 场景 | 命名模式 | 示例 | 来源 |
|------|----------|------|------|
| API 数据拉取 | `fetchXxx` | `fetchData`、`fetchList`、`fetchDetail`、`fetchUserList` | Arco Design Pro |
| 初始化加载 | `init` / `loadXxx` | `init`、`loadData`、`loadMore` | Vben Admin |
| 表单提交 | `handleSubmit`（async） | `async function handleSubmit() { ... }` | Vben Admin |

```typescript
// ✅ 数据获取
const fetchData = async (params: QueryParams) => {
  setLoading(true)
  try {
    const { data } = await queryPolicyList(params)
    renderData.value = data.list
    total.value = data.pageInfo.total
  } finally {
    setLoading(false)
  }
}

// ✅ 初始化
async function init() {
  await nextTick()
  await fetchData(defaultParams)
}
```

#### 显隐控制：`openXxx` / `closeXxx`

| 场景 | 命名模式 | 示例 | 来源 |
|------|----------|------|------|
| 打开弹窗/抽屉 | `openXxx` | `openModal`、`openDrawer`、`openDialog` | Naive UI Admin / Vue Pure Admin |
| 关闭弹窗/抽屉 | `closeXxx` | `closeModal`、`closeDrawer`、`closeDialog`、`closeAllDialog` | Naive UI Admin / Vue Pure Admin |
| 设置状态 | `setXxx` | `setSubLoading`、`setLoading` | Naive UI Admin |
| 切换状态 | `toggleXxx` | `toggleFullscreen`、`toggleCollapsed` | 通用 |
| 函数式 API | `addXxx` / `removeXxx` | `addDialog`、`closeDialog`、`addDrawer` | Vue Pure Admin |

```typescript
// ✅ 命令式显隐控制
function openModal() { isModal.value = true }
function closeModal() { isModal.value = false; subLoading.value = false }
function openDrawer() { isDrawer.value = true }
function closeDrawer() { isDrawer.value = false }
function setSubLoading(status: boolean) { subLoading.value = status }
```

---

### 变量命名规则

#### Loading 状态

| 场景 | 命名 | 示例来源 |
|------|------|----------|
| 页面/组件级 loading | `loading` | Arco Design Pro（通过 `useLoading()` hook） |
| 按钮级 loading | `subLoading`（提交按钮） | Naive UI Admin |
| 弹窗确认按钮 loading | `confirmLoading` / `okLoading` | Ant Design Vue / Arco Design |
| 表单提交锁定 | `submitting` | Vben Admin |
| 操作级 loading | `xxxLoading` | `sureBtnLoading`（Vue Pure Admin） |

```typescript
// ✅ 页面级
const { loading, setLoading } = useLoading()

// ✅ 按钮级
const subLoading = ref(false)           // 提交按钮 loading（Naive UI Admin）

// ✅ Props 传入
const props = defineProps<{
  confirmLoading?: boolean              // 弹窗确认按钮
  okLoading?: boolean                   // 确认按钮（Arco Design）
  submitting?: boolean                  // 表单提交锁定
}>()
```

#### 表单数据

| 场景 | 命名 | 说明 | 示例来源 |
|------|------|------|----------|
| 搜索/筛选表单 | `formModel` | 最通用的表单状态命名 | Arco Design Pro、Naive UI Admin |
| 行内表单（Props） | `formInline` | 来自父组件的初始表单数据 | Vue Pure Admin |
| 抽屉/弹窗表单 | `formParams` | 弹窗内表单参数 | Naive UI Admin |
| 域对象表单 | `userInfo`、`orderInfo` | 按业务域命名 | 通用 |
| Props 可变副本 | `newXxx` | `newFormInline = ref(props.formInline)` | Vue Pure Admin |

```typescript
// ✅ 搜索表单
const formModel = ref(generateFormModel())

// ✅ 行内表单 Props
const props = withDefaults(defineProps<{ formInline?: FormData }>(), {
  formInline: () => ({ title: '', name: '', status: '' }),
})

// ✅ Props 可变副本
const newFormInline = ref(props.formInline)

// ✅ 抽屉表单
const formParams = ref(defaultValueRef())
```

#### 列表/表格数据

| 场景 | 命名 | 示例来源 |
|------|------|----------|
| 表格数据数组 | `tableData` | Naive UI Admin、Vben Admin、Vue Pure Admin |
| 渲染数据（过滤后） | `renderData` | Arco Design Pro |
| 表格列配置 | `columns` / `cloneColumns` / `showColumns` | Arco Design Pro |
| 通用列表 | `dataList`、`items`、`list` | 通用 |

```typescript
// ✅ 表格数据
const tableData = ref<Record<string, unknown>[]>([])
const renderData = ref<PolicyRecord[]>([])
const columns = computed(() => [...])
const cloneColumns = ref<Column[]>([])
```

#### 弹窗/抽屉显隐状态

| 场景 | 命名 | 示例来源 |
|------|------|----------|
| 弹窗显隐 ref | `isModal` | Naive UI Admin |
| 抽屉显隐 ref | `isDrawer` | Naive UI Admin |
| 开放状态（接口/状态对象） | `isOpen` | Vben Admin |
| Props 控制 | `visible` / `open` | Arco Design / Ant Design Vue |

```typescript
// ✅ 局部布尔 ref 控制显隐
const isModal = ref(false)
const isDrawer = ref(false)

// ✅ 接口/状态中
interface ModalState { isOpen?: boolean }

// ✅ Props 控制
const props = defineProps<{ visible?: boolean }>()
```

#### DOM/组件 Ref 引用

统一使用 `xxxRef` 后缀，无一例外。

| 场景 | 命名 | 示例来源 |
|------|------|----------|
| 表单实例 ref | `formElRef`、`ruleFormRef` | Naive UI Admin、Vue Pure Admin |
| 表格实例 ref | `tableElRef`、`gridRef` | Naive UI Admin、Vben Admin |
| DOM 容器 ref | `wrapperRef`、`contentRef`、`dialogRef` | Vben Admin |
| 弹窗组件 ref | `modalRef`、`drawerRef` | 通用 |
| 头部/底部 ref | `headerRef`、`footerRef` | Vben Admin |

```typescript
// ✅ 组件 ref
const formElRef = ref<Nullable<FormActionType>>(null)
const tableElRef = ref<ComponentRef>(null)
const gridRef = useTemplateRef<VxeGridInstance>('gridRef')

// ✅ DOM ref
const wrapperRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()
const dialogRef = ref()
const headerRef = ref()
const footerRef = ref()
```

---

### Computed 属性命名规则

| 前缀 | 语义 | 示例 | 来源 |
|------|------|------|------|
| `isXxx` | 状态查询（是否处于某状态） | `isCompactForm`、`isSeparator`、`isStriped`、`isClosed`、`isLoggedIn` | Vben Admin / Naive UI Admin |
| `shouldXxx` | 条件判断（是否应该做某事） | `shouldFullscreen`、`shouldDraggable`、`shouldCentered` | Vben Admin |
| `showXxx` | UI 显示判断（是否渲染某元素） | `showTableTitle`、`showToolbar`、`showDefaultEmpty`、`showFooter` | Vben Admin |
| `hasXxx` | 存在性判断（是否拥有某物） | `hasNext`、`hasPrev`、`hasPermission` | 通用 |
| `getXxx` | 数据派生/获取 | `getBindValues`、`getForceMount`、`getProps`、`getCanResize`、`getTableSize` | Naive UI Admin / Vben Admin |
| `mergedXxx` | 多源合并 | `mergedModalStyle`、`mergedOkLoading`、`mergedOptions` | Vben Admin |
| `xxxOptions` | 选项列表 | `statusOptions`、`contentTypeOptions`、`densityList` | Arco Design Pro |
| `xxxRef` | 响应式引用 | `contentRef`、`wrapperRef` | 全项目通用 |

```typescript
// ✅ isXxx：状态查询
const isLoggedIn = computed(() => !!token.value)
const isCompactForm = computed(() => formApi.getState()?.compact)

// ✅ shouldXxx：条件判断
const shouldFullscreen = computed(() => fullscreen.value)
const shouldDraggable = computed(() => draggable.value && !shouldFullscreen.value && header.value)

// ✅ showXxx：UI 显示判断
const showTableTitle = computed(() => !!slots[TABLE_TITLE]?.() || tableTitle.value)
const showToolbar = computed(() => !!slots[TOOLBAR_ACTIONS]?.() || !!props.toolbarConfig)

// ✅ hasXxx：存在性判断
const hasNext = computed(() => currentPage.value < totalPages.value)
const hasPrev = computed(() => currentPage.value > 1)

// ✅ getXxx：数据派生
const getBindValues = computed(() => { ... })
const getProps = computed(() => { ... })

// ✅ mergedXxx：多源合并
const mergedOptions = computed(() => ({ ...defaultOptions, ...props.gridOptions }))

// ✅ xxxOptions：选项列表
const statusOptions = computed(() => [
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' },
])
```

---

### 命名决策速查

当不确定某个标识符如何命名时，按以下决策树选择：

```
这个标识符是什么？
│
├── Props 参数？
│   ├── 布尔型 → 形容词（无 is 前缀）：closable, visible, draggable
│   │   ├── 显示子功能 → showXxx：showCancelButton
│   │   ├── 隐藏子功能 → hideXxx：hideFooter
│   │   └── 生命周期标志 → xxxOnClose：destroyOnClose
│   ├── 回调型 → onXxx 或 handleXxx：onConfirm, handleSubmit
│   └── 数据型 → xxxOptions / xxxData / xxxClass：gridOptions, tableData
│
├── Emit 事件？
│   └── 统一 kebab-case：update:modelValue, fetch-success, page-change
│
├── 方法？
│   ├── 模板事件处理 → handleXxx：handleOk, handleCancel, handleSubmit
│   ├── 按钮点击 → onXxxClick：onSearchBtnClick, onPageChange
│   ├── 数据获取 → fetchXxx：fetchData, fetchList
│   ├── 打开 → openXxx：openModal, openDrawer
│   ├── 关闭 → closeXxx：closeModal, closeDialog
│   └── 设置 → setXxx：setLoading, setSubLoading
│
├── 变量？
│   ├── Loading → loading（页面级）/ subLoading（按钮级）/ confirmLoading（确认按钮）
│   ├── 表单数据 → formModel（搜索）/ formInline（行内 Props）/ formParams（弹窗）
│   ├── 表格数据 → tableData / renderData
│   ├── 显隐状态 → isModal / isDrawer / isOpen
│   └── DOM/组件 Ref → xxxRef：formElRef, wrapperRef, gridRef
│
└── Computed？
    ├── 状态查询 → isXxx：isLoggedIn, isCompactForm
    ├── 条件判断 → shouldXxx：shouldFullscreen, shouldDraggable
    ├── UI 显示 → showXxx：showToolbar, showFooter
    ├── 存在性 → hasXxx：hasNext, hasPermission
    ├── 数据派生 → getXxx：getBindValues, getProps
    ├── 多源合并 → mergedXxx：mergedOptions
    └── 选项列表 → xxxOptions：statusOptions, contentTypeOptions
```

---

## 代码编写规范

### Vue 单文件组件（SFC）结构顺序

```vue
<script setup lang="ts">
// 1. 组件选项（name、inheritAttrs 等）
defineOptions({ name: 'UserProfile' })

// 2. 导入
import { computed, ref } from 'vue'
import { useUserStore } from '@/features/user/stores/user'
import type { UserInfo } from '@/features/user/types/user.types'

// 3. Props & Emits
const props = defineProps<{
  userId: string
  showActions?: boolean
}>()

const emit = defineEmits<{
  'update:userId': [value: string]
  'click:detail': [user: UserInfo]
}>()

// 4. Store 实例化
const userStore = useUserStore()

// 5. 响应式状态
const loading = ref(false)
const formData = reactive({ name: '', email: '' })

// 6. 计算属性
const fullName = computed(() => `${formData.name} (${formData.email})`)

// 7. 方法
async function handleSubmit() {
  loading.value = true
  try {
    await userStore.updateUser(props.userId, formData)
    emit('click:detail', userStore.currentUser!)
  } finally {
    loading.value = false
  }
}

// 8. 生命周期
onMounted(() => {
  // ...
})
</script>

<template>
  <!-- 模板内容 -->
</template>

<style scoped>
/* 组件样式 */
</style>
```

### Props 定义规范

```typescript
// ✅ 推荐：使用类型声明式（泛型语法）
const props = defineProps<{
  title: string
  count?: number
  items: string[]
  status: 'active' | 'inactive'
}>()

// ✅ 带默认值：使用 withDefaults
const props = withDefaults(defineProps<{
  title: string
  count?: number
  size?: 'sm' | 'md' | 'lg'
}>(), {
  count: 0,
  size: 'md',
})

// ❌ 不推荐：运行时声明式（丧失类型推导能力）
const props = defineProps({
  title: { type: String, required: true },
  count: { type: Number, default: 0 },
})
```

### Store 编写规范（Setup Store 风格）

```typescript
// stores/modules/user.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { userService } from '@/services/userService'
import type { UserInfo } from '@/types/api'

export const useUserStore = defineStore('user', () => {
  // --- State ---
  const currentUser = ref<UserInfo | null>(null)
  const token = ref<string>('')

  // --- Getters ---
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => currentUser.value?.name ?? '')

  // --- Actions ---
  async function login(username: string, password: string) {
    const res = await userService.login({ username, password })
    token.value = res.data.token
    currentUser.value = res.data.user
  }

  function logout() {
    token.value = ''
    currentUser.value = null
  }

  return {
    currentUser,
    token,
    isLoggedIn,
    userName,
    login,
    logout,
  }
})
```

### API 服务层规范

```typescript
// services/http.ts
// 响应格式遵循 api-contract 接口契约规范
// 参考: d:/soft/work/skills/api-contract/spec/example-api.json
import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types/api'

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
})

// 请求拦截器：附加 Token
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：统一错误处理
http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { status, message } = response.data
    if (status !== '000000') {
      return Promise.reject(new Error(message))
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期，跳转登录
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export { http }

// services/userService.ts
// 错误码处理遵循 api-contract 状态码规范
// 参考: d:/soft/work/skills/api-contract/spec/status-codes.json
import { http } from './http'
import type { ApiResponse } from '@/types/api'
import type { UserDTO, CreateUserDTO } from './types'

export const userService = {
  getUsers: () =>
    http.get<ApiResponse<{ list: UserDTO[]; pageInfo: PageInfo }>>('/users'),

  getUser: (id: string) =>
    http.get<ApiResponse<UserDTO>>(`/users/${id}`),

  createUser: (data: CreateUserDTO) =>
    http.post<ApiResponse<boolean>>('/users', data),

  updateUser: (id: string, data: Partial<CreateUserDTO>) =>
    http.put<ApiResponse<boolean>>(`/users/${id}`, data),

  deleteUser: (id: string) =>
    http.delete<ApiResponse<boolean>>(`/users/${id}`),
}
```

### 路由定义规范

```typescript
// router/routes/dashboard.ts
import type { RouteRecordRaw } from 'vue-router'

const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import(
      /* viteChunkName: "dashboard" */
      '@/features/dashboard/views/Dashboard.vue'
    ),
    meta: {
      title: '仪表盘',
      icon: 'dashboard',
      requiresAuth: true,
      roles: ['admin', 'user'],
    },
  },
]

export default dashboardRoutes

// router/guards.ts
import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/modules/auth'

export function setupRouterGuards(router: Router) {
  router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore()

    // 设置页面标题
    document.title = `${to.meta.title ?? ''} - MyApp`

    // 认证检查
    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }

    // 权限检查
    if (to.meta.roles?.length && !to.meta.roles.includes(authStore.userRole)) {
      next({ name: '403' })
      return
    }

    next()
  })
}
```

### 组合式函数规范

```typescript
// composables/usePagination.ts
import { ref, computed, watch } from 'vue'

interface PaginationOptions {
  defaultPage?: number
  defaultPageSize?: number
  total?: number
}

export function usePagination(options: PaginationOptions = {}) {
  const { defaultPage = 1, defaultPageSize = 20 } = options

  const currentPage = ref(defaultPage)
  const pageSize = ref(defaultPageSize)
  const total = ref(options.total ?? 0)

  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
  const hasNext = computed(() => currentPage.value < totalPages.value)
  const hasPrev = computed(() => currentPage.value > 1)

  function nextPage() {
    if (hasNext.value) currentPage.value++
  }

  function prevPage() {
    if (hasPrev.value) currentPage.value--
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  function reset() {
    currentPage.value = defaultPage
  }

  return {
    currentPage,
    pageSize,
    total,
    totalPages,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    goToPage,
    reset,
  }
}
```

---

## 目录选择决策树

当创建一个新文件时，按以下规则决定放置位置：

```
新文件属于什么？
│
├── 仅属于某个业务模块？
│   └── → src/features/<模块名>/<对应子目录>/
│       ├── 组件？    → components/
│       ├── 页面？    → views/
│       ├── 逻辑？    → composables/
│       ├── API？     → services/
│       ├── 状态？    → stores/
│       ├── 类型？    → types/
│       ├── 工具？    → utils/
│       └── 常量？    → constants/
│
├── 跨多个模块复用？
│   ├── UI 组件？    → src/shared/components/ui/
│   ├── 业务组件？   → src/shared/components/business/
│   ├── 组合函数？   → src/shared/composables/
│   ├── 工具函数？   → src/shared/utils/
│   ├── 类型定义？   → src/shared/types/
│   └── 常量枚举？   → src/shared/constants/
│
├── 应用级布局？     → src/layouts/
├── 路由相关？       → src/router/
├── 全局 Store？     → src/stores/
├── 全局服务？       → src/services/
├── 配置相关？       → src/config/
├── 自定义指令？     → src/directives/
├── 插件？           → src/plugins/
├── 国际化？         → src/locales/
└── 样式/图片/字体？ → src/assets/
```

---

## 样式规范

### 作用域选择

| 场景 | 方式 |
|------|------|
| 组件私有样式 | `<style scoped>` |
| 动态样式（需 JS 控制） | `<style module>` (CSS Modules) |
| 全局重置/主题 | `src/assets/styles/` 下的 SCSS 文件 |

### SCSS 变量注入（Vite 配置）

```typescript
// vite.config.ts
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/styles/_variables" as *;`,
      },
    },
  },
})
```

### CSS 类名规范

- 全局类名使用 **BEM** 命名：`.block__element--modifier`
- 工具类使用 UnoCSS / Tailwind 语法
- 组件 scoped 样式可使用短类名

---

## 环境变量规范

### 文件层级

```
.env                        # 所有模式加载
.env.development            # 开发环境
.env.staging                # 预发布环境
.env.production             # 生产环境
.env.local                  # 个人本地覆盖（gitignore）
.env.development.local      # 个人开发覆盖（gitignore）
```

### 命名规则

- 客户端变量必须以 `VITE_` 开头：`VITE_API_URL`、`VITE_APP_TITLE`
- 不要把密钥放在 `VITE_` 变量中（会暴露在浏览器）
- 在 `src/types/env.d.ts` 中声明类型

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## 接口契约集成（api-contract）

本项目的 API 服务层遵循 `api-contract` 接口契约规范，确保前后端接口定义一致。

### 契约文件位置

在项目根目录或 `docs/` 下放置 `api-contract.json` 接口契约文件，作为前后端对接的单一事实来源。

### 统一响应格式

```typescript
// 所有接口统一返回格式
interface ApiResponse<T = any> {
  status: string    // "000000" 表示成功
  data: T           // 业务数据
  message: string   // "success" 或错误描述
}
```

### 状态码规范

| 状态码 | 含义 | 前端行为 |
|--------|------|----------|
| `"000000"` | 成功 | 正常处理 |
| `"000401"` | 未授权 | 跳转登录页 |
| `"000403"` | 无权限 | 展示 403 页面 |
| `"000404"` | 资源不存在 | 展示 404 页面 |
| `"000500"` | 服务器错误 | 展示错误提示 |
| `"000001"` | 部分成功 | 需调用其他接口完成 |
| `101001` 等 | 业务错误码 | 按业务场景处理 |

### 数据约定

| 请求方式 | `data` 结构 | 示例 |
|----------|-------------|------|
| GET 详情 | 业务对象 | `data: UserDTO` |
| GET /list | `{ list: T[], pageInfo: { pageNum, pageSize, total, totalPages } }` | `data: { list: UserDTO[], pageInfo: {...} }` |
| POST / PUT / DELETE | `true` / `false` | `data: true` |

### 路径参数转换

api-contract 使用 `:paramName` 语法定义路径参数，前端需转为模板字符串：

```typescript
// api-contract 定义: /users/:id
// 前端调用:
http.get<ApiResponse<UserDTO>>(`/users/${id}`)

// api-contract 定义: /users/:userId/orders/:orderId
// 前端调用:
http.get<ApiResponse<OrderDTO>>(`/users/${userId}/orders/${orderId}`)
```

### TypeScript 类型生成

从 api-contract 的 `response.data` 自动生成 TypeScript 类型定义，避免手动维护接口类型：

```typescript
// api-contract.json 中的 response.data 定义
// {
//   "response": {
//     "data": {
//       "id": "string",
//       "name": "string",
//       "email": "string",
//       "createdAt": "string"
//     }
//   }
// }
//
// 自动生成:
// interface UserDTO {
//   id: string
//   name: string
//   email: string
//   createdAt: string
// }
```

### 使用 generate-frontend.js 生成代码

```bash
# 从 api-contract.json 生成 TypeScript 类型和前端代码
node api-contract/tools/generate-frontend.js api-contract.json --output src/

# 生成内容：
# - types/api.d.ts     → TypeScript 接口定义
# - api/request.ts     → Axios 实例（含拦截器）
# - api/{module}.ts    → 各模块 API 函数
# - views/{module}.vue → 页面模板
```

生成后的文件结构示例：

```typescript
// types/api.d.ts（自动生成）
export interface ApiResponse<T = any> {
  status: string
  data: T
  message: string
}

export interface UserDTO {
  id: string
  name: string
  email: string
  createdAt: string
}

// api/user.ts（自动生成）
import { http } from './request'
import type { ApiResponse, UserDTO } from '@/types/api'

export function getUser(id: string) {
  return http.get<ApiResponse<UserDTO>>(`/users/${id}`)
}

export function getUserList(params: { pageNum: number; pageSize: number }) {
  return http.get<ApiResponse<{ list: UserDTO[]; pageInfo: PageInfo }>>('/users', { params })
}
```

---

## 工具命令

### 初始化项目骨架

```bash
# 使用 scaffold 工具初始化标准目录结构
node tools/scaffold.js <项目路径> [--mode=single|monorepo]
```

### 验证项目结构

```bash
# 校验现有项目是否符合规范
node tools/validate.js <项目路径>
```
