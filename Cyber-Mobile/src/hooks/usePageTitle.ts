import { useLocaleStore } from '@/store/locale'

export function usePageTitle(titleKey: string) {
  const { t } = useI18n()
  const localeStore = useLocaleStore()

  function applyTitle() {
    uni.setNavigationBarTitle({ title: t(titleKey) })
  }

  onMounted(() => {
    applyTitle()
  })

  watch(() => localeStore.locale, () => {
    applyTitle()
  })
}
