import { useState } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, Select, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { mockEnterprises } from '../mock/enterprises'
import { mockParks } from '../mock/parks'

export default function EnterpriseManagement() {
  const [enterprises, setEnterprises] = useState(mockEnterprises)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const parkMap = Object.fromEntries(mockParks.map(p => [p.id, p.name]))

  const columns = [
    { title: '企业名称', dataIndex: 'name', key: 'name' },
    { title: '行业', dataIndex: 'industry', key: 'industry', render: (t) => <Tag color="blue">{t}</Tag> },
    { title: '规模', dataIndex: 'scale', key: 'scale', render: (s) => <Tag color={s === '大型' ? 'red' : s === '中型' ? 'orange' : 'green'}>{s}</Tag> },
    { title: '所属园区', dataIndex: 'parkId', key: 'parkId', render: (id) => parkMap[id] || '-' },
    { title: '联系人', dataIndex: 'contact', key: 'contact' },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => (
      <Tag color={s === 'active' ? 'green' : 'red'}>{s === 'active' ? '启用' : '停用'}</Tag>
    )},
  ]

  const handleAdd = () => {
    form.validateFields().then(values => {
      setEnterprises([...enterprises, { id: enterprises.length + 1, ...values }])
      message.success('添加企业成功！')
      setModalOpen(false)
      form.resetFields()
    })
  }

  return (
    <Card title="企业端管理" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>添加企业</Button>}>
      <Table dataSource={enterprises} columns={columns} rowKey="id" />
      <Modal title="添加企业" open={modalOpen} onOk={handleAdd} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="企业名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="industry" label="行业"><Input /></Form.Item>
          <Form.Item name="scale" label="规模">
            <Select options={[{ value: '大型', label: '大型' }, { value: '中型', label: '中型' }, { value: '小型', label: '小型' }]} />
          </Form.Item>
          <Form.Item name="parkId" label="所属园区">
            <Select options={mockParks.map(p => ({ value: p.id, label: p.name }))} allowClear placeholder="选择园区" />
          </Form.Item>
          <Form.Item name="contact" label="联系人"><Input /></Form.Item>
          <Form.Item name="phone" label="联系电话"><Input /></Form.Item>
          <Form.Item name="status" label="状态" initialValue="active">
            <Select options={[{ value: 'active', label: '启用' }, { value: 'inactive', label: '停用' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
