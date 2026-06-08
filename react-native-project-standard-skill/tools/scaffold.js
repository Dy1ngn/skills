#!/usr/bin/env node

/**
 * React Native Project Standard - Scaffold Generator
 *
 * 用途：生成符合 React Native Project Standard 规范的标准目录结构
 *
 * 使用方法：
 *   node tools/scaffold.js <项目路径> [--mode=feature-based|expo-router] [--features=auth,feed,profile]
 *
 * 参数说明：
 *   <项目路径>               目标目录路径（相对或绝对）
 *   --mode=feature-based     Feature-Based 模式（默认）
 *   --mode=expo-router       Expo Router 文件路由模式
 *   --features=a,b,c         预创建的业务功能模块名称列表
 *
 * 示例：
 *   node tools/scaffold.js ./my-app
 *   node tools/scaffold.js ./my-app --mode=feature-based --features=auth,feed,profile
 *   node tools/scaffold.js ./my-expo-app --mode=expo-router --features=auth,feed
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

const FEATURE_BASED_DIRS = [
  'src/app',
  'src/app/providers',
  'src/navigation',
  'src/shared/components/ui',
  'src/shared/components/feedback',
  'src/shared/components/business',
  'src/shared/hooks',
  'src/shared/api',
  'src/shared/utils',
  'src/shared/types',
  'src/shared/constants',
  'src/theme',
  'src/i18n',
  'src/assets/images',
  'src/assets/fonts',
  'src/assets/animations',
]

const FEATURE_SUB_DIRS = [
  'components',
  'hooks',
  'api',
  'store',
  'types',
  'screens',
  'utils',
  'constants',
]

const EXPO_ROUTER_DIRS = [
  'app',
  'app/(tabs)',
  'app/(auth)',
  'src/shared/components/ui',
  'src/shared/components/feedback',
  'src/shared/components/business',
  'src/shared/hooks',
  'src/shared/api',
  'src/shared/utils',
  'src/shared/types',
  'src/shared/constants',
  'src/theme',
  'src/i18n',
  'src/assets/images',
  'src/assets/fonts',
  'src/assets/animations',
]

// ========== 模板文件 ==========

const TEMPLATE_FILES = {}

TEMPLATE_FILES['src/app/App.tsx'] = [
  'import React from \'react\'',
  'import { QueryProvider } from \'./providers/QueryProvider\'',
  'import { ThemeProvider } from \'./providers/ThemeProvider\'',
  'import { AppNavigator } from \'@/navigation/AppNavigator\'',
  '',
  'export default function App() {',
  '  return (',
  '    <QueryProvider>',
  '      <ThemeProvider>',
  '        <AppNavigator />',
  '      </ThemeProvider>',
  '    </QueryProvider>',
  '  )',
  '}',
  '',
].join('\n')

TEMPLATE_FILES['src/app/providers/index.ts'] = [
  'export { QueryProvider } from \'./QueryProvider\'',
  'export { ThemeProvider } from \'./ThemeProvider\'',
  '',
].join('\n')

TEMPLATE_FILES['src/app/providers/QueryProvider.tsx'] = [
  'import React, { FC, ReactNode } from \'react\'',
  'import { QueryClient, QueryClientProvider } from \'@tanstack/react-query\'',
  '',
  'const queryClient = new QueryClient({',
  '  defaultOptions: {',
  '    queries: {',
  '      retry: 2,',
  '      staleTime: 5 * 60 * 1000,',
  '      refetchOnWindowFocus: false,',
  '    },',
  '  },',
  '})',
  '',
  'interface QueryProviderProps {',
  '  children: ReactNode',
  '}',
  '',
  'export const QueryProvider: FC<QueryProviderProps> = ({ children }) => {',
  '  return (',
  '    <QueryClientProvider client={queryClient}>',
  '      {children}',
  '    </QueryClientProvider>',
  '  )',
  '}',
  '',
].join('\n')

TEMPLATE_FILES['src/app/providers/ThemeProvider.tsx'] = [
  'import React, { FC, ReactNode, createContext, useContext } from \'react\'',
  'import { useColorScheme } from \'react-native\'',
  'import { AppColors, type ColorScheme, type Colors } from \'@/theme/colors\'',
  '',
  'interface ThemeContextValue {',
  '  scheme: ColorScheme',
  '  colors: Colors',
  '  isDark: boolean',
  '}',
  '',
  'const ThemeContext = createContext<ThemeContextValue>({',
  '  scheme: \'light\',',
  '  colors: AppColors.light,',
  '  isDark: false,',
  '})',
  '',
  'export const useTheme = () => useContext(ThemeContext)',
  '',
  'interface ThemeProviderProps {',
  '  children: ReactNode',
  '}',
  '',
  'export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {',
  '  const systemScheme = useColorScheme() ?? \'light\'',
  '  const isDark = systemScheme === \'dark\'',
  '  const colors = isDark ? AppColors.dark : AppColors.light',
  '',
  '  return (',
  '    <ThemeContext.Provider value={{ scheme: systemScheme, colors, isDark }}>',
  '      {children}',
  '    </ThemeContext.Provider>',
  '  )',
  '}',
  '',
].join('\n')

TEMPLATE_FILES['src/navigation/AppNavigator.tsx'] = [
  'import React from \'react\'',
  'import { NavigationContainer } from \'@react-navigation/native\'',
  'import { createNativeStackNavigator } from \'@react-navigation/native-stack\'',
  'import { useAuthStore } from \'@/features/auth/store/authStore\'',
  'import { AuthStackNavigator } from \'./AuthStackNavigator\'',
  'import { MainTabNavigator } from \'./MainTabNavigator\'',
  'import type { RootStackParamList } from \'./navigation.types\'',
  '',
  'const Stack = createNativeStackNavigator<RootStackParamList>()',
  '',
  'export function AppNavigator() {',
  '  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)',
  '',
  '  return (',
  '    <NavigationContainer>',
  '      <Stack.Navigator screenOptions={{ headerShown: false }}>',
  '        {isAuthenticated ? (',
  '          <Stack.Screen name="Main" component={MainTabNavigator} />',
  '        ) : (',
  '          <Stack.Screen name="Auth" component={AuthStackNavigator} />',
  '        )}',
  '      </Stack.Navigator>',
  '    </NavigationContainer>',
  '  )',
  '}',
  '',
].join('\n')

TEMPLATE_FILES['src/navigation/navigation.types.ts'] = [
  'import type { NavigatorScreenParams } from \'@react-navigation/native\'',
  'import type { NativeStackScreenProps } from \'@react-navigation/native-stack\'',
  'import type { BottomTabScreenProps } from \'@react-navigation/bottom-tabs\'',
  'import type { CompositeScreenProps } from \'@react-navigation/native\'',
  '',
  '// ---- Auth Stack ----',
  'export type AuthStackParamList = {',
  '  Login: undefined',
  '  Register: undefined',
  '  ForgotPassword: undefined',
  '}',
  '',
  '// ---- Main Tab ----',
  'export type MainTabParamList = {',
  '  Feed: undefined',
  '  Explore: undefined',
  '  Profile: undefined',
  '}',
  '',
  '// ---- Root Stack ----',
  'export type RootStackParamList = {',
  '  Auth: NavigatorScreenParams<AuthStackParamList>',
  '  Main: NavigatorScreenParams<MainTabParamList>',
  '  Modal: { title: string }',
  '  Settings: undefined',
  '}',
  '',
  '// ---- 屏幕 Props 类型 ----',
  'export type RootStackScreenProps<T extends keyof RootStackParamList> =',
  '  NativeStackScreenProps<RootStackParamList, T>',
  '',
  'export type AuthStackScreenProps<T extends keyof AuthStackParamList> =',
  '  CompositeScreenProps<',
  '    NativeStackScreenProps<AuthStackParamList, T>,',
  '    NativeStackScreenProps<RootStackParamList>',
  '  >',
  '',
  'export type MainTabScreenProps<T extends keyof MainTabParamList> =',
  '  CompositeScreenProps<',
  '    BottomTabScreenProps<MainTabParamList, T>,',
  '    NativeStackScreenProps<RootStackParamList>',
  '  >',
  '',
  '// ---- 全局类型扩展 ----',
  'declare global {',
  '  namespace ReactNavigation {',
  '    interface RootParamList extends RootStackParamList {}',
  '  }',
  '}',
  '',
].join('\n')

TEMPLATE_FILES['src/shared/api/client.ts'] = [
  'import axios from \'axios\'',
  'import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from \'axios\'',
  'import AsyncStorage from \'@react-native-async-storage/async-storage\'',
  '',
  'const API_BASE_URL = \'https://api.example.com\'',
  '',
  'const apiClient: AxiosInstance = axios.create({',
  '  baseURL: API_BASE_URL,',
  '  timeout: 15000,',
  '  headers: {',
  '    \'Content-Type\': \'application/json\',',
  '  },',
  '})',
  '',
  '// 请求拦截器：附加 Token',
  'apiClient.interceptors.request.use(',
  '  async (config: InternalAxiosRequestConfig) => {',
  '    const token = await AsyncStorage.getItem(\'auth-token\')',
  '    if (token && config.headers) {',
  '      config.headers.Authorization = `Bearer ${token}`',
  '    }',
  '    return config',
  '  }',
  ')',
  '',
  '// 响应拦截器：统一错误处理',
  'let isRefreshing = false',
  'let failedQueue: Array<{',
  '  resolve: (value: unknown) => void',
  '  reject: (reason?: unknown) => void',
  '}> = []',
  '',
  'const processQueue = (error: unknown, token: string | null = null) => {',
  '  failedQueue.forEach((prom) => {',
  '    if (error) {',
  '      prom.reject(error)',
  '    } else {',
  '      prom.resolve(token)',
  '    }',
  '  })',
  '  failedQueue = []',
  '}',
  '',
  'apiClient.interceptors.response.use(',
  '  (response: AxiosResponse) => response.data,',
  '  async (error) => {',
  '    const originalRequest = error.config',
  '',
  '    if (error.response?.status === 401 && !originalRequest._retry) {',
  '      if (isRefreshing) {',
  '        return new Promise((resolve, reject) => {',
  '          failedQueue.push({ resolve, reject })',
  '        }).then((token) => {',
  '          originalRequest.headers.Authorization = `Bearer ${token}`',
  '          return apiClient(originalRequest)',
  '        })',
  '      }',
  '',
  '      originalRequest._retry = true',
  '      isRefreshing = true',
  '',
  '      try {',
  '        const refreshToken = await AsyncStorage.getItem(\'refresh-token\')',
  '        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {',
  '          refreshToken,',
  '        })',
  '        await AsyncStorage.setItem(\'auth-token\', data.token)',
  '        processQueue(null, data.token)',
  '        originalRequest.headers.Authorization = `Bearer ${data.token}`',
  '        return apiClient(originalRequest)',
  '      } catch (refreshError) {',
  '        processQueue(refreshError, null)',
  '        await AsyncStorage.multiRemove([\'auth-token\', \'refresh-token\'])',
  '        return Promise.reject(refreshError)',
  '      } finally {',
  '        isRefreshing = false',
  '      }',
  '    }',
  '',
  '    return Promise.reject(error)',
  '  }',
  ')',
  '',
  'export { apiClient }',
  '',
].join('\n')

TEMPLATE_FILES['src/shared/api/types.ts'] = [
  '/** 统一 API 响应格式 */',
  'export interface ApiResponse<T = unknown> {',
  '  code: number',
  '  data: T',
  '  message: string',
  '}',
  '',
  '/** 分页信息 */',
  'export interface PageInfo {',
  '  page: number',
  '  pageSize: number',
  '  total: number',
  '  hasNext: boolean',
  '}',
  '',
  '/** 分页列表响应 */',
  'export interface PaginatedList<T> {',
  '  list: T[]',
  '  pageInfo: PageInfo',
  '}',
  '',
  '/** 请求错误 */',
  'export interface ApiError {',
  '  code: number',
  '  message: string',
  '  details?: Record<string, string[]>',
  '}',
  '',
].join('\n')

