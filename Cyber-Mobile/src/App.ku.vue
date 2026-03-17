<script lang="ts" setup>
import { useThemeStore } from '@/store/theme'
import TabBar from '@/tabbar/index.vue'

const themeStore = useThemeStore()
</script>

<template>
  <view :style="themeStore.themeStyle">
    <KuRootView />
    <TabBar />
  </view>
</template>
