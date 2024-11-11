import axios from 'axios'
import { app } from 'electron'
import zip from 'adm-zip'
import fs from 'node:fs'
import { Toc } from './import/type'
import path from 'node:path'

type Store = {
  domain?: string
  token?: string
  value?: string
  ctoken?: string
  targetDomain?: string
  targetToken?: string
  targetValue?: string
  targetCtoken?: string
}

type Group = {
  id: number
  name: string
  public: number
  scene: string
  organization_id: number
}

type TocProps = {
  bookId: number
  parentNodeUuid?: string
  title: string
  type: string
}

type ImportFileProps = {
  bookId: number
  type: string
  title?: string
  filePath: string
  tocNodeUuid?: string
  tocNodeTitle?: string
  targetUuid?: string
  createFrom: string
}

const store: Store = {} as Store

const orgMap = {}

const renameFolderName = (name: string) => {
  return name.split(' ').join('')
}

const request = axios.create({})

const targetRequest = axios.create({})

const configPath = path.join(app.getPath('userData'), 'yuque_migration_config.json')

export const getConfig = () => {
  try {
    const content = fs.readFileSync(configPath, 'utf-8')
    const config = JSON.parse(content)
    if (config) {
      Object.keys(config).forEach((i) => {
        store[i] = config[i]
      })
      request.defaults.baseURL = store.domain
      request.defaults.headers.common['Cookie'] = `${store.token}=${store.value};`
      request.defaults.headers.common['x-csrf-token'] = store.ctoken
      request.defaults.headers.common['Referer'] = store.domain

      targetRequest.defaults.baseURL = store.targetDomain
      targetRequest.defaults.headers.common['Cookie'] = `${store.targetToken}=${store.targetValue};`
      targetRequest.defaults.headers.common['x-csrf-token'] = store.targetCtoken
      targetRequest.defaults.headers.common['Referer'] = store.targetDomain
    }
    return config
  } catch (error) {
    return {}
  }
}

export const saveConfig = (config): void => {
  Object.keys(config).forEach((i) => {
    store[i] = config[i]
  })
  request.defaults.baseURL = store.domain
  request.defaults.headers.common['Cookie'] = `${store.token}=${store.value};`
  request.defaults.headers.common['x-csrf-token'] = store.ctoken
  request.defaults.headers.common['Referer'] = store.domain

  targetRequest.defaults.baseURL = store.targetDomain
  targetRequest.defaults.headers.common['Cookie'] = `${store.targetToken}=${store.targetValue};`
  targetRequest.defaults.headers.common['x-csrf-token'] = store.targetCtoken
  targetRequest.defaults.headers.common['Referer'] = store.targetDomain
  console.log('saveConfig', store)
  fs.writeFileSync(configPath, JSON.stringify(store), { encoding: 'utf-8' })
}

// 获取团队
export const getGroups = async (): Promise<{ data: Record<string, string | number>[] }> =>
  await request.get('/api/mine/groups?offset=0&limit=200').then((res) => {
    return res.data
  })

export const getRepos = async (
  groupId: number
): Promise<{ data: Record<string, string | number>[] }> =>
  await request
    .get(`/api/groups/${groupId}/bookstacks`)
    .then((res) => {
      return res.data
    })
    .catch((e) => {
      console.log(e)
    })

export const downloadRepos = async (repo: Record<string, any>) => {
  const repoUrl = `${store.domain}/${repo.user.login}/${repo.slug}`
  const downloadPath = `${app.getPath('downloads')}/${repo.user.name}`
  try {
    const { main: yuque } = await import('@terminus/yuque-dl')
    await yuque(repoUrl, {
      distDir: downloadPath,
      ignoreImg: false,
      toc: true,
      key: store.token,
      token: store.value,
      docExportType: 'lake',
      boardExportType: 'lakeboard',
      sheetExportType: 'lakesheet',
      tableExportType: 'laketable',
      ctoken: store.ctoken
    })
    const newZip = new zip()
    newZip.addLocalFolder(renameFolderName(`${downloadPath}/${repo.name}`))
    await newZip.writeZipPromise(renameFolderName(`${downloadPath}/${repo.name}.zip`))
    return { message: `已下载至 下载/${repo.user.name}/${repo.name}`, status: 'success' }
  } catch (error) {
    console.log('error: ', error)
    const err = String(error)
    if (err.includes('401')) {
      return { message: '登录失败，请检查语雀配置', status: 'failed' }
    }

    if (err.includes('toc')) {
      return { message: '知识库没有内容', status: 'failed' }
    }
    return { message: '下载失败', status: 'failed' }
  }
}

export const getOrgData = () => {
  if (store.targetDomain) {
    if (orgMap[store.targetDomain]) {
      return orgMap[store.targetDomain]
    }
    return targetRequest
      .get(`${store.targetDomain}/dashboard/org_wiki`)
      .then(({ data = '', status }) => {
        if (status === 200) return data
        return
      })
      .then((html) => {
        const data = /decodeURIComponent\("(.+)"\)\);/m.exec(html) ?? ''
        if (!data[1]) return {}
        const jsonData = JSON.parse(decodeURIComponent(data[1]))
        orgMap[store.targetDomain!] = jsonData.organization.id
        return store
      })
  }
  throw Error('请配置目标语雀域名')
}

