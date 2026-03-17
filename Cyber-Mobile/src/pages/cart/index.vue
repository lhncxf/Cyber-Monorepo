<script lang="ts" setup>
import type { IProduct, IProductSku, IServerCartItem } from '@/api/mobile/types'
import { addToCart, getCart, removeCartItem, updateCartItem } from '@/api/mobile/cart'
import { getProductDetail } from '@/api/mobile/products'
import SkuPopup from '@/components/SkuPopup.vue'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useMobileUserStore } from '@/store/mobileUser'

defineOptions({ name: 'Cart' })

const { t } = useI18n()
usePageTitle('page.cart')

definePage({
  style: {},
})

const mobileUserStore = useMobileUserStore()
const cart = ref<IServerCartItem[]>([])
const loading = ref(false)
const selectedIds = ref<Set<number>>(new Set())

async function loadCart() {
  if (!mobileUserStore.isLoggedIn) {
    cart.value = []
    return
  }
  loading.value = true
  try {
    cart.value = await getCart()
    selectedIds.value = new Set(cart.value.filter(i => i.available).map(i => i.id))
  }
  catch {
    cart.value = []
  }
  finally {
    loading.value = false
  }
}

async function changeQuantity(item: IServerCartItem, delta: number) {
  const next = item.quantity + delta
  if (next < 1)
    return
  if (next > item.stock) {
    uni.showToast({ title: t('cart.exceedsStock'), icon: 'none' })
    return
  }
  try {
    await updateCartItem(item.id, next)
    item.quantity = next
  }
  catch {
    // handled by http
  }
}

async function removeItem(item: IServerCartItem) {
  try {
    await removeCartItem(item.id)
    cart.value = cart.value.filter(i => i.id !== item.id)
    selectedIds.value.delete(item.id)
  }
  catch {
    // handled by http
  }
}

const availableItems = computed(() => cart.value.filter(i => i.available))

const selectedItems = computed(() =>
  availableItems.value.filter(i => selectedIds.value.has(i.id)),
)

const allSelected = computed({
  get: () =>
    availableItems.value.length > 0
    && availableItems.value.every(i => selectedIds.value.has(i.id)),
  set: (val: boolean) => {
    if (val) {
      availableItems.value.forEach(i => selectedIds.value.add(i.id))
    }
    else {
      availableItems.value.forEach(i => selectedIds.value.delete(i.id))
    }
  },
})

const totalPrice = computed(() =>
  selectedItems.value.reduce((sum, i) => sum + i.price * i.quantity, 0),
)

function toggleSelect(item: IServerCartItem) {
  if (!item.available)
    return
  if (selectedIds.value.has(item.id)) {
    selectedIds.value.delete(item.id)
  }
  else {
    selectedIds.value.add(item.id)
  }
}

function checkout() {
  if (!mobileUserStore.isLoggedIn) {
    uni.showToast({ title: t('cart.loginFirst'), icon: 'none' })
    setTimeout(() => uni.navigateTo({ url: '/pages/login/index' }), 800)
    return
  }
  if (selectedItems.value.length === 0) {
    uni.showToast({ title: t('cart.selectItems'), icon: 'none' })
    return
  }
  uni.setStorageSync('cartSelectedSkuIds', selectedItems.value.map(i => i.skuId))
  uni.navigateTo({ url: '/pages/order/confirm?from=cart' })
}

function goToProducts() {
  uni.switchTab({ url: '/pages/index/index' })
}

function goToLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}

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

const changeSpecVisible = ref(false)
const changingItem = ref<IServerCartItem | null>(null)
const changeSpecProduct = ref<IProduct | null>(null)

async function openChangeSpec(item: IServerCartItem) {
  changingItem.value = item
  changeSpecProduct.value = null
  try {
    changeSpecProduct.value = await getProductDetail(item.productId)
    changeSpecVisible.value = true
  }
  catch {
    uni.showToast({ title: t('cart.fetchProductFailed'), icon: 'none' })
  }
}

