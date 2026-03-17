import type { FastifyInstance } from "fastify"
import { formatDateTime, parseImages } from "../utils/helpers.js"
import { getRequestLang, t } from "../utils/i18n.js"
import { prisma } from "../utils/prisma.js"

function formatSku(sku: { id: number, name: string, price: unknown, stock: number, status: boolean, productId: number }) {
  return { ...sku, price: Number(sku.price) }
}

function formatProduct(p: {
  id: number
  name: string
  categoryId: number | null
  category: { id: number, name: string } | null
  freightTemplateId: number | null
  freightTemplate?: { id: number, name: string } | null
  images: string
  description: string | null
  status: boolean
  createTime: Date
  skus?: Array<{ id: number, name: string, price: unknown, stock: number, status: boolean, productId: number }>
}) {
  return {
    id: p.id,
    name: p.name,
    categoryId: p.categoryId,
    categoryName: p.category?.name ?? "",
    freightTemplateId: p.freightTemplateId,
    freightTemplateName: p.freightTemplate?.name ?? "",
    images: parseImages(p.images),
    description: p.description,
    status: p.status,
    createTime: formatDateTime(p.createTime),
    skus: p.skus ? p.skus.map(formatSku) : undefined
  }
}

function productInclude(activeSkusOnly = false) {
  return {
    category: { select: { id: true, name: true } },
    freightTemplate: { select: { id: true, name: true } },
    skus: { ...(activeSkusOnly ? { where: { status: true } } : {}), orderBy: { id: "asc" as const } }
  }
}

