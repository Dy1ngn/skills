# Java Project Standard

Java 后端项目工程规范 Skill，用于在 Claude 开发过程中自动按规范放置文件、命名变量，并生成标准化的项目骨架。基于阿里巴巴 Java 开发手册、RuoYi、JeecgBoot、Pig、EL-ADMIN 等大型商用 Java 项目的最佳实践总结而成。

---

## 技术栈基线

| 类别 | 推荐方案 |
|------|----------|
| 语言 | Java 17+ |
| 框架 | Spring Boot 3.x |
| ORM | MyBatis-Plus / Spring Data JPA |
| 构建工具 | Maven 3.8+ / Gradle 8+ |
| 数据库 | MySQL 8+ / PostgreSQL |
| 缓存 | Redis |
| 安全框架 | Spring Security / Sa-Token |
| API 文档 | Knife4j (Swagger) |
| 工具库 | Hutool / MapStruct / Lombok |

---

## 项目结构规范

### 模式 A：单模块 Spring Boot（推荐，适用于中小型项目）

```
project-root/
├── pom.xml                                    # Maven 构建配置
├── src/
│   ├── main/
│   │   ├── java/com/{company}/{project}/
│   │   │   ├── {Project}Application.java     # Spring Boot 启动类
│   │   │   │
│   │   │   ├── controller/                    # REST 控制器（对外暴露 API）
│   │   │   │   ├── SysUserController.java
│   │   │   │   ├── SysRoleController.java
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── service/                       # 业务逻辑层：接口定义
│   │   │   │   ├── ISysUserService.java
│   │   │   │   ├── ISysRoleService.java
│   │   │   │   └── impl/                      # 业务逻辑层：接口实现
│   │   │   │       ├── SysUserServiceImpl.java
│   │   │   │       └── SysRoleServiceImpl.java
│   │   │   │
│   │   │   ├── mapper/                        # MyBatis Mapper 接口
│   │   │   │   ├── SysUserMapper.java
│   │   │   │   └── SysRoleMapper.java
│   │   │   │
│   │   │   ├── entity/                        # 数据库实体类（DO），与表一一映射
│   │   │   │   ├── SysUser.java
│   │   │   │   ├── SysRole.java
│   │   │   │   └── SysUserRole.java
│   │   │   │
│   │   │   ├── dto/                           # 数据传输对象
│   │   │   │   ├── query/                     # 查询参数对象（Query）
│   │   │   │   │   ├── UserQuery.java
│   │   │   │   │   └── RoleQuery.java
│   │   │   │   └── req/                       # 请求体 DTO
│   │   │   │       ├── UserCreateReq.java
│   │   │   │       ├── UserUpdateReq.java
│   │   │   │       └── RoleCreateReq.java
│   │   │   │
│   │   │   ├── vo/                            # 视图对象（返回前端）
│   │   │   │   ├── UserVO.java
│   │   │   │   ├── RoleVO.java
│   │   │   │   ├── LoginVO.java
│   │   │   │   └── UserInfoVO.java
│   │   │   │
│   │   │   ├── bo/                            # 业务对象
│   │   │   │   └── UserBO.java
│   │   │   │
│   │   │   ├── config/                        # Spring 配置类
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── RedisConfig.java
│   │   │   │   ├── MybatisPlusConfig.java
│   │   │   │   ├── CorsConfig.java
│   │   │   │   ├── Knife4jConfig.java
│   │   │   │   └── AsyncConfig.java
│   │   │   │
│   │   │   ├── constant/                      # 常量
│   │   │   │   ├── Constants.java
│   │   │   │   ├── HttpStatus.java
│   │   │   │   └── SecurityConstants.java
│   │   │   │
│   │   │   ├── enums/                         # 枚举
│   │   │   │   ├── BusinessType.java
│   │   │   │   ├── UserStatus.java
│   │   │   │   └── DataScope.java
│   │   │   │
│   │   │   ├── exception/                     # 自定义异常
│   │   │   │   ├── BusinessException.java
│   │   │   │   ├── ForbiddenException.java
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   │
│   │   │   ├── annotation/                    # 自定义注解
│   │   │   │   ├── Log.java                   # 操作日志注解
│   │   │   │   ├── DataScope.java             # 数据权限注解
│   │   │   │   ├── RateLimiter.java           # 限流注解
│   │   │   │   └── RepeatSubmit.java          # 防重提交注解
│   │   │   │
│   │   │   ├── aspect/                        # AOP 切面
│   │   │   │   ├── LogAspect.java             # 日志切面
│   │   │   │   ├── DataScopeAspect.java       # 数据权限切面
│   │   │   │   └── RateLimiterAspect.java     # 限流切面
│   │   │   │
│   │   │   ├── interceptor/                   # HTTP 拦截器
│   │   │   │   ├── RepeatSubmitInterceptor.java
│   │   │   │   └── JwtAuthenticationFilter.java
│   │   │   │
│   │   │   ├── util/                          # 工具类
│   │   │   │   ├── DateUtils.java
│   │   │   │   ├── StringUtils.java
│   │   │   │   ├── SecurityUtils.java
│   │   │   │   └── RedisUtils.java
│   │   │   │
│   │   │   └── common/                        # 共享基类与通用组件
│   │   │       ├── R.java                     # 统一响应包装器
│   │   │       ├── BaseEntity.java            # 实体基类
│   │   │       ├── BaseController.java        # 控制器基类
│   │   │       ├── PageQuery.java             # 分页查询基类
│   │   │       └── PageResult.java            # 分页结果
│   │   │
│   │   └── resources/
│   │       ├── application.yml                # 主配置文件
│   │       ├── application-dev.yml            # 开发环境配置
│   │       ├── application-prod.yml           # 生产环境配置
│   │       ├── application-test.yml           # 测试环境配置
│   │       ├── mapper/                        # MyBatis XML 映射文件
│   │       │   ├── SysUserMapper.xml
│   │       │   └── SysRoleMapper.xml
│   │       ├── static/                        # 静态资源
│   │       └── templates/                     # 模板文件（如代码生成器模板）
│   │
│   └── test/
│       └── java/com/{company}/{project}/
│           ├── controller/
│           │   └── SysUserControllerTest.java
│           └── service/
│               └── SysUserServiceImplTest.java
│
├── .gitignore
└── README.md
```

---

### 模式 B：多模块 Maven（适用于大型企业级项目）

> 参考 RuoYi、JeecgBoot 等项目的分层设计，实现模块间的职责分离和灵活组装。

