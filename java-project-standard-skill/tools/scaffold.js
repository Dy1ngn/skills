#!/usr/bin/env node

/**
 * Java Project Standard - Scaffold Generator
 *
 * 用途：生成符合 Java Project Standard 规范的标准目录结构和模板文件
 *
 * 使用方法：
 *   node tools/scaffold.js <项目路径> [--mode=single|multimodule] [--modules=user,order,product]
 *
 * 参数说明：
 *   <项目路径>              目标目录路径（相对或绝对）
 *   --mode=single           单模块模式（默认）
 *   --mode=multimodule      多模块 Maven 模式
 *   --modules=a,b,c         预创建的业务模块名称列表
 *   --package=com.xxx       基础包名（默认 com.ruoyi.project）
 *
 * 示例：
 *   node tools/scaffold.js ./my-app
 *   node tools/scaffold.js ./my-app --modules=user,order,product
 *   node tools/scaffold.js ./my-app --mode=multimodule --modules=system,monitor
 *   node tools/scaffold.js ./my-app --package=com.example.myapp
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

function log(msg) { console.log(`${colors.green}✔${colors.reset} ${msg}`) }
function warn(msg) { console.log(`${colors.yellow}⚠${colors.reset} ${msg}`) }
function info(msg) { console.log(`${colors.blue}ℹ${colors.reset} ${msg}`) }
function error(msg) { console.error(`${colors.red}✖${colors.reset} ${msg}`) }
function title(msg) { console.log(`\n${colors.cyan}${msg}${colors.reset}`) }

// ========== 目录定义 ==========

// 单模块 Spring Boot 目录结构
const SINGLE_APP_DIRS = [
  'src/main/java',
  'src/main/resources/mapper',
  'src/main/resources/static',
  'src/main/resources/templates',
  'src/test/java',
]

// 标准 Java 包目录（相对于 src/main/java/{basePackagePath}/）
const STANDARD_PACKAGES = [
  'controller',
  'service/impl',
  'mapper',
  'entity',
  'dto/query',
  'dto/req',
  'vo',
  'bo',
  'config',
  'constant',
  'enums',
  'exception',
  'annotation',
  'aspect',
  'interceptor',
  'util',
  'common',
]

// 多模块 Maven 目录结构（RuoYi 风格）
const MULTIMODULE_DIRS = [
  // 父项目
  '',
  // admin 模块：启动入口 + 控制器
  '{project}-admin/src/main/java/{basePackagePath}/controller',
  '{project}-admin/src/main/resources/mapper',
  '{project}-admin/src/test/java',
  // common 模块：共享基础
  '{project}-common/src/main/java/{basePackagePath}/common/core',
  '{project}-common/src/main/java/{basePackagePath}/common/constant',
  '{project}-common/src/main/java/{basePackagePath}/common/enums',
  '{project}-common/src/main/java/{basePackagePath}/common/exception',
  '{project}-common/src/main/java/{basePackagePath}/common/annotation',
  '{project}-common/src/main/java/{basePackagePath}/common/util',
  // framework 模块：框架层
  '{project}-framework/src/main/java/{basePackagePath}/framework/config',
  '{project}-framework/src/main/java/{basePackagePath}/framework/security',
  '{project}-framework/src/main/java/{basePackagePath}/framework/aspectj',
  '{project}-framework/src/main/java/{basePackagePath}/framework/interceptor',
  '{project}-framework/src/main/java/{basePackagePath}/framework/manager',
  '{project}-framework/src/main/java/{basePackagePath}/framework/web',
]

// 业务模块子目录（相对于业务模块的 domain/）
const FEATURE_SUB_DIRS_DOMAIN = [
  'vo',
  'dto/query',
  'dto/req',
  'bo',
]

// 业务模块子目录（相对于业务模块根目录）
const FEATURE_SUB_DIRS = [
  'controller',
  'service/impl',
  'mapper',
  'domain',
]

// ========== 模板文件 ==========

function getTemplates(projectName, basePackage, basePackagePath) {
  const packageLine = `package ${basePackage}`

  return {
    // ---- pom.xml ----
    'pom.xml': `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/>
    </parent>

    <groupId>${basePackage}</groupId>
    <artifactId>${projectName}</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    <name>${projectName}</name>
    <description>${projectName} - Java 后端项目</description>

    <properties>
        <java.version>17</java.version>
        <mybatis-plus.version>3.5.6</mybatis-plus.version>
        <hutool.version>5.8.27</hutool.version>
        <lombok.version>1.18.32</lombok.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Boot Security -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <!-- Spring Boot Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Spring Boot Redis -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>

        <!-- MyBatis-Plus -->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
            <version>\${mybatis-plus.version}</version>
        </dependency>

        <!-- MySQL -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Hutool -->
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-all</artifactId>
            <version>\${hutool.version}</version>
        </dependency>

        <!-- Knife4j (Swagger) -->
        <dependency>
            <groupId>com.github.xiaoymin</groupId>
            <artifactId>knife4j-openapi3-jakarta-spring-boot-starter</artifactId>
            <version>4.5.0</version>
        </dependency>

        <!-- PageHelper -->
        <dependency>
            <groupId>com.github.pagehelper</groupId>
            <artifactId>pagehelper-spring-boot-starter</artifactId>
            <version>2.1.0</version>
        </dependency>

        <!-- Spring Boot Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
`,

    // ---- Application.java ----
    [`src/main/java/${basePackagePath}/Application.java`]: `${packageLine};

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 启动类
 *
 * @author author
 */
