<script lang="ts" setup>
import type { ProTableColumn, ProTableEnumItem } from "./type"
import { ArrowDown, ArrowUp, Refresh, Search } from "@element-plus/icons-vue"

interface Props {
  columns: ProTableColumn[]
  enumMap: Map<string, ProTableEnumItem[]>
}

const { columns, enumMap } = defineProps<Props>()

const emit = defineEmits<{
  search: []
  reset: []
}>()

const { t } = useI18n()

// 搜索参数由列配置动态决定类型，需兼容 Element Plus 各组件 v-model
const searchParam = defineModel<Record<string, any>>("searchParam", { required: true })

const collapsed = ref(true)
const maxVisibleItems = 3

const searchColumns = computed(() => {
  return columns
    .filter(col => col.search?.el)
    .sort((a, b) => (a.search?.order ?? 0) - (b.search?.order ?? 0))
})

const showCollapse = computed(() => searchColumns.value.length > maxVisibleItems)

const visibleColumns = computed(() => {
  if (!showCollapse.value || !collapsed.value) return searchColumns.value
  return searchColumns.value.slice(0, maxVisibleItems)
})

function getFieldKey(col: ProTableColumn): string {
  return col.search?.key || col.field || ""
}

function getLabel(col: ProTableColumn): string {
  return col.search?.label || (col.title as string) || ""
}

function getEnumOptions(col: ProTableColumn): ProTableEnumItem[] {
  if (!col.field) return []
  return enumMap.get(col.field) ?? []
}

function getSpan(col: ProTableColumn): number {
  return col.search?.span ?? 6
}

function handleSearch() {
  emit("search")
}

function handleReset() {
  emit("reset")
}
</script>

<template>
  <el-card shadow="never" class="search-card">
    <el-form :inline="false" :model="searchParam" @submit.prevent="handleSearch">
      <el-row :gutter="20">
        <el-col v-for="col in visibleColumns" :key="getFieldKey(col)" :span="getSpan(col)">
          <el-form-item :label="getLabel(col)" :prop="getFieldKey(col)">
            <template v-if="col.search?.render">
              <component :is="col.search.render({ searchParam: searchParam! })" />
            </template>
            <el-input
              v-else-if="col.search?.el === 'input'"
              v-model="searchParam![getFieldKey(col)]"
              :placeholder="t('common.placeholder')"
              clearable
              v-bind="col.search?.props"
            />
            <el-input-number
              v-else-if="col.search?.el === 'input-number'"
              v-model="searchParam![getFieldKey(col)]"
              :controls="false"
              :placeholder="t('common.placeholder')"
              v-bind="col.search?.props"
            />
            <el-select
              v-else-if="col.search?.el === 'select'"
              v-model="searchParam![getFieldKey(col)]"
              :placeholder="t('common.selectPlaceholder')"
              clearable
              v-bind="col.search?.props"
            >
              <el-option
                v-for="item in getEnumOptions(col)"
                :key="String(item.value)"
                :label="item.label"
                :value="item.value"
                :disabled="item.disabled"
              />
            </el-select>
            <el-date-picker
              v-else-if="col.search?.el === 'date-picker'"
              v-model="searchParam![getFieldKey(col)]"
              :placeholder="t('common.selectPlaceholder')"
              clearable
              v-bind="col.search?.props"
            />
            <el-time-picker
              v-else-if="col.search?.el === 'time-picker'"
              v-model="searchParam![getFieldKey(col)]"
              :placeholder="t('common.selectPlaceholder')"
              clearable
              v-bind="col.search?.props"
            />
            <el-time-select
              v-else-if="col.search?.el === 'time-select'"
              v-model="searchParam![getFieldKey(col)]"
              :placeholder="t('common.selectPlaceholder')"
              clearable
              v-bind="col.search?.props"
            />
            <el-tree-select
              v-else-if="col.search?.el === 'tree-select'"
              v-model="searchParam![getFieldKey(col)]"
              :placeholder="t('common.selectPlaceholder')"
              clearable
              v-bind="col.search?.props"
              :data="getEnumOptions(col)"
            />
            <el-cascader
              v-else-if="col.search?.el === 'cascader'"
              v-model="searchParam![getFieldKey(col)]"
              :placeholder="t('common.selectPlaceholder')"
              clearable
              v-bind="col.search?.props"
              :options="(getEnumOptions(col) as unknown as import('element-plus').CascaderOption[])"
            />
            <el-switch
              v-else-if="col.search?.el === 'switch'"
              v-model="searchParam![getFieldKey(col)]"
              v-bind="col.search?.props"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6" class="search-actions">
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">
              {{ t("common.search") }}
            </el-button>
            <el-button :icon="Refresh" @click="handleReset">
              {{ t("common.reset") }}
            </el-button>
            <el-button v-if="showCollapse" link type="primary" @click="collapsed = !collapsed">
              {{ collapsed ? t("common.expand") : t("common.collapse") }}
              <el-icon class="collapse-icon">
                <component :is="collapsed ? ArrowDown : ArrowUp" />
              </el-icon>
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </el-card>
</template>

<style lang="scss" scoped>
.search-card {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.search-actions {
  display: flex;
  justify-content: flex-end;
}

.collapse-icon {
  margin-left: 4px;
  transition: transform 0.3s;
}
</style>
