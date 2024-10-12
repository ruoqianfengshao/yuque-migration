import { CheckCircleTwoTone, ExclamationCircleTwoTone, FolderOutlined } from '@ant-design/icons'
import { List } from 'antd'

const DownloadIcon = ({ status }: { status?: string }) => {
  if (status === 'success') {
    return <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 30 }} />
  }
  if (status === 'failed') {
    return <ExclamationCircleTwoTone twoToneColor="#faad14" style={{ fontSize: 30 }} />
  }
  return <FolderOutlined style={{ fontSize: 30 }} />
}

export const RepoItem = (item) => {
  return (
    <List.Item>
      <List.Item.Meta
        avatar={<DownloadIcon status={statusMap[item.id]?.status}></DownloadIcon>}
        title={item.name}
        description={statusMap[item.id]?.message}
      ></List.Item.Meta>
    </List.Item>
  )
}
