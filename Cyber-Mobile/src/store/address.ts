import type { IShippingAddress } from '@/api/mobile/types'
import { defineStore } from 'pinia'

export const useAddressStore = defineStore(
  'address',
  () => {
    // The address chosen on order confirm page
    const selectedAddress = ref<IShippingAddress | null>(null)

    function setSelectedAddress(addr: IShippingAddress | null) {
      selectedAddress.value = addr
    }

    function clearSelectedAddress() {
      selectedAddress.value = null
    }

    return {
      selectedAddress,
      setSelectedAddress,
      clearSelectedAddress,
    }
  },
  { persist: false },
)