export async function productsRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: { currentPage?: string, size?: string, name?: string, categoryId?: string, status?: string }
  }>(
    "/api/v1/products",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const currentPage = Number(request.query.currentPage) || 1
      const size = Number(request.query.size) || 10
      const name = request.query.name || ""
      const categoryId = request.query.categoryId ? Number(request.query.categoryId) : undefined
      const status = request.query.status

      const where = {
        ...(name ? { name: { contains: name } } : {}),
        ...(categoryId !== undefined ? { categoryId } : {}),
        ...(status !== undefined && status !== "" ? { status: status === "true" } : {})
      }

      const [total, list] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          skip: (currentPage - 1) * size,
          take: size,
          orderBy: { id: "desc" },
          include: productInclude()
        })
      ])

      return reply.send({ code: 0, data: { list: list.map(formatProduct), total }, message: t("querySuccess", lang) })
    }
  )

  app.get<{
    Querystring: { categoryId?: string, keyword?: string }
  }>(
    "/api/v1/products/all",
    async (request, reply) => {
      const lang = getRequestLang(request)
      const categoryId = request.query.categoryId ? Number(request.query.categoryId) : undefined
      const keyword = request.query.keyword || ""

      const list = await prisma.product.findMany({
        where: {
          status: true,
          ...(categoryId !== undefined
            ? {
                OR: [
                  { categoryId },
                  { category: { parentId: categoryId } }
                ]
              }
            : {}),
          ...(keyword ? { name: { contains: keyword } } : {})
        },
        orderBy: { id: "desc" },
        include: productInclude(true)
      })

      return reply.send({ code: 0, data: list.map(formatProduct), message: t("querySuccess", lang) })
    }
  )

  app.get<{ Params: { id: string } }>(
    "/api/v1/products/:id",
    async (request, reply) => {
      const lang = getRequestLang(request)
      const id = Number(request.params.id)
      const product = await prisma.product.findUnique({
        where: { id },
        include: productInclude(true)
      })
      if (!product) {
        return reply.send({ code: -1, data: null, message: t("productNotFound", lang) })
      }
      return reply.send({ code: 0, data: formatProduct(product), message: t("querySuccess", lang) })
    }
  )

  app.post<{
    Body: {
      name: string
      categoryId?: number
      freightTemplateId?: number | null
      images?: string[]
      description?: string
      status?: boolean
      skus?: Array<{ name: string, price: number, stock?: number, status?: boolean }>
    }
  }>(
    "/api/v1/products",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { name, categoryId, freightTemplateId, images = [], description, status = true, skus = [] } = request.body

      const product = await prisma.product.create({
        data: {
          name,
          categoryId: categoryId ?? null,
          freightTemplateId: freightTemplateId ?? null,
          images: JSON.stringify(images),
          description: description ?? null,
          status,
          skus: {
            create: skus.map(s => ({
              name: s.name,
              price: s.price,
              stock: s.stock ?? 0,
              status: s.status ?? true
            }))
          }
        },
        include: productInclude()
      })

      return reply.send({ code: 0, data: formatProduct(product), message: t("createSuccess", lang) })
    }
  )

  app.put<{
    Body: {
      id: number
      name?: string
      categoryId?: number | null
      freightTemplateId?: number | null
      images?: string[]
      description?: string
      status?: boolean
      skus?: Array<{ id?: number, name: string, price: number, stock?: number, status?: boolean }>
    }
  }>(
    "/api/v1/products",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { id, skus, images, categoryId, freightTemplateId, ...rest } = request.body

      await prisma.product.update({
        where: { id },
        data: {
          ...rest,
          ...(categoryId !== undefined ? { categoryId } : {}),
          ...(freightTemplateId !== undefined ? { freightTemplateId } : {}),
          ...(images !== undefined ? { images: JSON.stringify(images) } : {})
        }
      })

      if (skus !== undefined) {
        const incomingIds = skus.filter(s => s.id).map(s => s.id!)
        await prisma.productSku.deleteMany({
          where: { productId: id, id: { notIn: incomingIds } }
        })
        const toUpdate = skus.filter(s => s.id)
        const toCreate = skus.filter(s => !s.id)
        await Promise.all(toUpdate.map(sku =>
          prisma.productSku.update({
            where: { id: sku.id! },
            data: { name: sku.name, price: sku.price, stock: sku.stock ?? 0, status: sku.status ?? true }
          })
        ))
        if (toCreate.length > 0) {
          await prisma.productSku.createMany({
            data: toCreate.map(sku => ({
              productId: id,
              name: sku.name,
              price: sku.price,
              stock: sku.stock ?? 0,
              status: sku.status ?? true
            }))
          })
        }
      }

      return reply.send({ code: 0, data: null, message: t("updateSuccess", lang) })
    }
  )

  app.delete<{ Params: { id: string } }>(
    "/api/v1/products/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const id = Number(request.params.id)
      await prisma.product.delete({ where: { id } })
      return reply.send({ code: 0, data: null, message: t("deleteSuccess", lang) })
    }
  )

  app.patch<{ Params: { id: string }, Body: { status: boolean } }>(
    "/api/v1/products/:id/status",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const user = request.user
      if (!("userId" in user)) return reply.code(403).send({ code: 403, data: null, message: t("noPermission", lang) })
      const id = Number(request.params.id)
      const { status } = request.body
      const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } })
      if (!existing) return reply.send({ code: -1, data: null, message: t("productNotFound", lang) })
      await prisma.product.update({ where: { id }, data: { status } })
      return reply.send({ code: 0, data: null, message: t("productStatusUpdated", lang) })
    }
  )

  // ─── Inventory management ─────────────────────────────────────────────────

  app.put<{ Params: { id: string }, Body: { stock: number } }>(
    "/api/v1/products/skus/:id/stock",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const user = request.user
      if (!("userId" in user)) return reply.code(403).send({ code: 403, data: null, message: t("noPermission", lang) })
      const id = Number(request.params.id)
      const { stock } = request.body
      const sku = await prisma.productSku.findUnique({ where: { id }, select: { id: true } })
      if (!sku) return reply.send({ code: -1, data: null, message: t("skuNotFoundInv", lang) })
      const updated = await prisma.productSku.update({
        where: { id },
        data: { stock }
      })
      return reply.send({ code: 0, data: formatSku(updated), message: t("stockUpdated", lang) })
    }
  )

  app.get<{ Querystring: { threshold?: string } }>(
    "/api/v1/products/low-stock",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const user = request.user
      if (!("userId" in user)) return reply.code(403).send({ code: 403, data: null, message: t("noPermission", lang) })
      const threshold = Number(request.query.threshold ?? "10")
      const skus = await prisma.productSku.findMany({
        where: { stock: { lte: threshold } },
        orderBy: { stock: "asc" },
        include: { product: { select: { id: true, name: true } } }
      })
      const data = skus.map(s => ({
        skuId: s.id,
        skuName: s.name,
        stock: s.stock,
        productId: s.productId,
        productName: s.product.name
      }))
      return reply.send({ code: 0, data, message: t("querySuccess", lang) })
    }
  )
}
