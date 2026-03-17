export interface MobileUserData {
  id: number
  phone: string
  nickname: string
  avatar: string
  status: boolean
  createTime: string
}

export interface CreateMobileUserRequestData {
  phone: string
  password: string
  nickname?: string
}

export interface UpdateMobileUserRequestData {
  id: number
  nickname?: string
  status?: boolean
  avatar?: string
}

export interface MobileUserRequestData {
  currentPage: number
  size: number
  phone?: string
  nickname?: string
  status?: boolean | ""
}

export type MobileUserResponseData = ApiResponseData<{
  list: MobileUserData[]
  total: number
}>

export interface ShippingAddressAdminData {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string | null
  detail: string
  isDefault: boolean
  createTime: string
}