@EnableAsync
@EnableScheduling
@MapperScan("${basePackage}.mapper")
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
        System.out.println("====== ${projectName} 启动成功 ======");
    }
}
`,

    // ---- R.java（统一响应包装器） ----
    [`src/main/java/${basePackagePath}/common/R.java`]: `${packageLine}.common;

import java.io.Serializable;

/**
 * 统一响应包装器
 *
 * @param <T> 数据类型
 * @author author
 */
public class R<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 状态码 */
    private int code;

    /** 消息 */
    private String msg;

    /** 数据 */
    private T data;

    public static final int SUCCESS_CODE = 200;
    public static final int FAIL_CODE = 500;

    public int getCode() { return code; }
    public void setCode(int code) { this.code = code; }
    public String getMsg() { return msg; }
    public void setMsg(String msg) { this.msg = msg; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }

    public static <T> R<T> ok() {
        return restResult(null, SUCCESS_CODE, "操作成功");
    }

    public static <T> R<T> ok(T data) {
        return restResult(data, SUCCESS_CODE, "操作成功");
    }

    public static <T> R<T> ok(T data, String msg) {
        return restResult(data, SUCCESS_CODE, msg);
    }

    public static <T> R<T> fail() {
        return restResult(null, FAIL_CODE, "操作失败");
    }

    public static <T> R<T> fail(String msg) {
        return restResult(null, FAIL_CODE, msg);
    }

    public static <T> R<T> fail(int code, String msg) {
        return restResult(null, code, msg);
    }

    public boolean isSuccess() {
        return this.code == SUCCESS_CODE;
    }

    public boolean isFail() {
        return !isSuccess();
    }

    private static <T> R<T> restResult(T data, int code, String msg) {
        R<T> r = new R<>();
        r.setCode(code);
        r.setMsg(msg);
        r.setData(data);
        return r;
    }
}
`,

    // ---- BaseEntity.java ----
    [`src/main/java/${basePackagePath}/common/BaseEntity.java`]: `${packageLine}.common;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 实体基类（审计字段）
 *
 * @author author
 */
public class BaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 创建者 */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @TableField(fill = FieldFill.INSERT)
    private String createBy;

    /** 创建时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /** 更新者 */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private String updateBy;

    /** 更新时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /** 备注 */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String remark;

    /** 逻辑删除标志（0=正常, 2=删除） */
    @JsonIgnore
    @TableLogic
    private String delFlag;

    // ========== Getter / Setter ==========

    public String getCreateBy() { return createBy; }
    public void setCreateBy(String createBy) { this.createBy = createBy; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }

    public String getUpdateBy() { return updateBy; }
    public void setUpdateBy(String updateBy) { this.updateBy = updateBy; }

    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }

    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }

    public String getDelFlag() { return delFlag; }
    public void setDelFlag(String delFlag) { this.delFlag = delFlag; }
}
`,

    // ---- BusinessException.java ----
    [`src/main/java/${basePackagePath}/common/BusinessException.java`]: `${packageLine}.common;

