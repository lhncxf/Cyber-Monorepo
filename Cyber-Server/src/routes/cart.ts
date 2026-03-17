import type { FastifyInstance } from "fastify"
import { parseImages } from "../utils/helpers.js"
import { getRequestLang, t } from "../utils/i18n.js"
import { prisma } from "../utils/prisma.js"

export async function cartRoutes(app: FastifyInstance) {
  app.get(
    "/api/v1/mobile/cart",
    { preHandler: [app.authenticate, app.requireMobileUser] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { mobileUserId } = request.user as { mobileUserId: number }

      const items = await prisma.cartItem.findMany({
        where: { userId: mobileUserId },
        include: {
          product: { select: { id: true, name: true, images: true, status: true } },
          sku: { select: { id: true, name: true, price: true, stock: true, status: true } }
        },
        orderBy: { createTime: "desc" }
      })

      const formatted = items.map(item => ({
        id: item.id,
        productId: item.productId,
        skuId: item.skuId,
        quantity: item.quantity,
        productName: item.product.name,
        skuName: item.sku.name,
        price: Number(item.sku.price),
        stock: item.sku.stock,
        image: parseImages(item.product.images)[0] ?? "",
        available: item.product.status && item.sku.status && item.sku.stock > 0
      }))

      return reply.send({ code: 0, data: formatted, message: t("querySuccess", lang) })
    }
  )

  app.post<{
    Body: { productId: number, skuId: number, quantity?: number }
  }>(
    "/api/v1/mobile/cart",
    { preHandler: [app.authenticate, app.requireMobileUser] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { mobileUserId } = request.user as { mobileUserId: number }

      const { productId, skuId, quantity = 1 } = request.body

      const sku = await prisma.productSku.findFirst({
        where: { id: skuId, productId, status: true }
      })
      if (!sku) {
        return reply.send({ code: -1, data: null, message: t("skuNotFoundOrOffShelf", lang) })
      }

      const existing = await prisma.cartItem.findUnique({
        where: { userId_skuId: { userId: mobileUserId, skuId } }
      })

      if (existing) {
        const newQty = existing.quantity + quantity
        if (newQty > sku.stock) {
          return reply.send({ code: -1, data: null, message: t("stockInsufficient", lang) })
        }
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: newQty }
        })
      } else {
        if (quantity > sku.stock) {
          return reply.send({ code: -1, data: null, message: t("stockInsufficient", lang) })
        }
        await prisma.cartItem.create({
          data: { userId: mobileUserId, productId, skuId, quantity }
        })
      }

      return reply.send({ code: 0, data: null, message: t("addedToCart", lang) })
    }
  )

  app.put<{
    Params: { id: string }
    Body: { quantity: number }
  }>(
    "/api/v1/mobile/cart/:id",
    { preHandler: [app.authenticate, app.requireMobileUser] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { mobileUserId } = request.user as { mobileUserId: number }

      const id = Number(request.params.id)
      const { quantity } = request.body

      const item = await prisma.cartItem.findFirst({ where: { id, userId: mobileUserId } })
      if (!item) {
        return reply.send({ code: -1, data: null, message: t("cartItemNotFound", lang) })
      }

      const sku = await prisma.productSku.findUnique({ where: { id: item.skuId } })
      if (!sku || quantity > sku.stock) {
        return reply.send({ code: -1, data: null, message: t("stockInsufficient", lang) })
      }

      await prisma.cartItem.update({ where: { id }, data: { quantity } })
      return reply.send({ code: 0, data: null, message: t("cartItemUpdated", lang) })
    }
  )

  app.delete<{ Params: { id: string } }>(
    "/api/v1/mobile/cart/:id",
    { preHandler: [app.authenticate, app.requireMobileUser] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { mobileUserId } = request.user as { mobileUserId: number }

      const id = Number(request.params.id)
      await prisma.cartItem.deleteMany({ where: { id, userId: mobileUserId } })
      return reply.send({ code: 0, data: null, message: t("cartItemDeleted", lang) })
    }
  )

  app.delete(
    "/api/v1/mobile/cart",
    { preHandler: [app.authenticate, app.requireMobileUser] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { mobileUserId } = request.user as { mobileUserId: number }

      await prisma.cartItem.deleteMany({ where: { userId: mobileUserId } })
      return reply.send({ code: 0, data: null, message: t("cartCleared", lang) })
    }
  )
}
