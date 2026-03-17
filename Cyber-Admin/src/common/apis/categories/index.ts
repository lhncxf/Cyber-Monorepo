import type * as Category from "./type"
import { request } from "@/http/axios"

export function getCategoryTreeApi(params?: Category.CategoryRequestData) {
  return request<ApiResponseData<Category.CategoryData[]>>({
    url: "categories",
    method: "get",
    params
  })
}

export function getAllCategoriesApi() {
  return request<ApiResponseData<Category.CategorySimple[]>>({
    url: "categories/all",
    method: "get"
  })
}

export function createCategoryApi(data: Category.CreateOrUpdateCategoryData) {
  return request({
    url: "categories",
    method: "post",
    data
  })
}

export function updateCategoryApi(data: Category.CreateOrUpdateCategoryData) {
  return request({
    url: "categories",
    method: "put",
    data
  })
}

export function deleteCategoryApi(id: number) {
  return request({
    url: `categories/${id}`,
    method: "delete"
  })
}
