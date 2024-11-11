import { Typography, Row, Col, Alert } from 'antd'
import { SettingTwoTone } from '@ant-design/icons'
import { useConfigModal } from './components/config'
import { ConfigInfoProvider } from './components/context'
import { useEffect, useState } from 'react'
import { GroupList } from './components/group-list'
import { RepoList } from './components/repo-list'
import './index.css'

const { Title } = Typography
function App(): JSX.Element {
  const [config, setConfig] = useState<any>({})
  const [group, setGroup] = useState<any>({})

  useEffect(() => {
    window.api.getConfig().then((data) => {
      if (data) {
        setConfig(data)
      }
    })
  }, [])

  const handleConfigSubmit = (data) => {
    window.api.saveConfig(data)
    setConfig(data)
  }
  const { open, dom } = useConfigModal({ onOk: handleConfigSubmit })

  const handleGroupClick = (data) => {
    setGroup(data)
  }

  return (
    <ConfigInfoProvider value={config}>
      <Title style={{ textAlign: 'center' }}>
        私有语雀迁移工具 <SettingTwoTone twoToneColor="#52c41a" onClick={() => open(true)} />
      </Title>
      <Alert message={'先点击标题旁边的配置按钮进行配置'} type="warning" />
      <br></br>
      <Row gutter={12}>
        <Col span={12}>
          <GroupList currentGroupId={group?.id} onClick={handleGroupClick}></GroupList>
        </Col>
        <Col span={12}>
          <RepoList groupId={group?.id} groupName={group?.name}></RepoList>
        </Col>
      </Row>
      {dom}
    </ConfigInfoProvider>
  )
}

export default App
