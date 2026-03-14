<script lang="ts" setup>
import type { CreateOrUpdateMenuRequestData, MenuData } from "@@/apis/menus/type"
import type { ProDialogExpose, ProTableColumn } from "@@/components/ProTable/type"
import { createMenuApi, deleteMenuApi, getMenuListApi, updateMenuApi } from "@@/apis/menus"
import { MenuTypeEnum } from "@@/apis/menus/type"
import IconPicker from "@@/components/IconPicker/index.vue"
import ProTable from "@@/components/ProTable/index.vue"
import ProDialog from "@@/components/ProTable/ProDialog.vue"
import { CirclePlus, Refresh, Search } from "@element-plus/icons-vue"
import { cloneDeep } from "lodash-es"

defineOptions({
  name: "MenuManagement"
})

const { t } = useI18n()

const dialogRef = useTemplateRef<ProDialogExpose>("dialogRef")

const menuData = ref<MenuData[]>([])
const loading = ref(false)
const searchName = ref("")
const searchStatus = ref<boolean | "">("")

const DEFAULT_FORM: CreateOrUpdateMenuRequestData = {
  parentId: 0,
  name: "",
  type: MenuTypeEnum.CATALOG,
  path: "",
  component: "",
  permission: "",
  icon: "",
  sort: 0,
  status: true,
  visible: true
}

const columns = computed<ProTableColumn<MenuData>[]>(() => [
  { field: "name", title: t("sysMenu.menuName"), minWidth: 180, treeNode: true },
  { field: "icon", title: t("sysMenu.iconLabel"), width: 80, align: "center", slots: { default: "icon" } },
  { field: "type", title: t("sysMenu.type"), width: 80, align: "center", slots: { default: "type" } },
  { field: "sort", title: t("common.sort"), width: 80, align: "center" },
  { field: "path", title: t("sysMenu.path"), minWidth: 140 },
  { field: "component", title: t("sysMenu.component"), minWidth: 160 },
  { field: "permission", title: t("sysMenu.permission"), minWidth: 160 },
  { field: "status", title: t("common.status"), width: 80, align: "center", slots: { default: "status" } },
  { field: "visible", title: t("sysMenu.visible"), width: 80, align: "center", slots: { default: "visible" } },
  { field: "createTime", title: t("common.createTime"), width: 160, align: "center" },
  { field: "action", title: t("common.operate"), width: 200, align: "center", fixed: "right", slots: { default: "action" } }
])

