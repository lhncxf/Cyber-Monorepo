import type { IMobileAuthRes, IMobileLoginForm, IMobileRegisterForm, IMobileUser } from './types'
import { http } from '@/http/http'

export function register(data: IMobileRegisterForm) {
  return http.post<IMobileAuthRes>('/mobile/auth/register', data)
}

export function login(data: IMobileLoginForm) {
  return http.post<IMobileAuthRes>('/mobile/auth/login', data)
}

export function getMe() {
  return http.get<IMobileUser>('/mobile/auth/me')
}
