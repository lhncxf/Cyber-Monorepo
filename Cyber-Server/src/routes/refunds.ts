import type { FastifyInstance } from "fastify"
import { formatDateTime } from "../utils/helpers.js"
import { getRequestLang, t } from "../utils/i18n.js"
import { prisma } from "../utils/prisma.js"

export async function refundsRoutes(app: FastifyInstance) {
  app.post<{ Params: { id: string }, Body: { reason: string } }>(
    "/api/v1/mobile/orders/:id/refund",
    { preHandler: [app.authenticate, app.requireMobileUser] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { mobileUserId } = request.user as { mobileUserId: number }

      const id = Number(request.params.id)
      const { reason } = request.body

      const order = await prisma.order.findFirst({
        where: { id, userId: mobileUserId },
        include: { refund: true }
      })

      if (!order) {
        return reply.send({ code: -1, data: null, message: t("orderNotFound", lang) })
      }
      if (![1, 2, 3].includes(order.status)) {
        return reply.send({ code: -1, data: null, message: t("refundNotAllowed", lang) })
      }
      if (order.refund) {
        return reply.send({ code: -1, data: null, message: t("refundAlreadyExists", lang) })
      }

      await prisma.refundRequest.create({
        data: { orderId: id, userId: mobileUserId, reason, status: 0 }
      })

      return reply.send({ code: 0, data: null, message: t("refundSubmitted", lang) })
    }
  )

  app.get<{
    Querystring: { currentPage?: string, size?: string, status?: string }
  }>(
    "/api/v1/refunds",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const user = request.user
      if (!("userId" in user)) {
        return reply.code(403).send({ code: 403, data: null, message: t("noPermission", lang) })
      }

      const currentPage = Number(request.query.currentPage) || 1
      const size = Number(request.query.size) || 10
      const status = request.query.status

      const where = {
        ...(status !== undefined && status !== "" ? { status: Number(status) } : {})
      }

      const [total, list] = await Promise.all([
        prisma.refundRequest.count({ where }),
        prisma.refundRequest.findMany({
          where,
          skip: (currentPage - 1) * size,
          take: size,
          orderBy: { id: "desc" },
          include: {
            order: { select: { orderNo: true } },
            user: { select: { phone: true, nickname: true } }
          }
        })
      ])

      const formatted = list.map(r => ({
        id: r.id,
        orderId: r.orderId,
        orderNo: r.order.orderNo,
        userId: r.userId,
        user: { phone: r.user.phone, nickname: r.user.nickname },
        reason: r.reason,
        status: r.status,
        adminNote: r.adminNote,
        createTime: formatDateTime(r.createTime)
      }))

      return reply.send({ code: 0, data: { list: formatted, total }, message: t("querySuccess", lang) })
    }
  )

  app.put<{ Params: { id: string }, Body: { action: "approve" | "reject", adminNote?: string } }>(
    "/api/v1/refunds/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const user = request.user
      if (!("userId" in user)) {
        return reply.code(403).send({ code: 403, data: null, message: t("noPermission", lang) })
      }

      const id = Number(request.params.id)
      const { action, adminNote } = request.body

      const refund = await prisma.refundRequest.findUnique({
        where: { id },
        include: {
          order: { include: { items: true } }
        }
      })

      if (!refund) {
        return reply.send({ code: -1, data: null, message: t("refundNotFound", lang) })
      }

      if (refund.status !== 0) {
        return reply.send({ code: -1, data: null, message: t("refundAlreadyProcessed", lang) })
      }

      if (action === "approve") {
        await prisma.$transaction(async (tx) => {
          await tx.refundRequest.update({
            where: { id },
            data: { status: 1, adminNote: adminNote ?? null }
          })
          await tx.order.update({
            where: { id: refund.orderId },
            data: { status: 4 }
          })
          await Promise.all(
            refund.order.items
              .filter(item => item.skuId != null)
              .map(item =>
                tx.productSku.update({
                  where: { id: item.skuId! },
                  data: { stock: { increment: item.quantity } }
                })
              )
          )
        })
        return reply.send({ code: 0, data: null, message: t("refundApproved", lang) })
      } else {
        await prisma.refundRequest.update({
          where: { id },
          data: { status: 2, adminNote: adminNote ?? null }
        })
        return reply.send({ code: 0, data: null, message: t("refundRejected", lang) })
      }
    }
  )
}
