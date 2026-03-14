<script lang="ts" setup>
import { CircleClose, Search } from "@element-plus/icons-vue"
import { ALL_ICONS, ICON_CATEGORIES } from "./icons-data"

interface Props {
  modelValue: string | undefined
}

const props = defineProps<Props>()
const emit = defineEmits<{
  "update:modelValue": [value: string]
}>()

const { t } = useI18n()

const dialogVisible = ref(false)
const searchKeyword = ref("")
const activeCategory = ref("")

const allLabel = computed(() => t("iconPicker.all"))

watchEffect(() => {
  if (!activeCategory.value) {
    activeCategory.value = allLabel.value
  }
})

const categories = computed(() => [allLabel.value, ...ICON_CATEGORIES.map(c => c.label)])

const filteredIcons = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  let icons: string[]

  if (activeCategory.value === allLabel.value) {
    icons = ALL_ICONS
  } else {
    const category = ICON_CATEGORIES.find(c => c.label === activeCategory.value)
    icons = category ? category.icons : []
  }

  if (!keyword) return icons
  return icons.filter(icon => icon.toLowerCase().includes(keyword))
})

function openDialog() {
  dialogVisible.value = true
}

function selectIcon(icon: string) {
  emit("update:modelValue", icon)
  dialogVisible.value = false
}

function clearIcon() {
  emit("update:modelValue", "")
}
</script>

<template>
  <div class="icon-picker">
    <div class="icon-picker__trigger" @click="openDialog">
      <AppIcon v-if="props.modelValue" :icon="props.modelValue" class="icon-picker__preview" />
      <span v-else class="icon-picker__placeholder">{{ t("iconPicker.placeholder") }}</span>
      <el-icon class="icon-picker__arrow">
        <ArrowDown />
      </el-icon>
    </div>
    <el-button
      v-if="props.modelValue"
      class="icon-picker__clear"
      :icon="CircleClose"
      circle
      size="small"
      text
      @click.stop="clearIcon"
    />

    <el-dialog
      v-model="dialogVisible"
      :title="t('iconPicker.dialogTitle')"
      width="780px"
      top="8vh"
      draggable
      append-to-body
    >
      <div class="icon-picker__search">
        <el-input
          v-model="searchKeyword"
          :placeholder="t('iconPicker.searchPlaceholder')"
          clearable
          :prefix-icon="Search"
        />
      </div>

      <el-tabs v-model="activeCategory" class="icon-picker__tabs">
        <el-tab-pane v-for="cat in categories" :key="cat" :label="cat" :name="cat" />
      </el-tabs>

      <div v-if="filteredIcons.length > 0" class="icon-picker__grid">
        <div
          v-for="icon in filteredIcons"
          :key="icon"
          class="icon-picker__item"
          :class="{ 'is-active': icon === props.modelValue }"
          :title="icon"
          @click="selectIcon(icon)"
        >
          <AppIcon :icon="icon" class="icon-picker__item-icon" />
          <span class="icon-picker__item-name">{{ icon.split(":").pop() }}</span>
        </div>
      </div>
      <el-empty v-else :description="t('iconPicker.empty')" :image-size="80" />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.icon-picker {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &__trigger {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    height: 32px;
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
    cursor: pointer;
    background: var(--el-fill-color-blank);
    transition: border-color 0.2s;
    min-width: 140px;

    &:hover {
      border-color: var(--el-color-primary);
    }
  }

  &__preview {
    font-size: 18px;
    color: var(--el-text-color-regular);
  }

  &__placeholder {
    font-size: 14px;
    color: var(--el-text-color-placeholder);
    flex: 1;
  }

  &__arrow {
    color: var(--el-text-color-placeholder);
    margin-left: auto;
  }

  &__clear {
    flex-shrink: 0;
  }

  &__search {
    margin-bottom: 12px;
  }

  &__tabs {
    margin-bottom: 8px;

    :deep(.el-tabs__header) {
      margin-bottom: 12px;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
    gap: 4px;
    max-height: 400px;
    overflow-y: auto;
    padding: 4px;
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 8px 4px;
    border-radius: 6px;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;

    &:hover {
      background: var(--el-fill-color-light);
      color: var(--el-color-primary);
    }

    &.is-active {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      outline: 1.5px solid var(--el-color-primary-light-5);
    }
  }

  &__item-icon {
    font-size: 22px;
  }

  &__item-name {
    font-size: 11px;
    color: inherit;
    max-width: 64px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
  }
}
</style>
