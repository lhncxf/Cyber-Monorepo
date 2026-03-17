// ─── 通用 ───────────────────────────────────────────────────────────────────
const common = {
  confirm: "确定",
  cancel: "取消",
  save: "保存",
  reset: "重置",
  search: "查询",
  add: "新增",
  edit: "修改",
  delete: "删除",
  batchDelete: "批量删除",
  operate: "操作",
  status: "状态",
  createTime: "创建时间",
  sort: "排序",
  name: "名称",
  enable: "启用",
  disable: "禁用",
  tip: "提示",
  operateSuccess: "操作成功",
  deleteSuccess: "删除成功",
  placeholder: "请输入",
  selectPlaceholder: "请选择",
  confirmDelete: "确认删除？",
  expand: "展开",
  collapse: "收起"
}

// ─── 登录页 ──────────────────────────────────────────────────────────────────
const login = {
  username: "用户名",
  password: "密码",
  captcha: "验证码",
  loginBtn: "登 录",
  usernameRequired: "请输入用户名",
  passwordRequired: "请输入密码",
  passwordLength: "长度在 8 到 16 个字符",
  captchaRequired: "请输入验证码",
  formInvalid: "表单校验不通过"
}

// ─── 导航栏 ──────────────────────────────────────────────────────────────────
const navbar = {
  logout: "退出登录",
  lang: "语言"
}

// ─── 设置面板 ─────────────────────────────────────────────────────────────────
const settings = {
  layoutConfig: "布局配置",
  featureConfig: "功能配置",
  showTagsView: "显示标签栏",
  showLogo: "显示 Logo",
  fixedHeader: "固定 Header",
  showFooter: "显示页脚",
  showNotify: "显示消息通知",
  showThemeSwitch: "显示切换主题按钮",
  showScreenfull: "显示全屏按钮",
  showSearchMenu: "显示搜索按钮",
  cacheTagsView: "是否缓存标签栏",
  showWatermark: "开启系统水印",
  showGreyMode: "显示灰色模式",
  showColorWeakness: "显示色弱模式",
  resetBtn: "重 置",
  leftMode: "左侧模式",
  topMode: "顶部模式",
  mixMode: "混合模式"
}

// ─── 仪表盘 ──────────────────────────────────────────────────────────────────
const dashboard = {
  adminWelcome: "欢迎来到「Admin」角色专属首页",
  editorWelcome: "欢迎来到「Editor」角色专属首页"
}

// ─── 系统管理 › 用户 ──────────────────────────────────────────────────────────
const sysUser = {
  title: "用户",
  username: "用户名",
  password: "密码",
  phone: "手机号",
  email: "邮箱",
  dept: "部门",
  role: "角色",
  addBtn: "新增用户",
  usernameRequired: "请输入用户名",
  passwordRequired: "请输入密码",
  inputPlaceholder: "请输入",
  confirmDelete: "正在删除用户：{name}，确认删除？",
  resetPwd: "重置密码",
  newPassword: "新密码",
  newPasswordPlaceholder: "请输入新密码（至少6位）",
  passwordMinLength: "密码长度不能少于6位",
  confirmReset: "确认重置",
  resetSuccess: "重置成功"
}

// ─── 系统管理 › 角色 ──────────────────────────────────────────────────────────
const sysRole = {
  title: "角色",
  roleName: "角色名称",
  roleLabel: "角色标识",
  userCount: "用户数",
  addBtn: "新增角色",
  roleNameRequired: "请输入角色名称",
  roleLabelRequired: "请输入角色标识",
  roleLabelPlaceholder: "请输入，如 admin",
  confirmDelete: "正在删除角色：{name}，确认删除？"
}

// ─── 系统管理 › 菜单 ──────────────────────────────────────────────────────────
const sysMenu = {
  title: "菜单",
  menuName: "菜单名称",
  icon: "图标",
  type: "类型",
  path: "路由路径",
  component: "组件路径",
  permission: "权限标识",
  visible: "可见",
  addBtn: "新增菜单",
  addChildBtn: "新增",
  typeCatalog: "目录",
  typeMenu: "菜单",
  typeButton: "按钮",
  typeUnknown: "未知",
  statusEnable: "启用",
  statusDisable: "禁用",
  visibleShow: "可见",
  visibleHide: "隐藏",
  menuType: "菜单类型",
  iconLabel: "图标",
  sortLabel: "排序",
  pathLabel: "路由路径",
  componentLabel: "组件路径",
  permissionLabel: "权限标识",
  permissionPlaceholder: "请输入，如 system:user:create",
  statusLabel: "状态",
  visibleLabel: "是否可见",
  confirmDelete: "正在删除菜单：{name}，确认删除？"
}

// ─── 系统管理 › 部门 ──────────────────────────────────────────────────────────
const sysDept = {
  title: "部门",
  deptName: "部门名称",
  addBtn: "新增部门",
  addChild: "新增子部门",
  deptNameRequired: "请输入部门名称",
  confirmDelete: "正在删除部门：{name}，确认删除？"
}