export const getBookData = (url) => {
  return targetRequest
    .get(url)
    .then(({ data = '', status }) => {
      if (status === 200) return data
      return
    })
    .then((html) => {
      const data = /decodeURIComponent\("(.+)"\)\);/m.exec(html) ?? ''
      if (!data[1]) return {}
      const jsonData = JSON.parse(decodeURIComponent(data[1]))
      return jsonData?.book?.toc || []
    })
}

// 获取团队
export const getTargetGroups = async (): Promise<{ data: Record<string, string | number>[] }> =>
  await targetRequest.get('/api/mine/groups?offset=0&limit=200').then((res) => {
    return res.data
  })

export const getTargetRepos = async (groupId: number): Promise<{ data: Record<string, any>[] }> =>
  await targetRequest
    .get(`/api/groups/${groupId}/bookstacks`)
    .then((res) => {
      console.log('getTargetRepos', res.data)
      return res.data
    })
    .catch((e) => {
      console.log(e)
    })

export const createGroup = (group: Group) => {
  const { name } = group
  const organization_id = orgMap[store.targetDomain!]
  return targetRequest
    .post('/api/groups', {
      name,
      public: 0,
      scene: 'group-type-default',
      organization_id
    })
    .then((res) => {
      console.log('createGroup', res.data)
      return res.data
    })
}

export const createBook = ({ groupId, name }) => {
  return targetRequest
    .post('/api/books', {
      name,
      type: 'Book',
      public: 0,
      extend_private: 0,
      user_id: groupId
    })
    .then((res) => {
      console.log('createBook', res.data.data.id)
      return res.data
    })
}

export const createToc = ({ bookId, parentNodeUuid, title, type }: TocProps) => {
  return targetRequest
    .put('/api/catalog_nodes', {
      book_id: bookId,
      format: 'list',
      target_uuid: parentNodeUuid,
      action: 'append',
      type,
      title
    })
    .then((res) => {
      const node = res.data.data.find(
        (i) =>
          i.title === title &&
          (parentNodeUuid == i.parent_uuid || !parentNodeUuid) &&
          i.type === 'TITLE'
      )
      return { data: node }
    })
}

export const importZip = async ({ bookId, filePath }) => {
  const formData = new FormData()

  formData.append('append_to_catalog', true)
  formData.append('action', 'appendChild')
  formData.append('book_id', bookId)
  formData.append('type', 'zip')
  formData.append('import_type', 'create')
  formData.append(
    'options',
    JSON.stringify({
      fileFormat: 'markdown',
      overrideExistsNode: true,
      useFilenameAsTitle: true,
      isGBK: false,
      enableLatex: 1
    })
  )
  formData.append('filename', 'file')
  const filename = filePath.split('/').pop()
  const fileContent = new Blob([fs.readFileSync(filePath)])
  formData.append('file', fileContent, filename)
  return targetRequest.post(`/api/import?ctoken=${store.ctoken}`, formData).then((res) => {
    console.log('importZip', res.data.data.id)
    return res.data.book_id
  })
}

export const getBookToc = (bookId: number): Promise<{ data: { toc: Toc[] } }> => {
  return targetRequest.get(`/api/books/${bookId}/toc`).then((res) => {
    return res.data
  })
}
export const uploadLakeFile = async ({
  bookId,
  type,
  filePath,
  tocNodeUuid,
  tocNodeTitle,
  targetUuid,
  createFrom,
  title
}: ImportFileProps) => {
  const formData = new FormData()

  formData.append('insert_to_catalog', true)
  if (tocNodeUuid) {
    formData.append('toc_node_uuid', tocNodeUuid)
  }
  if (targetUuid) {
    formData.append('target_uuid', targetUuid)
  }
  if (tocNodeTitle) {
    formData.append('toc_node_title', tocNodeTitle)
  }

  formData.append('create_from', createFrom)
  if (type === 'markdown') {
    formData.append('options', JSON.stringify({ enableLatex: 1 }))
  }

  formData.append('action', 'appendChild')
  formData.append('book_id', bookId as unknown as string)
  formData.append('type', type)
  formData.append('import_type', 'create')
  formData.append('filename', 'file')
  const filename = filePath.split('/').pop()
  const fileContent = fs.readFileSync(filePath)

  if (fileContent.length) {
    const fileBlob = new Blob([fileContent])
    formData.append('file', fileBlob, filename)
    return targetRequest.post(`/api/import?ctoken=${store.ctoken}`, formData).then(async (doc) => {
      return getBookToc(bookId).then((res) => {
        return {
          data: res.data.toc.find((i) => {
            return i.parent_uuid === targetUuid && i.title === title
          })
        }
      })
    })
  }
  return { data: undefined }
}
