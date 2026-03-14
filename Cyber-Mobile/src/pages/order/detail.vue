<script lang="ts" setup>
import type { IApplyRefundForm, IOrder, OrderStatus } from '@/api/mobile/types'
import { applyRefund, cancelOrder, getOrderDetail } from '@/api/mobile/orders'
import { usePageTitle } from '@/hooks/usePageTitle'

defineOptions({ name: 'OrderDetail' })

const { t } = useI18n()
usePageTitle('page.orderDetail')

definePage({
  style: { navigationBarTitleText: '订单详情' },
})

const order = ref<IOrder | null>(null)
const loading = ref(true)
const refundLoading = ref(false)

const statusKeys: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']

onLoad(async (options) => {
  const id = Number(options?.id)
  if (!id) {
    uni.showToast({ title: t('orderDetail.notFound'), icon: 'error' })
    return
  }
  try {
    order.value = await getOrderDetail(id)
  }
  catch {
    // handled
  }
  finally {
    loading.value = false
  }
})

async function handleCancel() {
  if (!order.value)
    return
  uni.showModal({
    title: t('orderDetail.cancelConfirmTitle'),
    content: t('orderDetail.cancelConfirmContent'),
    success: async (res) => {
      if (res.confirm) {
        try {
          await cancelOrder(order.value!.id)
          order.value!.status = 'CANCELLED'
          uni.showToast({ title: t('orderDetail.cancelled'), icon: 'success' })
        }
        catch {
          // handled
        }
      }
    },
  })
}

function handlePay() {
  uni.navigateTo({ url: `/pages/order/pay?id=${order.value!.id}` })
}

const addressDisplay = computed(() => {
  if (!order.value?.addressSnapshot)
    return ''
  try {
    const snap = JSON.parse(order.value.addressSnapshot)
    const parts = [snap.province, snap.city, snap.district, snap.detail].filter(Boolean)
    return `${snap.name}  ${snap.phone}\n${parts.join(' ')}`
  }
  catch {
    return ''
  }
})

const refundStatusLabel = computed(() => {
  const s = order.value?.refund?.status
  if (s === 0)
    return t('orderDetail.refundStatus.pending')
  if (s === 1)
    return t('orderDetail.refundStatus.approved')
  if (s === 2)
    return t('orderDetail.refundStatus.rejected')
  return ''
})

function handleApplyRefund() {
  if (!order.value)
    return
  uni.showModal({
    title: t('orderDetail.refundDialogTitle'),
    editable: true,
    placeholderText: t('orderDetail.refundReasonPlaceholder'),
    success: async (res) => {
      if (res.confirm) {
        const reason = res.content?.trim() ?? ''
        if (!reason) {
          uni.showToast({ title: t('orderDetail.refundReasonRequired'), icon: 'none' })
          return
        }
        try {
          refundLoading.value = true
          const form: IApplyRefundForm = { reason }
          await applyRefund(order.value!.id, form)
          order.value!.refund = { id: 0, status: 0 }
          uni.showToast({ title: t('orderDetail.refundSubmitted'), icon: 'success' })
        }
        catch {
          // handled by interceptor
        }
        finally {
          refundLoading.value = false
        }
      }
    },
  })
}
</script>

