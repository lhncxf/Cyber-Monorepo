# 路由拦截说明

## 登录策略

Cyber-Mobile 采用 **默认需要登录（DEFAULT_NEED_LOGIN）** 策略：进入任何页面均需已登录。未登录时，请求会被 HTTP 拦截器捕获（401 响应），自动跳转至登录页。

白名单页面（无需登录）：`/pages/login/login`、`/pages/login/register`。

## 路由拦截器（`interceptor.ts`）

`routeInterceptor` 通过 `uni.addInterceptor` 注册到以下导航方法：

- `navigateTo`
- `reLaunch`
- `redirectTo`
- `switchTab`

其核心职责是：

1. **相对路径处理**：将相对路径转换为绝对路径，保证跨页面跳转路径正确。
2. **Tabbar 同步**：调用 `tabbarStore.setAutoCurIdx(path)` 在直接进入非首页路由时修正底部 tabbar 的高亮索引。

> 登录拦截逻辑不在路由拦截器中处理，而是由 `src/http/interceptor.ts` 在 HTTP 层统一处理（401 → 调用 `mobileUserStore.logout()` → 跳转登录页）。

## 页面路由

| 页面 | 路由路径 |
|------|----------|
| 首页 | `/pages/index/index` |
| 登录 | `/pages/login/login` |
| 注册 | `/pages/login/register` |
| 商品列表 | `/pages/product/list` |
| 商品详情 | `/pages/product/detail` |
| 购物车 | `/pages/cart/index` |
| 订单确认 | `/pages/order/confirm` |
| 订单列表 | `/pages/order/list` |
| 订单详情 | `/pages/order/detail` |
| 个人中心 | `/pages/me/index` |

页面由 `pages.config.ts` 统一注册，`uni-pages` 插件自动生成 `src/uni-pages.d.ts` 类型文件。
