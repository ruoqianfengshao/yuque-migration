import { Toc } from './type'

export const createTocMap = (tocs: Toc[]): TocMap => {
  return convertArrayToMap(tocs)
}

export function fixPath(dirPath: string): string {
  if (!dirPath) return ''
  const dirNameReg = /[:*?"|\n\r]/g
  return dirPath
    .replace(dirNameReg, '_')
    .replace(/\s/g, '')
    .replaceAll('>', '&gt;')
    .replaceAll('<', '&lt;')
}

type TocMap = Record<string, Toc>

const convertArrayToMap = (nodesArray): TocMap => {
  const nodeMap: TocMap = {}

  function buildKeyAndAddToMap(node, keySuffix = ''): void {
    const key = node.title + keySuffix
    nodeMap[key] = node

    const parentNode = nodesArray.find((n) => n.uuid === node.parent_uuid)
    if (parentNode) {
      buildKeyAndAddToMap(parentNode, '/' + key)
    }
  }

  nodesArray.forEach((node) => {
    buildKeyAndAddToMap(node)
  })

  return nodeMap
}
