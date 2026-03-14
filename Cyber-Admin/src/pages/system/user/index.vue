<script lang="ts" setup>
import type { SystemUserData } from "@@/apis/sys-users/type"
import type { ProDialogExpose, ProTableColumn, ProTableEnumItem, ProTableExpose } from "@@/components/ProTable/type"
import { getAllDepartmentsApi } from "@@/apis/departments"
import { getAllRolesApi } from "@@/apis/roles"
import { createSystemUserApi, deleteSystemUserApi, getSystemUserListApi, resetUserPasswordApi, updateSystemUserApi } from "@@/apis/sys-users"
import ProTable from "@@/components/ProTable/index.vue"
import ProDialog from "@@/components/ProTable/ProDialog.vue"
import { CirclePlus, Delete } from "@element-plus/icons-vue"
import { h } from "vue"

defineOptions({
  name: "SystemUser"
})

const { t } = useI18n()

const tableRef = useTemplateRef<ProTableExpose>("tableRef")
const dialogRef = useTemplateRef<ProDialogExpose>("dialogRef")

const resetPwdDialogVisible = ref(false)
const resetPwdUserId = ref(0)
const resetPwdUsername = ref("")
const resetPwdValue = ref("")
const resetPwdLoading = ref(false)

const statusEnum = computed<ProTableEnumItem[]>(() => [
  { label: t("common.enable"), value: true, tagType: "success" },
  { label: t("common.disable"), value: false, tagType: "danger" }
])

async function loadDeptOptions(): Promise<ProTableEnumItem[]> {
  const res = await getAllDepartmentsApi()
  return res.data.map(d => ({ label: d.name, value: d.id }))
}

async function loadRoleOptions(): Promise<ProTableEnumItem[]> {
  const res = await getAllRolesApi()
  return res.data.map(r => ({ label: r.label, value: r.id }))
}

const columns = computed<ProTableColumn<SystemUserData>[]>(() => [
  // COME HERE 请查看这里
  {
    field: "username",
    title: t("sysUser.username"),
    minWidth: 120,
    search: { el: "input" },
    form: {
      el: "input",
      rules: [{ required: true, trigger: "blur", message: t("sysUser.usernameRequired") }],
      render: ({ formData, isEdit }) => h(ElInput, {
        "modelValue": formData.username as string,
        "onUpdate:modelValue": (v: string) => {
          formData.username = v
        },
        "disabled": isEdit,
        "placeholder": t("sysUser.inputPlaceholder"),
        "clearable": true
      })
    }
  },
  // END
  {
    field: "password",
    title: t("sysUser.password"),
    hideInTable: true,
    form: {
      el: "input",
      createOnly: true,
      rules: [{ required: true, trigger: "blur", message: t("sysUser.passwordRequired") }],
      props: { type: "password", showPassword: true, placeholder: t("sysUser.inputPlaceholder") }
    }
  },
  {
    field: "phone",
    title: t("sysUser.phone"),
    minWidth: 130,
    search: { el: "input" }
  },
  {
    field: "email",
    title: t("sysUser.email"),
    minWidth: 180,
    slots: { default: "email" }
  },
  {
    field: "deptId",
    title: t("sysUser.dept"),
    minWidth: 120,
    hideInTable: true,
    enum: loadDeptOptions,
    form: { el: "select" }
  },
  {
    field: "deptName",
    title: t("sysUser.dept"),
    minWidth: 120,
    slots: { default: "deptName" }
  },
  {
    field: "roleIds",
    title: t("sysUser.role"),
    minWidth: 150,
    hideInTable: true,
    enum: loadRoleOptions,
    form: { el: "checkbox", defaultValue: [] }
  },
  {
    field: "roles",
    title: t("sysUser.role"),
    minWidth: 150,
    slots: { default: "roles" }
  },
  {
    field: "status",
    title: t("common.status"),
    width: 80,
    align: "center",
    tag: true,
    enum: statusEnum.value,
    search: { el: "select" },
    form: { el: "radio", defaultValue: true }
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
    width: 220,
    align: "center",
    fixed: "right",
    slots: { default: "action" }
  }
])

