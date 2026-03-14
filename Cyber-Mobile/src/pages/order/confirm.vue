<script lang="ts" setup>
import type { IBuyNowItem, IServerCartItem } from '@/api/mobile/types'
import { getCart } from '@/api/mobile/cart'
import { createOrder } from '@/api/mobile/orders'
import AddressPicker from '@/components/AddressPicker.vue'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAddressStore } from '@/store/address'

defineOptions({ name: 'OrderConfirm' })

const { t } = useI18n()
usePageTitle('page.orderConfirm')

definePage({
  style: { navigationBarTitleText: '确认订单' },
})

const addressStore = useAddressStore()

interface DisplayItem {
  skuId: number
  quantity: number
  productName: string
  skuName: string
  price: number
  image: string
}

const displayItems = ref<DisplayItem[]>([])
const remark = ref('')
const loading = ref(false)
const from = ref('')

onLoad(async (options) => {
  from.value = options?.from || ''
  if (from.value === 'buyNow') {
    const stored: IBuyNowItem[] = uni.getStorageSync('buyNowItems') || []
    displayItems.value = stored.map(i => ({
      skuId: i.skuId,
      quantity: i.quantity,
      productName: i.productName,
      skuName: i.skuName,
      price: i.price,
      image: i.image,
    }))
  }
  else {
    try {
      const cartItems: IServerCartItem[] = await getCart()
      const selectedSkuIds: number[] = uni.getStorageSync('cartSelectedSkuIds') || []
      const filtered = selectedSkuIds.length > 0
        ? cartItems.filter(i => i.available && selectedSkuIds.includes(i.skuId))
        : cartItems.filter(i => i.available)
      displayItems.value = filtered.map(i => ({
        skuId: i.skuId,
        quantity: i.quantity,
        productName: i.productName,
        skuName: i.skuName,
        price: i.price,
        image: i.image,
      }))
    }
    catch {
      displayItems.value = []
    }
  }
})

const totalPrice = computed(() =>
  displayItems.value.reduce((sum, i) => sum + i.price * i.quantity, 0),
)

async function submitOrder() {
  if (!addressStore.selectedAddress) {
    uni.showToast({ title: t('orderConfirm.fillAddress'), icon: 'none' })
    return
  }
  if (displayItems.value.length === 0) {
    uni.showToast({ title: t('orderConfirm.emptyOrder'), icon: 'none' })
    return
  }
  loading.value = true
  try {
    const res = await createOrder({
      items: displayItems.value.map(i => ({ skuId: i.skuId, quantity: i.quantity })),
      addressId: addressStore.selectedAddress.id,
      remark: remark.value || undefined,
      clearCart: from.value === 'cart',
    })
    uni.removeStorageSync('buyNowItems')
    uni.removeStorageSync('cartSelectedSkuIds')
    uni.showToast({ title: t('orderConfirm.orderPlaced'), icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({ url: `/pages/order/pay?id=${res.orderId}` })
    }, 500)
  }
  catch {
    // handled by http
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <view class="min-h-screen bg-gray-50 pb-32">
    <!-- Shipping address -->
    <view class="mb-3 bg-white p-4">
      <view class="mb-3 text-sm text-gray-700 font-bold">
        {{ t('orderConfirm.shippingAddress') }}
      </view>
      <AddressPicker
        :model-value="addressStore.selectedAddress"
        @update:model-value="addressStore.setSelectedAddress"
      />
    </view>

    <!-- Product list -->
    <view class="mb-3 bg-white p-4">
      <view class="mb-3 text-sm text-gray-700 font-bold">
        {{ t('orderConfirm.productList') }}
      </view>
      <view
        v-for="item in displayItems"
        :key="item.skuId"
        class="flex items-center gap-3 border-b border-gray-100 py-2 last:border-0"
      >
        <image
          :src="item.image || '/static/logo.svg'"
          mode="aspectFill"
          class="h-14 w-14 flex-shrink-0 rounded-lg"
        />
        <view class="flex-1">
          <view class="line-clamp-2 text-sm text-gray-800">
            {{ item.productName }}
          </view>
          <view class="text-xs text-gray-400">
            {{ item.skuName }} · x{{ item.quantity }}
          </view>
        </view>
        <view class="text-sm text-red-500 font-bold">
          ¥{{ (item.price * item.quantity).toFixed(2) }}
        </view>
      </view>
    </view>

    <!-- Remark -->
    <view class="mb-3 bg-white p-4">
      <view class="mb-3 text-sm text-gray-700 font-bold">
        {{ t('orderConfirm.remark') }}
      </view>
      <input
        v-model="remark"
        :placeholder="t('orderConfirm.remarkPlaceholder')"
        class="w-full rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700"
      >
    </view>

    <!-- Bottom bar -->
    <view
      class="shadow-top fixed bottom-0 left-0 right-0 flex items-center justify-between bg-white px-4 py-3 pb-safe"
    >
      <view>
        <view class="text-xs text-gray-500">
          {{ t('orderConfirm.payable') }}
        </view>
        <view class="text-xl text-red-500 font-bold">
          ¥{{ totalPrice.toFixed(2) }}
        </view>
      </view>
      <button
        class="rounded-full bg-red-500 px-8 py-3 text-sm text-white font-medium"
        :disabled="loading"
        @tap="submitOrder"
      >
        {{ loading ? t('orderConfirm.submitting') : t('orderConfirm.submitOrder') }}
      </button>
    </view>
  </view>
</template>
