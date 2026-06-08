# Node.js Project Standard

Node.js 后端项目工程规范 Skill（基于 NestJS 框架），用于在 Claude 开发过程中自动按规范放置文件、命名变量，并生成标准化的项目骨架。基于 NestJS 官方示例、nestjs-realworld-example-app、awesome-nest-boilerplate、Midway.js 等大型商用 Node.js 项目的最佳实践总结而成。

---

## 技术栈基线

| 类别 | 推荐方案 |
|------|----------|
| 框架 | NestJS 10+ |
| 语言 | TypeScript 5.x |
| ORM | TypeORM / Prisma |
| 包管理器 | pnpm |
| API 文档 | @nestjs/swagger (Swagger) |
| 验证 | class-validator + class-transformer |
| 认证 | @nestjs/passport (JWT) |
| 测试 | Jest + Supertest |
| 微服务 | @nestjs/microservices |

---

## 项目结构规范

### 模式 A：单应用 Feature-Based（推荐，适用于中小型项目）

```
src/
├── main.ts                          # 启动入口，全局管道/过滤器/拦截器
├── app.module.ts                    # 根模块
│
├── modules/                         # 业务功能模块
│   ├── auth/                        # 认证模块
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   └── guards/
│   │       ├── jwt-auth.guard.ts
│   │       └── local-auth.guard.ts
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   └── query-user.dto.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   │
│   ├── orders/
│   │   ├── orders.module.ts
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   ├── commands/
│   │   │   └── create-order.command.ts
│   │   ├── events/
│   │   │   └── order-created.event.ts
│   │   ├── dto/
│   │   │   ├── create-order.dto.ts
│   │   │   └── query-order.dto.ts
│   │   └── entities/
│   │       └── order.entity.ts
│   │
│   └── ...                          # 其他业务模块
│
├── common/                          # 跨模块共享
│   ├── decorators/
│   │   ├── roles.decorator.ts
│   │   ├── current-user.decorator.ts
│   │   └── public.decorator.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── guards/
│   │   └── roles.guard.ts
│   ├── interceptors/
│   │   ├── transform.interceptor.ts
│   │   └── logging.interceptor.ts
│   ├── middleware/
│   │   └── correlation-id.middleware.ts
│   ├── pipes/
│   │   └── parse-date.pipe.ts
│   └── dto/
│       ├── page-meta.dto.ts
│       ├── page.dto.ts
│       └── response.dto.ts
│
├── config/                          # 配置
│   ├── app.config.ts
│   ├── database.config.ts
│   └── auth.config.ts
│
├── database/                        # 数据库
│   ├── migrations/
│   └── seeds/
│
└── shared/                          # 共享工具
    ├── utils/
    │   ├── hash.util.ts
    │   └── pagination.util.ts
    └── interfaces/
        ├── pagination.interface.ts
        └── request-with-user.interface.ts
```

### 模式 B：Nx Monorepo（适用于企业级多应用）

```
project-root/
├── apps/
│   ├── api-gateway/                 # 主 HTTP API
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   └── app/
│   │   ├── tsconfig.app.json
│   │   └── project.json
│   │
│   ├── auth-service/                # 认证微服务
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   └── app/
│   │   ├── tsconfig.app.json
│   │   └── project.json
│   │
│   └── worker/                      # 后台任务
│       ├── src/
│       │   ├── main.ts
│       │   └── app/
│       ├── tsconfig.app.json
│       └── project.json
│
├── libs/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── feature/             # 控制器、服务
│   │   │   │   ├── src/
│   │   │   │   └── project.json
│   │   │   └── data-access/         # DTO、实体
│   │   │       ├── src/
│   │   │       └── project.json
│   │   └── core/
│   │       └── feature/             # 核心配置
│   │           ├── src/
│   │           └── project.json
│   │
│   └── shared/
│       └── models/                  # 共享 DTO/接口
│           ├── src/
│           └── project.json
│
├── nx.json
├── tsconfig.base.json
├── package.json
└── pnpm-workspace.yaml
```

---

## 命名规范速查表

### 文件命名

所有文件使用 **kebab-case** + 类型后缀。

