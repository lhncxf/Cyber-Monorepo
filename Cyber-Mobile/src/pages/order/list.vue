<script lang="ts" setup>
import type { IOrder, OrderStatus } from '@/api/mobile/types'
import { cancelOrder, getMyOrders } from '@/api/mobile/orders'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useMobileUserStore } from '@/store/mobileUser'

defineOptions({ name: 'OrderList' })

const { t } = useI18n()
usePageTitle('page.orderList')

definePage({
  style: {},
})

const mobileUserStore = useMobileUserStore()
const orders = ref<IOrder[]>([])
const loading = ref(false)

const statusColorMap: Record<OrderStatus, string> = {
  PENDING: 'text-orange-500',
  PAID: 'text-blue-500',
  SHIPPED: 'text-purple-500',
  DELIVERED: 'text-green-600',
  CANCELLED: 'text-gray-400',
}

async function fetchOrders() {
  loading.value = true
  try {
    const res = await getMyOrders()
    orders.value = res.list
  }
  catch {
    // handled by http.ts
  }
  finally {
    loading.value = false
  }
}

async function handleCancel(id: number) {
  uni.showModal({
    title: t('orderList.cancelConfirmTitle'),
    content: t('orderList.cancelConfirmContent'),
    success: async (res) => {
      if (res.confirm) {
        try {
          await cancelOrder(id)
          uni.showToast({ title: t('orderList.orderCancelled'), icon: 'success' })
          fetchOrders()
        }
        catch {
          // handled
        }
      }
    },
  })
}

function toDetail(id: number) {
  uni.navigateTo({ url: `/pages/order/detail?id=${id}` })
}

onShow(() => {
  if (!mobileUserStore.isLoggedIn) {
    uni.showToast({ title: t('orderList.loginFirst'), icon: 'none' })
    setTimeout(() => uni.navigateTo({ url: '/pages/login/index' }), 800)
    return
  }
  fetchOrders()
})
</script>

<template>
  <view class="min-h-screen bg-[var(--brand-bg)] pb-safe">
    <NavBar :title="t('page.orderList')" />
    <view v-if="loading" class="py-20 text-center text-sm text-[var(--brand-text-muted)]">
      {{ t('orderList.loading') }}
    </view>

    <view v-else-if="orders.length === 0" class="py-20 text-center">
      <view class="mb-4 text-5xl text-gray-300">
        📦
      </view>
      <view class="text-sm text-[var(--brand-text-secondary)]">
        {{ t('orderList.noOrders') }}
      </view>
    </view>

    <view v-else class="p-4">
      <view
        v-for="order in orders"
        :key="order.id"
        class="mb-4 overflow-hidden border border-[var(--brand-border)] rounded-2xl bg-[var(--brand-surface)] shadow-sm"
        @tap="toDetail(order.id)"
      >
        <view class="flex items-center justify-between border-b border-[var(--brand-border)] px-5 py-4">
          <view class="text-xs text-[var(--brand-text-secondary)] tracking-wider">
            {{ order.orderNo }}
          </view>
          <view :class="statusColorMap[order.status]" class="rounded bg-[var(--brand-bg)] px-2.5 py-1 text-xs font-bold tracking-wider uppercase">
            {{ t(`orderList.status.${order.status}`) }}
          </view>
        </view>

        <view class="px-5 py-4">
          <view
            v-for="item in order.items.slice(0, 2)"
            :key="item.id"
            class="mb-3 flex items-center gap-3 last:mb-0"
          >
            <image
              :src="item.product.images?.[0] || '/static/logo.svg'"
              mode="aspectFill"
              class="h-16 w-16 flex-shrink-0 rounded-xl bg-[var(--brand-bg)]"
            />
            <view class="line-clamp-2 flex-1 text-sm text-[var(--brand-text-primary)] font-medium leading-relaxed">
              {{ item.product.name }}
            </view>
            <view class="text-sm text-[var(--brand-text-secondary)] font-bold">
              x{{ item.quantity }}
            </view>
          </view>
          <view v-if="order.items.length > 2" class="mt-2 rounded bg-[var(--brand-bg)] p-2 text-center text-xs text-[var(--brand-text-muted)]">
            {{ `${t('orderList.itemCount')}${order.items.length}件` }}
          </view>
        </view>

        <view class="flex items-center justify-between border-t border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-4">
          <view class="text-xs text-[var(--brand-text-muted)]">
            {{ order.createdAt.slice(0, 10) }}
          </view>
          <view class="flex items-center gap-4">
            <view class="text-sm text-[var(--brand-text-primary)]">
              共<text class="mx-1 text-lg text-[var(--brand-accent)] font-bold">¥{{ order.totalAmount.toFixed(2) }}</text>
            </view>
            <view
              v-if="order.status === 'PENDING'"
              class="border border-[var(--brand-border)] rounded-full px-4 py-1.5 text-xs text-[var(--brand-text-primary)] font-bold transition-colors hover:bg-[var(--brand-bg)]"
              @tap.stop="handleCancel(order.id)"
            >
              {{ t('orderList.cancel') }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
