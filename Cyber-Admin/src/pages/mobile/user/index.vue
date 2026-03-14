<script lang="ts" setup>
import type { MobileUserData, ShippingAddressAdminData } from "@@/apis/mobile-users/type"
import type { ProDialogExpose, ProTableColumn, ProTableEnumItem, ProTableExpose } from "@@/components/ProTable/type"
import {
  createMobileUserApi,
  deleteMobileUserApi,
  getMobileUserAddressesApi,
  getMobileUserListApi,
  resetMobileUserPasswordApi,
  updateMobileUserApi
} from "@@/apis/mobile-users"
import ProTable from "@@/components/ProTable/index.vue"
import ProDialog from "@@/components/ProTable/ProDialog.vue"
import { CirclePlus } from "@element-plus/icons-vue"
import { useI18n } from "vue-i18n"

defineOptions({
  name: "MobileUser"
})

const { t } = useI18n()

const tableRef = useTemplateRef<ProTableExpose>("tableRef")
const dialogRef = useTemplateRef<ProDialogExpose>("dialogRef")

const resetPwdDialogVisible = ref(false)
const resetPwdUserId = ref(0)
const resetPwdPhone = ref("")
const resetPwdValue = ref("")
const resetPwdLoading = ref(false)

const addressDialogVisible = ref(false)
const addressDialogTitle = ref("")
const addressList = ref<ShippingAddressAdminData[]>([])
const addressLoading = ref(false)

const statusEnum: ProTableEnumItem[] = [
  { label: t("common.enable"), value: true, tagType: "success" },
  { label: t("common.disable"), value: false, tagType: "danger" }
]

const columns: ProTableColumn<MobileUserData>[] = [
  {
    field: "phone",
    title: t("mobileUser.phone"),
    minWidth: 140,
    search: { el: "input" },
    form: {
      el: "input",
      rules: [{ required: true, trigger: "blur", message: t("mobileUser.phoneRequired") }],
      props: { placeholder: t("mobileUser.phonePlaceholder"), clearable: true }
    }
  },
  {
    field: "password",
    title: t("mobileUser.password"),
    hideInTable: true,
    form: {
      el: "input",
      createOnly: true,
      rules: [{ required: true, trigger: "blur", message: t("mobileUser.passwordRequired") }],
      props: { type: "password", showPassword: true, placeholder: t("mobileUser.passwordPlaceholder") }
    }
  },
  {
    field: "nickname",
    title: t("mobileUser.nickname"),
    minWidth: 120,
    search: { el: "input" },
    form: {
      el: "input",
      props: { placeholder: t("mobileUser.nicknamePlaceholder"), clearable: true }
    }
  },
  {
    field: "status",
    title: t("common.status"),
    width: 90,
    align: "center",
    tag: true,
    enum: statusEnum,
    search: { el: "select" },
    form: { el: "radio", defaultValue: true }
  },
  {
    field: "createTime",
    title: t("mobileUser.registerTime"),
    width: 160,
    align: "center"
  },
  {
    field: "action",
    title: t("common.operate"),
    width: 260,
    align: "center",
    fixed: "right",
    slots: { default: "action" }
  }
]

const enumMap = computed(() => tableRef.value?.getEnumMap() ?? new Map())

async function handleConfirm(formData: Record<string, unknown>, isEdit: boolean) {
  try {
    if (isEdit) {
      await updateMobileUserApi(formData as never)
    } else {
      await createMobileUserApi(formData as never)
    }
    ElMessage.success(t("common.operateSuccess"))
    dialogRef.value?.close()
    tableRef.value?.refresh()
  } finally {
    dialogRef.value?.endLoading()
  }
}

function handleDelete(row: MobileUserData) {
  ElMessageBox.confirm(t("mobileUser.confirmDelete", { name: row.phone }), t("common.tip"), {
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel"),
    type: "warning"
  }).then(() => {
    deleteMobileUserApi(row.id).then(() => {
      ElMessage.success(t("common.deleteSuccess"))
      tableRef.value?.refresh()
    })
  })
}