| 类别 | 规范 | 示例 |
|------|------|------|
| 模块 | `*.module.ts` | `users.module.ts`、`auth.module.ts` |
| 控制器 | `*.controller.ts` | `users.controller.ts`、`auth.controller.ts` |
| 服务 | `*.service.ts` | `users.service.ts`、`prisma.service.ts` |
| DTO | `*.dto.ts` | `create-user.dto.ts`、`query-user.dto.ts` |
| 实体 | `*.entity.ts` | `user.entity.ts`、`order.entity.ts` |
| Guard | `*.guard.ts` | `jwt-auth.guard.ts`、`roles.guard.ts` |
| Interceptor | `*.interceptor.ts` | `transform.interceptor.ts`、`logging.interceptor.ts` |
| Filter | `*.filter.ts` | `http-exception.filter.ts` |
| Pipe | `*.pipe.ts` | `parse-date.pipe.ts`、`validation.pipe.ts` |
| Middleware | `*.middleware.ts` | `correlation-id.middleware.ts` |
| Decorator | `*.decorator.ts` | `roles.decorator.ts`、`current-user.decorator.ts` |
| Strategy | `*.strategy.ts` | `jwt.strategy.ts`、`local.strategy.ts` |
| Config | `*.config.ts` | `app.config.ts`、`database.config.ts` |
| 测试 | `*.spec.ts` | `users.service.spec.ts`、`auth.controller.spec.ts` |
| E2E 测试 | `*.e2e-spec.ts` | `app.e2e-spec.ts`、`auth.e2e-spec.ts` |
| Command | `*.command.ts` | `create-user.command.ts` |
| Event | `*.event.ts` | `user-created.event.ts`、`order-paid.event.ts` |

### 类命名

所有类使用 **PascalCase** + 类型后缀。

| 类别 | 规范 | 示例 |
|------|------|------|
| Module | `[Feature]Module` | `UsersModule`、`AuthModule`、`OrdersModule` |
| Controller | `[Feature]Controller` | `UsersController`、`AuthController` |
| Service | `[Feature]Service` | `UsersService`、`AuthService`、`PrismaService` |
| DTO | `[Action][Feature]Dto` | `CreateUserDto`、`QueryUserDto`、`UpdateUserDto` |
| Entity | `[Feature]`（无后缀） | `User`、`Article`、`Order` |
| Guard | `[Feature]Guard` | `JwtAuthGuard`、`RolesGuard` |
| Interceptor | `[Feature]Interceptor` | `TransformInterceptor`、`LoggingInterceptor` |
| Filter | `[Feature]Filter` | `HttpExceptionFilter` |
| Pipe | `[Feature]Pipe` | `ParseDatePipe`、`ValidationPipe` |
| Strategy | `[Feature]Strategy` | `JwtStrategy`、`LocalStrategy` |
| Command | `[Action][Feature]Command` | `CreateUserCommand` |
| Event | `[Feature][PastTense]Event` | `UserCreatedEvent`、`OrderPaidEvent` |

### 方法命名

| 类别 | 规范 | 示例 |
|------|------|------|
| CRUD 操作 | 标准动词 | `create`、`findAll`、`findOne`、`update`、`remove` |
| 认证操作 | 业务动词 | `login`、`register`、`refreshToken`、`logout` |
| 查询操作 | `find/by` 前缀 | `findByEmail`、`findByIds`、`findByCondition` |
| 批量操作 | `bulk/action` | `bulkCreate`、`bulkRemove` |
| 事件处理 | `handle/on` | `handleUserCreated`、`onModuleInit` |

### 变量命名

| 类别 | 规范 | 示例 |
|------|------|------|
| 变量/参数 | camelCase | `userCount`、`isEmailVerified`、`maxRetries` |
| 常量 | UPPER_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS`、`ROLES_KEY`、`DEFAULT_PAGE_SIZE` |
| 枚举名 | PascalCase | `UserRole`、`ErrorCode`、`OrderStatus` |
| 枚举值 | UPPER_SNAKE_CASE | `ADMIN`、`USER_NOT_FOUND`、`PENDING_PAYMENT` |
| API 端点 | 复数名词 kebab-case | `/api/v1/users`、`/api/v1/user-profiles`、`/api/v1/orders` |

---

## DTO 组合模式

NestJS 提供了强大的 DTO 组合工具，通过 `@nestjs/swagger` 和 `@nestjs/mapped-types` 实现 DTO 的复用。

### PartialType — 所有字段变为可选（用于 UPDATE）

```typescript
import { PartialType } from '@nestjs/swagger'
import { CreateUserDto } from './create-user.dto'

export class UpdateUserDto extends PartialType(CreateUserDto) {}
// CreateUserDto 的所有字段都变为可选
```

### OmitType — 移除指定字段

```typescript
import { OmitType } from '@nestjs/swagger'
import { CreateUserDto } from './create-user.dto'