```
project-root/
├── pom.xml                                    # 父 POM：统一依赖版本管理
│
├── project-admin/                             # 启动入口模块
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/{company}/{project}/
│       │   ├── {Project}Application.java     # Spring Boot 启动类
│       │   └── controller/                    # 所有 REST 控制器
│       │       ├── system/
│       │       │   ├── SysUserController.java
│       │       │   ├── SysRoleController.java
│       │       │   └── SysMenuController.java
│       │       └── monitor/
│       │           ├── SysLoginLogController.java
│       │           └── SysOperLogController.java
│       └── resources/
│           ├── application.yml
│           ├── application-dev.yml
│           ├── application-prod.yml
│           └── mapper/
│
├── project-common/                            # 共享基础模块
│   ├── pom.xml
│   └── src/main/java/com/{company}/{project}/common/
│       ├── core/
│       │   ├── R.java                         # 统一响应包装器
│       │   ├── BaseEntity.java                # 实体基类
│       │   ├── BaseController.java            # 控制器基类
│       │   ├── PageQuery.java                 # 分页查询基类
│       │   └── PageResult.java                # 分页结果
│       ├── constant/
│       │   ├── Constants.java
│       │   ├── HttpStatus.java
│       │   └── SecurityConstants.java
│       ├── enums/
│       │   ├── BusinessType.java
│       │   └── UserStatus.java
│       ├── exception/
│       │   ├── BusinessException.java
│       │   ├── ForbiddenException.java
│       │   └── GlobalExceptionHandler.java
│       ├── annotation/
│       │   ├── Log.java
│       │   ├── DataScope.java
│       │   └── RepeatSubmit.java
│       └── util/
│           ├── DateUtils.java
│           ├── StringUtils.java
│           └── SecurityUtils.java
│
├── project-framework/                         # 框架层模块
│   ├── pom.xml
│   └── src/main/java/com/{company}/{project}/framework/
│       ├── config/
│       │   ├── SecurityConfig.java
│       │   ├── RedisConfig.java
│       │   ├── MybatisPlusConfig.java
│       │   ├── CorsConfig.java
│       │   └── AsyncConfig.java
│       ├── security/
│       │   ├── JwtUtils.java
│       │   ├── JwtAuthenticationFilter.java
│       │   └── TokenService.java
│       ├── aspectj/
│       │   ├── LogAspect.java
│       │   └── DataScopeAspect.java
│       ├── interceptor/
│       │   ├── RepeatSubmitInterceptor.java
│       │   └── RateLimiterInterceptor.java
│       ├── manager/
│       │   └── AsyncManager.java
│       └── web/
│           └── ServiceHelper.java
│
├── project-system/                            # 系统管理业务模块
│   ├── pom.xml
│   └── src/main/java/com/{company}/{project}/system/
│       ├── controller/
│       │   └── ...（通常放在 admin 模块）
│       ├── domain/
│       │   ├── SysUser.java                   # 实体
│       │   ├── SysRole.java
│       │   ├── SysMenu.java
│       │   ├── SysUserRole.java
│       │   ├── vo/                            # 视图对象
│       │   │   ├── UserVO.java
│       │   │   ├── LoginVO.java
│       │   │   └── UserInfoVO.java
│       │   ├── dto/                           # 数据传输对象
│       │   │   ├── query/
│       │   │   │   └── UserQuery.java
│       │   │   └── req/
│       │   │       ├── UserCreateReq.java
│       │   │       └── UserUpdateReq.java
│       │   └── bo/
│       │       └── UserBO.java
│       ├── mapper/
│       │   ├── SysUserMapper.java
│       │   ├── SysRoleMapper.java
│       │   └── SysMenuMapper.java
│       └── service/
│           ├── ISysUserService.java
│           ├── ISysRoleService.java
│           ├── ISysMenuService.java
│           └── impl/
│               ├── SysUserServiceImpl.java
│               ├── SysRoleServiceImpl.java
│               └── SysMenuServiceImpl.java
│
└── project-business/                          # 业务扩展模块（可选）
    ├── pom.xml
    └── src/main/java/com/{company}/{project}/business/
        ├── controller/
        ├── domain/
        ├── mapper/
        └── service/
            └── impl/
```

---

## 命名规范速查表

### 文件命名

| 类别 | 规范 | 示例 |
|------|------|------|
| Controller | `XxxController` | `SysUserController`、`OrderController` |
| Service 接口 | `IXxxService` 或 `XxxService` | `ISysUserService`、`UserService` |
| Service 实现 | `XxxServiceImpl` | `SysUserServiceImpl` |
| Mapper | `XxxMapper` | `SysUserMapper` |
| Repository | `XxxRepository` | `UserRepository` |
| Entity/DO | 无后缀或 `Entity` | `SysUser`、`UserEntity` |
| DTO | `XxxDTO` 或 `XxxReq`/`XxxQuery` | `UserDTO`、`UserCreateReq`、`UserQuery` |
| VO | `XxxVO` | `UserVO`、`LoginVO` |
| BO | `XxxBO` | `UserBO` |
| 枚举 | 语义化名称 | `BusinessType`、`UserStatus` |
| 异常 | `XxxException` | `BusinessException`、`ForbiddenException` |
| 配置类 | `XxxConfig` 或 `XxxConfiguration` | `SecurityConfig`、`RedisConfig` |
| 工具类 | `XxxUtils` 或 `XxxUtil` | `DateUtils`、`StringUtils` |
| 切面 | `XxxAspect` | `LogAspect`、`DataScopeAspect` |
| 注解 | 语义化名称 | `@Log`、`@DataScope`、`@RateLimiter` |
| 拦截器 | `XxxInterceptor` 或 `XxxFilter` | `JwtAuthenticationFilter` |
| 测试类 | 被测类名 + `Test` | `SysUserServiceTest`、`SysUserControllerTest` |

### 变量命名

| 类别 | 规范 | 示例 |
|------|------|------|
| 字段/参数/局部变量 | camelCase | `userName`、`createTime`、`pageSize` |
| 常量 | UPPER_SNAKE_CASE | `MAX_STOCK_COUNT`、`DEFAULT_PAGE_SIZE` |
| 布尔字段 | **禁止** `is` 前缀 | `deleted`（非 `isDeleted`）、`admin`（非 `isAdmin`） |
| 包名 | 全小写无下划线 | `com.ruoyi.system.controller` |
| 泛型参数 | 单大写或语义后缀 | `T`、`E`、`K`、`V`、`RequestT` |
| 实体自增主键 | `id` 或 `XxxId` | `userId`、`orderId` |
| 外键字段 | 关联实体名 + `Id` | `roleId`、`deptId` |
| 逻辑删除字段 | `delFlag` 或 `deleted` | `delFlag`（0=正常, 1=删除） |
| 创建人/更新人 | `createBy` / `updateBy` | `createBy` |
| 创建时间/更新时间 | `createTime` / `updateTime` | `createTime` |

