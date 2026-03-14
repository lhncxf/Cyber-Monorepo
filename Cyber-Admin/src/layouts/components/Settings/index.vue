<script lang="ts" setup>
import { useLayoutMode } from "@@/composables/useLayoutMode"
import { removeLayoutsConfig } from "@@/utils/local-storage"
import { Refresh } from "@element-plus/icons-vue"
import { useSettingsStore } from "@/pinia/stores/settings"
import SelectLayoutMode from "./SelectLayoutMode.vue"

const { isLeft } = useLayoutMode()

const { t } = useI18n()

const settingsStore = useSettingsStore()

const {
  showTagsView,
  showLogo,
  fixedHeader,
  showFooter,
  showNotify,
  showThemeSwitch,
  showScreenfull,
  showSearchMenu,
  cacheTagsView,
  showWatermark,
  showGreyMode,
  showColorWeakness
} = storeToRefs(settingsStore)

const switchSettings = computed(() => [
  { key: "showTagsView", label: t("settings.showTagsView"), ref: showTagsView },
  { key: "showLogo", label: t("settings.showLogo"), ref: showLogo },
  { key: "fixedHeader", label: t("settings.fixedHeader"), ref: fixedHeader, disabled: !isLeft.value },
  { key: "showFooter", label: t("settings.showFooter"), ref: showFooter },
  { key: "showNotify", label: t("settings.showNotify"), ref: showNotify },
  { key: "showThemeSwitch", label: t("settings.showThemeSwitch"), ref: showThemeSwitch },
  { key: "showScreenfull", label: t("settings.showScreenfull"), ref: showScreenfull },
  { key: "showSearchMenu", label: t("settings.showSearchMenu"), ref: showSearchMenu },
  { key: "cacheTagsView", label: t("settings.cacheTagsView"), ref: cacheTagsView },
  { key: "showWatermark", label: t("settings.showWatermark"), ref: showWatermark },
  { key: "showGreyMode", label: t("settings.showGreyMode"), ref: showGreyMode },
  { key: "showColorWeakness", label: t("settings.showColorWeakness"), ref: showColorWeakness }
])

watchEffect(() => {
  !isLeft.value && (fixedHeader.value = true)
})

function resetLayoutsConfig() {
  removeLayoutsConfig()
  location.reload()
}
</script>

<template>
  <div class="setting-container">
    <h4>{{ t("settings.layoutConfig") }}</h4>
    <SelectLayoutMode />
    <el-divider />
    <h4>{{ t("settings.featureConfig") }}</h4>
    <div v-for="item in switchSettings" :key="item.key" class="setting-item">
      <span class="setting-name">{{ item.label }}</span>
      <el-switch v-model="item.ref.value" :disabled="item.disabled ?? false" />
    </div>
    <el-button type="danger" :icon="Refresh" @click="resetLayoutsConfig">
      {{ t("settings.resetBtn") }}
    </el-button>
  </div>
</template>

<style lang="scss" scoped>
@import "@@/assets/styles/mixins.scss";

.setting-container {
  padding: 20px;
  .setting-item {
    font-size: 14px;
    color: var(--el-text-color-regular);
    padding: 5px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .setting-name {
      @extend %ellipsis;
    }
  }
  .el-button {
    margin-top: 40px;
    width: 100%;
  }
}
</style>
