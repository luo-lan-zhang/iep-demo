import { useState } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, Select, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { mockTeachers } from '../mock/teachers'
import { mockSchools } from '../mock/schools'

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState(mockTeachers)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const schoolMap = Object.fromEntries(mockSchools.map(s => [s.id, s.name]))

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '所属院校', dataIndex: 'schoolId', key: 'schoolId', render: (id) => schoolMap[id] || '未知' },
    { title: '职称', dataIndex: 'title', key: 'title', render: (t) => <Tag color="blue">{t}</Tag> },
    { title: '院系', dataIndex: 'department', key: 'department' },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
  ]

  const handleAdd = () => {
    form.validateFields().then(values => {
      setTeachers([...teachers, { id: teachers.length + 1, ...values }])
      message.success('添加教师成功！')
      setModalOpen(false)
      form.resetFields()
    })
  }

  return (
    <Card title="教师管理" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>添加教师</Button>}>
      <Table dataSource={teachers} columns={columns} rowKey="id" />
      <Modal title="添加教师" open={modalOpen} onOk={handleAdd} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="schoolId" label="所属院校" rules={[{ required: true }]}>
            <Select options={mockSchools.map(s => ({ value: s.id, label: s.name }))} />
          </Form.Item>
          <Form.Item name="title" label="职称">
            <Select options={[{ value: '教授', label: '教授' }, { value: '副教授', label: '副教授' }, { value: '讲师', label: '讲师' }]} />
          </Form.Item>
          <Form.Item name="department" label="院系"><Input /></Form.Item>
          <Form.Item name="phone" label="联系电话"><Input /></Form.Item>
          <Form.Item name="email" label="邮箱"><Input /></Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