<template>
  <view v-if="loading" class="py-20 text-center text-sm text-gray-400">
    {{ t('orderDetail.loading') }}
  </view>

  <view v-else-if="order" class="min-h-screen bg-gray-50 pb-safe">
    <view class="mb-3 bg-white p-4">
      <view class="mb-2 flex items-center justify-between">
        <view class="text-sm text-gray-700 font-bold">
          {{ t('orderDetail.orderStatus') }}
        </view>
        <view class="text-sm text-green-600 font-bold">
          {{ t(`orderDetail.status.${order.status}`) }}
        </view>
      </view>
      <view class="text-xs text-gray-400">
        {{ t('orderDetail.orderNo') }}{{ order.orderNo }}
      </view>
      <view class="mt-1 text-xs text-gray-400">
        {{ t('orderDetail.orderTime') }}{{ order.createdAt.slice(0, 19).replace('T', ' ') }}
      </view>
    </view>

    <view class="mb-3 bg-white p-4">
      <view class="mb-2 text-sm text-gray-700 font-bold">
        {{ t('orderDetail.shippingAddress') }}
      </view>
      <view class="text-sm text-gray-600">
        {{ addressDisplay }}
      </view>
      <view v-if="order.remark" class="mt-1 text-xs text-gray-400">
        {{ t('orderDetail.remark') }}{{ order.remark }}
      </view>
    </view>

    <view class="mb-3 bg-white p-4">
      <view class="mb-3 text-sm text-gray-700 font-bold">
        {{ t('orderDetail.productList') }}
      </view>
      <view
        v-for="item in order.items"
        :key="item.id"
        class="flex items-center gap-3 border-b border-gray-100 py-2 last:border-0"
      >
        <image
          :src="item.product.images?.[0] || '/static/logo.svg'"
          mode="aspectFill"
          class="h-14 w-14 flex-shrink-0 rounded-lg"
        />
        <view class="flex-1">
          <view class="line-clamp-2 text-sm text-gray-800">
            {{ item.product.name }}
          </view>
          <view v-if="item.skuName" class="mt-0.5 text-xs text-gray-400">
            {{ t('orderDetail.spec') }}{{ item.skuName }}
          </view>
          <view class="text-xs text-gray-400">
            ¥{{ item.price.toFixed(2) }} x {{ item.quantity }}
          </view>
        </view>
        <view class="text-sm text-gray-800 font-bold">
          ¥{{ (item.price * item.quantity).toFixed(2) }}
        </view>
      </view>
    </view>

    <view class="mb-3 bg-white p-4">
      <view class="flex items-center justify-between">
        <view class="text-sm text-gray-700">
          {{ t('orderDetail.orderTotal') }}
        </view>
        <view class="text-xl text-red-500 font-bold">
          ¥{{ order.totalAmount.toFixed(2) }}
        </view>
      </view>
    </view>

    <!-- 物流信息（已发货时显示） -->
    <view v-if="order.status === 'SHIPPED' || order.status === 'DELIVERED'" class="mb-3 bg-white p-4">
      <view class="mb-2 text-sm text-gray-700 font-bold">
        {{ t('orderDetail.logisticsTitle') }}
      </view>
      <view v-if="order.shippingCompany" class="text-sm text-gray-600">
        {{ t('orderDetail.shippingCompany') }}{{ order.shippingCompany }}
      </view>
      <view v-if="order.shipmentNo" class="mt-1 text-sm text-gray-600">
        {{ t('orderDetail.shipmentNo') }}{{ order.shipmentNo }}
      </view>
      <view v-if="order.shippedAt" class="mt-1 text-xs text-gray-400">
        {{ t('orderDetail.shippedAt') }}{{ order.shippedAt.slice(0, 19).replace('T', ' ') }}
      </view>
    </view>

    <!-- 退款区域（已付款/已发货/已完成时显示） -->
    <view
      v-if="order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED'"
      class="mb-3 bg-white p-4"
    >
      <view v-if="!order.refund">
        <button
          class="w-full border border-gray-300 rounded-full py-3 text-sm text-gray-600"
          :disabled="refundLoading"
          @tap="handleApplyRefund"
        >
          {{ t('orderDetail.applyRefund') }}
        </button>
      </view>
      <view v-else class="flex items-center justify-between">
        <view class="text-sm text-gray-500">
          {{ t('orderDetail.refundAlreadyApplied') }}
        </view>
        <view
          class="rounded-full px-2 py-1 text-xs"
          :class="{
            'bg-yellow-100 text-yellow-600': order.refund.status === 0,
            'bg-green-100 text-green-600': order.refund.status === 1,
            'bg-red-100 text-red-600': order.refund.status === 2,
          }"
        >
          {{ refundStatusLabel }}
        </view>
      </view>
    </view>

    <view v-if="order.status === 'PENDING'" class="flex gap-3 px-4">
      <button
        class="flex-1 border border-gray-300 rounded-full py-3 text-sm text-gray-600"
        @tap="handleCancel"
      >
        {{ t('orderDetail.cancelOrder') }}
      </button>
      <button
        class="flex-1 rounded-full bg-red-500 py-3 text-sm text-white font-medium"
        @tap="handlePay"
      >
        {{ t('orderDetail.payNow') }}
      </button>
    </view>
  </view>
</template>
