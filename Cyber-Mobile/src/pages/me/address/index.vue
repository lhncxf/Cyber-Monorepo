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
  style: {},
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
  <NavBar :title="t('page.addressManage')" />
  <view class="min-h-screen bg-[var(--brand-bg)] pb-safe">
    <!-- Loading state -->
    <view v-if="loading" class="py-12 text-center text-sm text-gray-400">
      {{ t('addressManage.loading') }}
    </view>

    <!-- Address list -->
    <view v-else>
      <view v-if="addresses.length === 0" class="flex flex-col items-center gap-3 py-20">
        <text class="text-4xl">📭</text>
        <view class="text-sm text-[var(--brand-text-muted)]">
          {{ t('addressManage.noAddresses') }}
        </view>
        <view class="text-xs text-[var(--brand-text-muted)]">
          {{ t('addressManage.addFirst') }}
        </view>
      </view>

      <view v-else class="flex flex-col gap-3 px-3 pt-3">
        <view
          v-for="addr in addresses"
          :key="addr.id"
          class="border border-[var(--brand-border)] rounded-2xl bg-[var(--brand-surface)] p-5"
          :class="isPickMode ? 'active:opacity-70' : ''"
          @tap="isPickMode ? pickAddress(addr) : undefined"
        >
          <!-- Top row -->
          <view class="mb-2 flex items-center justify-between">
            <view class="flex items-center gap-2">
              <view class="text-sm text-[var(--brand-text-primary)] font-semibold">
                {{ addr.name }}
              </view>
              <view class="text-sm text-[var(--brand-text-secondary)]">
                {{ addr.phone }}
              </view>
              <view
                v-if="addr.isDefault"
                class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-[var(--brand-text-secondary)] font-medium"
              >
                {{ t('addressManage.defaultTag') }}
              </view>
            </view>
            <!-- Check icon in pick mode -->
            <view v-if="isPickMode && addressStore.selectedAddress?.id === addr.id" class="h-5 w-5 flex items-center justify-center rounded-full bg-[var(--brand-primary)] text-xs text-white font-bold">
              ✓
            </view>
          </view>

          <!-- Address detail -->
          <view class="mb-3 text-sm text-[var(--brand-text-secondary)] leading-relaxed">
            {{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.detail }}
          </view>

          <!-- Actions (only in manage mode) -->
          <view
            v-if="!isPickMode"
            class="flex items-center justify-between border-t border-[var(--brand-border)] pt-3"
          >
            <view class="flex gap-3">
              <view
                v-if="!addr.isDefault"
                class="text-xs text-[var(--brand-text-secondary)] font-medium"
                @tap.stop="handleSetDefault(addr)"
              >
                {{ t('addressManage.setDefault') }}
              </view>
            </view>
            <view class="flex gap-4">
              <view class="text-xs text-[var(--brand-text-secondary)] font-medium" @tap.stop="openEdit(addr)">
                {{ t('addressManage.edit') }}
              </view>
              <view class="text-xs text-[var(--brand-accent)] font-medium" @tap.stop="handleDelete(addr)">
                {{ t('addressManage.delete') }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Add button (sticky bottom) -->
    <view class="shadow-top fixed bottom-0 left-0 right-0 bg-[var(--brand-surface)] px-4 py-3 pb-safe">
      <button
        class="w-full rounded-full bg-[var(--brand-primary)] py-4 text-sm text-white font-medium"
        @tap="openCreate"
      >
        {{ t('addressManage.addAddress') }}
      </button>
    </view>
  </view>
</template>
