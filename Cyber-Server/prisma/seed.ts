import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const MENU_DATA = [
  { id: 1, parentId: 0, name: "首页", type: 2, path: "/dashboard", component: "dashboard/index", permission: "", icon: "HomeFilled", sort: 0, status: true, visible: true },
  { id: 2, parentId: 0, name: "系统管理", type: 1, path: "/system", component: "Layout", permission: "", icon: "Setting", sort: 1, status: true, visible: true },
  { id: 3, parentId: 2, name: "用户管理", type: 2, path: "user", component: "system/user/index", permission: "", icon: "User", sort: 1, status: true, visible: true },
  { id: 4, parentId: 2, name: "角色管理", type: 2, path: "role", component: "system/role/index", permission: "", icon: "UserFilled", sort: 2, status: true, visible: true },
  { id: 5, parentId: 2, name: "菜单管理", type: 2, path: "menu", component: "system/menu/index", permission: "", icon: "Menu", sort: 3, status: true, visible: true },
  { id: 6, parentId: 2, name: "部门管理", type: 2, path: "dept", component: "system/dept/index", permission: "", icon: "OfficeBuilding", sort: 4, status: true, visible: true },
  { id: 7, parentId: 3, name: "新增用户", type: 3, path: "", component: "", permission: "system:user:create", icon: "", sort: 1, status: true, visible: true },
  { id: 8, parentId: 3, name: "修改用户", type: 3, path: "", component: "", permission: "system:user:update", icon: "", sort: 2, status: true, visible: true },
  { id: 9, parentId: 3, name: "删除用户", type: 3, path: "", component: "", permission: "system:user:delete", icon: "", sort: 3, status: true, visible: true },
  { id: 10, parentId: 3, name: "重置密码", type: 3, path: "", component: "", permission: "system:user:reset-pwd", icon: "", sort: 4, status: true, visible: true },
  { id: 11, parentId: 4, name: "新增角色", type: 3, path: "", component: "", permission: "system:role:create", icon: "", sort: 1, status: true, visible: true },
  { id: 12, parentId: 4, name: "修改角色", type: 3, path: "", component: "", permission: "system:role:update", icon: "", sort: 2, status: true, visible: true },
  { id: 13, parentId: 4, name: "删除角色", type: 3, path: "", component: "", permission: "system:role:delete", icon: "", sort: 3, status: true, visible: true },
  { id: 14, parentId: 5, name: "新增菜单", type: 3, path: "", component: "", permission: "system:menu:create", icon: "", sort: 1, status: true, visible: true },
  { id: 15, parentId: 5, name: "修改菜单", type: 3, path: "", component: "", permission: "system:menu:update", icon: "", sort: 2, status: true, visible: true },
  { id: 16, parentId: 5, name: "删除菜单", type: 3, path: "", component: "", permission: "system:menu:delete", icon: "", sort: 3, status: true, visible: true },
  { id: 17, parentId: 6, name: "新增部门", type: 3, path: "", component: "", permission: "system:dept:create", icon: "", sort: 1, status: true, visible: true },
  { id: 18, parentId: 6, name: "修改部门", type: 3, path: "", component: "", permission: "system:dept:update", icon: "", sort: 2, status: true, visible: true },
  { id: 19, parentId: 6, name: "删除部门", type: 3, path: "", component: "", permission: "system:dept:delete", icon: "", sort: 3, status: true, visible: true },
  { id: 26, parentId: 0, name: "商品管理", type: 1, path: "/product", component: "Layout", permission: "", icon: "Goods", sort: 2, status: true, visible: true },
  { id: 27, parentId: 26, name: "商品列表", type: 2, path: "list", component: "product/index", permission: "", icon: "ShoppingBag", sort: 1, status: true, visible: true },
  { id: 28, parentId: 26, name: "订单管理", type: 2, path: "order", component: "order/index", permission: "", icon: "List", sort: 2, status: true, visible: true },
  { id: 29, parentId: 27, name: "新增商品", type: 3, path: "", component: "", permission: "product:create", icon: "", sort: 1, status: true, visible: true },
  { id: 30, parentId: 27, name: "修改商品", type: 3, path: "", component: "", permission: "product:update", icon: "", sort: 2, status: true, visible: true },
  { id: 31, parentId: 27, name: "删除商品", type: 3, path: "", component: "", permission: "product:delete", icon: "", sort: 3, status: true, visible: true },
  { id: 32, parentId: 28, name: "修改订单状态", type: 3, path: "", component: "", permission: "order:update", icon: "", sort: 1, status: true, visible: true },
  { id: 33, parentId: 0, name: "移动端管理", type: 1, path: "/mobile", component: "Layout", permission: "", icon: "Cellphone", sort: 3, status: true, visible: true },
  { id: 34, parentId: 33, name: "移动端用户", type: 2, path: "user", component: "mobile/user/index", permission: "", icon: "User", sort: 1, status: true, visible: true },
  { id: 35, parentId: 34, name: "新增移动端用户", type: 3, path: "", component: "", permission: "mobile:user:create", icon: "", sort: 1, status: true, visible: true },
  { id: 36, parentId: 34, name: "修改移动端用户", type: 3, path: "", component: "", permission: "mobile:user:update", icon: "", sort: 2, status: true, visible: true },
  { id: 37, parentId: 34, name: "删除移动端用户", type: 3, path: "", component: "", permission: "mobile:user:delete", icon: "", sort: 3, status: true, visible: true },
  { id: 38, parentId: 34, name: "重置移动端用户密码", type: 3, path: "", component: "", permission: "mobile:user:reset-pwd", icon: "", sort: 4, status: true, visible: true },
  { id: 39, parentId: 26, name: "分类管理", type: 2, path: "category", component: "product/category/index", permission: "", icon: "Grid", sort: 3, status: true, visible: true },
  { id: 40, parentId: 39, name: "新增分类", type: 3, path: "", component: "", permission: "product:category:create", icon: "", sort: 1, status: true, visible: true },
  { id: 41, parentId: 39, name: "修改分类", type: 3, path: "", component: "", permission: "product:category:update", icon: "", sort: 2, status: true, visible: true },
  { id: 42, parentId: 39, name: "删除分类", type: 3, path: "", component: "", permission: "product:category:delete", icon: "", sort: 3, status: true, visible: true },
  { id: 43, parentId: 26, name: "运费模板", type: 2, path: "freight", component: "product/freight/index", permission: "", icon: "Van", sort: 4, status: true, visible: true },
  { id: 44, parentId: 43, name: "新增运费模板", type: 3, path: "", component: "", permission: "product:freight:create", icon: "", sort: 1, status: true, visible: true },
  { id: 45, parentId: 43, name: "修改运费模板", type: 3, path: "", component: "", permission: "product:freight:update", icon: "", sort: 2, status: true, visible: true },
  { id: 46, parentId: 43, name: "删除运费模板", type: 3, path: "", component: "", permission: "product:freight:delete", icon: "", sort: 3, status: true, visible: true },
  { id: 47, parentId: 26, name: "售后管理", type: 2, path: "refund", component: "order/refund/index", permission: "", icon: "Tickets", sort: 5, status: true, visible: true }
]