/**
 * 业务异常
 *
 * @author author
 */
public class BusinessException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    private String message;

    public BusinessException() {
    }

    public BusinessException(String message) {
        this.message = message;
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
        this.message = message;
    }

    @Override
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
`,

    // ---- GlobalExceptionHandler.java ----
    [`src/main/java/${basePackagePath}/common/GlobalExceptionHandler.java`]: `${packageLine}.common;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.validation.BindException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器
 *
 * @author author
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * 业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public R<Void> handleBusinessException(BusinessException e, HttpServletRequest request) {
        log.error("业务异常: uri={}, message={}", request.getRequestURI(), e.getMessage());
        return R.fail(e.getMessage());
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
        return R.fail(message);
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
        return R.fail(message);
    }

    /**
     * 请求方式不支持
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public R<Void> handleHttpRequestMethodNotSupported(HttpRequestMethodNotSupportedException e) {
        log.warn("不支持的请求方式: method={}", e.getMethod());
        return R.fail("不支持 '" + e.getMethod() + "' 请求");
    }

    /**
     * 运行时异常
     */
    @ExceptionHandler(RuntimeException.class)
    public R<Void> handleRuntimeException(RuntimeException e, HttpServletRequest request) {
        log.error("运行时异常: uri={}", request.getRequestURI(), e);
        return R.fail("系统内部错误，请联系管理员");
    }

    /**
     * 系统异常（兜底）
     */
    @ExceptionHandler(Exception.class)
    public R<Void> handleException(Exception e, HttpServletRequest request) {
        log.error("系统异常: uri={}", request.getRequestURI(), e);
        return R.fail("系统繁忙，请稍后重试");
    }
}
`,

    // ---- application.yml ----
    'src/main/resources/application.yml': `# 应用配置
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  profiles:
    active: dev
  application:
    name: ${projectName}
  jackson:
    date-format: yyyy-MM-dd HH:mm:ss
    time-zone: Asia/Shanghai
    serialization:
      write-dates-as-timestamps: false

# MyBatis-Plus 配置
mybatis-plus:
  mapper-locations: classpath*:mapper/**/*.xml
  type-aliases-package: ${basePackage}.entity
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
    ${basePackage}: debug
    org.springframework: warn
`,

    // ---- application-dev.yml ----
    'src/main/resources/application-dev.yml': `# 开发环境配置
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/${projectName.replace(/-/g, '_')}?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8
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
  secret: abcdefghijklmnopqrstuvwxyz0123456789
  expireTime: 720
`,

    // ---- application-prod.yml ----
    'src/main/resources/application-prod.yml': `# 生产环境配置
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://prod-db-server:3306/${projectName.replace(/-/g, '_')}?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8
    username: \${DB_USERNAME}
    password: \${DB_PASSWORD}

  # Redis 配置
  data:
    redis:
      host: \${REDIS_HOST}
      port: 6379
      password: \${REDIS_PASSWORD}
      database: 0

# 日志级别（生产环境只记录 warn 以上）
logging:
  level:
    ${basePackage}: info
    org.springframework: warn
