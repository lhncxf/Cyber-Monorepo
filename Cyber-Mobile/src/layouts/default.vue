<script lang="ts" setup>
import { useThemeStore } from '@/store/theme'

const themeStore = useThemeStore()
</script>

<template>
  <view :style="themeStore.themeStyle" class="min-h-screen">
    <slot />
  </view>
</template>
