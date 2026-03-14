<script lang="ts" setup>
import type { ICategory, IProduct } from '@/api/mobile/types'
import { getAllProducts, getCategories } from '@/api/mobile/products'
import { usePageTitle } from '@/hooks/usePageTitle'

defineOptions({ name: 'Home' })

const { t } = useI18n()
usePageTitle('page.home')

definePage({
  type: 'home',
  style: { navigationBarTitleText: '首页' },
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
  <view class="min-h-screen bg-gray-50 pb-safe">
    <view class="bg-white px-4 py-3 shadow-sm">
      <view class="flex items-center rounded-full bg-gray-100 px-4 py-2">
        <input
          v-model="keyword"
          :placeholder="t('productList.searchPlaceholder')"
          class="flex-1 text-sm text-gray-700"
          confirm-type="search"
          @confirm="fetchProducts"
        >
      </view>
    </view>

    <scroll-view
      scroll-x
      class="border-b border-gray-100 bg-white"
      :show-scrollbar="false"
    >
      <view class="flex items-center px-2 py-0">
        <view
          class="category-tab"
          :class="activeCategoryId === null ? 'category-tab--active' : 'category-tab--default'"
          @tap="selectCategory(null)"
        >
          {{ t('productList.all') }}
        </view>
        <view
          v-for="cat in categories"
          :key="cat.id"
          class="category-tab"
          :class="activeCategoryId === cat.id ? 'category-tab--active' : 'category-tab--default'"
          @tap="selectCategory(cat.id)"
        >
          {{ cat.name }}
        </view>
      </view>
    </scroll-view>

    <view v-if="loading" class="py-20 text-center text-sm text-gray-400">
      {{ t('productList.loading') }}
    </view>

    <view v-else-if="products.length === 0" class="py-20 text-center text-sm text-gray-400">
      {{ t('productList.noProducts') }}
    </view>

    <view v-else class="grid grid-cols-2 gap-3 p-4">
      <view
        v-for="item in products"
        :key="item.id"
        class="overflow-hidden rounded-xl bg-white shadow-sm"
        @tap="toDetail(item.id)"
      >
        <image
          :src="item.images[0] || '/static/logo.svg'"
          mode="aspectFill"
          class="h-40 w-full"
        />
        <view class="p-3">
          <view class="line-clamp-2 mb-1 text-sm text-gray-800">
            {{ item.name }}
          </view>
          <view class="mb-2 text-xs text-gray-400">
            {{ item.categoryName || '—' }}
          </view>
          <view class="flex items-center justify-between">
            <view class="text-base text-red-500 font-bold">
              ¥{{ item.skus.length > 0 ? Math.min(...item.skus.map(s => Number(s.price))).toFixed(2) : '—' }}
            </view>
            <view class="text-xs text-gray-400">
              {{ t('productList.stock', { n: item.skus.reduce((sum, s) => sum + s.stock, 0) }) }}
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
  padding: 10px 16px;
  font-size: 14px;
  white-space: nowrap;
  position: relative;

  &--default {
    color: #6b7280;
  }

  &--active {
    color: #3b82f6;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 16px;
      right: 16px;
      height: 2px;
      background-color: #3b82f6;
      border-radius: 1px;
    }
  }
}
</style>
