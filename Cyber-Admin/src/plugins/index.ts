import type { App } from "vue"
import AppIcon from "@@/components/AppIcon/index.vue"
import { installElementPlusIcons } from "./element-plus-icons"
import { installPermissionDirective } from "./permission-directive"
import { installSvgIcon } from "./svg-icon"
import { installVxeTable } from "./vxe-table"

export function installPlugins(app: App) {
  installElementPlusIcons(app)
  installPermissionDirective(app)
  installSvgIcon(app)
  installVxeTable(app)
  // 全局图标组件：统一渲染 svgIcon / iconify / elIcon 三种来源
  app.component("AppIcon", AppIcon)
}
