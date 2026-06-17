import { useState, useMemo } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, Select, message, Descriptions } from 'antd'
import { PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons'
import { mockEnterprises } from '../mock/enterprises'
import { mockParks } from '../mock/parks'
import { useAuth } from '../context/AuthContext'

const statusMap = {
  active: { text: '启用', color: 'green' },
  inactive: { text: '停用', color: 'red' },
  pending: { text: '待审核', color: 'orange' },
}

export default function EnterpriseManagement() {
  const { user } = useAuth()
  const [enterprises, setEnterprises] = useState(mockEnterprises)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [auditOpen, setAuditOpen] = useState(false)
  const [auditItem, setAuditItem] = useState(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewItem, setViewItem] = useState(null)

  const parkMap = Object.fromEntries(mockParks.map(p => [p.id, p.name]))
  const role = user?.role || 'admin'
  const parkId = user?.parkId

  const filteredEnterprises = useMemo(() => {
    if (role === 'park') {
      return enterprises.filter(e => e.parkId === parkId)
    }
    return enterprises
  }, [enterprises, role, parkId])

  const handleAudit = (action) => {
    setEnterprises(enterprises.map(e =>
      e.id === auditItem.id ? { ...e, status: action === 'approve' ? 'active' : 'inactive' } : e
    ))
    message.success(action === 'approve' ? '企业审核通过！' : '企业审核未通过')
    setAuditOpen(false)
    setAuditItem(null)
  }

  const handleAdd = () => {
    form.validateFields().then(values => {
      setEnterprises([...enterprises, { id: enterprises.length + 1, ...values }])
      message.success('添加企业成功！')
      setModalOpen(false)
      form.resetFields()
    })
  }

  const columns = [
    { title: '企业名称', dataIndex: 'name', key: 'name' },
    { title: '行业', dataIndex: 'industry', key: 'industry', render: (t) => <Tag color="blue">{t}</Tag> },
    { title: '规模', dataIndex: 'scale', key: 'scale', render: (s) => <Tag color={s === '大型' ? 'red' : s === '中型' ? 'orange' : 'green'}>{s}</Tag> },
    { title: '所属园区', dataIndex: 'parkId', key: 'parkId', render: (id) => parkMap[id] || '-' },
    { title: '联系人', dataIndex: 'contact', key: 'contact' },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => (
      <Tag color={statusMap[s]?.color}>{statusMap[s]?.text || s}</Tag>
    )},
    { title: '操作', key: 'action', render: (_, r) => {
      const acts = []
      if (role === 'park' && r.status === 'pending') {
        acts.push(<Button key="audit" size="small" type="primary" onClick={() => { setAuditItem(r); setAuditOpen(true) }}>审核</Button>)
      }
      acts.push(<Button key="view" size="small" icon={<EyeOutlined />} onClick={() => { setViewItem(r); setViewOpen(true) }}>查看</Button>)
      return <span style={{ display: 'flex', gap: 4 }}>{acts}</span>
    }},
  ]

  return (
    <Card title={role === 'park' ? '园区企业管理' : '企业端管理'} extra={
      role !== 'park' ? <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>添加企业</Button> : null
    }>
      <Table dataSource={filteredEnterprises} columns={columns} rowKey="id" />

      {/* Audit Modal */}
      <Modal title="企业审核" open={auditOpen} onCancel={() => { setAuditOpen(false); setAuditItem(null) }} width={550} footer={null}>
        {auditItem && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Tag color="blue">{auditItem.industry}</Tag>
              <Tag color={auditItem.scale === '大型' ? 'red' : auditItem.scale === '中型' ? 'orange' : 'green'}>{auditItem.scale}</Tag>
              <Tag color={statusMap[auditItem.status]?.color}>{statusMap[auditItem.status]?.text}</Tag>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{auditItem.name}</h3>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="企业名称">{auditItem.name}</Descriptions.Item>
              <Descriptions.Item label="所属行业">{auditItem.industry}</Descriptions.Item>
              <Descriptions.Item label="企业规模">{auditItem.scale}</Descriptions.Item>
              <Descriptions.Item label="所属园区">{parkMap[auditItem.parkId] || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系人">{auditItem.contact}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{auditItem.phone}</Descriptions.Item>
            </Descriptions>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24 }}>
              <Button type="primary" size="large" icon={<CheckCircleOutlined />}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                onClick={() => handleAudit('approve')}>审核通过</Button>
              <Button danger size="large" icon={<CloseCircleOutlined />}
                onClick={() => handleAudit('reject')}>拒绝</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Modal */}
      <Modal title="企业详情" open={viewOpen} onCancel={() => { setViewOpen(false); setViewItem(null) }} footer={null} width={520}>
        {viewItem && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="企业名称">{viewItem.name}</Descriptions.Item>
            <Descriptions.Item label="行业"><Tag color="blue">{viewItem.industry}</Tag></Descriptions.Item>
            <Descriptions.Item label="规模"><Tag color={viewItem.scale === '大型' ? 'red' : viewItem.scale === '中型' ? 'orange' : 'green'}>{viewItem.scale}</Tag></Descriptions.Item>
            <Descriptions.Item label="所属园区">{parkMap[viewItem.parkId] || '-'}</Descriptions.Item>
            <Descriptions.Item label="联系人">{viewItem.contact}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{viewItem.phone}</Descriptions.Item>
            <Descriptions.Item label="状态" span={2}>
              <Tag color={statusMap[viewItem.status]?.color}>{statusMap[viewItem.status]?.text || viewItem.status}</Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Add Enterprise Modal */}
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