const DEPT_DATA = [
  { id: 1, parentId: 0, name: "Cyber 科技有限公司", sort: 0, status: true },
  { id: 2, parentId: 1, name: "技术中心", sort: 1, status: true },
  { id: 3, parentId: 1, name: "产品中心", sort: 2, status: true },
  { id: 4, parentId: 1, name: "运营中心", sort: 3, status: true },
  { id: 5, parentId: 1, name: "市场中心", sort: 4, status: true },
  { id: 6, parentId: 1, name: "财务中心", sort: 5, status: true },
  { id: 7, parentId: 2, name: "前端开发部", sort: 1, status: true },
  { id: 8, parentId: 2, name: "后端开发部", sort: 2, status: true },
  { id: 9, parentId: 2, name: "测试部", sort: 3, status: true },
  { id: 10, parentId: 2, name: "运维部", sort: 4, status: true },
  { id: 11, parentId: 3, name: "产品设计部", sort: 1, status: true },
  { id: 12, parentId: 3, name: "UI 设计部", sort: 2, status: true },
  { id: 13, parentId: 4, name: "内容运营部", sort: 1, status: true },
  { id: 14, parentId: 4, name: "用户运营部", sort: 2, status: true },
  { id: 15, parentId: 5, name: "品牌推广部", sort: 1, status: true }
]

