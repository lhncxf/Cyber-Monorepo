export interface SystemUserData {
  id: number
  username: string
  email: string
  phone: string
  status: boolean
  deptId: number | null
  deptName: string
  roleIds: number[]
  roles: string[]
  createTime: string
}

export interface CreateOrUpdateSystemUserRequestData {
  id?: number
  username: string
  password?: string
  email?: string
  phone?: string
  status?: boolean
  deptId?: number | null
  roleIds?: number[]
}

export interface SystemUserRequestData {
  currentPage: number
  size: number
  username?: string
  phone?: string
  status?: boolean | ""
  deptId?: number
}

export type SystemUserResponseData = ApiResponseData<{
  list: SystemUserData[]
  total: number
}>
