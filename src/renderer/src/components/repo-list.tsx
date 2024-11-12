import {
  CheckCircleTwoTone,
  ExclamationCircleTwoTone,
  FolderOutlined,
  LoadingOutlined,
  CloudSyncOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import { Button, List, message, Space, Spin, Tooltip } from 'antd'
import { useEffect, useState } from 'react'

type RepoListProps = {
  groupId: number
  groupName?: string
}

export const RepoList = (props: RepoListProps) => {
  const { groupId, groupName } = props
  const [data, setData] = useState<any>([])
  const [statusMap, setStatusMap] = useState<Record<string, { status; message }>>({})
  const [loading, setLoading] = useState(false)

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
    for (const item of data) {
      const newMap = { [item.id]: { status: 'downloading', message: '下载中...' }, ...statusMap }
      setStatusMap(newMap)
      await window.api.downloadRepos(item).then((res) => {
        statusMap[item.id] = res
        const newResultMap = { [item.id]: res, ...statusMap }
        setStatusMap(newResultMap)
      })
    }
  }

  const handleDownload = async (item) => {
    const newMap = { [item.id]: { status: 'downloading', message: '下载中...' }, ...statusMap }
    setStatusMap(newMap)
    return await window.api.downloadRepos(item).then((res) => {
      statusMap[item.id] = res
      const newResultMap = { ...statusMap, [item.id]: res }
      setStatusMap(newResultMap)
      return res
    })
  }

  const handleImport = async (item) => {
    setLoading(true)
    await handleDownload(item)
      .then(async (res) => {
        if (res.status === 'success') {
          const newMap = { ...statusMap, [item.id]: { status: 'importing', message: '导入中...' } }
          setStatusMap(newMap)
          await window.api
            .importBook({
              group: { name: groupName },
              book: item
            })
            .then(() => {
              const newResultMap = {
                ...statusMap,
                [item.id]: { message: '导入成功', status: 'uploaded' }
              }
              console.log('upload success', newResultMap)
              setStatusMap(newResultMap)
            })
            .catch((e) => {
              const newResultMap = {
                ...statusMap,
                [item.id]: { message: `导入失败 ${e}`, status: 'failed' }
              }
              console.log('upload fail', newResultMap)
              setStatusMap(newResultMap)
            })
        }
      })
      .catch((e) => {
        console.log(e)
        message.error(e)
      })
      .finally(() => {
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
                下载全部知识库
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
                avatar={<DownloadIcon status={statusMap[item.id]?.status}></DownloadIcon>}
                title={item.name}
                description={
                  statusMap[item.id]?.status === 'failed' ? (
                    <>
                      失败原因：{statusMap[item.id]?.message}
                      <br />
                      请检查文档内容并手动下载
                    </>
                  ) : (
                    statusMap[item.id]?.message
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