---

## DTO/VO/BO 分层定义

> 严格遵循阿里巴巴 Java 开发手册的分层领域模型规约。

| 对象 | 层级 | 用途 | 包路径 | 说明 |
|------|------|------|--------|------|
| DO（数据对象） | DAO | 与数据库表 1:1 映射 | `entity/` 或 `domain/` | 表名与类名对应，字段与列名对应 |
| DTO（数据传输对象） | Service | 层间或服务间传输 | `dto/` | 包含 `query/`（查询参数）、`req/`（请求体） |
| VO（视图对象） | Controller | 返回给前端的数据 | `vo/` | 可裁剪、组合 DO 中的字段 |
| BO（业务对象） | Service | 承载业务逻辑 | `bo/` | 可聚合多个 DO 的数据 |
| Query（查询对象） | Controller | 封装查询参数（>2 个参数时） | `dto/query/` | 避免 Controller 方法参数过多 |

### 数据流转

```
客户端请求 → Query/DTO → Controller → Service（使用 BO） → Mapper → DO（数据库）
数据库结果 → DO → Service（组装 BO/VO） → Controller → VO → 客户端响应
```

### 各层调用规则

```
Controller 层
  ├── 只负责接收请求参数和返回响应结果
  ├── 不编写业务逻辑（简单校验除外）
  ├── 使用 @Validated 进行参数校验
  └── 调用 Service 层

Service 层
  ├── 编写核心业务逻辑
  ├── 使用 @Transactional 管理事务
  ├── DO → VO / BO 的转换在此层完成
  └── 调用 Mapper 层

Mapper 层
  ├── 只负责数据库 CRUD 操作
  ├── 不编写业务逻辑
  └── SQL 语句在 XML 或注解中定义
```

---

## 方法命名规范

### CRUD 方法（MyBatis 风格）

| 操作 | 方法名 | 说明 |
|------|--------|------|
| 按 ID 查询 | `selectXxxById` | `selectUserById(Long userId)` |
| 查询列表 | `selectXxxList` | `selectUserList(UserQuery query)` |
| 分页查询 | `selectXxxPage` | `selectUserPage(UserQuery query)` |
| 新增 | `insertXxx` | `insertUser(SysUser user)` |
| 批量新增 | `batchInsertXxx` | `batchInsertUsers(List<SysUser> list)` |
| 修改 | `updateXxx` | `updateUser(SysUser user)` |
| 批量修改 | `batchUpdateXxx` | `batchUpdateUsers(List<SysUser> list)` |
| 按 ID 删除 | `deleteXxxById` | `deleteUserById(Long userId)` |
| 批量删除 | `deleteXxxByIds` | `deleteUserByIds(Long[] userIds)` |
| 统计数量 | `countXxx` | `countUser(UserQuery query)` |

### CRUD 方法（JPA 风格）

| 操作 | 方法名 | 说明 |
|------|--------|------|
| 按 ID 查询 | `findById` | `findById(Long id)` |
| 查询全部 | `findAll` | `findAll()` |
| 条件查询 | `findByXxx` | `findByUserName(String name)` |
| 分页查询 | `findAll(Specification, Pageable)` | JPA 规范分页 |
| 新增 | `save` | `save(UserEntity entity)` |
| 批量新增 | `saveAll` | `saveAll(List<UserEntity> list)` |
| 修改 | `save` | `save(UserEntity entity)`（有 ID 则更新） |
| 删除 | `deleteById` | `deleteById(Long id)` |
| 批量删除 | `deleteAllById` | `deleteAllById(List<Long> ids)` |
| 统计数量 | `count` | `count()` |

### Controller 方法

| 操作 | 方法名 | 说明 |
|------|--------|------|
| 分页列表 | `list` | `list(UserQuery query)` |
| 按 ID 查询 | `getInfo` 或 `detail` | `getInfo(@PathVariable Long userId)` |
| 新增 | `add` 或 `save` | `add(@Validated @RequestBody UserCreateReq req)` |
| 修改 | `edit` 或 `update` | `edit(@Validated @RequestBody UserUpdateReq req)` |
| 删除 | `remove` 或 `delete` | `remove(@PathVariable Long[] userIds)` |
| 导出 | `export` | `export(UserQuery query, HttpServletResponse response)` |
| 导入 | `importData` | `importData(MultipartFile file)` |
| 校验唯一性 | `checkXxxUnique` | `checkUserNameUnique(SysUser user)` |
| 校验允许操作 | `checkXxxAllowed` | `checkUserAllowed(SysUser user)` |

### Service 方法

| 操作 | 方法名 | 说明 |
|------|--------|------|
| 按 ID 查询 | `selectXxxById` | `selectUserById(Long userId)` |
| 查询列表 | `selectXxxList` | `selectUserList(UserQuery query)` |
| 分页查询 | `selectXxxPage` | `selectUserPage(UserQuery query)` |
| 新增 | `insertXxx` | `insertUser(SysUser user)` |
| 修改 | `updateXxx` | `updateUser(SysUser user)` |
| 删除 | `deleteXxxByIds` | `deleteUserByIds(Long[] userIds)` |
| 导出 | `exportXxx` | `exportUser(UserQuery query)` |
| 导入 | `importXxx` | `importUser(List<UserDTO> list)` |

---

## API 接口命名规范

### RESTful 风格（模块化资源路径）

```
GET    /system/user/list          # 分页列表
GET    /system/user/{userId}      # 按 ID 查询详情
POST   /system/user               # 新增用户
PUT    /system/user               # 修改用户
DELETE /system/user/{userIds}     # 删除用户（支持批量，逗号分隔）
PUT    /system/user/resetPwd      # 子操作：重置密码
PUT    /system/user/changeStatus  # 子操作：修改状态
POST   /system/user/export        # 导出用户数据
POST   /system/user/import        # 导入用户数据
```

### 接口路径规范

| 规则 | 说明 | 示例 |
|------|------|------|
| 模块/资源/操作 | 三级路径结构 | `/system/user/list` |
| 使用小写 | 路径全小写，单词用 `-` 分隔 | `/system/dict-type` |
| 复数形式 | 资源名用复数 | `/system/users`（RESTful 风格） |
| 单数形式 | RuoYi 风格用单数 | `/system/user`（RuoYi 惯例） |
| 动作接口 | 子资源路径表示操作 | `/system/user/export` |
| 批量操作 | 路径参数用逗号分隔 | `DELETE /system/user/1,2,3` |

