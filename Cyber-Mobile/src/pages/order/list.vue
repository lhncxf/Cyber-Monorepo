<script lang="ts" setup>
import type { IOrder, OrderStatus } from '@/api/mobile/types'
import { cancelOrder, getMyOrders } from '@/api/mobile/orders'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useMobileUserStore } from '@/store/mobileUser'

defineOptions({ name: 'OrderList' })

const { t } = useI18n()
usePageTitle('page.orderList')

definePage({
  style: { navigationBarTitleText: '我的订单' },
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
  if (!mobileUserStore.isLoggedIn()) {
    uni.showToast({ title: t('orderList.loginFirst'), icon: 'none' })
    setTimeout(() => uni.navigateTo({ url: '/pages/login/index' }), 800)
    return
  }
  fetchOrders()
})
</script>

<template>
  <view class="min-h-screen bg-gray-50 pb-safe">
    <view v-if="loading" class="py-20 text-center text-sm text-gray-400">
      {{ t('orderList.loading') }}
    </view>

    <view v-else-if="orders.length === 0" class="py-20 text-center">
      <view class="mb-4 text-5xl text-gray-300">
        📦
      </view>
      <view class="text-sm text-gray-400">
        {{ t('orderList.noOrders') }}
      </view>
    </view>

    <view v-else>
      <view
        v-for="order in orders"
        :key="order.id"
        class="mx-3 mb-3 mt-3 overflow-hidden rounded-xl bg-white shadow-sm"
        @tap="toDetail(order.id)"
      >
        <view class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <view class="text-xs text-gray-500">
            {{ order.orderNo }}
          </view>
          <view :class="statusColorMap[order.status]" class="text-xs font-medium">
            {{ t(`orderList.status.${order.status}`) }}
          </view>
        </view>

        <view class="px-4 py-3">
          <view
            v-for="item in order.items.slice(0, 2)"
            :key="item.id"
            class="mb-2 flex items-center gap-2"
          >
            <image
              :src="item.product.images?.[0] || '/static/logo.svg'"
              mode="aspectFill"
              class="h-12 w-12 flex-shrink-0 rounded-lg"
            />
            <view class="line-clamp-1 flex-1 text-sm text-gray-700">
              {{ item.product.name }}
            </view>
            <view class="text-xs text-gray-400">
              x{{ item.quantity }}
            </view>
          </view>
          <view v-if="order.items.length > 2" class="text-xs text-gray-400">
            {{ t('orderList.itemCount', { n: order.items.length }) }}
          </view>
        </view>

        <view class="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <view class="text-xs text-gray-400">
            {{ order.createdAt.slice(0, 10) }}
          </view>
          <view class="flex items-center gap-3">
            <view class="text-sm text-gray-800">
              共<text class="mx-1 text-red-500 font-bold">¥{{ order.totalAmount.toFixed(2) }}</text>
            </view>
            <view
              v-if="order.status === 'PENDING'"
              class="border border-red-400 rounded-full px-3 py-1 text-xs text-red-500"
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
