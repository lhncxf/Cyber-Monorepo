import type { ProTableColumn, ProTableEnumItem, ProTableRequestApi } from "../type"

type EnumMap = Map<string, ProTableEnumItem[]>

interface UseProTableOptions {
  columns: ProTableColumn[]
  requestApi?: ProTableRequestApi
  data?: unknown[]
  initSearchParam?: Record<string, unknown>
  dataCallback?: (data: { list: unknown[], total: number }) => { list: unknown[], total: number }
  pagination?: boolean
}

export function useProTable(options: UseProTableOptions) {
  const {
    requestApi,
    initSearchParam = {},
    dataCallback,
    pagination = true
  } = options

  const tableData = ref<Record<string, unknown>[]>([])
  const loading = ref(false)
  // 搜索参数由列配置动态决定类型，需兼容 Element Plus 各组件 v-model
  const searchParam = ref<Record<string, any>>({ ...initSearchParam })
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const enumMap = ref<EnumMap>(new Map())

  function getSearchDefaultValues(columns: ProTableColumn[]): Record<string, unknown> {
    const defaults: Record<string, unknown> = {}
    for (const col of columns) {
      if (col.search?.defaultValue !== undefined) {
        const key = col.search.key || col.field
        if (key) defaults[key] = col.search.defaultValue
      }
      if (col.children?.length) {
        Object.assign(defaults, getSearchDefaultValues(col.children))
      }
    }
    return defaults
  }

  function initSearch(columns: ProTableColumn[]) {
    const defaults = getSearchDefaultValues(columns)
    searchParam.value = { ...defaults, ...initSearchParam }
  }

  async function loadEnums(columns: ProTableColumn[]) {
    for (const col of columns) {
      if (!col.enum || !col.field) continue
      if (Array.isArray(col.enum)) {
        enumMap.value.set(col.field, col.enum)
      } else if (typeof col.enum === "function") {
        try {
          const result = await col.enum()
          enumMap.value.set(col.field, result)
        } catch (error) {
          console.warn(`ProTable: 加载枚举失败 [${col.field}]`, error)
        }
      }
      if (col.children?.length) {
        await loadEnums(col.children)
      }
    }
  }

  function getEnumList(field: string): ProTableEnumItem[] {
    return enumMap.value.get(field) ?? []
  }

  function findEnumItem(field: string, value: unknown): ProTableEnumItem | undefined {
    const list = getEnumList(field)
    return list.find(item => item.value === value)
  }

  async function fetchData() {
    if (!requestApi) return
    loading.value = true
    try {
      const params: Record<string, unknown> = {
        ...searchParam.value,
        currentPage: currentPage.value,
        size: pageSize.value
      }
      if (!pagination) {
        delete params.currentPage
        delete params.size
      }
      const res = await requestApi(params as { currentPage: number, size: number, [key: string]: unknown })
      let responseData = res.data
      if (dataCallback) {
        responseData = dataCallback(responseData)
      }
      tableData.value = responseData.list as Record<string, unknown>[]
      total.value = responseData.total
    } catch {
      tableData.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  function handleSearch() {
    currentPage.value = 1
    fetchData()
  }

  function handleReset(columns: ProTableColumn[]) {
    const defaults = getSearchDefaultValues(columns)
    searchParam.value = { ...defaults, ...initSearchParam }
    handleSearch()
  }

  function handleRefresh() {
    fetchData()
  }

  function handleCurrentChange(page: number) {
    currentPage.value = page
    fetchData()
  }

  function handleSizeChange(size: number) {
    pageSize.value = size
    currentPage.value = 1
    fetchData()
  }

  return {
    tableData,
    loading,
    searchParam,
    total,
    currentPage,
    pageSize,
    enumMap,
    initSearch,
    loadEnums,
    getEnumList,
    findEnumItem,
    fetchData,
    handleSearch,
    handleReset,
    handleRefresh,
    handleCurrentChange,
    handleSizeChange
  }
}
