<script lang="ts" setup>
import type { CategorySimple } from "@@/apis/categories/type"
import type { CreateOrUpdateProductData, ProductData, ProductSku } from "@@/apis/products/type"
import type { ProTableColumn, ProTableEnumItem, ProTableExpose } from "@@/components/ProTable/type"
import type { CascaderValue } from "element-plus"
import { getAllCategoriesApi } from "@@/apis/categories"
import { getAllFreightTemplatesApi } from "@@/apis/freight-templates"
import { createProductApi, deleteProductApi, getLowStockApi, getProductListApi, toggleProductStatusApi, updateProductApi, updateSkuStockApi } from "@@/apis/products"
import ProTable from "@@/components/ProTable/index.vue"
import { CirclePlus, Delete, Plus } from "@element-plus/icons-vue"

defineOptions({ name: "ProductIndex" })

const { t } = useI18n()

const tableRef = useTemplateRef<ProTableExpose>("tableRef")

const categoryTree = ref<CategorySimple[]>([])
const freightTemplateOptions = ref<Array<{ id: number, name: string }>>([])

async function loadCategories() {
  try {
    const res = await getAllCategoriesApi()
    categoryTree.value = res.data
  } catch {
    categoryTree.value = []
  }
}

async function loadFreightTemplates() {
  try {
    const res = await getAllFreightTemplatesApi()
    freightTemplateOptions.value = res.data
  } catch {
    freightTemplateOptions.value = []
  }
}

loadCategories()
loadFreightTemplates()

const cascaderOptions = computed(() => {
  return categoryTree.value.map((root) => {
    const hasChildren = root.children && root.children.length > 0
    return {
      value: root.id,
      label: root.name,
      children: hasChildren
        ? root.children!.map(child => ({ value: child.id, label: child.name }))
        : undefined,
      leaf: !hasChildren
    }
  })
})

function getCascaderValue(categoryId: number | null | undefined): number[] {
  if (!categoryId) return []
  for (const root of categoryTree.value) {
    if (root.children && root.children.length > 0) {
      const child = root.children.find(c => c.id === categoryId)
      if (child) return [root.id, child.id]
    }
    if (root.id === categoryId) return [root.id]
  }
  return []
}

const statusEnum = computed<ProTableEnumItem[]>(() => [
  { label: t("product.statusOn"), value: true, tagType: "success" },
  { label: t("product.statusOff"), value: false, tagType: "danger" }
])

const columns = computed<ProTableColumn<ProductData>[]>(() => [
  { field: "id", title: "ID", width: 70, align: "center" },
  {
    field: "name",
    title: t("product.productName"),
    minWidth: 160,
    search: { el: "input" }
  },
  {
    field: "categoryId",
    title: t("product.category"),
    width: 140,
    slots: { default: "category" },
    search: { el: "select" },
    enum: async () => {
      const res = await getAllCategoriesApi()
      const result: { label: string, value: number }[] = []
      for (const root of res.data) {
        if (root.children && root.children.length > 0) {
          for (const child of root.children) {
            result.push({ label: `${root.name} / ${child.name}`, value: child.id })
          }
        } else {
          result.push({ label: root.name, value: root.id })
        }
      }
      return result
    }
  },
  {
    field: "images",
    title: t("product.images"),
    width: 90,
    align: "center",
    slots: { default: "images" }
  },
  {
    field: "skus",
    title: t("product.skus"),
    minWidth: 200,
    slots: { default: "skus" }
  },
  {
    field: "description",
    title: t("product.description"),
    minWidth: 160,
    slots: { default: "description" }
  },
  {
    field: "status",
    title: t("common.status"),
    width: 90,
    align: "center",
    slots: { default: "status" },
    enum: statusEnum.value,
    search: { el: "select" }
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
    width: 210,
    align: "center",
    fixed: "right",
    slots: { default: "action" }
  }
])

const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)

const formData = ref<CreateOrUpdateProductData>({
  name: "",
  categoryId: null,
  images: [],
  description: "",
  status: true,
  skus: [],
  freightTemplateId: null
})

const cascaderValue = ref<number[]>([])

function onCascaderChange(val: CascaderValue | null | undefined) {
  const path = Array.isArray(val) ? (val as number[]) : []
  formData.value.categoryId = path.length > 0 ? path.at(-1) ?? null : null
}

