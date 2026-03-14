<script lang="ts" setup>
import type { RouteRecordRaw } from "vue-router"
import { isExternal } from "@@/utils/validate"
import path from "path-browserify"
import Link from "./Link.vue"

interface Props {
  item: RouteRecordRaw
  basePath?: string
}

const { item, basePath = "" } = defineProps<Props>()

const { t } = useI18n()

/** 翻译菜单标题，找不到翻译时回退到原始中文名 */
function menuTitle(title?: string) {
  if (!title) return ""
  return t(`menuNames.${title}`, title)
}

/** 是否始终显示根菜单 */
const alwaysShowRootMenu = computed(() => item.meta?.alwaysShow)

/** 显示的子菜单 */
const showingChildren = computed(() => item.children?.filter(child => !child.meta?.hidden) ?? [])

/** 显示的子菜单数量 */
const showingChildNumber = computed(() => showingChildren.value.length)

/** 唯一的子菜单项 */
const theOnlyOneChild = computed(() => {
  const number = showingChildNumber.value
  switch (true) {
    case number > 1:
      return null
    case number === 1:
      return showingChildren.value[0]
    default:
      return { ...item, path: "" }
  }
})

/** 解析路径 */
function resolvePath(routePath: string) {
  switch (true) {
    case isExternal(routePath):
      return routePath
    case isExternal(basePath):
      return basePath
    default:
      return path.resolve(basePath, routePath)
  }
}
</script>

<template>
  <template v-if="!alwaysShowRootMenu && theOnlyOneChild && !theOnlyOneChild.children">
    <Link v-if="theOnlyOneChild.meta" :to="resolvePath(theOnlyOneChild.path)">
      <el-menu-item :index="resolvePath(theOnlyOneChild.path)">
        <SvgIcon v-if="theOnlyOneChild.meta.svgIcon" :name="theOnlyOneChild.meta.svgIcon" class="svg-icon" />
        <AppIcon v-else-if="theOnlyOneChild.meta.icon" :icon="theOnlyOneChild.meta.icon" class="app-icon" />
        <template v-if="theOnlyOneChild.meta.title" #title>
          <span class="title">{{ menuTitle(theOnlyOneChild.meta.title) }}</span>
        </template>
      </el-menu-item>
    </Link>
  </template>
  <el-sub-menu v-else :index="resolvePath(item.path)" teleported>
    <template #title>
      <SvgIcon v-if="item.meta?.svgIcon" :name="item.meta.svgIcon" class="svg-icon" />
      <AppIcon v-else-if="item.meta?.icon" :icon="item.meta.icon" class="app-icon" />
      <span v-if="item.meta?.title" class="title">{{ menuTitle(item.meta.title) }}</span>
    </template>
    <template v-if="item.children">
      <Item
        v-for="child in showingChildren"
        :key="child.path"
        :item="child"
        :base-path="resolvePath(child.path)"
      />
    </template>
  </el-sub-menu>
</template>

<style lang="scss" scoped>
@import "@@/assets/styles/mixins.scss";

.svg-icon {
  min-width: 1em;
  margin-right: 12px;
  font-size: 18px;
}

.app-icon {
  margin-right: 12px;
  font-size: 18px;
}

.title {
  @extend %ellipsis;
}
</style>
