<script lang="ts" setup>
import type { LocaleType } from '@/store/locale'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useLocaleStore } from '@/store/locale'
import { useMobileUserStore } from '@/store/mobileUser'

defineOptions({ name: 'Me' })

const { t } = useI18n()
usePageTitle('page.me')

definePage({
  style: {
    navigationBarTitleText: '我的',
  },
})

const mobileUserStore = useMobileUserStore()
const localeStore = useLocaleStore()

function toLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}

function toOrders() {
  if (!mobileUserStore.isLoggedIn()) {
    toLogin()
    return
  }
  uni.navigateTo({ url: '/pages/order/list' })
}

function toAddresses() {
  if (!mobileUserStore.isLoggedIn()) {
    toLogin()
    return
  }
  uni.navigateTo({ url: '/pages/me/address/index' })
}

function toggleLocale() {
  const locales: LocaleType[] = ['zh-CN', 'en']
  const idx = locales.indexOf(localeStore.locale)
  localeStore.setLocale(locales[(idx + 1) % locales.length])
}

function handleLogout() {
  uni.showModal({
    title: t('me.logoutConfirmTitle'),
    content: t('me.logoutConfirmContent'),
    success: (res) => {
      if (res.confirm) {
        mobileUserStore.logout()
        uni.showToast({ title: t('me.loggedOut'), icon: 'success' })
      }
    },
  })
}
</script>

<template>
  <view class="min-h-screen bg-gray-50 pb-safe">
    <view class="bg-green-600 px-4 pb-8 pt-safe">
      <view v-if="mobileUserStore.isLoggedIn()" class="flex items-center gap-4 pt-4">
        <image
          :src="mobileUserStore.userInfo.avatar || '/static/images/default-avatar.png'"
          mode="aspectFill"
          class="h-16 w-16 border-2 border-white rounded-full"
        />
        <view>
          <view class="text-lg text-white font-bold">
            {{ mobileUserStore.userInfo.nickname || mobileUserStore.userInfo.phone }}
          </view>
          <view class="text-sm text-green-100">
            {{ mobileUserStore.userInfo.phone }}
          </view>
        </view>
      </view>
      <view v-else class="flex items-center gap-4 pt-4" @tap="toLogin">
        <image
          src="/static/images/default-avatar.png"
          mode="aspectFill"
          class="h-16 w-16 border-2 border-white rounded-full"
        />
        <view>
          <view class="text-lg text-white font-bold">
            {{ t('me.clickToLogin') }}
          </view>
          <view class="text-sm text-green-100">
            {{ t('me.loginForMore') }}
          </view>
        </view>
      </view>
    </view>

    <view class="mx-3 overflow-hidden rounded-xl bg-white shadow-sm -mt-4">
      <view
        class="flex items-center justify-between border-b border-gray-100 px-4 py-4"
        @tap="toOrders"
      >
        <view class="flex items-center gap-3">
          <text class="text-xl">📦</text>
          <view class="text-sm text-gray-700">
            {{ t('me.myOrders') }}
          </view>
        </view>
        <text class="text-lg text-gray-300">›</text>
      </view>

      <view
        class="flex items-center justify-between border-b border-gray-100 px-4 py-4"
        @tap="toAddresses"
      >
        <view class="flex items-center gap-3">
          <text class="text-xl">📍</text>
          <view class="text-sm text-gray-700">
            {{ t('me.myAddresses') }}
          </view>
        </view>
        <text class="text-lg text-gray-300">›</text>
      </view>
      <view
        class="flex items-center justify-between px-4 py-4"
        @tap="toggleLocale"
      >
        <view class="flex items-center gap-3">
          <text class="text-xl">🌐</text>
          <view class="text-sm text-gray-700">
            {{ t('me.language') }}
          </view>
        </view>
        <text class="text-sm text-gray-400">{{ { 'zh-CN': '简体中文', 'en': 'English' }[localeStore.locale] }}</text>
      </view>
    </view>

    <view v-if="mobileUserStore.isLoggedIn()" class="mt-6 px-3">
      <button
        class="w-full border border-red-200 rounded-xl bg-white py-3 text-sm text-red-500"
        @tap="handleLogout"
      >
        {{ t('me.logout') }}
      </button>
    </view>
  </view>
</template>
