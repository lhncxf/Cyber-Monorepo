# Cyber — Server

Fastify 5 + Prisma 6 + MySQL + JWT 后端 API 服务，同时为管理后台（web）和移动端（app）提供接口支持。端口 5588。

## 环境要求

- Node.js `>= 20.19` 或 `>= 22.12`
- pnpm `>= 10`
- MySQL `>= 8.0`

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

编辑 `.env`：

```env
DATABASE_URL="mysql://用户名:密码@localhost:3306/数据库名"
JWT_SECRET="自定义密钥"
JWT_EXPIRES_IN="7d"
HOST="0.0.0.0"
PORT=5588
```

### 3. 初始化数据库

**方式一：直接导入 SQL（推荐，速度最快）**

```bash
mysql -u 用户名 -p < init.sql
```

导入完成后跳过 `db:migrate` 和 `db:seed`，直接执行第 4 步。

**方式二：Prisma 迁移 + 种子脚本**

```bash
# 生成 Prisma Client（首次安装后必须执行）
pnpm db:generate

# 执行迁移（建表）
pnpm db:migrate

# 写入初始数据（菜单、角色、用户、部门等）
pnpm db:seed
```

### 4. 启动开发服务器

```bash
pnpm dev
```

**初始数据概览：**

- 部门：15 条（1 家公司 → 5 个中心 → 9 个子部门）
- 菜单：41 条（含目录、页面、按钮三级）
- 后台用户：12 个（admin + editor + 10 个扩充账号）
- 移动端用户：1 个（13800000100）
- 收货地址：3 条（默认移动端用户）
- 运费模板：3 条
- 商品：10 条（含多 SKU）
- 订单：2 条（1 条已完成、1 条已完成含退款申请）
- 示例表：100 条随机数据

## API 模块

| 模块 | API 路径前缀 | 说明 |
|------|-------------|------|
| **后台认证** | `/api/v1/auth` | 登录、获取验证码、获取当前用户信息 |
| **后台用户** | `/api/v1/system/users` | 管理后台用户 CRUD + 重置密码 |
| **角色** | `/api/v1/roles` | 角色 CRUD + 角色菜单权限分配 |
| **菜单** | `/api/v1/menus` | 菜单 CRUD + 按用户角色返回菜单树 |
| **部门** | `/api/v1/departments` | 部门 CRUD |
| **示例表格** | `/api/v1/tables` | 演示 CRUD 分页表格 |
| **商品** | `/api/v1/products` | 商品 CRUD + SKU 管理 + 关键词/分类查询 |
| **分类** | `/api/v1/categories` | 商品分类 CRUD + 全量树 |
| **订单（后台）** | `/api/v1/orders` | 订单列表查询、发货（物流单号）、状态变更 |
| **退款售后** | `/api/v1/refunds` | 退款申请列表、审核通过/拒绝 |
| **移动端认证** | `/api/v1/mobile/auth` | 注册、登录、获取当前用户 |
| **移动端用户** | `/api/v1/mobile-users` | 管理后台对移动端用户的 CRUD + 重置密码 |
| **购物车** | `/api/v1/mobile/cart` | 购物车增删改查 |
| **收货地址** | `/api/v1/mobile/addresses` | 收货地址增删改查、设为默认、地址选择 |
| **移动端订单** | `/api/v1/mobile/orders` | 创建订单、我的订单列表/详情、支付（模拟）、取消、申请退款 |
| **运费模板** | `/api/v1/freight-templates` | 模板 CRUD、运费试算、地区规则配置 |

## 命令

```bash
pnpm dev          # 开发服务器（tsx watch，端口 5588）
pnpm build        # 生产构建（tsc）
pnpm db:generate  # 生成 Prisma Client
pnpm db:migrate   # Prisma 迁移（建表）
pnpm db:seed      # 写入初始数据
pnpm db:studio    # 打开 Prisma Studio 可视化数据库
pnpm db:push      # prisma db push（跳过迁移记录）
```

## 相关项目

| 项目 | 说明 | 端口 |
|------|------|------|
| [web](https://github.com/lhncxf/Cyber-Admin) | Vue 3 管理后台 SPA | 5577 |
| [app](https://github.com/lhncxf/Cyber-Mobile) | uni-app 移动端（H5/小程序/App） | 5566 (H5) |