export class RegisterDto extends OmitType(CreateUserDto, ['role'] as const) {}
// 移除 role 字段，注册时不允许指定角色
```

### PickType — 选取指定字段

```typescript
import { PickType } from '@nestjs/swagger'
import { CreateUserDto } from './create-user.dto'

export class LoginDto extends PickType(CreateUserDto, ['email', 'password'] as const) {}
// 只保留 email 和 password 字段
```

### IntersectionType — 合并多个 DTO

```typescript
import { IntersectionType } from '@nestjs/swagger'

export class UserWithProfileDto extends IntersectionType(UserDto, ProfileDto) {}
// 合并 UserDto 和 ProfileDto 的所有字段
```

---

## 代码编写规范

### 1. main.ts 启动入口

```typescript
import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = new Logger('Bootstrap')

  // 全局路由前缀
  app.setGlobalPrefix('api/v1')

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // 自动剥离未声明的属性
      forbidNonWhitelisted: true, // 未声明属性直接报错
      transform: true,            // 自动类型转换
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter())

  // 全局响应转换拦截器
  app.useGlobalInterceptors(new TransformInterceptor())

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })

  // Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('API 文档')
    .setDescription('项目 API 接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', '认证相关')
    .addTag('users', '用户管理')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.PORT || 3000
  await app.listen(port)
  logger.log(`应用已启动: http://localhost:${port}`)
  logger.log(`Swagger 文档: http://localhost:${port}/api/docs`)
}

bootstrap()
```

### 2. 模块定义（Module）

```typescript
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from './modules/users/users.module'
import { AuthModule } from './modules/auth/auth.module'
import { OrdersModule } from './modules/orders/orders.module'
import { DatabaseConfig } from './config/database.config'

@Module({
  imports: [
    // 数据库配置
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),

    // 业务模块
    AuthModule,
    UsersModule,
    OrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

### 3. 实体定义（Entity + TypeORM）

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm'
import { Exclude } from 'class-transformer'
import { Order } from '../../orders/entities/order.entity'

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  EDITOR = 'EDITOR',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ length: 50 })
  name: string

  @Index({ unique: true })
  @Column({ length: 100 })
  email: string

  @Column()
  @Exclude()
  password: string

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole

  @Column({ default: true })
  isActive: boolean

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[]

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date
}
```

### 4. DTO 定义（class-validator + Swagger）

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator'
import { UserRole } from '../entities/user.entity'

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: '张三' })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  @MinLength(2, { message: '用户名至少 2 个字符' })
  name: string

  @ApiProperty({ description: '邮箱', example: 'zhangsan@example.com' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string

  @ApiProperty({ description: '密码', example: 'P@ssw0rd', minLength: 8 })
  @IsString()
  @MinLength(8, { message: '密码至少 8 个字符' })
  password: string

  @ApiPropertyOptional({ description: '角色', enum: UserRole, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole

  @ApiPropertyOptional({ description: '是否激活', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
```

### 5. 控制器（Controller）

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { QueryUserDto } from './dto/query-user.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { Public } from '../../common/decorators/public.decorator'
import { UserRole } from './entities/user.entity'

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 409, description: '邮箱已存在' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @Get()
  @ApiOperation({ summary: '查询用户列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  findAll(@Query() queryUserDto: QueryUserDto) {
    return this.usersService.findAll(queryUserDto)
  }

  @Get(':id')
  @ApiOperation({ summary: '查询单个用户' })
  @ApiParam({ name: 'id', description: '用户 UUID' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id)
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '更新用户' })
  @ApiParam({ name: 'id', description: '用户 UUID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除用户' })
  @ApiParam({ name: 'id', description: '用户 UUID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id)
  }
}
```

### 6. 服务（Service + Repository 模式）

```typescript
import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { QueryUserDto } from './dto/query-user.dto'
import { PageDto } from '../../common/dto/page.dto'
import { PageMetaDto } from '../../common/dto/page-meta.dto'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    })

    if (existing) {
      throw new ConflictException('邮箱已存在')
    }

    const user = this.userRepository.create(createUserDto)
    const saved = await this.userRepository.save(user)
    this.logger.log(`用户创建成功: ${saved.id}`)
    return saved
  }

  async findAll(queryDto: QueryUserDto): Promise<PageDto<User>> {
    const { page, limit, keyword, role, isActive } = queryDto

    const queryBuilder = this.userRepository.createQueryBuilder('user')

    if (keyword) {
      queryBuilder.where(
        '(user.name LIKE :keyword OR user.email LIKE :keyword)',
        { keyword: `%${keyword}%` },
      )
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role })
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive })
    }

    queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    const [items, total] = await queryBuilder.getManyAndCount()

    const meta = new PageMetaDto({ page, limit, total })
    return new PageDto(items, meta)
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException(`用户 ${id} 不存在`)
    }
    return user
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } })
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id)
    Object.assign(user, updateUserDto)
    return this.userRepository.save(user)
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id)
    await this.userRepository.softRemove(user)
    this.logger.log(`用户已删除: ${id}`)
  }
}
```

### 7. 统一响应包装（TransformInterceptor）

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ApiResponse } from '../dto/response.dto'

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        status: '000000',
        data,
        message: 'success',
      })),
    )
  }
}
```

