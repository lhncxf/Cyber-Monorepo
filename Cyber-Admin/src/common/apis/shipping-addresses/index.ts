import { request } from "@/http/axios"

export interface ShippingAddressData {
  id: number
  userId: number
  name: string
  phone: string
  province: string
  city: string
  district?: string
  detail: string
  isDefault: boolean
  createTime: string
}

export function getUserAddressesApi(userId: number) {
  return request<ApiResponseData<ShippingAddressData[]>>({
    url: `mobile/users/${userId}/addresses`,
    method: "get"
  })
}
