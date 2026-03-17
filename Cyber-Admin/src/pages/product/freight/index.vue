<script lang="ts" setup>
import type { CreateOrUpdateFreightTemplateData, FreightTemplateData, FreightTemplateRequestData } from "@@/apis/freight-templates/type"
import type { ProTableColumn, ProTableEnumItem, ProTableExpose } from "@@/components/ProTable/type"
import {
  createFreightTemplateApi,
  deleteFreightTemplateApi,
  getFreightTemplateListApi,
  updateFreightTemplateApi
} from "@@/apis/freight-templates"
import ProTable from "@@/components/ProTable/index.vue"
import { CirclePlus, Delete } from "@element-plus/icons-vue"

defineOptions({ name: "FreightTemplateIndex" })

const { t } = useI18n()

const tableRef = useTemplateRef<ProTableExpose>("tableRef")

// ─── Status enum ─────────────────────────────────────────────────────────────

const statusEnum: ProTableEnumItem[] = [
  { label: t("common.enable"), value: true, tagType: "success" },
  { label: t("common.disable"), value: false, tagType: "danger" }
]

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns = computed<ProTableColumn<FreightTemplateData>[]>(() => [
  { field: "id", title: t("freightTemplate.id"), width: 70, align: "center" },
  {
    field: "name",
    title: t("freightTemplate.templateName"),
    minWidth: 160,
    search: { el: "input" }
  },
  {
    field: "type",
    title: t("freightTemplate.type"),
    width: 110,
    align: "center",
    slots: { default: "type" }
  },
  {
    field: "basePrice",
    title: t("freightTemplate.basePrice"),
    width: 140,
    align: "right",
    slots: { default: "basePrice" }
  },
  {
    field: "freeThreshold",
    title: t("freightTemplate.freeThreshold"),
    width: 150,
    align: "right",
    slots: { default: "freeThreshold" }
  },
  {
    field: "status",
    title: t("common.status"),
    width: 80,
    align: "center",
    tag: true,
    enum: statusEnum,
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
    width: 150,
    align: "center",
    fixed: "right",
    slots: { default: "action" }
  }
])

// ─── Dialog form state ────────────────────────────────────────────────────────

const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)

interface RuleItem {
  province: string
  addPrice: number
}

const formData = ref<CreateOrUpdateFreightTemplateData>({
  name: "",
  type: 0,
  basePrice: 0,
  freeThreshold: null,
  rules: "[]",
  excludedRegions: "[]",
  status: true
})

// Parsed form helpers
const ruleItems = ref<RuleItem[]>([])
const excludedItems = ref<string[]>([])

function syncToForm() {
  formData.value.rules = JSON.stringify(ruleItems.value)
  formData.value.excludedRegions = JSON.stringify(excludedItems.value)
}

// ─── Open dialog ──────────────────────────────────────────────────────────────

function openCreate() {
  isEdit.value = false
  formData.value = { name: "", type: 0, basePrice: 0, freeThreshold: null, rules: "[]", excludedRegions: "[]", status: true }
  ruleItems.value = []
  excludedItems.value = []
  dialogVisible.value = true
}

function openEdit(row: FreightTemplateData) {
  isEdit.value = true
  formData.value = {
    id: row.id,
    name: row.name,
    type: row.type,
    basePrice: row.basePrice,
    freeThreshold: row.freeThreshold,
    rules: row.rules,
    excludedRegions: row.excludedRegions,
    status: row.status
  }
  try {
    ruleItems.value = JSON.parse(row.rules || "[]")
  } catch {
    ruleItems.value = []
  }
  try {
    excludedItems.value = JSON.parse(row.excludedRegions || "[]")
  } catch {
    excludedItems.value = []
  }
  dialogVisible.value = true
}

// ─── Rules management ─────────────────────────────────────────────────────────

function addRule() {
  ruleItems.value.push({ province: "", addPrice: 0 })
}

function removeRule(idx: number) {
  ruleItems.value.splice(idx, 1)
}

const newRegion = ref("")

function addRegion() {
  const val = newRegion.value.trim()
  if (val && !excludedItems.value.includes(val)) {
    excludedItems.value.push(val)
  }
  newRegion.value = ""
}

function removeRegion(idx: number) {
  excludedItems.value.splice(idx, 1)
}

// ─── Save ─────────────────────────────────────────────────────────────────────

