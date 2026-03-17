import type * as Dept from "./type"
import { request } from "@/http/axios"

export function getDepartmentListApi(params: Dept.DeptRequestData) {
  return request<ApiResponseData<Dept.DeptData[]>>({
    url: "departments",
    method: "get",
    params
  })
}

export function getAllDepartmentsApi() {
  return request<ApiResponseData<Dept.DeptSimple[]>>({
    url: "departments/all",
    method: "get"
  })
}

export function createDepartmentApi(data: Dept.CreateOrUpdateDeptRequestData) {
  return request({
    url: "departments",
    method: "post",
    data
  })
}

export function updateDepartmentApi(data: Dept.CreateOrUpdateDeptRequestData) {
  return request({
    url: "departments",
    method: "put",
    data
  })
}

export function deleteDepartmentApi(id: number) {
  return request({
    url: `departments/${id}`,
    method: "delete"
  })
}
