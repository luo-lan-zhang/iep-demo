import { useState, useMemo } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, InputNumber, Select, Tabs, message, Row, Col, Statistic, Descriptions, Popconfirm, Timeline, Upload } from 'antd'
import { PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, UploadOutlined, HistoryOutlined, FundOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'

// ==================== Mock Data ====================

const mockPointsBalance = [
  { id: 1, name: '深圳大学', role: 'school', currentPoints: 15800, totalEarned: 25000 },
  { id: 2, name: '深圳职业技术学院', role: 'school', currentPoints: 12200, totalEarned: 20000 },
  { id: 3, name: '华南理工大学', role: 'school', currentPoints: 9800, totalEarned: 15000 },
  { id: 4, name: '华为技术有限公司', role: 'enterprise', currentPoints: 25000, totalEarned: 40000 },
  { id: 5, name: '腾讯科技（深圳）有限公司', role: 'enterprise', currentPoints: 18000, totalEarned: 30000 },
  { id: 6, name: '张教授', role: 'teacher', currentPoints: 5600, totalEarned: 8000 },
  { id: 7, name: '李教授', role: 'teacher', currentPoints: 4200, totalEarned: 6500 },
  { id: 8, name: '张三', role: 'student', currentPoints: 1200, totalEarned: 1800 },
]

const mockAdjustments = [
  { id: 1, applicantName: '深圳大学', applicantRole: 'school', targetName: '张教授', type: 'increase', amount: 500, reason: '教学文件评审通过奖励', attachments: '', status: 'approved', applyDate: '2024-06-01', auditDate: '2024-06-02', auditor: '理事会管理员', auditComment: '同意发放' },
  { id: 2, applicantName: '王老师', applicantRole: 'teacher', targetName: '张三', type: 'increase', amount: 200, reason: '竞赛获奖学生奖励', attachments: '', status: 'approved', applyDate: '2024-05-28', auditDate: '2024-05-29', auditor: '理事会管理员', auditComment: '审核通过' },
  { id: 3, applicantName: '华为技术有限公司', applicantRole: 'enterprise', targetName: '深圳大学', type: 'increase', amount: 3000, reason: '完成培训指标奖励', attachments: '', status: 'pending', applyDate: '2024-06-05', auditDate: '', auditor: '', auditComment: '' },
  { id: 4, applicantName: '腾讯科技（深圳）有限公司', applicantRole: 'enterprise', targetName: '深圳大学', type: 'increase', amount: 2000, reason: '技术服务项目结算', attachments: '', status: 'pending', applyDate: '2024-06-08', auditDate: '', auditor: '', auditComment: '' },
  { id: 5, applicantName: '深圳职业技术学院', applicantRole: 'school', targetName: '王老师', type: 'increase', amount: 800, reason: '优秀教学成果奖励', attachments: '', status: 'rejected', applyDate: '2024-05-20', auditDate: '2024-05-22', auditor: '理事会管理员', auditComment: '证明材料不充分，请补充后重新提交' },
  { id: 6, applicantName: '李教授', applicantRole: 'teacher', targetName: '李教授', type: 'decrease', amount: 300, reason: '兑换教学资源-3D打印服务', attachments: '', status: 'pending', applyDate: '2024-06-10', auditDate: '', auditor: '', auditComment: '' },
]

const mockAuditLog = [
  { id: 1, operator: '理事会管理员', action: '审核通过', target: '深圳大学 -> 张教授 +500', time: '2024-06-02 10:30:00' },
  { id: 2, operator: '理事会管理员', action: '审核通过', target: '王老师 -> 张三 +200', time: '2024-05-29 14:20:00' },
  { id: 3, operator: '理事会管理员', action: '审核拒绝', target: '深圳职业技术学院 -> 王老师 +800', time: '2024-05-22 09:15:00', comment: '证明材料不充分' },
  { id: 4, operator: '理事会管理员', action: '积分调整', target: '深圳大学 调整余额', time: '2024-05-15 11:00:00' },
]

export default function PointsManagement() {
  const { user, hasPermission } = useAuth()
  const [balance, setBalance] = useState(mockPointsBalance)
  const [adjustments, setAdjustments] = useState(mockAdjustments)
  const [auditLog] = useState(mockAuditLog)

  const [applyOpen, setApplyOpen] = useState(false)
  const [applyForm] = Form.useForm()

  const role = user?.role || 'admin'

  const userEntity = useMemo(() => {
    if (!user) return null
    return {
      name: user.name,
      role: user.role,
      label: role === 'enterprise' ? '企业' :
             role === 'school' ? '院校' :
             role === 'teacher' ? '教师' :
             role === 'student' ? '学生' :
             role === 'mentor' ? '企业导师' : '理事会',
    }
  }, [user])

  // Filter adjustments based on role
  const filteredAdjustments = useMemo(() => {
    return adjustments
  }, [adjustments])

  const pendingAdjustments = useMemo(() => {
    return adjustments.filter(a => a.status === 'pending')
  }, [adjustments])

  const totalPoints = useMemo(() => {
    return balance.reduce((sum, b) => sum + b.currentPoints, 0)
  }, [balance])

  const handleApply = () => {
    applyForm.validateFields().then(values => {
      const target = balance.find(b => b.id === values.targetId)
      const newAdj = {
        id: adjustments.length + 1,
        applicantName: userEntity?.name || '未知',
        applicantRole: user?.role || 'unknown',
        targetName: target?.name || '未知',
        type: values.type,
        amount: values.amount,
        reason: values.reason,
        attachments: '',
        status: 'pending',
        applyDate: new Date().toISOString().split('T')[0],
        auditDate: '',
        auditor: '',
        auditComment: '',
      }
      setAdjustments([newAdj, ...adjustments])
      message.success('积分调整申请已提交，等待理事会审核！')
      setApplyOpen(false)
      applyForm.resetFields()
    })
  }

  const handleApprove = (id) => {
    setAdjustments(adjustments.map(a => a.id === id ? {
      ...a,
      status: 'approved',
      auditDate: new Date().toISOString().split('T')[0],
      auditor: user?.name || '理事会',
      auditComment: '审核通过',
    } : a))

    // Update balance
    const adj = adjustments.find(a => a.id === id)
    if (adj) {
      setBalance(balance.map(b => {
        if (b.name === adj.targetName) {
          const delta = adj.type === 'increase' ? adj.amount : -adj.amount
          return { ...b, currentPoints: b.currentPoints + delta, totalEarned: adj.type === 'increase' ? b.totalEarned + adj.amount : b.totalEarned }
        }
        return b
      }))
    }
    message.success('已通过该申请')
  }

  const handleReject = (id) => {
    setAdjustments(adjustments.map(a => a.id === id ? {
      ...a,
      status: 'rejected',
      auditDate: new Date().toISOString().split('T')[0],
      auditor: user?.name || '理事会',
      auditComment: '审核不通过',
    } : a))
    message.success('已拒绝该申请')
  }

  // ======== Column Definitions ========

  const balanceColumns = [
    { title: '用户/单位', dataIndex: 'name', key: 'name' },
    { title: '角色', dataIndex: 'role', key: 'role', render: (r) => {
      const labelMap = { school: '院校', enterprise: '企业', teacher: '教师', student: '学生', mentor: '企业导师', council: '理事会' }
      const colorMap = { school: 'green', enterprise: 'blue', teacher: 'purple', student: 'orange', mentor: 'cyan', council: 'red' }
      return <Tag color={colorMap[r] || 'default'}>{labelMap[r] || r}</Tag>
    }},
    { title: '当前积分', dataIndex: 'currentPoints', key: 'currentPoints', render: (v) => <span style={{ color: '#faad14', fontWeight: 'bold', fontSize: 16 }}>{v.toLocaleString()}</span> },
    { title: '累计获得', dataIndex: 'totalEarned', key: 'totalEarned', render: (v) => <span style={{ color: '#666' }}>{v.toLocaleString()}</span> },
  ]

  const adjustmentColumns = [
    { title: '申请单位/个人', dataIndex: 'applicantName', key: 'applicantName' },
    { title: '调整对象', dataIndex: 'targetName', key: 'targetName' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (t) => (
      t === 'increase'
        ? <Tag color="green" icon={<ArrowUpOutlined />}>增加</Tag>
        : <Tag color="red" icon={<ArrowDownOutlined />}>减少</Tag>
    )},
    { title: '数量', dataIndex: 'amount', key: 'amount', render: (v) => <span style={{ color: '#faad14', fontWeight: 'bold' }}>{v}</span> },
    { title: '理由', dataIndex: 'reason', key: 'reason', ellipsis: true },
    { title: '申请日期', dataIndex: 'applyDate', key: 'applyDate' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => {
      const m = { pending: { text: '待审核', color: 'orange' }, approved: { text: '已通过', color: 'green' }, rejected: { text: '已拒绝', color: 'red' } }
      return <Tag color={m[s]?.color}>{m[s]?.text}</Tag>
    }},
    { title: '审核人', dataIndex: 'auditor', key: 'auditor', render: (v) => v || '-' },
    { title: '审核日期', dataIndex: 'auditDate', key: 'auditDate', render: (v) => v || '-' },
  ]

  const pendingColumns = [
    { title: '申请单位', dataIndex: 'applicantName', key: 'applicantName' },
    { title: '调整对象', dataIndex: 'targetName', key: 'targetName' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (t) => (
      t === 'increase'
        ? <Tag color="green" icon={<ArrowUpOutlined />}>增加</Tag>
        : <Tag color="red" icon={<ArrowDownOutlined />}>减少</Tag>
    )},
    { title: '数量', dataIndex: 'amount', key: 'amount', render: (v) => <span style={{ color: '#faad14', fontWeight: 'bold' }}>{v}</span> },
    { title: '理由', dataIndex: 'reason', key: 'reason', ellipsis: true },
    { title: '申请日期', dataIndex: 'applyDate', key: 'applyDate' },
    { title: '操作', key: 'action', render: (_, r) => (
      <span>
        <Button type="link" style={{ color: 'green' }} icon={<CheckCircleOutlined />} onClick={() => handleApprove(r.id)}>通过</Button>
        <Popconfirm title="确定拒绝此申请？" onConfirm={() => handleReject(r.id)} okText="确定" cancelText="取消">
          <Button type="link" danger icon={<CloseCircleOutlined />}>拒绝</Button>
        </Popconfirm>
      </span>
    )},
  ]

  const logColumns = [
    { title: '操作人', dataIndex: 'operator', key: 'operator' },
    { title: '操作', dataIndex: 'action', key: 'action', render: (a) => <Tag color={a.includes('通过') ? 'green' : a.includes('拒绝') ? 'red' : 'blue'}>{a}</Tag> },
    { title: '操作对象', dataIndex: 'target', key: 'target' },
    { title: '操作时间', dataIndex: 'time', key: 'time' },
    { title: '备注', dataIndex: 'comment', key: 'comment', render: (v) => v || '-' },
  ]

  // ======== Tabs ========

  const tabItems = useMemo(() => {
    const items = []

    // Tab 1: Overview
    items.push({
      key: 'overview',
      label: <span><FundOutlined /> 积分总览</span>,
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic title="系统总积分" value={totalPoints.toLocaleString()} prefix={<FundOutlined />} valueStyle={{ color: '#1677ff' }} />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic title="待审核申请" value={pendingAdjustments.length} prefix={<HistoryOutlined />} valueStyle={{ color: '#faad14' }} />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic title="已完成申请" value={adjustments.filter(a => a.status !== 'pending').length} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
              </Card>
            </Col>
          </Row>
          <Table dataSource={balance} columns={balanceColumns} rowKey="id" pagination={false} />
        </div>
      ),
    })

    // Tab 2: Apply for adjustment
    if (hasPermission('points.apply')) {
      items.push({
        key: 'apply',
        label: '积分调整申请',
        children: (
          <div style={{ maxWidth: 500 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { applyForm.resetFields(); setApplyOpen(true) }}>提交调整申请</Button>
            <div style={{ marginTop: 24 }}>
              <h4 style={{ marginBottom: 12 }}>我的历史申请</h4>
              <Table dataSource={filteredAdjustments} columns={adjustmentColumns} rowKey="id" pagination={false} size="small" />
            </div>
          </div>
        ),
      })
    }

    // Tab 3: Audit management
    if (hasPermission('points.audit')) {
      items.push({
        key: 'audit',
        label: <span><HistoryOutlined /> 审核管理</span>,
        children: (
          <div>
            <Card title="待审核申请" size="small" style={{ marginBottom: 24 }}>
              {pendingAdjustments.length === 0 ? (
                <div style={{ color: '#999', textAlign: 'center', padding: 24 }}>暂无待审核的申请</div>
              ) : (
                <Table dataSource={pendingAdjustments} columns={pendingColumns} rowKey="id" pagination={false} />
              )}
            </Card>
            <Card title="操作留痕" size="small">
              <Table dataSource={auditLog} columns={logColumns} rowKey="id" pagination={false} />
            </Card>
          </div>
        ),
      })
    }

    return items
  }, [balance, adjustments, pendingAdjustments, auditLog, totalPoints, role, hasPermission])

  return (
    <Card title="积分管理">
      <Tabs items={tabItems} />

      {/* Apply Adjustment Modal */}
      <Modal title="积分调整申请" open={applyOpen} onOk={handleApply} onCancel={() => { setApplyOpen(false); applyForm.resetFields() }} width={560}>
        <Form form={applyForm} layout="vertical">
          <Form.Item name="targetId" label="调整对象" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="搜索选择用户/单位"
              optionFilterProp="label"
              options={balance.map(b => ({ value: b.id, label: `${b.name}（当前积分：${b.currentPoints}）` }))}
            />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select options={[
              { value: 'increase', label: '增加' },
              { value: 'decrease', label: '减少' },
            ]} />
          </Form.Item>
          <Form.Item name="amount" label="数量" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="理由" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="请说明申请调整积分的具体理由..." />
          </Form.Item>
          <Form.Item label="上传证明材料">
            <Upload.Dragger beforeUpload={() => false} showUploadList={false}>
              <p className="ant-upload-drag-icon"><UploadOutlined /></p>
              <p>点击或拖拽证明材料</p>
              <p style={{ color: '#999', fontSize: 12 }}>支持PDF、图片、Word等格式</p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
