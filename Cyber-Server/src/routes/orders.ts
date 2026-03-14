import type { FastifyInstance } from "fastify"
import { parseImages } from "../utils/helpers.js"
import { getRequestLang, t, tf } from "../utils/i18n.js"
import { prisma } from "../utils/prisma.js"

const MOBILE_STATUS_MAP: Record<number, string> = {
  0: "PENDING",
  1: "PAID",
  2: "SHIPPED",
  3: "DELIVERED",
  4: "CANCELLED"
}

export async function ordersRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: { currentPage?: string, size?: string, orderNo?: string, status?: string }
  }>(
    "/api/v1/orders",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const currentPage = Number(request.query.currentPage) || 1
      const size = Number(request.query.size) || 10
      const orderNo = request.query.orderNo || ""
      const status = request.query.status

      const where = {
        ...(orderNo ? { orderNo: { contains: orderNo } } : {}),
        ...(status !== undefined && status !== "" ? { status: Number(status) } : {})
      }

      const [total, list] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.findMany({
          where,
          skip: (currentPage - 1) * size,
          take: size,
          orderBy: { id: "desc" },
          include: {
            user: { select: { id: true, phone: true, nickname: true } },
            items: {
              include: {
                product: { select: { id: true, name: true, images: true } }
              }
            }
          }
        })
      ])

      const formatted = list.map(order => ({
        ...order,
        totalAmount: Number(order.totalAmount),
        createTime: order.createTime.toISOString().replace("T", " ").slice(0, 19),
        items: order.items.map(item => ({
          ...item,
          price: Number(item.price),
          product: {
            ...item.product,
            image: parseImages(item.product.images)[0] ?? ""
          }
        }))
      }))

      return reply.send({ code: 0, data: { list: formatted, total }, message: t("querySuccess", lang) })
    }
  )

  app.put<{ Body: { id: number, status: number } }>(
    "/api/v1/orders",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { id, status } = request.body
      await prisma.order.update({ where: { id }, data: { status } })
      return reply.send({ code: 0, data: null, message: t("updateSuccess", lang) })
    }
  )

  app.get<{
    Querystring: { currentPage?: string, size?: string, status?: string }
    Headers: { authorization?: string }
  }>(
    "/api/v1/mobile/orders",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const mobileUserId = (request.user as { mobileUserId?: number }).mobileUserId
      if (!mobileUserId) {
        return reply.code(401).send({ code: 401, data: null, message: t("pleaseLogin", lang) })
      }

      const currentPage = Number(request.query.currentPage) || 1
      const size = Number(request.query.size) || 10
      const status = request.query.status

      const where = {
        userId: mobileUserId,
        ...(status !== undefined && status !== "" ? { status: Number(status) } : {})
      }

      const [total, list] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.findMany({
          where,
          skip: (currentPage - 1) * size,
          take: size,
          orderBy: { id: "desc" },
          include: {
            items: {
              include: {
                product: { select: { id: true, name: true, images: true } }
              }
            }
          }
        })
      ])

      const formatted = list.map(order => ({
        ...order,
        totalAmount: Number(order.totalAmount),
        status: MOBILE_STATUS_MAP[order.status] ?? "PENDING",
        createTime: undefined,
        createdAt: order.createTime.toISOString(),
        items: order.items.map(item => ({
          ...item,
          price: Number(item.price),
          product: {
            id: item.product.id,
            name: item.product.name,
            image: parseImages(item.product.images)[0] ?? ""
          }
        }))
      }))

      return reply.send({ code: 0, data: { list: formatted, total }, message: t("querySuccess", lang) })
    }
  )

  app.post<{
    Body: {
      items: Array<{ skuId: number, quantity: number }>
      address?: string
      addressId?: number
      remark?: string
      clearCart?: boolean
    }
  }>(
    "/api/v1/mobile/orders",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const mobileUserId = (request.user as { mobileUserId?: number }).mobileUserId
      if (!mobileUserId) {
        return reply.code(401).send({ code: 401, data: null, message: t("pleaseLogin", lang) })
      }

      const { items, address = "", addressId, remark, clearCart = false } = request.body

      const skuIds = items.map(i => i.skuId)
      const skus = await prisma.productSku.findMany({
        where: { id: { in: skuIds }, status: true },
        include: { product: { select: { id: true, name: true, status: true } } }
      })

      if (skus.length !== skuIds.length) {
        return reply.send({ code: -1, data: null, message: t("partialSkuNotFound", lang) })
      }

      const skuMap = new Map(skus.map(s => [s.id, s]))

      for (const item of items) {
        const sku = skuMap.get(item.skuId)!
        if (!sku.product.status) {
          return reply.send({ code: -1, data: null, message: tf("productOffShelf", sku.product.name, lang) })
        }
        if (sku.stock < item.quantity) {
          return reply.send({ code: -1, data: null, message: tf("skuStockInsufficient", sku.name, lang) })
        }
      }

      const totalAmount = items.reduce((sum, item) => {
        return sum + Number(skuMap.get(item.skuId)!.price) * item.quantity
      }, 0)

      const orderNo = `ORD${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`

      // Build address snapshot if addressId provided
      let resolvedAddress = address
      let addressSnapshot: string | null = null
      if (addressId) {
        const addr = await prisma.shippingAddress.findFirst({
          where: { id: addressId, userId: mobileUserId }
        })
        if (addr) {
          resolvedAddress = `${addr.province}${addr.city}${addr.district}${addr.detail}`
          addressSnapshot = JSON.stringify({
            name: addr.name,
            phone: addr.phone,
            province: addr.province,
            city: addr.city,
            district: addr.district,
            detail: addr.detail
          })
        }
      }

      const order = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            orderNo,
            userId: mobileUserId,
            totalAmount,
            address: resolvedAddress,
            shippingAddressId: addressId ?? null,
            addressSnapshot,
            remark: remark ?? null,
            status: 0,
            items: {
              create: items.map((item) => {
                const sku = skuMap.get(item.skuId)!
                return {
                  productId: sku.productId,
                  skuId: sku.id,
                  skuName: sku.name,
                  quantity: item.quantity,
                  price: sku.price
                }
              })
            }
          }
        })

        for (const item of items) {
          await tx.productSku.update({
            where: { id: item.skuId },
            data: { stock: { decrement: item.quantity } }
          })
        }

        if (clearCart) {
          await tx.cartItem.deleteMany({
            where: { userId: mobileUserId, skuId: { in: skuIds } }
          })
        }

        return created
      })

      return reply.send({ code: 0, data: { orderId: order.id, orderNo: order.orderNo }, message: t("orderCreated", lang) })
    }
  )

  app.put<{ Params: { id: string }, Body: Record<string, never> }>(
    "/api/v1/mobile/orders/:id/cancel",
    { preHandler: [app.authenticate], schema: { body: { type: "object" } } },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const mobileUserId = (request.user as { mobileUserId?: number }).mobileUserId
      if (!mobileUserId) {
        return reply.code(401).send({ code: 401, data: null, message: t("pleaseLogin", lang) })
      }

      const id = Number(request.params.id)
      const order = await prisma.order.findFirst({ where: { id, userId: mobileUserId } })

      if (!order) {
        return reply.send({ code: -1, data: null, message: t("orderNotFound", lang) })
      }
      if (order.status !== 0) {
        return reply.send({ code: -1, data: null, message: t("orderCancelPendingOnly", lang) })
      }

      await prisma.order.update({ where: { id }, data: { status: 4 } })
      return reply.send({ code: 0, data: null, message: t("orderCancelled", lang) })
    }
  )

  app.post<{ Params: { id: string }, Body: Record<string, never> }>(
    "/api/v1/mobile/orders/:id/pay",
    { preHandler: [app.authenticate], schema: { body: { type: "object" } } },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const mobileUserId = (request.user as { mobileUserId?: number }).mobileUserId
      if (!mobileUserId) {
        return reply.code(401).send({ code: 401, data: null, message: t("pleaseLogin", lang) })
      }

      const id = Number(request.params.id)
      const order = await prisma.order.findFirst({ where: { id, userId: mobileUserId } })

      if (!order) {
        return reply.send({ code: -1, data: null, message: t("orderNotFound", lang) })
      }
      if (order.status !== 0) {
        return reply.send({ code: -1, data: null, message: t("orderStatusNotAllowPay", lang) })
      }

      await prisma.order.update({ where: { id }, data: { status: 1 } })
      return reply.send({ code: 0, data: null, message: t("paySuccess", lang) })
    }
  )

  app.put<{ Params: { itemId: string }, Body: { skuId: number } }>(
    "/api/v1/orders/items/:itemId",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const user = request.user
      if (!("userId" in user)) {
        return reply.code(403).send({ code: 403, data: null, message: t("noPermission", lang) })
      }

      const itemId = Number(request.params.itemId)
      const { skuId } = request.body

      const orderItem = await prisma.orderItem.findUnique({
        where: { id: itemId },
        select: { id: true, orderId: true, productId: true, quantity: true }
      })
      if (!orderItem) {
        return reply.send({ code: -1, data: null, message: t("orderItemNotFound", lang) })
      }

      const newSku = await prisma.productSku.findUnique({
        where: { id: skuId },
        select: { id: true, productId: true, name: true, price: true, status: true, stock: true }
      })
      if (!newSku) {
        return reply.send({ code: -1, data: null, message: t("skuNotFound", lang) })
      }
      if (newSku.productId !== orderItem.productId) {
        return reply.send({ code: -1, data: null, message: t("skuNotBelongProduct", lang) })
      }
      if (!newSku.status) {
        return reply.send({ code: -1, data: null, message: t("skuOffShelf", lang) })
      }
      if (newSku.stock < 1) {
        return reply.send({ code: -1, data: null, message: t("skuOutOfStock", lang) })
      }

      await prisma.$transaction(async (tx) => {
        await tx.orderItem.update({
          where: { id: itemId },
          data: { skuId, skuName: newSku.name, price: newSku.price }
        })

        const allItems = await tx.orderItem.findMany({
          where: { orderId: orderItem.orderId },
          select: { price: true, quantity: true, id: true }
        })
        const totalAmount = allItems.reduce((sum, i) => {
          const price = i.id === itemId ? Number(newSku.price) : Number(i.price)
          return sum + price * i.quantity
        }, 0)

        await tx.order.update({
          where: { id: orderItem.orderId },
          data: { totalAmount }
        })
      })

      return reply.send({ code: 0, data: null, message: t("changeSkuSuccess", lang) })
    }
  )

  app.post<{ Params: { id: string }, Body: { shippingCompany: string, shipmentNo: string } }>(
    "/api/v1/orders/:id/ship",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const user = request.user
      if (!("userId" in user)) {
        return reply.code(403).send({ code: 403, data: null, message: t("noPermission", lang) })
      }

      const id = Number(request.params.id)
      const { shippingCompany, shipmentNo } = request.body

      const order = await prisma.order.findUnique({ where: { id } })
      if (!order) {
        return reply.send({ code: -1, data: null, message: t("orderNotFound", lang) })
      }
      if (order.status !== 1) {
        return reply.send({ code: -1, data: null, message: t("orderNotPaid", lang) })
      }

      await prisma.order.update({
        where: { id },
        data: {
          status: 2,
          shippingCompany,
          shipmentNo,
          shippedAt: new Date()
        }
      })

      return reply.send({ code: 0, data: null, message: t("orderShipped", lang) })
    }
  )

  app.get<{ Params: { id: string } }>(
    "/api/v1/mobile/orders/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const mobileUserId = (request.user as { mobileUserId?: number }).mobileUserId
      if (!mobileUserId) {
        return reply.code(401).send({ code: 401, data: null, message: t("pleaseLogin", lang) })
      }

      const id = Number(request.params.id)
      const order = await prisma.order.findFirst({
        where: { id, userId: mobileUserId },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, images: true } }
            }
          },
          refund: { select: { id: true, status: true } }
        }
      })

      if (!order) {
        return reply.send({ code: -1, data: null, message: t("orderNotFound", lang) })
      }

      return reply.send({
        code: 0,
        data: {
          ...order,
          totalAmount: Number(order.totalAmount),
          status: MOBILE_STATUS_MAP[order.status] ?? "PENDING",
          createTime: undefined,
          createdAt: order.createTime.toISOString(),
          items: order.items.map(item => ({
            ...item,
            price: Number(item.price),
            product: {
              id: item.product.id,
              name: item.product.name,
              image: parseImages(item.product.images)[0] ?? ""
            }
          }))
        },
        message: t("querySuccess", lang)
      })
    }
  )
}