### 8. 全局异常过滤器（HttpExceptionFilter）

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { ApiResponse } from '../dto/response.dto'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : '服务器内部错误'

    // 遵循 api-contract 统一错误响应格式
    const errorResponse: ApiResponse = {
      status: status === 401 ? '000401'
            : status === 403 ? '000403'
            : status === 404 ? '000404'
            : '000500',
      data: null,
      message: Array.isArray(message) ? message.join(', ') : (typeof message === 'string' ? message : (message as any).message),
    }

    this.logger.error(
      `${request.method} ${request.url} ${status}`,
      exception instanceof Error ? exception.stack : '',
    )

    response.status(status).json(errorResponse)
  }
}
```

### 9. Guard（JwtAuthGuard + RolesGuard）

```typescript
// guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    return super.canActivate(context)
  }
}

// guards/roles.guard.ts — 位于 common/guards/
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { UserRole } from '../../modules/users/entities/user.entity'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()
    return requiredRoles.some((role) => user?.role === role)
  }
}
```

### 10. 自定义装饰器

```typescript
// decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common'
import { UserRole } from '../../modules/users/entities/user.entity'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)

// decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_KEY = 'isPublic'
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)

// decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user
    return data ? user?.[data] : user
  },
)
```

### 11. 分页 DTO

```typescript
// common/dto/page-meta.dto.ts
import { ApiProperty } from '@nestjs/swagger'

export interface PageMetaDtoParams {
  page: number
  limit: number
  total: number
}

export class PageMetaDto {
  @ApiProperty()
  readonly page: number

  @ApiProperty()
  readonly limit: number

  @ApiProperty()
  readonly total: number

  @ApiProperty()
  readonly totalPages: number

  @ApiProperty()
  readonly hasPrevious: boolean

  @ApiProperty()
  readonly hasNext: boolean

  constructor({ page, limit, total }: PageMetaDtoParams) {
    this.page = page
    this.limit = limit
    this.total = total
    this.totalPages = Math.ceil(total / limit)
    this.hasPrevious = page > 1
    this.hasNext = page < this.totalPages
  }
}

// common/dto/page.dto.ts
import { ApiProperty } from '@nestjs/swagger'
import { PageMetaDto } from './page-meta.dto'

export class PageDto<T> {
  @ApiProperty({ isArray: true })
  readonly items: T[]

  @ApiProperty()
  readonly meta: PageMetaDto

  constructor(items: T[], meta: PageMetaDto) {
    this.items = items
    this.meta = meta
  }
}

// common/dto/response.dto.ts
// 响应格式遵循 api-contract 接口契约规范
// 参考: d:/soft/work/skills/api-contract/spec/example-api.json
import { ApiProperty } from '@nestjs/swagger'

export interface ApiResponse<T = any> {
  @ApiProperty({ example: '000000', description: '状态码，000000 表示成功' })
  status: string

  @ApiProperty({ description: '业务数据' })
  data: T

  @ApiProperty({ example: 'success', description: '成功或错误描述' })
  message: string
}
```

### 12. 测试模式

#### 单元测试

```typescript
// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UsersService } from './users.service'
import { User, UserRole } from './entities/user.entity'
import { NotFoundException, ConflictException } from '@nestjs/common'

