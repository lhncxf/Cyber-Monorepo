import type { IApplyRefundForm, ICreateOrderForm, IOrder, IOrderListRes } from './types'
import { http } from '@/http/http'

export function createOrder(data: ICreateOrderForm) {
  return http.post<{ orderId: number, orderNo: string }>('/mobile/orders', data)
}

export function getMyOrders(query?: { page?: number, pageSize?: number, status?: string }) {
  return http.get<IOrderListRes>('/mobile/orders', query)
}

export function getOrderDetail(id: number) {
  return http.get<IOrder>(`/mobile/orders/${id}`)
}

export function cancelOrder(id: number) {
  return http.put<void>(`/mobile/orders/${id}/cancel`)
}

export function payOrder(id: number) {
  return http.post<void>(`/mobile/orders/${id}/pay`)
}

export function applyRefund(orderId: number, data: IApplyRefundForm) {
  return http.post<void>(`/mobile/orders/${orderId}/refund`, data)
}
