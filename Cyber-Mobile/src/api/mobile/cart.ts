import type { IServerCartItem } from './types'
import { http } from '@/http/http'
import { getMobileAuthHeader } from './products'

export function getCart() {
  return http.get<IServerCartItem[]>('/mobile/cart', undefined, getMobileAuthHeader())
}

export function addToCart(data: { productId: number, skuId: number, quantity?: number }) {
  return http.post<null>('/mobile/cart', data, undefined, getMobileAuthHeader())
}

export function updateCartItem(id: number, quantity: number) {
  return http.put<null>(`/mobile/cart/${id}`, { quantity }, undefined, getMobileAuthHeader())
}

export function removeCartItem(id: number) {
  return http.delete<null>(`/mobile/cart/${id}`, undefined, getMobileAuthHeader())
}

export function clearCart() {
  return http.delete<null>('/mobile/cart', undefined, getMobileAuthHeader())
}
