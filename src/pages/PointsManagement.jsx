import { useState, useMemo } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, InputNumber, Select, Tabs, message, Row, Col, Statistic, Descriptions, Popconfirm, Timeline, Upload } from 'antd'
import { PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, UploadOutlined, HistoryOutlined, FundOutlined, ArrowUpOutlined, ArrowDownOutlined, EyeOutlined } from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'

// ==================== Mock Data ====================

const mockPointsBalance = [
  { id: 1, name: '石家庄信息工程职业学院', role: 'school', currentPoints: 15800, totalEarned: 25000 },
  { id: 2, name: '深圳职业技术学院', role: 'school', currentPoints: 12200, totalEarned: 20000 },
  { id: 3, name: '石家庄信息工程职业学院', role: 'school', currentPoints: 9800, totalEarned: 15000 },
  { id: 4, name: '华为技术有限公司', role: 'enterprise', currentPoints: 25000, totalEarned: 40000 },
  { id: 5, name: '腾讯科技（深圳）有限公司', role: 'enterprise', currentPoints: 18000, totalEarned: 30000 },
  { id: 6, name: '张晓蕾', role: 'teacher', currentPoints: 5600, totalEarned: 8000 },
  { id: 7, name: '李教授', role: 'teacher', currentPoints: 4200, totalEarned: 6500 },
  { id: 8, name: '张三', role: 'student', currentPoints: 1200, totalEarned: 1800 },
]

const mockAdjustments = [
  { id: 1, applicantName: '石家庄信息工程职业学院', applicantRole: 'school', targetName: '张晓蕾', type: 'increase', amount: 500, reason: '教学文件评审通过奖励', attachments: '', status: 'approved', applyDate: '2024-06-01', auditDate: '2024-06-02', auditor: '理事会管理员', auditComment: '同意发放' },
  { id: 2, applicantName: '王老师', applicantRole: 'teacher', targetName: '张三', type: 'increase', amount: 200, reason: '竞赛获奖学生奖励', attachments: '', status: 'approved', applyDate: '2024-05-28', auditDate: '2024-05-29', auditor: '理事会管理员', auditComment: '审核通过' },
  { id: 3, applicantName: '华为技术有限公司', applicantRole: 'enterprise', targetName: '石家庄信息工程职业学院', type: 'increase', amount: 3000, reason: '完成培训指标奖励', attachments: '', status: 'pending', applyDate: '2024-06-05', auditDate: '', auditor: '', auditComment: '' },
  { id: 4, applicantName: '腾讯科技（深圳）有限公司', applicantRole: 'enterprise', targetName: '石家庄信息工程职业学院', type: 'increase', amount: 2000, reason: '技术服务项目结算', attachments: '', status: 'pending', applyDate: '2024-06-08', auditDate: '', auditor: '', auditComment: '' },
  { id: 5, applicantName: '深圳职业技术学院', applicantRole: 'school', targetName: '王老师', type: 'increase', amount: 800, reason: '优秀教学成果奖励', attachments: '', status: 'rejected', applyDate: '2024-05-20', auditDate: '2024-05-22', auditor: '理事会管理员', auditComment: '证明材料不充分，请补充后重新提交' },
  { id: 6, applicantName: '李教授', applicantRole: 'teacher', targetName: '李教授', type: 'decrease', amount: 300, reason: '兑换教学资源-3D打印服务', attachments: '', status: 'pending', applyDate: '2024-06-10', auditDate: '', auditor: '', auditComment: '' },
]

const mockAuditLog = [
  { id: 1, operator: '理事会管理员', action: '审核通过', target: '石家庄信息工程职业学院 -> 张晓蕾 +500', time: '2024-06-02 10:30:00' },
  { id: 2, operator: '理事会管理员', action: '审核通过', target: '王老师 -> 张三 +200', time: '2024-05-29 14:20:00' },
  { id: 3, operator: '理事会管理员', action: '审核拒绝', target: '深圳职业技术学院 -> 王老师 +800', time: '2024-05-22 09:15:00', comment: '证明材料不充分' },
  { id: 4, operator: '理事会管理员', action: '积分调整', target: '石家庄信息工程职业学院 调整余额', time: '2024-05-15 11:00:00' },
]

const defaultRules = [
  { id: 1, name: 'GPU服务器租赁', unit: '台/天', points: 500, scope: '计算设备', status: 'active' },
  { id: 2, name: '3D打印机使用', unit: '台/天', points: 300, scope: '制造设备', status: 'active' },
  { id: 3, name: '示波器套装租赁', unit: '套/天', points: 100, scope: '测试仪器', status: 'active' },
  { id: 4, name: '工业机器人实训平台', unit: '台/天', points: 400, scope: '教学设备', status: 'active' },
  { id: 5, name: '高性能计算工作站', unit: '台/天', points: 350, scope: '计算设备', status: 'active' },
]

