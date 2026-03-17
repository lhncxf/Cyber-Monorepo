import type { FastifyInstance } from "fastify"
import { formatDateTime } from "../utils/helpers.js"
import { getRequestLang, t } from "../utils/i18n.js"
import { prisma } from "../utils/prisma.js"

export async function tablesRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: { currentPage?: string, size?: string, username?: string, phone?: string }
  }>(
    "/api/v1/tables",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const currentPage = Number(request.query.currentPage) || 1
      const size = Number(request.query.size) || 10
      const username = request.query.username || ""
      const phone = request.query.phone || ""

      const where = {
        ...(username ? { username: { contains: username } } : {}),
        ...(phone ? { phone: { contains: phone } } : {})
      }

      const [total, list] = await Promise.all([
        prisma.tableItem.count({ where }),
        prisma.tableItem.findMany({
          where,
          skip: (currentPage - 1) * size,
          take: size,
          orderBy: { id: "asc" },
          select: {
            id: true,
            username: true,
            email: true,
            phone: true,
            roles: true,
            status: true,
            createTime: true
          }
        })
      ])

      const formatted = list.map(item => ({
        ...item,
        createTime: formatDateTime(item.createTime)
      }))

      return reply.send({ code: 0, data: { list: formatted, total }, message: t("querySuccess", lang) })
    }
  )

  app.post<{ Body: { username: string, password?: string } }>(
    "/api/v1/tables",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { username } = request.body

      await prisma.tableItem.create({
        data: {
          username,
          email: `${username}@example.com`,
          phone: `1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
          roles: "editor",
          status: true
        }
      })

      return reply.send({ code: 0, data: null, message: t("createSuccess", lang) })
    }
  )

  app.put<{ Body: { id: number, username?: string } }>(
    "/api/v1/tables",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { id, username } = request.body

      await prisma.tableItem.update({
        where: { id },
        data: { ...(username ? { username } : {}) }
      })

      return reply.send({ code: 0, data: null, message: t("updateSuccess", lang) })
    }
  )

  app.delete<{ Params: { id: string } }>(
    "/api/v1/tables/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const id = Number(request.params.id)
      await prisma.tableItem.delete({ where: { id } })
      return reply.send({ code: 0, data: null, message: t("deleteSuccess", lang) })
    }
  )
}
