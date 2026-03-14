<script lang="ts" setup>
import type { IBuyNowItem, IProduct, IProductSku } from '@/api/mobile/types'
import { checkFreight, getAddresses } from '@/api/mobile/addresses'
import { addToCart } from '@/api/mobile/cart'
import { getProductDetail } from '@/api/mobile/products'
import AddressPicker from '@/components/AddressPicker.vue'
import SkuPopup from '@/components/SkuPopup.vue'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAddressStore } from '@/store/address'
import { useMobileUserStore } from '@/store/mobileUser'

defineOptions({ name: 'ProductDetail' })

const { t } = useI18n()
usePageTitle('page.productDetail')

definePage({
  style: { navigationBarTitleText: '商品详情' },
})

const mobileUserStore = useMobileUserStore()
const addressStore = useAddressStore()

const product = ref<IProduct | null>(null)
const loading = ref(true)
const skuPopupVisible = ref(false)
const skuPopupMode = ref<'cart' | 'buyNow'>('cart')

// ─── Freight ──────────────────────────────────────────────────────────────────

interface FreightStatus {
  checking: boolean
  deliverable: boolean | null
  shippingCost: number
  freeShipping: boolean
}

const freight = ref<FreightStatus>({
  checking: false,
  deliverable: null,
  shippingCost: 0,
  freeShipping: false,
})

const minPrice = computed(() => {
  if (!product.value || product.value.skus.length === 0)
    return 0
  return Math.min(...product.value.skus.map(s => s.price))
})

async function checkProductFreight() {
  if (!product.value?.freightTemplateId || !addressStore.selectedAddress)
    return
  freight.value.checking = true
  try {
    const totalAmount = minPrice.value
    const result = await checkFreight(
      product.value.freightTemplateId,
      addressStore.selectedAddress.province,
      totalAmount,
    )
    freight.value.deliverable = result.deliverable
    freight.value.shippingCost = result.shippingCost
    freight.value.freeShipping = result.freeShipping
  }
  catch {
    freight.value.deliverable = null
  }
  finally {
    freight.value.checking = false
  }
}

// Re-check freight whenever the page comes back into view (address may have changed)
onShow(() => {
  if (product.value?.freightTemplateId && addressStore.selectedAddress) {
    checkProductFreight()
  }
})

// ─── Product load ─────────────────────────────────────────────────────────────

onLoad((options) => {
  const id = Number(options?.id)
  if (id)
    loadProduct(id)
})

async function loadProduct(id: number) {
  loading.value = true
  try {
    product.value = await getProductDetail(id)
  }
  catch {
    uni.showToast({ title: t('productDetail.notFound'), icon: 'error' })
    setTimeout(() => uni.navigateBack(), 1000)
  }
  finally {
    loading.value = false
    // Auto-select default address if user is logged in and no address selected yet
    if (mobileUserStore.isLoggedIn() && !addressStore.selectedAddress) {
      try {
        const list = await getAddresses()
        if (list.length > 0)
          addressStore.setSelectedAddress(list[0])
      }
      catch {}
    }
    // Check freight immediately if address is selected
    if (product.value?.freightTemplateId && addressStore.selectedAddress) {
      checkProductFreight()
    }
  }
}

// ─── SKU popup ────────────────────────────────────────────────────────────────

function openSkuPopup(mode: 'cart' | 'buyNow') {
  if (!mobileUserStore.isLoggedIn()) {
    uni.showToast({ title: t('productDetail.loginFirst'), icon: 'none' })
    setTimeout(() => uni.navigateTo({ url: '/pages/login/index' }), 800)
    return
  }
  skuPopupMode.value = mode
  skuPopupVisible.value = true
}

async function handleSkuConfirm(payload: { sku: IProductSku, quantity: number, mode: 'cart' | 'buyNow' }) {
  if (!product.value)
    return
  const { sku, quantity, mode } = payload

  if (mode === 'cart') {
    try {
      await addToCart({ productId: product.value.id, skuId: sku.id, quantity })
      uni.showToast({ title: t('productDetail.addedToCart'), icon: 'success' })
    }
    catch {
      // handled by http
    }
  }
  else {
    const buyNowItem: IBuyNowItem = {
      skuId: sku.id,
      quantity,
      productName: product.value.name,
      skuName: sku.name,
      price: sku.price,
      image: product.value.images[0] || '',
    }
    uni.setStorageSync('buyNowItems', [buyNowItem])
    uni.navigateTo({ url: '/pages/order/confirm?from=buyNow' })
  }
}

// ─── Computed ─────────────────────────────────────────────────────────────────

const maxPrice = computed(() => {
  if (!product.value || product.value.skus.length === 0)
    return 0
  return Math.max(...product.value.skus.map(s => s.price))
})

const priceText = computed(() => {
  if (!product.value || product.value.skus.length === 0)
    return t('productDetail.noPrice')
  if (minPrice.value === maxPrice.value)
    return `¥${minPrice.value.toFixed(2)}`
  return `¥${minPrice.value.toFixed(2)} ~ ¥${maxPrice.value.toFixed(2)}`
})

const totalStock = computed(() =>
  product.value?.skus.reduce((sum, s) => sum + s.stock, 0) ?? 0,
)

