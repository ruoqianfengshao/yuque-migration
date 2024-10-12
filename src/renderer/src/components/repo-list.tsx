import {
  CheckCircleTwoTone,
  ExclamationCircleTwoTone,
  FolderOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import { Button, List, Space, Spin } from 'antd'
import { useEffect, useState } from 'react'

type RepoListProps = {
  groupId: number
}

export const RepoList = (props: RepoListProps) => {
  const { groupId } = props
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
    if (status === 'success') {
      return <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 30 }} />
    }
    if (status === 'failed') {
      return <ExclamationCircleTwoTone twoToneColor="#faad14" style={{ fontSize: 30 }} />
    }
    if (status === 'pending') {
      return <LoadingOutlined style={{ fontSize: 30 }} />
    }
    return <FolderOutlined style={{ fontSize: 30 }} />
  }

  const handleDownloadAll = async () => {
    for (const item of data) {
      const newMap = { [item.id]: { status: 'pending', message: '下载中...' }, ...statusMap }
      setStatusMap(newMap)
      await window.api.downloadRepos(item).then((res) => {
        statusMap[item.id] = res
        const newResultMap = { [item.id]: res, ...statusMap }
        setStatusMap(newResultMap)
      })
    }
  }

  const handleDownload = async (item) => {
    const newMap = { [item.id]: { status: 'pending', message: '下载中...' }, ...statusMap }
    setStatusMap(newMap)
    await window.api.downloadRepos(item).then((res) => {
      statusMap[item.id] = res
      const newResultMap = { [item.id]: res, ...statusMap }
      setStatusMap(newResultMap)
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
                下载知识库
              </Button>
            </Space>
          </div>
        }
        bordered
        dataSource={data}
        renderItem={(item: any) => {
          return (
            <Spin spinning={statusMap[item.id]?.status === 'pending'}>
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
                <div>
                  <Button type="primary" size="small" onClick={() => handleDownload(item)}>
                    下载
                  </Button>
                </div>
              </List.Item>
            </Spin>
          )
        }}
      />
    </Spin>
  )
}
