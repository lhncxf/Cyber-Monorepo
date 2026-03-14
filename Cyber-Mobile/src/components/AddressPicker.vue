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
    class="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
    @tap="openPicker"
  >
    <view v-if="displayText" class="flex-1 pr-3">
      <view class="mb-1 flex items-center gap-2">
        <view class="text-sm text-gray-800 font-bold">
          {{ displayText.namePhone }}
        </view>
        <view
          v-if="displayText.isDefault"
          class="rounded bg-green-50 px-1.5 py-0.5 text-xs text-green-600"
        >
          {{ t('addressManage.defaultTag') }}
        </view>
      </view>
      <view class="text-sm text-gray-500 leading-relaxed">
        {{ displayText.address }}
      </view>
    </view>

    <view v-else class="flex-1 text-sm text-gray-400">
      {{ t('addressPicker.selectAddress') }}
    </view>

    <text class="flex-shrink-0 text-xl text-gray-300">›</text>
  </view>
</template>
