export interface RoleData {
  id: number
  name: string
  label: string
  status: boolean
  userCount: number
  createTime: string
}

export interface RoleSimple {
  id: number
  name: string
  label: string
}

export interface CreateOrUpdateRoleRequestData {
  id?: number
  name: string
  label: string
  status?: boolean
}

export interface RoleRequestData {
  currentPage: number
  size: number
  name?: string
  label?: string
  status?: boolean | ""
}

export type RoleResponseData = ApiResponseData<{
  list: RoleData[]
  total: number
}>
