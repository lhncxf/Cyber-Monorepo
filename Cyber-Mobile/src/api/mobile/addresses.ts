import type { ICreateAddressForm, IShippingAddress, IUpdateAddressForm } from './types'
import { http } from '@/http/http'
import { getMobileAuthHeader } from './products'

export function getAddresses() {
  return http.get<IShippingAddress[]>('/mobile/addresses', undefined, getMobileAuthHeader())
}

export function createAddress(data: ICreateAddressForm) {
  return http.post<IShippingAddress>('/mobile/addresses', data, undefined, getMobileAuthHeader())
}

export function updateAddress(data: IUpdateAddressForm) {
  return http.put<IShippingAddress>(`/mobile/addresses/${data.id}`, data, undefined, getMobileAuthHeader())
}

export function deleteAddress(id: number) {
  return http.delete<void>(`/mobile/addresses/${id}`, undefined, getMobileAuthHeader())
}

export function setDefaultAddress(id: number) {
  return http.put<IShippingAddress>(`/mobile/addresses/${id}/default`, undefined, undefined, getMobileAuthHeader())
}

export function checkFreight(freightTemplateId: number, province: string, totalAmount: number) {
  return http.get<{ deliverable: boolean, shippingCost: number, freeShipping: boolean }>(
    `/freight-templates/${freightTemplateId}/check`,
    { province, totalAmount },
  )
}
