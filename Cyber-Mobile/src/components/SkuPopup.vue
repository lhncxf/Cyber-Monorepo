<script lang="ts" setup>
import type { IProduct, IProductSku } from '@/api/mobile/types'

defineOptions({ name: 'SkuPopup' })

const props = defineProps<{
  product: IProduct | null
  visible: boolean
  mode: 'cart' | 'buyNow' | 'changeSpec'
  initialSkuName?: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'confirm', payload: { sku: IProductSku, quantity: number, mode: 'cart' | 'buyNow' | 'changeSpec' }): void
}>()

const { t } = useI18n()

interface SpecGroup {
  name: string
  values: string[]
}

function parseSkuValues(name: string): string[] {
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

function parseSkuEntries(name: string): { groupName: string, value: string }[] {
  try {
    const parsed = JSON.parse(name)
    if (Array.isArray(parsed)) {
      if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
        return parsed.map((item: Record<string, string>) => ({
          groupName: Object.keys(item)[0] ?? '',
          value: Object.values(item)[0] ?? '',
        }))
      }
      return parsed.map((v: string, i: number) => ({ groupName: `dim-${i}`, value: String(v) }))
    }
  }
  catch {}
  return [{ groupName: 'dim-0', value: name }]
}

const availableSkus = computed(() => props.product?.skus.filter(s => s.status) ?? [])

const specGroups = computed<SpecGroup[]>(() => {
  const skus = availableSkus.value
  if (skus.length === 0)
    return []

  const entries = parseSkuEntries(skus[0].name)
  const groups: SpecGroup[] = entries.map(e => ({ name: e.groupName, values: [] }))

  for (const sku of skus) {
    const parts = parseSkuValues(sku.name)
    parts.forEach((part, i) => {
      if (i < groups.length && !groups[i].values.includes(part)) {
        groups[i].values.push(part)
      }
    })
  }

  return groups
})

const selectedValues = ref<string[]>([])
const quantity = ref(1)

function resetSelection() {
  const groups = specGroups.value
  if (groups.length === 0) {
    selectedValues.value = []
    return
  }
  selectedValues.value = Array.from<string>({ length: groups.length }).fill('')
  quantity.value = 1

  if (props.initialSkuName) {
    const initial = parseSkuValues(props.initialSkuName)
    if (initial.length === groups.length) {
      selectedValues.value = [...initial]
      return
    }
  }

  autoSelectFirstAvailable()
}

function autoSelectFirstAvailable() {
  const skus = availableSkus.value
  const target = skus.find(s => s.stock > 0) ?? (skus.length > 0 ? skus[0] : null)
  if (!target)
    return
  selectedValues.value = parseSkuValues(target.name)
}

watch(
  () => [props.product, props.visible] as const,
  ([, visible]) => {
    if (!visible || !props.product)
      return
    resetSelection()
  },
)

const selectedSku = computed<IProductSku | null>(() => {
  if (selectedValues.value.includes(''))
    return null
  return availableSkus.value.find((s) => {
    const parts = parseSkuValues(s.name)
    return parts.length === selectedValues.value.length
      && parts.every((p, i) => p === selectedValues.value[i])
  }) ?? null
})

function isValueImpossible(dimIdx: number, value: string): boolean {
  const candidate = [...selectedValues.value]
  candidate[dimIdx] = value

  const matched = availableSkus.value.filter((sku) => {
    const parts = parseSkuValues(sku.name)
    return candidate.every((v, i) => v === '' || parts[i] === v)
  })

  return matched.length === 0
}

function isValueSoldOut(dimIdx: number, value: string): boolean {
  const candidate = [...selectedValues.value]
  candidate[dimIdx] = value

  const matched = availableSkus.value.filter((sku) => {
    const parts = parseSkuValues(sku.name)
    return candidate.every((v, i) => v === '' || parts[i] === v)
  })

  return matched.length > 0 && matched.every(s => s.stock <= 0)
}

function selectValue(dimIdx: number, value: string) {
  if (isValueImpossible(dimIdx, value))
    return
  const next = [...selectedValues.value]
  next[dimIdx] = value
  selectedValues.value = next
  quantity.value = 1
}

function changeQty(delta: number) {
  const next = quantity.value + delta
  if (next < 1)
    return
  if (selectedSku.value && next > selectedSku.value.stock) {
    uni.showToast({ title: t('sku.exceedsStock'), icon: 'none' })
    return
  }
  quantity.value = next
}

function confirm() {
  if (selectedValues.value.includes('')) {
    uni.showToast({ title: t('sku.selectFullSpec'), icon: 'none' })
    return
  }
  if (!selectedSku.value) {
    uni.showToast({ title: t('sku.currentSoldOut'), icon: 'none' })
    return
  }
  if (selectedSku.value.stock <= 0) {
    uni.showToast({ title: t('sku.currentSoldOut'), icon: 'none' })
    return
  }
  emit('confirm', { sku: selectedSku.value, quantity: quantity.value, mode: props.mode })
  emit('update:visible', false)
}

function close() {
  emit('update:visible', false)
}

const firstImage = computed(() => {
  const imgs = props.product?.images ?? []
  return imgs[0] || '/static/logo.svg'
})