const freightText = computed(() => {
  if (!product.value?.freightTemplateId)
    return t('freight.noFreightTemplate')
  if (!addressStore.selectedAddress)
    return t('freight.selectAddressFirst')
  if (freight.value.checking)
    return t('freight.checking')
  if (freight.value.deliverable === null)
    return t('freight.selectAddressFirst')
  if (!freight.value.deliverable)
    return t('freight.notDeliverable')
  if (freight.value.freeShipping)
    return t('freight.free')
  return t('freight.cost', { amount: freight.value.shippingCost.toFixed(2) })
})

const freightColor = computed(() => {
  if (!product.value?.freightTemplateId || !addressStore.selectedAddress || freight.value.deliverable === null)
    return 'text-gray-400'
  if (!freight.value.deliverable)
    return 'text-red-500'
  if (freight.value.freeShipping)
    return 'text-green-600'
  return 'text-gray-700'
})

function parseSkuName(name: string): string[] {
  try {
    const parsed = JSON.parse(name)
    if (Array.isArray(parsed)) {
      if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
        return parsed.map((item: Record<string, string>) => Object.values(item)[0] ?? '')
      }
      return parsed.map(String)
    }
  }
  catch {}
  return [name]
}
</script>

<template>
  <view v-if="loading" class="py-20 text-center text-sm text-gray-400">
    {{ t('productDetail.loading') }}
  </view>

  <view v-else-if="product" class="min-h-screen bg-gray-50 pb-32">
    <!-- Off-shelf banner -->
    <view v-if="!product.status" class="flex items-center gap-2 bg-gray-800 px-4 py-2 text-sm text-white">
      <text class="i-carbon-warning-filled text-yellow-400" />
      {{ t('productDetail.offShelf') }}
    </view>

    <!-- Images -->
    <swiper
      v-if="product.images.length > 0"
      class="h-72 w-full"
      :indicator-dots="product.images.length > 1"
      circular
      autoplay
    >
      <swiper-item v-for="(img, idx) in product.images" :key="idx">
        <image
          :src="img"
          mode="aspectFill"
          class="h-72 w-full"
        />
      </swiper-item>
    </swiper>
    <image
      v-else
      src="/static/logo.svg"
      mode="aspectFill"
      class="h-72 w-full"
    />

    <!-- Price + title -->
    <view class="mb-3 bg-white p-4">
      <view class="mb-1 text-2xl text-red-500 font-bold">
        {{ priceText }}
      </view>
      <view class="mb-1 text-base text-gray-800 font-bold">
        {{ product.name }}
      </view>
      <view class="text-xs text-gray-400">
        {{ t('productDetail.category') }}{{ product.categoryName }} · {{ t('productDetail.totalStock') }}{{ totalStock }}
      </view>
    </view>

    <!-- Shipping address + freight -->
    <view v-if="mobileUserStore.isLoggedIn()" class="mb-3 bg-white p-4">
      <view class="mb-2 text-sm text-gray-700 font-bold">
        {{ t('orderConfirm.shippingAddress') }}
      </view>
      <AddressPicker
        :model-value="addressStore.selectedAddress"
        @update:model-value="(addr) => { addressStore.setSelectedAddress(addr); checkProductFreight() }"
      />
      <view v-if="product.freightTemplateId" class="mt-2 flex items-center gap-1">
        <text class="text-xs text-gray-400">{{ t('freight.label') }}</text>
        <text class="text-xs" :class="freightColor">{{ freightText }}</text>
      </view>
    </view>

    <!-- Specs -->
    <view v-if="product.skus.length > 0" class="mb-3 bg-white p-4">
      <view class="mb-2 text-sm text-gray-700 font-bold">
        {{ t('productDetail.specs', { n: product.skus.length }) }}
      </view>
      <view class="flex flex-wrap gap-2">
        <view
          v-for="sku in product.skus"
          :key="sku.id"
          class="border border-gray-200 rounded-full px-3 py-1 text-xs"
          :class="sku.stock > 0 ? 'text-gray-600' : 'text-gray-300'"
        >
          {{ parseSkuName(sku.name).join(' / ') }} · ¥{{ sku.price.toFixed(2) }}
          <text v-if="sku.stock <= 0" class="text-gray-300">{{ t('productDetail.outOfStock') }}</text>
        </view>
      </view>
    </view>

    <!-- Description -->
    <view class="mb-3 bg-white p-4">
      <view class="mb-2 text-sm text-gray-700 font-bold">
        {{ t('productDetail.description') }}
      </view>
      <view class="text-sm text-gray-600 leading-relaxed">
        {{ product.description || t('productDetail.noDescription') }}
      </view>
    </view>

    <!-- Bottom action bar -->
    <view class="shadow-top fixed bottom-0 left-0 right-0 flex gap-3 bg-white px-4 py-3 pb-safe">
      <button
        class="flex-1 rounded-full py-3 text-sm text-white font-medium"
        :class="product.status ? 'bg-orange-400' : 'bg-gray-300'"
        :disabled="!product.status"
        @tap="product.status && openSkuPopup('cart')"
      >
        {{ t('productDetail.addToCart') }}
      </button>
      <button
        class="flex-1 rounded-full py-3 text-sm text-white font-medium"
        :class="product.status ? 'bg-red-500' : 'bg-gray-300'"
        :disabled="!product.status"
        @tap="product.status && openSkuPopup('buyNow')"
      >
        {{ t('productDetail.buyNow') }}
      </button>
    </view>

    <SkuPopup
      v-model:visible="skuPopupVisible"
      :product="product"
      :mode="skuPopupMode"
      @confirm="handleSkuConfirm"
    />
  </view>
</template>
