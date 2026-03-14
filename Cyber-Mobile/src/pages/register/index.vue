<script lang="ts" setup>
import { register } from '@/api/mobile/auth'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useMobileUserStore } from '@/store/mobileUser'

defineOptions({ name: 'Register' })

const { t } = useI18n()
usePageTitle('page.register')

definePage({
  style: { navigationBarTitleText: '注册' },
})

const mobileUserStore = useMobileUserStore()
const form = ref({ phone: '', password: '', nickname: '' })
const loading = ref(false)

async function handleRegister() {
  if (!form.value.phone || !form.value.password) {
    uni.showToast({ title: t('register.fillPhoneAndPassword'), icon: 'none' })
    return
  }
  if (form.value.phone.length !== 11) {
    uni.showToast({ title: t('register.invalidPhone'), icon: 'none' })
    return
  }
  loading.value = true
  try {
    const res = await register(form.value)
    mobileUserStore.setToken(res.token)
    mobileUserStore.setUserInfo(res.user)
    uni.showToast({ title: t('register.registerSuccess'), icon: 'success' })
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

function toLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}
</script>

<template>
  <view class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-8">
    <view class="mb-10 text-center">
      <view class="text-3xl text-gray-800 font-bold">
        {{ t('register.createAccount') }}
      </view>
      <view class="mt-2 text-sm text-gray-500">
        {{ t('register.startShopping') }}
      </view>
    </view>

    <view class="w-full rounded-2xl bg-white p-6 shadow-sm">
      <view class="mb-4">
        <view class="mb-1 text-sm text-gray-600">
          {{ t('register.phone') }}
        </view>
        <input
          v-model="form.phone"
          type="number"
          :placeholder="t('register.phonePlaceholder')"
          class="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800"
          :maxlength="11"
        >
      </view>

      <view class="mb-4">
        <view class="mb-1 text-sm text-gray-600">
          {{ t('register.nickname') }}
        </view>
        <input
          v-model="form.nickname"
          type="text"
          :placeholder="t('register.nicknamePlaceholder')"
          class="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800"
        >
      </view>

      <view class="mb-6">
        <view class="mb-1 text-sm text-gray-600">
          {{ t('register.password') }}
        </view>
        <input
          v-model="form.password"
          type="safe-password"
          :placeholder="t('register.passwordPlaceholder')"
          class="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800"
        >
      </view>

      <button
        class="w-full rounded-lg bg-green-600 py-3 text-base text-white font-medium"
        :disabled="loading"
        @tap="handleRegister"
      >
        {{ loading ? t('register.registering') : t('register.registerBtn') }}
      </button>

      <view class="mt-4 text-center text-sm text-gray-500">
        {{ t('register.hasAccount') }}
        <text class="text-green-600" @tap="toLogin">
          {{ t('register.loginNow') }}
        </text>
      </view>
    </view>
  </view>
</template>
