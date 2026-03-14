<script lang="ts" setup>
import type { ICreateAddressForm, IShippingAddress, IUpdateAddressForm } from '@/api/mobile/types'
import { regionData } from 'element-plus-china-area'
import {
  createAddress,
  getAddresses,
  updateAddress,
} from '@/api/mobile/addresses'
import { usePageTitle } from '@/hooks/usePageTitle'

defineOptions({ name: 'AddressEdit' })

const { t } = useI18n()
usePageTitle('page.addressEdit')

definePage({
  style: { navigationBarTitleText: '编辑地址' },
})

// ─── Region picker data ───────────────────────────────────────────────────────

// ─── State ────────────────────────────────────────────────────────────────────

const editMode = ref(false)
const isSaving = ref(false)

interface AddressFormData {
  id?: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

const form = ref<AddressFormData>({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false,
})

// ─── Region picker ────────────────────────────────────────────────────────────

// regionData: Array<{ value, label, children: Array<{ value, label, children: Array<{ value, label }> }> }>
const provinceList = regionData.map((p: { value: string, label: string }) => p.label)

// Multi-column picker indices
const regionPickerValue = ref<number[]>([0, 0, 0])

// Computed column data for multiSelector
const cityList = computed(() => {
  const pIdx = regionPickerValue.value[0] ?? 0
  const prov = regionData[pIdx]
  return prov?.children?.map((c: { value: string, label: string }) => c.label) ?? []
})

const districtList = computed(() => {
  const pIdx = regionPickerValue.value[0] ?? 0
  const cIdx = regionPickerValue.value[1] ?? 0
  const city = regionData[pIdx]?.children?.[cIdx]
  return city?.children?.map((d: { value: string, label: string }) => d.label) ?? []
})

const pickerColumns = computed(() => [
  provinceList,
  cityList.value,
  districtList.value,
])

function onRegionColumnChange(e: { detail: { column: number, value: number } }) {
  const { column, value } = e.detail
  const newVal = [...regionPickerValue.value]
  newVal[column] = value
  // Reset dependent columns
  if (column === 0) {
    newVal[1] = 0
    newVal[2] = 0
  }
  else if (column === 1) {
    newVal[2] = 0
  }
  regionPickerValue.value = newVal
}

function onRegionConfirm(e: { detail: { value: number[] } }) {
  const [pIdx, cIdx, dIdx] = e.detail.value
  const province = regionData[pIdx]?.label ?? ''
  const city = regionData[pIdx]?.children?.[cIdx]?.label ?? ''
  const district = regionData[pIdx]?.children?.[cIdx]?.children?.[dIdx]?.label ?? ''
  form.value.province = province
  form.value.city = city
  form.value.district = district
}

const regionDisplayText = computed(() => {
  const parts = [form.value.province, form.value.city, form.value.district].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : t('addressManage.provincePlaceholder')
})

// Sync picker indices from existing province/city/district text (when editing)
function syncPickerFromForm() {
  if (!form.value.province)
    return
  const pIdx = regionData.findIndex((p: { label: string }) => p.label === form.value.province)
  if (pIdx < 0)
    return
  const cIdx = regionData[pIdx]?.children?.findIndex((c: { label: string }) => c.label === form.value.city) ?? 0
  const safeC = cIdx < 0 ? 0 : cIdx
  const dIdx = regionData[pIdx]?.children?.[safeC]?.children?.findIndex((d: { label: string }) => d.label === form.value.district) ?? 0
  regionPickerValue.value = [pIdx, safeC < 0 ? 0 : safeC, dIdx < 0 ? 0 : dIdx]
}

// ─── Load existing address when editing ───────────────────────────────────────

onLoad(async (options) => {
  const id = options?.id ? Number(options.id) : null
  if (id) {
    editMode.value = true
    try {
      const list = await getAddresses()
      const addr = list.find((a: IShippingAddress) => a.id === id)
      if (addr) {
        form.value = {
          id: addr.id,
          name: addr.name,
          phone: addr.phone,
          province: addr.province,
          city: addr.city,
          district: addr.district || '',
          detail: addr.detail,
          isDefault: addr.isDefault,
        }
        syncPickerFromForm()
      }
    }
    catch {
      uni.showToast({ title: t('addressManage.loadFailed'), icon: 'none' })
    }
  }
})

// ─── Validation ───────────────────────────────────────────────────────────────

function validateForm(): string | null {
  if (!form.value.name.trim())
    return t('addressManage.nameRequired')
  if (!form.value.phone.trim())
    return t('addressManage.phoneRequired')
  if (!form.value.province.trim())
    return t('addressManage.provinceRequired')
  if (!form.value.city.trim())
    return t('addressManage.cityRequired')
  if (!form.value.detail.trim())
    return t('addressManage.detailRequired')
  return null
}

// ─── Save ─────────────────────────────────────────────────────────────────────

async function handleSave() {
  const err = validateForm()
  if (err) {
    uni.showToast({ title: err, icon: 'none' })
    return
  }
  isSaving.value = true
  try {
    if (editMode.value) {
      const payload: IUpdateAddressForm = {
        id: form.value.id!,
        name: form.value.name,
        phone: form.value.phone,
        province: form.value.province,
        city: form.value.city,
        district: form.value.district || undefined,
        detail: form.value.detail,
        isDefault: form.value.isDefault,
      }
      await updateAddress(payload)
    }
    else {
      const payload: ICreateAddressForm = {
        name: form.value.name,
        phone: form.value.phone,
        province: form.value.province,
        city: form.value.city,
        district: form.value.district || undefined,
        detail: form.value.detail,
        isDefault: form.value.isDefault,
      }
      await createAddress(payload)
    }
    uni.showToast({ title: t('addressManage.saveSuccess'), icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  }
  catch {
    // handled by http
  }
  finally {
    isSaving.value = false
  }
}
</script>

<template>
  <view class="min-h-screen bg-gray-50 pb-safe">
    <view class="flex flex-col gap-4 px-4 py-4">
      <!-- Name -->
      <view class="rounded-xl bg-white p-4">
        <view class="mb-2 text-sm text-gray-600">
          {{ t('addressManage.name') }} <text class="text-red-500">*</text>
        </view>
        <input
          v-model="form.name"
          :placeholder="t('addressManage.namePlaceholder')"
          class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800"
        >
      </view>

      <!-- Phone -->
      <view class="rounded-xl bg-white p-4">
        <view class="mb-2 text-sm text-gray-600">
          {{ t('addressManage.phone') }} <text class="text-red-500">*</text>
        </view>
        <input
          v-model="form.phone"
          :placeholder="t('addressManage.phonePlaceholder')"
          type="number"
          class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800"
        >
      </view>

      <!-- Province / City / District Picker -->
      <view class="rounded-xl bg-white p-4">
        <view class="mb-2 text-sm text-gray-600">
          {{ t('addressManage.province') }} / {{ t('addressManage.city') }} / {{ t('addressManage.district') }}
          <text class="text-red-500">*</text>
        </view>
        <picker
          mode="multiSelector"
          :range="pickerColumns"
          :value="regionPickerValue"
          @columnchange="onRegionColumnChange"
          @change="onRegionConfirm"
        >
          <view class="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5">
            <text class="text-sm" :class="form.province ? 'text-gray-800' : 'text-gray-400'">
              {{ regionDisplayText }}
            </text>
            <text class="text-gray-400">›</text>
          </view>
        </picker>
      </view>

      <!-- Detail -->
      <view class="rounded-xl bg-white p-4">
        <view class="mb-2 text-sm text-gray-600">
          {{ t('addressManage.detail') }} <text class="text-red-500">*</text>
        </view>
        <textarea
          v-model="form.detail"
          :placeholder="t('addressManage.detailPlaceholder')"
          class="min-h-16 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800"
        />
      </view>

      <!-- Is default toggle -->
      <view class="flex items-center justify-between rounded-xl bg-white px-4 py-4">
        <view class="text-sm text-gray-700">
          {{ t('addressManage.isDefault') }}
        </view>
        <switch :checked="form.isDefault" color="#16a34a" @change="form.isDefault = $event.detail.value" />
      </view>
    </view>

    <!-- Save button (sticky bottom) -->
    <view class="shadow-top fixed bottom-0 left-0 right-0 bg-white px-4 py-3 pb-safe">
      <button
        class="w-full rounded-full bg-green-600 py-3 text-sm text-white font-medium"
        :disabled="isSaving"
        @tap="handleSave"
      >
        {{ isSaving ? t('addressManage.saving') : t('addressManage.save') }}
      </button>
    </view>
  </view>
</template>
