import type { FastifyInstance } from "fastify"
import { buildTree } from "../utils/helpers.js"
import { getRequestLang, t } from "../utils/i18n.js"
import { prisma } from "../utils/prisma.js"

interface CategoryNode {
  id: number
  parentId: number
  name: string
  sort: number
  status: boolean
  createTime: string
  children?: CategoryNode[]
}

function formatCategory(c: { id: number, parentId: number, name: string, sort: number, status: boolean, createTime: Date }): Omit<CategoryNode, "children"> {
  return {
    id: c.id,
    parentId: c.parentId,
    name: c.name,
    sort: c.sort,
    status: c.status,
    createTime: c.createTime.toISOString().replace("T", " ").slice(0, 19)
  }
}

export async function categoriesRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { name?: string, status?: string } }>(
    "/api/v1/categories",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { name, status: statusStr } = request.query

      const hasFilter = !!name || statusStr === "true" || statusStr === "false"

      let categories: Omit<CategoryNode, "children">[]

      if (hasFilter) {
        const where: Record<string, unknown> = {}
        if (name) where.name = { contains: name }
        if (statusStr === "true") where.status = true
        if (statusStr === "false") where.status = false

        const matched = await prisma.category.findMany({ where, orderBy: { sort: "asc" } })
        const allCats = await prisma.category.findMany({ orderBy: { sort: "asc" } })
        const allMap = new Map(allCats.map(c => [c.id, c]))

        const includedIds = new Set<number>()
        for (const c of matched) {
          includedIds.add(c.id)
          let parentId = c.parentId
          while (parentId !== 0) {
            includedIds.add(parentId)
            parentId = allMap.get(parentId)?.parentId ?? 0
          }
        }

        const included = allCats.filter(c => includedIds.has(c.id))
        categories = included.map(formatCategory)
      } else {
        const all = await prisma.category.findMany({ orderBy: { sort: "asc" } })
        categories = all.map(formatCategory)
      }

      const tree = buildTree<CategoryNode>(categories)
      return reply.send({ code: 0, data: tree, message: t("querySuccess", lang) })
    }
  )

  app.get(
    "/api/v1/categories/all",
    async (request, reply) => {
      const lang = getRequestLang(request)
      const all = await prisma.category.findMany({
        where: { status: true },
        orderBy: { sort: "asc" }
      })
      const nodes = all.map(formatCategory)
      const tree = buildTree<CategoryNode>(nodes)
      return reply.send({ code: 0, data: tree, message: t("querySuccess", lang) })
    }
  )

  app.post<{ Body: { parentId?: number, name: string, sort?: number, status?: boolean } }>(
    "/api/v1/categories",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { parentId = 0, name, sort = 0, status = true } = request.body

      if (parentId !== 0) {
        const parent = await prisma.category.findUnique({ where: { id: parentId } })
        if (!parent) return reply.send({ code: -1, data: null, message: t("parentCategoryNotFound", lang) })
        if (parent.parentId !== 0) return reply.send({ code: -1, data: null, message: t("maxTwoLevels", lang) })
      }

      const category = await prisma.category.create({ data: { parentId, name, sort, status } })
      return reply.send({ code: 0, data: { id: category.id }, message: t("createSuccess", lang) })
    }
  )

  app.put<{ Body: { id: number, parentId?: number, name?: string, sort?: number, status?: boolean } }>(
    "/api/v1/categories",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const { id, parentId, ...data } = request.body

      if (parentId !== undefined && parentId !== 0) {
        const parent = await prisma.category.findUnique({ where: { id: parentId } })
        if (!parent) return reply.send({ code: -1, data: null, message: t("parentCategoryNotFound", lang) })
        if (parent.parentId !== 0) return reply.send({ code: -1, data: null, message: t("maxTwoLevels", lang) })
        if (parentId === id) return reply.send({ code: -1, data: null, message: t("cannotSetSelfAsParent", lang) })
      }

      await prisma.category.update({ where: { id }, data: parentId !== undefined ? { ...data, parentId } : data })
      return reply.send({ code: 0, data: null, message: t("updateSuccess", lang) })
    }
  )

  app.delete<{ Params: { id: string } }>(
    "/api/v1/categories/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const lang = getRequestLang(request)
      const id = Number(request.params.id)

      const children = await prisma.category.count({ where: { parentId: id } })
      if (children > 0) return reply.send({ code: -1, data: null, message: t("deleteCategoryChildFirst", lang) })

      const productsCount = await prisma.product.count({ where: { categoryId: id } })
      if (productsCount > 0) return reply.send({ code: -1, data: null, message: t("categoryHasProducts", lang) })

      await prisma.category.delete({ where: { id } })
      return reply.send({ code: 0, data: null, message: t("deleteSuccess", lang) })
    }
  )
}
