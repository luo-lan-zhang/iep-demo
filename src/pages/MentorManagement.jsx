import { useState, useMemo } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, Select, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { mockMentors } from '../mock/mentors'
import { mockEnterprises } from '../mock/enterprises'
import { useAuth } from '../context/AuthContext'

export default function MentorManagement() {
  const { user } = useAuth()
  const [mentors, setMentors] = useState(mockMentors)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const enterpriseMap = Object.fromEntries(mockEnterprises.map(e => [e.id, e.name]))
  const role = user?.role || 'admin'
  const enterpriseId = user?.enterpriseId

  const filteredMentors = useMemo(() => {
    if (role === 'enterprise') {
      return mentors.filter(m => m.enterpriseId === enterpriseId)
    }
    return mentors
  }, [mentors, role, enterpriseId])

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '所属企业', dataIndex: 'enterpriseId', key: 'enterpriseId', render: (id) => <Tag color="blue">{enterpriseMap[id] || '未知'}</Tag> },
    { title: '职位', dataIndex: 'position', key: 'position' },
    { title: '擅长领域', dataIndex: 'skill', key: 'skill', ellipsis: true },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
  ]

  const handleAdd = () => {
    form.validateFields().then(values => {
      setMentors([...mentors, { id: mentors.length + 1, ...values }])
      message.success('添加导师成功！')
      setModalOpen(false)
      form.resetFields()
    })
  }

  return (
    <Card title="企业导师管理" extra={
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>添加导师</Button>
    }>
      <Table dataSource={filteredMentors} columns={columns} rowKey="id" />
      <Modal title="添加导师" open={modalOpen} onOk={handleAdd} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="enterpriseId" label="所属企业" rules={[{ required: true }]}>
            <Select options={mockEnterprises.map(e => ({ value: e.id, label: e.name }))} />
          </Form.Item>
          <Form.Item name="position" label="职位"><Input /></Form.Item>
          <Form.Item name="skill" label="擅长领域"><Input /></Form.Item>
          <Form.Item name="phone" label="联系电话"><Input /></Form.Item>
          <Form.Item name="email" label="邮箱"><Input /></Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
