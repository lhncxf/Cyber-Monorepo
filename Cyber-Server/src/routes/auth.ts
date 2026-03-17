import type { FastifyInstance } from "fastify"
import { Buffer } from "node:buffer"
import bcrypt from "bcryptjs"
import svgCaptcha from "svg-captcha"
import { getRequestLang, t } from "../utils/i18n.js"
import { prisma } from "../utils/prisma.js"

export async function authRoutes(app: FastifyInstance) {
  app.get("/api/v1/auth/captcha", async (request, reply) => {
    const { text, data: svg } = svgCaptcha.create({
      size: 4,
      noise: 2,
      color: true,
      background: "#f0f0f0",
      width: 120,
      height: 40,
      fontSize: 48
    })

    const captchaToken = app.jwt.sign({ text: text.toLowerCase() }, { expiresIn: "60s" })
    const svgBase64 = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
    const lang = getRequestLang(request)

    return reply.send({ code: 0, data: { svg: svgBase64, captchaToken }, message: t("captchaFetched", lang) })
  })

  app.post<{
    Body: { username: string, password: string, code: string, captchaToken: string }
  }>("/api/v1/auth/login", async (request, reply) => {
    const { username, password, code, captchaToken } = request.body
    const lang = getRequestLang(request)

    let captchaPayload: { text: string }
    try {
      captchaPayload = app.jwt.verify<{ text: string }>(captchaToken)
    } catch {
      return reply.code(200).send({ code: -1, data: null, message: t("captchaExpired", lang) })
    }

    if (!code || code.toLowerCase() !== captchaPayload.text) {
      return reply.code(200).send({ code: -1, data: null, message: t("captchaWrong", lang) })
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        userRoles: {
          include: { role: true }
        }
      }
    })

    if (!user || !user.status) {
      return reply.code(200).send({ code: -1, data: null, message: t("invalidCredentials", lang) })
    }

    const passwordValid = await bcrypt.compare(password, user.password)
    if (!passwordValid) {
      return reply.code(200).send({ code: -1, data: null, message: t("invalidCredentials", lang) })
    }

    const roles = user.userRoles.map(ur => ur.role.name)

    const token = app.jwt.sign(
      { userId: user.id, username: user.username, roles },
      { expiresIn: process.env.JWT_EXPIRES_IN ?? "7d" }
    )

    return reply.send({ code: 0, data: { token }, message: t("loginSuccess", lang) })
  })
}
