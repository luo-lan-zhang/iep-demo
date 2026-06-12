import { useState, useMemo } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, InputNumber, Select, Tabs, message, Progress, DatePicker } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { mockTrainingQuotas, mockTrainingAcceptances } from '../mock/training'
import { mockEnterprises } from '../mock/enterprises'
import { mockSchools } from '../mock/schools'
import { useAuth } from '../context/AuthContext'

export default function TrainingQuota() {
  const { user, hasPermission } = useAuth()
  const [quotas, setQuotas] = useState(mockTrainingQuotas)
  const [acceptances, setAcceptances] = useState(mockTrainingAcceptances)
  const [publishOpen, setPublishOpen] = useState(false)
  const [acceptOpen, setAcceptOpen] = useState(false)
  const [acceptQuota, setAcceptQuota] = useState(null)
  const [publishForm] = Form.useForm()
  const [acceptForm] = Form.useForm()

  const role = user?.role || 'admin'
  const schoolId = user?.schoolId
  const enterpriseId = user?.enterpriseId

  const statusMap = {
    pending: { text: '待承接', color: 'orange' },
    in_progress: { text: '进行中', color: 'blue' },
    completed: { text: '已完成', color: 'green' },
  }

  // Filter acceptances for school users to show only theirs
  const filteredAcceptances = useMemo(() => {
    if (role === 'school') {
      return acceptances.filter(a => a.schoolId === schoolId)
    }
    return acceptances
  }, [role, schoolId, acceptances])

  const quotaColumns = [
    { title: '指标名称', dataIndex: 'title', key: 'title' },
    { title: '企业', dataIndex: 'enterpriseName', key: 'enterpriseName', render: (t) => <Tag color="blue">{t}</Tag> },
    { title: '目标人数', dataIndex: 'targetCount', key: 'targetCount' },
    { title: '已完成', dataIndex: 'completedCount', key: 'completedCount' },
    { title: '进度', key: 'progress', render: (_, r) => (
      <Progress percent={Math.round((r.completedCount / r.targetCount) * 100)} size="small" format={() => `${r.completedCount}/${r.targetCount}`} />
    )},
    { title: '截止日期', dataIndex: 'deadline', key: 'deadline' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag> },
    { title: '总积分', dataIndex: 'points', key: 'points', render: (v) => <span style={{ color: '#faad14', fontWeight: 'bold' }}>{v}</span> },
    { title: '操作', key: 'action', render: (_, r) => {
      if (hasPermission('quota.accept') && r.status === 'pending') {
        return <Button size="small" type="primary" onClick={() => { setAcceptQuota(r); setAcceptOpen(true) }}>承接培训</Button>
      }
      return '-'
    }},
  ]

  const acceptColumns = [
    { title: '培训指标', dataIndex: 'quotaTitle', key: 'quotaTitle' },
    { title: '承接院校', dataIndex: 'schoolName', key: 'schoolName', render: (t) => <Tag color="green">{t}</Tag> },
    { title: '承接人数', dataIndex: 'assignedCount', key: 'assignedCount' },
    { title: '承接日期', dataIndex: 'acceptDate', key: 'acceptDate' },
    { title: '完成日期', dataIndex: 'completeDate', key: 'completeDate', render: (d) => d || '-' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag> },
    { title: '操作', key: 'action', render: (_, r) => (
      r.status === 'in_progress' && hasPermission('quota.complete') ? <Button size="small" type="primary" onClick={() => handleComplete(r.id)}>标记完成</Button> : '-'
    )},
  ]

  const handlePublish = () => {
    publishForm.validateFields().then(values => {
      const ent = mockEnterprises.find(e => e.id === values.enterpriseId)
      const newQuota = {
        id: quotas.length + 1,
        ...values,
        enterpriseName: ent?.name || '未知',
        completedCount: 0,
        status: 'pending',
      }
      delete newQuota.enterpriseId
      setQuotas([...quotas, newQuota])
      message.success('发布培训指标成功！')
      setPublishOpen(false)
      publishForm.resetFields()
    })
  }

  const handleAccept = () => {
    acceptForm.validateFields().then(values => {
      const school = mockSchools.find(s => s.id === values.schoolId)
      const newAccept = {
        id: acceptances.length + 1,
        quotaId: acceptQuota.id,
        quotaTitle: acceptQuota.title,
        schoolId: values.schoolId,
        schoolName: school?.name || '未知',
        assignedCount: values.count,
        status: 'in_progress',
        acceptDate: new Date().toISOString().split('T')[0],
        completeDate: '',
      }
      setAcceptances([...acceptances, newAccept])
      setQuotas(quotas.map(q => q.id === acceptQuota.id ? { ...q, completedCount: q.completedCount + values.count, status: 'in_progress' } : q))
      message.success('承接培训成功！')
      setAcceptOpen(false)
      setAcceptQuota(null)
      acceptForm.resetFields()
    })
  }

  const handleComplete = (id) => {
    setAcceptances(acceptances.map(a => a.id === id ? { ...a, status: 'completed', completeDate: new Date().toISOString().split('T')[0] } : a))
    const acc = acceptances.find(a => a.id === id)
    if (acc) {
      const q = quotas.find(q => q.id === acc.quotaId)
      if (q) {
        const newCompleted = q.completedCount
        const allCompleted = acceptances.filter(a => a.quotaId === q.id && a.status === 'completed').length + 1
        const totalAssigned = acceptances.filter(a => a.quotaId === q.id).reduce((s, a) => s + a.assignedCount, 0)
        setQuotas(quotas.map(qq => qq.id === q.id ? {
          ...qq,
          completedCount: qq.completedCount + acc.assignedCount,
          status: (qq.completedCount + acc.assignedCount) >= qq.targetCount ? 'completed' : 'in_progress'
        } : qq))
      }
    }
    message.success('已完成该批次培训')
  }

  // Role-based tabs
  const tabItems = useMemo(() => {
    const items = []

    // 培训指标列表 - all roles
    items.push({ key: 'list', label: '培训指标列表', children: (
      <Table dataSource={quotas} columns={quotaColumns} rowKey="id" />
    )})

    // 发布指标 - enterprise & admin
    if (hasPermission('quota.publish')) {
      items.push({ key: 'publish', label: '发布指标', children: (
        <div style={{ maxWidth: 500 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setPublishOpen(true)}>发布新培训指标</Button>
          <div style={{ marginTop: 16, color: '#666' }}>企业发布培训需求，院校可承接并完成培训任务。</div>
        </div>
      )})
    }

    // 承接列表 - admin, enterprise, school
    if (role === 'admin' || role === 'enterprise' || role === 'school') {
      items.push({ key: 'acceptances', label: '承接列表', children: (
        <Table dataSource={filteredAcceptances} columns={acceptColumns} rowKey="id" />
      )})
    }

    return items
  }, [quotas, filteredAcceptances, quotaColumns, acceptColumns, role, hasPermission])

  return (
    <Card title="培训指标管理">
      <Tabs items={tabItems} />

      <Modal title="发布培训指标" open={publishOpen} onOk={handlePublish} onCancel={() => { setPublishOpen(false); publishForm.resetFields() }} width={600}>
        <Form form={publishForm} layout="vertical">
          <Form.Item name="enterpriseId" label="所属企业" rules={[{ required: true }]}>
            <Select options={mockEnterprises.map(e => ({ value: e.id, label: e.name }))} />
          </Form.Item>
          <Form.Item name="title" label="指标名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="targetCount" label="目标培训人数" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="deadline" label="截止日期" rules={[{ required: true }]}>
            <Input placeholder="例如: 2024-12-31" />
          </Form.Item>
          <Form.Item name="points" label="总积分（完成可获得）" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={`承接培训: ${acceptQuota?.title}`} open={acceptOpen} onOk={handleAccept} onCancel={() => { setAcceptOpen(false); setAcceptQuota(null); acceptForm.resetFields() }}>
        <p style={{ color: '#666', marginBottom: 16 }}>
          目标人数：{acceptQuota?.targetCount} 人 | 已完成：{acceptQuota?.completedCount} 人 | 剩余：{(acceptQuota?.targetCount || 0) - (acceptQuota?.completedCount || 0)} 人
        </p>
        <Form form={acceptForm} layout="vertical">
          <Form.Item name="schoolId" label="承接院校" rules={[{ required: true }]}>
            <Select options={mockSchools.map(s => ({ value: s.id, label: s.name }))} />
          </Form.Item>
          <Form.Item name="count" label="承接人数" rules={[{ required: true }]}>
            <InputNumber min={1} max={(acceptQuota?.targetCount || 0) - (acceptQuota?.completedCount || 0)} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
