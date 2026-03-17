<script lang="ts" setup>
import type { VxeGridInstance, VxeGridProps, VxeTableDefines } from "vxe-table"
import type { ProTableColumn, ProTableExpose, ProTableProps } from "./type"
import { DCaret, RefreshRight, Setting } from "@element-plus/icons-vue"
import { useProTable } from "./composables/useProTable"
import SearchForm from "./SearchForm.vue"

defineOptions({
  name: "ProTable"
})

const { t } = useI18n()

const {
  columns,
  requestApi,
  requestAuto = true,
  data,
  initSearchParam = {},
  dataCallback,
  pagination = true,
  searchable = true,
  rowKey = "id",
  toolButton = true,
  gridProps = {}
} = defineProps<ProTableProps>()

const xGridRef = useTemplateRef<VxeGridInstance>("xGridRef")

const {
  tableData,
  loading,
  searchParam,
  total,
  currentPage,
  pageSize,
  enumMap,
  initSearch,
  loadEnums,
  findEnumItem,
  fetchData,
  handleSearch,
  handleReset,
  handleRefresh,
  handleCurrentChange,
  handleSizeChange
} = useProTable({
  columns,
  requestApi,
  data,
  initSearchParam,
  dataCallback,
  pagination
})

// 过滤出需要在表格中显示的列
const tableColumns = computed(() => {
  return filterTableColumns(columns)
})

function filterTableColumns(cols: ProTableColumn[]): VxeGridProps["columns"] {
  return cols
    .filter(col => !col.hideInTable)
    .map((col) => {
      const { search, enum: _enum, fieldNames, hideInTable, tag, children, ...vxeProps } = col
      const result: Record<string, unknown> = { ...vxeProps }
      if (children?.length) {
        result.children = filterTableColumns(children)
      }
      // 枚举列：自动设置 slots 来渲染 Tag
      if (_enum && tag && col.field && !col.slots?.default) {
        result.slots = { ...col.slots, default: `enum-${col.field}` }
      }
      // 操作列：固定右侧、最小宽度 140、禁用 overflow 省略和列宽拖拽
      if (col.field === "action" || col.slots?.default === "action") {
        result.fixed = "right"
        result.width = Math.max(typeof col.width === "number" ? col.width : 0, 140)
        result.showOverflow = false
        result.resizable = false
      }
      return result
    })
}

// 需要显示工具按钮
const showToolButton = computed(() => {
  if (typeof toolButton === "boolean") return toolButton
  return toolButton.length > 0
})

const showRefreshBtn = computed(() => {
  if (typeof toolButton === "boolean") return toolButton
  return toolButton.includes("refresh")
})

const showSettingBtn = computed(() => {
  if (typeof toolButton === "boolean") return toolButton
  return toolButton.includes("setting")
})

// 列设置：可控列（排除 action 列、序号列、复选列）
interface SettingColumn {
  field: string
  title: string
  visible: boolean
  colInfo: VxeTableDefines.ColumnInfo
}

const settingPopoverVisible = ref(false)
const settingColumns = ref<SettingColumn[]>([])

function initColumnSetting() {
  const grid = xGridRef.value
  if (!grid) return
  const cols = grid.getColumns()
  settingColumns.value = cols
    .filter(col => col.field && col.type !== "checkbox" && col.type !== "radio" && col.type !== "seq" && col.field !== "action")
    .map(col => ({
      field: col.field,
      title: String(col.title || col.field),
      visible: col.visible !== false,
      colInfo: col
    }))
}

function openColumnSetting() {
  if (!settingColumns.value.length) {
    initColumnSetting()
  }
}

// 全选状态
const allChecked = computed(() => settingColumns.value.every(item => item.visible))
const isIndeterminate = computed(() =>
  settingColumns.value.some(item => item.visible) && !allChecked.value
)

async function toggleAll(val: boolean) {
  const grid = xGridRef.value
  if (!grid) return
  for (const item of settingColumns.value) {
    item.visible = val
  }
  if (val) {
    await grid.showColumn(settingColumns.value.map(item => item.colInfo))
  } else {
    await grid.hideColumn(settingColumns.value.map(item => item.colInfo))
  }
  await grid.refreshColumn()
}

async function toggleColumnVisible(item: SettingColumn) {
  const grid = xGridRef.value
  if (!grid) return
  if (item.visible) {
    await grid.showColumn(item.colInfo)
  } else {
    await grid.hideColumn(item.colInfo)
  }
  await grid.refreshColumn()
}