### HTTP 状态码使用

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | 查询成功、修改成功、删除成功 |
| 201 | Created | 新增成功 |
| 400 | Bad Request | 参数校验失败 |
| 401 | Unauthorized | 未认证（Token 无效或过期） |
| 403 | Forbidden | 无权限访问 |
| 404 | Not Found | 资源不存在 |
| 500 | Internal Server Error | 服务器内部错误 |

> 注意：实际项目中通常使用统一响应体 `R<T>` 包装，HTTP 状态码始终返回 200，业务状态码在响应体的 `status` 字段中以六位字符串体现（如 `"000000"` 表示成功）。

---

## 代码编写规范

### 1. Controller 方法签名（RuoYi 风格）

```java
/**
 * 用户控制器
 *
 * @author author
 */
@RestController
@RequestMapping("/system/user")
@RequiredArgsConstructor
public class SysUserController extends BaseController {

    private final ISysUserService userService;
    private final ISysRoleService roleService;
    private final ISysMenuService menuService;

    /**
     * 获取用户列表（分页）
     */
    @RequiresPermissions("system:user:list")
    @GetMapping("/list")
    public TableDataInfo<SysUser> list(UserQuery query) {
        startPage(); // 开启分页（ThreadLocal）
        List<SysUser> list = userService.selectUserList(query);
        return getDataTable(list);
    }

    /**
     * 根据 ID 获取用户详情
     */
    @RequiresPermissions("system:user:query")
    @GetMapping(value = "/{userId}")
    public R<UserVO> getInfo(@PathVariable Long userId) {
        userService.checkUserAllowed(new SysUser(userId)); // 校验是否允许操作
        SysUser user = userService.selectUserById(userId);
        List<SysRole> roles = roleService.selectRolesByUserId(userId);
        UserVO vo = new UserVO();
        vo.setUser(user);
        vo.setRoles(roles);
        return R.ok(vo);
    }

    /**
     * 新增用户
     */
    @RequiresPermissions("system:user:add")
    @Log(title = "用户管理", businessType = BusinessType.INSERT)
    @PostMapping
    public R<Void> add(@Validated @RequestBody UserCreateReq req) {
        if (!userService.checkUserNameUnique(req.getUserName())) {
            return R.fail(StatusCodes.BAD_REQUEST, "新增用户 '" + req.getUserName() + "' 失败，用户名已存在");
        }
        SysUser user = BeanUtil.copyProperties(req, SysUser.class);
        user.setPassword(SecurityUtils.encryptPassword(user.getPassword()));
        return toAjax(userService.insertUser(user));
    }

    /**
     * 修改用户
     */
    @RequiresPermissions("system:user:edit")
    @Log(title = "用户管理", businessType = BusinessType.UPDATE)
    @PutMapping
    public R<Void> edit(@Validated @RequestBody UserUpdateReq req) {
        userService.checkUserAllowed(new SysUser(req.getUserId()));
        if (!userService.checkUserNameUnique(req.getUserName(), req.getUserId())) {
            return R.fail(StatusCodes.BAD_REQUEST, "修改用户 '" + req.getUserName() + "' 失败，用户名已存在");
        }
        SysUser user = BeanUtil.copyProperties(req, SysUser.class);
        return toAjax(userService.updateUser(user));
    }

    /**
     * 删除用户（支持批量）
     */
    @RequiresPermissions("system:user:remove")
    @Log(title = "用户管理", businessType = BusinessType.DELETE)
    @DeleteMapping("/{userIds}")
    public R<Void> remove(@PathVariable Long[] userIds) {
        return toAjax(userService.deleteUserByIds(userIds));
    }

    /**
     * 导出用户数据
     */
    @RequiresPermissions("system:user:export")
    @Log(title = "用户管理", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(UserQuery query, HttpServletResponse response) {
        List<UserDTO> list = userService.exportUser(query);
        ExcelUtil.exportExcel(list, "用户数据", UserDTO.class, response);
    }

    /**
     * 导入用户数据
     */
    @RequiresPermissions("system:user:import")
    @Log(title = "用户管理", businessType = BusinessType.IMPORT)
    @PostMapping("/importData")
    public R<Void> importData(MultipartFile file) throws Exception {
        List<UserDTO> list = ExcelUtil.importExcel(file.getInputStream(), UserDTO.class);
        String msg = userService.importUser(list);
        return R.ok(msg);
    }

    /**
     * 校验用户名是否唯一
     */
    @PostMapping("/checkUserNameUnique")
    public R<String> checkUserNameUnique(@RequestBody SysUser user) {
        return userService.checkUserNameUnique(user.getUserName())
            ? R.ok() : R.fail(StatusCodes.BAD_REQUEST, "用户名 '" + user.getUserName() + "' 已存在");
    }

    /**
     * 重置密码
     */
    @RequiresPermissions("system:user:resetPwd")
    @Log(title = "用户管理", businessType = BusinessType.UPDATE)
    @PutMapping("/resetPwd")
    public R<Void> resetPwd(@RequestBody SysUser user) {
        userService.checkUserAllowed(user);
        user.setPassword(SecurityUtils.encryptPassword(user.getPassword()));
        return toAjax(userService.resetPwd(user));
    }

    /**
     * 修改用户状态
     */
    @RequiresPermissions("system:user:edit")
    @Log(title = "用户管理", businessType = BusinessType.UPDATE)
    @PutMapping("/changeStatus")
    public R<Void> changeStatus(@RequestBody SysUser user) {
        userService.checkUserAllowed(user);
        return toAjax(userService.updateUserStatus(user));
    }
}
```

### 2. Service 接口 + 实现（Interface + Impl 模式）

