import { useState, useMemo } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, Select, message, Upload } from 'antd'
import { PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { mockStudents } from '../mock/students'
import { mockSchools } from '../mock/schools'
import { useAuth } from '../context/AuthContext'

export default function StudentManagement() {
  const { user } = useAuth()
  const [students, setStudents] = useState(mockStudents)
  const [modalOpen, setModalOpen] = useState(false)
  const [batchOpen, setBatchOpen] = useState(false)
  const [batchText, setBatchText] = useState('')
  const [form] = Form.useForm()

  const schoolMap = Object.fromEntries(mockSchools.map(s => [s.id, s.name]))
  const role = user?.role || 'admin'
  const schoolId = user?.schoolId

  const filteredStudents = useMemo(() => {
    if (role === 'school') return students.filter(s => s.schoolId === schoolId)
    return students
  }, [students, role, schoolId])

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

  const handleBatchImport = () => {
    const lines = batchText.split('\n').filter(l => l.trim())
    const imported = []
    let nextId = students.length
    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim())
      if (parts.length >= 4) {
        nextId++
        imported.push({ id: nextId, name: parts[0], schoolId: schoolId || parseInt(parts[1]) || 1, major: parts[2], grade: parts[3], phone: parts[4] || '', email: parts[5] || '' })
      }
    }
    if (imported.length === 0) { message.warning('未能识别有效数据，请检查格式'); return }
    setStudents([...students, ...imported])
    message.success(`成功导入 ${imported.length} 名学生！`)
    setBatchText('')
    setBatchOpen(false)
  }

  return (
    <Card title="学生管理" extra={
      <span style={{ display: 'flex', gap: 8 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true) }}>添加学生</Button>
        <Button icon={<UploadOutlined />} onClick={() => { setBatchText(''); setBatchOpen(true) }}>批量导入</Button>
      </span>
    }>
      <Table dataSource={filteredStudents} columns={columns} rowKey="id" />

      <Modal title="添加学生" open={modalOpen} onOk={handleAdd} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="schoolId" label="所属院校" rules={[{ required: true }]} initialValue={role === 'school' ? schoolId : undefined}>
            <Select options={mockSchools.map(s => ({ value: s.id, label: s.name }))} disabled={role === 'school'} />
          </Form.Item>
          <Form.Item name="major" label="专业"><Input /></Form.Item>
          <Form.Item name="grade" label="年级">
            <Select options={[{ value: '2021级', label: '2021级' }, { value: '2022级', label: '2022级' }, { value: '2023级', label: '2023级' }, { value: '2024级', label: '2024级' }]} />
          </Form.Item>
          <Form.Item name="phone" label="联系电话"><Input /></Form.Item>
          <Form.Item name="email" label="邮箱"><Input /></Form.Item>
        </Form>
      </Modal>

      <Modal title="批量导入学生" open={batchOpen} onOk={handleBatchImport} onCancel={() => setBatchOpen(false)} width={600} okText="导入">
        <p style={{ color: '#666', marginBottom: 12 }}>每行一条记录，格式：<code>姓名,学校ID,专业,年级,电话(可选),邮箱(可选)</code></p>
        <Input.TextArea rows={10} value={batchText} onChange={e => setBatchText(e.target.value)}
          placeholder={'张三,1,计算机科学与技术,2022级,13900139001,zhangsan@szu.edu.cn\n李四,1,软件工程,2022级,13900139002,lisi@szu.edu.cn\n王五,1,人工智能,2023级'}
        />
      </Modal>
    </Card>
  )
}
