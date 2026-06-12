import { useState } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, Select, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { mockStudents } from '../mock/students'
import { mockSchools } from '../mock/schools'

export default function StudentManagement() {
  const [students, setStudents] = useState(mockStudents)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const schoolMap = Object.fromEntries(mockSchools.map(s => [s.id, s.name]))

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '所属院校', dataIndex: 'schoolId', key: 'schoolId', render: (id) => <Tag>{schoolMap[id] || '未知'}</Tag> },
    { title: '专业', dataIndex: 'major', key: 'major' },
    { title: '年级', dataIndex: 'grade', key: 'grade' },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
  ]

  const handleAdd = () => {
    form.validateFields().then(values => {
      setStudents([...students, { id: students.length + 1, ...values }])
      message.success('添加学生成功！')
      setModalOpen(false)
      form.resetFields()
    })
  }

  return (
    <Card title="学生管理" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>添加学生</Button>}>
      <Table dataSource={students} columns={columns} rowKey="id" />
      <Modal title="添加学生" open={modalOpen} onOk={handleAdd} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="schoolId" label="所属院校" rules={[{ required: true }]}>
            <Select options={mockSchools.map(s => ({ value: s.id, label: s.name }))} />
          </Form.Item>
          <Form.Item name="major" label="专业"><Input /></Form.Item>
          <Form.Item name="grade" label="年级">
            <Select options={[{ value: '2021级', label: '2021级' }, { value: '2022级', label: '2022级' }, { value: '2023级', label: '2023级' }, { value: '2024级', label: '2024级' }]} />
          </Form.Item>
          <Form.Item name="phone" label="联系电话"><Input /></Form.Item>
          <Form.Item name="email" label="邮箱"><Input /></Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