// 表头拖拽结束：同步 settingColumns 顺序
function onColumnDragend(params: VxeTableDefines.ColumnDragendEventParams) {
  const { dragColumn, newColumn } = params
  if (!dragColumn || !newColumn || dragColumn.id === newColumn.id) return
  const fromIdx = settingColumns.value.findIndex(c => c.field === dragColumn.field)
  const toIdx = settingColumns.value.findIndex(c => c.field === newColumn.field)
  if (fromIdx === -1 || toIdx === -1) return
  const item = settingColumns.value.splice(fromIdx, 1)[0]
  settingColumns.value.splice(toIdx, 0, item)
}

// 列设置面板拖拽排序（原生 HTML5 drag）
const columnDragEnabled = computed(() => gridProps.columnConfig?.drag !== false)
const draggingIndex = ref<number | null>(null)
const dragoverIndex = ref<number | null>(null)

function onDragStart(index: number) {
  draggingIndex.value = index
}

function onDragOver(e: DragEvent, index: number) {
  e.preventDefault()
  dragoverIndex.value = index
}

function onDragLeave() {
  dragoverIndex.value = null
}

async function onDrop(targetIndex: number) {
  const fromIndex = draggingIndex.value
  draggingIndex.value = null
  dragoverIndex.value = null
  if (fromIndex === null || fromIndex === targetIndex) return

  const grid = xGridRef.value
  if (!grid) return

  // Capture fields before mutating the array
  const fromField = settingColumns.value[fromIndex].field
  const targetField = settingColumns.value[targetIndex].field

  // Update settingColumns order
  const item = settingColumns.value.splice(fromIndex, 1)[0]
  settingColumns.value.splice(targetIndex, 0, item)

  // Sync to vxe-grid using field strings (more stable than colInfo references)
  await grid.moveColumnTo(fromField, targetField, {
    dragPos: fromIndex > targetIndex ? "left" : "right"
  })
}

// 带 tag + enum 的列（需要生成动态 slot）
const enumTagColumns = computed(() => {
  return columns.filter(col => col.enum && col.tag && col.field && !col.slots?.default)
})

// 合并 gridProps（不包含 data，由 loadGridData/reloadGridData 主动注入）
const mergedGridProps = computed<VxeGridProps>(() => {
  return {
    autoResize: true,
    border: "full",
    columnConfig: { resizable: true, minWidth: 80, drag: true, ...gridProps.columnConfig },
    resizableConfig: { showDragTip: true, isDblclickAutoWidth: true },
    ...gridProps,
    rowConfig: {
      keyField: rowKey,
      ...gridProps.rowConfig
    },
    columns: tableColumns.value
  }
})

// 分页配置
const paginationData = reactive({
  total: 0,
  currentPage: 1,
  pageSizes: [10, 20, 50],
  pageSize: 10,
  layout: "total, sizes, prev, pager, next, jumper"
})

watchEffect(() => {
  paginationData.total = total.value
  paginationData.currentPage = currentPage.value
  paginationData.pageSize = pageSize.value
})

// 将数据加载进 grid：
// - requestApi 场景用 loadData（追加更新，不重置展开状态）
// - 静态 data 场景用 reloadData（完整重建，触发 expandAll 等默认行为）
async function loadGridData(rows: Record<string, unknown>[]) {
  await xGridRef.value?.loadData(rows)
}

async function reloadGridData(rows: Record<string, unknown>[]) {
  await xGridRef.value?.reloadData(rows)
}

onMounted(async () => {
  initSearch(columns)
  await loadEnums(columns)
  if (requestAuto && requestApi) {
    fetchData()
  } else if (data && !requestApi) {
    await reloadGridData(data as Record<string, unknown>[])
  }
  await nextTick()
  initColumnSetting()
})

// requestApi 场景：tableData 由 fetchData() 更新后同步到 grid
watch(tableData, async (newData) => {
  if (requestApi) {
    await loadGridData(newData)
  }
})

// 静态 data 场景：父组件数据变化时用 reloadData 重建（确保 expandAll 等生效）
watch(
  () => data,
  async (newData) => {
    if (newData && !requestApi) {
      await reloadGridData(newData as Record<string, unknown>[])
    }
  },
  { deep: true }
)

function onReset() {
  handleReset(columns)
}

