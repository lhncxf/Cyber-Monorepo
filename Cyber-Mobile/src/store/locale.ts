import { defineStore } from 'pinia'
import i18n from '@/locales'

export type LocaleType = 'zh-CN' | 'en'

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<LocaleType>('zh-CN')

  function setLocale(lang: LocaleType) {
    locale.value = lang
    i18n.global.locale.value = lang
  }

  return { locale, setLocale }
}, { persist: true })