TEMPLATE_FILES['src/shared/api/index.ts'] = [
  'export { apiClient } from \'./client\'',
  'export type { ApiResponse, PageInfo, PaginatedList, ApiError } from \'./types\'',
  '',
].join('\n')

TEMPLATE_FILES['src/shared/components/ui/Button.tsx'] = [
  'import React, { FC } from \'react\'',
  'import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from \'react-native\'',
  'import { colors, spacing } from \'@/theme\'',
  '',
  'interface ButtonProps {',
  '  text: string',
  '  onPress: () => void',
  '  variant?: \'primary\' | \'secondary\' | \'outline\' | \'ghost\'',
  '  size?: \'sm\' | \'md\' | \'lg\'',
  '  loading?: boolean',
  '  disabled?: boolean',
  '  style?: ViewStyle',
  '}',
  '',
  'export const Button: FC<ButtonProps> = ({',
  '  text, onPress, variant = \'primary\', size = \'md\',',
  '  loading = false, disabled = false, style,',
  '}) => {',
  '  const isDisabled = disabled || loading',
  '  return (',
  '    <TouchableOpacity',
  '      style={[styles.base, styles[\'variant_\' + variant], styles[\'size_\' + size], isDisabled && styles.disabled, style]}',
  '      onPress={onPress} disabled={isDisabled} activeOpacity={0.7}',
  '    >',
  '      {loading ? (',
  '        <ActivityIndicator size="small" color={variant === \'primary\' ? \'#FFFFFF\' : colors.primary} />',
  '      ) : (',
  '        <Text style={[styles.text, styles[\'text_\' + variant], styles[\'textSize_\' + size]]}>{text}</Text>',
  '      )}',
  '    </TouchableOpacity>',
  '  )',
  '}',
  '',
  'const styles = StyleSheet.create({',
  '  base: { borderRadius: 8, alignItems: \'center\', justifyContent: \'center\', flexDirection: \'row\' },',
  '  variant_primary: { backgroundColor: colors.primary },',
  '  variant_secondary: { backgroundColor: colors.surface },',
  '  variant_outline: { backgroundColor: \'transparent\', borderWidth: 1, borderColor: colors.primary },',
  '  variant_ghost: { backgroundColor: \'transparent\' },',
  '  size_sm: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, minHeight: 32 },',
  '  size_md: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 44 },',
  '  size_lg: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, minHeight: 52 },',
  '  disabled: { opacity: 0.5 },',
  '  text: { fontWeight: \'600\' },',
  '  text_primary: { color: \'#FFFFFF\' },',
  '  text_secondary: { color: colors.text },',
  '  text_outline: { color: colors.primary },',
  '  text_ghost: { color: colors.primary },',
  '  textSize_sm: { fontSize: 12 },',
  '  textSize_md: { fontSize: 16 },',
  '  textSize_lg: { fontSize: 18 },',
  '})',
  '',
].join('\n')

