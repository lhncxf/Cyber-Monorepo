<script lang="ts" setup>
import type { DeptData } from "@@/apis/departments/type"
import type { ProDialogExpose, ProTableColumn, ProTableEnumItem } from "@@/components/ProTable/type"
import { createDepartmentApi, deleteDepartmentApi, getDepartmentListApi, updateDepartmentApi } from "@@/apis/departments"
import ProTable from "@@/components/ProTable/index.vue"
import ProDialog from "@@/components/ProTable/ProDialog.vue"
import { CirclePlus, Refresh, Search } from "@element-plus/icons-vue"

defineOptions({
  name: "SystemDept"
})

const { t } = useI18n()

const dialogRef = useTemplateRef<ProDialogExpose>("dialogRef")

const treeData = ref<DeptData[]>([])
const loading = ref(false)
const searchName = ref("")
const searchStatus = ref<boolean | "">("")

const statusEnum = computed<ProTableEnumItem[]>(() => [
  { label: t("common.enable"), value: true, tagType: "success" as const },
  { label: t("common.disable"), value: false, tagType: "danger" as const }
])

const enumMap = computed(() => new Map<string, ProTableEnumItem[]>([["status", statusEnum.value]]))

const columns = computed<ProTableColumn<DeptData>[]>(() => [
  {
    field: "name",
    title: t("sysDept.deptName"),
    minWidth: 180,
    treeNode: true,
    form: {
      el: "input",
      rules: [{ required: true, trigger: "blur", message: t("sysDept.deptNameRequired") }]
    }
  },
  {
    field: "sort",
    title: t("common.sort"),
    width: 80,
    align: "center",
    form: {
      el: "input-number",
      defaultValue: 0,
      props: { min: 0, max: 999, controlsPosition: "right" }
    }
  },
  {
    field: "status",
    title: t("common.status"),
    width: 80,
    align: "center",
    tag: true,
    enum: statusEnum.value,
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
    width: 200,
    align: "center",
    fixed: "right",
    slots: { default: "action" }
  }
])

async function loadData() {
  loading.value = true
  try {
    const res = await getDepartmentListApi({
      name: searchName.value || undefined,
      status: searchStatus.value === "" ? undefined : searchStatus.value
    })
    treeData.value = res.data
  } catch {
    treeData.value = []
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  searchName.value = ""
  searchStatus.value = ""
  loadData()
}

async function handleConfirm(formData: Record<string, unknown>, isEdit: boolean) {
  try {
    if (isEdit) {
      await updateDepartmentApi(formData as never)
    } else {
      await createDepartmentApi(formData as never)
    }
    ElMessage.success(t("common.operateSuccess"))
    dialogRef.value?.close()
    loadData()
  } finally {
    dialogRef.value?.endLoading()
  }
}

function handleDelete(row: DeptData) {
  ElMessageBox.confirm(t("sysDept.confirmDelete", { name: row.name }), t("common.tip"), {
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel"),
    type: "warning"
  }).then(() => {
    deleteDepartmentApi(row.id).then(() => {
      ElMessage.success(t("common.deleteSuccess"))
      loadData()
    })
  })
}

loadData()
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form :inline="true">
        <el-form-item :label="t('sysDept.deptName')">
          <el-input v-model="searchName" :placeholder="t('common.placeholder')" clearable />
        </el-form-item>
        <el-form-item :label="t('common.status')">
          <el-select v-model="searchStatus" :placeholder="t('common.selectPlaceholder')" clearable style="width: 120px">
            <el-option :label="t('common.enable')" :value="true" />
            <el-option :label="t('common.disable')" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadData">
            {{ t("common.search") }}
          </el-button>
          <el-button :icon="Refresh" @click="resetSearch">
            {{ t("common.reset") }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <ProTable
      v-loading="loading"
      :columns="columns"
      :data="treeData"
      :pagination="false"
      :searchable="false"
      :grid-props="{
        treeConfig: { childrenField: 'children', expandAll: true },
      }"
    >
      <template #toolbar>
        <el-button type="primary" :icon="CirclePlus" @click="dialogRef?.open()">
          {{ t("sysDept.addBtn") }}
        </el-button>
      </template>
      <template #action="{ row }">
        <el-button type="primary" text bg size="small" @click="dialogRef?.open(undefined, { parentId: row.id })">
          {{ t("sysDept.addChild") }}
        </el-button>
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
      :title="t('sysDept.title')"
      width="480px"
      label-width="90px"
      @confirm="handleConfirm"
    />
  </div>
</template>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}
</style>
