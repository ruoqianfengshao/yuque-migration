import {
  CheckCircleTwoTone,
  ExclamationCircleTwoTone,
  FolderOutlined,
  LoadingOutlined,
  CloudSyncOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import { Button, List, Space, Spin, Tooltip } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'

type RepoListProps = {
  groupId: number
  groupName?: string
}

export const RepoList = (props: RepoListProps) => {
  const { groupId, groupName } = props
  const [data, setData] = useState<any>([])
  const [statusMap, setStatusMap] = useState<Record<string, { status; message }>>({})
  const [loading, setLoading] = useState(false)
  const statusMapRef = useRef({})

  const updateStatus = useCallback(
    (data) => {
      statusMapRef.current = { ...statusMapRef.current, ...data }
      setStatusMap({ ...statusMap, ...data })
    },
    [statusMap]
  )

  useEffect(() => {
    if (groupId) {
      setLoading(true)
      window.api
        .getRepos(groupId)
        .then((res) => {
          const repos = res.data?.reduce((acc, curr) => {
            curr.books.forEach((i) => {
              acc.push(i)
            })
            return acc
          }, [])
          setData(repos)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [groupId])

  const DownloadIcon = ({ status }: { status?: string }) => {
    if (status === 'downloaded') {
      return <DownloadOutlined color="#52c41a" style={{ fontSize: 30 }} />
    }
    if (status === 'failed') {
      return <ExclamationCircleTwoTone twoToneColor="#faad14" style={{ fontSize: 30 }} />
    }
    if (status === 'downloading') {
      return <LoadingOutlined style={{ fontSize: 30 }} />
    }
    if (status === 'importing') {
      return <CloudSyncOutlined style={{ fontSize: 30 }} />
    }
    if (status === 'uploaded') {
      return <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 30 }} />
    }
    return <FolderOutlined style={{ fontSize: 30 }} />
  }

  const handleDownloadAll = async () => {
    setLoading(true)
    for (const item of data) {
      updateStatus({ [item.id]: { status: 'downloading', message: '下载中...' } })
      await window.api.downloadRepos(item).then((res) => {
        updateStatus({ [item.id]: res })
      })
    }
    new window.Notification('语雀迁移', {
      silent: true,
      body: `团队：${groupName}下载完成`
    })
    setLoading(false)
  }

  const downloadRepo = async (item) => {
    updateStatus({ [item.id]: { status: 'downloading', message: '下载中...' } })
    return await window.api.downloadRepos(item).then((res) => {
      return res
    })
  }

  const handleImportAll = async () => {
    setLoading(true)
    for (const item of data) {
      await importItem(item)
    }

    new window.Notification('语雀迁移', {
      silent: true,
      body: `团队：${groupName}迁移完成`
    })
    setLoading(false)
  }

  const importItem = async (item) => {
    return await downloadRepo(item).then(async (res) => {
      if (res.status === 'success') {
        updateStatus({ [item.id]: { status: 'importing', message: '导入中...' } })
        await window.api
          .importBook({
            group: { name: groupName },
            book: item
          })
          .then(() => {
            updateStatus({ [item.id]: { message: '导入成功', status: 'uploaded' } })
            new window.Notification('语雀迁移', {
              silent: true,
              body: `知识库：${item.name}导入完成`
            })
          })
          .catch((e) => {
            updateStatus({ [item.id]: { message: `导入失败 ${e}`, status: 'failed' } })
            new window.Notification('语雀迁移', {
              silent: true,
              body: `知识库：${item.name}导入失败`
            })
          })
      } else {
        updateStatus({ [item.id]: res })
        new window.Notification('语雀迁移', {
          silent: true,
          body: `知识库：${item.name}下载失败`
        })
      }
    })
  }

  const handleDownload = async (item) => {
    setLoading(true)
    await downloadRepo(item)
      .then((res) => {
        updateStatus({ [item.id]: res })
        new window.Notification('语雀迁移', {
          silent: true,
          body: `知识库：${item.name}下载成功`
        })
      })
      .catch((e) => {
        updateStatus({ [item.id]: { message: e, status: 'failed' } })
        new window.Notification('语雀迁移', {
          silent: true,
          body: `知识库：${item.name}下载失败`
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleImport = async (item) => {
    setLoading(true)
    await importItem(item).finally(() => {
      setLoading(false)
    })
  }

  return (
    <Spin spinning={loading}>
      <List
        header={
          <div className="repo-header">
            <span>所属团队知识库</span>
            <Space>
              <Button size="small" type="primary" onClick={handleDownloadAll}>
                下载全部
              </Button>
              <Button size="small" type="primary" onClick={handleImportAll}>
                迁移全部
              </Button>
            </Space>
          </div>
        }
        bordered
        dataSource={data}
        renderItem={(item: any) => {
          return (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <DownloadIcon status={statusMapRef.current[item.id]?.status}></DownloadIcon>
                }
                title={item.name}
                description={
                  statusMapRef.current[item.id]?.status === 'failed' ? (
                    <>
                      失败原因：{statusMapRef.current[item.id]?.message}
                      <br />
                      请检查文档内容并手动下载
                    </>
                  ) : (
                    statusMapRef.current[item.id]?.message
                  )
                }
              ></List.Item.Meta>
              <Space>
                <Tooltip title="仅下载">
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    size="small"
                    onClick={() => handleDownload(item)}
                  />
                </Tooltip>
                <Tooltip title="下载并导入">
                  <Button type="primary" size="small" onClick={() => handleImport(item)}>
                    迁移
                  </Button>
                </Tooltip>
              </Space>
            </List.Item>
          )
        }}
      />
    </Spin>
  )
}