const imageInput = ref("")

function openCreate() {
  isEdit.value = false
  formData.value = { name: "", categoryId: null, images: [], description: "", status: true, skus: [], freightTemplateId: null }
  cascaderValue.value = []
  imageInput.value = ""
  specGroups.value = []
  specInputValues.value = []
  dialogVisible.value = true
}

function openEdit(row: ProductData) {
  isEdit.value = true
  formData.value = {
    id: row.id,
    name: row.name,
    categoryId: row.categoryId,
    images: [...row.images],
    description: row.description ?? "",
    status: row.status,
    skus: row.skus.map(s => ({ ...s })),
    freightTemplateId: row.freightTemplateId ?? null
  }
  cascaderValue.value = getCascaderValue(row.categoryId)
  imageInput.value = ""

  const parsedGroups: { name: string, values: string[] }[] = []
  if (row.skus && row.skus.length > 0) {
    try {
      const firstParsed = JSON.parse(row.skus[0].name)
      if (Array.isArray(firstParsed) && firstParsed.length > 0 && typeof firstParsed[0] === "object") {
        const dimensions = firstParsed.length
        for (let i = 0; i < dimensions; i++) {
          const groupName = Object.keys(firstParsed[i])[0] ?? `规格${i + 1}`
          parsedGroups.push({ name: groupName, values: [] })
        }
        row.skus.forEach((sku) => {
          try {
            const parts: Record<string, string>[] = JSON.parse(sku.name)
            parts.forEach((item, i) => {
              const val = Object.values(item)[0] ?? ""
              if (i < parsedGroups.length && !parsedGroups[i].values.includes(val)) {
                parsedGroups[i].values.push(val)
              }
            })
          } catch {}
        })
      } else {
        const dimensions = firstParsed.length
        for (let i = 0; i < dimensions; i++) {
          parsedGroups.push({ name: `规格${i + 1}`, values: [] })
        }
        row.skus.forEach((sku) => {
          const parts = parseSkuName(sku.name)
          parts.forEach((part, i) => {
            if (i < parsedGroups.length && !parsedGroups[i].values.includes(part)) {
              parsedGroups[i].values.push(part)
            }
          })
        })
      }
    } catch {}
  }
  specGroups.value = parsedGroups
  specInputValues.value = parsedGroups.map(() => "")

  dialogVisible.value = true
}

function addImage() {
  const url = imageInput.value.trim()
  if (!url) return
  formData.value.images = [...(formData.value.images ?? []), url]
  imageInput.value = ""
}

function removeImage(idx: number) {
  formData.value.images = (formData.value.images ?? []).filter((_, i) => i !== idx)
}

const specGroups = ref<Array<{ name: string, values: string[] }>>([])
const specInputValues = ref<string[]>([])

function parseSkuName(name: string): string[] {
  try {
    const parsed = JSON.parse(name)
    if (Array.isArray(parsed)) {
      if (parsed.length > 0 && typeof parsed[0] === "object" && parsed[0] !== null) {
        return parsed.map((item: Record<string, string>) => Object.values(item)[0] ?? "")
      }
      return parsed.map(String)
    }
  } catch {}
  return [name]
}

function addSpecGroup() {
  specGroups.value.push({ name: "", values: [] })
  specInputValues.value.push("")
}

function removeSpecGroup(idx: number) {
  specGroups.value.splice(idx, 1)
  specInputValues.value.splice(idx, 1)
}

function addSpecValue(idx: number) {
  const val = specInputValues.value[idx]?.trim()
  if (val && !specGroups.value[idx].values.includes(val)) {
    specGroups.value[idx].values.push(val)
  }
  specInputValues.value[idx] = ""
}

function removeSpecValue(groupIdx: number, valueIdx: number) {
  specGroups.value[groupIdx].values.splice(valueIdx, 1)
}

function cartesianProduct(arrays: string[][]): string[][] {
  if (arrays.length === 0) return []
  return arrays.reduce((acc, curr) => {
    if (curr.length === 0) return acc
    if (acc.length === 0) return curr.map(item => [item])
    const res: string[][] = []
    acc.forEach((a) => {
      curr.forEach((b) => {
        res.push([...a, b])
      })
    })
    return res
  }, [] as string[][])
}

