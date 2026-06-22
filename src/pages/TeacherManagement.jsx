import { useState, useMemo } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, Select, message, Popconfirm, Descriptions } from 'antd'
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { mockTeachers } from '../mock/teachers'
import { mockSchools } from '../mock/schools'
import { useAuth } from '../context/AuthContext'

export default function TeacherManagement() {
  const { user } = useAuth()
  const [teachers, setTeachers] = useState(mockTeachers)
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailTeacher, setDetailTeacher] = useState(null)
  const [form] = Form.useForm()

  const schoolMap = Object.fromEntries(mockSchools.map(s => [s.id, s.name]))
  const role = user?.role || 'admin'
  const schoolId = user?.schoolId

  const filteredTeachers = useMemo(() => {
    if (role === 'school') return teachers.filter(t => t.schoolId === schoolId)
    return teachers
  }, [teachers, role, schoolId])

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '所属院校', dataIndex: 'schoolId', key: 'schoolId', render: (id) => schoolMap[id] || '未知' },
    { title: '职称', dataIndex: 'title', key: 'title', render: (t) => <Tag color="blue">{t}</Tag> },
    { title: '院系', dataIndex: 'department', key: 'department' },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '操作', key: 'action', render: (_, r) => (
      <span style={{ display: 'flex', gap: 4 }}>
        <Button size="small" icon={<EyeOutlined />} onClick={() => { setDetailTeacher(r); setDetailOpen(true) }}>查看</Button>
        <Popconfirm title="确定删除此教师？" onConfirm={() => { setTeachers(teachers.filter(t => t.id !== r.id)); message.success('已删除') }} okText="确定" cancelText="取消">
          <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </span>
    )},
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
      <Table dataSource={filteredTeachers} columns={columns} rowKey="id" />
      <Modal title="添加教师" open={modalOpen} onOk={handleAdd} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="schoolId" label="所属院校" rules={[{ required: true }]} initialValue={role === 'school' ? schoolId : undefined}>
            <Select options={mockSchools.map(s => ({ value: s.id, label: s.name }))} disabled={role === 'school'} />
          </Form.Item>
          <Form.Item name="title" label="职称">
            <Select options={[{ value: '教授', label: '教授' }, { value: '副教授', label: '副教授' }, { value: '讲师', label: '讲师' }]} />
          </Form.Item>
          <Form.Item name="department" label="院系"><Input /></Form.Item>
          <Form.Item name="phone" label="联系电话"><Input /></Form.Item>
          <Form.Item name="email" label="邮箱"><Input /></Form.Item>
        </Form>
      </Modal>

      <Modal title="教师详情" open={detailOpen} onCancel={() => { setDetailOpen(false); setDetailTeacher(null) }} footer={null} width={500}>
        {detailTeacher && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="姓名">{detailTeacher.name}</Descriptions.Item>
            <Descriptions.Item label="所属院校">{schoolMap[detailTeacher.schoolId] || '-'}</Descriptions.Item>
            <Descriptions.Item label="职称">{detailTeacher.title}</Descriptions.Item>
            <Descriptions.Item label="院系">{detailTeacher.department}</Descriptions.Item>
            <Descriptions.Item label="电话">{detailTeacher.phone}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{detailTeacher.email}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  )
}
