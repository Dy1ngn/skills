# React Native Project Standard

React Native 移动端项目工程规范 Skill，用于在 Claude 开发过程中自动按规范放置文件、命名变量，并生成标准化的项目骨架。

基于 Ignite (Infinite Red)、Obytes App Template、Bulletproof React、Expo Router 等大型商用 React Native 项目的最佳实践总结而成。

---

## 技术栈基线

| 类别 | 推荐方案 |
|------|----------|
| 框架 | React Native 0.74+ / Expo SDK 51+ |
| 语言 | TypeScript 5.x |
| 导航 | React Navigation 6+ / Expo Router |
| 状态管理 | Zustand / MobX-State-Tree |
| 数据获取 | TanStack Query (React Query) |
| 表单 | react-hook-form + Zod |
| 样式 | NativeWind (Tailwind) / StyleSheet |
| 包管理器 | pnpm |
| 测试 | Jest + React Native Testing Library |
| 代码规范 | ESLint + Prettier + Husky + lint-staged |
| 持久化 | AsyncStorage / MMKV |
| 网络请求 | Axios |

---

## 项目结构规范

### 模式 A：Feature-Based（推荐，适用于 5+ 业务模块）

此模式以业务功能为组织核心，每个 Feature 模块包含自己的组件、Hook、API、状态、类型和页面。适用于中大型商业应用。

```
src/
├── app/                          # 应用入口
│   ├── App.tsx                   # 根组件
│   └── providers/               # Context Providers
│       ├── QueryProvider.tsx     # TanStack Query Provider
│       ├── ThemeProvider.tsx     # 主题 Provider
│       └── index.ts
│
├── features/                     # 业务功能模块
│   ├── auth/                     # 认证模块
│   │   ├── components/           # 模块私有组件
│   │   │   ├── LoginForm.tsx
│   │   │   └── SocialButtons.tsx
│   │   ├── hooks/                # 模块私有 Hooks
│   │   │   └── useLogin.ts
│   │   ├── api/                  # 模块私有 API
│   │   │   └── auth.api.ts
│   │   ├── store/                # 模块私有状态
│   │   │   └── authStore.ts
│   │   ├── types/                # 模块私有类型
│   │   │   └── auth.types.ts
│   │   ├── screens/              # 页面组件
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── utils/
│   │   ├── constants/
│   │   └── index.ts              # Barrel export
│   │
│   ├── feed/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── store/
│   │   ├── types/
│   │   ├── screens/
│   │   │   └── FeedScreen.tsx
│   │   └── index.ts
│   └── profile/
│       └── ...
│
├── navigation/                   # 导航配置
│   ├── AppNavigator.tsx          # 根导航器
│   ├── MainTabNavigator.tsx      # Tab 导航
│   ├── AuthStackNavigator.tsx    # 认证流程导航
│   └── navigation.types.ts      # 导航类型定义
│
├── shared/                       # 跨模块共享
│   ├── components/
│   │   ├── ui/                   # 通用 UI 组件
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── index.ts
│   │   ├── feedback/             # 状态反馈组件
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── EmptyState.tsx
│   │   └── business/             # 业务感知组件
│   │       ├── UserAvatar.tsx
│   │       └── StatusBadge.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePagination.ts
│   │   ├── useDebounce.ts
│   │   └── index.ts
│   ├── api/
│   │   ├── client.ts             # Axios 实例 + 拦截器
│   │   ├── types.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── format.ts
│   │   ├── storage.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── common.ts
│   │   └── index.ts
│   └── constants/
│       ├── colors.ts
│       ├── dimensions.ts
│       └── index.ts
│
├── theme/                        # 主题配置
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── index.ts
│
├── i18n/                         # 国际化
│   ├── en.json
│   ├── zh.json
│   └── index.ts
│
└── assets/                       # 静态资源
    ├── images/
    ├── fonts/
    └── animations/
```

### 模式 B：Expo Router（文件路由）

此模式利用 Expo Router 的文件系统路由机制，目录结构即路由结构。适用于 Expo 项目或新启动的项目。

