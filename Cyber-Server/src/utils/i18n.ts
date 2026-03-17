import type { FastifyRequest } from "fastify"

// ─── Message Dictionaries ───────────────────────────────────────────────────

const messages = {
  zh: {
    // common
    querySuccess: "查询成功",
    createSuccess: "新增成功",
    updateSuccess: "修改成功",
    deleteSuccess: "删除成功",
    noPermission: "无权限",
    serverError: "服务器内部错误",

    // auth
    captchaFetched: "获取验证码成功",
    captchaExpired: "验证码已过期，请刷新",
    captchaWrong: "验证码错误",
    loginSuccess: "登录成功",
    invalidCredentials: "用户名或密码错误",
    getUserSuccess: "获取用户信息成功",
    tokenExpired: "Token 已过期或无效",

    // system users
    usernameExists: "用户名已存在",
    passwordTooShort: "密码长度不能少于6位",
    resetSuccess: "重置成功",

    // roles
    roleIdentExists: "角色标识已存在",

    // menus
    deleteChildFirst: "请先删除子菜单",

    // departments
    deleteDeptChildFirst: "请先删除子部门",

    // products
    productNotFound: "商品不存在",
    productOffShelfMsg: "商品已下架",
    productStatusUpdated: "上下架状态已更新",
    skuNotFoundInv: "SKU不存在",
    stockUpdated: "库存已更新",

    // categories
    parentCategoryNotFound: "父分类不存在",
    maxTwoLevels: "最多支持2级分类",
    deleteCategoryChildFirst: "请先删除子分类",
    categoryHasProducts: "该分类下还有商品，无法删除",
    cannotSetSelfAsParent: "不能将自身设为父分类",

    // orders
    orderNotPaid: "只能对已付款（待发货）的订单发货",
    orderShipped: "已发货",
    partialSkuNotFound: "部分规格不存在或已下架",
    orderCreated: "下单成功",
    orderNotFound: "订单不存在",
    orderCancelPendingOnly: "只能取消待付款的订单",
    orderCancelled: "已取消",
    orderStatusNotAllowPay: "订单状态不允许支付",
    paySuccess: "支付成功",
    orderItemNotFound: "订单条目不存在",
    skuNotFound: "规格不存在",
    skuNotBelongProduct: "规格不属于该商品",
    skuOffShelf: "该规格已下架",
    skuOutOfStock: "该规格库存不足",
    changeSkuSuccess: "换规格成功",
    productOffShelf: (name: string) => `商品 ${name} 已下架`,
    skuStockInsufficient: (name: string) => `规格 ${name} 库存不足`,

    // cart
    pleaseLogin: "请先登录",
    skuNotFoundOrOffShelf: "规格不存在或已下架",
    stockInsufficient: "库存不足",
    addedToCart: "已加入购物车",
    cartItemNotFound: "购物车项不存在",
    cartItemUpdated: "已更新",
    cartItemDeleted: "已删除",
    cartCleared: "购物车已清空",

    // mobile auth
    phonePasswordRequired: "手机号和密码不能为空",
    mobilePasswordTooShort: "密码长度不能少于6位",
    phoneAlreadyRegistered: "该手机号已注册",
    registerSuccess: "注册成功",
    mobileInvalidCredentials: "手机号或密码错误",
    mobileLoginSuccess: "登录成功",
    mobileUserNotFound: "用户不存在",

    // mobile users
    phoneExists: "手机号已存在",
    phonePasswordRequiredAdmin: "手机号和密码不能为空",
    mobilePasswordTooShortAdmin: "密码长度不能少于6位",

    // shipping addresses
    addressNotFound: "收货地址不存在",

    // freight templates
    freightTemplateNotFound: "运费模板不存在",

    // refunds
    refundAlreadyExists: "该订单已有退款申请",
    refundNotAllowed: "当前订单状态不允许申请退款",
    refundSubmitted: "退款申请已提交",
    refundNotFound: "退款申请不存在",
    refundAlreadyProcessed: "该退款申请已处理，请勿重复操作",
    refundProcessed: "退款审核完成",
    refundApproved: "退款已批准",
    refundRejected: "退款已拒绝"
  },

  en: {
    // common
    querySuccess: "Query successful",
    createSuccess: "Created successfully",
    updateSuccess: "Updated successfully",
    deleteSuccess: "Deleted successfully",
    noPermission: "No permission",
    serverError: "Internal server error",

    // auth
    captchaFetched: "Captcha fetched",
    captchaExpired: "Captcha expired, please refresh",
    captchaWrong: "Incorrect captcha",
    loginSuccess: "Login successful",
    invalidCredentials: "Invalid username or password",
    getUserSuccess: "User info fetched",
    tokenExpired: "Token expired or invalid",

    // system users
    usernameExists: "Username already exists",
    passwordTooShort: "Password must be at least 6 characters",
    resetSuccess: "Reset successful",

    // roles
    roleIdentExists: "Role identifier already exists",

    // menus
    deleteChildFirst: "Please delete child menus first",

    // departments
    deleteDeptChildFirst: "Please delete child departments first",

    // products
    productNotFound: "Product not found",
    productOffShelfMsg: "Product is off shelf",
    productStatusUpdated: "Product status updated",
    skuNotFoundInv: "SKU not found",
    stockUpdated: "Stock updated",

    // categories
    parentCategoryNotFound: "Parent category not found",
    maxTwoLevels: "Maximum 2 levels of categories supported",
    deleteCategoryChildFirst: "Please delete child categories first",
    categoryHasProducts: "Cannot delete: category still has products",
    cannotSetSelfAsParent: "Cannot set itself as parent category",

    // orders
    orderNotPaid: "Only paid (pending shipment) orders can be shipped",
    orderShipped: "Shipped",
    partialSkuNotFound: "Some SKUs not found or off shelf",
    orderCreated: "Order placed successfully",
    orderNotFound: "Order not found",
    orderCancelPendingOnly: "Only pending orders can be cancelled",
    orderCancelled: "Cancelled",
    orderStatusNotAllowPay: "Order status does not allow payment",
    paySuccess: "Payment successful",
    orderItemNotFound: "Order item not found",
    skuNotFound: "SKU not found",
    skuNotBelongProduct: "SKU does not belong to this product",
    skuOffShelf: "This SKU is off shelf",
    skuOutOfStock: "This SKU is out of stock",
    changeSkuSuccess: "SKU changed successfully",
    productOffShelf: (name: string) => `Product "${name}" is off shelf`,
    skuStockInsufficient: (name: string) => `SKU "${name}" has insufficient stock`,

    // cart
    pleaseLogin: "Please log in first",
    skuNotFoundOrOffShelf: "SKU not found or off shelf",
    stockInsufficient: "Insufficient stock",
    addedToCart: "Added to cart",
    cartItemNotFound: "Cart item not found",
    cartItemUpdated: "Updated",
    cartItemDeleted: "Deleted",
    cartCleared: "Cart cleared",

    // mobile auth
    phonePasswordRequired: "Phone number and password are required",
    mobilePasswordTooShort: "Password must be at least 6 characters",
    phoneAlreadyRegistered: "Phone number already registered",
    registerSuccess: "Registration successful",
    mobileInvalidCredentials: "Invalid phone number or password",
    mobileLoginSuccess: "Login successful",
    mobileUserNotFound: "User not found",

    // mobile users
    phoneExists: "Phone number already exists",
    phonePasswordRequiredAdmin: "Phone number and password are required",
    mobilePasswordTooShortAdmin: "Password must be at least 6 characters",

    // shipping addresses
    addressNotFound: "Shipping address not found",

    // freight templates
    freightTemplateNotFound: "Freight template not found",

    // refunds
    refundAlreadyExists: "A refund request already exists for this order",
    refundNotAllowed: "Current order status does not allow refund",
    refundSubmitted: "Refund request submitted",
    refundNotFound: "Refund request not found",
    refundAlreadyProcessed: "This refund has already been processed",
    refundProcessed: "Refund reviewed",
    refundApproved: "Refund approved",
    refundRejected: "Refund rejected"
  }

} as const