const enumMap = computed(() => tableRef.value?.getEnumMap() ?? new Map())

async function handleConfirm(formData: Record<string, unknown>, isEdit: boolean) {
  try {
    const payload = {
      ...formData,
      email: (formData.email as string) || undefined,
      phone: (formData.phone as string) || undefined,
      password: (formData.password as string) || undefined
    }
    if (isEdit) {
      await updateSystemUserApi(payload as never)
    } else {
      await createSystemUserApi(payload as never)
    }
    ElMessage.success(t("common.operateSuccess"))
    dialogRef.value?.close()
    tableRef.value?.refresh()
  } finally {
    dialogRef.value?.endLoading()
  }
}

function handleDelete(row: SystemUserData) {
  ElMessageBox.confirm(t("sysUser.confirmDelete", { name: row.username }), t("common.tip"), {
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel"),
    type: "warning"
  }).then(() => {
    deleteSystemUserApi(row.id).then(() => {
      ElMessage.success(t("common.deleteSuccess"))
      tableRef.value?.refresh()
    })
  })
}

function openResetPwd(row: SystemUserData) {
  resetPwdUserId.value = row.id
  resetPwdUsername.value = row.username
  resetPwdValue.value = ""
  resetPwdDialogVisible.value = true
}

function handleResetPwd() {
  if (!resetPwdValue.value || resetPwdValue.value.length < 6) {
    ElMessage.error(t("sysUser.passwordMinLength"))
    return
  }
  resetPwdLoading.value = true
  resetUserPasswordApi(resetPwdUserId.value, resetPwdValue.value).then(() => {
    ElMessage.success(t("sysUser.resetSuccess"))
    resetPwdDialogVisible.value = false
  }).finally(() => {
    resetPwdLoading.value = false
  })
}
</script>

<template>
  <div class="app-container">
    <ProTable ref="tableRef" :columns="columns" :request-api="getSystemUserListApi">
      <template #toolbar>
        <el-button type="primary" :icon="CirclePlus" @click="dialogRef?.open()">
          {{ t("sysUser.addBtn") }}
        </el-button>
        <el-button type="danger" :icon="Delete" disabled>
          {{ t("common.batchDelete") }}
        </el-button>
      </template>
      <template #email="{ row }">
        <span :title="row.email">{{ row.email || "—" }}</span>
      </template>
      <template #deptName="{ row }">
        {{ row.deptName || "—" }}
      </template>
      <template #roles="{ row }">
        <el-tag
          v-for="role in (row.roles as string[])"
          :key="role"
          type="primary"
          effect="plain"
          disable-transitions
          class="mr-1"
        >
          {{ role }}
        </el-tag>
      </template>
      <template #action="{ row }">
        <el-button type="primary" text bg size="small" @click="dialogRef?.open(row)">
          {{ t("common.edit") }}
        </el-button>
        <el-button type="warning" text bg size="small" @click="openResetPwd(row)">
          {{ t("sysUser.resetPwd") }}
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
      :title="t('sysUser.title')"
      width="500px"
      label-width="80px"
      @confirm="handleConfirm"
    />

    <el-dialog
      v-model="resetPwdDialogVisible"
      :title="`${t('sysUser.resetPwd')} — ${resetPwdUsername}`"
      width="400px"
      @closed="resetPwdValue = ''"
    >
      <el-form label-width="80px" label-position="left">
        <el-form-item :label="t('sysUser.newPassword')">
          <el-input v-model="resetPwdValue" type="password" show-password :placeholder="t('sysUser.newPasswordPlaceholder')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPwdDialogVisible = false">
          {{ t("common.cancel") }}
        </el-button>
        <el-button type="primary" :loading="resetPwdLoading" @click="handleResetPwd">
          {{ t("sysUser.confirmReset") }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
