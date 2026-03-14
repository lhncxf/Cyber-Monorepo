# Cyber — App

uni-app + Vue 3 + TypeScript + UnoCSS 移动端应用，支持 H5、微信小程序、App。提供完整的商城购物流程，包含商品浏览、购物车、下单、支付（模拟）和个人中心。

## 环境要求

- Node.js `>= 20`
- pnpm `>= 10`

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

编辑 `env/.env`，设置后端 API 地址：

```env
VITE_SERVER_BASEURL=http://localhost:5588/api/v1
```

### 3. 启动开发服务器

```bash
pnpm dev:h5    # H5（端口 5566）
pnpm dev:mp    # 微信小程序
pnpm dev:app   # App
```

浏览器访问：http://localhost:5566

> 需先启动 `server` 后端服务，参见 [server 项目](../Cyber-Server/README.md)。

**移动端账号：**

| 手机号 | 密码 | 说明 |
|--------|------|------|
| `13800000100` | `mobile123` | 默认测试用户 |

## 功能清单

| 模块 | 功能 |
|------|------|
| **登录** | 手机号 + 密码登录、JWT Token 持久化 |
| **注册** | 手机号注册新账号 |
| **首页** | 商品列表首页（唯一商品入口）、按分类/关键词筛选商品 |
| **商品详情** | 商品图片/描述/价格展示、SKU 规格选择、加入购物车/立即购买 |
| **收货地址** | 收货地址新增/编辑/删除/设为默认，订单页地址选择 |
| **购物车** | 购物车商品列表、修改数量、删除条目、结算跳转 |
| **订单确认** | 订单信息预览、地址确认、提交订单 |
| **运费展示** | 商品详情按收货地址实时展示运费 |
| **订单列表** | 我的历史订单列表 |
| **订单详情** | 查看订单详情、模拟支付、取消订单 |
| **个人中心** | 用户信息展示、快捷入口（订单/购物车）、退出登录 |

## 命令

```bash
pnpm dev:h5           # H5 开发（端口 5566）
pnpm dev:mp           # 微信小程序开发
pnpm dev:app          # App 开发
pnpm build:h5         # H5 生产构建 → dist/build/h5
pnpm build:mp         # 微信小程序构建 → dist/build/mp-weixin
pnpm type-check       # TypeScript 检查
pnpm lint             # ESLint
```

## 相关项目

| 项目 | 说明 | 端口 |
|------|------|------|
| [web](https://github.com/lhncxf/Cyber-Admin) | Vue 3 管理后台 SPA | 5577 |
| [server](https://github.com/lhncxf/Cyber-Server) | Fastify REST API + Prisma + MySQL 后端 | 5588 |
