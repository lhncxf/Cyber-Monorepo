import type { CustomRequestOptions, IResponse } from '@/http/types'
import { useMobileUserStore } from '@/store/mobileUser'
import { toLoginPage } from '@/utils/toLoginPage'
import { ResultEnum } from './tools/enum'

export function http<T>(options: CustomRequestOptions) {
  return new Promise<T>((resolve, reject) => {
    uni.request({
      ...options,
      dataType: 'json',
      // #ifndef MP-WEIXIN
      responseType: 'json',
      // #endif
      success(res) {
        const responseData = res.data as IResponse<T>
        const { code } = responseData

        if (res.statusCode === 401 || code === 401) {
          const mobileUserStore = useMobileUserStore()
          mobileUserStore.logout()
          toLoginPage()
          return reject(res)
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (code !== ResultEnum.Success0 && code !== ResultEnum.Success200) {
            uni.showToast({
              icon: 'none',
              title: responseData.msg || responseData.message || '请求错误',
            })
            return reject(responseData.data)
          }
          return resolve(responseData.data)
        }

        if (!options.hideErrorToast) {
          uni.showToast({
            icon: 'none',
            title: (res.data as any).msg || '请求错误',
          })
        }
        reject(res)
      },
      fail(err) {
        uni.showToast({
          icon: 'none',
          title: '网络错误，换个网络试试',
        })
        reject(err)
      },
    })
  })
}

export function httpGet<T>(url: string, query?: Record<string, any>, header?: Record<string, any>, options?: Partial<CustomRequestOptions>) {
  return http<T>({ url, query, method: 'GET', header, ...options })
}

export function httpPost<T>(url: string, data?: Record<string, any>, query?: Record<string, any>, header?: Record<string, any>, options?: Partial<CustomRequestOptions>) {
  return http<T>({ url, query, data, method: 'POST', header, ...options })
}

export function httpPut<T>(url: string, data?: Record<string, any>, query?: Record<string, any>, header?: Record<string, any>, options?: Partial<CustomRequestOptions>) {
  return http<T>({ url, data, query, method: 'PUT', header, ...options })
}

export function httpDelete<T>(url: string, query?: Record<string, any>, header?: Record<string, any>, options?: Partial<CustomRequestOptions>) {
  return http<T>({ url, query, method: 'DELETE', header, ...options })
}

http.get = httpGet
http.post = httpPost
http.put = httpPut
http.delete = httpDelete

http.Get = httpGet
http.Post = httpPost
http.Put = httpPut
http.Delete = httpDelete
