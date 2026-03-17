<script lang="ts" setup>
import type { IShippingAddress } from '@/api/mobile/types'
import { useAddressStore } from '@/store/address'

defineOptions({ name: 'AddressPicker' })

const props = defineProps<{
  modelValue?: IShippingAddress | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: IShippingAddress | null): void
}>()

const { t } = useI18n()
const addressStore = useAddressStore()

// Sync from store when component mounts or becomes visible
onMounted(() => {
  syncFromStore()
})

onShow(() => {
  syncFromStore()
})

function syncFromStore() {
  if (addressStore.selectedAddress && addressStore.selectedAddress !== props.modelValue) {
    emit('update:modelValue', addressStore.selectedAddress)
  }
}

function openPicker() {
  // Store current selection so address list can pre-highlight it
  if (props.modelValue) {
    addressStore.setSelectedAddress(props.modelValue)
  }
  uni.navigateTo({ url: '/pages/me/address/index?mode=pick' })
}

const displayText = computed(() => {
  const addr = props.modelValue
  if (!addr)
    return null
  const district = addr.district ? ` ${addr.district}` : ''
  return {
    namePhone: `${addr.name}  ${addr.phone}`,
    address: `${addr.province} ${addr.city}${district} ${addr.detail}`,
    isDefault: addr.isDefault,
  }
})
</script>

<template>
  <view
    class="flex items-center justify-between border border-[var(--brand-border)] rounded-2xl bg-[var(--brand-surface)] p-4"
    @tap="openPicker"
  >
    <view v-if="displayText" class="flex-1 pr-3">
      <view class="mb-1 flex items-center gap-2">
        <view class="text-sm text-[var(--brand-text-primary)] font-semibold">
          {{ displayText.namePhone }}
        </view>
        <view
          v-if="displayText.isDefault"
          class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-[var(--brand-text-secondary)] font-medium"
        >
          {{ t('addressManage.defaultTag') }}
        </view>
      </view>
      <view class="text-sm text-[var(--brand-text-secondary)] leading-relaxed">
        {{ displayText.address }}
      </view>
    </view>

    <view v-else class="flex-1 text-sm text-[var(--brand-text-muted)]">
      {{ t('addressPicker.selectAddress') }}
    </view>

    <view class="h-6 w-6 flex flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-400">
      ›
    </view>
  </view>
</template>