async function loadData() {
  loading.value = true
  try {
    const res = await getMenuListApi({
      name: searchName.value || undefined,
      status: searchStatus.value === "" ? undefined : searchStatus.value
    })
    menuData.value = res.data
  } catch {
    menuData.value = []
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  searchName.value = ""
  searchStatus.value = ""
  loadData()
}

function openCreate() {
  dialogRef.value?.open(undefined, cloneDeep(DEFAULT_FORM) as unknown as Record<string, unknown>)
}

function openEdit(row: MenuData) {
  dialogRef.value?.open(row as unknown as Record<string, unknown>)
}

function openAddChild(row: MenuData) {
  const defaults = cloneDeep(DEFAULT_FORM)
  defaults.parentId = row.id
  defaults.type = row.type === MenuTypeEnum.CATALOG ? MenuTypeEnum.MENU : MenuTypeEnum.BUTTON
  dialogRef.value?.open(undefined, defaults as unknown as Record<string, unknown>)
}

async function handleConfirm(formData: Record<string, unknown>, isEdit: boolean) {
  try {
    const api = isEdit ? updateMenuApi : createMenuApi
    await api(formData as unknown as CreateOrUpdateMenuRequestData)
    ElMessage.success(t("common.operateSuccess"))
    dialogRef.value?.close()
    loadData()
  } finally {
    dialogRef.value?.endLoading()
  }
}

function handleDelete(row: MenuData) {
  ElMessageBox.confirm(t("sysMenu.confirmDelete", { name: row.name }), t("common.tip"), {
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel"),
    type: "warning"
  }).then(() => {
    deleteMenuApi(row.id).then(() => {
      ElMessage.success(t("common.deleteSuccess"))
      loadData()
    })
  })
}

function getMenuTypeName(type: MenuTypeEnum): string {
  const map: Record<MenuTypeEnum, string> = {
    [MenuTypeEnum.CATALOG]: t("sysMenu.typeCatalog"),
    [MenuTypeEnum.MENU]: t("sysMenu.typeMenu"),
    [MenuTypeEnum.BUTTON]: t("sysMenu.typeButton")
  }
  return map[type] ?? t("sysMenu.typeUnknown")
}

function getMenuTypeTag(type: MenuTypeEnum): "primary" | "success" | "warning" {
  const map: Record<MenuTypeEnum, "primary" | "success" | "warning"> = {
    [MenuTypeEnum.CATALOG]: "primary",
    [MenuTypeEnum.MENU]: "success",
    [MenuTypeEnum.BUTTON]: "warning"
  }
  return map[type] ?? "primary"
}

loadData()
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form :inline="true">
        <el-form-item :label="t('sysMenu.menuName')">
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
      :data="menuData"
      :pagination="false"
      :searchable="false"
      :grid-props="{
        treeConfig: { childrenField: 'children', expandAll: false },
      }"
    >
      <template #toolbar>
        <el-button type="primary" :icon="CirclePlus" @click="openCreate">
          {{ t("sysMenu.addBtn") }}
        </el-button>
      </template>
      <template #icon="{ row }">
        <AppIcon v-if="row.icon" :icon="row.icon" style="font-size: 18px;" />
      </template>
      <template #type="{ row }">
        <el-tag :type="getMenuTypeTag(row.type)" effect="plain" disable-transitions>
          {{ getMenuTypeName(row.type) }}
        </el-tag>
      </template>
      <template #status="{ row }">
        <el-tag v-if="row.status" type="success" effect="plain" disable-transitions>
          {{ t("sysMenu.statusEnable") }}
        </el-tag>
        <el-tag v-else type="danger" effect="plain" disable-transitions>
          {{ t("sysMenu.statusDisable") }}
        </el-tag>
      </template>
      <template #visible="{ row }">
        <el-tag v-if="row.visible" type="success" effect="plain" disable-transitions>
          {{ t("sysMenu.visibleShow") }}
        </el-tag>
        <el-tag v-else type="info" effect="plain" disable-transitions>
          {{ t("sysMenu.visibleHide") }}
        </el-tag>
      </template>
      <template #action="{ row }">
        <el-button v-if="row.type !== MenuTypeEnum.BUTTON" type="primary" text bg size="small" @click="openAddChild(row)">
          {{ t("sysMenu.addChildBtn") }}
        </el-button>
        <el-button type="primary" text bg size="small" @click="openEdit(row)">
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
      :title="t('sysMenu.title')"
      width="600px"
      label-width="100px"
      @confirm="handleConfirm"
    >
      <template #form="{ formData }">
        <el-form-item prop="type" :label="t('sysMenu.menuType')">
          <el-radio-group v-model="formData.type">
            <el-radio-button :value="MenuTypeEnum.CATALOG">
              {{ t("sysMenu.typeCatalog") }}
            </el-radio-button>
            <el-radio-button :value="MenuTypeEnum.MENU">
              {{ t("sysMenu.typeMenu") }}
            </el-radio-button>
            <el-radio-button :value="MenuTypeEnum.BUTTON">
              {{ t("sysMenu.typeButton") }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="name" :label="t('sysMenu.menuName')">
          <el-input v-model="formData.name" :placeholder="t('common.placeholder')" clearable />
        </el-form-item>
        <el-form-item v-if="formData.type !== MenuTypeEnum.BUTTON" prop="icon" :label="t('sysMenu.iconLabel')">
          <IconPicker v-model="formData.icon as string" />
        </el-form-item>
        <el-form-item prop="sort" :label="t('sysMenu.sortLabel')">
          <el-input-number v-model="formData.sort" :min="0" :max="999" controls-position="right" />
        </el-form-item>
        <el-form-item v-if="formData.type !== MenuTypeEnum.BUTTON" prop="path" :label="t('sysMenu.pathLabel')">
          <el-input v-model="formData.path" :placeholder="t('common.placeholder')" clearable />
        </el-form-item>
        <el-form-item v-if="formData.type === MenuTypeEnum.MENU" prop="component" :label="t('sysMenu.componentLabel')">
          <el-input v-model="formData.component" :placeholder="t('common.placeholder')" clearable />
        </el-form-item>
        <el-form-item v-if="formData.type === MenuTypeEnum.BUTTON" prop="permission" :label="t('sysMenu.permissionLabel')">
          <el-input v-model="formData.permission" :placeholder="t('sysMenu.permissionPlaceholder')" clearable />
        </el-form-item>
        <el-form-item prop="status" :label="t('sysMenu.statusLabel')">
          <el-radio-group v-model="formData.status">
            <el-radio :value="true">
              {{ t("sysMenu.statusEnable") }}
            </el-radio>
            <el-radio :value="false">
              {{ t("sysMenu.statusDisable") }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="visible" :label="t('sysMenu.visibleLabel')">
          <el-radio-group v-model="formData.visible">
            <el-radio :value="true">
              {{ t("sysMenu.visibleShow") }}
            </el-radio>
            <el-radio :value="false">
              {{ t("sysMenu.visibleHide") }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </template>
    </ProDialog>
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
