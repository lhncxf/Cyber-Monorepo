import type { LocaleType } from "@@/locales"
import i18n from "@@/locales"
import { pinia } from "@/pinia"

const LOCALE_KEY = "v3-locale"

export const useLocaleStore = defineStore("locale", () => {
  const locale = ref<LocaleType>((localStorage.getItem(LOCALE_KEY) as LocaleType) ?? "zh-CN")

  i18n.global.locale.value = locale.value

  function setLocale(lang: LocaleType) {
    locale.value = lang
    i18n.global.locale.value = lang
    localStorage.setItem(LOCALE_KEY, lang)
  }

  return { locale, setLocale }
})

export function useLocaleStoreOutside() {
  return useLocaleStore(pinia)
}
