import axios from 'axios'
import { app } from 'electron'
import zip from 'adm-zip'

const store: Record<string, string> = {}

const renameFolderName = (name: string) => {
  return name.split(' ').join('')
}

// axios 发起的所有请求增加一个 X-Auth-Token 请求头
const request = axios.create({
  baseURL: 'https://aliyuque.antfin.com/'
})

export const saveConfig = (config): void => {
  Object.keys(config).forEach((i) => {
    store[i] = config[i]
  })
  request.defaults.headers.common['Cookie'] = `${store.token}=${store.value};`
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
  const repoUrl = `https://aliyuque.antfin.com/${repo.user.login}/${repo.slug}`
  const downloadPath = `${app.getPath('downloads')}/${repo.user.name}`
  try {
    const { main: yuque } = await import('yuque-dl')
    await yuque(repoUrl, {
      distDir: downloadPath,
      ignoreImg: false,
      toc: true,
      key: store.token,
      token: store.value
    })
    const newZip = new zip()
    newZip.addLocalFolder(renameFolderName(`${downloadPath}/${repo.name}`))
    await newZip.writeZipPromise(renameFolderName(`${downloadPath}/${repo.name}.zip`))
    return { message: `已下载至 下载/${repo.user.name}/${repo.name}`, status: 'success' }
  } catch (error) {
    console.log('error: ', error)
    return { message: error, status: 'failed' }
  }
}
