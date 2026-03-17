import type * as Role from "./type"
import { request } from "@/http/axios"

export function getRoleListApi(params: Role.RoleRequestData) {
  return request<Role.RoleResponseData>({
    url: "roles",
    method: "get",
    params
  })
}

export function getAllRolesApi() {
  return request<ApiResponseData<Role.RoleSimple[]>>({
    url: "roles/all",
    method: "get"
  })
}

export function createRoleApi(data: Role.CreateOrUpdateRoleRequestData) {
  return request({
    url: "roles",
    method: "post",
    data
  })
}

export function updateRoleApi(data: Role.CreateOrUpdateRoleRequestData) {
  return request({
    url: "roles",
    method: "put",
    data
  })
}

export function deleteRoleApi(id: number) {
  return request({
    url: `roles/${id}`,
    method: "delete"
  })
}
