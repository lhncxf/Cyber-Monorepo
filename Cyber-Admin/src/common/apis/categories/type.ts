export interface CategoryData {
  id: number
  parentId: number
  name: string
  sort: number
  status: boolean
  createTime: string
  children?: CategoryData[]
}

export interface CategorySimple {
  id: number
  name: string
  parentId: number
  children?: CategorySimple[]
}

export interface CreateOrUpdateCategoryData {
  id?: number
  parentId?: number
  name: string
  sort?: number
  status?: boolean
}

export interface CategoryRequestData {
  name?: string
  status?: boolean | ""
}
