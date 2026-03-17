import type { FastifyInstance } from "fastify"
import bcrypt from "bcryptjs"
import { formatDateTime } from "../utils/helpers.js"
import { getRequestLang, t } from "../utils/i18n.js"
import { prisma } from "../utils/prisma.js"

export async function systemUsersRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: {
      currentPage?: string
      size?: string
      username?: string
      phone?: string
      status?: string
      deptId?: string
    }
  }>(
    "/api/v1/system/users",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const currentPage = Number(request.query.currentPage) || 1
      const size = Number(request.query.size) || 10
      const { username, phone, status: statusStr, deptId: deptIdStr } = request.query

      const where: Record<string, unknown> = {}
      if (username) where.username = { contains: username }
      if (phone) where.phone = { contains: phone }
      if (statusStr === "true") where.status = true
      if (statusStr === "false") where.status = false
      if (deptIdStr) where.deptId = Number(deptIdStr)

      const [total, list] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          skip: (currentPage - 1) * size,
          take: size,
          orderBy: { id: "asc" },
          include: {
            userRoles: { include: { role: true } },
            dept: { select: { id: true, name: true } }
          }
        })
      ])

      const formatted = list.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        phone: u.phone,
        status: u.status,
        deptId: u.deptId,
        deptName: u.dept?.name ?? "",
        roleIds: u.userRoles.map(ur => ur.roleId),
        roles: u.userRoles.map(ur => ur.role.name),
        createTime: formatDateTime(u.createTime)
      }))

      return reply.send({ code: 0, data: { list: formatted, total }, message: t("querySuccess", lang) })
    }
  )

  app.post<{
    Body: {
      username: string
      password: string
      email?: string
      phone?: string
      status?: boolean
      deptId?: number
      roleIds?: number[]
    }
  }>(
    "/api/v1/system/users",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { username, password, email, phone, status = true, deptId, roleIds = [] } = request.body

      const existing = await prisma.user.findUnique({ where: { username } })
      if (existing) {
        return reply.send({ code: -1, data: null, message: t("usernameExists", lang) })
      }

      const hashed = await bcrypt.hash(password, 10)
      const user = await prisma.user.create({
        data: {
          username,
          password: hashed,
          email: email || null,
          phone: phone || null,
          status,
          deptId: deptId || null,
          userRoles: {
            create: roleIds.map(rid => ({ roleId: rid }))
          }
        }
      })

      return reply.send({ code: 0, data: { id: user.id }, message: t("createSuccess", lang) })
    }
  )

  app.put<{
    Body: {
      id: number
      username?: string
      password?: string
      email?: string
      phone?: string
      status?: boolean
      deptId?: number | null
      roleIds?: number[]
    }
  }>(
    "/api/v1/system/users",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { id, password, roleIds, ...rest } = request.body

      const data: Record<string, unknown> = { ...rest }
      if (password) {
        data.password = await bcrypt.hash(password, 10)
      }

      await prisma.$transaction(async (tx) => {
        await tx.user.update({ where: { id }, data })
        if (roleIds !== undefined) {
          await tx.userRole.deleteMany({ where: { userId: id } })
          if (roleIds.length > 0) {
            await tx.userRole.createMany({
              data: roleIds.map(rid => ({ userId: id, roleId: rid }))
            })
          }
        }
      })

      return reply.send({ code: 0, data: null, message: t("updateSuccess", lang) })
    }
  )

  app.delete<{ Params: { id: string } }>(
    "/api/v1/system/users/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const id = Number(request.params.id)
      await prisma.user.delete({ where: { id } })
      return reply.send({ code: 0, data: null, message: t("deleteSuccess", lang) })
    }
  )

  app.put<{ Params: { id: string }, Body: { password: string } }>(
    "/api/v1/system/users/:id/reset-password",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const id = Number(request.params.id)
      const { password } = request.body
      if (!password || password.length < 6) {
        return reply.send({ code: -1, data: null, message: t("passwordTooShort", lang) })
      }
      const hashed = await bcrypt.hash(password, 10)
      await prisma.user.update({ where: { id }, data: { password: hashed } })
      return reply.send({ code: 0, data: null, message: t("resetSuccess", lang) })
    }
  )
}
