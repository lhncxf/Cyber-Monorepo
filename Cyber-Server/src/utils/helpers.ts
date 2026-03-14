export function parseImages(raw: string): string[] {
  try {
    return JSON.parse(raw)
  } catch {
    return raw ? [raw] : []
  }
}

export function buildTree<T extends { id: number, parentId: number, children?: T[] }>(
  nodes: Omit<T, "children">[]
): T[] {
  const map = new Map<number, T>()
  const roots: T[] = []

  for (const node of nodes) {
    map.set(node.id, { ...node, children: [] } as unknown as T)
  }

  for (const node of nodes) {
    const item = map.get(node.id)!
    if (node.parentId === 0) {
      roots.push(item)
    } else {
      const parent = map.get(node.parentId)
      if (parent) {
        if (!parent.children) parent.children = []
        parent.children.push(item)
      }
    }
  }

  function pruneEmpty(items: T[]): T[] {
    return items.map((n) => {
      if (n.children && n.children.length === 0) {
        const { children: _, ...rest } = n
        return rest as T
      }
      if (n.children) n.children = pruneEmpty(n.children)
      return n
    })
  }

  return pruneEmpty(roots)
}
