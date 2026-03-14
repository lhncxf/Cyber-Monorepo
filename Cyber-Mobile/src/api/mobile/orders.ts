import type { IApplyRefundForm, ICreateOrderForm, IOrder, IOrderListRes } from './types'
import { http } from '@/http/http'
import { getMobileAuthHeader } from './products'

export function createOrder(data: ICreateOrderForm) {
  return http.post<{ orderId: number, orderNo: string }>('/mobile/orders', data, undefined, getMobileAuthHeader())
}

export function getMyOrders(query?: { page?: number, pageSize?: number, status?: string }) {
  return http.get<IOrderListRes>('/mobile/orders', query, getMobileAuthHeader())
}

export function getOrderDetail(id: number) {
  return http.get<IOrder>(`/mobile/orders/${id}`, undefined, getMobileAuthHeader())
}

export function cancelOrder(id: number) {
  return http.put<void>(`/mobile/orders/${id}/cancel`, undefined, undefined, getMobileAuthHeader())
}

export function payOrder(id: number) {
  return http.post<void>(`/mobile/orders/${id}/pay`, undefined, undefined, getMobileAuthHeader())
}

export function applyRefund(orderId: number, data: IApplyRefundForm) {
  return http.post<void>(`/mobile/orders/${orderId}/refund`, data, undefined, getMobileAuthHeader())
}
