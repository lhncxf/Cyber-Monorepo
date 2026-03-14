import type { VNode } from "vue"
import type { VxeColumnProps, VxeGridInstance, VxeGridProps } from "vxe-table"

/** 表单组件类型（搜索栏 + 弹窗表单共用） */
export type FormItemType
  = | "input"
    | "input-number"
    | "select"
    | "date-picker"
    | "time-picker"
    | "time-select"
    | "tree-select"
    | "cascader"
    | "switch"
    | "radio"
    | "radio-button"
    | "checkbox"
    | "textarea"

/** 搜索表单组件类型（兼容旧类型名） */
export type SearchType = FormItemType

/** 弹窗表单项配置 */
export interface ProTableFormItem {
  /** Element Plus 组件类型 */
  el?: FormItemType
  /** 传递给 Element Plus 组件的 props */
  props?: Record<string, unknown>
  /** 默认值 */
  defaultValue?: unknown
  /** 表单中的 label（不传则用 column.title） */
  label?: string
  /** 表单字段 key（不传则用 column.field） */
  key?: string
  /** 栅格占位 span，默认 24（整行） */
  span?: number
  /** 排序权重，数值越小越靠前 */
  order?: number
  /** 校验规则（Element Plus FormItemRule 数组） */
  rules?: Record<string, unknown>[]
  /** 自定义渲染函数 */
  render?: (scope: { formData: Record<string, any>, isEdit: boolean }) => VNode
  /** 仅新增时显示 */
  createOnly?: boolean
  /** 仅编辑时显示 */
  editOnly?: boolean
}

/** 搜索表单项配置 */
export interface ProTableSearch {
  /** Element Plus 组件类型 */
  el?: SearchType
  /** 传递给 Element Plus 组件的 props */
  props?: Record<string, unknown>
  /** 默认值 */
  defaultValue?: unknown
  /** 搜索栏中的 label（不传则用 column.title） */
  label?: string
  /** 搜索字段 key（不传则用 column.field） */
  key?: string
  /** 栅格占位 span，默认 6 */
  span?: number
  /** 排序权重，数值越小越靠前 */
  order?: number
  /** 自定义渲染函数 */
  render?: (scope: { searchParam: Record<string, any> }) => VNode
}

/** 枚举项 */
export interface ProTableEnumItem {
  /** 显示文本 */
  label: string
  /** 值 */
  value: string | number | boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 以 Tag 展示时的类型 */
  tagType?: "primary" | "success" | "warning" | "danger" | "info"
  /** 子项（用于级联、树选择等） */
  children?: ProTableEnumItem[]
  /** 兼容 CascaderOption 等需要索引签名的组件类型 */
  [key: string]: unknown
}

/** ProTable 列配置 = vxe-table column + 搜索配置 + 枚举 */
export interface ProTableColumn<T = any> extends VxeColumnProps<T> {
  /** 搜索配置，设置后该列会出现在搜索栏中 */
  search?: ProTableSearch
  /** 弹窗表单配置，设置后该列会出现在新增/修改弹窗中 */
  form?: ProTableFormItem
  /** 枚举数据（搜索下拉 + 表格 Tag + 弹窗表单共用），支持静态数组或异步函数 */
  enum?: ProTableEnumItem[] | (() => Promise<ProTableEnumItem[]>)
  /** 自定义枚举字段映射 */
  fieldNames?: { label: string, value: string }
  /** 是否在表格中隐藏（仅搜索用途） */
  hideInTable?: boolean
  /** 是否以 Tag 形式展示（配合 enum 使用） */
  tag?: boolean
  /** 插槽配置（vxe-grid 列的 slots，如 { default: "slotName" }） */
  slots?: Record<string, string>
  /** 子列（多级表头） */
  children?: ProTableColumn<T>[]
}

/** 请求 API 函数签名，遵循项目 ApiResponseData 契约 */
export type ProTableRequestApi<T = any> = (params: {
  currentPage: number
  size: number
  [key: string]: unknown
}) => Promise<ApiResponseData<{ list: T[], total: number }>>

/** ProTable 组件 Props */
export interface ProTableProps<T = any> {
  /** 列配置（核心） */
  columns: ProTableColumn<T>[]
  /** 请求接口函数 */
  requestApi?: ProTableRequestApi<T>
  /** 是否自动请求，默认 true */
  requestAuto?: boolean
  /** 静态数据（不走 requestApi 时使用） */
  data?: T[]
  /** 初始搜索参数 */
  initSearchParam?: Record<string, unknown>
  /** 数据响应回调（可对返回数据二次处理） */
  dataCallback?: (data: { list: T[], total: number }) => { list: T[], total: number }
  /** 是否显示分页，默认 true */
  pagination?: boolean
  /** 是否显示搜索栏，默认 true */
  searchable?: boolean
  /** 行数据唯一主键字段名，默认 "id" */
  rowKey?: string
  /** 工具栏右侧功能按钮，默认全部显示 */
  toolButton?: ("refresh" | "setting")[] | boolean
  /** 透传给 vxe-grid 的其他 props */
  gridProps?: Partial<VxeGridProps<T>>
}

/** ProTable 暴露的方法 */
export interface ProTableExpose {
  /** 刷新（保持当前搜索条件和页码） */
  refresh: () => void
  /** 重置搜索并刷新 */
  reset: () => void
  /** 获取当前搜索参数 */
  getSearchParam: () => Record<string, unknown>
  /** 获取 vxe-grid 实例（用于高级操作） */
  getGridRef: () => VxeGridInstance | undefined
  /** 获取当前表格数据 */
  getTableData: () => Record<string, unknown>[]
  /** 获取选中行 */
  getSelections: () => Record<string, unknown>[]
  /** 获取已加载的枚举 Map（可透传给 ProDialog） */
  getEnumMap: () => Map<string, ProTableEnumItem[]>
}

/** ProDialog 组件 Props */
export interface ProDialogProps<T = any> {
  /** 列配置（从 ProTable 共享，自动提取 form 配置） */
  columns: ProTableColumn<T>[]
  /** 枚举数据 Map（从 ProTable 共享，避免重复加载） */
  enumMap?: Map<string, ProTableEnumItem[]>
  /** 弹窗标题（不传则根据 isEdit 自动判断：新增 / 修改） */
  title?: string
  /** 弹窗宽度，默认 "30%" */
  width?: string | number
  /** 表单 label 宽度，默认 "100px" */
  labelWidth?: string | number
  /** 表单 label 位置，默认 "left" */
  labelPosition?: "left" | "right" | "top"
  /** 行唯一主键字段名（用于判断新增/编辑），默认 "id" */
  rowKey?: string
}

/** ProDialog 暴露的方法 */
export interface ProDialogExpose {
  /** 打开弹窗，传入行数据即为编辑模式，不传为新增模式；defaults 可在新增模式下预填字段 */
  open: (row?: Record<string, unknown>, defaults?: Record<string, unknown>) => void
  /** 关闭弹窗 */
  close: () => void
  /** 获取当前表单数据 */
  getFormData: () => Record<string, unknown>
  /** 获取是否为编辑模式 */
  getIsEdit: () => boolean
  /** 结束加载状态（confirm 回调处理完毕后调用） */
  endLoading: () => void
}
