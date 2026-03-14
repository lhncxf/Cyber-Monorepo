<script lang="ts" setup>
import type { IShippingAddress } from '@/api/mobile/types'
import {
  deleteAddress,
  getAddresses,
  setDefaultAddress,
} from '@/api/mobile/addresses'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAddressStore } from '@/store/address'

defineOptions({ name: 'AddressManage' })

const { t } = useI18n()
usePageTitle('page.addressManage')

definePage({
  style: { navigationBarTitleText: '我的地址' },
})

// ─── Mode ─────────────────────────────────────────────────────────────────────

const isPickMode = ref(false)
const addressStore = useAddressStore()

onLoad((options) => {
  isPickMode.value = options?.mode === 'pick'
})

// ─── State ────────────────────────────────────────────────────────────────────

const addresses = ref<IShippingAddress[]>([])
const loading = ref(false)

// ─── Load (refresh on every show) ────────────────────────────────────────────

async function loadAddresses() {
  loading.value = true
  try {
    addresses.value = await getAddresses()
  }
  catch {
    addresses.value = []
  }
  finally {
    loading.value = false
  }
}

onShow(() => {
  loadAddresses()
})

// ─── Navigation ───────────────────────────────────────────────────────────────

function openCreate() {
  uni.navigateTo({ url: '/pages/me/address/edit' })
}

function openEdit(addr: IShippingAddress) {
  uni.navigateTo({ url: `/pages/me/address/edit?id=${addr.id}` })
}

// ─── Pick mode: select address and go back ────────────────────────────────────

function pickAddress(addr: IShippingAddress) {
  addressStore.setSelectedAddress(addr)
  uni.navigateBack()
}

// ─── Manage mode actions ──────────────────────────────────────────────────────

async function handleSetDefault(addr: IShippingAddress) {
  if (addr.isDefault)
    return
  try {
    await setDefaultAddress(addr.id)
    await loadAddresses()
  }
  catch {
    // handled by http
  }
}

function handleDelete(addr: IShippingAddress) {
  uni.showModal({
    title: t('addressManage.confirmDeleteTitle'),
    content: t('addressManage.confirmDeleteContent'),
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteAddress(addr.id)
          uni.showToast({ title: t('addressManage.deleteSuccess'), icon: 'success' })
          await loadAddresses()
        }
        catch {
          // handled
        }
      }
    },
  })
}
</script>

<template>
  <view class="min-h-screen bg-gray-50 pb-safe">
    <!-- Loading state -->
    <view v-if="loading" class="py-12 text-center text-sm text-gray-400">
      {{ t('addressManage.loading') }}
    </view>

    <!-- Address list -->
    <view v-else>
      <view v-if="addresses.length === 0" class="flex flex-col items-center gap-3 py-20">
        <text class="text-4xl">📭</text>
        <view class="text-sm text-gray-400">
          {{ t('addressManage.noAddresses') }}
        </view>
        <view class="text-xs text-gray-400">
          {{ t('addressManage.addFirst') }}
        </view>
      </view>

      <view v-else class="flex flex-col gap-3 px-3 pt-3">
        <view
          v-for="addr in addresses"
          :key="addr.id"
          class="rounded-xl bg-white p-4 shadow-sm"
          :class="isPickMode ? 'active:opacity-70' : ''"
          @tap="isPickMode ? pickAddress(addr) : undefined"
        >
          <!-- Top row -->
          <view class="mb-2 flex items-center justify-between">
            <view class="flex items-center gap-2">
              <view class="text-sm text-gray-800 font-bold">
                {{ addr.name }}
              </view>
              <view class="text-sm text-gray-500">
                {{ addr.phone }}
              </view>
              <view
                v-if="addr.isDefault"
                class="rounded bg-green-50 px-1.5 py-0.5 text-xs text-green-600"
              >
                {{ t('addressManage.defaultTag') }}
              </view>
            </view>
            <!-- Check icon in pick mode -->
            <view v-if="isPickMode && addressStore.selectedAddress?.id === addr.id" class="text-base text-green-600">
              ✓
            </view>
          </view>

          <!-- Address detail -->
          <view class="mb-3 text-sm text-gray-600 leading-relaxed">
            {{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.detail }}
          </view>

          <!-- Actions (only in manage mode) -->
          <view
            v-if="!isPickMode"
            class="flex items-center justify-between border-t border-gray-100 pt-3"
          >
            <view class="flex gap-3">
              <view
                v-if="!addr.isDefault"
                class="text-xs text-blue-500"
                @tap.stop="handleSetDefault(addr)"
              >
                {{ t('addressManage.setDefault') }}
              </view>
            </view>
            <view class="flex gap-4">
              <view class="text-xs text-blue-500" @tap.stop="openEdit(addr)">
                {{ t('addressManage.edit') }}
              </view>
              <view class="text-xs text-red-400" @tap.stop="handleDelete(addr)">
                {{ t('addressManage.delete') }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Add button (sticky bottom) -->
    <view class="shadow-top fixed bottom-0 left-0 right-0 bg-white px-4 py-3 pb-safe">
      <button
        class="w-full rounded-full bg-green-600 py-3 text-sm text-white font-medium"
        @tap="openCreate"
      >
        {{ t('addressManage.addAddress') }}
      </button>
    </view>
  </view>
</template>
