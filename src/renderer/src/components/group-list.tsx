import { List, Spin } from 'antd'
import { useEffect, useState } from 'react'
import { useConfigInfoContext } from './context'

type GroupListProps = {
  onClick?: (data) => void
  currentGroupId?: number
}
export const GroupList = (props: GroupListProps) => {
  const { currentGroupId, onClick } = props
  const [data, setData] = useState<any>([])
  const { value, domain, token } = useConfigInfoContext()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (value && domain && token) {
      setLoading(true)
      window.api
        .getGroups()
        .then((res) => {
          setData(res.data)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [value, domain, token])

  return (
    <Spin spinning={loading}>
      <List
        header={<div className="group-header">当前拥有团队</div>}
        bordered
        dataSource={data}
        renderItem={(item: any) => (
          <List.Item
            className={currentGroupId === item.id ? 'group-item-active' : ''}
            onClick={() => onClick?.(item)}
          >
            {item.name}
          </List.Item>
        )}
      />
    </Spin>
  )
}