```
app/
├── _layout.tsx                  # 根布局
├── index.tsx                    # 首页/重定向
├── (tabs)/
│   ├── _layout.tsx             # Tab 导航布局
│   ├── index.tsx               # 首页 Tab
│   ├── explore.tsx             # 发现 Tab
│   └── profile.tsx             # 我的 Tab
├── (auth)/
│   ├── _layout.tsx             # 认证栈布局
│   ├── login.tsx
│   └── register.tsx
├── [id].tsx                    # 动态路由
└── modal.tsx                   # 弹窗页面
```

Expo Router 模式下的共享代码结构与模式 A 相同，区别仅在于页面路由由文件系统自动管理。

---

## 命名规范速查表

### 文件命名

| 类别 | 规范 | 示例 |
|------|------|------|
| 页面组件 | PascalCase + `Screen` 后缀 | `LoginScreen.tsx`、`FeedScreen.tsx` |
| UI 组件 | PascalCase | `Button.tsx`、`PrimaryButton.tsx`、`UserAvatar.tsx` |
| 布局组件 | PascalCase + `Layout` 后缀 | `AuthLayout.tsx`、`MainLayout.tsx` |
| 自定义 Hook | camelCase + `use` 前缀 | `useAuth.ts`、`usePagination.ts` |
| Zustand Store | camelCase + `Store` 后缀 | `authStore.ts`、`feedStore.ts` |
| MST Model | PascalCase + `Model` 后缀 | `AuthModel.ts`、`UserModel.ts` |
| API 模块 | camelCase + `.api.ts` 后缀 | `auth.api.ts`、`user.api.ts` |
| 类型文件 | camelCase + `.types.ts` 后缀 | `auth.types.ts`、`navigation.types.ts` |
| 导航器 | PascalCase + `Navigator` 后缀 | `AppNavigator.tsx`、`AuthStackNavigator.tsx` |
| 测试文件 | 同名 + `.test.ts(x)` | `authStore.test.ts`、`LoginScreen.test.tsx` |
| 常量文件 | camelCase | `colors.ts`、`dimensions.ts` |
| Provider 文件 | PascalCase + `Provider` 后缀 | `ThemeProvider.tsx`、`QueryProvider.tsx` |

### 变量与类型命名

| 类别 | 规范 | 示例 |
|------|------|------|
| 变量/函数 | camelCase | `userName`、`fetchUserData` |
| 组件/类型 | PascalCase | `LoginScreen`、`UserProfile` |
| 布尔值 | `is`/`has`/`should`/`can` 前缀 | `isLoading`、`hasError`、`canSubmit` |
| 常量对象 | `as const` + PascalCase/camelCase | `AppColors`、`Layout` |
| 路由名 | PascalCase | `Login`、`UserProfile`、`SettingsDetail` |
| 样式对象 | `$` 前缀 (Ignite 风格) | `$root`、`$header`、`$container` |
| 泛型参数 | 单大写或语义缩写 | `T`、`TData`、`TResponse` |
| 接口 | PascalCase，不加 `I` 前缀 | `UserInfo`、`ApiResponse` |

---

## 代码编写规范

### 1. 页面组件结构（Ignite 风格）

```tsx
// features/auth/screens/LoginScreen.tsx
import React, { FC } from 'react'
import { View, TextInput, Text } from 'react-native'
import { observer } from 'mobx-react-lite' // 或不使用 observer

import { useLogin } from '../hooks/useLogin'
import { Button } from '@/shared/components/ui/Button'
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary'
import type { AuthStackScreenProps } from '@/navigation/navigation.types'
import { $root, $header, $input, $buttonWrapper } from './login.styles'

interface LoginScreenProps extends AuthStackScreenProps<'Login'> {}

export const LoginScreen: FC<LoginScreenProps> = observer(function LoginScreen(props) {
  const { navigation } = props
  const { email, password, isLoading, error, setEmail, setPassword, handleLogin } = useLogin()

  return (
    <ErrorBoundary>
      <View style={$root}>
        <Text style={$header}>欢迎登录</Text>

        <TextInput
          style={$input}
          placeholder="邮箱"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={$input}
          placeholder="密码"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error && <Text style={$errorText}>{error}</Text>}

        <View style={$buttonWrapper}>
          <Button
            text="登录"
            onPress={handleLogin}
            loading={isLoading}
          />
        </View>
      </View>
    </ErrorBoundary>
  )
})

// login.styles.ts
import { StyleSheet } from 'react-native'
import { colors, spacing } from '@/theme'

export const $root = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
}).root

export const $header = {
  fontSize: 28,
  fontWeight: '700' as const,
  marginBottom: spacing.xl,
  color: colors.text,
}

export const $input = {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 8,
  padding: spacing.md,
  marginBottom: spacing.md,
  fontSize: 16,
}

export const $buttonWrapper = {
  marginTop: spacing.md,
}
```