async function handleChangeSpecConfirm(payload: { sku: IProductSku, quantity: number, mode: 'cart' | 'buyNow' | 'changeSpec' }) {
  const oldItem = changingItem.value
  if (!oldItem)
    return

  const { sku, quantity } = payload

  const existingItem = cart.value.find(i => i.skuId === sku.id && i.id !== oldItem.id)

  try {
    if (existingItem) {
      const newQty = existingItem.quantity + quantity
      const maxQty = Math.min(newQty, sku.stock)
      await updateCartItem(existingItem.id, maxQty)
      await removeCartItem(oldItem.id)
    }
    else if (sku.id === oldItem.skuId) {
      await updateCartItem(oldItem.id, quantity)
    }
    else {
      await removeCartItem(oldItem.id)
      await addToCart({ productId: oldItem.productId, skuId: sku.id, quantity })
    }
    uni.showToast({ title: t('cart.specUpdated'), icon: 'success' })
    await loadCart()
  }
  catch {
    // handled by http
  }
  finally {
    changingItem.value = null
    changeSpecProduct.value = null
  }
}

onShow(() => {
  loadCart()
})
</script>

<template>
  <view class="min-h-screen bg-[var(--brand-bg)] pb-40">
    <NavBar :title="t('page.cart')" :show-back="false" />
    <view v-if="!mobileUserStore.isLoggedIn" class="py-20 text-center">
      <view class="mb-4 text-5xl text-gray-300">
        🛒
      </view>
      <view class="mb-2 text-sm text-[var(--brand-text-secondary)]">
        {{ t('cart.loginToView') }}
      </view>
      <view class="text-sm text-[var(--brand-primary)] font-semibold underline underline-offset-4" @tap="goToLogin">
        {{ t('cart.goLogin') }}
      </view>
    </view>

    <view v-else-if="loading" class="py-20 text-center text-sm text-[var(--brand-text-muted)]">
      {{ t('cart.loading') }}
    </view>

    <view v-else-if="cart.length === 0" class="py-20 text-center">
      <view class="mb-4 text-5xl text-gray-300">
        🛒
      </view>
      <view class="text-sm text-[var(--brand-text-secondary)]">
        {{ t('cart.emptyCart') }}
      </view>
      <view class="mt-4 text-sm text-[var(--brand-primary)] font-semibold underline underline-offset-4" @tap="goToProducts">
        {{ t('cart.goShop') }}
      </view>
    </view>

    <view v-else class="px-4 pt-4">
      <view
        v-for="item in cart"
        :key="item.id"
        class="mb-4 flex items-center gap-3 border border-[var(--brand-border)] rounded-2xl bg-[var(--brand-surface)] p-4 shadow-sm"
        :class="{ 'opacity-50': !item.available }"
      >
        <view
          class="h-6 w-6 flex flex-shrink-0 items-center justify-center border-2 rounded-full transition-all"
          :class="[
            item.available && selectedIds.has(item.id)
              ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]'
              : 'border-[var(--brand-border)] bg-[var(--brand-bg)]',
            item.available ? 'active:opacity-70' : 'cursor-not-allowed',
          ]"
          @tap="toggleSelect(item)"
        >
          <view
            v-if="item.available && selectedIds.has(item.id)"
            class="i-carbon-checkmark text-xs text-[var(--brand-surface)] font-bold"
          />
        </view>

        <image
          :src="item.image || '/static/logo.svg'"
          mode="aspectFill"
          class="h-20 w-20 flex-shrink-0 rounded-xl bg-[var(--brand-bg)] object-cover"
        />
        <view class="h-20 min-w-0 flex flex-1 flex-col justify-between py-1">
          <view class="line-clamp-1 text-sm text-[var(--brand-text-primary)] font-medium">
            {{ item.productName }}
          </view>
          <view class="flex items-center gap-1.5">
            <view class="max-w-[120px] truncate rounded bg-[var(--brand-bg)] px-2 py-0.5 text-[11px] text-[var(--brand-text-secondary)]">
              {{ parseSkuName(item.skuName).join(' / ') }}
            </view>
            <view
              v-if="item.available"
              class="text-[10px] text-[var(--brand-text-muted)] underline active:text-[var(--brand-text-primary)]"
              @tap="openChangeSpec(item)"
            >
              {{ t('cart.changeSpec') }}
            </view>
          </view>
          <view class="mt-auto flex items-end justify-between">
            <view class="text-base text-[var(--brand-accent)] font-bold">
              <text class="text-xs">¥</text>{{ item.price.toFixed(2) }}
            </view>

            <view class="flex items-center gap-2">
              <view
                class="h-6 w-6 flex items-center justify-center border border-[var(--brand-border)] rounded-full bg-[var(--brand-bg)] text-[var(--brand-text-secondary)] active:bg-gray-200"
                @tap="changeQuantity(item, -1)"
              >
                -
              </view>
              <view class="w-5 text-center text-sm text-[var(--brand-text-primary)] font-medium">
                {{ item.quantity }}
              </view>
              <view
                class="h-6 w-6 flex items-center justify-center border border-[var(--brand-border)] rounded-full bg-[var(--brand-bg)] text-[var(--brand-text-secondary)] active:bg-gray-200"
                @tap="changeQuantity(item, 1)"
              >
                +
              </view>
            </view>
          </view>
          <view v-if="!item.available" class="mt-0.5 text-[10px] text-[var(--brand-accent)]">
            {{ t('cart.specInvalid') }}
          </view>
        </view>
        <view class="h-20 flex flex-shrink-0 items-center">
          <view class="h-full flex items-center justify-center pl-2" @tap="removeItem(item)">
            <text class="i-carbon-trash-can text-lg text-[var(--brand-text-muted)] transition-colors active:text-[var(--brand-accent)]" />
          </view>
        </view>
      </view>
    </view>

    <view
      v-if="cart.length > 0"
      class="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 border-t border-[var(--brand-border)] rounded-t-3xl bg-[var(--brand-surface)] px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe"
      style="bottom: 50px;"
    >
      <view
        class="flex flex-shrink-0 items-center gap-2"
        @tap="allSelected = !allSelected"
      >
        <view
          class="h-6 w-6 flex items-center justify-center border-2 rounded-full transition-all"
          :class="allSelected ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]' : 'border-[var(--brand-border)] bg-[var(--brand-bg)]'"
        >
          <view v-if="allSelected" class="i-carbon-checkmark text-xs text-[var(--brand-surface)] font-bold" />
        </view>
        <text class="text-sm text-[var(--brand-text-primary)] font-medium">{{ t('cart.selectAll') }}</text>
      </view>

      <view class="flex flex-1 flex-col items-end px-2">
        <view class="text-xs text-[var(--brand-text-secondary)]">
          {{ t('cart.total') }}
        </view>
        <view class="text-xl text-[var(--brand-accent)] font-bold">
          <text class="text-sm">¥</text>{{ totalPrice.toFixed(2) }}
        </view>
      </view>

      <button
        class="m-0 flex-shrink-0 rounded-full bg-[var(--brand-primary)] px-8 py-3.5 text-sm text-[var(--brand-surface)] font-bold shadow-md transition-opacity active:opacity-90"
        @tap="checkout"
      >
        {{ `${t('cart.checkout')}（${selectedItems.length}）` }}
      </button>
    </view>

    <SkuPopup
      v-model:visible="changeSpecVisible"
      :product="changeSpecProduct"
      mode="changeSpec"
      :initial-sku-name="changingItem?.skuName"
      @confirm="handleChangeSpecConfirm"
    />
  </view>
</template>
