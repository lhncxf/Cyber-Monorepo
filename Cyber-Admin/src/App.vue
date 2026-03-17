<script lang="ts" setup>
import { useGreyAndColorWeakness } from "@@/composables/useGreyAndColorWeakness"
import { useTheme } from "@@/composables/useTheme"
import { useTitle } from "@@/composables/useTitle"
import elEn from "element-plus/es/locale/lang/en"
import elZhCn from "element-plus/es/locale/lang/zh-cn"
import { useLocaleStore } from "@/pinia/stores/locale"

const { initTheme } = useTheme()
const { initGreyAndColorWeakness } = useGreyAndColorWeakness()
const { setTitle } = useTitle()
const localeStore = useLocaleStore()
const elLocaleMap = { "zh-CN": elZhCn, "en": elEn }
const elLocale = computed(() => elLocaleMap[localeStore.locale] ?? elZhCn)

initTheme()
initGreyAndColorWeakness()

const route = useRoute()

watch(() => localeStore.locale, () => {
  setTitle(route.meta.title as string | undefined)
})
</script>

<template>
  <el-config-provider :locale="elLocale">
    <router-view />
  </el-config-provider>
</template>
