import i18n from "@@/locales"

const VITE_APP_TITLE = import.meta.env.VITE_APP_TITLE ?? "V3 Admin Vite"

const dynamicTitle = ref<string>("")
const rawTitle = ref<string>("")

watch(dynamicTitle, (value, oldValue) => {
  if (document && value !== oldValue) {
    document.title = value
  }
})

function applyTitle(raw?: string) {
  if (!raw) {
    dynamicTitle.value = VITE_APP_TITLE
    return
  }
  dynamicTitle.value = `${VITE_APP_TITLE} | ${i18n.global.t(`menuNames.${raw}`, raw)}`
}

export function useTitle() {
  function setTitle(title?: string) {
    rawTitle.value = title ?? ""
    applyTitle(title)
  }

  return { setTitle }
}
