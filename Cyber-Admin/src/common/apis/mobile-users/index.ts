import type * as MobileUser from "./type"
import { request } from "@/http/axios"

export function getMobileUserListApi(params: MobileUser.MobileUserRequestData) {
  return request<MobileUser.MobileUserResponseData>({
    url: "mobile-users",
    method: "get",
    params
  })
}

export function createMobileUserApi(data: MobileUser.CreateMobileUserRequestData) {
  return request({
    url: "mobile-users",
    method: "post",
    data
  })
}

export function updateMobileUserApi(data: MobileUser.UpdateMobileUserRequestData) {
  return request({
    url: "mobile-users",
    method: "put",
    data
  })
}

export function deleteMobileUserApi(id: number) {
  return request({
    url: `mobile-users/${id}`,
    method: "delete"
  })
}

export function resetMobileUserPasswordApi(id: number, password: string) {
  return request({
    url: `mobile-users/${id}/reset-password`,
    method: "put",
    data: { password }
  })
}

export function getMobileUserAddressesApi(userId: number) {
  return request<ApiResponseData<MobileUser.ShippingAddressAdminData[]>>({
    url: `mobile-users/${userId}/addresses`,
    method: "get"
  })
}
