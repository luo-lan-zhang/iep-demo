import { useState, useMemo } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, InputNumber, Select, Tabs, message, Descriptions, Steps, Empty } from 'antd'
import { PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons'
import { mockResources, mockApplications } from '../mock/resources'
import { mockSchools } from '../mock/schools'
import { mockEnterprises } from '../mock/enterprises'
import { useAuth } from '../context/AuthContext'

export default function SharedResources() {
  const { user, hasPermission } = useAuth()
  const [resources, setResources] = useState(mockResources)
  const [applications, setApplications] = useState(mockApplications)
  const [publishOpen, setPublishOpen] = useState(false)
  const [applyOpen, setApplyOpen] = useState(false)
  const [applyResource, setApplyResource] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailResource, setDetailResource] = useState(null)
  const [auditOpen, setAuditOpen] = useState(false)
  const [auditResource, setAuditResource] = useState(null)
  const [detailApp, setDetailApp] = useState(null)
  const [detailAppOpen, setDetailAppOpen] = useState(false)
  const [publishForm] = Form.useForm()
  const [applyForm] = Form.useForm()

  const schoolMap = Object.fromEntries(mockSchools.map(s => [s.id, s.name]))

  const statusMap = { idle: { text: '空闲', color: 'green' }, rented: { text: '已租借', color: 'blue' }, pending: { text: '审核中', color: 'orange' } }
  const publisherTypeMap = { park: { text: '园区', color: 'purple' }, enterprise: { text: '企业', color: 'blue' }, school: { text: '学校', color: 'cyan' } }

  const role = user?.role || 'admin'
  const enterpriseId = user?.enterpriseId

  // Filter applications for enterprise users to show only theirs
  const filteredApplications = useMemo(() => {
    if (role === 'enterprise') {
      return applications.filter(a => a.enterpriseId === enterpriseId)
    }
    return applications
  }, [role, enterpriseId, applications])

  const resourceColumns = [
    { title: '资源名称', dataIndex: 'name', key: 'name' },
    { title: '发布方', key: 'publisher', render: (_, r) => <span>{r.publisher} <Tag color={publisherTypeMap[r.publisherType]?.color} style={{ marginLeft: 4 }}>{publisherTypeMap[r.publisherType]?.text}</Tag></span> },
    { title: '类别', dataIndex: 'category', key: 'category', render: (t) => <Tag color={t === '设备' ? 'blue' : t === '场地' ? 'green' : t === '专家' ? 'orange' : 'default'}>{t}</Tag> },
    { title: '规格说明', dataIndex: 'specs', key: 'specs', ellipsis: true },
    { title: '每日积分', dataIndex: 'dailyPoints', key: 'dailyPoints', render: (v) => <span style={{ color: '#faad14', fontWeight: 'bold' }}>{v}</span> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag> },
    { title: '操作', key: 'action', render: (_, r) => (
      <span>
        <a onClick={() => { setDetailResource(r); setDetailOpen(true) }}>查看</a>
        {role === 'council'
          ? <span> | <Button type="link" size="small" style={{ color: '#faad14' }} onClick={() => { setAuditResource(r); setAuditOpen(true) }}>审核</Button></span>
          : (r.status === 'idle' && hasPermission('resource.apply')) ? <span> | <Button type="link" size="small" onClick={() => { setApplyResource(r); setApplyOpen(true) }}>申请使用</Button></span>
          : null
        }
      </span>
    )},
  ]

  const appColumns = [
    { title: '资源名称', dataIndex: 'resourceId', key: 'resourceId', render: (id) => resources.find(r => r.id === id)?.name || '-' },
    { title: '申请企业', dataIndex: 'enterpriseName', key: 'enterpriseName' },
    { title: '使用理由', dataIndex: 'reason', key: 'reason', ellipsis: true },
    { title: '使用周期', dataIndex: 'period', key: 'period' },
    { title: '总积分', dataIndex: 'points', key: 'points', render: (v) => <span style={{ color: '#faad14', fontWeight: 'bold' }}>{v}</span> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => {
      const m = { pending: { text: '待审核', color: 'orange' }, approved: { text: '已通过', color: 'green' }, rejected: { text: '已拒绝', color: 'red' } }
      return <Tag color={m[s]?.color}>{m[s]?.text}</Tag>
    }},
    { title: '操作', key: 'action', render: (_, r) => {
      const acts = []
      if (r.status === 'pending' && hasPermission('resource.manageApp')) {
        acts.push(<a key="ap" style={{ color: 'green' }} onClick={() => handleApprove(r.id)}><CheckCircleOutlined /> 通过</a>)
        acts.push(<span key="s1"> | </span>)
        acts.push(<a key="rj" style={{ color: 'red' }} onClick={() => handleReject(r.id)}><CloseCircleOutlined /> 拒绝</a>)
      }
      if (acts.length === 0) acts.push(<a key="vd" style={{ color: '#1677ff', cursor: 'pointer' }} onClick={() => { setDetailApp(r); setDetailAppOpen(true) }}>查看</a>)
      return <span>{acts}</span>
    }},
  ]

  const handlePublish = () => {
    publishForm.validateFields().then(values => {
      const newRes = {
        id: resources.length + 1,
        ...values,
        status: 'idle',
        publishDate: new Date().toISOString().split('T')[0],
      }
      setResources([...resources, newRes])
      message.success('发布资源成功！')
      setPublishOpen(false)
      publishForm.resetFields()
    })
  }

  const handleApply = () => {
    applyForm.validateFields().then(values => {
      const days = Math.ceil((new Date(values.period[1]) - new Date(values.period[0])) / (1000*60*60*24))
      const points = days * applyResource.dailyPoints
      const newApp = {
        id: applications.length + 1,
        resourceId: applyResource.id,
        enterpriseId: 1,
        enterpriseName: '华为技术有限公司',
        reason: values.reason,
        period: `${values.period[0].format('YYYY-MM-DD')} ~ ${values.period[1].format('YYYY-MM-DD')}`,
        status: 'pending',
        points,
        applyDate: new Date().toISOString().split('T')[0],
        approveDate: '',
      }
      setApplications([...applications, newApp])
      // Update resource status
      setResources(resources.map(r => r.id === applyResource.id ? { ...r, status: 'pending' } : r))
      message.success('申请提交成功，等待审核！')
      setApplyOpen(false)
      setApplyResource(null)
      applyForm.resetFields()
    })
  }

  const handleApprove = (id) => {
    setApplications(applications.map(a => a.id === id ? { ...a, status: 'approved', approveDate: new Date().toISOString().split('T')[0] } : a))
    setResources(resources.map(r => r.id === applications.find(a => a.id === id)?.resourceId ? { ...r, status: 'rented' } : r))
    message.success('已通过申请')
  }

  const handleReject = (id) => {
    const app = applications.find(a => a.id === id)
    setApplications(applications.map(a => a.id === id ? { ...a, status: 'rejected' } : a))
    const hasOtherPending = applications.filter(a => a.resourceId === app?.resourceId && a.id !== id && a.status === 'pending').length > 0
    if (!hasOtherPending) {
      setResources(resources.map(r => r.id === app?.resourceId ? { ...r, status: 'idle' } : r))
    }
    message.success('已拒绝申请')
    setAuditResource(resources.find(r => r.id === app?.resourceId))
  }

  // Role-based tabs
  const tabItems = useMemo(() => {
    const items = []

    // 资源列表 - all roles can see this
    items.push({ key: 'list', label: '资源列表', children: (
      <Table dataSource={resources} columns={resourceColumns} rowKey="id" />
    )})

    // 发布资源 - school only (not council)
    if ((hasPermission('resource.publish') || role === 'admin') && role !== 'council') {
      items.push({ key: 'publish', label: '发布资源', children: (
        <div style={{ maxWidth: 500 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setPublishOpen(true)}>发布新资源</Button>
          <div style={{ marginTop: 16, color: '#666' }}>点击按钮发布学校的闲置硬件设备资源。</div>
        </div>
      )})
    }

    // 申请管理 / 我的申请
    if (role === 'enterprise') {
      items.push({ key: 'myApplications', label: '我的申请', children: (
        <Table dataSource={filteredApplications} columns={appColumns} rowKey="id" />
      )})
    } else if (hasPermission('resource.manageApp') || role === 'admin') {
      items.push({ key: 'applications', label: '申请管理', children: (
        <Table dataSource={filteredApplications} columns={appColumns} rowKey="id" />
      )})
    }

    return items
  }, [resources, filteredApplications, resourceColumns, appColumns, role, hasPermission])

  return (
    <Card title="共享资源管理">
      <Tabs items={tabItems} />

      {/* Publish Modal */}
      <Modal title="发布共享资源" open={publishOpen} onOk={handlePublish} onCancel={() => { setPublishOpen(false); publishForm.resetFields() }} width={600}>
        <Form form={publishForm} layout="vertical">
          <Form.Item name="publisherType" label="发布方类型" rules={[{ required: true }]}>
            <Select options={[{ value: 'park', label: '园区' }, { value: 'enterprise', label: '企业' }, { value: 'school', label: '学校' }]} />
          </Form.Item>
          <Form.Item name="publisher" label="发布方名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name" label="资源名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="category" label="类别" rules={[{ required: true }]}>
            <Select options={[{ value: '设备', label: '设备' }, { value: '场地', label: '场地' }, { value: '专家', label: '专家' }, { value: '其他', label: '其他' }]} />
          </Form.Item>
          <Form.Item name="description" label="资源描述"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="specs" label="规格说明"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="dailyPoints" label="每日积分（学校获得）" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Apply Modal */}
      <Modal title={`申请使用: ${applyResource?.name}`} open={applyOpen} onOk={handleApply} onCancel={() => { setApplyOpen(false); setApplyResource(null); applyForm.resetFields() }}>
        <p style={{ color: '#666', marginBottom: 16 }}>每日积分：<strong style={{ color: '#faad14' }}>{applyResource?.dailyPoints}</strong></p>
        <Form form={applyForm} layout="vertical">
          <Form.Item name="reason" label="使用理由" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="period" label="使用周期" rules={[{ required: true }]}>
            <Input placeholder="格式: 2024-07-01 ~ 2024-07-30" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Audit Modal - for council */}
      <Modal title={<span>审核申请 — {auditResource?.name}</span>}
        open={auditOpen} onCancel={() => { setAuditOpen(false); setAuditResource(null) }}
        width={700} footer={null}>
        {auditResource && (
          <div>
            <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
              <Tag>{auditResource.category}</Tag>
              <Tag color={statusMap[auditResource.status]?.color}>{statusMap[auditResource.status]?.text}</Tag>
              <span style={{ color: '#999', fontSize: 13 }}>每日积分：{auditResource.dailyPoints}</span>
            </div>
            {applications.filter(a => a.resourceId === auditResource.id).length === 0 ? (
              <Empty description="该资源暂无企业提交使用申请" />
            ) : (
              <div>
                {applications.filter(a => a.resourceId === auditResource.id && a.status === 'pending').length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ marginBottom: 8, color: '#faad14' }}>待审核申请</h4>
                    <Table
                      dataSource={applications.filter(a => a.resourceId === auditResource.id && a.status === 'pending')}
                      columns={[
                        { title: '申请企业', dataIndex: 'enterpriseName', key: 'enterpriseName', render: (t) => <Tag color="blue">{t}</Tag> },
                        { title: '使用理由', dataIndex: 'reason', key: 'reason' },
                        { title: '使用周期', dataIndex: 'period', key: 'period' },
                        { title: '总积分', dataIndex: 'points', key: 'points', render: (v) => <span style={{ color: '#faad14', fontWeight: 'bold' }}>{v}</span> },
                        { title: '操作', key: 'action', render: (_, app) => (
                          <span style={{ display: 'flex', gap: 8 }}>
                            <Button size="small" type="primary" icon={<CheckCircleOutlined />}
                              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                              onClick={() => { handleApprove(app.id); setAuditResource(null); setAuditOpen(false) }}>通过</Button>
                            <Button size="small" danger icon={<CloseCircleOutlined />}
                              onClick={() => { handleReject(app.id); }}>拒绝</Button>
                          </span>
                        )},
                      ]} rowKey="id" pagination={false} size="small" />
                  </div>
                )}
                {applications.filter(a => a.resourceId === auditResource.id && a.status !== 'pending').length > 0 && (
                  <div>
                    <h4 style={{ marginBottom: 8, color: '#666' }}>历史记录</h4>
                    <Table
                      dataSource={applications.filter(a => a.resourceId === auditResource.id && a.status !== 'pending')}
                      columns={[
                        { title: '企业', dataIndex: 'enterpriseName', key: 'enterpriseName', render: (t) => <Tag color="blue">{t}</Tag> },
                        { title: '周期', dataIndex: 'period', key: 'period' },
                        { title: '积分', dataIndex: 'points', key: 'points' },
                        { title: '状态', dataIndex: 'status', key: 'status', render: (s) => {
                          const m = { approved: { text: '已通过', color: 'green' }, rejected: { text: '已拒绝', color: 'red' } }
                          return <Tag color={m[s]?.color}>{m[s]?.text}</Tag>
                        }},
                      ]} rowKey="id" pagination={false} size="small" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal title="资源详情" open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null}>
        {detailResource && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="资源名称">{detailResource.name}</Descriptions.Item>
            <Descriptions.Item label="发布方">{detailResource.publisher} <Tag color={publisherTypeMap[detailResource.publisherType]?.color}>{publisherTypeMap[detailResource.publisherType]?.text}</Tag></Descriptions.Item>
            <Descriptions.Item label="类别">{detailResource.category}</Descriptions.Item>
            <Descriptions.Item label="规格说明">{detailResource.specs}</Descriptions.Item>
            <Descriptions.Item label="资源描述">{detailResource.description}</Descriptions.Item>
            <Descriptions.Item label="每日积分">{detailResource.dailyPoints}</Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={statusMap[detailResource.status]?.color}>{statusMap[detailResource.status]?.text}</Tag></Descriptions.Item>
            <Descriptions.Item label="发布时间">{detailResource.publishDate}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal title="申请详情" open={detailAppOpen} onCancel={() => { setDetailAppOpen(false); setDetailApp(null) }} footer={null} width={500}>
        {detailApp && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="资源名称">{resources.find(r => r.id === detailApp.resourceId)?.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="申请企业">{detailApp.enterpriseName}</Descriptions.Item>
            <Descriptions.Item label="使用理由">{detailApp.reason}</Descriptions.Item>
            <Descriptions.Item label="使用周期">{detailApp.period}</Descriptions.Item>
            <Descriptions.Item label="总积分">{detailApp.points}</Descriptions.Item>
            <Descriptions.Item label="申请日期">{detailApp.applyDate}</Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={detailApp.status === 'approved' ? 'green' : detailApp.status === 'rejected' ? 'red' : 'orange'}>{detailApp.status === 'approved' ? '已通过' : detailApp.status === 'rejected' ? '已拒绝' : '待审核'}</Tag></Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  )
}