watch(
  specGroups,
  (newGroups) => {
    const validGroups = newGroups.filter(g => g.name.trim() && g.values.length > 0)

    if (validGroups.length === 0) {
      formData.value.skus = []
      return
    }

    const valueArrays = validGroups.map(g => g.values)
    const combinations = cartesianProduct(valueArrays)

    const existingSkusMap = new Map((formData.value.skus || []).map(sku => [sku.name, sku]))

    const newSkus: ProductSku[] = combinations.map((combo) => {
      const nameObj = combo.map((val, i) => ({ [validGroups[i].name]: val }))
      const name = JSON.stringify(nameObj)
      const existing = existingSkusMap.get(name)
      if (existing) {
        return existing
      }
      return {
        name,
        price: 0,
        stock: 0,
        status: true
      }
    })

    formData.value.skus = newSkus
  },
  { deep: true }
)

async function handleSave() {
  if (!formData.value.name?.trim()) {
    ElMessage.warning(t("product.nameRequired"))
    return
  }
  if (!formData.value.categoryId) {
    ElMessage.warning(t("product.categoryRequired"))
    return
  }
  if (specGroups.value.length === 0) {
    ElMessage.warning(t("product.specRequired"))
    return
  }
  for (const g of specGroups.value) {
    if (!g.name.trim()) {
      ElMessage.warning(t("product.specNameEmpty"))
      return
    }
    if (g.values.length === 0) {
      ElMessage.warning(t("product.specValueEmpty", { name: g.name }))
      return
    }
  }

  const skus = formData.value.skus ?? []
  if (skus.length === 0) {
    ElMessage.warning(t("product.skuRequired"))
    return
  }
  for (const sku of skus) {
    if (sku.price < 0) {
      ElMessage.warning(t("product.skuPriceNegative"))
      return
    }
  }

  saving.value = true
  try {
    if (isEdit.value) {
      await updateProductApi(formData.value)
    } else {
      await createProductApi(formData.value)
    }
    ElMessage.success(t("common.operateSuccess"))
    dialogVisible.value = false
    tableRef.value?.refresh()
  } finally {
    saving.value = false
  }
}

async function handleToggleStatus(row: ProductData) {
  const newStatus = !row.status
  const prev = row.status
  row.status = newStatus
  try {
    await toggleProductStatusApi(row.id, newStatus)
    ElMessage.success(t("common.operateSuccess"))
  } catch {
    row.status = prev
  }
}

const inventoryDialogVisible = ref(false)
const inventoryProduct = ref<ProductData | null>(null)
const inventoryStockMap = ref<Record<number, number>>({})
const inventorySaving = ref<Record<number, boolean>>({})

const lowStockCount = ref(0)
const lowStockThreshold = ref(10)

async function loadLowStockCount() {
  try {
    const res = await getLowStockApi(lowStockThreshold.value)
    lowStockCount.value = res.data?.length ?? 0
  } catch {
    lowStockCount.value = 0
  }
}

loadLowStockCount()

function openInventory(row: ProductData) {
  inventoryProduct.value = row
  inventoryStockMap.value = Object.fromEntries(row.skus.map(s => [s.id!, s.stock]))
  inventoryDialogVisible.value = true
}

async function saveSkuStock(skuId: number) {
  inventorySaving.value[skuId] = true
  try {
    await updateSkuStockApi(skuId, inventoryStockMap.value[skuId] ?? 0)
    ElMessage.success(t("product.inventorySaveSuccess"))
    tableRef.value?.refresh()
    loadLowStockCount()
  } finally {
    inventorySaving.value[skuId] = false
  }
}

function handleDelete(row: ProductData) {
  ElMessageBox.confirm(t("product.confirmDelete", { name: row.name }), t("common.tip"), {
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel"),
    type: "warning"
  }).then(() => {
    deleteProductApi(row.id).then(() => {
      ElMessage.success(t("common.deleteSuccess"))
      tableRef.value?.refresh()
    })
  })
}
</script>

