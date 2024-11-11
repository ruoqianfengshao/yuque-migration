import { app } from 'electron'
import fs from 'node:fs'
import {
  createBook,
  createGroup,
  createToc,
  getOrgData,
  getTargetGroups,
  getTargetRepos,
  uploadLakeFile
} from '../service'
import { Toc, ProgressItem } from './type'
import path from 'node:path'

/**
 * 导入的思路大概是这样
 *
 * 1. 查找当前用户所属同名团队，如果不存在则创建团队
 * 2. 在团队下查找同名知识库，如果不存在则创建同名知识库
 * 3. 基于 progress 结果手动创建目录和lake文件
 * */
export const importBook = async ({ group, book }) => {
  try {
    await getOrgData()
    const newTocMap: Record<string, Toc | undefined> = {}
    const groups = await getTargetGroups()

    const isExistGroup = groups.data.find((i) => i.name === group.name)
    let groupId, bookId

    if (!isExistGroup) {
      const newGroup = await createGroup(group)
      groupId = newGroup.data.id
    } else {
      groupId = isExistGroup.id
    }

    const repos = await getTargetRepos(groupId)

    const isExistBook = repos.data[0].books?.find((i) => i.name === book.name)

    if (!isExistBook) {
      const newBook = await createBook({ groupId, name: book.name })
      bookId = newBook.data.id
    } else {
      bookId = isExistBook.id
    }

    const baseDir = `${app.getPath('downloads')}/${group.name}/${book.name}`

    const progressJson: ProgressItem[] = JSON.parse(
      fs.readFileSync(`${baseDir}/progress.json`, 'utf-8')
    )

    // 基于目录结构创建目录和文件
    for (const item of progressJson) {
      const title = item.pathTitleList.join('/')
      const parentTitle = item.pathTitleList.slice(0, item.pathTitleList.length - 1).join('/')
      const parentNode = newTocMap[parentTitle]

      if (newTocMap[title]) {
        continue
      }

      if (item.toc.type === 'DOC') {
        await uploadLakeFile({
          bookId,
          title: item.toc.title,
          type: item.path.split('.').slice(-1)[0],
          filePath: path.join(`${baseDir}/${item.path}`),
          targetUuid: parentNode?.uuid,
          tocNodeUuid: parentNode?.uuid,
          createFrom: parentNode?.type === 'DOC' ? 'doc_toc' : 'import'
        })
          .then((res) => {
            if (item.toc.title === '集群公网域名') {
              console.log('res', res.data)
            }
            newTocMap[title] = res.data
          })
          .catch((e) => {
            console.log(e)
            console.log(`导入 ${title} 失败`)
          })
      }

      if (item.toc.type === 'TITLE') {
        await createToc({
          bookId,
          title: item.toc.title,
          type: item.toc.type,
          parentNodeUuid: parentNode?.uuid
        }).then(({ data }) => {
          newTocMap[title] = data
        })
      }
    }
    console.log('success')
    return { message: '导入成功', status: 'success' }
  } catch (e) {
    return { message: '导入失败', status: 'fail' }
  }
}
