// ─── Common ──────────────────────────────────────────────────────────────────
const common = {
  confirm: "OK",
  cancel: "Cancel",
  save: "Save",
  reset: "Reset",
  search: "Search",
  add: "Add",
  edit: "Edit",
  delete: "Delete",
  batchDelete: "Batch Delete",
  operate: "Action",
  status: "Status",
  createTime: "Created At",
  sort: "Sort",
  name: "Name",
  enable: "Enable",
  disable: "Disable",
  tip: "Tip",
  operateSuccess: "Success",
  deleteSuccess: "Deleted",
  placeholder: "Enter value",
  selectPlaceholder: "Select",
  confirmDelete: "Confirm delete?",
  expand: "Expand",
  collapse: "Collapse"
}

// ─── Login ────────────────────────────────────────────────────────────────────
const login = {
  username: "Username",
  password: "Password",
  captcha: "Captcha",
  loginBtn: "Sign In",
  usernameRequired: "Please enter username",
  passwordRequired: "Please enter password",
  passwordLength: "Length must be 8–16 characters",
  captchaRequired: "Please enter captcha",
  formInvalid: "Form validation failed"
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
const navbar = {
  logout: "Sign Out",
  lang: "Language"
}

// ─── Settings Panel ───────────────────────────────────────────────────────────
const settings = {
  layoutConfig: "Layout Config",
  featureConfig: "Feature Config",
  showTagsView: "Show Tags Bar",
  showLogo: "Show Logo",
  fixedHeader: "Fixed Header",
  showFooter: "Show Footer",
  showNotify: "Show Notifications",
  showThemeSwitch: "Show Theme Toggle",
  showScreenfull: "Show Fullscreen Button",
  showSearchMenu: "Show Search Button",
  cacheTagsView: "Cache Tags Bar",
  showWatermark: "Enable Watermark",
  showGreyMode: "Grey Mode",
  showColorWeakness: "Color Weakness Mode",
  resetBtn: "Reset",
  leftMode: "Left Mode",
  topMode: "Top Mode",
  mixMode: "Mixed Mode"
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
const dashboard = {
  adminWelcome: "Welcome to the Admin role dashboard",
  editorWelcome: "Welcome to the Editor role dashboard"
}

// ─── System › Users ───────────────────────────────────────────────────────────
const sysUser = {
  title: "User",
  username: "Username",
  password: "Password",
  phone: "Phone",
  email: "Email",
  dept: "Department",
  role: "Role",
  addBtn: "Add User",
  usernameRequired: "Please enter username",
  passwordRequired: "Please enter password",
  inputPlaceholder: "Enter value",
  confirmDelete: "Deleting user: {name}, confirm?",
  resetPwd: "Reset Password",
  newPassword: "New Password",
  newPasswordPlaceholder: "Enter new password (min 6 chars)",
  passwordMinLength: "Password must be at least 6 characters",
  confirmReset: "Confirm Reset",
  resetSuccess: "Reset successful"
}

// ─── System › Roles ───────────────────────────────────────────────────────────
const sysRole = {
  title: "Role",
  roleName: "Role Name",
  roleLabel: "Role Label",
  userCount: "Users",
  addBtn: "Add Role",
  roleNameRequired: "Please enter role name",
  roleLabelRequired: "Please enter role label",
  roleLabelPlaceholder: "e.g. admin",
  confirmDelete: "Deleting role: {name}, confirm?"
}

// ─── System › Menus ───────────────────────────────────────────────────────────
const sysMenu = {
  title: "Menu",
  menuName: "Menu Name",
  icon: "Icon",
  type: "Type",
  path: "Route Path",
  component: "Component Path",
  permission: "Permission",
  visible: "Visible",
  addBtn: "Add Menu",
  addChildBtn: "Add",
  typeCatalog: "Catalog",
  typeMenu: "Menu",
  typeButton: "Button",
  typeUnknown: "Unknown",
  statusEnable: "Enabled",
  statusDisable: "Disabled",
  visibleShow: "Visible",
  visibleHide: "Hidden",
  menuType: "Menu Type",
  iconLabel: "Icon",
  sortLabel: "Sort",
  pathLabel: "Route Path",
  componentLabel: "Component Path",
  permissionLabel: "Permission",
  permissionPlaceholder: "e.g. system:user:create",
  statusLabel: "Status",
  visibleLabel: "Visible",
  confirmDelete: "Deleting menu: {name}, confirm?"
}

// ─── System › Departments ─────────────────────────────────────────────────────
const sysDept = {
  title: "Department",
  deptName: "Dept Name",
  addBtn: "Add Dept",
  addChild: "Add Sub-dept",
  deptNameRequired: "Please enter dept name",
  confirmDelete: "Deleting dept: {name}, confirm?"
}

// ─── Product › Products ───────────────────────────────────────────────────────
const product = {
  title: "Product",
  id: "ID",
  productName: "Product Name",
  category: "Category",
  images: "Images",
  skus: "SKUs",
  description: "Description",
  statusOn: "On Sale",
  statusOff: "Off Sale",
  addBtn: "Add Product",
  editTitle: "Edit Product",
  addTitle: "Add Product",
  productNameLabel: "Product Name",
  productNamePlaceholder: "Enter product name",
  categoryLabel: "Category",
  categoryPlaceholder: "Select category (must select leaf node)",
  statusLabel: "Status",
  imagesLabel: "Images",
  imageUrlPlaceholder: "Enter image URL then click Add",
  imageAddBtn: "Add",
  descriptionLabel: "Description",
  descriptionPlaceholder: "Enter product description",
  specLabel: "Specs",
  specGroupPlaceholder: "Spec name, e.g. Color",
  deleteSpecGroup: "Remove Spec Group",
  addSpecValue: "Add Spec Value",
  addSpecGroup: "Add Spec Group",
  skuTable: "SKU List",
  skuCombo: "Spec Combo",
  skuPrice: "Price (¥)",
  skuStock: "Stock",
  skuStatus: "Status",
  skuEmpty: "Add spec values first to generate SKU matrix",
  nameRequired: "Please enter product name",
  categoryRequired: "Please select a category",
  specRequired: "Please add at least one spec group",
  specNameEmpty: "Spec group name cannot be empty",
  specValueEmpty: "Spec group [{name}] needs at least one value",
  skuRequired: "At least one SKU must be generated",
  skuPriceNegative: "SKU price cannot be negative",
  confirmDelete: "Deleting product: {name}, confirm?",
  freightTemplateLabel: "Freight Template",
  freightTemplatePlaceholder: "Select freight template (leave empty for no shipping fee)",
  inventoryBtn: "Stock",
  inventoryTitle: "Inventory — {name}",
  inventorySkuName: "Spec",
  inventoryCurrentStock: "Current Stock",
  inventoryUpdate: "Update",
  inventoryLowStockBadge: "{n} low stock",
  inventoryLowStockThreshold: "Low stock threshold",
  inventorySaveSuccess: "Stock updated"
}

// ─── Product › Categories ─────────────────────────────────────────────────────
const productCategory = {
  title: "Category",
  categoryName: "Category Name",
  addBtn: "Add Category",
  addChildBtn: "Add Sub-category",
  addTopTitle: "Add Top-level Category",
  addChildTitle: "Add Sub-category",
  editTitle: "Edit Category",
  parentCategory: "Parent Category",
  parentCategoryPlaceholder: "Select parent category",
  categoryNameLabel: "Category Name",
  categoryNamePlaceholder: "Enter category name",
  sortLabel: "Sort",
  sortHint: "Smaller value = higher priority",
  statusLabel: "Status",
  nameRequired: "Please enter category name",
  confirmDelete: "Deleting category: {name}, confirm?"
}

// ─── Orders ───────────────────────────────────────────────────────────────────
const order = {
  id: "ID",
  orderNo: "Order No.",
  user: "User",
  totalAmount: "Total (¥)",
  address: "Shipping Address",
  items: "Items",
  orderTime: "Order Time",
  statusPending: "Pending Payment",
  statusPaid: "Pending Shipment",
  statusShipped: "In Transit",
  statusDelivered: "Completed",
  statusCancelled: "Cancelled",
  changeSpec: "Change Spec",
  changeSpecTitle: "Change Spec",
  changeSpecProduct: "Product: ",
  changeSpecConfirm: "Confirm Change",
  stock: "Stock",
  soldOut: "Sold Out",
  offShelf: "Off Shelf",
  updateStatusSuccess: "Status updated",
  changeSpecSuccess: "Spec changed",
  shipBtn: "Ship",
  shipTitle: "Enter Shipping Info",
  shippingCompany: "Carrier",
  shipmentNo: "Tracking No.",
  shippingCompanyPlaceholder: "Enter carrier name",
  shipmentNoPlaceholder: "Enter tracking number",
  shippingCompanyRequired: "Please enter carrier name",
  shipmentNoRequired: "Please enter tracking number",
  shipSuccess: "Shipped successfully"
}

// ─── After-sales ──────────────────────────────────────────────────────────────
const refund = {
  title: "After-Sales",
  id: "ID",
  orderNo: "Order No.",
  user: "User",
  reason: "Reason",
  status: "Status",
  statusPending: "Pending Review",
  statusApproved: "Approved",
  statusRejected: "Rejected",
  adminNote: "Review Note",
  applyTime: "Applied At",
  approveBtn: "Approve",
  rejectBtn: "Reject",
  adminNotePlaceholder: "Enter review note (optional)",
  approveConfirm: "Approve this refund request?",
  rejectConfirm: "Reject this refund request?",
  approveSuccess: "Refund approved",
  rejectSuccess: "Refund rejected",
  reviewTitle: "Review Refund"
}

// ─── Mobile Users ─────────────────────────────────────────────────────────────
const mobileUser = {
  title: "Mobile Users",
  phone: "Phone",
  password: "Password",
  nickname: "Nickname",
  registerTime: "Registered At",
  addBtn: "Add User",
  phoneRequired: "Please enter phone",
  phonePlaceholder: "Enter phone number",
  passwordRequired: "Please enter password",
  passwordPlaceholder: "Enter password (min 6 chars)",
  nicknamePlaceholder: "Enter nickname",
  resetPwd: "Reset Password",
  newPassword: "New Password",
  newPasswordPlaceholder: "Enter new password (min 6 chars)",
  passwordMinLength: "Password must be at least 6 characters",
  confirmReset: "Confirm Reset",
  resetSuccess: "Reset successful",
  confirmDelete: "Deleting user: {name}, confirm?"
}

// ─── Freight Templates ────────────────────────────────────────────────────────
const freightTemplate = {
  title: "Freight Template",
  id: "ID",
  templateName: "Template Name",
  type: "Type",
  typeFixed: "Fixed Price",
  basePrice: "Base Shipping (¥)",
  freeThreshold: "Free Shipping Threshold (¥)",
  freeThresholdPlaceholder: "Leave empty for no free shipping",
  rules: "Regional Surcharges",
  excludedRegions: "Excluded Regions",
  addBtn: "Add Template",
  editTitle: "Edit Template",
  addTitle: "Add Template",
  templateNameLabel: "Template Name",
  templateNamePlaceholder: "Enter template name",
  typeLabel: "Type",
  basePriceLabel: "Base Shipping (¥)",
  freeThresholdLabel: "Free Shipping Threshold (¥)",
  rulesLabel: "Regional Surcharges",
  excludedRegionsLabel: "Excluded Regions",
  addRuleBtn: "Add Rule",
  addRegionBtn: "Add Region",
  ruleProvince: "Province",
  ruleProvincePlaceholder: "Province name, e.g. Xinjiang",
  ruleAddPrice: "Surcharge (¥)",
  regionPlaceholder: "Region name, e.g. Tibet",
  nameRequired: "Please enter template name",
  confirmDelete: "Deleting freight template: {name}, confirm?"
}

// ─── Mobile User › Shipping Addresses ────────────────────────────────────────
const mobileUserAddress = {
  title: "Shipping Addresses",
  noAddresses: "No addresses yet",
  name: "Recipient",
  phone: "Phone",
  province: "Province",
  city: "City",
  district: "District",
  detail: "Address Detail",
  isDefault: "Default",
  yes: "Yes",
  no: "No"
}

// ─── Error Pages ─────────────────────────────────────────────────────────────
const error = {
  backHome: "Back to Home"
}

// ─── Tags View Context Menu ───────────────────────────────────────────────────
const tagsView = {
  refresh: "Refresh",
  close: "Close",
  closeOthers: "Close Others",
  closeAll: "Close All"
}

// ─── Notifications ────────────────────────────────────────────────────────────
const notify = {
  title: "Notifications",
  notifyTab: "Notify",
  messageTab: "Message",
  todoTab: "Todo",
  viewHistory: "View {name} History"
}

// ─── Search Menu ──────────────────────────────────────────────────────────────
const searchMenu = {
  placeholder: "Search Menu",
  noResult: "No results found",
  results: "Results",
  noRouteNameWarning: "Cannot navigate to this menu via search. Please set a unique Name for the route.",
  dynamicParamWarning: "This menu has required dynamic params and cannot be entered via search.",
  confirm: "Confirm",
  switch: "Switch",
  close: "Close",
  total: "{n} items"
}

// ─── Theme Switch ─────────────────────────────────────────────────────────────
const themeSwitch = {
  title: "Theme Mode"
}

// ─── Icon Picker ──────────────────────────────────────────────────────────────
const iconPicker = {
  placeholder: "Click to select icon",
  dialogTitle: "Select Icon",
  searchPlaceholder: "Search icon name...",
  all: "All",
  empty: "No matching icons found"
}

// ─── Menu name mapping (frontend-maintained, no DB field needed) ───────────────
export const menuNames: Record<string, string> = {
  首页: "Home",
  系统管理: "System",
  用户管理: "Users",
  角色管理: "Roles",
  菜单管理: "Menus",
  部门管理: "Departments",
  商品管理: "Products",
  商品列表: "Product List",
  分类管理: "Categories",
  订单管理: "Orders",
  售后管理: "After-Sales",
  移动端管理: "Mobile",
  移动端用户: "Mobile Users",
  运费模板: "Freight Templates"
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
  iconPicker,
  menuNames
}
