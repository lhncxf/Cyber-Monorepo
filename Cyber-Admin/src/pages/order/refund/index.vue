<script lang="ts" setup>
import type { RefundData, RefundRequestParams } from "@@/apis/orders/type"
import type { ProTableColumn, ProTableEnumItem, ProTableExpose } from "@@/components/ProTable/type"
import { getRefundListApi, reviewRefundApi } from "@@/apis/orders/index"
import ProTable from "@@/components/ProTable/index.vue"

defineOptions({ name: "RefundIndex" })

const { t } = useI18n()

const tableRef = useTemplateRef<ProTableExpose>("tableRef")

const STATUS_ENUM: ProTableEnumItem[] = [
  { label: t("refund.statusPending"), value: 0, tagType: "warning" },
  { label: t("refund.statusApproved"), value: 1, tagType: "success" },
  { label: t("refund.statusRejected"), value: 2, tagType: "danger" }
]

const columns: ProTableColumn<RefundData>[] = [
  { field: "id", title: "ID", width: 80 },
  { field: "orderNo", title: t("refund.orderNo"), minWidth: 180 },
  {
    field: "user",
    title: t("refund.user"),
    width: 140,
    formatter: ({ row }: { row: RefundData }) => row.user?.nickname || row.user?.phone || "-"
  },
  { field: "reason", title: t("refund.reason"), minWidth: 160 },
  {
    field: "status",
    title: t("refund.status"),
    width: 100,
    tag: true,
    enum: STATUS_ENUM,
    search: { el: "select", props: { clearable: true } }
  },
  { field: "adminNote", title: t("refund.adminNote"), minWidth: 140 },
  { field: "createTime", title: t("refund.applyTime"), width: 180 },
  {
    field: "action",
    title: t("common.operate"),
    width: 160,
    fixed: "right",
    slots: { default: "action" }
  }
]

async function handleReview(row: RefundData, action: "approve" | "reject") {
  const confirmMsg = action === "approve" ? t("refund.approveConfirm") : t("refund.rejectConfirm")
  try {
    const { value: adminNote } = await ElMessageBox.prompt(confirmMsg, t("refund.reviewTitle"), {
      confirmButtonText: t("common.confirm"),
      cancelButtonText: t("common.cancel"),
      inputPlaceholder: t("refund.adminNotePlaceholder"),
      inputType: "textarea"
    })
    await reviewRefundApi(row.id, { action, adminNote: adminNote?.trim() || undefined })
    ElMessage.success(action === "approve" ? t("refund.approveSuccess") : t("refund.rejectSuccess"))
    tableRef.value?.refresh()
  } catch (e: unknown) {
    if ((e as string) !== "cancel") throw e
  }
}

function requestApi(params: { currentPage: number, size: number, [key: string]: unknown }) {
  return getRefundListApi(params as RefundRequestParams)
}
</script>

<template>
  <ProTable ref="tableRef" :columns="columns" :request-api="requestApi">
    <template #action="{ row }: { row: RefundData }">
      <template v-if="row.status === 0">
        <el-button link type="primary" @click="handleReview(row, 'approve')">
          {{ t("refund.approveBtn") }}
        </el-button>
        <el-button link type="danger" @click="handleReview(row, 'reject')">
          {{ t("refund.rejectBtn") }}
        </el-button>
      </template>
      <span v-else class="text-xs text-gray-400">—</span>
    </template>
  </ProTable>
</template>
