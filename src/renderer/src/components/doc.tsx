import { Drawer, Typography } from 'antd'
import { useState } from 'react'

const { Title, Text, Paragraph } = Typography
export const useDocDrawer = () => {
  const [open, setOpen] = useState<boolean>(false)

  const handleOpen = () => {
    setOpen(true)
  }

  const dom = (
    <Drawer width="50%" open={open} onClose={() => setOpen(false)}>
      <Typography>
        <Title level={1}>语雀迁移工具操作手册</Title>
        <Title level={3}>简介</Title>
        <Paragraph>
          本工具通过模拟用户操作语雀 api 实现导入导出功能，支持语雀知识库下载和迁移
        </Paragraph>
        <Title level={3}>注意事项（必看）</Title>
        <Paragraph>
          <Text strong>
            1.
            在知识库迁移过程中，请不要进行其他操作，比如切换团队、切换知识库、重新配置登录信息。导入结束后才可以进行其他操作
          </Text>
        </Paragraph>
        <Paragraph>
          <Text>2. 当前版本（1.2.0）不支持视频自动上传，连接阿里郎后，会把视频下载到本地目录</Text>
        </Paragraph>
        <Paragraph>
          <Text>
            3.
            本工具支持目录级别的增量同步，即原知识库中有新增的文档或目录，点击知识库的迁移按钮会自动增量同步，对文档内容调整是不支持增量同步的；
            如果需要对已迁移内容更新，建议单独文件复制到新知识库或者删掉新知识库重新迁移
          </Text>
        </Paragraph>
        <Paragraph>
          <Text>
            4. 因为语雀
            API实现，部分文档标题的特殊字符会被转义，建议提前对标题中的特殊字符进行处理，如&,/,&lt;,&gt;等字符串
          </Text>
        </Paragraph>
        <Paragraph>
          <Text>5. 本工具会对部分标题空格做处理，迁移后可能会发现某些文档标题的空格丢失</Text>
        </Paragraph>
        <Paragraph>
          <Text>
            6.
            通过本工具下载到系统下载目录中的知识库内容在确保不需要以后可以删除，上传会基于本地已下载的内容进行上传
          </Text>
        </Paragraph>
        <Paragraph>
          <Text>7. 当前版本（1.2.0）会把空内容文档创建出来，不会自动识别草稿内容</Text>
        </Paragraph>
        <Paragraph>
          <Text>8. 当前版本（1.2.0）会把链接节点原样创建出来，不会处理链接对应内容</Text>
        </Paragraph>
        <Paragraph>
          <Text>9. 有其他使用问题，请联系王凯凯（笑武）</Text>
        </Paragraph>
        <Title level={3}>开始使用</Title>
        <Paragraph>
          1.
          先进行语雀登录信息配置，所有信息都保存在用户电脑上，不会上传登录信息，首次配置后自动保存；
          具体配置提示信息在配置界面字段提示中有图片说明
        </Paragraph>
        <Paragraph>
          <Text strong>只需要在对应域名下打开任意页面获取配置信息即可</Text>
        </Paragraph>
        <Paragraph>
          <Text strong>如果网页端语雀重新登录的话请再次配置</Text>
        </Paragraph>
        <Paragraph>
          <Text>2. 在团队列表会展示当前用户所属团队，选中团队后会出现团队下的知识库列表</Text>
        </Paragraph>
        <Paragraph>
          <Text>3. 点击知识库中的下载按钮会把知识库文档下载到系统下载目录</Text>
        </Paragraph>
        <Paragraph>
          <Text strong>
            4.
            点击知识库中的迁移按钮会把知识库文档下载到系统下载目录，然后上传到用户有权限的对应团队的对应知识库中，如果当前用户所属的团队和知识库不存在，会自动创建团队和知识库
          </Text>
        </Paragraph>
        <Paragraph>
          <Text>5. 迁移完成后对应知识库会提示导入成功，可以去对应团队中的新知识库检查</Text>
        </Paragraph>
      </Typography>
    </Drawer>
  )

  return {
    open: handleOpen,
    dom
  }
}
