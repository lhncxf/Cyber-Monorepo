import cors from "@fastify/cors"
import jwt from "@fastify/jwt"
import Fastify from "fastify"
import { authMiddleware } from "./middlewares/auth.js"
import { addressesRoutes } from "./routes/addresses.js"
import { authRoutes } from "./routes/auth.js"
import { cartRoutes } from "./routes/cart.js"
import { categoriesRoutes } from "./routes/categories.js"
import { departmentsRoutes } from "./routes/departments.js"
import { freightTemplatesRoutes } from "./routes/freight-templates.js"
import { menusRoutes } from "./routes/menus.js"
import { mobileAuthRoutes } from "./routes/mobile-auth.js"
import { mobileUsersRoutes } from "./routes/mobile-users.js"
import { ordersRoutes } from "./routes/orders.js"
import { productsRoutes } from "./routes/products.js"
import { refundsRoutes } from "./routes/refunds.js"
import { rolesRoutes } from "./routes/roles.js"
import { systemUsersRoutes } from "./routes/system-users.js"
import { tablesRoutes } from "./routes/tables.js"
import { usersRoutes } from "./routes/users.js"
import { getRequestLang, t } from "./utils/i18n.js"
import { prisma } from "./utils/prisma.js"

const app = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: { colorize: true, translateTime: "SYS:standard", ignore: "pid,hostname" }
    }
  }
})

await app.register(cors, {
  origin: true,
  credentials: true
})

await app.register(jwt, {
  secret: process.env.JWT_SECRET ?? "Cyber-secret"
})

await app.register(authMiddleware)

// Allow empty JSON bodies (e.g. PUT /mobile/orders/:id/cancel sends no body)
app.addContentTypeParser("application/json", { parseAs: "string" }, (req, body, done) => {
  if (!body || (body as string).trim() === "") {
    done(null, {})
    return
  }
  try {
    done(null, JSON.parse(body as string))
  } catch (err) {
    done(err as Error, undefined)
  }
})

await app.register(authRoutes)
await app.register(usersRoutes)
await app.register(menusRoutes)
await app.register(tablesRoutes)
await app.register(systemUsersRoutes)
await app.register(rolesRoutes)
await app.register(departmentsRoutes)
await app.register(productsRoutes)
await app.register(categoriesRoutes)
await app.register(ordersRoutes)
await app.register(cartRoutes)
await app.register(mobileAuthRoutes)
await app.register(mobileUsersRoutes)
await app.register(addressesRoutes)
await app.register(freightTemplatesRoutes)
await app.register(refundsRoutes)

app.setErrorHandler((error, request, reply) => {
  app.log.error(error)
  const lang = getRequestLang(request)
  reply.code(500).send({ code: -1, data: null, message: error.message || t("serverError", lang) })
})

app.addHook("onClose", async () => {
  await prisma.$disconnect()
})

try {
  const port = Number(process.env.PORT) || 3000
  const host = process.env.HOST || "0.0.0.0"
  await app.listen({ port, host })
  app.log.info(`Server running at http://localhost:${port}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
