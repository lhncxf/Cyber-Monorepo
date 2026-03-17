<script lang="ts" setup>
import type { ICategory, IProduct } from '@/api/mobile/types'
import { getAllProducts, getCategories } from '@/api/mobile/products'
import { usePageTitle } from '@/hooks/usePageTitle'

defineOptions({ name: 'Home' })

const { t } = useI18n()
usePageTitle('page.home')

definePage({
  type: 'home',
  style: {},
})

const categories = ref<ICategory[]>([])
const activeCategoryId = ref<number | null>(null)

async function fetchCategories() {
  try {
    const res = await getCategories()
    categories.value = res.filter(c => c.parentId === 0)
  }
  catch {
    // handled in http.ts
  }
}

function selectCategory(id: number | null) {
  activeCategoryId.value = id
  fetchProducts()
}

const products = ref<IProduct[]>([])
const loading = ref(false)
const keyword = ref('')

async function fetchProducts() {
  loading.value = true
  try {
    const res = await getAllProducts({
      keyword: keyword.value || undefined,
      categoryId: activeCategoryId.value ?? undefined,
    })
    products.value = res
  }
  catch {
    // handled in http.ts
  }
  finally {
    loading.value = false
  }
}

function toDetail(id: number) {
  uni.navigateTo({ url: `/pages/product/detail?id=${id}` })
}

onLoad(async () => {
  await fetchCategories()
  fetchProducts()
})
</script>

<template>
  <view class="min-h-screen bg-[var(--brand-bg)] pb-safe">
    <NavBar :title="t('page.home')" :show-back="false" />
    <view class="relative z-10 bg-[var(--brand-surface)] px-4 py-4 shadow-sm">
      <view class="flex items-center border border-[var(--brand-border)] rounded-2xl bg-[var(--brand-bg)] px-4 py-3">
        <text class="i-carbon-search mr-2 text-lg text-[var(--brand-text-muted)]" />
        <input
          v-model="keyword"
          :placeholder="t('productList.searchPlaceholder')"
          class="flex-1 bg-transparent text-sm text-[var(--brand-text-primary)]"
          confirm-type="search"
          @confirm="fetchProducts"
        >
      </view>
    </view>

    <scroll-view
      scroll-x
      class="relative z-0 border-b border-[var(--brand-border)] bg-[var(--brand-surface)]"
      :show-scrollbar="false"
    >
      <view class="flex items-center px-4 py-3 space-x-2">
        <view
          class="category-tab"
          :class="activeCategoryId === null ? 'bg-[var(--brand-primary)] text-[var(--brand-surface)] rounded-full px-5 py-1.5' : 'text-[var(--brand-text-secondary)] px-4 py-1.5'"
          @tap="selectCategory(null)"
        >
          {{ t('productList.all') }}
        </view>
        <view
          v-for="cat in categories"
          :key="cat.id"
          class="category-tab"
          :class="activeCategoryId === cat.id ? 'bg-[var(--brand-primary)] text-[var(--brand-surface)] rounded-full px-5 py-1.5' : 'text-[var(--brand-text-secondary)] px-4 py-1.5'"
          @tap="selectCategory(cat.id)"
        >
          {{ cat.name }}
        </view>
      </view>
    </scroll-view>

    <view v-if="loading" class="py-20 text-center text-sm text-[var(--brand-text-muted)]">
      {{ t('productList.loading') }}
    </view>

    <view v-else-if="products.length === 0" class="py-20 text-center text-sm text-[var(--brand-text-muted)]">
      {{ t('productList.noProducts') }}
    </view>

    <view v-else class="grid grid-cols-2 gap-4 p-4">
      <view
        v-for="item in products"
        :key="item.id"
        class="flex flex-col overflow-hidden border border-[var(--brand-border)] rounded-2xl bg-[var(--brand-surface)] shadow-sm"
        @tap="toDetail(item.id)"
      >
        <image
          :src="item.images[0] || '/static/logo.svg'"
          mode="aspectFill"
          class="h-48 w-full object-cover"
        />
        <view class="flex flex-1 flex-col p-3">
          <view class="line-clamp-2 mb-1 text-sm text-[var(--brand-text-primary)] font-medium leading-relaxed">
            {{ item.name }}
          </view>
          <view class="mb-3 mt-1 text-[10px] text-[var(--brand-text-muted)]">
            <text class="rounded bg-[var(--brand-bg)] px-2 py-0.5">{{ item.categoryName || '—' }}</text>
          </view>
          <view class="mt-auto flex items-baseline justify-between">
            <view class="text-lg text-[var(--brand-primary)] font-bold">
              <text class="mr-0.5 text-xs">¥</text>{{ item.skus.length > 0 ? Math.min(...item.skus.map(s => Number(s.price))).toFixed(2) : '—' }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.category-tab {
  flex-shrink: 0;
  font-size: 14px;
  white-space: nowrap;
  font-weight: 500;
  transition: all 0.3s ease;
}
</style>
