import { Col, Divider, Form, Image, Input, Modal, Popover, Row, Typography } from 'antd'
import { useState } from 'react'
import originSessionImg from '../assets/session值.png'
import originCtokenImg from '../assets/取授权码.png'
import targetSessionImg from '../assets/目标语雀 session 值.png'
import targetCTokenImg from '../assets/目标语雀取授权码.png'
const { Title } = Typography
const { Item } = Form

type ConfigModalProps = {
  onOk?: (data) => void
  config: Record<string, string>
}
export const useConfigModal = (props: ConfigModalProps) => {
  const { onOk, config } = props
  const [open, setOpen] = useState<boolean>(false)
  const [form] = Form.useForm()

  const handleOpen = (visible) => {
    setOpen(visible)
    setTimeout(() => {
      if (config) {
        form.setFieldsValue(config)
      } else {
        form.setFieldsValue({
          domain: 'https://aliyuque.antfin.com',
          token: 'ALIPAYCHAIRBUCJSESSIONID',
          targetDomain: 'https://terminuscloud.yuque.com',
          targetToken: '_yuque_session'
        })
      }
    }, 500)
  }

  const handleOk = () => {
    form.validateFields().then((values) => {
      onOk?.(values)
      console.log('values', values)
      setOpen(false)
    })
  }

  const dom = open ? (
    <Modal
      closable
      open={!!open}
      width={800}
      okText={'确定'}
      cancelText={'取消'}
      onOk={handleOk}
      onCancel={() => setOpen(false)}
    >
      <Form layout="vertical" form={form}>
        <Row>
          <Col flex={1}>
            <Title level={3}>原语雀配置</Title>
            <Item
              name="domain"
              label="语雀组织域名"
              rules={[
                { required: true, message: '请输入语雀组织域名' },
                {
                  pattern: /^https:\/\/((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,16}$/,
                  message: '域名格式不正确'
                }
              ]}
            >
              <Input placeholder="请输入域名域名"></Input>
            </Item>
            <Item
              name="token"
              label="登录 cookie token"
              rules={[{ required: true, message: '请输入登录 cookie token' }]}
            >
              <Input placeholder="请输入登录 cookie token"></Input>
            </Item>
            <Item
              name="value"
              label="token的值"
              rules={[{ required: true, message: '请输入token的值' }]}
              help={
                <Popover content={<Image src={originSessionImg} preview={false} />}>
                  不知道怎么取的话，可以点这里
                </Popover>
              }
            >
              <Input placeholder="请输入登录 cookie token 的值"></Input>
            </Item>
            <Item
              name="ctoken"
              label="授权码"
              rules={[{ required: true, message: '请输入授权码' }]}
              help={
                <Popover content={<Image src={originCtokenImg} preview={false} />}>
                  不知道怎么取的话，可以点这里
                </Popover>
              }
            >
              <Input placeholder="请输入登录 cookie yuque_ctoken 的值"></Input>
            </Item>
          </Col>
          <Col flex={0}>
            <Divider type="vertical" style={{ height: '100%' }}></Divider>
          </Col>
          <Col flex={1}>
            <Title level={3}>目标语雀配置</Title>
            <Item
              name="targetDomain"
              label="语雀域名"
              rules={[
                { required: true, message: '请输入语雀域名' },
                {
                  pattern: /^https:\/\/((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,16}$/,
                  message: '域名格式不正确'
                }
              ]}
            >
              <Input placeholder="请输入域名域名"></Input>
            </Item>
            <Item
              name="targetToken"
              label="登录 cookie token"
              rules={[{ required: true, message: '请输入登录 cookie token' }]}
            >
              <Input placeholder="请输入登录 cookie token"></Input>
            </Item>
            <Item
              name="targetValue"
              label="token的值"
              rules={[{ required: true, message: '请输入token的值' }]}
              help={
                <Popover content={<Image src={targetSessionImg} preview={false} />}>
                  不知道怎么取的话，可以点这里
                </Popover>
              }
            >
              <Input placeholder="请输入登录 cookie token 的值"></Input>
            </Item>
            <Item
              name="targetCtoken"
              label="授权码"
              rules={[{ required: true, message: '请输入授权码' }]}
              help={
                <Popover content={<Image src={targetCTokenImg} preview={false} />}>
                  不知道怎么取的话，可以点这里
                </Popover>
              }
            >
              <Input placeholder="请输入登录 cookie yuque_ctoken 的值"></Input>
            </Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  ) : null

  return { open: handleOpen, dom }
}
