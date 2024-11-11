import { ProgressItem, Toc } from './type'

export const createTocMap = (tocs: Toc[]) => {
  return buildTreeAndGenerateRecord(tocs)
}

type TocMap = Record<string, Toc>
export const buildTreeAndGenerateRecord = (tocs: Toc[]): TocMap => {
  const map: Record<string, Toc> = {}
  const tree: Record<string, Toc[]> = {}

  // 先将所有节点放入映射中，并初始化树结构
  tocs.forEach((toc) => {
    map[toc.uuid] = toc
    if (!tree[toc.parent_uuid]) {
      tree[toc.parent_uuid] = []
    }
  })

  // 构建树结构
  tocs.forEach((toc) => {
    if (toc.parent_uuid) {
      tree[toc.parent_uuid].push(toc)
    }
  })

  // 遍历树生成 Record 对象
  const generateKey = (toc: Toc, ancestors: Toc[] = []): string => {
    if (!toc.parent_uuid) {
      return toc.title
    }
    const parent = map[toc.parent_uuid]
    ancestors.unshift(parent)
    return generateKey(parent, ancestors) + '/' + toc.title
  }

  tocs.forEach((toc) => {
    const key = generateKey(toc)
    map[key] = toc
  })

  return map
}
