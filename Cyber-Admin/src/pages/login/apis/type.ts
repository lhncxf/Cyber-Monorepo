export interface LoginRequestData {
  username: string
  password: string
  code: string
  captchaToken: string
}

export type CaptchaResponseData = ApiResponseData<{ svg: string, captchaToken: string }>

export type LoginResponseData = ApiResponseData<{ token: string }>
