import type { FastifyInstance } from "fastify"
import { getRequestLang, t } from "../utils/i18n.js"
import { prisma } from "../utils/prisma.js"

async function setDefaultAddress(userId: number, addressId: number) {
  await prisma.$transaction([
    prisma.shippingAddress.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false }
    }),
    prisma.shippingAddress.update({ where: { id: addressId }, data: { isDefault: true } })
  ])
}

export async function addressesRoutes(app: FastifyInstance) {
  // GET /api/v1/mobile/addresses — list current user's addresses
  app.get(
    "/api/v1/mobile/addresses",
    { preHandler: [app.authenticate, app.requireMobileUser] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { mobileUserId } = request.user as { mobileUserId: number }
      const list = await prisma.shippingAddress.findMany({
        where: { userId: mobileUserId },
        orderBy: [{ isDefault: "desc" }, { id: "desc" }]
      })
      return reply.send({ code: 0, data: list, message: t("querySuccess", lang) })
    }
  )

  // POST /api/v1/mobile/addresses — create address
  app.post<{
    Body: {
      name: string
      phone: string
      province: string
      city: string
      district: string
      detail: string
      isDefault?: boolean
    }
  }>(
    "/api/v1/mobile/addresses",
    { preHandler: [app.authenticate, app.requireMobileUser] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { mobileUserId } = request.user as { mobileUserId: number }
      const { name, phone, province, city, district, detail, isDefault = false } = request.body

      const address = await prisma.$transaction(async (tx) => {
        const existingCount = await tx.shippingAddress.count({ where: { userId: mobileUserId } })
        const shouldBeDefault = isDefault || existingCount === 0
        if (shouldBeDefault) {
          await tx.shippingAddress.updateMany({
            where: { userId: mobileUserId, isDefault: true },
            data: { isDefault: false }
          })
        }
        return tx.shippingAddress.create({
          data: { userId: mobileUserId, name, phone, province, city, district, detail, isDefault: shouldBeDefault }
        })
      })
      return reply.send({ code: 0, data: address, message: t("createSuccess", lang) })
    }
  )

  // PUT /api/v1/mobile/addresses/:id — update address
  app.put<{
    Params: { id: string }
    Body: {
      name?: string
      phone?: string
      province?: string
      city?: string
      district?: string
      detail?: string
      isDefault?: boolean
    }
  }>(
    "/api/v1/mobile/addresses/:id",
    { preHandler: [app.authenticate, app.requireMobileUser] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { mobileUserId } = request.user as { mobileUserId: number }
      const id = Number(request.params.id)

      const existing = await prisma.shippingAddress.findFirst({ where: { id, userId: mobileUserId } })
      if (!existing) {
        return reply.send({ code: -1, data: null, message: t("addressNotFound", lang) })
      }

      const { isDefault, ...rest } = request.body

      if (isDefault === true) {
        await setDefaultAddress(mobileUserId, id)
      }

      const updated = await prisma.shippingAddress.update({
        where: { id },
        data: { ...rest, ...(isDefault !== undefined ? { isDefault } : {}) }
      })
      return reply.send({ code: 0, data: updated, message: t("updateSuccess", lang) })
    }
  )

  // DELETE /api/v1/mobile/addresses/:id — delete address
  app.delete<{ Params: { id: string } }>(
    "/api/v1/mobile/addresses/:id",
    { preHandler: [app.authenticate, app.requireMobileUser] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { mobileUserId } = request.user as { mobileUserId: number }
      const id = Number(request.params.id)

      const existing = await prisma.shippingAddress.findFirst({ where: { id, userId: mobileUserId } })
      if (!existing) {
        return reply.send({ code: -1, data: null, message: t("addressNotFound", lang) })
      }

      await prisma.shippingAddress.delete({ where: { id } })

      if (existing.isDefault) {
        const next = await prisma.shippingAddress.findFirst({
          where: { userId: mobileUserId },
          orderBy: { id: "desc" }
        })
        if (next) {
          await prisma.shippingAddress.update({ where: { id: next.id }, data: { isDefault: true } })
        }
      }

      return reply.send({ code: 0, data: null, message: t("deleteSuccess", lang) })
    }
  )

  // PUT /api/v1/mobile/addresses/:id/default — set as default
  app.put<{ Params: { id: string }, Body: Record<string, never> }>(
    "/api/v1/mobile/addresses/:id/default",
    { preHandler: [app.authenticate, app.requireMobileUser], schema: { body: { type: "object" } } },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { mobileUserId } = request.user as { mobileUserId: number }
      const id = Number(request.params.id)

      const existing = await prisma.shippingAddress.findFirst({ where: { id, userId: mobileUserId } })
      if (!existing) {
        return reply.send({ code: -1, data: null, message: t("addressNotFound", lang) })
      }

      await setDefaultAddress(mobileUserId, id)

      return reply.send({ code: 0, data: null, message: t("updateSuccess", lang) })
    }
  )

  // GET /api/v1/mobile/users/:userId/addresses — admin: view a user's addresses
  app.get<{ Params: { userId: string } }>(
    "/api/v1/mobile/users/:userId/addresses",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const user = request.user
      if (!("userId" in user)) {
        return reply.code(403).send({ code: 403, data: null, message: t("noPermission", lang) })
      }
      const userId = Number(request.params.userId)
      const list = await prisma.shippingAddress.findMany({
        where: { userId },
        orderBy: [{ isDefault: "desc" }, { id: "desc" }]
      })
      return reply.send({ code: 0, data: list, message: t("querySuccess", lang) })
    }
  )
}
