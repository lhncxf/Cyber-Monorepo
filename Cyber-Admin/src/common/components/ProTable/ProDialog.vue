<script lang="ts" setup>
import type { FormInstance } from "element-plus"
import type { ProDialogExpose, ProDialogProps, ProTableColumn, ProTableEnumItem } from "./type"
import { cloneDeep } from "lodash-es"

defineOptions({
  name: "ProDialog"
})

const {
  columns,
  enumMap = new Map(),
  title,
  width = "30%",
  labelWidth = "100px",
  labelPosition = "left",
  rowKey = "id"
} = defineProps<ProDialogProps>()

const emit = defineEmits<{
  confirm: [formData: Record<string, unknown>, isEdit: boolean]
}>()

const { t } = useI18n()

const dialogVisible = ref(false)
const loading = ref(false)
const isEdit = ref(false)
const formRef = useTemplateRef<FormInstance>("formRef")
// 表单数据由列配置动态决定类型，需兼容 Element Plus 各组件 v-model
const formData = ref<Record<string, any>>({})

const formColumns = computed(() => {
  return columns
    .filter(col => col.form?.el)
    .filter((col) => {
      if (isEdit.value && col.form?.createOnly) return false
      if (!isEdit.value && col.form?.editOnly) return false
      return true
    })
    .sort((a, b) => (a.form?.order ?? 0) - (b.form?.order ?? 0))
})

const formRules = computed(() => {
  const rules: Record<string, unknown[]> = {}
  for (const col of formColumns.value) {
    const key = getFieldKey(col)
    if (col.form?.rules?.length) {
      rules[key] = col.form.rules
    }
  }
  return rules
})

const dialogTitle = computed(() => {
  if (title) return title
  return isEdit.value ? t("common.edit") : t("common.add")
})

function getFieldKey(col: ProTableColumn): string {
  return col.form?.key || col.field || ""
}

function getLabel(col: ProTableColumn): string {
  return col.form?.label || (col.title as string) || ""
}

function getEnumOptions(col: ProTableColumn): ProTableEnumItem[] {
  if (!col.field) return []
  return enumMap.get(col.field) ?? []
}

function getSpan(col: ProTableColumn): number {
  return col.form?.span ?? 24
}

function buildDefaultFormData(): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  for (const col of columns) {
    if (!col.form?.el) continue
    const key = getFieldKey(col)
    if (key) {
      data[key] = col.form.defaultValue ?? undefined
    }
  }
  return data
}

function open(row?: Record<string, unknown>, defaults?: Record<string, unknown>) {
  isEdit.value = !!row && row[rowKey] !== undefined
  if (row && isEdit.value) {
    formData.value = cloneDeep(row)
  } else {
    formData.value = { ...buildDefaultFormData(), ...defaults }
  }
  dialogVisible.value = true
}

function close() {
  dialogVisible.value = false
}

function handleConfirm() {
  formRef.value?.validate((valid) => {
    if (!valid) return
    loading.value = true
    emit("confirm", cloneDeep(formData.value), isEdit.value)
  })
}

function handleClosed() {
  formRef.value?.resetFields()
  formRef.value?.clearValidate()
  formData.value = {}
  loading.value = false
}

function endLoading() {
  loading.value = false
}

