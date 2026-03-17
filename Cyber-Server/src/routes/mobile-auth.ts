import type { FastifyInstance } from "fastify"
import bcrypt from "bcryptjs"
import { getRequestLang, t } from "../utils/i18n.js"
import { prisma } from "../utils/prisma.js"

export async function mobileAuthRoutes(app: FastifyInstance) {
  app.post<{
    Body: { phone: string, password: string, nickname?: string }
  }>(
    "/api/v1/mobile/auth/register",
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { phone, password, nickname = "" } = request.body

      if (!phone || !password) {
        return reply.send({ code: -1, data: null, message: t("phonePasswordRequired", lang) })
      }
      if (password.length < 6) {
        return reply.send({ code: -1, data: null, message: t("mobilePasswordTooShort", lang) })
      }

      const existing = await prisma.mobileUser.findUnique({ where: { phone } })
      if (existing) {
        return reply.send({ code: -1, data: null, message: t("phoneAlreadyRegistered", lang) })
      }

      const hashed = await bcrypt.hash(password, 10)
      const user = await prisma.mobileUser.create({
        data: { phone, password: hashed, nickname: nickname || phone }
      })

      const token = app.jwt.sign(
        { mobileUserId: user.id, phone: user.phone },
        { expiresIn: "30d" }
      )

      return reply.send({
        code: 0,
        data: {
          token,
          user: { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar }
        },
        message: t("registerSuccess", lang)
      })
    }
  )

  app.post<{
    Body: { phone: string, password: string }
  }>(
    "/api/v1/mobile/auth/login",
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { phone, password } = request.body

      if (!phone || !password) {
        return reply.send({ code: -1, data: null, message: t("phonePasswordRequired", lang) })
      }

      const user = await prisma.mobileUser.findUnique({ where: { phone } })
      if (!user || !user.status) {
        return reply.send({ code: -1, data: null, message: t("mobileInvalidCredentials", lang) })
      }

      const valid = await bcrypt.compare(password, user.password)
      if (!valid) {
        return reply.send({ code: -1, data: null, message: t("mobileInvalidCredentials", lang) })
      }

      const token = app.jwt.sign(
        { mobileUserId: user.id, phone: user.phone },
        { expiresIn: "30d" }
      )

      return reply.send({
        code: 0,
        data: {
          token,
          user: { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar }
        },
        message: t("mobileLoginSuccess", lang)
      })
    }
  )

  app.get(
    "/api/v1/mobile/auth/me",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const mobileUserId = (request.user as { mobileUserId?: number }).mobileUserId
      if (!mobileUserId) {
        return reply.code(401).send({ code: 401, data: null, message: t("pleaseLogin", lang) })
      }

      const user = await prisma.mobileUser.findUnique({
        where: { id: mobileUserId },
        select: { id: true, phone: true, nickname: true, avatar: true, status: true, createTime: true }
      })

      if (!user) {
        return reply.code(401).send({ code: 401, data: null, message: t("mobileUserNotFound", lang) })
      }

      return reply.send({ code: 0, data: user, message: t("querySuccess", lang) })
    }
  )
}