describe('UsersService', () => {
  let service: UsersService
  let repository: jest.Mocked<Repository<User>>

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: '张三',
    email: 'zhangsan@example.com',
    password: 'hashedPassword',
    role: UserRole.USER,
    isActive: true,
    orders: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      softRemove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockUser], 1]),
      }),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    repository = module.get(getRepositoryToken(User))
  })

  it('应该被定义', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('应该成功创建用户', async () => {
      repository.findOne.mockResolvedValue(null)
      repository.create.mockReturnValue(mockUser)
      repository.save.mockResolvedValue(mockUser)

      const result = await service.create({
        name: '张三',
        email: 'zhangsan@example.com',
        password: 'P@ssw0rd',
      })

      expect(result).toEqual(mockUser)
      expect(repository.create).toHaveBeenCalled()
      expect(repository.save).toHaveBeenCalled()
    })

    it('邮箱已存在时应抛出 ConflictException', async () => {
      repository.findOne.mockResolvedValue(mockUser)

      await expect(
        service.create({
          name: '张三',
          email: 'zhangsan@example.com',
          password: 'P@ssw0rd',
        }),
      ).rejects.toThrow(ConflictException)
    })
  })

  describe('findOne', () => {
    it('应该返回指定用户', async () => {
      repository.findOne.mockResolvedValue(mockUser)

      const result = await service.findOne(mockUser.id)
      expect(result).toEqual(mockUser)
    })

    it('用户不存在时应抛出 NotFoundException', async () => {
      repository.findOne.mockResolvedValue(null)

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
```

#### E2E 测试

```typescript
// app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter'
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor'

describe('App (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api/v1')
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )
    app.useGlobalFilters(new HttpExceptionFilter())
    app.useGlobalInterceptors(new TransformInterceptor())
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('/api/v1/users (POST)', () => {
    it('应该返回 401（未认证）', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          name: '测试用户',
          email: 'test@example.com',
          password: 'P@ssw0rd',
        })
        .expect(401)
    })
  })

  describe('/api/v1/users (GET)', () => {
    it('应该返回 401（未认证）', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users')
        .expect(401)
    })
  })
})
```

---

## 目录选择决策树

当创建一个新文件时，按以下规则决定放置位置：

```
新文件属于什么？
│
├── 仅属于某个业务模块？
│   └── → src/modules/<模块名>/
│       ├── 控制器？  → <module>.controller.ts
│       ├── 服务？    → <module>.service.ts
│       ├── DTO？     → dto/
│       ├── 实体？    → entities/
│       ├── Guard？   → guards/
│       ├── 策略？    → strategies/
│       ├── 命令？    → commands/
│       └── 事件？    → events/
│
├── 跨多个模块复用？
│   ├── 自定义装饰器？  → src/common/decorators/
│   ├── 异常过滤器？    → src/common/filters/
│   ├── Guard？         → src/common/guards/
│   ├── 拦截器？        → src/common/interceptors/
│   ├── 管道？          → src/common/pipes/
│   ├── 中间件？        → src/common/middleware/
│   └── 共享 DTO？      → src/common/dto/
│
├── 应用配置？         → src/config/
├── 数据库迁移？       → src/database/migrations/
├── 数据库种子？       → src/database/seeds/
└── 工具函数/接口？    → src/shared/
```

---

## 环境变量规范

### 文件层级

```
.env                        # 所有环境加载
.env.development            # 开发环境
.env.staging                # 预发布环境
.env.production             # 生产环境
.env.local                  # 个人本地覆盖（gitignore）
```

### 环境变量命名规则

- 使用 `UPPER_SNAKE_CASE`：`DATABASE_URL`、`JWT_SECRET`、`REDIS_HOST`
- 必须有默认值或在启动时校验
- 使用 `@nestjs/config` 的 `ConfigModule` 统一管理

```typescript
// config/app.config.ts
import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
}))
```

```typescript
// config/database.config.ts
import { Injectable } from '@nestjs/common'
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD', 'postgres'),
      database: this.configService.get<string>('DB_DATABASE', 'app'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
      synchronize: this.configService.get<boolean>('DB_SYNCHRONIZE', false),
      logging: this.configService.get<boolean>('DB_LOGGING', false),
    }
  }
}
```

```typescript
// config/auth.config.ts
import { registerAs } from '@nestjs/config'

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
}))
```

---

## 接口契约集成（api-contract）

本项目与 [api-contract](../api-contract/) skill 配合，统一前后端接口响应格式和状态码规范。

### 契约文件说明

项目中应维护 `api-contract.json` 接口契约文件，用于定义所有接口的请求/响应格式、状态码和数据结构。契约文件可由 `api-contract/tools/` 下的工具自动生成代码。

### 统一响应格式

所有接口响应遵循 api-contract 统一格式：

```typescript
// common/dto/response.dto.ts
// 响应格式遵循 api-contract 接口契约规范
// 参考: d:/soft/work/skills/api-contract/spec/example-api.json
export interface ApiResponse<T = any> {
  status: string    // "000000" 表示成功
  data: T           // 业务数据
  message: string   // "success" 或错误描述
}
```

### TransformInterceptor 更新

```typescript
// common/interceptors/transform.interceptor.ts
// 遵循 api-contract 统一响应格式
import { ApiResponse } from '../dto/response.dto'