TEMPLATE_FILES['src/shared/components/ui/index.ts'] = [
  'export { Button } from \'./Button\'',
  '',
].join('\n')

TEMPLATE_FILES['src/shared/components/feedback/ErrorBoundary.tsx'] = [
  'import React, { Component, ErrorInfo, ReactNode } from \'react\'',
  'import { View, Text, TouchableOpacity, StyleSheet } from \'react-native\'',
  '',
  'interface Props { children: ReactNode; fallback?: ReactNode }',
  'interface State { hasError: boolean; error: Error | null }',
  '',
  'export class ErrorBoundary extends Component<Props, State> {',
  '  constructor(props: Props) {',
  '    super(props)',
  '    this.state = { hasError: false, error: null }',
  '  }',
  '',
  '  static getDerivedStateFromError(error: Error): State {',
  '    return { hasError: true, error }',
  '  }',
  '',
  '  componentDidCatch(error: Error, errorInfo: ErrorInfo) {',
  '    console.error(\'ErrorBoundary caught:\', error, errorInfo)',
  '  }',
  '',
  '  handleReset = () => { this.setState({ hasError: false, error: null }) }',
  '',
  '  render() {',
  '    if (this.state.hasError) {',
  '      if (this.props.fallback) return this.props.fallback',
  '      return (',
  '        <View style={styles.container}>',
  '          <Text style={styles.title}>出错了</Text>',
  '          <Text style={styles.message}>{this.state.error?.message || \'发生了未知错误\'}</Text>',
  '          <TouchableOpacity style={styles.button} onPress={this.handleReset}>',
  '            <Text style={styles.buttonText}>重试</Text>',
  '          </TouchableOpacity>',
  '        </View>',
  '      )',
  '    }',
  '    return this.props.children',
  '  }',
  '}',
  '',
  'const styles = StyleSheet.create({',
  '  container: { flex: 1, justifyContent: \'center\', alignItems: \'center\', padding: 24 },',
  '  title: { fontSize: 20, fontWeight: \'700\', marginBottom: 8 },',
  '  message: { fontSize: 14, color: \'#8E8E93\', textAlign: \'center\', marginBottom: 24 },',
  '  button: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: \'#007AFF\', borderRadius: 8 },',
  '  buttonText: { color: \'#FFFFFF\', fontSize: 16, fontWeight: \'600\' },',
  '})',
  '',
].join('\n')

