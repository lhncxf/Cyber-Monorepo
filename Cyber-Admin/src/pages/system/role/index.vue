<script lang="ts" setup>
import type { RoleData } from "@@/apis/roles/type"
import type { ProDialogExpose, ProTableColumn, ProTableExpose } from "@@/components/ProTable/type"
import { createRoleApi, deleteRoleApi, getRoleListApi, updateRoleApi } from "@@/apis/roles"
import ProTable from "@@/components/ProTable/index.vue"
import ProDialog from "@@/components/ProTable/ProDialog.vue"
import { CirclePlus, Delete } from "@element-plus/icons-vue"
import { h } from "vue"

defineOptions({
  name: "SystemRole"
})

const { t } = useI18n()

const tableRef = useTemplateRef<ProTableExpose>("tableRef")
const dialogRef = useTemplateRef<ProDialogExpose>("dialogRef")

const enumMap = computed(() => tableRef.value?.getEnumMap() ?? new Map())

const statusEnum = computed(() => [
  { label: t("common.enable"), value: true, tagType: "success" as const },
  { label: t("common.disable"), value: false, tagType: "danger" as const }
])

const columns = computed<ProTableColumn<RoleData>[]>(() => [
  {
    field: "name",
    title: t("sysRole.roleName"),
    minWidth: 120,
    search: { el: "input" },
    form: {
      el: "input",
      rules: [{ required: true, trigger: "blur", message: t("sysRole.roleNameRequired") }]
    }
  },
  {
    field: "label",
    title: t("sysRole.roleLabel"),
    minWidth: 120,
    search: { el: "input" },
    form: {
      el: "input",
      rules: [{ required: true, trigger: "blur", message: t("sysRole.roleLabelRequired") }],
      render: ({ formData, isEdit }) => h(ElInput, {
        "modelValue": formData.label as string,
        "onUpdate:modelValue": (v: string) => {
          formData.label = v
        },
        "disabled": isEdit,
        "placeholder": t("sysRole.roleLabelPlaceholder"),
        "clearable": true
      })
    }
  },
  {
    field: "userCount",
    title: t("sysRole.userCount"),
    width: 100,
    align: "center"
  },
  {
    field: "status",
    title: t("common.status"),
    width: 80,
    align: "center",
    tag: true,
    enum: statusEnum.value,
    search: { el: "select" },
    form: {
      el: "radio",
      defaultValue: true
    }
  },
  {
    field: "createTime",
    title: t("common.createTime"),
    width: 160,
    align: "center"
  },
  {
    field: "action",
    title: t("common.operate"),
    width: 150,
    align: "center",
    fixed: "right",
    slots: { default: "action" }
  }
])

async function handleConfirm(formData: Record<string, unknown>, isEdit: boolean) {
  try {
    if (isEdit) {
      await updateRoleApi(formData as never)
    } else {
      await createRoleApi(formData as never)
    }
    ElMessage.success(t("common.operateSuccess"))
    dialogRef.value?.close()
    tableRef.value?.refresh()
  } finally {
    dialogRef.value?.endLoading()
  }
}

function handleDelete(row: RoleData) {
  ElMessageBox.confirm(t("sysRole.confirmDelete", { name: row.name }), t("common.tip"), {
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel"),
    type: "warning"
  }).then(() => {
    deleteRoleApi(row.id).then(() => {
      ElMessage.success(t("common.deleteSuccess"))
      tableRef.value?.refresh()
    })
  })
}
</script>

<template>
  <div class="app-container">
    <ProTable ref="tableRef" :columns="columns" :request-api="getRoleListApi">
      <template #toolbar>
        <el-button type="primary" :icon="CirclePlus" @click="dialogRef?.open()">
          {{ t("sysRole.addBtn") }}
        </el-button>
        <el-button type="danger" :icon="Delete" disabled>
          {{ t("common.batchDelete") }}
        </el-button>
      </template>
      <template #action="{ row }">
        <el-button type="primary" text bg size="small" @click="dialogRef?.open(row)">
          {{ t("common.edit") }}
        </el-button>
        <el-button type="danger" text bg size="small" @click="handleDelete(row)">
          {{ t("common.delete") }}
        </el-button>
      </template>
    </ProTable>

    <ProDialog
      ref="dialogRef"
      :columns="columns"
      :enum-map="enumMap"
      :title="t('sysRole.title')"
      width="480px"
      label-width="80px"
      @confirm="handleConfirm"
    />
  </div>
</template>