const EXTRA_USERS = [
  { username: "zhang_wei", email: "zhang_wei@Cyber.com", phone: "13900000003", deptId: 7, roles: ["editor"] },
  { username: "li_fang", email: "li_fang@Cyber.com", phone: "13900000004", deptId: 7, roles: ["editor"] },
  { username: "wang_hao", email: "wang_hao@Cyber.com", phone: "13900000005", deptId: 8, roles: ["editor"] },
  { username: "zhao_min", email: "zhao_min@Cyber.com", phone: "13900000006", deptId: 8, roles: ["editor"] },
  { username: "chen_jing", email: "chen_jing@Cyber.com", phone: "13900000007", deptId: 9, roles: ["editor"] },
  { username: "liu_yang", email: "liu_yang@Cyber.com", phone: "13900000008", deptId: 10, roles: ["editor"] },
  { username: "sun_xia", email: "sun_xia@Cyber.com", phone: "13900000009", deptId: 11, roles: ["editor"] },
  { username: "zhou_peng", email: "zhou_peng@Cyber.com", phone: "13900000010", deptId: 12, roles: ["editor"] },
  { username: "wu_ting", email: "wu_ting@Cyber.com", phone: "13900000011", deptId: 13, roles: ["editor"] },
  { username: "zheng_bo", email: "zheng_bo@Cyber.com", phone: "13900000012", deptId: 14, roles: ["editor"] }
]


const FREIGHT_TEMPLATE_DATA = [
  { id: 1, name: "标准快递", type: 0, basePrice: 10.00, freeThreshold: 99.00, rules: "[]", excludedRegions: "[]", status: true },
  { id: 2, name: "大件商品运费", type: 0, basePrice: 25.00, freeThreshold: null, rules: JSON.stringify([{ province: "西藏", addPrice: 20 }, { province: "新疆", addPrice: 15 }]), excludedRegions: "[]", status: true },
  { id: 3, name: "免运费模板", type: 0, basePrice: 0.00, freeThreshold: null, rules: "[]", excludedRegions: "[]", status: true }
]

const MOBILE_SHIPPING_ADDRESS_SEEDS = [
  { name: "测试用户", phone: "13800000100", province: "上海市", city: "市辖区", district: "黄浦区", detail: "世纪大道100号世贸中心3楼", isDefault: true },
  { name: "测试用户", phone: "13800000100", province: "广东省", city: "广州市", district: "天河区", detail: "天河路385号太古汇2楼201室", isDefault: false },
  { name: "测试用户", phone: "13800000100", province: "北京市", city: "市辖区", district: "朝阳区", detail: "望京SOHO T3 18层", isDefault: false }
]

