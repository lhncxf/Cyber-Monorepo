export interface DeptData {
  id: number
  parentId: number
  name: string
  sort: number
  status: boolean
  createTime: string
  children?: DeptData[]
}

export interface DeptSimple {
  id: number
  name: string
  parentId: number
}

export interface CreateOrUpdateDeptRequestData {
  id?: number
  parentId?: number
  name: string
  sort?: number
  status?: boolean
}

export interface DeptRequestData {
  name?: string
  status?: boolean | ""
}
