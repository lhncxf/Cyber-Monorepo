import type { FastifyInstance } from "fastify"
import { buildTree, formatDateTime } from "../utils/helpers.js"
import { getRequestLang, t } from "../utils/i18n.js"
import { prisma } from "../utils/prisma.js"

interface MenuData {
  id: number
  parentId: number
  name: string
  type: number
  path: string
  component: string
  permission: string
  icon: string
  sort: number
  status: boolean
  visible: boolean
  createTime: string
  children?: MenuData[]
}

function filterMenuTree(
  menus: Omit<MenuData, "children">[],
  name?: string,
  status?: boolean | ""
): Omit<MenuData, "children">[] {
  return menus.filter((m) => {
    const nameMatch = !name || m.name.includes(name)
    const statusMatch = status === "" || status === undefined || m.status === status
    return nameMatch && statusMatch
  })
}

function formatMenu(m: {
  id: number
  parentId: number
  name: string
  type: number
  path: string
  component: string
  permission: string
  icon: string
  sort: number
  status: boolean
  visible: boolean
  createTime: Date
}): Omit<MenuData, "children"> {
  return {
    id: m.id,
    parentId: m.parentId,
    name: m.name,
    type: m.type,
    path: m.path,
    component: m.component,
    permission: m.permission,
    icon: m.icon,
    sort: m.sort,
    status: m.status,
    visible: m.visible,
    createTime: formatDateTime(m.createTime)
  }
}

export async function menusRoutes(app: FastifyInstance) {
  app.get(
    "/api/v1/menus/user",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const user = request.user
      if (!("userId" in user)) {
        return reply.code(403).send({ code: 403, data: null, message: t("noPermission", lang) })
      }
      const { roles } = user

      let accessibleMenuIds: Set<number> | null = null

      if (!roles.includes("admin")) {
        const roleRecords = await prisma.role.findMany({
          where: { name: { in: roles } },
          include: { roleMenus: true }
        })
        accessibleMenuIds = new Set(roleRecords.flatMap(r => r.roleMenus.map(rm => rm.menuId)))
      }

      const allMenus = await prisma.menu.findMany({
        where: {
          status: true,
          visible: true,
          type: { in: [1, 2] },
          NOT: [
            { parentId: 0, type: 2 }
          ]
        },
        orderBy: { sort: "asc" }
      })

      const filtered = accessibleMenuIds
        ? allMenus.filter(m => accessibleMenuIds!.has(m.id))
        : allMenus

      const formatted = filtered.map(formatMenu)
      const tree = buildTree<MenuData>(formatted)

      return reply.send({ code: 0, data: tree, message: t("querySuccess", lang) })
    }
  )

  app.get<{
    Querystring: { name?: string, status?: string }
  }>(
    "/api/v1/menus",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { name, status: statusStr } = request.query
      const status = statusStr === "true" ? true : statusStr === "false" ? false : ""

      const allMenus = await prisma.menu.findMany({ orderBy: { sort: "asc" } })
      const formatted = allMenus.map(formatMenu)
      const filtered = name || status !== "" ? filterMenuTree(formatted, name, status) : formatted
      const tree = buildTree<MenuData>(filtered)

      return reply.send({ code: 0, data: tree, message: t("querySuccess", lang) })
    }
  )

  app.post<{
    Body: {
      parentId: number
      name: string
      type: number
      path: string
      component: string
      permission: string
      icon: string
      sort: number
      status: boolean
      visible: boolean
    }
  }>(
    "/api/v1/menus",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { parentId = 0, name, type = 2, path = "", component = "", permission = "", icon = "", sort = 0, status = true, visible = true } = request.body

      await prisma.menu.create({
        data: { parentId, name, type, path, component, permission, icon, sort, status, visible }
      })

      return reply.send({ code: 0, data: null, message: t("createSuccess", lang) })
    }
  )

  app.put<{
    Body: {
      id: number
      parentId?: number
      name?: string
      type?: number
      path?: string
      component?: string
      permission?: string
      icon?: string
      sort?: number
      status?: boolean
      visible?: boolean
    }
  }>(
    "/api/v1/menus",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { id, parentId, name, type, path, component, permission, icon, sort, status, visible } = request.body

      const data: Record<string, unknown> = {}
      if (parentId !== undefined) data.parentId = parentId
      if (name !== undefined) data.name = name
      if (type !== undefined) data.type = type
      if (path !== undefined) data.path = path
      if (component !== undefined) data.component = component
      if (permission !== undefined) data.permission = permission
      if (icon !== undefined) data.icon = icon
      if (sort !== undefined) data.sort = sort
      if (status !== undefined) data.status = status
      if (visible !== undefined) data.visible = visible

      await prisma.menu.update({ where: { id }, data })

      return reply.send({ code: 0, data: null, message: t("updateSuccess", lang) })
    }
  )

  app.delete<{ Params: { id: string } }>(
    "/api/v1/menus/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const id = Number(request.params.id)
      const children = await prisma.menu.count({ where: { parentId: id } })
      if (children > 0) {
        return reply.send({ code: -1, data: null, message: t("deleteChildFirst", lang) })
      }
      await prisma.menu.delete({ where: { id } })
      return reply.send({ code: 0, data: null, message: t("deleteSuccess", lang) })
    }
  )
}