TEMPLATE_FILES['src/shared/components/feedback/index.ts'] = [
  'export { ErrorBoundary } from \'./ErrorBoundary\'',
  '',
].join('\n')

TEMPLATE_FILES['src/shared/hooks/useAuth.ts'] = [
  'import { useAuthStore } from \'@/features/auth/store/authStore\'',
  '',
  'export const queryKeys = {',
  '  auth: { all: [\'auth\'] as const, profile: () => [\'auth\', \'profile\'] as const },',
  '  feed: { all: [\'feed\'] as const, list: (p?: Record<string, unknown>) => [\'feed\', \'list\', p] as const, detail: (id: string) => [\'feed\', \'detail\', id] as const },',
  '  user: { all: [\'user\'] as const, detail: (id: string) => [\'user\', \'detail\', id] as const },',
  '} as const',
  '',
  'export function useIsLoggedIn() {',
  '  return useAuthStore((state) => state.isAuthenticated)',
  '}',
  '',
].join('\n')

TEMPLATE_FILES['src/shared/hooks/index.ts'] = [
  'export { useIsLoggedIn, queryKeys } from \'./useAuth\'',
  '',
].join('\n')

TEMPLATE_FILES['src/shared/constants/colors.ts'] = [
  'export const AppColors = {',
  '  primary: \'#007AFF\', primaryDark: \'#0056CC\', primaryLight: \'#4DA3FF\',',
  '  secondary: \'#5856D6\', success: \'#34C759\', warning: \'#FF9500\', error: \'#FF3B30\', info: \'#007AFF\',',
  '  white: \'#FFFFFF\', black: \'#000000\', transparent: \'transparent\',',
  '  gray50: \'#F9FAFB\', gray100: \'#F3F4F6\', gray200: \'#E5E7EB\', gray300: \'#D1D5DB\',',
  '  gray400: \'#9CA3AF\', gray500: \'#6B7280\', gray600: \'#4B5563\', gray700: \'#374151\',',
  '  gray800: \'#1F2937\', gray900: \'#111827\',',
  '} as const',
  '',
].join('\n')

