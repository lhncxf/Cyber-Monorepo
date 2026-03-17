// ==================== Auth ====================

export interface IMobileRegisterForm {
  phone: string
  password: string
  nickname?: string
}

export interface IMobileLoginForm {
  phone: string
  password: string
}

export interface IMobileUser {
  id: number
  phone: string
  nickname: string
  avatar?: string
}

export interface IMobileAuthRes {
  token: string
  user: IMobileUser
}

// ==================== Product ====================

export interface ICategory {
  id: number
  name: string
  parentId: number
  children?: ICategory[]
}

export interface IProductSku {
  id: number
  name: string
  price: number
  stock: number
  status: boolean
}

export interface IProduct {
  id: number
  name: string
  categoryId: number | null
  categoryName: string
  images: string[]
  description?: string
  status: boolean
  createTime: string
  skus: IProductSku[]
  freightTemplateId?: number | null
  freightTemplateName?: string | null
}

// ==================== Order ====================

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface ICreateOrderForm {
  items: Array<{ skuId: number, quantity: number }>
  addressId?: number
  addressSnapshot?: string | null
  remark?: string
  clearCart?: boolean
}

export interface IOrderItemDetail {
  id: number
  productId: number
  skuId?: number
  skuName?: string
  quantity: number
  price: number
  product: {
    name: string
    images?: string[]
  }
}

export interface IOrder {
  id: number
  orderNo: string
  status: OrderStatus
  totalAmount: number
  addressId?: number
  addressSnapshot?: string | null
  remark?: string
  createdAt: string
  updatedAt: string
  shipmentNo?: string | null
  shippingCompany?: string | null
  shippedAt?: string | null
  items: IOrderItemDetail[]
  refund?: { id: number, status: number } | null
}

export interface IOrderListRes {
  list: IOrder[]
  total: number
  page: number
  pageSize: number
}

export interface IRefundRequest {
  id: number
  orderId: number
  reason: string
  status: number
  adminNote?: string | null
  createTime: string
}

export interface IApplyRefundForm {
  reason: string
}

// ==================== Cart ====================

export interface IServerCartItem {
  id: number
  productId: number
  skuId: number
  productName: string
  skuName: string
  price: number
  stock: number
  image: string
  quantity: number
  available: boolean
}

// Used for buyNow flow (transient, stored in storage temporarily)
export interface IBuyNowItem {
  skuId: number
  quantity: number
  productName: string
  skuName: string
  price: number
  image: string
}

// ==================== Address ====================

export interface IShippingAddress {
  id: number
  userId: number
  name: string
  phone: string
  province: string
  city: string
  district?: string
  detail: string
  isDefault: boolean
  createTime: string
}

export interface ICreateAddressForm {
  name: string
  phone: string
  province: string
  city: string
  district?: string
  detail: string
  isDefault?: boolean
}

export interface IUpdateAddressForm extends ICreateAddressForm {
  id: number
}

// ==================== Product (extended with freight) ====================

export interface IFreightCheckResult {
  deliverable: boolean
  shippingCost: number
  freeShipping: boolean
}