// 暴露给父组件的方法
defineExpose<ProTableExpose>({
  refresh: handleRefresh,
  reset: onReset,
  getSearchParam: () => ({ ...searchParam.value }),
  getGridRef: () => xGridRef.value ?? undefined,
  getTableData: () => xGridRef.value?.getTableData().fullData as Record<string, unknown>[] ?? [],
  getSelections: () => {
    const records = xGridRef.value?.getCheckboxRecords() ?? []
    return records as Record<string, unknown>[]
  },
  getEnumMap: () => new Map(enumMap.value)
})
</script>

<template>
  <div class="pro-table">
    <!-- 搜索栏 -->
    <SearchForm
      v-if="searchable && columns.some((col) => col.search?.el)"
      v-model:search-param="searchParam"
      :columns="columns"
      :enum-map="enumMap"
      @search="handleSearch"
      @reset="onReset"
    />
    <!-- 表格主体 -->
    <el-card v-loading="loading" shadow="never">
      <!-- 工具栏 -->
      <div v-if="showToolButton || $slots.toolbar" class="toolbar-wrapper">
        <div>
          <slot name="toolbar" />
        </div>
        <div v-if="showToolButton">
          <el-tooltip v-if="showRefreshBtn" :content="t('proTable.refresh')" placement="top">
            <el-button type="primary" :icon="RefreshRight" circle @click="handleRefresh" />
          </el-tooltip>
          <el-popover
            v-if="showSettingBtn"
            v-model:visible="settingPopoverVisible"
            placement="bottom-end"
            :width="180"
            :show-arrow="true"
            trigger="click"
          >
            <template #reference>
              <el-button
                type="primary"
                :icon="Setting"
                circle
                @click="openColumnSetting"
              />
            </template>
            <div class="column-setting-list">
              <div class="column-setting-header">
                <el-checkbox
                  :model-value="allChecked"
                  :indeterminate="isIndeterminate"
                  @change="(val) => toggleAll(!!val)"
                >
                  {{ t('proTable.columnSetting') }}
                </el-checkbox>
                <el-button link type="primary" @click="toggleAll(!allChecked)">
                  {{ allChecked ? t('proTable.invertSelection') : t('proTable.selectAll') }}
                </el-button>
              </div>
              <el-divider style="margin: 6px 0" />
              <div
                v-for="(item, index) in settingColumns"
                :key="item.field"
                class="column-setting-item"
                :class="{ 'is-drag-over': dragoverIndex === index }"
                :draggable="columnDragEnabled"
                @dragstart="columnDragEnabled && onDragStart(index)"
                @dragover="columnDragEnabled && onDragOver($event, index)"
                @dragleave="columnDragEnabled && onDragLeave()"
                @drop="columnDragEnabled && onDrop(index)"
              >
                <el-icon v-if="columnDragEnabled" class="drag-handle">
                  <DCaret />
                </el-icon>
                <el-checkbox v-model="item.visible" @change="toggleColumnVisible(item)">
                  {{ item.title }}
                </el-checkbox>
              </div>
            </div>
          </el-popover>
        </div>
      </div>
      <!-- 表格 -->
      <div class="table-wrapper">
        <vxe-grid ref="xGridRef" v-bind="mergedGridProps" @column-dragend="onColumnDragend">
          <!-- 枚举 Tag 列的动态 slot -->
          <template v-for="col in enumTagColumns" :key="col.field" #[`enum-${col.field}`]="{ row }">
            <el-tag
              v-if="findEnumItem(col.field!, row[col.field!]) != null"
              :type="findEnumItem(col.field!, row[col.field!])?.tagType"
              effect="plain"
              disable-transitions
            >
              {{ findEnumItem(col.field!, row[col.field!])?.label }}
            </el-tag>
            <span v-else>{{ row[col.field!] }}</span>
          </template>
          <!-- 透传其余 slot -->
          <template v-for="(_, name) in $slots" :key="name" #[name]="scope">
            <slot v-if="name !== 'toolbar'" :name="name" v-bind="scope ?? {}" />
          </template>
        </vxe-grid>
      </div>
      <!-- 分页 -->
      <div v-if="pagination" class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :current-page="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}

.column-setting-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 0;
}

.column-setting-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.column-setting-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
  border-top: 2px solid transparent;
  transition: border-color 0.15s;
  cursor: default;

  &.is-drag-over {
    border-top-color: var(--el-color-primary);
  }

  .drag-handle {
    cursor: grab;
    color: var(--el-text-color-secondary);
    flex-shrink: 0;

    &:active {
      cursor: grabbing;
    }
  }
}
</style>