TEMPLATE_FILES['src/shared/constants/dimensions.ts'] = [
  'import { Dimensions } from \'react-native\'',
  '',
  'const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get(\'window\')',
  '',
  'export const Layout = {',
  '  window: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },',
  '  isSmallDevice: SCREEN_WIDTH < 375,',
  '  headerHeight: 44, tabBarHeight: 49, statusBarHeight: 44, bottomInset: 34,',
  '  screenPadding: 16, cardBorderRadius: 12,',
  '} as const',
  '',
  'export const API_CONFIG = { BASE_URL: \'https://api.example.com\', TIMEOUT: 15000, RETRY_COUNT: 3, RETRY_DELAY: 1000 } as const',
  '',
  'export const STORAGE_KEYS = {',
  '  AUTH_TOKEN: \'auth-token\', REFRESH_TOKEN: \'refresh-token\', USER_DATA: \'user-data\',',
  '  THEME: \'app-theme\', LANGUAGE: \'app-language\', ONBOARDING_COMPLETED: \'onboarding-completed\',',
  '} as const',
  '',
].join('\n')

TEMPLATE_FILES['src/shared/constants/index.ts'] = [
  'export { AppColors } from \'./colors\'',
  'export { Layout, API_CONFIG, STORAGE_KEYS } from \'./dimensions\'',
  '',
].join('\n')

TEMPLATE_FILES['src/shared/types/common.ts'] = [
  'export type Nullable<T> = T | null',
  'export type Optional<T> = T | undefined',
  'export type DeepReadonly<T> = { readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P] }',
  'export interface BaseEntity { id: string; createdAt?: string; updatedAt?: string }',
  '',
].join('\n')

TEMPLATE_FILES['src/shared/types/index.ts'] = [
  'export type { Nullable, Optional, DeepReadonly, BaseEntity } from \'./common\'',
  '',
].join('\n')