### 2. 自定义 Hook 模式

```tsx
// features/auth/hooks/useLogin.ts
import { useState, useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth.api'

export function useLogin() {
  const navigation = useNavigation()
  const { setUser, setToken } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      setError('请填写邮箱和密码')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await authApi.login({ email, password })
      setToken(response.token)
      setUser(response.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [email, password, setUser, setToken])

  return {
    email,
    password,
    isLoading,
    error,
    setEmail,
    setPassword,
    handleLogin,
  }
}
```

### 3. Zustand Store（带持久化）

```tsx
// features/auth/store/authStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { User } from '../types/auth.types'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  setToken: (token: string | null) => void
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setToken: (token) =>
        set({ token, isAuthenticated: !!token }),

      setUser: (user) =>
        set({ user }),

      logout: () =>
        set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
)
```

### 4. MobX-State-Tree Model

```tsx
// features/auth/store/AuthModel.ts
import { types, flow, Instance } from 'mobx-state-tree'
import { authApi } from '../api/auth.api'

const UserModel = types.model('User', {
  id: types.identifier,
  email: types.string,
  name: types.string,
  avatar: types.maybeNull(types.string),
})

export const AuthModel = types
  .model('Auth', {
    token: types.maybeNull(types.string),
    user: types.maybeNull(UserModel),
    isLoading: types.optional(types.boolean, false),
  })
  .views((self) => ({
    get isAuthenticated() {
      return !!self.token
    },
  }))
  .actions((self) => ({
    setToken(token: string | null) {
      self.token = token
    },
    setUser(user: Instance<typeof UserModel> | null) {
      self.user = user
    },
  }))
  .actions((self) => ({
    login: flow(function* (email: string, password: string) {
      self.isLoading = true
      try {
        const response = yield authApi.login({ email, password })
        self.token = response.token
        self.user = response.user
      } catch (error) {
        throw error
      } finally {
        self.isLoading = false
      }
    }),
    logout() {
      self.token = null
      self.user = null
    },
  }))

export type AuthInstance = Instance<typeof AuthModel>
```

### 5. API 客户端（Axios 实例 + 拦截器）

遵循 api-contract 接口契约规范，响应格式统一为 `{ status, data, message }`，状态码 `000000` 表示成功。

```tsx
// shared/api/client.ts
import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ApiException } from './api-exception'
import { STATUS_CODES } from '../constants/status-codes'

const API_BASE_URL = 'https://api.example.com'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：附加 Token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem('auth-token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  }
)

// 响应拦截器：遵循 api-contract 统一响应格式和状态码规范
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const { status, data, message } = response.data
    if (status === STATUS_CODES.SUCCESS) {
      return data  // 直接返回业务数据
    }
    // 业务错误
    throw new ApiException(status, message)
  },
  async (error) => {
    const originalRequest = error.config

    // HTTP 错误映射为 api-contract 状态码
    const httpStatus = error.response?.status
    const contractStatus = httpStatus === 401 ? STATUS_CODES.UNAUTHORIZED
      : httpStatus === 403 ? STATUS_CODES.FORBIDDEN
      : httpStatus === 404 ? STATUS_CODES.NOT_FOUND
      : STATUS_CODES.INTERNAL_ERROR

    if (httpStatus === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = await AsyncStorage.getItem('refresh-token')
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        })
        await AsyncStorage.setItem('auth-token', data.token)
        processQueue(null, data.token)
        originalRequest.headers.Authorization = `Bearer ${data.token}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        await AsyncStorage.multiRemove(['auth-token', 'refresh-token'])
        // 导航到登录页
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    throw new ApiException(contractStatus, error.message)
  }
)

