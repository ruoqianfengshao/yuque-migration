import { Form, Image, Input, Modal, Popover } from 'antd'
import { useState } from 'react'
import { useConfigInfoContext } from './context'
import image from '../assets/说明.png'

const { Item } = Form

type ConfigModalProps = {
  onOk?: (data) => void
}
export const useConfigModal = (props: ConfigModalProps) => {
  const { onOk } = props
  const [open, setOpen] = useState<boolean>(false)
  const [form] = Form.useForm()
  const config = useConfigInfoContext()

  const handleOpen = (visible) => {
    setOpen(visible)
    setTimeout(() => {
      form.setFieldsValue(config)
    }, 500)
  }

  const handleOk = () => {
    form.validateFields().then((values) => {
      onOk?.(values)
      setOpen(false)
    })
  }

  const dom = open ? (
    <Modal
      closable
      title="设置基本信息"
      open={!!open}
      okText={'确定'}
      cancelText={'取消'}
      onOk={handleOk}
      onCancel={() => setOpen(false)}
    >
      <Form
        layout="vertical"
        initialValues={{
          domain: 'https://aliyuque.antfin.com',
          token: 'ALIPAYCHAIRBUCJSESSIONID'
        }}
        form={form}
      >
        <Item
          name="domain"
          label="语雀域名"
          rules={[{ required: true, message: '请输入语雀域名' }]}
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
            <Popover content={<Image src={image} preview={false} />}>
              不知道怎么取的话，可以点这里
            </Popover>
          }
        >
          <Input placeholder="请输入登录 cookie token的值"></Input>
        </Item>
      </Form>
    </Modal>
  ) : null

  return { open: handleOpen, dom }
}