```java
// ========== 接口定义 ==========
package com.ruoyi.system.service;

import java.util.List;

/**
 * 用户管理 服务接口
 *
 * @author author
 */
public interface ISysUserService {

    /**
     * 根据 ID 查询用户
     */
    SysUser selectUserById(Long userId);

    /**
     * 查询用户列表
     */
    List<SysUser> selectUserList(UserQuery query);

    /**
     * 新增用户
     */
    int insertUser(SysUser user);

    /**
     * 修改用户
     */
    int updateUser(SysUser user);

    /**
     * 批量删除用户
     */
    int deleteUserByIds(Long[] userIds);

    /**
     * 校验用户名是否唯一
     */
    boolean checkUserNameUnique(String userName);

    /**
     * 校验用户名是否唯一（排除指定 ID）
     */
    boolean checkUserNameUnique(String userName, Long userId);

    /**
     * 校验用户是否允许操作
     */
    void checkUserAllowed(SysUser user);

    /**
     * 导出用户列表
     */
    List<UserDTO> exportUser(UserQuery query);

    /**
     * 导入用户数据
     */
    String importUser(List<UserDTO> list);

    /**
     * 重置密码
     */
    int resetPwd(SysUser user);

    /**
     * 修改用户状态
     */
    int updateUserStatus(SysUser user);
}

// ========== 接口实现 ==========
package com.ruoyi.system.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 用户管理 服务实现
 *
 * @author author
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SysUserServiceImpl implements ISysUserService {

    private final SysUserMapper userMapper;
    private final SysUserRoleMapper userRoleMapper;

    @Override
    public SysUser selectUserById(Long userId) {
        return userMapper.selectUserById(userId);
    }

    @Override
    public List<SysUser> selectUserList(UserQuery query) {
        return userMapper.selectUserList(query);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int insertUser(SysUser user) {
        // 1. 新增用户信息
        int rows = userMapper.insertUser(user);
        // 2. 新增用户角色关联
        if (rows > 0 && user.getRoleIds() != null) {
            insertUserRole(user);
        }
        return rows;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int updateUser(SysUser user) {
        // 删除用户与角色关联
        userRoleMapper.deleteUserRoleByUserId(user.getUserId());
        // 新增用户与角色关联
        if (user.getRoleIds() != null) {
            insertUserRole(user);
        }
        return userMapper.updateUser(user);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int deleteUserByIds(Long[] userIds) {
        for (Long userId : userIds) {
            checkUserAllowed(new SysUser(userId));
        }
        return userMapper.deleteUserByIds(userIds);
    }

    @Override
    public boolean checkUserNameUnique(String userName) {
        return userMapper.countByUserName(userName) == 0;
    }

    @Override
    public boolean checkUserNameUnique(String userName, Long userId) {
        SysUser user = userMapper.selectByUserName(userName);
        if (user != null && !user.getUserId().equals(userId)) {
            return false;
        }
        return true;
    }

    @Override
    public void checkUserAllowed(SysUser user) {
        if (user.isAdmin()) {
            throw new BusinessException("不允许操作超级管理员用户");
        }
    }

    @Override
    public List<UserDTO> exportUser(UserQuery query) {
        List<SysUser> list = userMapper.selectUserList(query);
        return list.stream()
            .map(user -> BeanUtil.copyProperties(user, UserDTO.class))
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String importUser(List<UserDTO> list) {
        if (list == null || list.isEmpty()) {
            throw new BusinessException("导入用户数据不能为空");
        }
        int success = 0;
        int fail = 0;
        StringBuilder msgBuilder = new StringBuilder();
        for (UserDTO dto : list) {
            try {
                if (!checkUserNameUnique(dto.getUserName())) {
                    fail++;
                    msgBuilder.append("<br/>").append(fail).append("、账号 ").append(dto.getUserName()).append(" 已存在");
                    continue;
                }
                SysUser user = BeanUtil.copyProperties(dto, SysUser.class);
                user.setPassword(SecurityUtils.encryptPassword(dto.getPassword()));
                insertUser(user);
                success++;
            } catch (Exception e) {
                fail++;
                log.warn("导入用户失败：{}", dto.getUserName(), e);
            }
        }
        msgBuilder.insert(0, "导入结果：成功 " + success + " 条，失败 " + fail + " 条");
        return msgBuilder.toString();
    }

    @Override
    public int resetPwd(SysUser user) {
        return userMapper.resetPwd(user);
    }

    @Override
    public int updateUserStatus(SysUser user) {
        return userMapper.updateUserStatus(user);
    }

    /**
     * 新增用户角色关联
     */
    private void insertUserRole(SysUser user) {
        List<SysUserRole> list = user.getRoleIds().stream()
            .map(roleId -> new SysUserRole(user.getUserId(), roleId))
            .collect(Collectors.toList());
        userRoleMapper.batchUserRole(list);
    }
}
```

### 3. 实体类与 BaseEntity

```java
// ========== BaseEntity（实体基类） ==========
package com.ruoyi.common.core;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 实体基类
 *
 * @author author
 */
@Data
public class BaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 创建者 */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String createBy;

    /** 创建时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private LocalDateTime createTime;

    /** 更新者 */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String updateBy;

    /** 更新时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private LocalDateTime updateTime;

    /** 备注 */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String remark;

    /** 逻辑删除标志（0=正常, 1=删除） */
    @JsonIgnore
    @TableLogic
    private String delFlag;

    /** 搜索值（不映射数据库） */
    @TableField(exist = false)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String searchValue;
}

// ========== 业务实体（继承 BaseEntity） ==========
package com.ruoyi.system.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 用户实体
 *
 * @author author
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user")
public class SysUser extends BaseEntity {

    private static final long serialVersionUID = 1L;

    /** 用户 ID */
    @TableId(type = IdType.AUTO)
    private Long userId;

    /** 部门 ID */
    private Long deptId;

    /** 用户账号 */
    private String userName;

    /** 用户昵称 */
    private String nickName;

    /** 用户邮箱 */
    private String email;

    /** 手机号码 */
    private String phonenumber;

    /** 用户性别（0=男, 1=女, 2=未知） */
    private String sex;

    /** 用户头像 */
    private String avatar;

    /** 密码（加密后） */
    @JsonIgnore // 返回前端时隐藏密码
    private String password;

    /** 帐号状态（0=正常, 1=停用） */
    private String status;

    /** 删除标志（0=正常, 2=删除） */
    private String delFlag;

    /** 最后登录 IP */
    private String loginIp;

    /** 最后登录时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime loginDate;

    /** 部门对象（非数据库字段） */
    @TableField(exist = false)
    private SysDept dept;

    /** 角色 ID 列表（非数据库字段） */
    @TableField(exist = false)
    private List<Long> roleIds;

    /** 角色列表（非数据库字段） */
    @TableField(exist = false)
    private List<SysRole> roles;

    /**
     * 是否为管理员（admin 用户 ID=1）
     */
    public boolean isAdmin() {
        return this.userId != null && this.userId == 1L;
    }
}
```

### 4. 统一响应包装器 R<T>