export { apiClient }
```

### 6. Feature API 模块

遵循 api-contract 接口定义，路径参数 `:paramName` 转为模板字符串 `${paramName}`。拦截器已解包响应，API 方法直接返回业务数据类型。

```tsx
// features/auth/api/auth.api.ts
import { apiClient } from '@/shared/api/client'
import type { PageResult } from '@/shared/api/types'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenResponse,
  FeedItem,
  PageRequest,
  UserProfile,
} from '../types/auth.types'

export const authApi = {
  // POST 登录：data 为业务对象
  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiClient.post('/auth/login', data),

  register: (data: RegisterRequest): Promise<RegisterResponse> =>
    apiClient.post('/auth/register', data),

  // POST/PUT/DELETE：data 为 true/false
  logout: (): Promise<boolean> =>
    apiClient.post('/auth/logout'),

  refreshToken: (refreshToken: string): Promise<RefreshTokenResponse> =>
    apiClient.post('/auth/refresh', { refreshToken }),

  // GET 详情：data 为业务对象
  getProfile: (): Promise<LoginResponse['user']> =>
    apiClient.get('/auth/profile'),

  updateProfile: (data: Partial<LoginResponse['user']>): Promise<boolean> =>
    apiClient.put('/auth/profile', data),

  // GET /list 接口：data 为 PageResult<T>
  getFeedList: (params: PageRequest): Promise<PageResult<FeedItem>> =>
    apiClient.get('/feed/list', { params }),

  // 路径参数转换：:id → ${id}
  getUserProfile: (id: string): Promise<UserProfile> =>
    apiClient.get(`/users/${id}/profile`),
}
```

### 7. 导航配置（类型安全）

```tsx
// navigation/AppNavigator.tsx
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuthStore } from '@/features/auth/store/authStore'
import { AuthStackNavigator } from './AuthStackNavigator'
import { MainTabNavigator } from './MainTabNavigator'
import type { RootStackParamList } from './navigation.types'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStackNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

// navigation/navigation.types.ts
import type { NavigatorScreenParams } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { CompositeScreenProps } from '@react-navigation/native'

// ---- Auth Stack ----
export type AuthStackParamList = {
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
}

// ---- Main Tab ----
export type MainTabParamList = {
  Feed: undefined
  Explore: undefined
  Profile: undefined
}

// ---- Root Stack ----
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>
  Main: NavigatorScreenParams<MainTabParamList>
  Modal: { title: string }
  Settings: undefined
}

// ---- 屏幕 Props 类型 ----
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >

// ---- 全局类型扩展 ----
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

### 8. 表单处理（react-hook-form + Zod）

```tsx
// features/auth/components/RegisterForm.tsx
import React from 'react'
import { View, TextInput, Text } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/Button'

const registerSchema = z.object({
  name: z.string().min(2, '姓名至少 2 个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少 8 位').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    '密码需包含大小写字母和数字'
  ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>
  isLoading?: boolean
}

export function RegisterForm({ onSubmit, isLoading }: RegisterFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  return (
    <View>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              placeholder="姓名"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            {errors.name && <Text>{errors.name.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              placeholder="邮箱"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text>{errors.email.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              placeholder="密码"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
            />
            {errors.password && <Text>{errors.password.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              placeholder="确认密码"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
            />
            {errors.confirmPassword && (
              <Text>{errors.confirmPassword.message}</Text>
            )}
          </View>
        )}
      />

      <Button
        text="注册"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
      />
    </View>
  )
}
```

### 9. 主题与样式

