<script lang="ts" setup>
import type { OrderData, OrderItem } from "@@/apis/orders/type"
import type { ProductSku } from "@@/apis/products/type"
import type { ProTableColumn, ProTableEnumItem, ProTableExpose } from "@@/components/ProTable/type"
import { getOrderListApi, shipOrderApi, updateOrderItemSkuApi, updateOrderStatusApi } from "@@/apis/orders"
import { getProductDetailApi } from "@@/apis/products"
import ProTable from "@@/components/ProTable/index.vue"

defineOptions({ name: "OrderIndex" })

const tableRef = useTemplateRef<ProTableExpose>("tableRef")

const { t } = useI18n()

const ORDER_STATUS_MAP: Record<number, { label: string, type: "info" | "warning" | "primary" | "success" | "danger" }> = {
  0: { label: "待付款", type: "warning" },
  1: { label: "待发货", type: "primary" },
  2: { label: "待收货", type: "info" },
  3: { label: "已完成", type: "success" },
  4: { label: "已取消", type: "danger" }
}

const statusEnum: ProTableEnumItem[] = Object.entries(ORDER_STATUS_MAP).map(([value, { label, type }]) => ({
  label,
  value: Number(value),
  tagType: type
}))

const columns: ProTableColumn<OrderData>[] = [
  {
    field: "id",
    title: "ID",
    width: 70,
    align: "center"
  },
  {
    field: "orderNo",
    title: "订单号",
    minWidth: 180,
    search: { el: "input" }
  },
  {
    field: "user",
    title: "用户",
    width: 130,
    slots: { default: "user" }
  },
  {
    field: "totalAmount",
    title: "总金额（元）",
    width: 130,
    align: "right",
    slots: { default: "totalAmount" }
  },
  {
    field: "status",
    title: "状态",
    width: 100,
    align: "center",
    tag: true,
    enum: statusEnum,
    search: { el: "select" }
  },
  {
    field: "address",
    title: "收货地址",
    minWidth: 200,
    slots: { default: "address" }
  },
  {
    field: "items",
    title: "商品",
    minWidth: 200,
    slots: { default: "items" }
  },
  {
    field: "createTime",
    title: "下单时间",
    width: 160,
    align: "center"
  },
  {
    field: "action",
    title: "操作",
    width: 240,
    align: "center",
    fixed: "right",
    slots: { default: "action" }
  }
]

const statusChangeLoading = ref<Record<number, boolean>>({})

async function handleStatusChange(row: OrderData, newStatus: number) {
  statusChangeLoading.value[row.id] = true
  try {
    await updateOrderStatusApi({ id: row.id, status: newStatus })
    ElMessage.success("状态更新成功")
    tableRef.value?.refresh()
  } finally {
    statusChangeLoading.value[row.id] = false
  }
}

// ——— 换规格弹窗 ———
const changeSpecVisible = ref(false)
const changingItem = ref<OrderItem | null>(null)
const changeSpecSkus = ref<ProductSku[]>([])
const selectedSkuId = ref<number | undefined>(undefined)
const changeSpecLoading = ref(false)
const confirmLoading = ref(false)

async function openChangeSpec(item: OrderItem) {
  changingItem.value = item
  selectedSkuId.value = item.skuId ?? undefined
  changeSpecSkus.value = []
  changeSpecLoading.value = true
  changeSpecVisible.value = true
  try {
    const res = await getProductDetailApi(item.productId)
    changeSpecSkus.value = res.data?.skus ?? []
  } finally {
    changeSpecLoading.value = false
  }
}

async function handleChangeSpecConfirm() {
  if (!changingItem.value || selectedSkuId.value === undefined) return
  if (selectedSkuId.value === changingItem.value.skuId) {
    changeSpecVisible.value = false
    return
  }
  confirmLoading.value = true
  try {
    await updateOrderItemSkuApi(changingItem.value.id, selectedSkuId.value)
    ElMessage.success("换规格成功")
    changeSpecVisible.value = false
    tableRef.value?.refresh()
  } finally {
    confirmLoading.value = false
  }
}

// ——— 发货弹窗 ———
const shipDialogVisible = ref(false)
const shippingOrder = ref<OrderData | null>(null)
const shipForm = ref({ shippingCompany: "", shipmentNo: "" })
const shipLoading = ref(false)

function openShipDialog(row: OrderData) {
  shippingOrder.value = row
  shipForm.value = { shippingCompany: "", shipmentNo: "" }
  shipDialogVisible.value = true
}

async function handleShipConfirm() {
  if (!shippingOrder.value) return
  if (!shipForm.value.shippingCompany.trim()) {
    ElMessage.warning(t("order.shippingCompanyRequired"))
    return
  }
  if (!shipForm.value.shipmentNo.trim()) {
    ElMessage.warning(t("order.shipmentNoRequired"))
    return
  }
  shipLoading.value = true
  try {
    await shipOrderApi(shippingOrder.value.id, {
      shippingCompany: shipForm.value.shippingCompany.trim(),
      shipmentNo: shipForm.value.shipmentNo.trim()
    })
    ElMessage.success(t("order.shipSuccess"))
    shipDialogVisible.value = false
    tableRef.value?.refresh()
  } finally {
    shipLoading.value = false
  }
}

