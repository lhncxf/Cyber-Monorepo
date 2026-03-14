import { createI18n } from "vue-i18n"
import en from "./en"
import zhCN from "./zh-CN"

export type LocaleType = "zh-CN" | "en"

const i18n = createI18n({
  legacy: false,
  locale: "zh-CN",
  fallbackLocale: "zh-CN",
  messages: {
    "zh-CN": zhCN,
    "en": en
  }
})

export default i18n
