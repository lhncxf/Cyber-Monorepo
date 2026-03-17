import type * as Product from "./type"
import { request } from "@/http/axios"

export function getProductListApi(params: Product.ProductRequestData) {
  return request<Product.ProductResponseData>({
    url: "products",
    method: "get",
    params
  })
}

export function getProductDetailApi(id: number) {
  return request<ApiResponseData<Product.ProductData>>({
    url: `products/${id}`,
    method: "get"
  })
}

export function createProductApi(data: Product.CreateOrUpdateProductData) {
  return request({
    url: "products",
    method: "post",
    data
  })
}

export function updateProductApi(data: Product.CreateOrUpdateProductData) {
  return request({
    url: "products",
    method: "put",
    data
  })
}

export function deleteProductApi(id: number) {
  return request({
    url: `products/${id}`,
    method: "delete"
  })
}

export function toggleProductStatusApi(id: number, status: boolean) {
  return request({
    url: `products/${id}/status`,
    method: "patch",
    data: { status }
  })
}

export function updateSkuStockApi(skuId: number, stock: number) {
  return request({
    url: `products/skus/${skuId}/stock`,
    method: "put",
    data: { stock }
  })
}

export interface LowStockItem {
  skuId: number
  skuName: string
  stock: number
  productId: number
  productName: string
}

export function getLowStockApi(threshold?: number) {
  return request<ApiResponseData<LowStockItem[]>>({
    url: "products/low-stock",
    method: "get",
    params: threshold !== undefined ? { threshold } : {}
  })
}
