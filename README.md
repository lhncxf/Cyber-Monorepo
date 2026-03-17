# Cyber Monorepo

一个基于 pnpm workspace 的全栈 monorepo，包含后台管理系统、移动端 H5 应用和 RESTful API 服务。

## 项目结构

```
Cyber/
├── Cyber-Admin/     # 后台管理 SPA（Vue 3.5 + Element Plus）
├── Cyber-Mobile/    # 移动端 H5（uni-app + Vue 3）
├── Cyber-Server/    # API 服务（Fastify 5 + Prisma 6 + MySQL）
├── package.json
└── pnpm-workspace.yaml
```

## 技术栈

| 子项目 | 主要技术 |
|--------|----------|
| Cyber-Admin | Vue 3.5 · Vite 7 · Element Plus · Pinia · vue-i18n 9 · vxe-table · UnoCSS |
| Cyber-Mobile | uni-app · Vue 3 · Pinia · vue-i18n · UnoCSS |
| Cyber-Server | Fastify 5 · Prisma 6 · MySQL · JWT · TypeScript |

## 快速开始

### 环境要求

- Node.js ≥ 20
- pnpm ≥ 10
- MySQL 8.0+

### 安装依赖

```bash
pnpm install
```

### 配置数据库

1. 创建 MySQL 数据库
2. 修改 `Cyber-Server/.env` 中的 `DATABASE_URL`
3. 执行迁移并填充种子数据：

```bash
cd Cyber-Server
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 启动开发服务

```bash
# 同时启动全部子项目
pnpm dev

# 单独启动
pnpm dev:admin    # 后台管理  → http://localhost:5577
pnpm dev:mobile   # 移动端 H5 → http://localhost:5566
pnpm dev:server   # API 服务  → http://localhost:5588
```

### 构建

```bash
pnpm build          # 构建 Admin + Mobile H5
```

### 代码检查

```bash
pnpm lint
```

## 服务地址

| 服务 | 地址 |
|------|------|
| Cyber-Admin | http://localhost:5577 |
| Cyber-Mobile (H5) | http://localhost:5566 |
| Cyber-Server | http://localhost:5588 |

## 测试账号

### 后台管理（Cyber-Admin）

| 账号 | 密码 | 角色 |
|------|------|------|
| `admin` | `admin123` | 超级管理员（全部权限） |
| `editor` | `editor123` | 编辑（受限权限） |
| `zhang_wei` 等 10 个账号 | `Cyber@2026` | 编辑 |

### 移动端（Cyber-Mobile）

| 手机号 | 密码 |
|--------|------|
| `13800000100` | `mobile123` |

## 功能概览

### Cyber-Admin 后台管理

- **登录**：SVG 验证码 + JWT 鉴权
- **控制台**：管理员 / 编辑差异化视图
- **系统管理**：用户、角色、菜单、部门 CRUD
- **商品管理**：商品列表（含 SKU 多规格）、分类管理、商品上下架、库存管理与低库存预警
- **订单管理**：订单列表、发货（填写物流单号）
- **售后管理**：退款申请列表、审核通过/拒绝
- **移动用户管理**：移动端注册用户列表
- **运费模板管理**：基础运费、免运费门槛、区域附加运费、不发货地区
- **收货地址查看**：在移动端用户详情中查看地址列表
- **权限体系**：动态路由（数据库驱动）、按钮级 RBAC
- **国际化**：简中 / 英文

### Cyber-Mobile 移动端

- **认证**：手机号注册 / 登录
- **首页**：商品列表（作为唯一商品入口）、关键词搜索、分类筛选
- **商品详情**：SKU 规格选择、库存展示、下架提示
- **地址管理**：新增/编辑/删除/设为默认收货地址
- **购物车**：增删改数量
- **订单流程**：确认订单（含地址选择）→ 模拟支付 → 物流追踪
- **售后**：已完成订单申请退款、查看退款审核状态
- **运费能力**：按收货地址实时查询模板运费
- **个人中心**：资料、快捷导航、语言切换、退出登录
- **国际化**：简中 / 英文

### Cyber-Server API 服务

- Fastify 5 + Prisma 6 + MySQL
- 管理端 / 移动端独立 JWT 令牌
- SVG 验证码（管理员登录）
- 完整 CRUD 接口（管理端 + 移动端）
- 收货地址管理接口（增删改查、设为默认、地址选择）
- 运费模板管理与运费试算接口
- 商品上下架、SKU 库存管理、低库存查询接口
- 订单发货接口（物流单号 + 承运商）
- 退款申请与审核接口（申请/批准/拒绝，批准自动回滚库存）
- `Accept-Language` 感知的 i18n 错误消息
- 种子数据：15 部门、41 菜单、12 管理员、10 商品、3 运费模板、3 收货地址、2 条测试订单、100 条表格数据

## 子项目文档

- [Cyber-Admin README](./Cyber-Admin/README.md)
- [Cyber-Mobile README](./Cyber-Mobile/README.md)
- [Cyber-Server README](./Cyber-Server/README.md)
