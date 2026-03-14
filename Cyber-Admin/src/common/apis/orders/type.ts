export interface OrderItem {
  id: number
  productId: number
  skuId?: number
  skuName?: string
  quantity: number
  price: number
  product: {
    id: number
    name: string
    image: string
  }
}

export interface OrderUser {
  id: number
  phone: string
  nickname: string
}

export interface OrderData {
  id: number
  orderNo: string
  userId: number
  user: OrderUser
  totalAmount: number
  status: number
  address: string
  createTime: string
  shipmentNo?: string | null
  shippingCompany?: string | null
  shippedAt?: string | null
  items: OrderItem[]
}

export interface OrderRequestData {
  currentPage: number
  size: number
  orderNo?: string
  status?: number | string
}

export interface ShipOrderData {
  shippingCompany: string
  shipmentNo: string
}

export type OrderResponseData = ApiResponseData<{
  list: OrderData[]
  total: number
}>

export interface RefundUser {
  phone: string
  nickname: string
}

export interface RefundData {
  id: number
  orderId: number
  orderNo: string
  userId: number
  user: RefundUser
  reason: string
  status: number
  adminNote: string | null
  createTime: string
}

export interface RefundRequestParams {
  currentPage: number
  size: number
  status?: number | string
}

export interface ReviewRefundData {
  action: "approve" | "reject"
  adminNote?: string
}

export type RefundResponseData = ApiResponseData<{
  list: RefundData[]
  total: number
}>