`,
  }
}

// 多模块模式下的额外模板文件
function getMultiModuleTemplates(projectName, basePackage, basePackagePath) {
  const packageLine = `package ${basePackage}`

  return {
    // ---- 父 pom.xml ----
    'pom.xml': `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>${basePackage}</groupId>
    <artifactId>${projectName}</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>
    <name>${projectName}</name>
    <description>${projectName} - 多模块 Java 后端项目</description>

    <modules>
        <module>${projectName}-admin</module>
        <module>${projectName}-common</module>
        <module>${projectName}-framework</module>
        <module>${projectName}-system</module>
    </modules>

    <properties>
        <java.version>17</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <spring-boot.version>3.2.5</spring-boot.version>
        <mybatis-plus.version>3.5.6</mybatis-plus.version>
        <hutool.version>5.8.27</hutool.version>
        <lombok.version>1.18.32</lombok.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <!-- Spring Boot Dependencies -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>\${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- 内部模块 -->
            <dependency>
                <groupId>${basePackage}</groupId>
                <artifactId>${projectName}-common</artifactId>
                <version>\${project.version}</version>
            </dependency>
            <dependency>
                <groupId>${basePackage}</groupId>
                <artifactId>${projectName}-framework</artifactId>
                <version>\${project.version}</version>
            </dependency>
            <dependency>
                <groupId>${basePackage}</groupId>
                <artifactId>${projectName}-system</artifactId>
                <version>\${project.version}</version>
            </dependency>

            <!-- MyBatis-Plus -->
            <dependency>
                <groupId>com.baomidou</groupId>
                <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
                <version>\${mybatis-plus.version}</version>
            </dependency>

            <!-- Hutool -->
            <dependency>
                <groupId>cn.hutool</groupId>
                <artifactId>hutool-all</artifactId>
                <version>\${hutool.version}</version>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.13.0</version>
                <configuration>
                    <source>\${java.version}</source>
                    <target>\${java.version}</target>
                    <encoding>\${project.build.sourceEncoding}</encoding>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
`,

    // ---- common 模块 pom.xml ----
    [`${projectName}-common/pom.xml`]: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>${basePackage}</groupId>
        <artifactId>${projectName}</artifactId>
        <version>1.0.0</version>
    </parent>

    <artifactId>${projectName}-common</artifactId>
    <packaging>jar</packaging>
    <description>通用工具与基础类</description>

    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Boot Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- MyBatis-Plus -->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
        </dependency>

        <!-- Hutool -->
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-all</artifactId>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- PageHelper -->
        <dependency>
            <groupId>com.github.pagehelper</groupId>
            <artifactId>pagehelper-spring-boot-starter</artifactId>
            <version>2.1.0</version>
        </dependency>
    </dependencies>
</project>
`,

    // ---- framework 模块 pom.xml ----
    [`${projectName}-framework/pom.xml`]: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>${basePackage}</groupId>
        <artifactId>${projectName}</artifactId>
        <version>1.0.0</version>
    </parent>

    <artifactId>${projectName}-framework</artifactId>
    <packaging>jar</packaging>
    <description>框架层：安全、配置、AOP、拦截器</description>

    <dependencies>
        <!-- 内部 common 模块 -->
        <dependency>
            <groupId>${basePackage}</groupId>
            <artifactId>${projectName}-common</artifactId>
        </dependency>

        <!-- Spring Boot Security -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <!-- Spring Boot Redis -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>

        <!-- Knife4j (Swagger) -->
        <dependency>
            <groupId>com.github.xiaoymin</groupId>
            <artifactId>knife4j-openapi3-jakarta-spring-boot-starter</artifactId>
            <version>4.5.0</version>
        </dependency>
    </dependencies>
</project>
`,

    // ---- system 模块 pom.xml ----
    [`${projectName}-system/pom.xml`]: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>${basePackage}</groupId>
        <artifactId>${projectName}</artifactId>
        <version>1.0.0</version>
    </parent>

    <artifactId>${projectName}-system</artifactId>
    <packaging>jar</packaging>
    <description>系统管理业务模块</description>

    <dependencies>
        <!-- 内部 framework 模块（传递依赖 common） -->
        <dependency>
            <groupId>${basePackage}</groupId>
            <artifactId>${projectName}-framework</artifactId>
        </dependency>

        <!-- MySQL -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
    </dependencies>
</project>
`,

    // ---- admin 模块 pom.xml ----
    [`${projectName}-admin/pom.xml`]: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>${basePackage}</groupId>
        <artifactId>${projectName}</artifactId>
        <version>1.0.0</version>
    </parent>

    <artifactId>${projectName}-admin</artifactId>
    <packaging>jar</packaging>
    <description>启动入口与控制器层</description>

    <dependencies>
        <!-- 内部 system 模块（传递依赖 framework + common） -->
        <dependency>
            <groupId>${basePackage}</groupId>
            <artifactId>${projectName}-system</artifactId>
        </dependency>

        <!-- Spring Boot Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>\${spring-boot.version}</version>
                <executions>
                    <execution>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
`,

    // ---- admin 模块 Application.java ----
    [`${projectName}-admin/src/main/java/${basePackagePath}/Application.java`]: `${packageLine};

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 启动类
 *
 * @author author
 */
@EnableAsync
@EnableScheduling
@MapperScan("${basePackage}.**.mapper")
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
        System.out.println("====== ${projectName} 启动成功 ======");
    }
}
`,

    // ---- admin 模块配置文件 ----
    [`${projectName}-admin/src/main/resources/application.yml`]: `# 应用配置
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  profiles:
    active: dev
  application:
    name: ${projectName}
  jackson:
    date-format: yyyy-MM-dd HH:mm:ss
    time-zone: Asia/Shanghai
    serialization:
      write-dates-as-timestamps: false

