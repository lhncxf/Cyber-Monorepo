<script lang="ts" setup>
import { login } from '@/api/mobile/auth'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useMobileUserStore } from '@/store/mobileUser'

defineOptions({ name: 'Login' })

const { t } = useI18n()
usePageTitle('page.login')

definePage({
  style: { navigationBarTitleText: '登录' },
})

const mobileUserStore = useMobileUserStore()
const form = ref({ phone: '', password: '' })
const loading = ref(false)

async function handleLogin() {
  if (!form.value.phone || !form.value.password) {
    uni.showToast({ title: t('login.fillPhoneAndPassword'), icon: 'none' })
    return
  }
  loading.value = true
  try {
    const res = await login(form.value)
    mobileUserStore.setToken(res.token)
    mobileUserStore.setUserInfo(res.user)
    uni.showToast({ title: t('login.loginSuccess'), icon: 'success' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 500)
  }
  catch {
    // http.ts already shows toast
  }
  finally {
    loading.value = false
  }
}

function toRegister() {
  uni.navigateTo({ url: '/pages/register/index' })
}
</script>

<template>
  <view class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-8">
    <view class="mb-10 text-center">
      <view class="text-3xl text-gray-800 font-bold">
        {{ t('login.welcomeBack') }}
      </view>
      <view class="mt-2 text-sm text-gray-500">
        {{ t('login.loginToAccount') }}
      </view>
    </view>

    <view class="w-full rounded-2xl bg-white p-6 shadow-sm">
      <view class="mb-4">
        <view class="mb-1 text-sm text-gray-600">
          {{ t('login.phone') }}
        </view>
        <input
          v-model="form.phone"
          type="number"
          :placeholder="t('login.phonePlaceholder')"
          class="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800"
          :maxlength="11"
        >
      </view>

      <view class="mb-6">
        <view class="mb-1 text-sm text-gray-600">
          {{ t('login.password') }}
        </view>
        <input
          v-model="form.password"
          type="safe-password"
          :placeholder="t('login.passwordPlaceholder')"
          class="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800"
        >
      </view>

      <button
        class="w-full rounded-lg bg-green-600 py-3 text-base text-white font-medium"
        :disabled="loading"
        @tap="handleLogin"
      >
        {{ loading ? t('login.loggingIn') : t('login.loginBtn') }}
      </button>

      <view class="mt-4 text-center text-sm text-gray-500">
        {{ t('login.noAccount') }}
        <text class="text-green-600" @tap="toRegister">
          {{ t('login.registerNow') }}
        </text>
      </view>
    </view>
  </view>
</template>
