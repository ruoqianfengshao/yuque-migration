/**
 * yuque-dl 产出的 progress.json 文件格式
 */
export type ProgressItem = {
  path: string
  pathTitleList: string[]
  pathIdList: string[]
  toc: Toc
}

export type Toc = {
  type: string
  title: string
  uuid: string
  url: string
  prev_uuid: string
  sibling_uuid: string
  child_uuid: string
  parent_uuid: string
  doc_id: string
  level: number
  id: string
  open_window: number
  visible: number
}
