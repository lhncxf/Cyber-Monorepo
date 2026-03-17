import type { FastifyInstance } from "fastify"
import { formatDateTime } from "../utils/helpers.js"
import { getRequestLang, t } from "../utils/i18n.js"
import { prisma } from "../utils/prisma.js"

export async function freightTemplatesRoutes(app: FastifyInstance) {
  // GET /api/v1/freight-templates — admin: paginated list
  app.get<{
    Querystring: { currentPage?: string, size?: string, name?: string, status?: string }
  }>(
    "/api/v1/freight-templates",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const user = request.user
      if (!("userId" in user)) {
        return reply.code(403).send({ code: 403, data: null, message: t("noPermission", lang) })
      }

      const currentPage = Number(request.query.currentPage) || 1
      const size = Number(request.query.size) || 10
      const name = request.query.name || ""
      const status = request.query.status

      const where = {
        ...(name ? { name: { contains: name } } : {}),
        ...(status !== undefined && status !== "" ? { status: status === "true" } : {})
      }

      const [total, list] = await Promise.all([
        prisma.freightTemplate.count({ where }),
        prisma.freightTemplate.findMany({
          where,
          skip: (currentPage - 1) * size,
          take: size,
          orderBy: { id: "asc" }
        })
      ])

      const formatted = list.map(ft => ({
        ...ft,
        basePrice: Number(ft.basePrice),
        freeThreshold: ft.freeThreshold !== null ? Number(ft.freeThreshold) : null,
        createTime: formatDateTime(ft.createTime)
      }))

      return reply.send({ code: 0, data: { list: formatted, total }, message: t("querySuccess", lang) })
    }
  )

  // GET /api/v1/freight-templates/all — mobile/admin: all active templates (for selects)
  app.get(
    "/api/v1/freight-templates/all",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const list = await prisma.freightTemplate.findMany({
        where: { status: true },
        orderBy: { id: "asc" },
        select: { id: true, name: true, basePrice: true, freeThreshold: true }
      })
      const formatted = list.map(ft => ({
        ...ft,
        basePrice: Number(ft.basePrice),
        freeThreshold: ft.freeThreshold !== null ? Number(ft.freeThreshold) : null
      }))
      return reply.send({ code: 0, data: formatted, message: t("querySuccess", lang) })
    }
  )

  // GET /api/v1/freight-templates/:id/check — check delivery + cost for a province+amount
  app.get<{
    Params: { id: string }
    Querystring: { province?: string, totalAmount?: string }
  }>(
    "/api/v1/freight-templates/:id/check",
    async (request, reply) => {
      const lang = getRequestLang(request)
      const id = Number(request.params.id)
      const province = request.query.province || ""
      const totalAmount = Number(request.query.totalAmount) || 0

      const template = await prisma.freightTemplate.findFirst({ where: { id, status: true } })
      if (!template) {
        return reply.send({ code: -1, data: null, message: t("freightTemplateNotFound", lang) })
      }

      // Parse excluded regions
      let excludedRegions: string[] = []
      try {
        excludedRegions = JSON.parse(template.excludedRegions)
      } catch {
        excludedRegions = []
      }

      // Check deliverability
      const deliverable = !province || !excludedRegions.includes(province)

      if (!deliverable) {
        return reply.send({
          code: 0,
          data: { deliverable: false, shippingCost: 0, freeShipping: false },
          message: t("querySuccess", lang)
        })
      }

      // Parse region surcharge rules [{province, addPrice}]
      let rules: Array<{ province: string, addPrice: number }> = []
      try {
        rules = JSON.parse(template.rules)
      } catch {
        rules = []
      }

      const basePrice = Number(template.basePrice)
      const freeThreshold = template.freeThreshold !== null ? Number(template.freeThreshold) : null

      // Free shipping check
      const freeShipping = freeThreshold !== null && totalAmount >= freeThreshold

      let shippingCost = 0
      if (!freeShipping) {
        const surchargeRule = rules.find(r => r.province === province)
        shippingCost = basePrice + (surchargeRule ? surchargeRule.addPrice : 0)
      }

      return reply.send({
        code: 0,
        data: { deliverable: true, shippingCost, freeShipping },
        message: t("querySuccess", lang)
      })
    }
  )

  // POST /api/v1/freight-templates — create
  app.post<{
    Body: {
      name: string
      type?: number
      basePrice: number
      freeThreshold?: number | null
      rules?: string
      excludedRegions?: string
      status?: boolean
    }
  }>(
    "/api/v1/freight-templates",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const user = request.user
      if (!("userId" in user)) {
        return reply.code(403).send({ code: 403, data: null, message: t("noPermission", lang) })
      }

      const {
        name,
        type = 0,
        basePrice,
        freeThreshold = null,
        rules = "[]",
        excludedRegions = "[]",
        status = true
      } = request.body

      const template = await prisma.freightTemplate.create({
        data: { name, type, basePrice, freeThreshold, rules, excludedRegions, status }
      })

      return reply.send({
        code: 0,
        data: {
          ...template,
          basePrice: Number(template.basePrice),
          freeThreshold: template.freeThreshold !== null ? Number(template.freeThreshold) : null
        },
        message: t("createSuccess", lang)
      })
    }
  )

  // PUT /api/v1/freight-templates — update
  app.put<{
    Body: {
      id: number
      name?: string
      type?: number
      basePrice?: number
      freeThreshold?: number | null
      rules?: string
      excludedRegions?: string
      status?: boolean
    }
  }>(
    "/api/v1/freight-templates",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const user = request.user
      if (!("userId" in user)) {
        return reply.code(403).send({ code: 403, data: null, message: t("noPermission", lang) })
      }

      const { id, ...data } = request.body
      await prisma.freightTemplate.update({ where: { id }, data })
      return reply.send({ code: 0, data: null, message: t("updateSuccess", lang) })
    }
  )

  // DELETE /api/v1/freight-templates/:id — delete
  app.delete<{ Params: { id: string } }>(
    "/api/v1/freight-templates/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const user = request.user
      if (!("userId" in user)) {
        return reply.code(403).send({ code: 403, data: null, message: t("noPermission", lang) })
      }

      const id = Number(request.params.id)
      // Detach from products first (SetNull handled by DB, but let's be explicit)
      await prisma.product.updateMany({
        where: { freightTemplateId: id },
        data: { freightTemplateId: null }
      })
      await prisma.freightTemplate.delete({ where: { id } })
      return reply.send({ code: 0, data: null, message: t("deleteSuccess", lang) })
    }
  )
}
