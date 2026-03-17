export interface FreightTemplateData {
  id: number
  name: string
  type: number
  basePrice: number
  freeThreshold: number | null
  rules: string
  excludedRegions: string
  status: boolean
  createTime: string
}

export interface FreightTemplateSimple {
  id: number
  name: string
  basePrice: number
  freeThreshold: number | null
}

export interface CreateOrUpdateFreightTemplateData {
  id?: number
  name: string
  type?: number
  basePrice: number
  freeThreshold?: number | null
  rules?: string
  excludedRegions?: string
  status?: boolean
}

export interface FreightTemplateRequestData {
  currentPage: number
  size: number
  name?: string
  status?: boolean | ""
}

export type FreightTemplateResponseData = ApiResponseData<{
  list: FreightTemplateData[]
  total: number
}>
