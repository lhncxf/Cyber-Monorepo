import type * as Order from "./type"
import { request } from "@/http/axios"

export function getOrderListApi(params: Order.OrderRequestData) {
  return request<Order.OrderResponseData>({
    url: "orders",
    method: "get",
    params
  })
}

export function updateOrderStatusApi(data: { id: number, status: number }) {
  return request({
    url: "orders",
    method: "put",
    data
  })
}

export function updateOrderItemSkuApi(itemId: number, skuId: number) {
  return request({
    url: `orders/items/${itemId}`,
    method: "put",
    data: { skuId }
  })
}

export function shipOrderApi(id: number, data: Order.ShipOrderData) {
  return request({
    url: `orders/${id}/ship`,
    method: "post",
    data
  })
}

export function getRefundListApi(params: Order.RefundRequestParams) {
  return request<Order.RefundResponseData>({
    url: "refunds",
    method: "get",
    params
  })
}

export function reviewRefundApi(id: number, data: Order.ReviewRefundData) {
  return request({
    url: `refunds/${id}`,
    method: "put",
    data
  })
}