# MyBatis-Plus 配置
mybatis-plus:
  mapper-locations: classpath*:mapper/**/*.xml
  type-aliases-package: ${basePackage}.system.domain
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
    ${basePackage}: debug
    org.springframework: warn
`,

    [`${projectName}-admin/src/main/resources/application-dev.yml`]: `# 开发环境配置
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/${projectName.replace(/-/g, '_')}?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8
    username: root
    password: root

  data:
    redis:
      host: localhost
      port: 6379
      password:
      database: 0

token:
  header: Authorization
  secret: abcdefghijklmnopqrstuvwxyz0123456789
  expireTime: 720
`,

    [`${projectName}-admin/src/main/resources/application-prod.yml`]: `# 生产环境配置
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://prod-db-server:3306/${projectName.replace(/-/g, '_')}?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8
    username: \${DB_USERNAME}
    password: \${DB_PASSWORD}

  data:
    redis:
      host: \${REDIS_HOST}
      port: 6379
      password: \${REDIS_PASSWORD}
      database: 0

logging:
  level:
    ${basePackage}: info
    org.springframework: warn
`,
  }
}

// 业务模块模板
function getFeatureModuleTemplates(projectName, basePackage, basePackagePath, moduleName) {
  const className = capitalize(moduleName)

  return {
    // Service 接口
    [`${projectName}-system/src/main/java/${basePackagePath}/system/service/I${className}Service.java`]: `package ${basePackage}.system.service;

/**
 * ${className} 服务接口
 *
 * @author author
 */
public interface I${className}Service {

    // TODO: 定义服务方法
}
`,

    // Service 实现
    [`${projectName}-system/src/main/java/${basePackagePath}/system/service/impl/${className}ServiceImpl.java`]: `package ${basePackage}.system.service.impl;

import ${basePackage}.system.service.I${className}Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * ${className} 服务实现
 *
 * @author author
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ${className}ServiceImpl implements I${className}Service {

    // TODO: 注入 Mapper 和实现业务逻辑
}
`,

    // Mapper 接口
    [`${projectName}-system/src/main/java/${basePackagePath}/system/mapper/${className}Mapper.java`]: `package ${basePackage}.system.mapper;

/**
 * ${className} Mapper 接口
 *
 * @author author
 */
public interface ${className}Mapper {

