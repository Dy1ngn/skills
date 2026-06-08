#!/usr/bin/env node

/**
 * Node.js Project Standard - Scaffold Generator
 *
 * 用途：生成符合 Node.js Project Standard 规范的 NestJS 标准目录结构
 *
 * 使用方法：
 *   node tools/scaffold.js <项目路径> [--mode=single|monorepo] [--modules=auth,users,orders]
 *
 * 参数说明：
 *   <项目路径>          目标目录路径（相对或绝对）
 *   --mode=single       单应用模式（默认）
 *   --mode=monorepo     多应用 Monorepo 模式
 *   --modules=a,b,c     预创建的业务模块名称列表
 *
 * 示例：
 *   node tools/scaffold.js ./my-api
 *   node tools/scaffold.js ./my-api --modules=auth,users,orders
 *   node tools/scaffold.js ./my-monorepo --mode=monorepo
 */

const fs = require('fs')
const path = require('path')

// ========== 颜色输出 ==========

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
}

function log(msg) { console.log(colors.green + '✔' + colors.reset + ' ' + msg) }
function warn(msg) { console.log(colors.yellow + '⚠' + colors.reset + ' ' + msg) }
function info(msg) { console.log(colors.blue + 'ℹ' + colors.reset + ' ' + msg) }
function error(msg) { console.error(colors.red + '✖' + colors.reset + ' ' + msg) }
function title(msg) { console.log('\n' + colors.cyan + msg + colors.reset) }

// ========== 目录定义 ==========

const SINGLE_APP_DIRS = [
  'src',
  'src/modules',
  'src/common/decorators',
  'src/common/filters',
  'src/common/guards',
  'src/common/interceptors',
  'src/common/middleware',
  'src/common/pipes',
  'src/common/dto',
  'src/config',
  'src/database/migrations',
  'src/database/seeds',
  'src/shared/utils',
  'src/shared/interfaces',
  'test',
]

const FEATURE_SUB_DIRS = ['dto', 'entities', 'guards', 'strategies']

const MONOREPO_DIRS = [
  'apps/api-gateway/src/app',
  'apps/auth-service/src/app',
  'apps/worker/src/app',
  'libs/api/auth/feature/src',
  'libs/api/auth/data-access/src',
  'libs/api/core/feature/src',
  'libs/shared/models/src',
]

// ========== 模板文件 ==========

const TEMPLATE_FILES = {
  single: {
    'src/main.ts': `import { NestFactory } from '@nestjs/core'
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
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
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
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.PORT || 3000
  await app.listen(port)
  logger.log(\`应用已启动: http://localhost:\${port}\`)
  logger.log(\`Swagger 文档: http://localhost:\${port}/api/docs\`)
}

bootstrap()
`,

    'src/app.module.ts': `import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // 业务模块在此导入
    // AuthModule,
    // UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
`,

    'src/common/filters/http-exception.filter.ts': `import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

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

    const errorResponse = {
      code: status,
      message: typeof message === 'string' ? message : (message as any).message,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    }

    this.logger.error(
      \`\${request.method} \${request.url} \${status}\`,
      exception instanceof Error ? exception.stack : '',
    )

    response.status(status).json(errorResponse)
  }
}
`,

    'src/common/interceptors/transform.interceptor.ts': `import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface ResponseData<T> {
  code: number
  message: string
  data: T
  timestamp: string
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseData<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseData<T>> {
    return next.handle().pipe(
      map((data) => ({
        code: 0,
        message: 'success',
        data,
        timestamp: new Date().toISOString(),
      })),
    )
  }
}
`,

    'src/common/interceptors/logging.interceptor.ts': `import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const { method, url } = request
    const now = Date.now()

    this.logger.log(\`--> \${method} \${url}\`)

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - now
        this.logger.log(\`<-- \${method} \${url} \${elapsed}ms\`)
      }),
    )
  }
}
`,

    'src/common/guards/roles.guard.ts': `import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
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
`,

    'src/common/decorators/roles.decorator.ts': `import { SetMetadata } from '@nestjs/common'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles)
`,

    'src/common/decorators/public.decorator.ts': `import { SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_KEY = 'isPublic'
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
`,

    'src/common/decorators/current-user.decorator.ts': `import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user
    return data ? user?.[data] : user
  },
)
`,

    'src/common/dto/page-meta.dto.ts': `import { ApiProperty } from '@nestjs/swagger'

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
`,

    'src/common/dto/page.dto.ts': `import { ApiProperty } from '@nestjs/swagger'
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
`,

    'src/config/app.config.ts': `import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
}))
`,

    'src/config/database.config.ts': `import { Injectable } from '@nestjs/common'
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
`,
  },

  monorepo: {
    'pnpm-workspace.yaml': `packages:
  - 'apps/*'
  - 'libs/*'
`,

    'nx.json': `{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "lint", "test", "e2e"]
      }
    }
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["{projectRoot}/dist"]
    },
    "lint": {
      "inputs": ["{projectRoot}/**/*", "sharedGlobals"]
    },
    "test": {
      "inputs": ["default", "^default"]
    }
  }
}
`,
  },
}