TEMPLATE_FILES['src/theme/colors.ts'] = [
  'const lightColors = { primary: \'#007AFF\', primaryDark: \'#0056CC\', secondary: \'#5856D6\', success: \'#34C759\', warning: \'#FF9500\', error: \'#FF3B30\', background: \'#FFFFFF\', surface: \'#F2F2F7\', text: \'#000000\', textSecondary: \'#8E8E93\', border: \'#C6C6C8\', card: \'#FFFFFF\', notification: \'#FF3B30\' } as const',
  'const darkColors = { primary: \'#0A84FF\', primaryDark: \'#409CFF\', secondary: \'#5E5CE6\', success: \'#30D158\', warning: \'#FF9F0A\', error: \'#FF453A\', background: \'#000000\', surface: \'#1C1C1E\', text: \'#FFFFFF\', textSecondary: \'#8E8E93\', border: \'#38383A\', card: \'#1C1C1E\', notification: \'#FF453A\' } as const',
  'export const AppColors = { light: lightColors, dark: darkColors } as const',
  'export type ColorScheme = keyof typeof AppColors',
  'export type Colors = typeof lightColors',
  'export const colors = lightColors',
  '',
].join('\n')

TEMPLATE_FILES['src/theme/spacing.ts'] = [
  'export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const',
  '',
].join('\n')

TEMPLATE_FILES['src/theme/typography.ts'] = [
  'export const typography = {',
  '  sizes: { xs: 10, sm: 12, md: 14, base: 16, lg: 18, xl: 20, xxl: 24, heading: 28, title: 34 },',
  '  weights: { regular: \'400\' as const, medium: \'500\' as const, semibold: \'600\' as const, bold: \'700\' as const },',
  '  lineHeights: { tight: 1.2, normal: 1.5, relaxed: 1.75 },',
  '} as const',
  '',
].join('\n')

TEMPLATE_FILES['src/theme/index.ts'] = [
  'export { AppColors, colors, type Colors, type ColorScheme } from \'./colors\'',
  'export { spacing } from \'./spacing\'',
  'export { typography } from \'./typography\'',
  '',
].join('\n')

// Expo Router 专用模板
const EXPO_ROUTER_TEMPLATES = {}

EXPO_ROUTER_TEMPLATES['app/_layout.tsx'] = [
  'import React from \'react\'',
  'import { Stack } from \'expo-router\'',
  'import { QueryProvider } from \'@/app/providers/QueryProvider\'',
  'import { ThemeProvider } from \'@/app/providers/ThemeProvider\'',
  '',
  'export default function RootLayout() {',
  '  return (',
  '    <QueryProvider>',
  '      <ThemeProvider>',
  '        <Stack screenOptions={{ headerShown: false }}>',
  '          <Stack.Screen name="(tabs)" />',
  '          <Stack.Screen name="(auth)" />',
  '          <Stack.Screen name="modal" options={{ presentation: \'modal\' }} />',
  '        </Stack>',
  '      </ThemeProvider>',
  '    </QueryProvider>',
  '  )',
  '}',
  '',
].join('\n')

EXPO_ROUTER_TEMPLATES['app/index.tsx'] = [
  'import { Redirect } from \'expo-router\'',
  '',
  'export default function Index() {',
  '  return <Redirect href="/(tabs)" />',
  '}',
  '',
].join('\n')

EXPO_ROUTER_TEMPLATES['app/(tabs)/_layout.tsx'] = [
  'import React from \'react\'',
  'import { Tabs } from \'expo-router\'',
  '',
  'export default function TabLayout() {',
  '  return (',
  '    <Tabs screenOptions={{ tabBarActiveTintColor: \'#007AFF\', headerShown: false }}>',
  '      <Tabs.Screen name="index" options={{ title: \'首页\' }} />',
  '      <Tabs.Screen name="explore" options={{ title: \'发现\' }} />',
  '      <Tabs.Screen name="profile" options={{ title: \'我的\' }} />',
  '    </Tabs>',
  '  )',
  '}',
  '',
].join('\n')

EXPO_ROUTER_TEMPLATES['app/(tabs)/index.tsx'] = [
  'import React from \'react\'',
  'import { View, Text, StyleSheet } from \'react-native\'',
  '',
  'export default function HomeScreen() {',
  '  return (<View style={styles.container}><Text style={styles.title}>首页</Text></View>)',
  '}',
  '',
  'const styles = StyleSheet.create({ container: { flex: 1, justifyContent: \'center\', alignItems: \'center\' }, title: { fontSize: 24, fontWeight: \'700\' } })',
  '',
].join('\n')