    // TODO: 定义数据访问方法
}
`,
  }
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
 * 首字母大写
 */
function capitalize(str) {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 将 kebab-case 转为 PascalCase
 */
function toPascalCase(str) {
  return str.split('-').map(s => capitalize(s)).join('')
}

/**
 * 生成单模块模式的目录结构
 */
function scaffoldSingleApp(rootDir, basePackagePath, modules) {
  title('📁 创建单模块目录结构...')

  let dirCount = 0

  // 创建基础目录
  for (const dir of SINGLE_APP_DIRS) {
    const fullPath = path.join(rootDir, dir)
    if (ensureDir(fullPath)) {
      log(`目录: ${dir}/`)
      dirCount++
    }
  }

  // 创建标准包目录
  const javaBaseDir = path.join(rootDir, 'src', 'main', 'java', basePackagePath)
  for (const pkg of STANDARD_PACKAGES) {
    const fullPath = path.join(javaBaseDir, pkg)
    if (ensureDir(fullPath)) {
      log(`目录: src/main/java/${basePackagePath}/${pkg}/`)
      dirCount++
    }
  }

  // 创建测试目录
  const testBaseDir = path.join(rootDir, 'src', 'test', 'java', basePackagePath)
  ensureDir(testBaseDir)
  dirCount++

  // 创建业务模块目录
  if (modules.length > 0) {
    title('🧩 创建业务模块目录...')
    for (const mod of modules) {
      for (const subDir of FEATURE_SUB_DIRS) {
        const modPath = path.join(javaBaseDir, 'controller') // 在单模块中，模块通过 controller 子包区分
        // 单模块模式下，业务模块主要影响 controller 命名，目录结构使用统一的标准包
        // 此处不做额外目录创建，业务模块体现在命名上
      }
      info(`业务模块 "${mod}" 已标识（文件命名时使用 ${capitalize(mod)} 前缀）`)
    }
  }

  return dirCount
}

/**
 * 生成多模块 Maven 模式的目录结构
 */
function scaffoldMultimodule(rootDir, projectName, basePackagePath, modules) {
  title('📁 创建多模块 Maven 目录结构...')

  let dirCount = 0

  // 创建模块目录
  const moduleDirs = [
    `${projectName}-admin/src/main/java/${basePackagePath}/controller`,
    `${projectName}-admin/src/main/resources/mapper`,
    `${projectName}-admin/src/test/java`,
    `${projectName}-common/src/main/java/${basePackagePath}/common/core`,
    `${projectName}-common/src/main/java/${basePackagePath}/common/constant`,
    `${projectName}-common/src/main/java/${basePackagePath}/common/enums`,
    `${projectName}-common/src/main/java/${basePackagePath}/common/exception`,
    `${projectName}-common/src/main/java/${basePackagePath}/common/annotation`,
    `${projectName}-common/src/main/java/${basePackagePath}/common/util`,
    `${projectName}-framework/src/main/java/${basePackagePath}/framework/config`,
    `${projectName}-framework/src/main/java/${basePackagePath}/framework/security`,
    `${projectName}-framework/src/main/java/${basePackagePath}/framework/aspectj`,
    `${projectName}-framework/src/main/java/${basePackagePath}/framework/interceptor`,
    `${projectName}-framework/src/main/java/${basePackagePath}/framework/manager`,
    `${projectName}-framework/src/main/java/${basePackagePath}/framework/web`,
  ]

  for (const dir of moduleDirs) {
    const fullPath = path.join(rootDir, dir)
    if (ensureDir(fullPath)) {
      log(`目录: ${dir}/`)
      dirCount++
    }
  }

  // 创建业务模块
  if (modules.length > 0) {
    title('🧩 创建业务模块...')
    for (const mod of modules) {
      const modBase = `${projectName}-system/src/main/java/${basePackagePath}/system`
      const dirs = [
        `${modBase}/controller`,
        `${modBase}/service/impl`,
        `${modBase}/mapper`,
        `${modBase}/domain/vo`,
        `${modBase}/domain/dto/query`,
        `${modBase}/domain/dto/req`,
        `${modBase}/domain/bo`,
      ]

      for (const dir of dirs) {
        const fullPath = path.join(rootDir, dir)
        if (ensureDir(fullPath)) {
          log(`目录: ${dir}/`)
          dirCount++
        }
      }

      // 创建 Mapper XML 目录
      const mapperXmlDir = path.join(rootDir, `${projectName}-admin/src/main/resources/mapper`)
      ensureDir(mapperXmlDir)

      info(`业务模块 "${mod}" 目录已创建`)
    }
  }

  return dirCount
}

/**
 * 生成模板文件
 */
function scaffoldFiles(rootDir, mode, projectName, basePackage, basePackagePath, modules) {
  title('📝 创建模板文件...')

  let fileCount = 0
  let templates = getTemplates(projectName, basePackage, basePackagePath)

  if (mode === 'multimodule') {
    templates = { ...templates, ...getMultiModuleTemplates(projectName, basePackage, basePackagePath) }

    // 为每个业务模块生成模板文件
    for (const mod of modules) {
      const featureTemplates = getFeatureModuleTemplates(projectName, basePackage, basePackagePath, mod)
      Object.assign(templates, featureTemplates)
    }
  }

  for (const [relativePath, content] of Object.entries(templates)) {
    const fullPath = path.join(rootDir, relativePath)
    if (writeFileIfNotExists(fullPath, content)) {
      log(`文件: ${relativePath}`)
      fileCount++
    } else {
      warn(`跳过（已存在）: ${relativePath}`)
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
    basePackage: null,
  }

  for (const arg of args) {
    if (arg.startsWith('--mode=')) {
      result.mode = arg.split('=')[1]
    } else if (arg.startsWith('--modules=')) {
      result.modules = arg.split('=')[1].split(',').map(s => s.trim()).filter(Boolean)
    } else if (arg.startsWith('--package=')) {
      result.basePackage = arg.split('=')[1]
    } else if (!arg.startsWith('--')) {
      result.targetDir = arg
    }
  }

  return result
}

/**
 * 从项目名推导默认包名
 */
function deriveBasePackage(projectName) {
  // 将 kebab-case 项目名转为合法包名片段
  return 'com.ruoyi.' + projectName.replace(/-/g, '').toLowerCase()
}

/**
 * 主函数
 */
function main() {
  const { targetDir, mode, modules, basePackage: inputPackage } = parseArgs(process.argv)

  if (!targetDir) {
    error('请指定项目路径')
    console.log('')
    console.log('用法: node tools/scaffold.js <项目路径> [--mode=single|multimodule] [--modules=user,order] [--package=com.example.app]')
    console.log('')
    console.log('示例:')
    console.log('  node tools/scaffold.js ./my-app')
    console.log('  node tools/scaffold.js ./my-app --modules=user,order,product')
    console.log('  node tools/scaffold.js ./my-app --mode=multimodule --modules=system,monitor')
    console.log('  node tools/scaffold.js ./my-app --package=com.example.myapp')
    process.exit(1)
  }

  if (!['single', 'multimodule'].includes(mode)) {
    error(`无效的模式: ${mode}，可选值: single, multimodule`)
    process.exit(1)
  }

  const rootDir = path.resolve(targetDir)
  const projectName = path.basename(rootDir)
  const basePackage = inputPackage || deriveBasePackage(projectName)
  const basePackagePath = basePackage.replace(/\./g, '/')

  console.log('')
  console.log(`${colors.cyan}╔══════════════════════════════════════════════╗${colors.reset}`)
  console.log(`${colors.cyan}║  Java Project Standard - Scaffold Tool       ║${colors.reset}`)
  console.log(`${colors.cyan}╚══════════════════════════════════════════════╝${colors.reset}`)
  console.log('')
  info(`目标路径: ${rootDir}`)
  info(`项目名称: ${projectName}`)
  info(`项目模式: ${mode}`)
  info(`基础包名: ${basePackage}`)
  if (modules.length > 0) {
    info(`业务模块: ${modules.join(', ')}`)
  }

  // 创建根目录
  ensureDir(rootDir)

  // 生成目录结构
  let dirCount = 0
  if (mode === 'single') {
    dirCount = scaffoldSingleApp(rootDir, basePackagePath, modules)
  } else {
    dirCount = scaffoldMultimodule(rootDir, projectName, basePackagePath, modules)
  }

  // 生成模板文件
  const fileCount = scaffoldFiles(rootDir, mode, projectName, basePackage, basePackagePath, modules)

  // 完成
  console.log('')
  console.log(`${colors.green}══════════════════════════════════════════════${colors.reset}`)
  log(`完成！共创建 ${dirCount} 个目录，${fileCount} 个模板文件`)
  console.log('')
  info('下一步:')
  console.log(`  cd ${targetDir}`)
  console.log('  mvn clean install')
  console.log('  mvn spring-boot:run')
  console.log('')
}

main()
