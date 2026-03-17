import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import fp from "fastify-plugin"
import { getRequestLang, t } from "../utils/i18n.js"

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { userId: number, username: string, roles: string[] } | { text: string } | { mobileUserId: number, phone: string }
    user: { userId: number, username: string, roles: string[] } | { mobileUserId: number, phone: string }
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    requireMobileUser: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

export const authMiddleware = fp(async (fastify: FastifyInstance) => {
  fastify.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch {
      const lang = getRequestLang(request)
      reply.code(401).send({ code: 401, data: null, message: t("tokenExpired", lang) })
    }
  })

  fastify.decorate("requireMobileUser", async (request: FastifyRequest, reply: FastifyReply) => {
    const mobileUserId = (request.user as { mobileUserId?: number }).mobileUserId
    if (!mobileUserId) {
      const lang = getRequestLang(request)
      reply.code(401).send({ code: 401, data: null, message: t("pleaseLogin", lang) })
    }
  })
})
