<script lang="ts" setup>
import type { LocaleType } from '@/store/locale'
import type { ThemeName } from '@/store/theme'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useLocaleStore } from '@/store/locale'
import { useMobileUserStore } from '@/store/mobileUser'
import { useThemeStore } from '@/store/theme'

defineOptions({ name: 'Me' })

const { t } = useI18n()
usePageTitle('page.me')

definePage({
  style: {},
})

const mobileUserStore = useMobileUserStore()
const localeStore = useLocaleStore()
const themeStore = useThemeStore()

const themeList: { key: ThemeName, labelKey: string }[] = [
  { key: 'light', labelKey: 'themeSwitch.light' },
  { key: 'dark', labelKey: 'themeSwitch.dark' },
  { key: 'classic', labelKey: 'themeSwitch.classic' },
]

function toLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}

function toOrders() {
  if (!mobileUserStore.isLoggedIn) {
    toLogin()
    return
  }
  uni.navigateTo({ url: '/pages/order/list' })
}

function toAddresses() {
  if (!mobileUserStore.isLoggedIn) {
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

function cycleTheme() {
  const keys: ThemeName[] = ['light', 'dark', 'classic']
  const idx = keys.indexOf(themeStore.theme)
  themeStore.setTheme(keys[(idx + 1) % keys.length])
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
  <NavBar :title="t('page.me')" :show-back="false" />

  <view class="min-h-screen bg-[var(--brand-bg)] pb-safe">
    <!-- Profile header -->
    <view class="mx-4 mb-4 mt-4 overflow-hidden border border-[var(--brand-border)] rounded-2xl bg-[var(--brand-surface)] shadow-sm">
      <!-- 已登录 -->
      <view v-if="mobileUserStore.isLoggedIn" class="flex items-center gap-4 px-5 py-6">
        <image
          :src="mobileUserStore.userInfo.avatar || '/static/images/default-avatar.png'"
          mode="aspectFill"
          class="h-16 w-16 flex-shrink-0 rounded-full bg-[var(--brand-bg)]"
        />
        <view class="flex-1 overflow-hidden">
          <view class="truncate text-lg text-[var(--brand-text-primary)] font-bold tracking-tight">
            {{ mobileUserStore.userInfo.nickname || mobileUserStore.userInfo.phone }}
          </view>
          <view class="mt-0.5 text-sm text-[var(--brand-text-muted)]">
            {{ mobileUserStore.userInfo.phone }}
          </view>
        </view>
      </view>

      <!-- 未登录 -->
      <view v-else class="flex items-center gap-4 px-5 py-6" @tap="toLogin">
        <view class="h-16 w-16 flex flex-shrink-0 items-center justify-center rounded-full bg-[var(--brand-bg)] text-3xl">
          👤
        </view>
        <view class="flex-1">
          <view class="text-lg text-[var(--brand-text-primary)] font-bold tracking-tight">
            {{ t('me.clickToLogin') }}
          </view>
          <view class="mt-0.5 text-sm text-[var(--brand-text-muted)]">
            {{ t('me.loginForMore') }}
          </view>
        </view>
        <view class="i-carbon-chevron-right text-xl text-[var(--brand-text-muted)]" />
      </view>
    </view>

    <!-- Menu card -->
    <view class="mx-4 mb-4 overflow-hidden border border-[var(--brand-border)] rounded-2xl bg-[var(--brand-surface)] shadow-sm">
      <view
        class="flex items-center justify-between border-b border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-4 active:bg-[var(--brand-border)]"
        @click="toOrders"
      >
        <view class="flex items-center gap-3">
          <view class="h-8 w-8 flex items-center justify-center rounded-xl bg-[var(--brand-border)] text-base">
            📦
          </view>
          <view class="text-sm text-[var(--brand-text-primary)] font-medium">
            {{ t('me.myOrders') }}
          </view>
        </view>
        <view class="i-carbon-chevron-right text-lg text-[var(--brand-text-muted)]" />
      </view>

      <view
        class="flex items-center justify-between border-b border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-4 active:bg-[var(--brand-border)]"
        @click="toAddresses"
      >
        <view class="flex items-center gap-3">
          <view class="h-8 w-8 flex items-center justify-center rounded-xl bg-[var(--brand-border)] text-base">
            📍
          </view>
          <view class="text-sm text-[var(--brand-text-primary)] font-medium">
            {{ t('me.myAddresses') }}
          </view>
        </view>
        <view class="i-carbon-chevron-right text-lg text-[var(--brand-text-muted)]" />
      </view>

      <view
        class="flex items-center justify-between border-b border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-4 active:bg-[var(--brand-border)]"
        @click="toggleLocale"
      >
        <view class="flex items-center gap-3">
          <view class="h-8 w-8 flex items-center justify-center rounded-xl bg-[var(--brand-border)] text-base">
            🌐
          </view>
          <view class="text-sm text-[var(--brand-text-primary)] font-medium">
            {{ t('me.language') }}
          </view>
        </view>
        <view class="flex items-center gap-1.5">
          <text class="text-sm text-[var(--brand-text-muted)]">{{ { 'zh-CN': '简体中文', 'en': 'English' }[localeStore.locale] }}</text>
          <view class="i-carbon-chevron-right text-lg text-[var(--brand-text-muted)]" />
        </view>
      </view>

      <view
        class="flex items-center justify-between bg-[var(--brand-surface)] px-5 py-4 active:bg-[var(--brand-border)]"
        @click="cycleTheme"
      >
        <view class="flex items-center gap-3">
          <view class="h-8 w-8 flex items-center justify-center rounded-xl bg-[var(--brand-border)] text-base">
            🎨
          </view>
          <view class="text-sm text-[var(--brand-text-primary)] font-medium">
            {{ t('me.theme') }}
          </view>
        </view>
        <view class="flex items-center gap-1.5">
          <text class="text-sm text-[var(--brand-text-muted)]">{{ t(themeList.find(x => x.key === themeStore.theme)!.labelKey) }}</text>
          <view class="i-carbon-chevron-right text-lg text-[var(--brand-text-muted)]" />
        </view>
      </view>
    </view>

    <!-- Logout -->
    <view v-if="mobileUserStore.isLoggedIn" class="mx-4">
      <button
        class="w-full border border-[var(--brand-border)] rounded-2xl bg-[var(--brand-surface)] py-4 text-sm text-[var(--brand-text-secondary)] font-medium shadow-sm active:bg-[var(--brand-bg)]"
        @tap="handleLogout"
      >
        {{ t('me.logout') }}
      </button>
    </view>
  </view>
</template>