export default function PointsManagement() {
  const { user, hasPermission } = useAuth()
  const [balance, setBalance] = useState(mockPointsBalance)
  const [adjustments, setAdjustments] = useState(mockAdjustments)
  const [auditLog] = useState(mockAuditLog)
  const [rules, setRules] = useState(defaultRules)

  const [applyOpen, setApplyOpen] = useState(false)
  const [applyForm] = Form.useForm()
  const [ruleOpen, setRuleOpen] = useState(false)
  const [ruleForm] = Form.useForm()
  const [editRule, setEditRule] = useState(null)
  const [fileOpen, setFileOpen] = useState(false)
  const [fileText, setFileText] = useState('')
  const [detailApp, setDetailApp] = useState(null)
  const [detailAppOpen, setDetailAppOpen] = useState(false)

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
      <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <Button type="link" style={{ color: 'green' }} icon={<CheckCircleOutlined />} onClick={() => handleApprove(r.id)}>通过</Button>
        <Popconfirm title="确定拒绝此申请？" onConfirm={() => handleReject(r.id)} okText="确定" cancelText="取消">
          <Button type="link" danger icon={<CloseCircleOutlined />}>拒绝</Button>
        </Popconfirm>
        <Button size="small" icon={<EyeOutlined />} onClick={() => { setDetailApp(r); setDetailAppOpen(true) }}>查看</Button>
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

    // Tab 2: Apply for adjustment (not for council)
    if (hasPermission('points.apply') && role !== 'council') {
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

    // Tab 3: Batch file adjustment (council)
    if (hasPermission('points.audit')) {
      items.push({
        key: 'batch',
        label: <span><UploadOutlined /> 文件调整</span>,
        children: (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
              <Col span={8}><Card size="small"><Statistic title="系统总积分" value={totalPoints.toLocaleString()} prefix={<FundOutlined />} valueStyle={{ color: '#1677ff' }} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="待处理申请" value={pendingAdjustments.length} prefix={<HistoryOutlined />} valueStyle={{ color: '#faad14' }} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="已完成" value={adjustments.filter(a => a.status !== 'pending').length} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
            </Row>
            <Card title="上传调整文件" size="small" style={{ marginBottom: 24, border: '1px solid #e8e8e8' }}>
              <div style={{ marginBottom: 12 }}>
                <Button icon={<UploadOutlined />} onClick={() => document.getElementById('file-input').click()} style={{ borderRadius: 6 }}>选择文件</Button>
                <input id="file-input" type="file" accept=".txt,.csv" style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = (ev) => {
                      const text = ev.target?.result
                      if (typeof text === 'string') { setFileText(text); message.info('文件已读取，可查看并编辑调整条目') }
                    }
                    reader.readAsText(file)
                  }}
                />
                <span style={{ marginLeft: 12, color: '#666', fontSize: 13 }}>支持 .txt .csv 格式</span>
              </div>
              <div style={{ color: '#999', fontSize: 12, marginBottom: 8, background: '#fafafa', padding: '8px 12px', borderRadius: 6 }}>
                文件格式：每行一条记录，格式：<code style={{ background: '#e6f4ff', padding: '2px 6px', borderRadius: 3 }}>对象名称,增加/减少,数量,理由</code>
              </div>
              <Input.TextArea rows={6} value={fileText} onChange={e => setFileText(e.target.value)}
                placeholder="请在此处粘贴或输入积分调整数据"
                style={{ marginBottom: 12, borderRadius: 6 }}
              />
              <Button type="primary" onClick={() => {
                const lines = fileText.split('\n').filter(l => l.trim())
                const parsed = []
                for (const line of lines) {
                  const parts = line.split(',').map(p => p.trim())
                  if (parts.length >= 3) {
                    const target = balance.find(b => b.name.includes(parts[0]) || parts[0].includes(b.name))
                    if (target) {
                      const isIncrease = parts[1].includes('增加') || parts[1] === 'increase'
                      const amount = parseInt(parts[2]) || 0
                      if (amount > 0) parsed.push({ targetName: target.name, type: isIncrease ? 'increase' : 'decrease', amount, reason: parts[3] || '理事会直接调整' })
                    }
                  }
                }
                if (parsed.length === 0) { message.warning('未能识别出有效的调整条目，请检查格式'); return }
                message.success(`成功识别 ${parsed.length} 条调整记录`)
                // Apply adjustments
                let newBalance = [...balance]
                parsed.forEach(p => {
                  const idx = newBalance.findIndex(b => b.name === p.targetName)
                  if (idx >= 0) {
                    const delta = p.type === 'increase' ? p.amount : -p.amount
                    newBalance[idx] = { ...newBalance[idx], currentPoints: newBalance[idx].currentPoints + delta, totalEarned: p.type === 'increase' ? newBalance[idx].totalEarned + p.amount : newBalance[idx].totalEarned }
                  }
                })
                setBalance(newBalance)
                message.success(`成功执行 ${parsed.length} 条积分调整！`)
                setFileText('')
              }} style={{ borderRadius: 6 }}>执行调整</Button>
            </Card>
          </div>
        ),
      })
    }

    // Tab 4: Audit management
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

    // Tab 5: Points rules config (council)
    if (hasPermission('points.audit')) {
      items.push({
        key: 'rules',
        label: <span><FundOutlined /> 积分规则</span>,
        children: (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditRule(null); ruleForm.resetFields(); setRuleOpen(true) }}>新增规则</Button>
            </div>
            <Table dataSource={rules} columns={[
              { title: '规则名称', dataIndex: 'name', key: 'name' },
              { title: '计价单位', dataIndex: 'unit', key: 'unit' },
              { title: '积分', dataIndex: 'points', key: 'points', render: (v) => <span style={{ color: '#faad14', fontWeight: 'bold' }}>{v}</span> },
              { title: '适用范围', dataIndex: 'scope', key: 'scope', render: (t) => <Tag>{t}</Tag> },
              { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '启用' : '停用'}</Tag> },
              { title: '操作', key: 'action', render: (_, r) => (
                <span style={{ display: 'inline-flex', gap: 4 }}>
                  <Button size="small" onClick={() => { setEditRule(r); ruleForm.setFieldsValue(r); setRuleOpen(true) }}>编辑</Button>
                  <Button size="small" danger onClick={() => { setRules(rules.map(x => x.id === r.id ? { ...x, status: x.status === 'active' ? 'inactive' : 'active' } : x)); message.success(r.status === 'active' ? '已停用' : '已启用') }}>{r.status === 'active' ? '停用' : '启用'}</Button>
                </span>
              )},
            ]} rowKey="id" pagination={false} />
          </div>
        ),
      })
    }

    return items
  }, [balance, adjustments, pendingAdjustments, auditLog, rules, totalPoints, role, hasPermission])

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

      {/* Rule Config Modal */}
      <Modal title={editRule ? '编辑积分规则' : '新增积分规则'} open={ruleOpen} onOk={() => {
        ruleForm.validateFields().then(v => {
          if (editRule) {
            setRules(rules.map(r => r.id === editRule.id ? { ...r, ...v } : r))
            message.success('规则已更新')
          } else {
            setRules([...rules, { id: rules.length + 1, ...v, status: 'active' }])
            message.success('规则已添加')
          }
          setRuleOpen(false); ruleForm.resetFields(); setEditRule(null)
        })
      }} onCancel={() => { setRuleOpen(false); ruleForm.resetFields(); setEditRule(null) }} width={500}>
        <Form form={ruleForm} layout="vertical">
          <Form.Item name="name" label="规则名称" rules={[{ required: true }]}><Input placeholder="例如: GPU服务器租赁" /></Form.Item>
          <Form.Item name="unit" label="计价单位" rules={[{ required: true }]}><Input placeholder="例如: 台/天" /></Form.Item>
          <Form.Item name="points" label="积分" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="例如: 500" />
          </Form.Item>
          <Form.Item name="scope" label="适用范围" rules={[{ required: true }]}>
            <Select options={[{ value: '计算设备', label: '计算设备' }, { value: '制造设备', label: '制造设备' }, { value: '测试仪器', label: '测试仪器' }, { value: '教学设备', label: '教学设备' }]} />
          </Form.Item>
        </Form>
      </Modal>

      {/* View detail modal */}
      <Modal title="申请详情" open={detailAppOpen} onCancel={() => { setDetailAppOpen(false); setDetailApp(null) }} footer={null} width={500}>
        {detailApp && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="申请人">{detailApp.applicant}</Descriptions.Item>
            <Descriptions.Item label="角色">{detailApp.role}</Descriptions.Item>
            <Descriptions.Item label="类型">{detailApp.type === 'increase' ? '增加' : '减少'}</Descriptions.Item>
            <Descriptions.Item label="数量">{detailApp.amount}</Descriptions.Item>
            <Descriptions.Item label="理由">{detailApp.reason}</Descriptions.Item>
            <Descriptions.Item label="日期">{detailApp.applyDate}</Descriptions.Item>
            <Descriptions.Item label="状态">{detailApp.status || '待审核'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  )
}