// ─── 商品管理 › 商品 ──────────────────────────────────────────────────────────
const product = {
  title: "商品",
  id: "ID",
  productName: "商品名称",
  category: "分类",
  images: "图片",
  skus: "规格",
  description: "描述",
  statusOn: "上架",
  statusOff: "下架",
  addBtn: "新增商品",
  editTitle: "修改商品",
  addTitle: "新增商品",
  productNameLabel: "商品名称",
  productNamePlaceholder: "请输入商品名称",
  categoryLabel: "分类",
  categoryPlaceholder: "请选择分类（必须选到最底层）",
  statusLabel: "状态",
  imagesLabel: "商品图片",
  imageUrlPlaceholder: "输入图片URL后点击添加",
  imageAddBtn: "添加",
  descriptionLabel: "描述",
  descriptionPlaceholder: "请输入商品描述",
  specLabel: "规格",
  specGroupPlaceholder: "规格名，如：颜色",
  deleteSpecGroup: "删除规格组",
  addSpecValue: "添加规格值",
  addSpecGroup: "添加规格组",
  skuTable: "SKU 列表",
  skuCombo: "规格组合",
  skuPrice: "价格 (元)",
  skuStock: "库存",
  skuStatus: "状态",
  skuEmpty: "请先添加规格值生成 SKU 矩阵",
  nameRequired: "请输入商品名称",
  categoryRequired: "请选择商品分类",
  specRequired: "请至少添加一个规格组",
  specNameEmpty: "规格组名称不能为空",
  specValueEmpty: "规格组 [{name}] 至少需要一个规格值",
  skuRequired: "至少生成一个 SKU",
  skuPriceNegative: "规格价格不能为负数",
  confirmDelete: "正在删除商品：{name}，确认删除？",
  freightTemplateLabel: "运费模板",
  freightTemplatePlaceholder: "请选择运费模板（不选则不计运费）",
  inventoryBtn: "库存",
  inventoryTitle: "库存管理 — {name}",
  inventorySkuName: "规格",
  inventoryCurrentStock: "当前库存",
  inventoryUpdate: "修改",
  inventoryLowStockBadge: "{n} 个低库存",
  inventoryLowStockThreshold: "低库存阈值",
  inventorySaveSuccess: "库存已更新"
}

// ─── 商品管理 › 分类 ──────────────────────────────────────────────────────────
const productCategory = {
  title: "分类",
  categoryName: "分类名称",
  addBtn: "新增分类",
  addChildBtn: "新增子分类",
  addTopTitle: "新增一级分类",
  addChildTitle: "新增子分类",
  editTitle: "修改分类",
  parentCategory: "父分类",
  parentCategoryPlaceholder: "请选择父分类",
  categoryNameLabel: "分类名称",
  categoryNamePlaceholder: "请输入分类名称",
  sortLabel: "排序",
  sortHint: "数值越小越靠前",
  statusLabel: "状态",
  nameRequired: "请输入分类名称",
  confirmDelete: "正在删除分类：{name}，确认删除？"
}

// ─── 订单管理 ─────────────────────────────────────────────────────────────────
const order = {
  id: "ID",
  orderNo: "订单号",
  user: "用户",
  totalAmount: "总金额（元）",
  address: "收货地址",
  items: "商品",
  orderTime: "下单时间",
  statusPending: "待付款",
  statusPaid: "待发货",
  statusShipped: "待收货",
  statusDelivered: "已完成",
  statusCancelled: "已取消",
  changeSpec: "换规格",
  changeSpecTitle: "换规格",
  changeSpecProduct: "商品：",
  changeSpecConfirm: "确认换规格",
  stock: "库存",
  soldOut: "售罄",
  offShelf: "已下架",
  updateStatusSuccess: "状态更新成功",
  changeSpecSuccess: "换规格成功",
  shipBtn: "发货",
  shipTitle: "填写发货信息",
  shippingCompany: "快递公司",
  shipmentNo: "快递单号",
  shippingCompanyPlaceholder: "请输入快递公司名称",
  shipmentNoPlaceholder: "请输入快递单号",
  shippingCompanyRequired: "请输入快递公司",
  shipmentNoRequired: "请输入快递单号",
  shipSuccess: "发货成功"
}

// ─── 售后管理 ─────────────────────────────────────────────────────────────────
const refund = {
  title: "售后管理",
  id: "ID",
  orderNo: "订单号",
  user: "用户",
  reason: "退款原因",
  status: "状态",
  statusPending: "待审核",
  statusApproved: "已批准",
  statusRejected: "已拒绝",
  adminNote: "审核备注",
  applyTime: "申请时间",
  approveBtn: "批准",
  rejectBtn: "拒绝",
  adminNotePlaceholder: "请输入审核备注（可选）",
  approveConfirm: "确认批准该退款申请？",
  rejectConfirm: "确认拒绝该退款申请？",
  approveSuccess: "已批准退款",
  rejectSuccess: "已拒绝退款",
  reviewTitle: "审核退款"
}