function openResetPwd(row: MobileUserData) {
  resetPwdUserId.value = row.id
  resetPwdPhone.value = row.phone
  resetPwdValue.value = ""
  resetPwdDialogVisible.value = true
}

function handleResetPwd() {
  if (!resetPwdValue.value || resetPwdValue.value.length < 6) {
    ElMessage.error(t("mobileUser.passwordMinLength"))
    return
  }
  resetPwdLoading.value = true
  resetMobileUserPasswordApi(resetPwdUserId.value, resetPwdValue.value).then(() => {
    ElMessage.success(t("mobileUser.resetSuccess"))
    resetPwdDialogVisible.value = false
  }).finally(() => {
    resetPwdLoading.value = false
  })
}

async function openAddressDialog(row: MobileUserData) {
  addressDialogTitle.value = `${t("mobileUserAddress.title")} — ${row.phone}`
  addressList.value = []
  addressDialogVisible.value = true
  addressLoading.value = true
  try {
    const res = await getMobileUserAddressesApi(row.id)
    addressList.value = res.data
  } finally {
    addressLoading.value = false
  }
}
</script>

<template>
  <div class="app-container">
    <ProTable ref="tableRef" :columns="columns" :request-api="getMobileUserListApi">
      <template #toolbar>
        <el-button type="primary" :icon="CirclePlus" @click="dialogRef?.open()">
          {{ t("mobileUser.addBtn") }}
        </el-button>
      </template>
      <template #action="{ row }">
        <el-button type="primary" text bg size="small" @click="dialogRef?.open(row)">
          {{ t("common.edit") }}
        </el-button>
        <el-button type="warning" text bg size="small" @click="openResetPwd(row)">
          {{ t("mobileUser.resetPwd") }}
        </el-button>
        <el-button type="info" text bg size="small" @click="openAddressDialog(row)">
          {{ t("mobileUserAddress.title") }}
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
      :title="t('mobileUser.title')"
      width="440px"
      label-width="80px"
      @confirm="handleConfirm"
    />

    <!-- Reset Password Dialog -->
    <el-dialog
      v-model="resetPwdDialogVisible"
      :title="`${t('mobileUser.resetPwd')} — ${resetPwdPhone}`"
      width="400px"
      @closed="resetPwdValue = ''"
    >
      <el-form label-width="80px" label-position="left">
        <el-form-item :label="t('mobileUser.newPassword')">
          <el-input v-model="resetPwdValue" type="password" show-password :placeholder="t('mobileUser.newPasswordPlaceholder')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPwdDialogVisible = false">
          {{ t("common.cancel") }}
        </el-button>
        <el-button type="primary" :loading="resetPwdLoading" @click="handleResetPwd">
          {{ t("mobileUser.confirmReset") }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Address View Dialog -->
    <el-dialog
      v-model="addressDialogVisible"
      :title="addressDialogTitle"
      width="600px"
    >
      <div v-loading="addressLoading" style="min-height: 80px;">
        <el-empty v-if="!addressLoading && addressList.length === 0" :description="t('mobileUserAddress.noAddresses')" />
        <el-table v-else-if="!addressLoading" :data="addressList" border stripe>
          <el-table-column :label="t('mobileUserAddress.name')" prop="name" width="90" />
          <el-table-column :label="t('mobileUserAddress.phone')" prop="phone" width="120" />
          <el-table-column :label="t('mobileUserAddress.province')" prop="province" width="90" />
          <el-table-column :label="t('mobileUserAddress.city')" prop="city" width="90" />
          <el-table-column :label="t('mobileUserAddress.district')" prop="district" width="80" />
          <el-table-column :label="t('mobileUserAddress.detail')" prop="detail" min-width="120" show-overflow-tooltip />
          <el-table-column :label="t('mobileUserAddress.isDefault')" prop="isDefault" width="90" align="center">
            <template #default="{ row: addrRow }">
              <el-tag :type="addrRow.isDefault ? 'success' : 'info'" size="small">
                {{ addrRow.isDefault ? t("mobileUserAddress.yes") : t("mobileUserAddress.no") }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="addressDialogVisible = false">
          {{ t("searchMenu.close") }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