async function handleSave() {
  if (!formData.value.name?.trim()) {
    ElMessage.warning(t("freightTemplate.nameRequired"))
    return
  }
  // Sync parsed arrays back to JSON strings
  syncToForm()

  saving.value = true
  try {
    if (isEdit.value) {
      await updateFreightTemplateApi(formData.value)
    } else {
      await createFreightTemplateApi(formData.value)
    }
    ElMessage.success(t("common.operateSuccess"))
    dialogVisible.value = false
    tableRef.value?.refresh()
  } finally {
    saving.value = false
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

function handleDelete(row: FreightTemplateData) {
  ElMessageBox.confirm(
    t("freightTemplate.confirmDelete", { name: row.name }),
    t("common.tip"),
    {
      confirmButtonText: t("common.confirm"),
      cancelButtonText: t("common.cancel"),
      type: "warning"
    }
  ).then(() => {
    deleteFreightTemplateApi(row.id).then(() => {
      ElMessage.success(t("common.deleteSuccess"))
      tableRef.value?.refresh()
    })
  })
}

// ─── Table request adapter ────────────────────────────────────────────────────

function requestApi(params: FreightTemplateRequestData) {
  return getFreightTemplateListApi(params)
}
</script>

<template>
  <div class="app-container">
    <ProTable ref="tableRef" :columns="columns" :request-api="requestApi">
      <template #toolbar>
        <el-button type="primary" :icon="CirclePlus" @click="openCreate">
          {{ t("freightTemplate.addBtn") }}
        </el-button>
        <el-button type="danger" :icon="Delete" disabled>
          {{ t("common.batchDelete") }}
        </el-button>
      </template>

      <template #type>
        <el-tag type="info">
          {{ t("freightTemplate.typeFixed") }}
        </el-tag>
      </template>

      <template #basePrice="{ row }">
        <span>¥{{ Number(row.basePrice).toFixed(2) }}</span>
      </template>

      <template #freeThreshold="{ row }">
        <span v-if="row.freeThreshold != null">¥{{ Number(row.freeThreshold).toFixed(2) }}</span>
        <span v-else class="text-gray-400">—</span>
      </template>

      <template #action="{ row }">
        <el-button type="primary" text bg size="small" @click="openEdit(row)">
          {{ t("common.edit") }}
        </el-button>
        <el-button type="danger" text bg size="small" @click="handleDelete(row)">
          {{ t("common.delete") }}
        </el-button>
      </template>
    </ProTable>

    <!-- Create / Edit dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? t('freightTemplate.editTitle') : t('freightTemplate.addTitle')"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form label-width="130px" :model="formData">
        <!-- Name -->
        <el-form-item :label="t('freightTemplate.templateNameLabel')" required>
          <el-input v-model="formData.name" :placeholder="t('freightTemplate.templateNamePlaceholder')" />
        </el-form-item>

        <!-- Type (fixed only for now) -->
        <el-form-item :label="t('freightTemplate.typeLabel')">
          <el-tag type="info">
            {{ t("freightTemplate.typeFixed") }}
          </el-tag>
        </el-form-item>

        <!-- Base price -->
        <el-form-item :label="t('freightTemplate.basePriceLabel')" required>
          <el-input-number v-model="formData.basePrice" :min="0" :precision="2" controls-position="right" style="width: 200px" />
        </el-form-item>

        <!-- Free threshold -->
        <el-form-item :label="t('freightTemplate.freeThresholdLabel')">
          <el-input-number
            v-model="(formData as any).freeThreshold"
            :min="0"
            :precision="2"
            controls-position="right"
            :placeholder="t('freightTemplate.freeThresholdPlaceholder')"
            style="width: 200px"
          />
        </el-form-item>

        <!-- Status -->
        <el-form-item :label="t('common.status')">
          <el-radio-group v-model="formData.status">
            <el-radio :value="true">
              {{ t("common.enable") }}
            </el-radio>
            <el-radio :value="false">
              {{ t("common.disable") }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- Regional surcharge rules -->
        <el-form-item :label="t('freightTemplate.rulesLabel')">
          <div class="w-full flex flex-col gap-2">
            <div
              v-for="(rule, idx) in ruleItems"
              :key="idx"
              class="flex items-center gap-2"
            >
              <el-input
                v-model="rule.province"
                :placeholder="t('freightTemplate.ruleProvincePlaceholder')"
                style="width: 160px"
              />
              <el-input-number
                v-model="rule.addPrice"
                :min="0"
                :precision="2"
                controls-position="right"
                :placeholder="t('freightTemplate.ruleAddPrice')"
                style="width: 150px"
              />
              <el-button type="danger" text size="small" @click="removeRule(idx)">
                {{ t("common.delete") }}
              </el-button>
            </div>
            <el-button type="primary" plain size="small" @click="addRule">
              {{ t("freightTemplate.addRuleBtn") }}
            </el-button>
          </div>
        </el-form-item>

        <!-- Excluded regions -->
        <el-form-item :label="t('freightTemplate.excludedRegionsLabel')">
          <div class="w-full flex flex-col gap-2">
            <div class="flex flex-wrap gap-1">
              <el-tag
                v-for="(region, idx) in excludedItems"
                :key="idx"
                closable
                @close="removeRegion(idx)"
              >
                {{ region }}
              </el-tag>
            </div>
            <div class="flex gap-2">
              <el-input
                v-model="newRegion"
                :placeholder="t('freightTemplate.regionPlaceholder')"
                style="width: 200px"
                @keydown.enter.prevent="addRegion"
              />
              <el-button @click="addRegion">
                {{ t("freightTemplate.addRegionBtn") }}
              </el-button>
            </div>
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
  </div>
</template>