```tsx
// theme/colors.ts
const lightColors = {
  primary: '#007AFF',
  primaryDark: '#0056CC',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#FFFFFF',
  surface: '#F2F2F7',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#C6C6C8',
  card: '#FFFFFF',
  notification: '#FF3B30',
} as const

const darkColors = {
  primary: '#0A84FF',
  primaryDark: '#409CFF',
  secondary: '#5E5CE6',
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  background: '#000000',
  surface: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  card: '#1C1C1E',
  notification: '#FF453A',
} as const

export const AppColors = {
  light: lightColors,
  dark: darkColors,
} as const

export type ColorScheme = keyof typeof AppColors
export type Colors = typeof lightColors

// theme/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

// theme/typography.ts
export const typography = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    heading: 28,
    title: 34,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const

// theme/index.ts
export { AppColors, type Colors, type ColorScheme } from './colors'
export { spacing } from './spacing'
export { typography } from './typography'

// 使用 NativeWind (Tailwind) 的方式
// <View className="flex-1 bg-white dark:bg-black p-4">
//   <Text className="text-lg font-bold text-gray-900 dark:text-white">
//     Hello
//   </Text>
// </View>
```

### 10. ErrorBoundary

```tsx
// shared/components/feedback/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 上报错误到监控平台
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>出错了</Text>
          <Text style={styles.message}>
            {this.state.error?.message || '发生了未知错误'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>重试</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})
```

### 11. TanStack Query（React Query）

```tsx
// shared/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/features/auth/api/auth.api'
import { useAuthStore } from '@/features/auth/store/authStore'

// Query Keys 工厂
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
  },
  feed: {
    all: ['feed'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.feed.all, 'list', params] as const,
    detail: (id: string) =>
      [...queryKeys.feed.all, 'detail', id] as const,
  },
  user: {
    all: ['user'] as const,
    detail: (id: string) =>
      [...queryKeys.user.all, 'detail', id] as const,
  },
} as const

// 获取用户资料
export function useProfile() {
  return useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: () => authApi.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 分钟
  })
}

// 分页列表
export function useFeedList(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: queryKeys.feed.list(params),
    queryFn: () => feedApi.getList(params),
    keepPreviousData: true,
  })
}

// 无限滚动（遵循 api-contract 分页约定）
export function useInfiniteFeed() {
  return useInfiniteQuery<PageResult<FeedItem>>({
    queryKey: queryKeys.feed.all,
    queryFn: ({ pageParam = 1 }) =>
      feedApi.getList({ pageNum: pageParam, pageSize: 20 }),
    getNextPageParam: (lastPage) => {
      const { pageNum, totalPages } = lastPage.pageInfo;
      return pageNum < totalPages ? pageNum + 1 : undefined;
    },
    initialPageParam: 1,
  })
}

// 登录 Mutation
export function useLoginMutation() {
  const queryClient = useQueryClient()
  const { setToken, setUser } = useAuthStore()

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authApi.login(data),
    onSuccess: (data) => {
      setToken(data.token)
      setUser(data.user)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all })
    },
  })
}

// 登出 Mutation
export function useLogoutMutation() {
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout()
      queryClient.clear()
    },
  })
}
```

### 12. 常量定义

```tsx
// shared/constants/colors.ts
import { Dimensions } from 'react-native'

export const AppColors = {
  primary: '#007AFF',
  primaryDark: '#0056CC',
  primaryLight: '#4DA3FF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
} as const

// shared/constants/dimensions.ts
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

export const Layout = {
  window: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  isSmallDevice: SCREEN_WIDTH < 375,
  headerHeight: 44,
  tabBarHeight: 49,
  statusBarHeight: 44, // iOS 刘海屏
  bottomInset: 34,     // iOS 底部安全区
  screenPadding: 16,
  cardBorderRadius: 12,
} as const

export const API_CONFIG = {
  BASE_URL: 'https://api.example.com',
  TIMEOUT: 15000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
} as const

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth-token',
  REFRESH_TOKEN: 'refresh-token',
  USER_DATA: 'user-data',
  THEME: 'app-theme',
  LANGUAGE: 'app-language',
  ONBOARDING_COMPLETED: 'onboarding-completed',
} as const
```