defineExpose<ProDialogExpose>({
  open,
  close,
  getFormData: () => cloneDeep(formData.value),
  getIsEdit: () => isEdit.value,
  endLoading
})
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="width"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-width="labelWidth"
      :label-position="labelPosition"
    >
      <slot v-if="$slots.form" name="form" :form-data="formData" :is-edit="isEdit" />
      <el-row v-else :gutter="20">
        <el-col v-for="col in formColumns" :key="getFieldKey(col)" :span="getSpan(col)">
          <el-form-item :label="getLabel(col)" :prop="getFieldKey(col)">
            <!-- 自定义渲染 -->
            <template v-if="col.form?.render">
              <component :is="col.form.render({ formData, isEdit })" />
            </template>
            <!-- input -->
            <el-input
              v-else-if="col.form?.el === 'input'"
              v-model="formData[getFieldKey(col)]"
              :placeholder="t('common.placeholder')"
              clearable
              v-bind="col.form?.props"
            />
            <!-- textarea -->
            <el-input
              v-else-if="col.form?.el === 'textarea'"
              v-model="formData[getFieldKey(col)]"
              type="textarea"
              :placeholder="t('common.placeholder')"
              v-bind="col.form?.props"
            />
            <!-- input-number -->
            <el-input-number
              v-else-if="col.form?.el === 'input-number'"
              v-model="formData[getFieldKey(col)]"
              :controls="false"
              :placeholder="t('common.placeholder')"
              v-bind="col.form?.props"
            />
            <!-- select -->
            <el-select
              v-else-if="col.form?.el === 'select'"
              v-model="formData[getFieldKey(col)]"
              :placeholder="t('common.selectPlaceholder')"
              clearable
              v-bind="col.form?.props"
            >
              <el-option
                v-for="item in getEnumOptions(col)"
                :key="String(item.value)"
                :label="item.label"
                :value="item.value"
                :disabled="item.disabled"
              />
            </el-select>
            <!-- radio -->
            <el-radio-group
              v-else-if="col.form?.el === 'radio'"
              v-model="formData[getFieldKey(col)]"
              v-bind="col.form?.props"
            >
              <el-radio
                v-for="item in getEnumOptions(col)"
                :key="String(item.value)"
                :value="item.value"
                :disabled="item.disabled"
              >
                {{ item.label }}
              </el-radio>
            </el-radio-group>
            <!-- radio-button -->
            <el-radio-group
              v-else-if="col.form?.el === 'radio-button'"
              v-model="formData[getFieldKey(col)]"
              v-bind="col.form?.props"
            >
              <el-radio-button
                v-for="item in getEnumOptions(col)"
                :key="String(item.value)"
                :value="item.value"
                :disabled="item.disabled"
              >
                {{ item.label }}
              </el-radio-button>
            </el-radio-group>
            <!-- checkbox -->
            <el-checkbox-group
              v-else-if="col.form?.el === 'checkbox'"
              v-model="formData[getFieldKey(col)]"
              v-bind="col.form?.props"
            >
              <el-checkbox
                v-for="item in getEnumOptions(col)"
                :key="String(item.value)"
                :value="item.value"
                :disabled="item.disabled"
              >
                {{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
            <!-- date-picker -->
            <el-date-picker
              v-else-if="col.form?.el === 'date-picker'"
              v-model="formData[getFieldKey(col)]"
              :placeholder="t('common.selectPlaceholder')"
              clearable
              v-bind="col.form?.props"
            />
            <!-- time-picker -->
            <el-time-picker
              v-else-if="col.form?.el === 'time-picker'"
              v-model="formData[getFieldKey(col)]"
              :placeholder="t('common.selectPlaceholder')"
              clearable
              v-bind="col.form?.props"
            />
            <!-- time-select -->
            <el-time-select
              v-else-if="col.form?.el === 'time-select'"
              v-model="formData[getFieldKey(col)]"
              :placeholder="t('common.selectPlaceholder')"
              clearable
              v-bind="col.form?.props"
            />
            <!-- tree-select -->
            <el-tree-select
              v-else-if="col.form?.el === 'tree-select'"
              v-model="formData[getFieldKey(col)]"
              :placeholder="t('common.selectPlaceholder')"
              clearable
              v-bind="col.form?.props"
              :data="getEnumOptions(col)"
            />
            <!-- cascader -->
            <el-cascader
              v-else-if="col.form?.el === 'cascader'"
              v-model="formData[getFieldKey(col)]"
              :placeholder="t('common.selectPlaceholder')"
              clearable
              v-bind="col.form?.props"
              :options="(getEnumOptions(col) as unknown as import('element-plus').CascaderOption[])"
            />
            <!-- switch -->
            <el-switch
              v-else-if="col.form?.el === 'switch'"
              v-model="formData[getFieldKey(col)]"
              v-bind="col.form?.props"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <slot name="footer" :form-data="formData" :is-edit="isEdit" :loading="loading" :close="close" :end-loading="endLoading">
        <el-button @click="close">
          {{ t("common.cancel") }}
        </el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">
          {{ t("common.confirm") }}
        </el-button>
      </slot>
    </template>
  </el-dialog>
</template>
