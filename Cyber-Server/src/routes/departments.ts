import type { FastifyInstance } from "fastify"
import { buildTree } from "../utils/helpers.js"
import { getRequestLang, t } from "../utils/i18n.js"
import { prisma } from "../utils/prisma.js"

interface DeptNode {
  id: number
  parentId: number
  name: string
  sort: number
  status: boolean
  createTime: string
  children?: DeptNode[]
}

export async function departmentsRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { name?: string, status?: string } }>(
    "/api/v1/departments",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { name, status: statusStr } = request.query

      const hasFilter = !!name || statusStr === "true" || statusStr === "false"

      let depts: Omit<DeptNode, "children">[]

      if (hasFilter) {
        const where: Record<string, unknown> = {}
        if (name) where.name = { contains: name }
        if (statusStr === "true") where.status = true
        if (statusStr === "false") where.status = false

        const matched = await prisma.department.findMany({ where, orderBy: { sort: "asc" } })

        const allDepts = await prisma.department.findMany({ orderBy: { sort: "asc" } })
        const allMap = new Map(allDepts.map(d => [d.id, d]))

        const includedIds = new Set<number>()
        for (const d of matched) {
          includedIds.add(d.id)
          let parentId = d.parentId
          while (parentId !== 0) {
            includedIds.add(parentId)
            parentId = allMap.get(parentId)?.parentId ?? 0
          }
        }

        const included = allDepts.filter(d => includedIds.has(d.id))
        depts = included.map(d => ({
          id: d.id,
          parentId: d.parentId,
          name: d.name,
          sort: d.sort,
          status: d.status,
          createTime: d.createTime.toISOString().replace("T", " ").slice(0, 19)
        }))
      } else {
        const all = await prisma.department.findMany({ orderBy: { sort: "asc" } })
        depts = all.map(d => ({
          id: d.id,
          parentId: d.parentId,
          name: d.name,
          sort: d.sort,
          status: d.status,
          createTime: d.createTime.toISOString().replace("T", " ").slice(0, 19)
        }))
      }

      const tree = buildTree<DeptNode>(depts)
      return reply.send({ code: 0, data: tree, message: t("querySuccess", lang) })
    }
  )

  app.get(
    "/api/v1/departments/all",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const depts = await prisma.department.findMany({
        where: { status: true },
        orderBy: { sort: "asc" },
        select: { id: true, name: true, parentId: true }
      })
      return reply.send({ code: 0, data: depts, message: t("querySuccess", lang) })
    }
  )

  app.post<{ Body: { parentId?: number, name: string, sort?: number, status?: boolean } }>(
    "/api/v1/departments",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { parentId = 0, name, sort = 0, status = true } = request.body
      const dept = await prisma.department.create({ data: { parentId, name, sort, status } })
      return reply.send({ code: 0, data: { id: dept.id }, message: t("createSuccess", lang) })
    }
  )

  app.put<{ Body: { id: number, parentId?: number, name?: string, sort?: number, status?: boolean } }>(
    "/api/v1/departments",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { id, parentId, name, sort, status } = request.body
      const data: Record<string, unknown> = {}
      if (parentId !== undefined) data.parentId = parentId
      if (name !== undefined) data.name = name
      if (sort !== undefined) data.sort = sort
      if (status !== undefined) data.status = status
      await prisma.department.update({ where: { id }, data })
      return reply.send({ code: 0, data: null, message: t("updateSuccess", lang) })
    }
  )

  app.delete<{ Params: { id: string } }>(
    "/api/v1/departments/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const id = Number(request.params.id)
      const children = await prisma.department.count({ where: { parentId: id } })
      if (children > 0) {
        return reply.send({ code: -1, data: null, message: t("deleteDeptChildFirst", lang) })
      }
      await prisma.department.delete({ where: { id } })
      return reply.send({ code: 0, data: null, message: t("deleteSuccess", lang) })
    }
  )
}