export type MessageKey = keyof typeof messages.zh

// ─── Helper Functions ────────────────────────────────────────────────────────

export type Lang = "zh" | "en"

export function getRequestLang(request: FastifyRequest): Lang {
  const accept = (request.headers["accept-language"] ?? "").toLowerCase()
  if (accept.includes("en")) return "en"
  return "zh"
}

export function t(key: MessageKey, lang: Lang = "zh"): string {
  const dict = messages[lang] as Record<string, unknown>
  const zhDict = messages.zh as Record<string, unknown>
  const value = dict[key] ?? zhDict[key]
  if (typeof value === "function") {
    throw new TypeError(`i18n: key "${key}" is a parameterized message, use tf() instead of t()`)
  }
  return value as string
}

/**
 * Translate a message that requires a dynamic argument.
 * Used for messages like productOffShelf(name) or skuStockInsufficient(name).
 */
export function tf(
  key: "productOffShelf" | "skuStockInsufficient",
  arg: string,
  lang: Lang = "zh"
): string {
  const dict = messages[lang] as Record<string, unknown>
  const fn = dict[key]
  if (typeof fn === "function") return (fn as (a: string) => string)(arg)
  // fallback to Chinese
  const zhFn = (messages.zh as Record<string, unknown>)[key]
  if (typeof zhFn === "function") return (zhFn as (a: string) => string)(arg)
  return key
}
