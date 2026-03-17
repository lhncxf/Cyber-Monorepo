<script lang="ts" setup>
import type { IApplyRefundForm, IOrder, OrderStatus } from '@/api/mobile/types'
import { applyRefund, cancelOrder, getOrderDetail } from '@/api/mobile/orders'
import { usePageTitle } from '@/hooks/usePageTitle'

defineOptions({ name: 'OrderDetail' })

const { t } = useI18n()
usePageTitle('page.orderDetail')

definePage({
  style: {},
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

function parseSkuName(name: string): string {
  try {
    const parsed = JSON.parse(name)
    if (Array.isArray(parsed)) {
      if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null)
        return parsed.map((item: Record<string, string>) => Object.values(item)[0] ?? '').join(' / ')
      return parsed.map(String).join(' / ')
    }
  }
  catch {}
  return name
}

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
  <NavBar :title="t('page.orderDetail')" />
  <view v-if="loading" class="py-20 text-center text-sm text-[var(--brand-text-muted)]">
    {{ t('orderDetail.loading') }}
  </view>

  <view v-else-if="order" class="min-h-screen bg-[var(--brand-bg)] pt-4 pb-safe">
    <view class="mx-4 mb-4 overflow-hidden border border-[var(--brand-border)] rounded-2xl bg-[var(--brand-surface)] p-5 shadow-sm">
      <view class="mb-3 flex items-center justify-between">
        <view class="text-sm text-[var(--brand-text-primary)] font-bold tracking-wide uppercase">
          {{ t('orderDetail.orderStatus') }}
        </view>
        <view
          class="rounded-full bg-[var(--brand-bg)] px-3 py-1.5 text-sm font-bold" :class="{
            'text-orange-500': order.status === 'PENDING',
            'text-blue-500': order.status === 'PAID',
            'text-purple-500': order.status === 'SHIPPED',
            'text-green-600': order.status === 'DELIVERED',
            'text-gray-400': order.status === 'CANCELLED',
          }"
        >
          {{ t(`orderDetail.status.${order.status}`) }}
        </view>
      </view>
      <view class="mb-1 text-xs text-[var(--brand-text-secondary)] tracking-wider font-mono">
        {{ t('orderDetail.orderNo') }}{{ order.orderNo }}
      </view>
      <view class="text-xs text-[var(--brand-text-muted)]">
        {{ t('orderDetail.orderTime') }}{{ order.createdAt.slice(0, 19).replace('T', ' ') }}
      </view>
    </view>

    <view class="mx-4 mb-4 overflow-hidden border border-[var(--brand-border)] rounded-2xl bg-[var(--brand-surface)] p-5 shadow-sm">
      <view class="mb-3 text-sm text-[var(--brand-text-primary)] font-bold tracking-wide uppercase">
        {{ t('orderDetail.shippingAddress') }}
      </view>
      <view class="border border-[var(--brand-border)] rounded-xl bg-[var(--brand-bg)] p-4 text-sm text-[var(--brand-text-secondary)] leading-loose">
        {{ addressDisplay }}
      </view>
      <view v-if="order.remark" class="mt-3 flex items-start gap-2 rounded-xl bg-[var(--brand-bg)] p-3 text-sm text-[var(--brand-text-secondary)]">
        <text class="i-carbon-chat mt-0.5" />
        <text class="flex-1">{{ t('orderDetail.remark') }}{{ order.remark }}</text>
      </view>
    </view>

    <view class="mx-4 mb-4 overflow-hidden border border-[var(--brand-border)] rounded-2xl bg-[var(--brand-surface)] p-5 shadow-sm">
      <view class="mb-4 text-sm text-[var(--brand-text-primary)] font-bold tracking-wide uppercase">
        {{ t('orderDetail.productList') }}
      </view>
      <view
        v-for="item in order.items"
        :key="item.id"
        class="flex items-center gap-4 border-b border-[var(--brand-border)] py-4 last:border-0 first:pt-0 last:pb-0"
      >
        <image
          :src="item.product.images?.[0] || '/static/logo.svg'"
          mode="aspectFill"
          class="h-20 w-20 flex-shrink-0 rounded-xl bg-[var(--brand-bg)] object-cover"
        />
        <view class="min-w-0 flex-1">
          <view class="line-clamp-2 mb-1 text-sm text-[var(--brand-text-primary)] font-medium leading-relaxed">
            {{ item.product.name }}
          </view>
          <view v-if="item.skuName" class="mb-2 inline-block rounded bg-[var(--brand-bg)] px-2 py-0.5 text-[11px] text-[var(--brand-text-secondary)]">
            {{ parseSkuName(item.skuName) }}
          </view>
          <view class="text-xs text-[var(--brand-text-muted)]">
            ¥{{ item.price.toFixed(2) }} x {{ item.quantity }}
          </view>
        </view>
        <view class="text-base text-[var(--brand-text-primary)] font-bold">
          ¥{{ (item.price * item.quantity).toFixed(2) }}
        </view>
      </view>
    </view>

    <view class="mx-4 mb-4 overflow-hidden border border-[var(--brand-border)] rounded-2xl bg-[var(--brand-surface)] p-5 shadow-sm">
      <view class="flex items-center justify-between">
        <view class="text-sm text-[var(--brand-text-primary)] font-bold tracking-wide uppercase">
          {{ t('orderDetail.orderTotal') }}
        </view>
        <view class="text-2xl text-[var(--brand-accent)] font-bold">
          <text class="mr-0.5 text-sm">¥</text>{{ order.totalAmount.toFixed(2) }}
        </view>
      </view>
    </view>

    <!-- 物流信息 -->
    <view v-if="order.status === 'SHIPPED' || order.status === 'DELIVERED'" class="mx-4 mb-4 overflow-hidden border border-[var(--brand-border)] rounded-2xl bg-[var(--brand-surface)] p-5 shadow-sm">
      <view class="mb-4 text-sm text-[var(--brand-text-primary)] font-bold tracking-wide uppercase">
        {{ t('orderDetail.logisticsTitle') }}
      </view>
      <view class="border border-[var(--brand-border)] rounded-xl bg-[var(--brand-bg)] p-4">
        <view v-if="order.shippingCompany" class="mb-2 flex justify-between text-sm text-[var(--brand-text-secondary)]">
          <text>{{ t('orderDetail.shippingCompany') }}</text>
          <text class="text-[var(--brand-text-primary)] font-medium">{{ order.shippingCompany }}</text>
        </view>
        <view v-if="order.shipmentNo" class="mb-2 flex justify-between text-sm text-[var(--brand-text-secondary)]">
          <text>{{ t('orderDetail.shipmentNo') }}</text>
          <text class="text-[var(--brand-text-primary)] font-mono">{{ order.shipmentNo }}</text>
        </view>
        <view v-if="order.shippedAt" class="mt-2 flex justify-between border-t border-[var(--brand-border)] pt-2 text-xs text-[var(--brand-text-muted)]">
          <text>{{ t('orderDetail.shippedAt') }}</text>
          <text>{{ order.shippedAt.slice(0, 19).replace('T', ' ') }}</text>
        </view>
      </view>
    </view>

    <!-- 退款区域 -->
    <view
      v-if="order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED'"
      class="mx-4 mb-4 overflow-hidden border border-[var(--brand-border)] rounded-2xl bg-[var(--brand-surface)] p-5 shadow-sm"
    >
      <view class="flex items-center justify-between">
        <view class="text-sm text-[var(--brand-text-secondary)]">
          {{ order.refund ? t('orderDetail.refundAlreadyApplied') : t('orderDetail.refundHint') }}
        </view>
        <view v-if="!order.refund">
          <button
            class="m-0 border border-[var(--brand-border)] rounded-full bg-[var(--brand-bg)] px-4 py-1.5 text-xs text-[var(--brand-text-primary)] font-medium active:bg-[var(--brand-border)]"
            :disabled="refundLoading"
            @tap="handleApplyRefund"
          >
            {{ t('orderDetail.applyRefund') }}
          </button>
        </view>
        <view
          v-else
          class="rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase"
          :class="{
            'bg-yellow-100 text-yellow-700': order.refund.status === 0,
            'bg-green-100 text-green-700': order.refund.status === 1,
            'bg-red-100 text-red-700': order.refund.status === 2,
          }"
        >
          {{ refundStatusLabel }}
        </view>
      </view>
    </view>

    <view v-if="order.status === 'PENDING'" class="fixed bottom-0 left-0 right-0 z-50 flex gap-3 border-t border-[var(--brand-border)] rounded-t-3xl bg-[var(--brand-surface)] px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
      <button
        class="m-0 flex-1 border border-[var(--brand-border)] rounded-full bg-[var(--brand-surface)] py-3.5 text-sm text-[var(--brand-text-primary)] font-bold shadow-sm active:bg-[var(--brand-bg)]"
        @tap="handleCancel"
      >
        {{ t('orderDetail.cancelOrder') }}
      </button>
      <button
        class="m-0 flex-1 rounded-full bg-[var(--brand-primary)] py-3.5 text-sm text-[var(--brand-surface)] font-bold shadow-md active:opacity-90"
        @tap="handlePay"
      >
        {{ t('orderDetail.payNow') }}
      </button>
    </view>
    <view v-if="order.status === 'PENDING'" class="h-20" />
  </view>
</template>