---

## 导航类型定义模式

React Navigation 需要全局类型声明以获得完整的类型推导支持：

```typescript
// navigation/navigation.types.ts
import type { NavigatorScreenParams } from '@react-navigation/native'

type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>
  Main: NavigatorScreenParams<MainTabParamList>
  Modal: { title: string }
}

// 全局类型扩展，使 useNavigation() 自动推导
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

完成此声明后，以下代码将获得完整的类型支持：

```typescript
const navigation = useNavigation()
navigation.navigate('Modal', { title: '设置' }) // ✅ 自动推导参数
navigation.navigate('Main', { screen: 'Feed' }) // ✅ 嵌套导航类型安全
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
│       ├── 页面？    → screens/
│       ├── Hook？    → hooks/
│       ├── API？     → api/
│       ├── 状态？    → store/
│       ├── 类型？    → types/
│       ├── 工具？    → utils/
│       └── 常量？    → constants/
│
├── 跨多个模块复用？
│   ├── UI 组件？    → src/shared/components/ui/
│   ├── 反馈组件？   → src/shared/components/feedback/
│   ├── 业务组件？   → src/shared/components/business/
│   ├── Hook？       → src/shared/hooks/
│   ├── 工具函数？   → src/shared/utils/
│   ├── 类型定义？   → src/shared/types/
│   └── 常量？       → src/shared/constants/
│
├── 导航相关？       → src/navigation/
├── 主题相关？       → src/theme/
├── 国际化？         → src/i18n/
└── 静态资源？       → src/assets/
```

---

## 测试规范

### 文件组织

测试文件与源文件同目录放置（co-located），使用 `.test.ts(x)` 后缀：

```
features/auth/
├── hooks/
│   ├── useLogin.ts
│   └── useLogin.test.ts       # Hook 测试
├── store/
│   ├── authStore.ts
│   └── authStore.test.ts      # Store 测试
├── screens/
│   ├── LoginScreen.tsx
│   └── LoginScreen.test.tsx   # 页面测试
└── api/
    ├── auth.api.ts
    └── auth.api.test.ts       # API 测试
```

### 测试示例

```tsx
// features/auth/hooks/useLogin.test.ts
import { renderHook, act } from '@testing-library/react-hooks'
import { useLogin } from './useLogin'

describe('useLogin', () => {
  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useLogin())

    expect(result.current.email).toBe('')
    expect(result.current.password).toBe('')
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should set email', () => {
    const { result } = renderHook(() => useLogin())

    act(() => {
      result.current.setEmail('test@example.com')
    })

    expect(result.current.email).toBe('test@example.com')
  })
})
```

---

## 环境变量规范

### 文件层级

```
.env                        # 所有模式加载
.env.development            # 开发环境
.env.staging                # 预发布环境
.env.production             # 生产环境
.env.local                  # 个人本地覆盖（gitignore）
```

### React Native 环境变量

React Native 中推荐使用 `react-native-config` 或 Expo 的 `app.config.ts` 来管理环境变量：

```typescript
// app.config.ts (Expo)
export default {
  name: 'MyApp',
  extra: {
    apiUrl: process.env.API_URL || 'https://api.example.com',
    environment: process.env.NODE_ENV || 'development',
  },
}
```

---

## 接口契约集成（api-contract）

项目应遵循 [api-contract](../../api-contract/) 接口契约规范，确保前后端接口定义一致。

### 契约文件说明

项目中应维护 `api-contract.json` 接口契约文件，定义所有接口的请求/响应格式、路径参数、状态码等。契约文件可从 api-contract skill 的 `spec/` 目录同步。

### 统一响应格式

```typescript
// shared/api/types.ts
// 响应格式遵循 api-contract 接口契约规范
// 参考: d:/soft/work/skills/api-contract/spec/example-api.json
export interface ApiResponse<T = any> {
  status: string    // "000000" 表示成功
  data: T           // 业务数据
  message: string   // "success" 或错误描述
}

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

### API Client 拦截器更新

