<script lang="ts" setup>
import { useThemeStore } from '@/store/theme'

defineOptions({ name: 'NavBar' })

const props = withDefaults(defineProps<{
  title?: string
  showBack?: boolean
  transparent?: boolean
}>(), {
  title: '',
  showBack: true,
  transparent: false,
})

const canGoBack = computed(() => props.showBack)
const isTransparent = computed(() => props.transparent)

const themeStore = useThemeStore()

function handleBack() {
  uni.navigateBack()
}

const menuButtonInfo = ref({ top: 0, height: 44 })
try {
  const info = uni.getMenuButtonBoundingClientRect?.()
  if (info && info.top > 0)
    menuButtonInfo.value = info
}
catch {}

const statusBarHeight = ref(0)
try {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight ?? 0
}
catch {}

const contentHeight = computed(() => menuButtonInfo.value.height + (menuButtonInfo.value.top - statusBarHeight.value) * 2)
const navBarHeight = computed(() => statusBarHeight.value + contentHeight.value)
</script>

<template>
  <view
    class="fixed left-0 right-0 top-0 z-40"
    :style="{
      height: `${navBarHeight}px`,
      background: isTransparent ? 'transparent' : themeStore.surfaceColor,
      borderBottom: isTransparent ? 'none' : `1px solid ${themeStore.borderColor}`,
    }"
  >
    <view :style="{ height: `${statusBarHeight}px` }" />
    <view
      class="relative flex items-center px-4"
      :style="{ height: `${contentHeight}px` }"
    >
      <view
        v-if="canGoBack"
        class="h-8 w-8 flex items-center justify-center"
        @click="handleBack"
      >
        <view
          class="text-xl"
          :class="isTransparent ? 'i-carbon-chevron-left text-white' : 'i-carbon-chevron-left'"
          :style="isTransparent ? {} : { color: themeStore.textPrimaryColor }"
        />
      </view>
      <view class="pointer-events-none absolute inset-x-0 flex items-center justify-center" :style="{ height: `${contentHeight}px` }">
        <text
          class="font-bold"
          :style="isTransparent ? { color: '#ffffff' } : { color: themeStore.textPrimaryColor, fontSize: '18px', letterSpacing: '0.5px' }"
        >
          {{ title }}
        </text>
      </view>
    </view>
  </view>
  <view v-if="!isTransparent" :style="{ height: `${navBarHeight}px`, background: themeStore.bgColor }" />
</template>