function parseSkuName(name?: string): string {
  if (!name) return "—"
  try {
    const parsed = JSON.parse(name)
    if (Array.isArray(parsed)) {
      if (parsed.length > 0 && typeof parsed[0] === "object" && parsed[0] !== null) {
        return parsed.map((item: Record<string, string>) => Object.values(item)[0] ?? "").join(" / ")
      }
      return parsed.map(String).join(" / ")
    }
  } catch {}
  return name
}
</script>

<template>
  <div class="app-container">
    <ProTable ref="tableRef" :columns="columns" :request-api="getOrderListApi">
      <template #user="{ row }">
        <div>
          <div>{{ row.user?.nickname || row.user?.phone }}</div>
          <div style="color: var(--el-text-color-secondary); font-size: 12px;">
            {{ row.user?.phone }}
          </div>
        </div>
      </template>
      <template #totalAmount="{ row }">
        <span style="color: var(--el-color-danger); font-weight: 600;">
          ¥{{ row.totalAmount.toFixed(2) }}
        </span>
      </template>
      <template #address="{ row }">
        <span :title="row.address">
          {{ row.address ? (row.address.length > 20 ? `${row.address.slice(0, 20)}…` : row.address) : "—" }}
        </span>
      </template>
      <template #items="{ row }">
        <div
          v-for="item in row.items.slice(0, 2)"
          :key="item.id"
          style="font-size: 12px; line-height: 1.8; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;"
        >
          <span>{{ item.product.name }} × {{ item.quantity }}</span>
          <span v-if="item.skuName" style="color: var(--el-text-color-secondary);">
            {{ parseSkuName(item.skuName) }}
          </span>
          <el-button
            type="primary"
            link
            size="small"
            style="padding: 0; font-size: 11px;"
            @click="openChangeSpec(item)"
          >
            换规格
          </el-button>
        </div>
        <div v-if="row.items.length > 2" style="color: var(--el-text-color-secondary); font-size: 12px;">
          +{{ row.items.length - 2 }} 件
        </div>
      </template>
      <template #action="{ row }">
        <el-button
          v-if="row.status === 1"
          type="primary"
          size="small"
          @click="openShipDialog(row)"
        >
          {{ t("order.shipBtn") }}
        </el-button>
        <el-select
          :model-value="row.status"
          size="small"
          style="width: 110px;"
          :loading="statusChangeLoading[row.id]"
          @change="(val: number) => handleStatusChange(row, val)"
        >
          <el-option
            v-for="s in statusEnum"
            :key="s.value as number"
            :label="s.label"
            :value="s.value as number"
          />
        </el-select>
      </template>
    </ProTable>

    <!-- 换规格弹窗 -->
    <el-dialog
      v-model="changeSpecVisible"
      title="换规格"
      width="420px"
      :close-on-click-modal="false"
    >
      <div v-if="changeSpecLoading" style="text-align: center; padding: 20px;">
        <el-icon class="is-loading" style="font-size: 24px;">
          <Loading />
        </el-icon>
      </div>
      <div v-else>
        <p style="margin-bottom: 12px; color: var(--el-text-color-secondary); font-size: 13px;">
          商品：{{ changingItem?.product.name }}
        </p>
        <el-radio-group v-model="selectedSkuId" style="display: flex; flex-direction: column; gap: 8px;">
          <el-radio
            v-for="sku in changeSpecSkus"
            :key="sku.id"
            :value="sku.id"
            :disabled="!sku.status || sku.stock < 1"
            border
            style="width: 100%; margin: 0;"
          >
            <span>{{ parseSkuName(sku.name) }}</span>
            <span style="margin-left: 8px; color: var(--el-color-danger);">¥{{ sku.price.toFixed(2) }}</span>
            <span style="margin-left: 8px; color: var(--el-text-color-secondary); font-size: 12px;">
              库存 {{ sku.stock }}
            </span>
            <span v-if="!sku.status || sku.stock < 1" style="margin-left: 6px; color: var(--el-color-danger); font-size: 11px;">
              {{ !sku.status ? "已下架" : "售罄" }}
            </span>
          </el-radio>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button @click="changeSpecVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="confirmLoading"
          :disabled="selectedSkuId === undefined || changeSpecLoading"
          @click="handleChangeSpecConfirm"
        >
          确认换规格
        </el-button>
      </template>
    </el-dialog>

    <!-- 发货弹窗 -->
    <el-dialog
      v-model="shipDialogVisible"
      :title="t('order.shipTitle')"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form label-width="90px" style="margin-top: 8px;">
        <el-form-item :label="t('order.shippingCompany')">
          <el-input
            v-model="shipForm.shippingCompany"
            :placeholder="t('order.shippingCompanyPlaceholder')"
            clearable
          />
        </el-form-item>
        <el-form-item :label="t('order.shipmentNo')">
          <el-input
            v-model="shipForm.shipmentNo"
            :placeholder="t('order.shipmentNoPlaceholder')"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipDialogVisible = false">
          {{ t("common.cancel") }}
        </el-button>
        <el-button type="primary" :loading="shipLoading" @click="handleShipConfirm">
          {{ t("common.confirm") }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
