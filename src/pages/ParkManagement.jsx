import { useState } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, Select, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { mockParks } from '../mock/parks'

export default function ParkManagement() {
  const [parks, setParks] = useState(mockParks)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const columns = [
    { title: '园区名称', dataIndex: 'name', key: 'name' },
    { title: '所在区域', dataIndex: 'region', key: 'region' },
    { title: '负责人', dataIndex: 'contact', key: 'contact' },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => (
      <Tag color={s === 'active' ? 'green' : 'red'}>{s === 'active' ? '启用' : '停用'}</Tag>
    )},
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
  ]

  const handleAdd = () => {
    form.validateFields().then(values => {
      const newPark = {
        id: parks.length + 1,
        ...values,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setParks([...parks, newPark])
      message.success('添加园区成功！')
      setModalOpen(false)
      form.resetFields()
    })
  }

  return (
    <Card title="园区端管理" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>添加园区</Button>}>
      <Table dataSource={parks} columns={columns} rowKey="id" />
      <Modal title="添加园区" open={modalOpen} onOk={handleAdd} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="园区名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="region" label="所在区域" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contact" label="负责人" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="active">
            <Select options={[{ value: 'active', label: '启用' }, { value: 'inactive', label: '停用' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
