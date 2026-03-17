<script lang="ts" setup>
import type { IOrder } from '@/api/mobile/types'
import { getOrderDetail, payOrder } from '@/api/mobile/orders'
import { usePageTitle } from '@/hooks/usePageTitle'

defineOptions({ name: 'OrderPay' })

const { t } = useI18n()
usePageTitle('page.orderPay')

definePage({
  style: {},
})

const order = ref<IOrder | null>(null)
const loading = ref(true)
const paying = ref(false)

onLoad(async (options) => {
  const id = Number(options?.id)
  if (!id) {
    uni.showToast({ title: t('orderPay.notFound'), icon: 'error' })
    return
  }
  try {
    order.value = await getOrderDetail(id)
  }
  catch {
    // handled by http
  }
  finally {
    loading.value = false
  }
})

async function handlePay() {
  if (!order.value || paying.value)
    return
  paying.value = true
  try {
    await payOrder(order.value.id)
    uni.showToast({ title: t('orderPay.paySuccess'), icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({ url: `/pages/order/detail?id=${order.value!.id}` })
    }, 1000)
  }
  catch {
    // handled by http
  }
  finally {
    paying.value = false
  }
}

function handleCancel() {
  uni.redirectTo({ url: `/pages/order/detail?id=${order.value?.id}` })
}
</script>

<template>
  <NavBar :title="t('page.orderPay')" />
  <view v-if="loading" class="py-20 text-center text-sm text-[var(--brand-text-muted)]">
    {{ t('orderPay.loading') }}
  </view>

  <view v-else-if="order" class="min-h-screen bg-[var(--brand-bg)]">
    <!-- 金额展示 -->
    <view class="mx-4 mt-4 overflow-hidden border border-[var(--brand-border)] rounded-2xl bg-[var(--brand-surface)] p-8 text-center shadow-sm">
      <view class="mb-2 text-sm text-[var(--brand-text-secondary)]">
        {{ t('orderPay.amountDue') }}
      </view>
      <view class="text-4xl text-[var(--brand-accent)] font-bold">
        ¥{{ order.totalAmount.toFixed(2) }}
      </view>
      <view class="mt-3 text-xs text-[var(--brand-text-muted)] font-mono">
        {{ t('orderPay.orderNo') }}{{ order.orderNo }}
      </view>
    </view>

    <!-- 支付方式 -->
    <view class="mx-4 mt-4 overflow-hidden border border-[var(--brand-border)] rounded-2xl bg-[var(--brand-surface)] shadow-sm">
      <view class="border-b border-[var(--brand-border)] px-5 py-4 text-sm text-[var(--brand-text-primary)] font-bold tracking-wide uppercase">
        {{ t('orderPay.paymentMethod') }}
      </view>
      <view class="flex items-center gap-3 px-5 py-4">
        <view class="h-8 w-8 flex items-center justify-center rounded-full bg-[var(--brand-primary)] text-sm text-[var(--brand-surface)] font-bold">
          微
        </view>
        <view class="flex-1 text-sm text-[var(--brand-text-primary)]">
          {{ t('orderPay.wechatPay') }}
        </view>
        <view class="h-5 w-5 flex items-center justify-center border-2 border-[var(--brand-primary)] rounded-full bg-[var(--brand-primary)]">
          <view class="h-2 w-2 rounded-full bg-[var(--brand-surface)]" />
        </view>
      </view>
    </view>

    <view class="mt-4 px-4 text-center text-xs text-[var(--brand-text-muted)]">
      {{ t('orderPay.securityNote') }}
    </view>

    <!-- 底部按钮 -->
    <view class="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--brand-border)] rounded-t-3xl bg-[var(--brand-surface)] px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
      <button
        class="m-0 w-full rounded-full bg-[var(--brand-primary)] py-4 text-base text-[var(--brand-surface)] font-bold shadow-md active:opacity-90"
        :disabled="paying"
        @tap="handlePay"
      >
        {{ paying ? t('orderPay.paying') : `${t('orderPay.confirmPay')} ¥${order.totalAmount.toFixed(2)}` }}
      </button>
      <view
        class="mt-3 text-center text-sm text-[var(--brand-text-muted)]"
        @tap="handleCancel"
      >
        {{ t('orderPay.payLater') }}
      </view>
    </view>
    <view class="h-32" />
  </view>
</template>