// ─── 移动端用户 ───────────────────────────────────────────────────────────────
const mobileUser = {
  title: "移动端用户",
  phone: "手机号",
  password: "密码",
  nickname: "昵称",
  registerTime: "注册时间",
  addBtn: "新增用户",
  phoneRequired: "请输入手机号",
  phonePlaceholder: "请输入手机号",
  passwordRequired: "请输入密码",
  passwordPlaceholder: "请输入密码（至少6位）",
  nicknamePlaceholder: "请输入昵称",
  resetPwd: "重置密码",
  newPassword: "新密码",
  newPasswordPlaceholder: "请输入新密码（至少6位）",
  passwordMinLength: "密码长度不能少于6位",
  confirmReset: "确认重置",
  resetSuccess: "重置成功",
  confirmDelete: "正在删除用户：{name}，确认删除？"
}

// ─── 运费模板管理 ──────────────────────────────────────────────────────────────
const freightTemplate = {
  title: "运费模板",
  id: "ID",
  templateName: "模板名称",
  type: "类型",
  typeFixed: "固定运费",
  basePrice: "基础运费（元）",
  freeThreshold: "免运费金额（元）",
  freeThresholdPlaceholder: "不填则无免运费",
  rules: "区域附加运费",
  excludedRegions: "不发货地区",
  addBtn: "新增模板",
  editTitle: "修改模板",
  addTitle: "新增模板",
  templateNameLabel: "模板名称",
  templateNamePlaceholder: "请输入模板名称",
  typeLabel: "类型",
  basePriceLabel: "基础运费（元）",
  freeThresholdLabel: "免运费金额（元）",
  rulesLabel: "区域附加运费",
  excludedRegionsLabel: "不发货地区",
  addRuleBtn: "添加规则",
  addRegionBtn: "添加地区",
  ruleProvince: "省份",
  ruleProvincePlaceholder: "省份名称，如：新疆",
  ruleAddPrice: "附加运费（元）",
  regionPlaceholder: "地区名称，如：西藏",
  nameRequired: "请输入模板名称",
  confirmDelete: "正在删除运费模板：{name}，确认删除？"
}

// ─── 移动端用户 › 收货地址 ─────────────────────────────────────────────────────
const mobileUserAddress = {
  title: "收货地址",
  noAddresses: "暂无收货地址",
  name: "收件人",
  phone: "手机号",
  province: "省份",
  city: "城市",
  district: "区/县",
  detail: "详细地址",
  isDefault: "默认地址",
  yes: "是",
  no: "否"
}

// ─── 错误页 ──────────────────────────────────────────────────────────────────
const error = {
  backHome: "回到首页"
}

// ─── 标签栏右键菜单 ────────────────────────────────────────────────────────────
const tagsView = {
  refresh: "刷新",
  close: "关闭",
  closeOthers: "关闭其它",
  closeAll: "关闭所有"
}

// ─── 消息通知 ─────────────────────────────────────────────────────────────────
const notify = {
  title: "消息通知",
  notifyTab: "通知",
  messageTab: "消息",
  todoTab: "待办",
  viewHistory: "查看{name}历史"
}

// ─── 搜索菜单 ─────────────────────────────────────────────────────────────────
const searchMenu = {
  placeholder: "搜索菜单",
  noResult: "暂无搜索结果",
  results: "搜索结果",
  noRouteNameWarning: "无法通过搜索进入该菜单，请为对应的路由设置唯一的 Name",
  dynamicParamWarning: "该菜单有必填的动态参数，无法通过搜索进入",
  confirm: "确认",
  switch: "切换",
  close: "关闭",
  total: "共 {n} 项"
}

// ─── 主题切换 ─────────────────────────────────────────────────────────────────
const themeSwitch = {
  title: "主题模式",
  light: "现代风格",
  dark: "暗黑风格",
  classic: "经典风格"
}

// ─── ProTable 工具栏 ──────────────────────────────────────────────────────────
const proTable = {
  refresh: "刷新",
  columnSetting: "列展示",
  selectAll: "全选",
  invertSelection: "反选"
}

// ─── 图标选择器 ───────────────────────────────────────────────────────────────
const iconPicker = {
  placeholder: "点击选择图标",
  dialogTitle: "选择图标",
  searchPlaceholder: "搜索图标名称...",
  all: "全部",
  empty: "未找到匹配的图标"
}

// ─── 菜单名称映射（前端维护，无需数据库字段）────────────────────────────────────
export const menuNames: Record<string, string> = {
  首页: "首页",
  系统管理: "系统管理",
  用户管理: "用户管理",
  角色管理: "角色管理",
  菜单管理: "菜单管理",
  部门管理: "部门管理",
  商品管理: "商品管理",
  商品列表: "商品列表",
  分类管理: "分类管理",
  订单管理: "订单管理",
  售后管理: "售后管理",
  移动端管理: "移动端管理",
  移动端用户: "移动端用户",
  运费模板: "运费模板"
}

export default {
  common,
  login,
  navbar,
  settings,
  dashboard,
  sysUser,
  sysRole,
  sysMenu,
  sysDept,
  product,
  productCategory,
  order,
  refund,
  mobileUser,
  freightTemplate,
  mobileUserAddress,
  error,
  tagsView,
  notify,
  searchMenu,
  themeSwitch,
  proTable,
  iconPicker,
  menuNames
}
