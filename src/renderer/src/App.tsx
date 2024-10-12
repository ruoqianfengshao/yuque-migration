import { Typography, Row, Col, Alert } from 'antd'
import { SettingTwoTone } from '@ant-design/icons'
import { useConfigModal } from './components/config'
import { ConfigInfoProvider } from './components/context'
import { useState } from 'react'
import { GroupList } from './components/group-list'
import { RepoList } from './components/repo-list'
import './index.css'

const { Title } = Typography
function App(): JSX.Element {
  const [config, setConfig] = useState<any>({})
  const [group, setGroup] = useState<any>({})

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
      <Alert
        message={
          <>
            1.先点击标题旁边的配置按钮进行配置
            <br />
            2.公司语雀没有开放 token 授权，无法自动导入，工具只能下载对应知识库，请手动导入；
          </>
        }
        type="warning"
      />
      <br></br>
      <Row gutter={12}>
        <Col span={12}>
          <GroupList currentGroupId={group?.id} onClick={handleGroupClick}></GroupList>
        </Col>
        <Col span={12}>
          <RepoList groupId={group?.id}></RepoList>
        </Col>
      </Row>
      {dom}
    </ConfigInfoProvider>
  )
}

export default App
