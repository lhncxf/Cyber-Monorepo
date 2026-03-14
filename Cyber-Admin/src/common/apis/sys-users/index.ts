import type * as SystemUser from "./type"
import { request } from "@/http/axios"

export function getSystemUserListApi(params: SystemUser.SystemUserRequestData) {
  return request<SystemUser.SystemUserResponseData>({
    url: "system/users",
    method: "get",
    params
  })
}

export function createSystemUserApi(data: SystemUser.CreateOrUpdateSystemUserRequestData) {
  return request({
    url: "system/users",
    method: "post",
    data
  })
}

export function updateSystemUserApi(data: SystemUser.CreateOrUpdateSystemUserRequestData) {
  return request({
    url: "system/users",
    method: "put",
    data
  })
}

export function deleteSystemUserApi(id: number) {
  return request({
    url: `system/users/${id}`,
    method: "delete"
  })
}

export function resetUserPasswordApi(id: number, password: string) {
  return request({
    url: `system/users/${id}/reset-password`,
    method: "put",
    data: { password }
  })
}
