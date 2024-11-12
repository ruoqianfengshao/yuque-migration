import { Toc } from './type'

export const createTocMap = (tocs: Toc[]): TocMap => {
  return convertArrayToMap(tocs)
}

type TocMap = Record<string, Toc>

const convertArrayToMap = (nodesArray): TocMap => {
  const nodeMap: TocMap = {}

  function buildKeyAndAddToMap(node, keySuffix = ''): void {
    const key = node.title.replaceAll(' ', '') + keySuffix
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
