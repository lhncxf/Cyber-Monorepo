import type { FastifyInstance } from "fastify"
import { getRequestLang, t } from "../utils/i18n.js"

export async function usersRoutes(app: FastifyInstance) {
  app.get(
    "/api/v1/users/me",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const user = request.user
      const lang = getRequestLang(request)
      if (!("userId" in user)) {
        return reply.code(403).send({ code: 403, data: null, message: t("noPermission", lang) })
      }
      const { username, roles } = user
      return reply.send({ code: 0, data: { username, roles }, message: t("getUserSuccess", lang) })
    }
  )
}
