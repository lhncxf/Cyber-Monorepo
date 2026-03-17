<script lang="ts" setup>
import { login } from '@/api/mobile/auth'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useMobileUserStore } from '@/store/mobileUser'

defineOptions({ name: 'Login' })

const { t } = useI18n()
usePageTitle('page.login')

definePage({
  style: {},
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
  <view class="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[var(--brand-bg)] px-8">
    <view class="absolute h-96 w-96 rounded-full bg-[var(--brand-border)] opacity-50 blur-3xl -right-40 -top-40" />

    <view class="relative z-10 mb-12">
      <view class="mb-2 text-4xl text-[var(--brand-text-primary)] font-bold tracking-tight">
        {{ t('login.welcomeBack') }}
      </view>
      <view class="text-sm text-[var(--brand-text-secondary)] tracking-wide">
        {{ t('login.loginToAccount') }}
      </view>
    </view>

    <view class="relative z-10 w-full">
      <view class="mb-6">
        <view class="mb-2 text-xs text-[var(--brand-text-secondary)] font-medium tracking-wider uppercase">
          {{ t('login.phone') }}
        </view>
        <input
          v-model="form.phone"
          type="number"
          :placeholder="t('login.phonePlaceholder')"
          class="box-border h-12 w-full border-b-2 border-[var(--brand-border)] bg-transparent text-lg text-[var(--brand-text-primary)] leading-tight transition-all focus:border-[var(--brand-primary)] placeholder-gray-300"
          :maxlength="11"
        >
      </view>

      <view class="mb-10">
        <view class="mb-2 text-xs text-[var(--brand-text-secondary)] font-medium tracking-wider uppercase">
          {{ t('login.password') }}
        </view>
        <input
          v-model="form.password"
          type="safe-password"
          :placeholder="t('login.passwordPlaceholder')"
          class="box-border h-12 w-full border-b-2 border-[var(--brand-border)] bg-transparent text-lg text-[var(--brand-text-primary)] leading-tight transition-all focus:border-[var(--brand-primary)] placeholder-gray-300"
        >
      </view>

      <button
        class="w-full rounded-2xl bg-[var(--brand-primary)] py-4 text-base text-[var(--brand-surface)] font-medium shadow-lg transition-opacity hover:opacity-90"
        :disabled="loading"
        @tap="handleLogin"
      >
        {{ loading ? t('login.loggingIn') : t('login.loginBtn') }}
      </button>

      <view class="mt-8 text-center text-sm text-[var(--brand-text-secondary)]">
        {{ t('login.noAccount') }}
        <text class="ml-1 text-[var(--brand-primary)] font-semibold underline underline-offset-4" @tap="toRegister">
          {{ t('login.registerNow') }}
        </text>
      </view>
    </view>
  </view>
</template>
