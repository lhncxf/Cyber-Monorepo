import type * as Menu from "./type"
import { request } from "@/http/axios"

export function createMenuApi(data: Menu.CreateOrUpdateMenuRequestData) {
  return request({
    url: "menus",
    method: "post",
    data
  })
}

export function deleteMenuApi(id: number) {
  return request({
    url: `menus/${id}`,
    method: "delete"
  })
}

export function updateMenuApi(data: Menu.CreateOrUpdateMenuRequestData) {
  return request({
    url: "menus",
    method: "put",
    data
  })
}

export function getMenuListApi(params: Menu.MenuRequestData) {
  return request<Menu.MenuResponseData>({
    url: "menus",
    method: "get",
    params
  })
}

export function getUserMenusApi() {
  return request<Menu.MenuResponseData>({
    url: "menus/user",
    method: "get"
  })
}