<template>
  <div class="app-container">
    <ProTable ref="tableRef" :columns="columns" :request-api="getProductListApi">
      <template #toolbar>
        <el-button type="primary" :icon="CirclePlus" @click="openCreate">
          {{ t("product.addBtn") }}
        </el-button>
        <el-button type="danger" :icon="Delete" disabled>
          {{ t("common.batchDelete") }}
        </el-button>
        <el-badge v-if="lowStockCount > 0" :value="lowStockCount" type="danger">
          <el-button type="warning" plain>
            {{ t("product.inventoryLowStockBadge", { n: lowStockCount }) }}
          </el-button>
        </el-badge>
      </template>

      <template #category="{ row }">
        <span v-if="row.categoryName">{{ row.categoryName }}</span>
        <span v-else class="text-gray-400">—</span>
      </template>

      <template #images="{ row }">
        <el-image
          v-if="row.images.length > 0"
          :src="row.images[0]"
          :preview-src-list="row.images"
          fit="cover"
          style="width: 50px; height: 50px; border-radius: 4px;"
          preview-teleported
        />
        <span v-else>—</span>
      </template>

      <template #skus="{ row }">
        <div v-if="row.skus.length > 0" class="flex flex-wrap gap-1">
          <el-tag
            v-for="sku in row.skus.slice(0, 3)"
            :key="sku.id"
            size="small"
            :type="sku.status ? undefined : 'info'"
          >
            {{ parseSkuName(sku.name).join(' / ') }} ¥{{ sku.price }}
          </el-tag>
          <el-tag v-if="row.skus.length > 3" size="small" type="info">
            +{{ row.skus.length - 3 }}
          </el-tag>
        </div>
        <span v-else>—</span>
      </template>

      <template #description="{ row }">
        <span :title="row.description ?? ''">
          {{ row.description ? (row.description.length > 20 ? `${row.description.slice(0, 20)}…` : row.description) : "—" }}
        </span>
      </template>

      <template #status="{ row }">
        <el-switch
          :model-value="row.status"
          :active-text="t('product.statusOn')"
          :inactive-text="t('product.statusOff')"
          inline-prompt
          @change="handleToggleStatus(row)"
        />
      </template>

      <template #action="{ row }">
        <el-button type="primary" text bg size="small" @click="openEdit(row)">
          {{ t("common.edit") }}
        </el-button>
        <el-button type="success" text bg size="small" @click="openInventory(row)">
          {{ t("product.inventoryBtn") }}
        </el-button>
        <el-button type="danger" text bg size="small" @click="handleDelete(row)">
          {{ t("common.delete") }}
        </el-button>
      </template>
    </ProTable>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? t('product.editTitle') : t('product.addTitle')"
      width="620px"
      :close-on-click-modal="false"
    >
      <el-form label-width="80px" :model="formData">
        <el-form-item :label="t('product.productNameLabel')" required>
          <el-input v-model="formData.name" :placeholder="t('product.productNamePlaceholder')" />
        </el-form-item>

        <el-form-item :label="t('product.categoryLabel')" required>
          <el-cascader
            v-model="cascaderValue"
            :options="cascaderOptions"
            :props="{ checkStrictly: false, emitPath: true }"
            :placeholder="t('product.categoryPlaceholder')"
            clearable
            style="width: 100%"
            @change="onCascaderChange"
          />
        </el-form-item>

        <el-form-item :label="t('product.statusLabel')">
          <el-radio-group v-model="formData.status">
            <el-radio :value="true">
              {{ t("product.statusOn") }}
            </el-radio>
            <el-radio :value="false">
              {{ t("product.statusOff") }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="t('product.imagesLabel')">
          <div class="w-full">
            <div class="mb-2 flex flex-wrap gap-2">
              <div
                v-for="(img, idx) in formData.images"
                :key="idx"
                class="relative"
              >
                <el-image
                  :src="img"
                  fit="cover"
                  style="width: 64px; height: 64px; border-radius: 4px;"
                />
                <span
                  class="absolute right-0 top-0 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-red-500 text-xs text-white leading-none"
                  @click="removeImage(idx)"
                >×</span>
              </div>
            </div>
            <div class="flex gap-2">
              <el-input v-model="imageInput" :placeholder="t('product.imageUrlPlaceholder')" class="flex-1" @keydown.enter.prevent="addImage" />
              <el-button :icon="Plus" @click="addImage">
                {{ t("product.imageAddBtn") }}
              </el-button>
            </div>
          </div>
        </el-form-item>

        <el-form-item :label="t('product.descriptionLabel')">
          <el-input v-model="formData.description" type="textarea" :rows="3" :placeholder="t('product.descriptionPlaceholder')" />
        </el-form-item>

        <el-form-item :label="t('product.freightTemplateLabel')">
          <el-select
            v-model="formData.freightTemplateId"
            :placeholder="t('product.freightTemplatePlaceholder')"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="tpl in freightTemplateOptions"
              :key="tpl.id"
              :label="tpl.name"
              :value="tpl.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('product.specLabel')" required>
          <div class="w-full flex flex-col gap-3">
            <div
              v-for="(group, idx) in specGroups"
              :key="idx"
              class="rounded border border-gray-200 bg-gray-50 p-3"
            >
              <div class="mb-2 flex items-center justify-between">
                <el-input v-model="group.name" :placeholder="t('product.specGroupPlaceholder')" style="width: 200px" />
                <el-button type="danger" text :icon="Delete" @click="removeSpecGroup(idx)">
                  {{ t("product.deleteSpecGroup") }}
                </el-button>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <el-tag
                  v-for="(val, vIdx) in group.values"
                  :key="vIdx"
                  closable
                  @close="removeSpecValue(idx, vIdx)"
                >
                  {{ val }}
                </el-tag>
                <el-input
                  v-model="specInputValues[idx]"
                  class="w-24!"
                  size="small"
                  :placeholder="t('product.addSpecValue')"
                  @keydown.enter.prevent="addSpecValue(idx)"
                  @blur="addSpecValue(idx)"
                />
              </div>
            </div>
            <div>
              <el-button type="primary" plain :icon="Plus" @click="addSpecGroup">
                {{ t("product.addSpecGroup") }}
              </el-button>
            </div>
          </div>
        </el-form-item>

        <el-form-item v-if="specGroups.length > 0" :label="t('product.skuTable')">
          <template v-if="formData.skus && formData.skus.length > 0">
            <el-table :data="formData.skus" border style="width: 100%" size="small">
              <el-table-column :label="t('product.skuCombo')" min-width="150">
                <template #default="{ row: skuRow }">
                  {{ parseSkuName(skuRow.name).join(' / ') }}
                </template>
              </el-table-column>
              <el-table-column :label="t('product.skuPrice')" width="120">
                <template #default="{ row }">
                  <el-input-number v-model="row.price" :min="0" :precision="2" controls-position="right" class="w-full!" />
                </template>
              </el-table-column>
              <el-table-column :label="t('product.skuStock')" width="120">
                <template #default="{ row }">
                  <el-input-number v-model="row.stock" :min="0" controls-position="right" class="w-full!" />
                </template>
              </el-table-column>
              <el-table-column :label="t('product.skuStatus')" width="80" align="center">
                <template #default="{ row }">
                  <el-switch v-model="row.status" />
                </template>
              </el-table-column>
            </el-table>
          </template>
          <div v-else class="text-sm text-gray-400">
            {{ t("product.skuEmpty") }}
          </div>
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

    <el-dialog
      v-model="inventoryDialogVisible"
      :title="inventoryProduct ? t('product.inventoryTitle', { name: inventoryProduct.name }) : ''"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-table v-if="inventoryProduct" :data="inventoryProduct.skus" border size="small">
        <el-table-column :label="t('product.inventorySkuName')" min-width="150">
          <template #default="{ row: skuRow }">
            {{ parseSkuName(skuRow.name).join(' / ') }}
          </template>
        </el-table-column>
        <el-table-column :label="t('product.inventoryCurrentStock')" width="140">
          <template #default="{ row: skuRow }">
            <el-input-number
              v-model="inventoryStockMap[skuRow.id]"
              :min="0"
              controls-position="right"
              class="w-full!"
              size="small"
            />
          </template>
        </el-table-column>
        <el-table-column :label="t('product.inventoryUpdate')" width="80" align="center">
          <template #default="{ row: skuRow }">
            <el-button
              type="primary"
              size="small"
              :loading="inventorySaving[skuRow.id]"
              @click="saveSkuStock(skuRow.id)"
            >
              {{ t("product.inventoryUpdate") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="inventoryDialogVisible = false">
          {{ t("common.cancel") }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
