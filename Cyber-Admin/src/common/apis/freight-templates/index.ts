import type * as FreightTemplate from "./type"
import { request } from "@/http/axios"

export function getFreightTemplateListApi(params: FreightTemplate.FreightTemplateRequestData) {
  return request<FreightTemplate.FreightTemplateResponseData>({
    url: "freight-templates",
    method: "get",
    params
  })
}

export function getAllFreightTemplatesApi() {
  return request<ApiResponseData<FreightTemplate.FreightTemplateSimple[]>>({
    url: "freight-templates/all",
    method: "get"
  })
}

export function createFreightTemplateApi(data: FreightTemplate.CreateOrUpdateFreightTemplateData) {
  return request({
    url: "freight-templates",
    method: "post",
    data
  })
}

export function updateFreightTemplateApi(data: FreightTemplate.CreateOrUpdateFreightTemplateData) {
  return request({
    url: "freight-templates",
    method: "put",
    data
  })
}

export function deleteFreightTemplateApi(id: number) {
  return request({
    url: `freight-templates/${id}`,
    method: "delete"
  })
}