```java
package com.ruoyi.common.core;

import lombok.Data;

import java.io.Serializable;

/**
 * 统一响应包装器（遵循 api-contract 接口契约规范）
 *
 * status: 六位字符串状态码，"000000" 表示成功
 * data: 业务数据
 * message: "success" 或错误描述
 *
 * @author author
 */
@Data
public class R<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 六位字符串状态码 */
    private String status;

    /** 业务数据 */
    private T data;

    /** 消息描述 */
    private String message;

    /** 状态码常量（遵循 api-contract 状态码规范） */
    public static final String SUCCESS = "000000";
    public static final String BAD_REQUEST = "000400";
    public static final String UNAUTHORIZED = "000401";
    public static final String FORBIDDEN = "000403";
    public static final String NOT_FOUND = "000404";
    public static final String INTERNAL_ERROR = "000500";
    public static final String PARTIAL_SUCCESS = "000001";

    // ========== 静态工厂方法 ==========

    /**
     * 成功（无数据）
     */
    public static <T> R<T> ok() {
        return restResult(null, SUCCESS, "success");
    }

    /**
     * 成功（带数据）
     */
    public static <T> R<T> ok(T data) {
        return restResult(data, SUCCESS, "success");
    }

    /**
     * 失败（自定义状态码和消息）
     */
    public static <T> R<T> fail(String status, String message) {
        return restResult(null, status, message);
    }

    /**
     * 判断是否成功
     */
    public boolean isSuccess() {
        return SUCCESS.equals(this.status);
    }

    /**
     * 判断是否失败
     */
    public boolean isFail() {
        return !isSuccess();
    }

    private static <T> R<T> restResult(T data, String status, String message) {
        R<T> r = new R<>();
        r.setStatus(status);
        r.setMessage(message);
        r.setData(data);
        return r;
    }
}
```

### 5. 分页封装（BaseController + TableDataInfo）

```java
// ========== BaseController ==========
package com.ruoyi.common.core;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

/**
 * 控制器基类
 *
 * @author author
 */
@Slf4j
public class BaseController {

    /**
     * 开启分页（在查询前调用）
     *
     * 使用 PageHelper 的 ThreadLocal 机制，自动拦截下一条 SQL 语句实现分页
     */
    protected void startPage() {
        PageDomain pageDomain = TableSupport.buildPageRequest();
        Integer pageNum = pageDomain.getPageNum();
        Integer pageSize = pageDomain.getPageSize();
        if (pageNum != null && pageSize != null) {
            PageHelper.startPage(pageNum, pageSize, pageDomain.getOrderBy());
        }
    }

    /**
     * 封装分页数据为 TableDataInfo
     */
    protected <T> TableDataInfo<T> getDataTable(List<T> list) {
        TableDataInfo<T> data = new TableDataInfo<>();
        PageInfo<T> pageInfo = new PageInfo<>(list);
        data.setStatus(R.SUCCESS);
        data.setMessage("success");
        data.setRows(list);
        data.setTotal(pageInfo.getTotal());
        return data;
    }

    /**
     * 响应操作结果（影响行数 > 0 则成功）
     */
    protected R<Void> toAjax(int rows) {
        return rows > 0 ? R.ok() : R.fail();
    }
}

// ========== TableDataInfo ==========
package com.ruoyi.common.core;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 分页数据对象
 *
 * @author author
 */
@Data
public class TableDataInfo<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 总记录数 */
    private long total;

    /** 列表数据 */
    private List<T> rows;

    /** 消息 */
    private String message;

    /** 六位字符串状态码 */
    private String status;
}
```

### 6. 全局异常处理器

```java
package com.ruoyi.common.exception;

import com.ruoyi.common.core.R;
import com.ruoyi.common.core.StatusCodes;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

/**
 * 全局异常处理器
 *
 * @author author
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public R<Void> handleBusinessException(BusinessException e, HttpServletRequest request) {
        log.error("业务异常: uri={}, message={}", request.getRequestURI(), e.getMessage());
        return R.fail(StatusCodes.INTERNAL_ERROR, e.getMessage());
    }

    /**
     * 权限校验异常（Spring Security）
     */
    @ExceptionHandler(AccessDeniedException.class)
    public R<Void> handleAccessDeniedException(AccessDeniedException e, HttpServletRequest request) {
        log.warn("权限不足: uri={}, message={}", request.getRequestURI(), e.getMessage());
        return R.fail(StatusCodes.FORBIDDEN, "没有权限，请联系管理员授权");
    }

    /**
     * 请求方式不支持
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public R<Void> handleHttpRequestMethodNotSupported(HttpRequestMethodNotSupportedException e, HttpServletRequest request) {
        log.warn("不支持的请求方式: uri={}, method={}", request.getRequestURI(), e.getMethod());
        return R.fail(StatusCodes.BAD_REQUEST, "不支持 '" + e.getMethod() + "' 请求");
    }

    /**
     * 参数校验异常（@Validated）
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public R<Void> handleValidException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldError() != null
            ? e.getBindingResult().getFieldError().getDefaultMessage()
            : "参数校验失败";
        log.warn("参数校验失败: {}", message);
        return R.fail(StatusCodes.BAD_REQUEST, message);
    }

    /**
     * 参数绑定异常
     */
    @ExceptionHandler(BindException.class)
    public R<Void> handleBindException(BindException e) {
        String message = e.getFieldError() != null
            ? e.getFieldError().getDefaultMessage()
            : "参数绑定失败";
        log.warn("参数绑定失败: {}", message);
        return R.fail(StatusCodes.BAD_REQUEST, message);
    }

    /**
     * 文件上传大小超出限制
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public R<Void> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException e) {
        log.warn("文件上传大小超出限制: {}", e.getMessage());
        return R.fail(StatusCodes.BAD_REQUEST, "上传文件大小超出限制");
    }

    /**
     * 运行时异常
     */
    @ExceptionHandler(RuntimeException.class)
    public R<Void> handleRuntimeException(RuntimeException e, HttpServletRequest request) {
        log.error("运行时异常: uri={}", request.getRequestURI(), e);
        return R.fail(StatusCodes.INTERNAL_ERROR, "系统内部错误，请联系管理员");
    }

    /**
     * 系统异常（兜底）
     */
    @ExceptionHandler(Exception.class)
    public R<Void> handleException(Exception e, HttpServletRequest request) {
        log.error("系统异常: uri={}", request.getRequestURI(), e);
        return R.fail(StatusCodes.INTERNAL_ERROR, "系统繁忙，请稍后重试");
    }
}
```

### 7. 日志规范

