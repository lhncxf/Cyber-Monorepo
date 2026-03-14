import type { ICategory, IProduct } from './types'
import { http } from '@/http/http'
import { useMobileUserStore } from '@/store/mobileUser'

export function getCategories() {
  return http.get<ICategory[]>('/categories/all')
}

export function getAllProducts(query?: { categoryId?: number, keyword?: string }) {
  return http.get<IProduct[]>('/products/all', query)
}

export function getProductDetail(id: number) {
  return http.get<IProduct>(`/products/${id}`)
}

export function getMobileAuthHeader() {
  const store = useMobileUserStore()
  return { Authorization: `Bearer ${store.token}` }
}
