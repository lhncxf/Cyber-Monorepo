import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type ThemeName = 'light' | 'dark' | 'classic'

interface IThemeVars {
  '--brand-primary': string
  '--brand-accent': string
  '--brand-bg': string
  '--brand-surface': string
  '--brand-border': string
  '--brand-text-primary': string
  '--brand-text-secondary': string
  '--brand-text-muted': string
}

const themeVars: Record<ThemeName, IThemeVars> = {
  light: {
    '--brand-primary': '#1a1a1a',
    '--brand-accent': '#c0392b',
    '--brand-bg': '#fafaf8',
    '--brand-surface': '#ffffff',
    '--brand-border': '#f0ece6',
    '--brand-text-primary': '#1a1a1a',
    '--brand-text-secondary': '#6b6b6b',
    '--brand-text-muted': '#a0a0a0',
  },
  dark: {
    '--brand-primary': '#6366f1',
    '--brand-accent': '#818cf8',
    '--brand-bg': '#141414',
    '--brand-surface': '#1f1f1f',
    '--brand-border': '#2e2e2e',
    '--brand-text-primary': '#e5e5e5',
    '--brand-text-secondary': '#a0a0a0',
    '--brand-text-muted': '#6b6b6b',
  },
  classic: {
    '--brand-primary': '#ff4400',
    '--brand-accent': '#ff6600',
    '--brand-bg': '#f5f5f5',
    '--brand-surface': '#ffffff',
    '--brand-border': '#e8e8e8',
    '--brand-text-primary': '#333333',
    '--brand-text-secondary': '#666666',
    '--brand-text-muted': '#999999',
  },
}

function applyThemeH5(vars: IThemeVars) {
  const root = document.documentElement
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value)
  }
  const pageEl = document.querySelector('page') as HTMLElement | null
  if (pageEl) {
    pageEl.style.backgroundColor = vars['--brand-bg']
  }
}

function applyPageBgMP(vars: IThemeVars) {
  uni.setBackgroundColor({
    backgroundColor: vars['--brand-bg'],
  })
}

export const useThemeStore = defineStore(
  'theme',
  () => {
    const theme = ref<ThemeName>('light')

    const themeStyle = computed(() => {
      const vars = themeVars[theme.value]
      return Object.entries(vars)
        .map(([k, v]) => `${k}:${v}`)
        .join(';')
    })

    const bgColor = computed(() => themeVars[theme.value]['--brand-bg'])
    const surfaceColor = computed(() => themeVars[theme.value]['--brand-surface'])
    const borderColor = computed(() => themeVars[theme.value]['--brand-border'])
    const textPrimaryColor = computed(() => themeVars[theme.value]['--brand-text-primary'])

    function setTheme(name: ThemeName) {
      theme.value = name
      // #ifdef H5
      applyThemeH5(themeVars[name])
      // #endif
      // #ifndef H5
      applyPageBgMP(themeVars[name])
      // #endif
    }

    function initTheme() {
      // #ifdef H5
      applyThemeH5(themeVars[theme.value])
      // #endif
      // #ifndef H5
      applyPageBgMP(themeVars[theme.value])
      // #endif
    }

    return { theme, themeStyle, bgColor, surfaceColor, borderColor, textPrimaryColor, setTheme, initTheme }
  },
  { persist: true },
)