EXPO_ROUTER_TEMPLATES['app/(tabs)/explore.tsx'] = [
  'import React from \'react\'',
  'import { View, Text, StyleSheet } from \'react-native\'',
  '',
  'export default function ExploreScreen() {',
  '  return (<View style={styles.container}><Text style={styles.title}>发现</Text></View>)',
  '}',
  '',
  'const styles = StyleSheet.create({ container: { flex: 1, justifyContent: \'center\', alignItems: \'center\' }, title: { fontSize: 24, fontWeight: \'700\' } })',
  '',
].join('\n')

EXPO_ROUTER_TEMPLATES['app/(tabs)/profile.tsx'] = [
  'import React from \'react\'',
  'import { View, Text, StyleSheet } from \'react-native\'',
  '',
  'export default function ProfileScreen() {',
  '  return (<View style={styles.container}><Text style={styles.title}>我的</Text></View>)',
  '}',
  '',
  'const styles = StyleSheet.create({ container: { flex: 1, justifyContent: \'center\', alignItems: \'center\' }, title: { fontSize: 24, fontWeight: \'700\' } })',
  '',
].join('\n')

EXPO_ROUTER_TEMPLATES['app/(auth)/_layout.tsx'] = [
  'import React from \'react\'',
  'import { Stack } from \'expo-router\'',
  '',
  'export default function AuthLayout() {',
  '  return (',
  '    <Stack screenOptions={{ headerShown: false }}>',
  '      <Stack.Screen name="login" />',
  '      <Stack.Screen name="register" />',
  '    </Stack>',
  '  )',
  '}',
  '',
].join('\n')

EXPO_ROUTER_TEMPLATES['app/(auth)/login.tsx'] = [
  'import React from \'react\'',
  'import { View, Text, StyleSheet } from \'react-native\'',
  '',
  'export default function LoginScreen() {',
  '  return (<View style={styles.container}><Text style={styles.title}>登录</Text></View>)',
  '}',
  '',
  'const styles = StyleSheet.create({ container: { flex: 1, justifyContent: \'center\', alignItems: \'center\' }, title: { fontSize: 24, fontWeight: \'700\' } })',
  '',
].join('\n')

EXPO_ROUTER_TEMPLATES['app/(auth)/register.tsx'] = [
  'import React from \'react\'',
  'import { View, Text, StyleSheet } from \'react-native\'',
  '',
  'export default function RegisterScreen() {',
  '  return (<View style={styles.container}><Text style={styles.title}>注册</Text></View>)',
  '}',
  '',
  'const styles = StyleSheet.create({ container: { flex: 1, justifyContent: \'center\', alignItems: \'center\' }, title: { fontSize: 24, fontWeight: \'700\' } })',
  '',
].join('\n')

// ========== 核心逻辑 ==========

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    return true
  }
  return false
}

function writeFileIfNotExists(filePath, content) {
  if (!fs.existsSync(filePath)) {
    ensureDir(path.dirname(filePath))
    fs.writeFileSync(filePath, content, 'utf-8')
    return true
  }
  return false
}

function scaffoldFeatureBased(rootDir, features) {
  title('📁 创建 Feature-Based 目录结构...')
  var dirCount = 0
  for (var i = 0; i < FEATURE_BASED_DIRS.length; i++) {
    var dir = FEATURE_BASED_DIRS[i]
    var fullPath = path.join(rootDir, dir)
    if (ensureDir(fullPath)) { log("目录: " + dir + "/"); dirCount++ }
  }
  if (features.length > 0) {
    title('🧩 创建业务功能模块...')
    for (var fi = 0; fi < features.length; fi++) {
      var feature = features[fi]
      for (var si = 0; si < FEATURE_SUB_DIRS.length; si++) {
        var subDir = FEATURE_SUB_DIRS[si]
        var featurePath = path.join(rootDir, 'src', 'features', feature, subDir)
        if (ensureDir(featurePath)) { log("目录: src/features/" + feature + "/" + subDir + "/"); dirCount++ }
      }
      var indexPath = path.join(rootDir, 'src', 'features', feature, 'index.ts')
      if (writeFileIfNotExists(indexPath, '// ' + feature + ' module public exports\n')) { log('文件: src/features/' + feature + '/index.ts') }
    }
  }
  return dirCount
}

