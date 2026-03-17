<script setup lang="ts">
import type { CustomTabBarItem } from './types'
import { tabbarStore } from './store'

const props = defineProps<{
  item: CustomTabBarItem
  index: number
  isBulge?: boolean
}>()

const { t } = useI18n()

const tabbarLocaleKeys: Record<string, string> = {
  '/pages/index/index': 'tabbar.home',
  '/pages/cart/index': 'tabbar.cart',
  '/pages/me/me': 'tabbar.me',
}

function getTabbarText(item: CustomTabBarItem): string {
  const key = tabbarLocaleKeys[item.pagePath]
  return key ? t(key) : item.text
}

function getImageByIndex(index: number, item: CustomTabBarItem) {
  if (!item.iconActive) {
    return item.icon
  }
  return tabbarStore.curIdx === index ? item.iconActive : item.icon
}
</script>

<template>
  <view class="flex flex-col items-center justify-center">
    <template v-if="item.iconType === 'uiLib'">
      <!-- TODO: 以下内容请根据选择的UI库自行替换 -->
      <!-- 如：<wd-icon name="home" /> (https://wot-design-uni.cn/component/icon.html) -->
      <!-- 如：<uv-icon name="home" /> (https://www.uvui.cn/components/icon.html) -->
      <!-- 如：<sar-icon name="image" /> (https://sard.wzt.zone/sard-uniapp-docs/components/icon)(sar没有home图标^_^) -->
      <!-- <wd-icon :name="item.icon" size="20" /> -->
    </template>
    <template v-if="item.iconType === 'unocss' || item.iconType === 'iconfont'">
      <view :class="[item.icon, isBulge ? 'text-80px' : 'text-20px']" />
    </template>
    <template v-if="item.iconType === 'image'">
      <image :src="getImageByIndex(index, item)" mode="scaleToFill" :class="isBulge ? 'h-80px w-80px' : 'h-24px w-24px'" />
    </template>
    <view v-if="!isBulge" class="mt-2px text-12px">
      {{ getTabbarText(item) }}
    </view>
    <!-- 角标显示 -->
    <view v-if="item.badge">
      <template v-if="item.badge === 'dot'">
        <view class="absolute right-0 top-0 h-2 w-2 rounded-full bg-#f56c6c" />
      </template>
      <template v-else>
        <view class="absolute top-0 box-border h-5 min-w-5 center rounded-full bg-#f56c6c px-1 text-center text-xs text-white -right-3">
          {{ item.badge > 99 ? '99+' : item.badge }}
        </view>
      </template>
    </view>
  </view>
</template>
