import type { FastifyInstance } from "fastify"
import { formatDateTime } from "../utils/helpers.js"
import { getRequestLang, t } from "../utils/i18n.js"
import { prisma } from "../utils/prisma.js"

export async function rolesRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: { currentPage?: string, size?: string, name?: string, label?: string, status?: string }
  }>(
    "/api/v1/roles",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const currentPage = Number(request.query.currentPage) || 1
      const size = Number(request.query.size) || 10
      const { name, label, status: statusStr } = request.query

      const where: Record<string, unknown> = {}
      if (name) where.name = { contains: name }
      if (label) where.label = { contains: label }
      if (statusStr === "true") where.status = true
      if (statusStr === "false") where.status = false

      const [total, list] = await Promise.all([
        prisma.role.count({ where }),
        prisma.role.findMany({
          where,
          skip: (currentPage - 1) * size,
          take: size,
          orderBy: { id: "asc" },
          include: {
            _count: { select: { userRoles: true } }
          }
        })
      ])

      const formatted = list.map(r => ({
        id: r.id,
        name: r.name,
        label: r.label,
        status: r.status,
        userCount: r._count.userRoles,
        createTime: formatDateTime(r.createTime)
      }))

      return reply.send({ code: 0, data: { list: formatted, total }, message: t("querySuccess", lang) })
    }
  )

  app.get(
    "/api/v1/roles/all",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const roles = await prisma.role.findMany({
        where: { status: true },
        orderBy: { id: "asc" },
        select: { id: true, name: true, label: true }
      })
      return reply.send({ code: 0, data: roles, message: t("querySuccess", lang) })
    }
  )

  app.post<{ Body: { name: string, label: string, status?: boolean } }>(
    "/api/v1/roles",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { name, label, status = true } = request.body

      const existing = await prisma.role.findUnique({ where: { name } })
      if (existing) {
        return reply.send({ code: -1, data: null, message: t("roleIdentExists", lang) })
      }

      const role = await prisma.role.create({ data: { name, label, status } })
      return reply.send({ code: 0, data: { id: role.id }, message: t("createSuccess", lang) })
    }
  )

  app.put<{ Body: { id: number, name?: string, label?: string, status?: boolean } }>(
    "/api/v1/roles",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { id, ...data } = request.body
      await prisma.role.update({ where: { id }, data })
      return reply.send({ code: 0, data: null, message: t("updateSuccess", lang) })
    }
  )

  app.delete<{ Params: { id: string } }>(
    "/api/v1/roles/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const id = Number(request.params.id)
      await prisma.role.delete({ where: { id } })
      return reply.send({ code: 0, data: null, message: t("deleteSuccess", lang) })
    }
  )
}
