import { Card, Form, Input, Switch, Button, message, Divider } from 'antd'

export default function SystemSettings() {
  const [form] = Form.useForm()

  const handleSave = () => {
    form.validateFields().then(values => {
      console.log('Settings saved:', values)
      message.success('设置保存成功！')
    })
  }

  return (
    <Card title="系统设置">
      <Form form={form} layout="vertical" style={{ maxWidth: 600 }}>
        <Form.Item name="platformName" label="平台名称" initialValue="产教融合智慧管理平台">
          <Input />
        </Form.Item>
        <Form.Item name="contactEmail" label="联系邮箱" initialValue="admin@iep-platform.com">
          <Input />
        </Form.Item>
        <Form.Item name="enableRegister" label="开放注册" valuePropName="checked" initialValue={false}>
          <Switch />
        </Form.Item>
        <Form.Item name="enableAudit" label="需要审核" valuePropName="checked" initialValue={true}>
          <Switch />
        </Form.Item>
        <Divider />
        <Form.Item>
          <Button type="primary" onClick={handleSave}>保存设置</Button>
        </Form.Item>
      </Form>
    </Card>
  )
}
