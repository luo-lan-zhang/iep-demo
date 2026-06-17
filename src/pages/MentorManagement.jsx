import { useState, useMemo } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, Select, message, Descriptions } from 'antd'
import { PlusOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { mockMentors } from '../mock/mentors'
import { mockEnterprises } from '../mock/enterprises'
import { useAuth } from '../context/AuthContext'

export default function MentorManagement() {
  const { user } = useAuth()
  const [mentors, setMentors] = useState(mockMentors.map(m => ({ ...m, auditStatus: m.auditStatus || 'approved' })))
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [viewOpen, setViewOpen] = useState(false)
  const [viewItem, setViewItem] = useState(null)

  const enterpriseMap = Object.fromEntries(mockEnterprises.map(e => [e.id, e.name]))
  const role = user?.role || 'admin'
  const enterpriseId = user?.enterpriseId

  const filteredMentors = useMemo(() => {
    if (role === 'enterprise') {
      return mentors.filter(m => m.enterpriseId === enterpriseId)
    }
    return mentors
  }, [mentors, role, enterpriseId])

  const auditMap = {
    approved: { text: '已通过', color: 'green' },
    pending: { text: '待审核', color: 'orange' },
    rejected: { text: '已拒绝', color: 'red' },
  }

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '所属企业', dataIndex: 'enterpriseId', key: 'enterpriseId', render: (id) => <Tag color="blue">{enterpriseMap[id] || '未知'}</Tag> },
    { title: '职位', dataIndex: 'position', key: 'position' },
    { title: '擅长领域', dataIndex: 'skill', key: 'skill', ellipsis: true },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '审核', dataIndex: 'auditStatus', key: 'auditStatus', render: (s) => <Tag color={auditMap[s]?.color}>{auditMap[s]?.text}</Tag> },
    { title: '操作', key: 'action', render: (_, r) => {
      const acts = []
      if (role !== 'enterprise') {
        if (r.auditStatus === 'pending') {
          acts.push(<Button key="approve" size="small" type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} icon={<CheckCircleOutlined />}
            onClick={() => {
              setMentors(mentors.map(m => m.id === r.id ? { ...m, auditStatus: 'approved' } : m))
              message.success(`${r.name} 审核已通过`)
            }}>通过</Button>)
          acts.push(<Button key="reject" size="small" danger icon={<CloseCircleOutlined />}
            onClick={() => {
              setMentors(mentors.map(m => m.id === r.id ? { ...m, auditStatus: 'rejected' } : m))
              message.warning(`${r.name} 审核已拒绝`)
            }}>拒绝</Button>)
        }
        if (r.auditStatus === 'rejected') {
          acts.push(<Button key="reapprove" size="small" type="primary"
            onClick={() => {
              setMentors(mentors.map(m => m.id === r.id ? { ...m, auditStatus: 'approved' } : m))
              message.success(`${r.name} 已重新审核通过`)
            }}>重新审核</Button>)
        }
      }
      acts.push(<Button key="view" size="small" icon={<EyeOutlined />} onClick={() => { setViewItem(r); setViewOpen(true) }}>查看</Button>)
      return <span style={{ display: 'flex', gap: 4 }}>{acts}</span>
    }},
  ]

  const handleAdd = () => {
    form.validateFields().then(values => {
      setMentors([...mentors, { id: mentors.length + 1, ...values, auditStatus: 'pending' }])
      message.success('导师已添加，等待审核！')
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

      <Modal title="导师详情" open={viewOpen} onCancel={() => { setViewOpen(false); setViewItem(null) }} footer={null} width={520}>
        {viewItem && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="姓名">{viewItem.name}</Descriptions.Item>
            <Descriptions.Item label="所属企业"><Tag color="blue">{enterpriseMap[viewItem.enterpriseId] || '未知'}</Tag></Descriptions.Item>
            <Descriptions.Item label="职位">{viewItem.position}</Descriptions.Item>
            <Descriptions.Item label="擅长领域">{viewItem.skill}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{viewItem.phone}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{viewItem.email}</Descriptions.Item>
            <Descriptions.Item label="审核状态" span={2}>
              <Tag color={auditMap[viewItem.auditStatus]?.color}>{auditMap[viewItem.auditStatus]?.text}</Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  )
}
