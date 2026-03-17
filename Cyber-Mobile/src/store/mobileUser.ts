import type { IMobileUser } from '@/api/mobile/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getMe } from '@/api/mobile/auth'

const initialUser: IMobileUser = {
  id: -1,
  phone: '',
  nickname: '',
  avatar: '/static/images/default-avatar.png',
}

export const useMobileUserStore = defineStore(
  'mobileUser',
  () => {
    const token = ref('')
    const userInfo = ref<IMobileUser>({ ...initialUser })

    const isLoggedIn = computed(() => !!token.value)

    const setToken = (val: string) => {
      token.value = val
    }

    const setUserInfo = (val: IMobileUser) => {
      userInfo.value = { ...val, avatar: val.avatar || initialUser.avatar }
    }

    const fetchUserInfo = async () => {
      const res = await getMe()
      setUserInfo(res)
      return res
    }

    const logout = () => {
      token.value = ''
      userInfo.value = { ...initialUser }
    }

    return {
      token,
      userInfo,
      isLoggedIn,
      setToken,
      setUserInfo,
      fetchUserInfo,
      logout,
    }
  },
  { persist: true },
)
