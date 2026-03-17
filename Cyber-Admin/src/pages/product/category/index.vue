<script lang="ts" setup>
import type { CategoryData } from "@@/apis/categories/type"
import type { ProTableColumn } from "@@/components/ProTable/type"
import {
  createCategoryApi,
  deleteCategoryApi,
  getCategoryTreeApi,
  updateCategoryApi
} from "@@/apis/categories"
import ProTable from "@@/components/ProTable/index.vue"
import { CirclePlus, Refresh, Search } from "@element-plus/icons-vue"

defineOptions({ name: "ProductCategory" })

const { t } = useI18n()

const treeData = ref<CategoryData[]>([])
const loading = ref(false)
const searchName = ref("")
const searchStatus = ref<boolean | "">("")

const rootCategories = ref<CategoryData[]>([])

async function loadData() {
  loading.value = true
  try {
    const res = await getCategoryTreeApi({
      name: searchName.value || undefined,
      status: searchStatus.value === "" ? undefined : searchStatus.value
    })
    treeData.value = res.data
    await loadRootCategories()
  } catch {
    treeData.value = []
  } finally {
    loading.value = false
  }
}

async function loadRootCategories() {
  try {
    const res = await getCategoryTreeApi()
    rootCategories.value = res.data.filter(c => c.parentId === 0)
  } catch {
    rootCategories.value = []
  }
}

function resetSearch() {
  searchName.value = ""
  searchStatus.value = ""
  loadData()
}

loadData()

const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)

const formData = ref<{
  id?: number
  parentId: number
  name: string
  sort: number
  status: boolean
}>({
  parentId: 0,
  name: "",
  sort: 0,
  status: true
})

function isRootRow(row: CategoryData) {
  return row.parentId === 0
}

function openCreate(parentId = 0) {
  isEdit.value = false
  formData.value = { parentId, name: "", sort: 0, status: true }
  dialogVisible.value = true
}

function openEdit(row: CategoryData) {
  isEdit.value = true
  formData.value = {
    id: row.id,
    parentId: row.parentId,
    name: row.name,
    sort: row.sort,
    status: row.status
  }
  dialogVisible.value = true
}

async function handleSave() {
  if (!formData.value.name.trim()) {
    ElMessage.warning(t("productCategory.nameRequired"))
    return
  }
  saving.value = true
  try {
    if (isEdit.value) {
      await updateCategoryApi(formData.value)
    } else {
      await createCategoryApi(formData.value)
    }
    ElMessage.success(t("common.operateSuccess"))
    dialogVisible.value = false
    loadData()
  } finally {
    saving.value = false
  }
}

function handleDelete(row: CategoryData) {
  ElMessageBox.confirm(t("productCategory.confirmDelete", { name: row.name }), t("common.tip"), {
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel"),
    type: "warning"
  }).then(() => {
    deleteCategoryApi(row.id).then(() => {
      ElMessage.success(t("common.deleteSuccess"))
      loadData()
    })
  })
}

const statusEnum = computed(() => [
  { label: t("common.enable"), value: true, tagType: "success" as const },
  { label: t("common.disable"), value: false, tagType: "danger" as const }
])

const columns = computed<ProTableColumn<CategoryData>[]>(() => [
  {
    field: "name",
    title: t("productCategory.categoryName"),
    minWidth: 200,
    treeNode: true
  },
  {
    field: "sort",
    title: t("common.sort"),
    width: 80,
    align: "center"
  },
  {
    field: "status",
    title: t("common.status"),
    width: 90,
    align: "center",
    tag: true,
    enum: statusEnum.value
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

const dialogTitle = computed(() => {
  if (isEdit.value) return t("productCategory.editTitle")
  return formData.value.parentId === 0 ? t("productCategory.addTopTitle") : t("productCategory.addChildTitle")
})
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form :inline="true">
        <el-form-item :label="t('productCategory.categoryName')">
          <el-input v-model="searchName" :placeholder="t('common.placeholder')" clearable @keydown.enter="loadData" />
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
        <el-button type="primary" :icon="CirclePlus" @click="openCreate(0)">
          {{ t("productCategory.addBtn") }}
        </el-button>
      </template>

      <template #action="{ row }">
        <el-button
          v-if="isRootRow(row)"
          type="success"
          text
          bg
          size="small"
          @click="openCreate(row.id)"
        >
          {{ t("productCategory.addChildBtn") }}
        </el-button>
        <el-button type="primary" text bg size="small" @click="openEdit(row)">
          {{ t("common.edit") }}
        </el-button>
        <el-button type="danger" text bg size="small" @click="handleDelete(row)">
          {{ t("common.delete") }}
        </el-button>
      </template>
    </ProTable>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form label-width="90px" :model="formData">
        <el-form-item v-if="!isEdit && formData.parentId !== 0" :label="t('productCategory.parentCategory')">
          <el-select v-model="formData.parentId" :placeholder="t('productCategory.parentCategoryPlaceholder')" style="width: 100%">
            <el-option
              v-for="cat in rootCategories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('productCategory.categoryNameLabel')" required>
          <el-input v-model="formData.name" :placeholder="t('productCategory.categoryNamePlaceholder')" clearable />
        </el-form-item>

        <el-form-item :label="t('productCategory.sortLabel')">
          <el-input-number
            v-model="formData.sort"
            :min="0"
            :max="999"
            controls-position="right"
            style="width: 160px"
          />
          <span class="ml-2 text-sm text-gray-400">{{ t("productCategory.sortHint") }}</span>
        </el-form-item>

        <el-form-item :label="t('productCategory.statusLabel')">
          <el-radio-group v-model="formData.status">
            <el-radio :value="true">
              {{ t("common.enable") }}
            </el-radio>
            <el-radio :value="false">
              {{ t("common.disable") }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">
          {{ t("common.cancel") }}
        </el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          {{ t("common.confirm") }}
        </el-button>
      </template>
    </el-dialog>
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
