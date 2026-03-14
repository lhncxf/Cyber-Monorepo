<script lang="ts" setup>
import type { SvgName } from "~virtual/svg-component"
import { Icon } from "@iconify/vue"

interface Props {
  /** 图标标识，支持三种格式：
   * - `svg:name` → 本地 SvgIcon（对应 assets/icons/*.svg）
   * - `iconify:集合:图标名`（如 `iconify:mdi:home`）或直接写 Iconify 格式（如 `mdi:home`）→ Iconify 图标
   * - 其他字符串 → Element Plus 图标组件名（如 `HomeFilled`）
   */
  icon: string
  /** 图标尺寸，默认继承 font-size */
  size?: number | string
  /** 图标颜色，默认继承 color */
  color?: string
}

const { icon, size, color } = defineProps<Props>()

/** 是否为本地 SVG 图标（svg:name 格式） */
const isSvgIcon = computed(() => icon.startsWith("svg:"))
/** 本地 SVG 图标名称 */
const svgName = computed(() => icon.slice(4) as SvgName)

/** 是否为 Iconify 图标：
 * - 以 "iconify:" 开头（显式声明）
 * - 或包含 ":" 但不以 "el:" 开头（Iconify 格式如 mdi:home）
 */
const isIconifyIcon = computed(() => {
  if (isSvgIcon.value) return false
  if (icon.startsWith("iconify:")) return true
  // Iconify 格式：集合名:图标名（如 mdi:home, ep:home-filled）
  return icon.includes(":") && !icon.startsWith("el:")
})
/** Iconify 图标 ID（去掉可选的 "iconify:" 前缀） */
const iconifyName = computed(() => icon.startsWith("iconify:") ? icon.slice(8) : icon)

/** 是否为 Element Plus 图标 */
const isElIcon = computed(() => !isSvgIcon.value && !isIconifyIcon.value)

const iconStyle = computed(() => ({
  fontSize: size ? (typeof size === "number" ? `${size}px` : size) : undefined,
  color: color || undefined,
  width: "1em",
  height: "1em",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center"
}))
</script>

<template>
  <!-- 本地 SVG 图标 -->
  <SvgIcon v-if="isSvgIcon" :name="svgName" :style="iconStyle" />
  <!-- Iconify 图标 -->
  <Icon v-else-if="isIconifyIcon" :icon="iconifyName" :style="iconStyle" />
  <!-- Element Plus 图标（全局注册的组件名） -->
  <el-icon v-else-if="isElIcon && icon" :size="size" :color="color">
    <component :is="icon" />
  </el-icon>
</template>