function scaffoldExpoRouter(rootDir, features) {
  title('📁 创建 Expo Router 目录结构...')
  var dirCount = 0
  for (var i = 0; i < EXPO_ROUTER_DIRS.length; i++) {
    var dir = EXPO_ROUTER_DIRS[i]
    var fullPath = path.join(rootDir, dir)
    if (ensureDir(fullPath)) { log("目录: " + dir + "/"); dirCount++ }
  }
  if (features.length > 0) {
    title('🧩 创建业务功能模块...')
    for (var fi = 0; fi < features.length; fi++) {
      var feature = features[fi]
      var subDirs = FEATURE_SUB_DIRS.filter(function(d) { return d !== 'screens' })
      for (var si = 0; si < subDirs.length; si++) {
        var subDir = subDirs[si]
        var featurePath = path.join(rootDir, 'src', 'features', feature, subDir)
        if (ensureDir(featurePath)) { log("目录: src/features/" + feature + "/" + subDir + "/"); dirCount++ }
      }
      var indexPath = path.join(rootDir, 'src', 'features', feature, 'index.ts')
      if (writeFileIfNotExists(indexPath, '// ' + feature + ' module public exports\n')) { log('文件: src/features/' + feature + '/index.ts') }
    }
  }
  return dirCount
}

function scaffoldFiles(rootDir, mode) {
  title('📝 创建模板文件...')
  var files = {}
  var key
  for (key in TEMPLATE_FILES) { if (TEMPLATE_FILES.hasOwnProperty(key)) files[key] = TEMPLATE_FILES[key] }
  if (mode === 'expo-router') { for (key in EXPO_ROUTER_TEMPLATES) { if (EXPO_ROUTER_TEMPLATES.hasOwnProperty(key)) files[key] = EXPO_ROUTER_TEMPLATES[key] } }
  var fileCount = 0
  for (key in files) {
    if (files.hasOwnProperty(key)) {
      var fullPath = path.join(rootDir, key)
      if (writeFileIfNotExists(fullPath, files[key])) { log("文件: " + key); fileCount++ }
      else { warn("跳过（已存在）: " + key) }
    }
  }
  return fileCount
}

function parseArgs(argv) {
  var args = argv.slice(2)
  var result = { targetDir: null, mode: 'feature-based', features: [] }
  for (var i = 0; i < args.length; i++) {
    if (args[i].indexOf('--mode=') === 0) result.mode = args[i].split('=')[1]
    else if (args[i].indexOf('--features=') === 0) result.features = args[i].split('=')[1].split(',').map(function(s) { return s.trim() }).filter(Boolean)
    else if (args[i].indexOf('--') !== 0) result.targetDir = args[i]
  }
  return result
}

function main() {
  var parsed = parseArgs(process.argv)
  var targetDir = parsed.targetDir
  var mode = parsed.mode
  var features = parsed.features
  if (!targetDir) {
    error('请指定项目路径')
    console.log('')
    console.log('用法: node tools/scaffold.js <项目路径> [--mode=feature-based|expo-router] [--features=auth,feed,profile]')
    console.log('')
    console.log('示例:')
    console.log('  node tools/scaffold.js ./my-app')
    console.log('  node tools/scaffold.js ./my-app --features=auth,feed,profile')
    console.log('  node tools/scaffold.js ./my-expo-app --mode=expo-router --features=auth,feed')
    process.exit(1)
  }
  if (['feature-based', 'expo-router'].indexOf(mode) === -1) {
    error('无效的模式: ' + mode + '，可选值: feature-based, expo-router')
    process.exit(1)
  }
  var rootDir = path.resolve(targetDir)
  console.log('')
  console.log(colors.cyan + '╔══════════════════════════════════════════════════╗' + colors.reset)
  console.log(colors.cyan + '║  React Native Project Standard - Scaffold Tool  ║' + colors.reset)
  console.log(colors.cyan + '╚══════════════════════════════════════════════════╝' + colors.reset)
  console.log('')
  info('目标路径: ' + rootDir)
  info('项目模式: ' + mode)
  if (features.length > 0) info('业务模块: ' + features.join(', '))
  ensureDir(rootDir)
  var dirCount = mode === 'feature-based' ? scaffoldFeatureBased(rootDir, features) : scaffoldExpoRouter(rootDir, features)
  var fileCount = scaffoldFiles(rootDir, mode)
  console.log('')
  console.log(colors.green + '══════════════════════════════════════════════════' + colors.reset)
  log('完成！共创建 ' + dirCount + ' 个目录，' + fileCount + ' 个模板文件')
  console.log('')
  info('下一步:')
  console.log('  cd ' + targetDir)
  console.log('  pnpm install')
  console.log('  npx expo start  (或 npx react-native start)')
  console.log('')
}

main()
