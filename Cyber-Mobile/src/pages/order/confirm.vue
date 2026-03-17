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
  style: {},
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
  <NavBar :title="t('page.orderConfirm')" />
  <view class="min-h-screen bg-[var(--brand-bg)] pb-32">
    <!-- Shipping address -->
    <view class="mb-4 border-b border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-sm">
      <view class="mb-4 text-sm text-[var(--brand-text-primary)] font-bold tracking-wide uppercase">
        {{ t('orderConfirm.shippingAddress') }}
      </view>
      <view class="border border-[var(--brand-border)] rounded-xl bg-[var(--brand-bg)] p-3">
        <AddressPicker
          :model-value="addressStore.selectedAddress"
          @update:model-value="addressStore.setSelectedAddress"
        />
      </view>
    </view>

    <!-- Product list -->
    <view class="mb-4 border-y border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-sm">
      <view class="mb-4 text-sm text-[var(--brand-text-primary)] font-bold tracking-wide uppercase">
        {{ t('orderConfirm.productList') }}
      </view>
      <view
        v-for="item in displayItems"
        :key="item.skuId"
        class="flex items-center gap-4 border-b border-[var(--brand-border)] py-4 last:border-0 first:pt-0 last:pb-0"
      >
        <image
          :src="item.image || '/static/logo.svg'"
          mode="aspectFill"
          class="h-20 w-20 flex-shrink-0 rounded-xl bg-[var(--brand-bg)] object-cover"
        />
        <view class="min-w-0 flex-1">
          <view class="line-clamp-2 mb-1 text-sm text-[var(--brand-text-primary)] font-medium leading-relaxed">
            {{ item.productName }}
          </view>
          <view class="mb-2 inline-block rounded bg-[var(--brand-bg)] px-2 py-0.5 text-[11px] text-[var(--brand-text-secondary)]">
            {{ parseSkuName(item.skuName) }}
          </view>
          <view class="text-xs text-[var(--brand-text-muted)] font-bold">
            x{{ item.quantity }}
          </view>
        </view>
        <view class="text-base text-[var(--brand-text-primary)] font-bold">
          ¥{{ (item.price * item.quantity).toFixed(2) }}
        </view>
      </view>
    </view>

    <!-- Remark -->
    <view class="mb-4 border-y border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-sm">
      <view class="mb-3 text-sm text-[var(--brand-text-primary)] font-bold tracking-wide uppercase">
        {{ t('orderConfirm.remark') }}
      </view>
      <input
        v-model="remark"
        :placeholder="t('orderConfirm.remarkPlaceholder')"
        class="box-border w-full border border-[var(--brand-border)] rounded-xl bg-[var(--brand-bg)] px-4 py-3 text-sm text-[var(--brand-text-primary)] transition-colors focus:border-[var(--brand-primary)]"
      >
    </view>

    <!-- Bottom bar -->
    <view
      class="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-[var(--brand-border)] rounded-t-3xl bg-[var(--brand-surface)] px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe"
    >
      <view class="flex flex-col">
        <view class="text-xs text-[var(--brand-text-secondary)] font-medium">
          {{ t('orderConfirm.payable') }}
        </view>
        <view class="text-2xl text-[var(--brand-accent)] font-bold tracking-tight">
          <text class="mr-0.5 text-sm">¥</text>{{ totalPrice.toFixed(2) }}
        </view>
      </view>
      <button
        class="m-0 rounded-full bg-[var(--brand-primary)] px-10 py-3.5 text-sm text-[var(--brand-surface)] font-bold shadow-lg transition-opacity active:opacity-90"
        :disabled="loading"
        @tap="submitOrder"
      >
        {{ loading ? t('orderConfirm.submitting') : t('orderConfirm.submitOrder') }}
      </button>
    </view>
  </view>
</template>