```java
import lombok.extern.slf4j.Slf4j;

/**
 * 日志编写规范示例
 *
 * 1. 使用 @Slf4j 注解（Lombok），不要手动创建 Logger 实例
 * 2. 使用参数化日志：log.info("msg {}", var)，不要用字符串拼接
 * 3. 异常日志：log.error("msg", throwable)，Throwable 作为最后一个参数
 * 4. 不要使用 log.info 打印大对象或集合的 toString()
 * 5. 日志级别使用规范：
 *    - ERROR：影响系统正常运行的错误，需要立即关注
 *    - WARN：潜在问题，不影响主流程，但需要关注
 *    - INFO：关键业务节点，如登录、下单、支付
 *    - DEBUG：调试信息，生产环境关闭
 *    - TRACE：最详细的跟踪信息，仅在开发时使用
 */
@Slf4j
@Service
public class SysUserServiceImpl implements ISysUserService {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int insertUser(SysUser user) {
        // ✅ 正确：使用参数化日志
        log.info("新增用户: userName={}, deptId={}", user.getUserName(), user.getDeptId());

        try {
            int rows = userMapper.insertUser(user);
            log.info("新增用户成功: userId={}, rows={}", user.getUserId(), rows);
            return rows;
        } catch (Exception e) {
            // ✅ 正确：异常作为最后一个参数
            log.error("新增用户失败: userName={}", user.getUserName(), e);
            throw e;
        }
    }

    public void wrongExamples() {
        String name = "admin";

        // ❌ 错误：字符串拼接方式
        log.info("用户登录: userName=" + name);
        log.info("用户登录: userName=".concat(name));

        // ❌ 错误：使用 toString() 打印大对象
        List<SysUser> list = userMapper.selectUserList(new UserQuery());
        log.info("查询结果: {}", list.toString());

        // ❌ 错误：异常放在非最后一个参数位置
        try {
            // some code
        } catch (Exception e) {
            log.error("异常: {}, message={}", e, "操作失败"); // 错误！
        }

        // ✅ 正确写法
        log.info("用户登录: userName={}", name);
        log.info("查询结果: count={}", list.size());
        log.error("操作失败: message={}", "操作失败", e);
    }
}
```

---

## 数据库字段映射

### 字段命名规则

数据库字段使用 snake_case，Java 实体字段使用 camelCase，MyBatis-Plus 自动转换。

```
数据库字段        →  Java 字段
─────────────────────────────────────
user_id          →  userId
user_name        →  userName
nick_name        →  nickName
email            →  email
phonenumber      →  phonenumber
create_by        →  createBy
create_time      →  createTime
update_by        →  updateBy
update_time      →  updateTime
del_flag         →  delFlag
is_admin         →  admin          （去掉 is_ 前缀）
is_deleted       →  deleted        （去掉 is_ 前缀）
login_ip         →  loginIp
login_date       →  loginDate
dept_id          →  deptId
role_id          →  roleId
```

### 字段映射规则总结

| 规则 | 说明 | 示例 |
|------|------|------|
| 基本转换 | snake_case → camelCase | `user_name` → `userName` |
| 去掉 `is_` 前缀 | 布尔字段去掉 `is_` | `is_admin` → `admin` |
| 保持缩写 | 常见缩写保持原样 | `ip`、`id`、`url` |
| 表名 | snake_case，与实体类对应 | `sys_user` ↔ `SysUser` |

### 数据库表设计规范

| 规则 | 说明 | 示例 |
|------|------|------|
| 表名前缀 | 按模块添加前缀 | `sys_user`、`order_info`、`product_category` |
| 主键 | `bigint` 自增或雪花算法 | `user_id BIGINT NOT NULL AUTO_INCREMENT` |
| 审计字段 | 每张表必须包含 | `create_by`, `create_time`, `update_by`, `update_time`, `del_flag` |
| 逻辑删除 | 使用 `del_flag` 字段 | `del_flag CHAR(1) DEFAULT '0'` |
| 字段注释 | 每个字段必须有注释 | `COMMENT '用户账号'` |
| 索引命名 | `idx_表名_字段名` | `idx_sys_user_user_name` |
| 唯一索引 | `uk_表名_字段名` | `uk_sys_user_user_name` |

```sql
-- 用户表建表示例
CREATE TABLE sys_user (
    user_id       BIGINT       NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    dept_id       BIGINT       DEFAULT NULL              COMMENT '部门ID',
    user_name     VARCHAR(30)  NOT NULL                  COMMENT '用户账号',
    nick_name     VARCHAR(30)  NOT NULL                  COMMENT '用户昵称',
    email         VARCHAR(50)  DEFAULT ''                COMMENT '邮箱',
    phonenumber   VARCHAR(11)  DEFAULT ''                COMMENT '手机号码',
    sex           CHAR(1)      DEFAULT '0'               COMMENT '性别（0=男 1=女 2=未知）',
    avatar        VARCHAR(200) DEFAULT ''                COMMENT '头像地址',
    password      VARCHAR(100) DEFAULT ''                COMMENT '密码',
    status        CHAR(1)      DEFAULT '0'               COMMENT '帐号状态（0=正常 1=停用）',
    del_flag      CHAR(1)      DEFAULT '0'               COMMENT '删除标志（0=存在 2=删除）',
    login_ip      VARCHAR(128) DEFAULT ''                COMMENT '最后登录IP',
    login_date    DATETIME                               COMMENT '最后登录时间',
    create_by     VARCHAR(64)  DEFAULT ''                COMMENT '创建者',
    create_time   DATETIME                               COMMENT '创建时间',
    update_by     VARCHAR(64)  DEFAULT ''                COMMENT '更新者',
    update_time   DATETIME                               COMMENT '更新时间',
    remark        VARCHAR(500) DEFAULT NULL              COMMENT '备注',
    PRIMARY KEY (user_id)
) ENGINE=InnoDB AUTO_INCREMENT=100 COMMENT='用户信息表';

-- 索引
CREATE UNIQUE INDEX uk_sys_user_user_name ON sys_user (user_name);
CREATE INDEX idx_sys_user_dept_id ON sys_user (dept_id);
```

---

## 环境配置规范

### 配置文件层级

```
application.yml                # 主配置（公共配置 + profile 激活）
application-dev.yml            # 开发环境
application-prod.yml           # 生产环境
application-test.yml           # 测试环境
```

### 主配置 application.yml

```yaml
# 应用配置
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  profiles:
    active: dev
  application:
    name: project-name
  jackson:
    date-format: yyyy-MM-dd HH:mm:ss
    time-zone: Asia/Shanghai
    serialization:
      write-dates-as-timestamps: false

# MyBatis-Plus 配置
mybatis-plus:
  mapper-locations: classpath*:mapper/**/*.xml
  type-aliases-package: com.ruoyi.system.domain
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.slf4j.Slf4jImpl
  global-config:
    db-config:
      id-type: auto
      logic-delete-field: delFlag
      logic-delete-value: "2"
      logic-not-delete-value: "0"

# 日志配置
logging:
  level:
    com.ruoyi: debug
    org.springframework: warn

# PageHelper 分页插件
pagehelper:
  helper-dialect: mysql
  reasonable: true
  support-methods-arguments: true
```

### 开发环境 application-dev.yml

```yaml
# 数据源配置
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/ry-vue?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8
    username: root
    password: root

  # Redis 配置
  data:
    redis:
      host: localhost
      port: 6379
      password:
      database: 0

# 令牌配置
token:
  header: Authorization
  secret: abcdefghijklmnopqrstuvwxyz
  expireTime: 720
```

