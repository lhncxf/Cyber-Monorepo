import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import fp from "fastify-plugin"

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { userId: number, username: string, roles: string[] } | { text: string } | { mobileUserId: number, phone: string }
    user: { userId: number, username: string, roles: string[] } | { mobileUserId: number, phone: string }
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

export const authMiddleware = fp(async (fastify: FastifyInstance) => {
  fastify.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch {
      reply.code(401).send({ code: 401, data: null, message: "Token 已过期或无效" })
    }
  })
})