const selectionLabel = computed(() => {
  if (selectedValues.value.every(v => v === ''))
    return t('sku.selectSpec')
  const groups = specGroups.value
  const filled = selectedValues.value.filter(v => v !== '')
  if (filled.length < groups.length)
    return `${t('sku.selected')}${filled.join(' / ')}${t('sku.continueSelect')}`
  if (selectedSku.value && selectedSku.value.stock <= 0)
    return `${t('sku.selected')}${filled.join(' / ')}${t('sku.soldOut')}`
  return `${t('sku.selected')}${filled.join(' / ')}`
})

const confirmButtonText = computed(() => {
  if (props.mode === 'changeSpec')
    return t('sku.confirmChangeSpec')
  if (props.mode === 'cart')
    return t('sku.addToCart')
  return t('sku.buyNow')
})

const isSoldOut = computed(() => {
  if (selectedValues.value.includes(''))
    return false
  return selectedSku.value ? selectedSku.value.stock <= 0 : false
})
</script>

<template>
  <view v-if="visible" class="fixed inset-0 z-50" @tap.stop="close">
    <view class="absolute inset-0 bg-black/40" />
    <view
      class="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white pb-safe"
      style="max-height: 85vh; overflow-y: auto;"
      @tap.stop
    >
      <view class="flex justify-center pb-1 pt-3">
        <view class="h-1 w-10 rounded-full bg-gray-200" />
      </view>
      <view class="flex items-start gap-3 p-4">
        <image
          :src="firstImage"
          mode="aspectFill"
          class="h-24 w-24 flex-shrink-0 rounded-xl"
        />
        <view class="flex-1 pt-1">
          <view v-if="selectedSku" class="mb-1 text-xl font-bold" :class="isSoldOut ? 'text-gray-400' : 'text-[var(--brand-accent)]'">
            ¥{{ selectedSku.price.toFixed(2) }}
          </view>
          <view v-else class="mb-1 text-xl text-[var(--brand-accent)] font-bold">
            —
          </view>
          <view class="text-sm" :class="isSoldOut ? 'text-red-400' : 'text-gray-500'">
            {{ selectionLabel }}
          </view>
          <view v-if="selectedSku && !isSoldOut" class="mt-1 text-xs text-gray-400">
            {{ t('sku.stock') }}{{ selectedSku.stock }}
          </view>
          <view v-if="isSoldOut" class="mt-1 text-xs text-red-400 font-medium">
            {{ t('sku.specSoldOut') }}
          </view>
        </view>
        <view class="h-7 w-7 flex items-center justify-center rounded-full bg-gray-100" @tap="close">
          <text class="text-base text-gray-500 leading-none">×</text>
        </view>
      </view>

      <view class="px-4 pb-2">
        <view
          v-for="(group, dimIdx) in specGroups"
          :key="dimIdx"
          class="mb-4"
        >
          <view class="mb-2 text-sm text-gray-700 font-medium">
            {{ group.name }}
          </view>

          <view class="flex flex-wrap gap-2">
            <view
              v-for="val in group.values"
              :key="val"
              class="relative border rounded-full px-4 py-1.5 text-sm transition-colors"
              :class="[
                isValueImpossible(dimIdx, val)
                  ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'
                  : isValueSoldOut(dimIdx, val)
                    ? selectedValues[dimIdx] === val
                      ? 'border-gray-400 text-gray-400 bg-gray-100'
                      : 'border-gray-200 text-gray-400 bg-gray-50'
                    : selectedValues[dimIdx] === val
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white font-medium'
                      : 'border-[var(--brand-border)] text-[var(--brand-text-primary)]',
              ]"
              @tap="selectValue(dimIdx, val)"
            >
              {{ val }}
              <text v-if="isValueSoldOut(dimIdx, val)" class="absolute rounded bg-[var(--brand-primary)] px-1 py-0.5 text-[10px] text-white leading-none -right-1 -top-1.5">{{ t('sku.soldOutTag') }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="mx-4 mb-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <view class="text-sm text-gray-700">
          {{ t('sku.quantity') }}
        </view>
        <view class="flex items-center gap-4">
          <view
            class="h-9 w-9 flex items-center justify-center border border-[var(--brand-border)] rounded-full text-lg text-[var(--brand-text-primary)] font-light active:bg-gray-100"
            @tap="changeQty(-1)"
          >
            -
          </view>
          <view class="w-6 text-center text-base">
            {{ quantity }}
          </view>
          <view
            class="h-9 w-9 flex items-center justify-center border border-[var(--brand-border)] rounded-full text-lg text-[var(--brand-text-primary)] font-light active:bg-gray-100"
            @tap="changeQty(1)"
          >
            +
          </view>
        </view>
      </view>

      <view class="mx-4 mb-4">
        <button
          class="w-full rounded-full py-3 text-sm text-white font-medium"
          :class="isSoldOut ? 'bg-gray-300' : 'bg-[var(--brand-primary)]'"
          :disabled="isSoldOut"
          @tap="confirm"
        >
          {{ isSoldOut ? t('sku.soldOutBtn') : confirmButtonText }}
        </button>
      </view>
    </view>
  </view>
</template>
