import type { FastifyInstance } from "fastify"
import bcrypt from "bcryptjs"
import { formatDateTime } from "../utils/helpers.js"
import { getRequestLang, t } from "../utils/i18n.js"
import { prisma } from "../utils/prisma.js"

export async function mobileUsersRoutes(app: FastifyInstance) {
  // 查 — 分页列表
  app.get<{
    Querystring: {
      currentPage?: string
      size?: string
      phone?: string
      nickname?: string
      status?: string
    }
  }>(
    "/api/v1/mobile-users",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const user = request.user
      if (!("userId" in user)) {
        return reply.code(403).send({ code: 403, data: null, message: t("noPermission", lang) })
      }

      const currentPage = Number(request.query.currentPage) || 1
      const size = Number(request.query.size) || 10
      const { phone, nickname, status: statusStr } = request.query

      const where: Record<string, unknown> = {}
      if (phone) where.phone = { contains: phone }
      if (nickname) where.nickname = { contains: nickname }
      if (statusStr === "true") where.status = true
      if (statusStr === "false") where.status = false

      const [total, list] = await Promise.all([
        prisma.mobileUser.count({ where }),
        prisma.mobileUser.findMany({
          where,
          skip: (currentPage - 1) * size,
          take: size,
          orderBy: { id: "asc" },
          select: {
            id: true,
            phone: true,
            nickname: true,
            avatar: true,
            status: true,
            createTime: true
          }
        })
      ])

      const formatted = list.map(u => ({
        id: u.id,
        phone: u.phone,
        nickname: u.nickname,
        avatar: u.avatar,
        status: u.status,
        createTime: formatDateTime(u.createTime)
      }))

      return reply.send({ code: 0, data: { list: formatted, total }, message: t("querySuccess", lang) })
    }
  )

  // 增
  app.post<{
    Body: {
      phone: string
      password: string
      nickname?: string
    }
  }>(
    "/api/v1/mobile-users",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const user = request.user
      if (!("userId" in user)) {
        return reply.code(403).send({ code: 403, data: null, message: t("noPermission", lang) })
      }

      const { phone, password, nickname } = request.body

      if (!phone || !password) {
        return reply.send({ code: -1, data: null, message: t("phonePasswordRequiredAdmin", lang) })
      }
      if (password.length < 6) {
        return reply.send({ code: -1, data: null, message: t("mobilePasswordTooShortAdmin", lang) })
      }

      const existing = await prisma.mobileUser.findUnique({ where: { phone } })
      if (existing) {
        return reply.send({ code: -1, data: null, message: t("phoneExists", lang) })
      }

      const hashed = await bcrypt.hash(password, 10)
      const mobileUser = await prisma.mobileUser.create({
        data: {
          phone,
          password: hashed,
          nickname: nickname || "",
          avatar: "",
          status: true
        }
      })

      return reply.send({ code: 0, data: { id: mobileUser.id }, message: t("createSuccess", lang) })
    }
  )

  // 改
  app.put<{
    Body: {
      id: number
      nickname?: string
      status?: boolean
      avatar?: string
    }
  }>(
    "/api/v1/mobile-users",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const user = request.user
      if (!("userId" in user)) {
        return reply.code(403).send({ code: 403, data: null, message: t("noPermission", lang) })
      }

      const { id, ...rest } = request.body

      await prisma.mobileUser.update({
        where: { id },
        data: rest
      })

      return reply.send({ code: 0, data: null, message: t("updateSuccess", lang) })
    }
  )

  // 删
  app.delete<{ Params: { id: string } }>(
    "/api/v1/mobile-users/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const user = request.user
      if (!("userId" in user)) {
        return reply.code(403).send({ code: 403, data: null, message: t("noPermission", lang) })
      }

      const id = Number(request.params.id)
      await prisma.mobileUser.delete({ where: { id } })
      return reply.send({ code: 0, data: null, message: t("deleteSuccess", lang) })
    }
  )

  // 重置密码
  app.put<{ Params: { id: string }, Body: { password: string } }>(
    "/api/v1/mobile-users/:id/reset-password",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const user = request.user
      if (!("userId" in user)) {
        return reply.code(403).send({ code: 403, data: null, message: t("noPermission", lang) })
      }

      const id = Number(request.params.id)
      const { password } = request.body
      if (!password || password.length < 6) {
        return reply.send({ code: -1, data: null, message: t("mobilePasswordTooShortAdmin", lang) })
      }
      const hashed = await bcrypt.hash(password, 10)
      await prisma.mobileUser.update({ where: { id }, data: { password: hashed } })
      return reply.send({ code: 0, data: null, message: t("resetSuccess", lang) })
    }
  )
}
