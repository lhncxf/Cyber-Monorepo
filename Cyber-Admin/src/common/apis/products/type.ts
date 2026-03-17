export interface ProductSku {
  id?: number
  name: string
  price: number
  stock: number
  status: boolean
}

export interface ProductData {
  id: number
  name: string
  categoryId: number | null
  categoryName: string
  images: string[]
  description: string | null
  status: boolean
  createTime: string
  skus: ProductSku[]
  freightTemplateId: number | null
  freightTemplateName: string | null
}

export interface ProductRequestData {
  currentPage: number
  size: number
  name?: string
  categoryId?: number
  status?: boolean | string
}

export interface CreateOrUpdateProductData {
  id?: number
  name: string
  categoryId?: number | null
  images?: string[]
  description?: string
  status?: boolean
  skus?: ProductSku[]
  freightTemplateId?: number | null
}

export type ProductResponseData = ApiResponseData<{
  list: ProductData[]
  total: number
}>