async function main() {
  console.log("🌱 开始初始化数据库...")

  for (const dept of DEPT_DATA) {
    const { id, ...data } = dept
    await prisma.department.upsert({ where: { id }, update: data, create: dept })
  }
  console.log(`✅ 部门数据完成（${DEPT_DATA.length} 条）`)

  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin", label: "管理员" }
  })
  const editorRole = await prisma.role.upsert({
    where: { name: "editor" },
    update: {},
    create: { name: "editor", label: "编辑者" }
  })
  console.log("✅ 角色数据完成")

  const adminPwd = await bcrypt.hash("admin123", 10)
  const editorPwd = await bcrypt.hash("editor123", 10)
  const extraPwd = await bcrypt.hash("Cyber@2026", 10)

  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", password: adminPwd, email: "admin@Cyber.com", phone: "13800000001", status: true, deptId: 1 }
  })
  const editorUser = await prisma.user.upsert({
    where: { username: "editor" },
    update: {},
    create: { username: "editor", password: editorPwd, email: "editor@Cyber.com", phone: "13800000002", status: true, deptId: 7 }
  })

  const roleMap: Record<string, { id: number }> = { admin: adminRole, editor: editorRole }

  for (const u of EXTRA_USERS) {
    const { roles, ...userData } = u
    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: { ...userData, password: extraPwd, status: true }
    })
    for (const roleName of roles) {
      const role = roleMap[roleName]
      if (role) {
        await prisma.userRole.upsert({
          where: { userId_roleId: { userId: user.id, roleId: role.id } },
          update: {},
          create: { userId: user.id, roleId: role.id }
        })
      }
    }
  }
  console.log(`✅ 用户数据完成（内置 2 + 扩充 ${EXTRA_USERS.length} 条）`)

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id }
  })
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: editorUser.id, roleId: editorRole.id } },
    update: {},
    create: { userId: editorUser.id, roleId: editorRole.id }
  })
  console.log("✅ 用户角色关联完成")

  const obsoleteMenuIds = [20, 21, 22, 23, 24, 25]
  await prisma.menu.deleteMany({ where: { id: { in: obsoleteMenuIds } } })

  for (const menu of MENU_DATA) {
    const { id, ...data } = menu
    await prisma.menu.upsert({ where: { id }, update: data, create: menu })
  }
  console.log(`✅ 菜单数据完成（${MENU_DATA.length} 条）`)

  const allMenuIds = MENU_DATA.map(m => m.id)
  const editorMenuIds = [1]

  for (const menuId of allMenuIds) {
    await prisma.roleMenu.upsert({
      where: { roleId_menuId: { roleId: adminRole.id, menuId } },
      update: {},
      create: { roleId: adminRole.id, menuId }
    })
  }
  for (const menuId of editorMenuIds) {
    await prisma.roleMenu.upsert({
      where: { roleId_menuId: { roleId: editorRole.id, menuId } },
      update: {},
      create: { roleId: editorRole.id, menuId }
    })
  }
  console.log("✅ 角色菜单关联完成")

  await prisma.tableItem.deleteMany({})
  const now = Date.now()
  const year = 365 * 24 * 60 * 60 * 1000
  const tableSeeds = Array.from({ length: 100 }, (_, i) => ({
    username: `user_${String(i + 1).padStart(3, "0")}`,
    email: `user${i + 1}@example.com`,
    phone: `138${String(10000000 + i).padStart(8, "0")}`,
    roles: i % 5 === 0 ? "admin" : "editor",
    status: i % 7 !== 0,
    createTime: new Date(now - Math.floor(Math.random() * year))
  }))
  await prisma.tableItem.createMany({ data: tableSeeds })
  console.log(`✅ 示例表数据完成（${tableSeeds.length} 条）`)

  await prisma.refundRequest.deleteMany({})
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})
  await prisma.mobileUser.deleteMany({ where: { phone: { not: "13800000100" } } })
  const mobilePwd = await bcrypt.hash("mobile123", 10)
  const defaultMobileUser = await prisma.mobileUser.upsert({
    where: { phone: "13800000100" },
    update: {},
    create: {
      phone: "13800000100",
      password: mobilePwd,
      nickname: "测试用户",
      avatar: "",
      status: true
    }
  })

  await prisma.shippingAddress.deleteMany({ where: { userId: defaultMobileUser.id } })
  await prisma.shippingAddress.createMany({
    data: MOBILE_SHIPPING_ADDRESS_SEEDS.map(addr => ({
      userId: defaultMobileUser.id,
      name: addr.name,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      detail: addr.detail,
      isDefault: addr.isDefault
    }))
  })
  console.log("✅ 移动端默认用户完成（13800000100 / mobile123）")
  console.log(`✅ 收货地址数据完成（${MOBILE_SHIPPING_ADDRESS_SEEDS.length} 条）`)

  const PRODUCT_SEEDS = [
    {
      name: "iPhone 16 Pro",
      categoryId: 3,
      freightTemplateId: 1,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=400&h=400&fit=crop"
      ]),
      description: "苹果最新旗舰手机，A18芯片，钛金属机身",
      skus: [
        { name: JSON.stringify([{"存储":"256GB"}, {"颜色":"黑色钛金属"}]), price: 7999, stock: 50 },
        { name: JSON.stringify([{"存储":"256GB"}, {"颜色":"白色钛金属"}]), price: 7999, stock: 40 },
        { name: JSON.stringify([{"存储":"256GB"}, {"颜色":"沙漠色钛金属"}]), price: 7999, stock: 35 },
        { name: JSON.stringify([{"存储":"512GB"}, {"颜色":"黑色钛金属"}]), price: 9299, stock: 30 },
        { name: JSON.stringify([{"存储":"512GB"}, {"颜色":"白色钛金属"}]), price: 9299, stock: 25 },
        { name: JSON.stringify([{"存储":"512GB"}, {"颜色":"沙漠色钛金属"}]), price: 9299, stock: 20 },
        { name: JSON.stringify([{"存储":"1TB"}, {"颜色":"黑色钛金属"}]), price: 11499, stock: 10 },
        { name: JSON.stringify([{"存储":"1TB"}, {"颜色":"白色钛金属"}]), price: 11499, stock: 0 },
        { name: JSON.stringify([{"存储":"1TB"}, {"颜色":"沙漠色钛金属"}]), price: 11499, stock: 8 }
      ]
    },
    {
      name: "MacBook Pro 14",
      categoryId: 4,
      freightTemplateId: 2,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop"
      ]),
      description: "M3 Pro芯片，专业级笔记本电脑",
      skus: [
        { name: JSON.stringify([{"芯片":"M3 Pro"}, {"内存":"18GB"}, {"存储":"512GB"}]), price: 14999, stock: 20 },
        { name: JSON.stringify([{"芯片":"M3 Pro"}, {"内存":"18GB"}, {"存储":"1TB"}]),   price: 16999, stock: 15 },
        { name: JSON.stringify([{"芯片":"M3 Pro"}, {"内存":"18GB"}, {"存储":"2TB"}]),   price: 18999, stock: 0  },
        { name: JSON.stringify([{"芯片":"M3 Pro"}, {"内存":"36GB"}, {"存储":"512GB"}]), price: 17999, stock: 0  },
        { name: JSON.stringify([{"芯片":"M3 Pro"}, {"内存":"36GB"}, {"存储":"1TB"}]),   price: 19999, stock: 10 },
        { name: JSON.stringify([{"芯片":"M3 Pro"}, {"内存":"36GB"}, {"存储":"2TB"}]),   price: 21999, stock: 0  },
        { name: JSON.stringify([{"芯片":"M3 Pro"}, {"内存":"64GB"}, {"存储":"512GB"}]), price: 0,     stock: 0  },
        { name: JSON.stringify([{"芯片":"M3 Pro"}, {"内存":"64GB"}, {"存储":"1TB"}]),   price: 0,     stock: 0  },
        { name: JSON.stringify([{"芯片":"M3 Pro"}, {"内存":"64GB"}, {"存储":"2TB"}]),   price: 0,     stock: 0  },
        { name: JSON.stringify([{"芯片":"M3 Max"}, {"内存":"18GB"}, {"存储":"512GB"}]), price: 0,     stock: 0  },
        { name: JSON.stringify([{"芯片":"M3 Max"}, {"内存":"18GB"}, {"存储":"1TB"}]),   price: 0,     stock: 0  },
        { name: JSON.stringify([{"芯片":"M3 Max"}, {"内存":"18GB"}, {"存储":"2TB"}]),   price: 0,     stock: 0  },
        { name: JSON.stringify([{"芯片":"M3 Max"}, {"内存":"36GB"}, {"存储":"512GB"}]), price: 0,     stock: 0  },
        { name: JSON.stringify([{"芯片":"M3 Max"}, {"内存":"36GB"}, {"存储":"1TB"}]),   price: 21999, stock: 8  },
        { name: JSON.stringify([{"芯片":"M3 Max"}, {"内存":"36GB"}, {"存储":"2TB"}]),   price: 23999, stock: 0  },
        { name: JSON.stringify([{"芯片":"M3 Max"}, {"内存":"64GB"}, {"存储":"512GB"}]), price: 0,     stock: 0  },
        { name: JSON.stringify([{"芯片":"M3 Max"}, {"内存":"64GB"}, {"存储":"1TB"}]),   price: 25999, stock: 0  },
        { name: JSON.stringify([{"芯片":"M3 Max"}, {"内存":"64GB"}, {"存储":"2TB"}]),   price: 27999, stock: 5  }
      ]
    },
    {
      name: "AirPods Pro 2",
      categoryId: 6,
      freightTemplateId: 1,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"
      ]),
      description: "主动降噪，空间音频，防水防尘",
      skus: [
        { name: JSON.stringify([{"版本":"标准版"}]), price: 1899, stock: 100 },
        { name: JSON.stringify([{"版本":"USB-C版"}]), price: 1999, stock: 80 }
      ]
    },
    {
      name: "小米15 Ultra",
      categoryId: 3,
      freightTemplateId: 1,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&h=400&fit=crop"
      ]),
      description: "徕卡联合调教，骁龙8 Elite旗舰",
      skus: [
        { name: JSON.stringify([{"存储":"512GB"}, {"颜色":"钛金黑"}]), price: 6499, stock: 40 },
        { name: JSON.stringify([{"存储":"512GB"}, {"颜色":"雪山白"}]), price: 6499, stock: 30 },
        { name: JSON.stringify([{"存储":"1TB"}, {"颜色":"钛金黑"}]), price: 7299, stock: 20 },
        { name: JSON.stringify([{"存储":"1TB"}, {"颜色":"雪山白"}]), price: 7299, stock: 15 }
      ]
    },
    {
      name: "华为MatePad Pro 13",
      categoryId: 5,
      freightTemplateId: 1,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop"
      ]),
      description: "麒麟芯片，OLED屏幕，专业平板",
      skus: [
        { name: JSON.stringify([{"内存":"8GB"}, {"存储":"128GB"}]), price: 4999, stock: 30 },
        { name: JSON.stringify([{"内存":"8GB"}, {"存储":"256GB"}]), price: 5499, stock: 25 },
        { name: JSON.stringify([{"内存":"8GB"}, {"存储":"512GB"}]), price: 5999, stock: 0 },
        { name: JSON.stringify([{"内存":"12GB"}, {"存储":"128GB"}]), price: 5499, stock: 0 },
        { name: JSON.stringify([{"内存":"12GB"}, {"存储":"256GB"}]), price: 5999, stock: 20 },
        { name: JSON.stringify([{"内存":"12GB"}, {"存储":"512GB"}]), price: 6999, stock: 12 }
      ]
    },
    {
      name: "索尼WH-1000XM6",
      categoryId: 6,
      freightTemplateId: 1,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"
      ]),
      description: "业界顶级降噪耳机，续航30小时",
      skus: [
        { name: JSON.stringify([{"颜色":"曜石黑"}]), price: 2999, stock: 80 },
        { name: JSON.stringify([{"颜色":"铂金银"}]), price: 2999, stock: 60 },
        { name: JSON.stringify([{"颜色":"午夜蓝"}]), price: 2999, stock: 0 }
      ]
    },
    {
      name: "戴尔XPS 15",
      categoryId: 4,
      freightTemplateId: 2,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=400&fit=crop"
      ]),
      description: "OLED屏幕，RTX 4060，轻薄高效",
      skus: [
        { name: JSON.stringify([{"处理器":"i7"}, {"配置":"16GB+512GB"}]), price: 12999, stock: 15 },
        { name: JSON.stringify([{"处理器":"i7"}, {"配置":"32GB+1TB"}]), price: 14999, stock: 10 },
        { name: JSON.stringify([{"处理器":"i7"}, {"配置":"64GB+2TB"}]), price: 17999, stock: 0 },
        { name: JSON.stringify([{"处理器":"i9"}, {"配置":"16GB+512GB"}]), price: 14999, stock: 0 },
        { name: JSON.stringify([{"处理器":"i9"}, {"配置":"32GB+1TB"}]), price: 16999, stock: 8 },
        { name: JSON.stringify([{"处理器":"i9"}, {"配置":"64GB+2TB"}]), price: 19999, stock: 4 }
      ]
    },
    {
      name: "iPad Air M2",
      categoryId: 5,
      freightTemplateId: 1,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop"
      ]),
      description: "M2芯片，11英寸超薄平板",
      skus: [
        { name: JSON.stringify([{"存储":"128GB"}, {"网络":"WiFi"}, {"颜色":"星光色"}]), price: 4799, stock: 50 },
        { name: JSON.stringify([{"存储":"128GB"}, {"网络":"WiFi"}, {"颜色":"蓝色"}]), price: 4799, stock: 40 },
        { name: JSON.stringify([{"存储":"128GB"}, {"网络":"WiFi"}, {"颜色":"紫色"}]), price: 4799, stock: 0 },
        { name: JSON.stringify([{"存储":"128GB"}, {"网络":"蜂窝"}, {"颜色":"星光色"}]), price: 5799, stock: 0 },
        { name: JSON.stringify([{"存储":"128GB"}, {"网络":"蜂窝"}, {"颜色":"蓝色"}]), price: 5799, stock: 0 },
        { name: JSON.stringify([{"存储":"128GB"}, {"网络":"蜂窝"}, {"颜色":"紫色"}]), price: 5799, stock: 0 },
        { name: JSON.stringify([{"存储":"256GB"}, {"网络":"WiFi"}, {"颜色":"星光色"}]), price: 5299, stock: 0 },
        { name: JSON.stringify([{"存储":"256GB"}, {"网络":"WiFi"}, {"颜色":"蓝色"}]), price: 5299, stock: 30 },
        { name: JSON.stringify([{"存储":"256GB"}, {"网络":"WiFi"}, {"颜色":"紫色"}]), price: 5299, stock: 25 },
        { name: JSON.stringify([{"存储":"256GB"}, {"网络":"蜂窝"}, {"颜色":"星光色"}]), price: 6299, stock: 20 },
        { name: JSON.stringify([{"存储":"256GB"}, {"网络":"蜂窝"}, {"颜色":"蓝色"}]), price: 6299, stock: 0 },
        { name: JSON.stringify([{"存储":"256GB"}, {"网络":"蜂窝"}, {"颜色":"紫色"}]), price: 6299, stock: 15 }
      ]
    },
    {
      name: "三星Galaxy S25 Ultra",
      categoryId: 3,
      freightTemplateId: 1,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop"
      ]),
      description: "S Pen内置，2亿像素主摄，AI功能丰富",
      skus: [
        { name: JSON.stringify([{"存储":"256GB"}, {"颜色":"钛金石黑"}]), price: 9499, stock: 35 },
        { name: JSON.stringify([{"存储":"256GB"}, {"颜色":"钛金灰绿"}]), price: 9499, stock: 28 },
        { name: JSON.stringify([{"存储":"512GB"}, {"颜色":"钛金石黑"}]), price: 10799, stock: 20 },
        { name: JSON.stringify([{"存储":"512GB"}, {"颜色":"钛金灰绿"}]), price: 10799, stock: 15 }
      ]
    },
    {
      name: "罗技MX Master 3S",
      categoryId: 7,
      freightTemplateId: 1,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop"
      ]),
      description: "专业无线鼠标，电磁滚轮，人体工学",
      // 单维度：颜色
      skus: [
        { name: JSON.stringify([{"颜色":"石墨黑"}]), price: 699, stock: 150 },
        { name: JSON.stringify([{"颜色":"珍珠白"}]), price: 699, stock: 120 }
      ]
    }
  ]

  const CATEGORY_DATA = [
    { id: 1, parentId: 0, name: "电子产品", sort: 1, status: true },
    { id: 2, parentId: 0, name: "配件周边", sort: 2, status: true },
    { id: 3, parentId: 1, name: "手机", sort: 1, status: true },
    { id: 4, parentId: 1, name: "电脑", sort: 2, status: true },
    { id: 5, parentId: 1, name: "平板", sort: 3, status: true },
    { id: 6, parentId: 2, name: "耳机", sort: 1, status: true },
    { id: 7, parentId: 2, name: "外设", sort: 2, status: true }
  ]
  for (const cat of CATEGORY_DATA) {
    const { id, ...data } = cat
    await prisma.category.upsert({ where: { id }, update: data, create: cat })
  }
  console.log(`✅ 商品分类数据完成（${CATEGORY_DATA.length} 条）`)


  for (const ft of FREIGHT_TEMPLATE_DATA) {
    const { id, ...data } = ft
    await prisma.freightTemplate.upsert({ where: { id }, update: data, create: ft })
  }
  console.log(`✅ 运费模板数据完成（${FREIGHT_TEMPLATE_DATA.length} 条）`)

  await prisma.productSku.deleteMany({})
  await prisma.product.deleteMany({})
  for (const { skus, ...productData } of PRODUCT_SEEDS) {
    await prisma.product.create({
      data: {
        ...productData,
        skus: {
          create: skus.map(sku => ({ ...sku }))
        }
      }
    })
  }
  console.log(`✅ 商品数据完成（${PRODUCT_SEEDS.length} 条，含多SKU）`)

  // ───── 订单测试数据 ─────
  // 删除旧退款申请 → 旧订单项 → 旧订单（顺序遵循外键依赖）
  await prisma.refundRequest.deleteMany({})
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})

  // 取第一个收货地址（上海，默认地址）用于快照
  const defaultAddr = await prisma.shippingAddress.findFirst({
    where: { userId: defaultMobileUser.id, isDefault: true }
  })
  const addrSnapshot = defaultAddr
    ? JSON.stringify({
        name: defaultAddr.name,
        phone: defaultAddr.phone,
        province: defaultAddr.province,
        city: defaultAddr.city,
        district: defaultAddr.district,
        detail: defaultAddr.detail
      })
    : null

  // 取现有 SKU（产品每次重建，id 不固定，按名称查）
  // 成功订单商品：iPhone 16 Pro 256GB 黑色钛金属（skuId 最小的一个）
  const iPhoneSku = await prisma.productSku.findFirst({
    where: { product: { name: "iPhone 16 Pro" }, name: { contains: "256GB" } },
    orderBy: { id: "asc" }
  })
  // 售后订单商品：AirPods Pro 2 标准版
  const airpodsSku = await prisma.productSku.findFirst({
    where: { product: { name: "AirPods Pro 2" }, name: { contains: "标准版" } }
  })

  // ── 订单1：已完成（status=3），含发货信息 ──
  const order1 = await prisma.order.create({
    data: {
      orderNo: "20260314100001",
      userId: defaultMobileUser.id,
      totalAmount: 7999.00,
      status: 3,
      address: "上海市 市辖区 黄浦区 世纪大道100号世贸中心3楼",
      shippingAddressId: defaultAddr?.id ?? null,
      addressSnapshot: addrSnapshot,
      shipmentNo: "SF1234567890",
      shippingCompany: "顺丰速运",
      shippedAt: new Date("2026-03-12T10:00:00.000Z"),
      createTime: new Date("2026-03-10T08:30:00.000Z"),
      items: iPhoneSku
        ? {
            create: [{
              productId: iPhoneSku.productId,
              skuId: iPhoneSku.id,
              skuName: iPhoneSku.name,
              quantity: 1,
              price: 7999.00
            }]
          }
        : undefined
    }
  })

  // ── 订单2：已完成（status=3），申请退款中（refund status=0）──
  const order2 = await prisma.order.create({
    data: {
      orderNo: "20260314100002",
      userId: defaultMobileUser.id,
      totalAmount: 1899.00,
      status: 3,
      address: "上海市 市辖区 黄浦区 世纪大道100号世贸中心3楼",
      shippingAddressId: defaultAddr?.id ?? null,
      addressSnapshot: addrSnapshot,
      shipmentNo: "YTO9876543210",
      shippingCompany: "圆通速递",
      shippedAt: new Date("2026-03-13T14:00:00.000Z"),
      createTime: new Date("2026-03-11T09:00:00.000Z"),
      items: airpodsSku
        ? {
            create: [{
              productId: airpodsSku.productId,
              skuId: airpodsSku.id,
              skuName: airpodsSku.name,
              quantity: 1,
              price: 1899.00
            }]
          }
        : undefined
    }
  })

  // 为订单2 创建退款申请
  await prisma.refundRequest.create({
    data: {
      orderId: order2.id,
      userId: defaultMobileUser.id,
      reason: "收到商品与描述不符，左耳降噪效果异常，申请退款",
      status: 0,
      createTime: new Date("2026-03-14T06:00:00.000Z"),
      updateTime: new Date("2026-03-14T06:00:00.000Z")
    }
  })

  console.log("✅ 订单测试数据完成（2 条：1 条已完成 + 1 条售后待审核）")

  console.log("")
  console.log("📋 后台账号：")
  console.log("   admin      / admin123   （管理员，全部权限）")
  console.log("   editor     / editor123  （编辑者，仅首页）")
  console.log(`   zhang_wei 等 ${EXTRA_USERS.length} 个扩充用户 / Cyber@2026`)
  console.log("")
  console.log("📱 移动端账号：")
  console.log("   13800000100 / mobile123  （默认移动端用户）")
  console.log("")
  console.log("🎉 数据库初始化完成！")
}

main()
  .catch((e) => {
    console.error("❌ 初始化失败：", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