拦截器需解析 api-contract 统一响应格式，成功时直接返回 `data`，业务错误抛出 `ApiException`：

```typescript
// shared/api/client.ts
// 遵循 api-contract 统一响应格式和状态码规范
apiClient.interceptors.response.use(
  (response) => {
    const { status, data, message } = response.data;
    if (status === '000000') {
      return data;  // 直接返回业务数据
    }
    // 业务错误
    throw new ApiException(status, message);
  },
  (error) => {
    // HTTP 错误映射为 api-contract 状态码
    const status = error.response?.status;
    const contractStatus = status === 401 ? '000401'
      : status === 403 ? '000403'
      : status === 404 ? '000404'
      : '000500';
    throw new ApiException(contractStatus, error.message);
  }
);
```

### 状态码常量

```typescript
// shared/constants/status-codes.ts
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

### 自定义异常类

```typescript
// shared/api/api-exception.ts
export class ApiException extends Error {
  constructor(
    public readonly status: string,
    public readonly message: string,
  ) {
    super(message);
    this.name = 'ApiException';
  }
}
```

### 数据约定

| 接口类型 | `data` 字段结构 | 示例 |
|----------|-----------------|------|
| GET 详情 | 业务对象 | `{ id, name, email }` |
| GET /list | `{ list: T[], pageInfo: { pageNum, pageSize, total, totalPages } }` | `{ list: [...], pageInfo: { pageNum: 1, pageSize: 20, total: 100, totalPages: 5 } }` |
| POST/PUT/DELETE | `true` / `false` | `true` |

### Feature API 模块更新

Feature API 模块中，路径参数 `:paramName` 需转为模板字符串 `${paramName}`，返回类型直接使用业务类型（拦截器已解包响应）：

```typescript
// features/auth/api/auth.api.ts
// 遵循 api-contract 接口定义
// 路径参数 :paramName 转为模板字符串
export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiClient.post('/auth/login', data),

  // GET /list 接口返回 PageResult<T>
  getFeedList: (params: PageRequest): Promise<PageResult<FeedItem>> =>
    apiClient.get('/feed/list', { params }),

  // 路径参数转换：:id → ${id}
  getUserProfile: (id: string): Promise<UserProfile> =>
    apiClient.get(`/users/${id}/profile`),
};
```

### TanStack Query 集成

配合 api-contract 的分页约定，使用 `useInfiniteQuery` 实现无限滚动：

```typescript
// 配合 api-contract 的分页约定
export const useFeedList = () => {
  return useInfiniteQuery<PageResult<FeedItem>>({
    queryKey: feedKeys.list(),
    queryFn: ({ pageParam = 1 }) =>
      feedApi.getList({ pageNum: pageParam, pageSize: 20 }),
    getNextPageParam: (lastPage) => {
      const { pageNum, totalPages } = lastPage.pageInfo;
      return pageNum < totalPages ? pageNum + 1 : undefined;
    },
    initialPageParam: 1,
  });
};
```

---

## 工具命令

### 初始化项目骨架

```bash
# 使用 scaffold 工具初始化标准目录结构
node tools/scaffold.js <项目路径> [--mode=feature-based|expo-router] [--features=auth,feed,profile]
```

### 验证项目结构

```bash
# 校验现有项目是否符合规范
node tools/validate.js <项目路径>
```

---

## 最佳实践总结

1. **Feature 模块自治**：每个业务模块内部的组件、Hook、API、状态、类型应尽量自包含，通过 `index.ts` barrel export 控制对外暴露的接口
2. **共享代码分层**：`shared/` 下按职责分为 `components/`、`hooks/`、`api/`、`utils/`、`types/`、`constants/`
3. **类型安全优先**：导航、API 请求/响应、Store 状态均需定义完整类型
4. **样式规范统一**：Ignite 风格使用 `$` 前缀的样式对象，NativeWind 使用 `className`
5. **错误处理完善**：使用 ErrorBoundary 包裹页面，API 层统一拦截错误
6. **测试覆盖关键路径**：Hook、Store、页面组件需有对应测试文件
