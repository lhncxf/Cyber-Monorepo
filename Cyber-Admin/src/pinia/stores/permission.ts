import type { MenuData } from "@@/apis/menus/type"
import type { RouteRecordRaw } from "vue-router"
import { getUserMenusApi } from "@@/apis/menus"
import { MenuTypeEnum } from "@@/apis/menus/type"
import { pinia } from "@/pinia"
import { constantRoutes, dynamicRoutes } from "@/router"
import { routerConfig } from "@/router/config"
import { flatMultiLevelRoutes } from "@/router/helper"

const Layouts = () => import("@/layouts/index.vue")

const pageModules = import.meta.glob("@/pages/**/*.vue")

const LEADING_SLASH_RE = /^\//

function resolveComponent(componentPath: string) {
  const key = `/src/pages/${componentPath}.vue`
  return pageModules[key] ?? null
}

function menuToRoute(menu: MenuData, parentPath = ""): RouteRecordRaw | null {
  if (menu.type === MenuTypeEnum.CATALOG) {
    const children: RouteRecordRaw[] = []
    for (const child of menu.children ?? []) {
      const childRoute = menuToRoute(child, menu.path)
      if (childRoute) children.push(childRoute)
    }

    const routePath = menu.path.startsWith("/") ? menu.path : `/${menu.path}`

    return {
      path: routePath,
      component: Layouts,
      name: `Dynamic_${menu.id}`,
      redirect: children[0] ? `${routePath}/${children[0].path}` : undefined,
      meta: {
        title: menu.name,
        icon: menu.icon || undefined,
        dynamic: true
      },
      children
    }
  }

  if (menu.type === MenuTypeEnum.MENU) {
    const component = resolveComponent(menu.component)
    if (!component) return null

    const childPath = menu.path.startsWith("/")
      ? menu.path.replace(`${parentPath}/`, "").replace(LEADING_SLASH_RE, "")
      : menu.path

    return {
      path: childPath,
      component,
      name: `Dynamic_${menu.id}`,
      meta: {
        title: menu.name,
        icon: menu.icon || undefined,
        keepAlive: true,
        dynamic: true
      }
    }
  }

  return null
}

function hasPermission(roles: string[], route: RouteRecordRaw) {
  const routeRoles = route.meta?.roles
  return routeRoles ? roles.some(role => routeRoles.includes(role)) : true
}

function filterDynamicRoutes(routes: RouteRecordRaw[], roles: string[]) {
  const res: RouteRecordRaw[] = []
  routes.forEach((route) => {
    const tempRoute = { ...route }
    if (hasPermission(roles, tempRoute)) {
      if (tempRoute.children) {
        tempRoute.children = filterDynamicRoutes(tempRoute.children, roles)
      }
      res.push(tempRoute)
    }
  })
  return res
}

export const usePermissionStore = defineStore("permission", () => {
  const routes = ref<RouteRecordRaw[]>([])

  const addRoutes = ref<RouteRecordRaw[]>([])

  const setRoutes = (roles: string[]) => {
    const accessedRoutes = filterDynamicRoutes(dynamicRoutes, roles)
    set(accessedRoutes)
  }

  const setAllRoutes = () => {
    set(dynamicRoutes)
  }

  const setRoutesByMenus = async () => {
    const { data: menus } = await getUserMenusApi()
    const accessedRoutes: RouteRecordRaw[] = []
    for (const menu of menus) {
      const route = menuToRoute(menu)
      if (route) accessedRoutes.push(route)
    }
    set(accessedRoutes)
  }

  const set = (accessedRoutes: RouteRecordRaw[]) => {
    routes.value = [...constantRoutes, ...accessedRoutes]
    addRoutes.value = routerConfig.thirdLevelRouteCache ? flatMultiLevelRoutes(accessedRoutes) : accessedRoutes
  }

  return { routes, addRoutes, setRoutes, setAllRoutes, setRoutesByMenus }
})

export function usePermissionStoreOutside() {
  return usePermissionStore(pinia)
}
