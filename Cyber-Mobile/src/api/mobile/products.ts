import type { ICategory, IProduct } from './types'
import { http } from '@/http/http'

export function getCategories() {
  return http.get<ICategory[]>('/categories/all')
}

export function getAllProducts(query?: { categoryId?: number, keyword?: string }) {
  return http.get<IProduct[]>('/products/all', query)
}

export function getProductDetail(id: number) {
  return http.get<IProduct>(`/products/${id}`)
}