// ========== 核心逻辑 ==========

/**
 * 创建目录（递归）
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    return true
  }
  return false
}

/**
 * 写入文件（仅当文件不存在时）
 */
function writeFileIfNotExists(filePath, content) {
  if (!fs.existsSync(filePath)) {
    ensureDir(path.dirname(filePath))
    fs.writeFileSync(filePath, content, 'utf-8')
    return true
  }
  return false
}

/**
 * 生成单应用模式的目录结构
 */
function scaffoldSingleApp(rootDir, modules) {
  title('📁 创建单应用目录结构...')

  let dirCount = 0
  for (const dir of SINGLE_APP_DIRS) {
    const fullPath = path.join(rootDir, dir)
    if (ensureDir(fullPath)) {
      log('目录: ' + dir + '/')
      dirCount++
    }
  }

  // 创建业务模块
  if (modules.length > 0) {
    title('🧩 创建业务模块...')
    for (const mod of modules) {
      for (const subDir of FEATURE_SUB_DIRS) {
        const featurePath = path.join(rootDir, 'src', 'modules', mod, subDir)
        if (ensureDir(featurePath)) {
          log('目录: src/modules/' + mod + '/' + subDir + '/')
          dirCount++
        }
      }
    }
  }

  return dirCount
}

/**
 * 生成 Monorepo 模式的目录结构
 */
function scaffoldMonorepo(rootDir) {
  title('📁 创建 Monorepo 目录结构...')

  let dirCount = 0
  for (const dir of MONOREPO_DIRS) {
    const fullPath = path.join(rootDir, dir)
    if (ensureDir(fullPath)) {
      log('目录: ' + dir + '/')
      dirCount++
    }
  }

  return dirCount
}

/**
 * 生成模板文件
 */
function scaffoldFiles(rootDir, mode) {
  title('📝 创建模板文件...')

  const files = { ...TEMPLATE_FILES.single }
  if (mode === 'monorepo') {
    Object.assign(files, TEMPLATE_FILES.monorepo)
  }

  let fileCount = 0
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(rootDir, relativePath)
    if (writeFileIfNotExists(fullPath, content)) {
      log('文件: ' + relativePath)
      fileCount++
    } else {
      warn('跳过（已存在）: ' + relativePath)
    }
  }

  return fileCount
}

/**
 * 参数解析
 */
function parseArgs(argv) {
  const args = argv.slice(2)
  const result = {
    targetDir: null,
    mode: 'single',
    modules: [],
  }

  for (const arg of args) {
    if (arg.startsWith('--mode=')) {
      result.mode = arg.split('=')[1]
    } else if (arg.startsWith('--modules=')) {
      result.modules = arg.split('=')[1].split(',').map(s => s.trim()).filter(Boolean)
    } else if (!arg.startsWith('--')) {
      result.targetDir = arg
    }
  }

  return result
}

/**
 * 主函数
 */
function main() {
  const { targetDir, mode, modules } = parseArgs(process.argv)

  if (!targetDir) {
    error('请指定项目路径')
    console.log('')
    console.log('用法: node tools/scaffold.js <项目路径> [--mode=single|monorepo] [--modules=auth,users]')
    console.log('')
    console.log('示例:')
    console.log('  node tools/scaffold.js ./my-api')
    console.log('  node tools/scaffold.js ./my-api --modules=auth,users,orders')
    console.log('  node tools/scaffold.js ./my-monorepo --mode=monorepo')
    process.exit(1)
  }

  if (!['single', 'monorepo'].includes(mode)) {
    error('无效的模式: ' + mode + '，可选值: single, monorepo')
    process.exit(1)
  }

  const rootDir = path.resolve(targetDir)

  console.log('')
  console.log(colors.cyan + '╔══════════════════════════════════════════════╗' + colors.reset)
  console.log(colors.cyan + '║  Node.js Project Standard - Scaffold Tool    ║' + colors.reset)
  console.log(colors.cyan + '╚══════════════════════════════════════════════╝' + colors.reset)
  console.log('')
  info('目标路径: ' + rootDir)
  info('项目模式: ' + mode)
  if (modules.length > 0) {
    info('业务模块: ' + modules.join(', '))
  }

  // 创建根目录
  ensureDir(rootDir)

  // 生成目录结构
  let dirCount = 0
  if (mode === 'single') {
    dirCount = scaffoldSingleApp(rootDir, modules)
  } else {
    dirCount = scaffoldMonorepo(rootDir)
  }

  // 生成模板文件
  const fileCount = scaffoldFiles(rootDir, mode)

  // 完成
  console.log('')
  console.log(colors.green + '══════════════════════════════════════════════' + colors.reset)
  log('完成！共创建 ' + dirCount + ' 个目录，' + fileCount + ' 个模板文件')
  console.log('')
  info('下一步:')
  console.log('  cd ' + targetDir)
  console.log('  pnpm install')
  console.log('  pnpm run start:dev')
  console.log('')
}

main()