export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        status: '000000',
        data,
        message: 'success',
      })),
    )
  }
}
```

### 状态码规范

```typescript
// common/constants/status-codes.ts
// 遵循 api-contract 状态码规范
// 参考: d:/soft/work/skills/api-contract/spec/status-codes.json
export const STATUS_CODES = {
  SUCCESS: '000000',
  BAD_REQUEST: '000400',
  UNAUTHORIZED: '000401',
  FORBIDDEN: '000403',
  NOT_FOUND: '000404',
  INTERNAL_ERROR: '000500',
  PARTIAL_SUCCESS: '000001',
} as const;
```

### HttpExceptionFilter 更新

```typescript
// common/filters/http-exception.filter.ts
// 遵循 api-contract 统一错误响应格式
const errorResponse: ApiResponse = {
  status: statusCode === 401 ? '000401'
        : statusCode === 403 ? '000403'
        : statusCode === 404 ? '000404'
        : '000500',
  data: null,
  message: Array.isArray(message) ? message.join(', ') : message,
};
```

### 数据约定

- **GET 详情**：`data` 为业务对象
- **GET /list**：`data` 为 `{ list: T[], pageInfo: { pageNum, pageSize, total, totalPages } }`
- **POST/PUT/DELETE**：`data` 为 `true`/`false`

### 分页响应格式

```typescript
// common/dto/page.dto.ts
export interface PageInfo {
  pageNum: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PageResult<T = any> {
  list: T[];
  pageInfo: PageInfo;
}
```

### 使用 generate-backend.js 生成代码

```bash
# 从 api-contract.json 生成 NestJS 后端代码
node api-contract/tools/generate-backend.js api-contract.json --lang node --output src/
#
# 生成内容：
# - middleware/result.js    → 响应辅助函数
# - routes/{module}.js      → 路由文件
# - index.js                → 路由注册
```

---

## 认证模块实现参考

### JWT 策略

```typescript
// modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.jwtSecret'),
    })
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    if (!payload.sub) {
      throw new UnauthorizedException()
    }
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    }
  }
}
```

### 认证服务

```typescript
// modules/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { UsersService } from '../users/users.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existing = await this.usersService.findByEmail(registerDto.email)
    if (existing) {
      throw new ConflictException('邮箱已注册')
    }

    const saltRounds = this.configService.get<number>('auth.bcryptSaltRounds')
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds)

    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    })

    return this.generateTokens(user.id, user.email, user.role)
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email)
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误')
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    )
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误')
    }

    return this.generateTokens(user.id, user.email, user.role)
  }

  private generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role }

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('auth.jwtExpiresIn'),
    })

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('auth.refreshTokenExpiresIn'),
    })

    return { accessToken, refreshToken }
  }
}
```

---

## Prisma 集成参考

如果使用 Prisma 代替 TypeORM，以下是关键差异：

### Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  name      String   @db.VarChar(50)
  email     String   @unique @db.VarChar(100)
  password  String
  role      Role     @default(USER)
  isActive  Boolean  @default(true) @map("is_active")
  orders    Order[]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  @@map("users")
}

enum Role {
  ADMIN
  USER
  EDITOR
}
```

### Prisma Service

```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
```

### Prisma Module

```typescript
// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

---

## 工具命令

### 初始化项目骨架

```bash
# 使用 scaffold 工具初始化标准目录结构
node tools/scaffold.js <项目路径> [--mode=single|monorepo] [--modules=auth,users,orders]

# 示例：
node tools/scaffold.js ./my-api
node tools/scaffold.js ./my-api --modules=auth,users,orders
node tools/scaffold.js ./my-monorepo --mode=monorepo
```

### 验证项目结构

```bash
# 校验现有项目是否符合规范
node tools/validate.js <项目路径>

# 示例：
node tools/validate.js ./my-nestjs-app
```