### 生产环境 application-prod.yml

```yaml
# 数据源配置（生产环境）
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://prod-db-server:3306/ry-vue?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

  # Redis 配置
  data:
    redis:
      host: ${REDIS_HOST}
      port: 6379
      password: ${REDIS_PASSWORD}
      database: 0

# 日志级别（生产环境只记录 warn 以上）
logging:
  level:
    com.ruoyi: info
    org.springframework: warn
```

---

## 接口契约集成（api-contract）

> 与 `api-contract` skill 配合使用，确保前后端接口定义一致。

### 契约文件说明

项目中应维护 `api-contract.json` 接口契约文件，作为前后端接口的唯一真实来源。该文件由 `api-contract` skill 定义和管理，包含所有接口的路径、请求参数、响应格式等信息。

### 统一响应格式

所有接口遵循 api-contract 的统一响应格式，使用 `R<T>` 包装器：

```java
/**
 * 统一响应包装器（遵循 api-contract 接口契约规范）
 * status: 六位字符串状态码，"000000" 表示成功
 * data: 业务数据
 * message: "success" 或错误描述
 */
public class R<T> implements Serializable {
    private String status;
    private T data;
    private String message;

    public static final String SUCCESS = "000000";

    public static <T> R<T> ok() {
        return restResult(null, SUCCESS, "success");
    }

    public static <T> R<T> ok(T data) {
        return restResult(data, SUCCESS, "success");
    }

    public static <T> R<T> fail(String status, String message) {
        return restResult(null, status, message);
    }
}
```

### 状态码规范

状态码遵循六位字符串分层编码规范，参考 `d:/soft/work/skills/api-contract/spec/status-codes.json`：

```java
/**
 * 状态码常量（遵循 api-contract 状态码规范）
 * 参考: d:/soft/work/skills/api-contract/spec/status-codes.json
 */
public final class StatusCodes {
    /** 成功 */
    public static final String SUCCESS = "000000";
    /** 请求参数错误 */
    public static final String BAD_REQUEST = "000400";
    /** 未登录或 Token 失效 */
    public static final String UNAUTHORIZED = "000401";
    /** 无权限访问 */
    public static final String FORBIDDEN = "000403";
    /** 接口不存在或资源不存在 */
    public static final String NOT_FOUND = "000404";
    /** 服务器内部错误 */
    public static final String INTERNAL_ERROR = "000500";
    /** 成功但需调用其他接口（半成功） */
    public static final String PARTIAL_SUCCESS = "000001";
    // 业务错误码：101xxx, 102xxx 等
    // 前两位 = 业务模块编号，第三位 = 调用链层级，后三位 = 具体错误原因
}
```

### 数据约定

| 接口类型 | `data` 字段内容 | 说明 |
|----------|-----------------|------|
| GET 详情 | 业务对象（VO） | `R<UserVO>` |
| GET /list | `PageResult<T>` | 包含 `list` 和 `pageInfo` |
| POST / PUT / DELETE | `true` / `false` | 操作结果布尔值 |

### 路径参数转换

api-contract 使用 `:paramName` 风格路径参数，Spring Boot 使用 `{paramName}` 风格，需进行转换：

| api-contract | Spring Boot |
|--------------|-------------|
| `/user/:userId` | `/user/{userId}` |
| `/order/:orderId/item/:itemId` | `/order/{orderId}/item/{itemId}` |

### 分页响应格式

api-contract 的分页响应统一使用 `PageResult<T>` 包装：

```java
/**
 * 分页响应结果（遵循 api-contract 分页规范）
 */
public class PageResult<T> implements Serializable {
    /** 数据列表 */
    private List<T> list;
    /** 分页信息 */
    private PageInfo pageInfo;
}

/**
 * 分页信息
 */
public class PageInfo implements Serializable {
    /** 当前页码 */
    private Integer pageNum;
    /** 每页条数 */
    private Integer pageSize;
    /** 总记录数 */
    private Long total;
    /** 总页数 */
    private Integer totalPages;
}
```

### 使用 generate-backend.js 生成代码

```bash
# 从 api-contract.json 生成 Java 后端代码
node api-contract/tools/generate-backend.js api-contract.json --lang java --output src/
#
# 生成内容：
# - common/R.java              → 统一响应包装器
# - common/PageRequest.java    → 分页请求
# - common/PageResult.java     → 分页响应
# - {Module}Controller.java    → 控制器
# - {Module}Service.java       → 服务接口
```

---

## 工具命令

### 初始化项目骨架

```bash
# 单模块模式（默认）
node tools/scaffold.js <项目路径>

# 多模块 Maven 模式
node tools/scaffold.js <项目路径> --mode=multimodule

# 指定业务模块
node tools/scaffold.js <项目路径> --modules=user,order,product
```

### 验证项目结构

```bash
node tools/validate.js <项目路径>
```

---

## 常见框架对比

| 特性 | RuoYi | JeecgBoot | Pig | EL-ADMIN |
|------|-------|-----------|-----|----------|
| 分层 | admin/common/framework/system | 后端单体/微服务 | 注册中心 + 网关 + 认证 + 业务 | 后端单体/微服务 |
| ORM | MyBatis | MyBatis-Plus | MyBatis-Plus | JPA / MyBatis-Plus |
| 权限 | Spring Security | Shiro | Spring Security | Spring Security |
| 代码生成 | 内置 | 内置（低代码） | 无 | 内置 |
| 前端分离 | Vue 2/3 | Vue 3 / React | Vue 3 | Vue 3 |
| 适用场景 | 通用后台 | 低代码平台 | 微服务 | 通用后台 |

---

## 注意事项

1. **禁止使用 `is` 前缀命名布尔字段**：MyBatis-Plus 自动生成 getter 时会去掉 `is` 前缀，导致映射异常。
2. **Service 接口必须以 `I` 开头或直接命名**：`ISysUserService` 或 `UserService`，实现类必须以 `ServiceImpl` 结尾。
3. **Controller 不允许出现 `try-catch`**：异常统一由全局异常处理器处理。
4. **Mapper XML 文件路径**：必须放在 `resources/mapper/` 下，路径与 Mapper 接口包路径一致。
5. **事务注解只加在 Service 层**：`@Transactional` 应加在 Service 实现类的 public 方法上。
6. **@MapperScan 必须配置**：在启动类或配置类上指定 Mapper 接口扫描路径。
7. **分页插件必须配置**：MyBatis-Plus 需要配置 `MybatisPlusConfig` 注册 `PaginationInnerInterceptor`。
8. **枚举类型推荐使用 `@EnumValue` 注解**：MyBatis-Plus 枚举映射需要在值字段上添加 `@EnumValue`。
