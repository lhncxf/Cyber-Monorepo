<script lang="ts" setup>
import type { IOrder } from '@/api/mobile/types'
import { getOrderDetail, payOrder } from '@/api/mobile/orders'
import { usePageTitle } from '@/hooks/usePageTitle'

defineOptions({ name: 'OrderPay' })

const { t } = useI18n()
usePageTitle('page.orderPay')

definePage({
  style: { navigationBarTitleText: '收银台' },
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
  <view v-if="loading" class="py-20 text-center text-sm text-gray-400">
    {{ t('orderPay.loading') }}
  </view>

  <view v-else-if="order" class="min-h-screen bg-gray-50">
    <view class="flex flex-col items-center bg-white px-6 py-10">
      <view class="mb-2 text-sm text-gray-500">
        {{ t('orderPay.amountDue') }}
      </view>
      <view class="text-4xl text-red-500 font-bold">
        ¥{{ order.totalAmount.toFixed(2) }}
      </view>
      <view class="mt-3 text-xs text-gray-400">
        {{ t('orderPay.orderNo') }}{{ order.orderNo }}
      </view>
    </view>

    <view class="mx-4 mt-4 overflow-hidden rounded-xl bg-white">
      <view class="border-b border-gray-100 px-4 py-3 text-sm text-gray-700 font-bold">
        {{ t('orderPay.paymentMethod') }}
      </view>
      <view class="flex items-center gap-3 px-4 py-4">
        <view class="h-8 w-8 flex items-center justify-center rounded-full bg-green-500 text-sm text-white font-bold">
          微
        </view>
        <view class="flex-1 text-sm text-gray-800">
          {{ t('orderPay.wechatPay') }}
        </view>
        <view class="h-5 w-5 flex items-center justify-center border-2 border-red-500 rounded-full bg-red-500">
          <view class="h-2 w-2 rounded-full bg-white" />
        </view>
      </view>
    </view>

    <view class="mt-4 px-4 text-center text-xs text-gray-400">
      {{ t('orderPay.securityNote') }}
    </view>

    <view class="shadow-top fixed bottom-0 left-0 right-0 bg-white px-4 py-4 pb-safe">
      <button
        class="w-full rounded-full bg-red-500 py-4 text-base text-white font-medium"
        :disabled="paying"
        @tap="handlePay"
      >
        {{ paying ? t('orderPay.paying') : t('orderPay.confirmPay', { amount: order.totalAmount.toFixed(2) }) }}
      </button>
      <view
        class="mt-3 text-center text-sm text-gray-400"
        @tap="handleCancel"
      >
        {{ t('orderPay.payLater') }}
      </view>
    </view>
  </view>
</template>
