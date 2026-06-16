import { useState, useMemo } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, InputNumber, Select, Tabs, message, Progress, Row, Col, Empty, Descriptions, Popconfirm, Typography } from 'antd'
import { PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, ToolOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons'
import { mockEnterprises } from '../mock/enterprises'
import { mockSchools } from '../mock/schools'
import { mockTeachers } from '../mock/teachers'
import { useAuth } from '../context/AuthContext'

const { Paragraph } = Typography

// ==================== Mock Data ====================

const mockQuotas = [
  { id: 1, enterpriseId: 1, enterpriseName: '华为技术有限公司', title: 'HarmonyOS开发工程师培训', targetCount: 50, completedCount: 20, deadline: '2024-09-30', status: 'in_progress', points: 20000 },
  { id: 2, enterpriseId: 2, enterpriseName: '腾讯科技（深圳）有限公司', title: 'AI大模型应用培训', targetCount: 30, completedCount: 5, deadline: '2024-10-15', status: 'in_progress', points: 15000 },
  { id: 3, enterpriseId: 3, enterpriseName: '广州小鹏汽车科技有限公司', title: '智能驾驶算法培训', targetCount: 20, completedCount: 0, deadline: '2024-08-31', status: 'pending', points: 12000 },
  { id: 4, enterpriseId: 5, enterpriseName: '大疆创新科技有限公司', title: '嵌入式系统开发培训', targetCount: 40, completedCount: 40, deadline: '2024-06-30', status: 'completed', points: 16000 },
  { id: 5, enterpriseId: 1, enterpriseName: '华为技术有限公司', title: '5G通信技术培训', targetCount: 60, completedCount: 35, deadline: '2024-12-31', status: 'in_progress', points: 25000 },
  { id: 6, enterpriseId: 2, enterpriseName: '腾讯科技（深圳）有限公司', title: '云原生架构师培训', targetCount: 25, completedCount: 0, deadline: '2024-11-30', status: 'pending', points: 18000 },
]

const mockAcceptances = [
  { id: 1, quotaId: 1, quotaTitle: 'HarmonyOS开发工程师培训', schoolId: 1, schoolName: '深圳大学', assignedCount: 20, status: 'in_progress', acceptDate: '2024-07-01', completeDate: '' },
  { id: 2, quotaId: 1, quotaTitle: 'HarmonyOS开发工程师培训', schoolId: 2, schoolName: '深圳职业技术学院', assignedCount: 15, status: 'completed', acceptDate: '2024-07-01', completeDate: '2024-08-15' },
  { id: 3, quotaId: 2, quotaTitle: 'AI大模型应用培训', schoolId: 1, schoolName: '深圳大学', assignedCount: 10, status: 'in_progress', acceptDate: '2024-07-10', completeDate: '' },
  { id: 4, quotaId: 4, quotaTitle: '嵌入式系统开发培训', schoolId: 2, schoolName: '深圳职业技术学院', assignedCount: 25, status: 'completed', acceptDate: '2024-05-01', completeDate: '2024-06-25' },
]

const statusMap = {
  pending: { text: '待承接', color: 'orange' },
  in_progress: { text: '进行中', color: 'blue' },
  completed: { text: '已完成', color: 'green' },
}

const techStatusMap = {
  pending: { text: '待承接', color: 'orange' },
  in_progress: { text: '进行中', color: 'blue' },
  completed: { text: '已完成', color: 'green' },
}

const mockTechServices = [
  { id: 1, name: '产线自动化改造方案', enterpriseId: 1, enterpriseName: '华为技术有限公司', budget: 200000, field: '智能制造', description: '针对电子制造产线进行自动化升级改造，需要设计完整的自动化生产方案，包含机器人选型、产线布局、控制系统设计等。', status: 'pending', publishDate: '2024-06-01' },
  { id: 2, name: '质检系统AI算法优化', enterpriseId: 2, enterpriseName: '腾讯科技（深圳）有限公司', budget: 150000, field: 'AI算法', description: '基于深度学习的质检系统算法优化，要求缺陷检测准确率99%以上，处理速度达到100ms/件。', status: 'in_progress', publishDate: '2024-05-20' },
  { id: 3, name: '园区网络架构设计', enterpriseId: 3, enterpriseName: '广州小鹏汽车科技有限公司', budget: 80000, field: '网络通信', description: '智能产业园区网络架构整体设计，包括5G专网部署、工业以太网规划、网络安全方案等。', status: 'pending', publishDate: '2024-06-10' },
  { id: 4, name: '新能源电池检测方案', enterpriseId: 4, enterpriseName: '东莞华贝电子科技有限公司', budget: 120000, field: '新能源', description: '动力电池性能检测系统方案开发，包括电芯一致性测试、BMS功能验证、安全性能评估等。', status: 'completed', publishDate: '2024-04-15' },
  { id: 5, name: '智能仓储管理系统开发', enterpriseId: 5, enterpriseName: '大疆创新科技有限公司', budget: 180000, field: '物联网', description: '基于RFID和AGV的智能仓储管理系统，实现入库、出库、盘点全流程自动化管理。', status: 'pending', publishDate: '2024-06-15' },
]

const mockTechInterests = [
  { id: 1, serviceId: 1, unitName: '深圳大学', contact: '李教授', type: 'school', status: 'pending', message: '我们学校机器人实验室有相关产线改造经验，希望合作' },
  { id: 2, serviceId: 2, unitName: '张教授（深圳大学）', contact: '张教授', type: 'teacher', status: 'approved', message: 'AI视觉检测是我们的研究方向，可以提供算法优化方案' },
]

const mockCapabilities = [
  { id: 1, name: 'AI视觉检测方案', industry: '智能制造', provider: '深圳大学', contact: '张教授', contactPhone: '13800139001', description: '提供基于深度学习的工业视觉检测全套解决方案，包括缺陷检测、尺寸测量、字符识别等' },
  { id: 2, name: '工业机器人集成', industry: '智能制造', provider: '深圳职业技术学院', contact: '王老师', contactPhone: '13800139003', description: '提供六轴工业机器人编程、仿真、集成调试服务，支持多种品牌机器人' },
  { id: 3, name: '5G通信测试服务', industry: '信息通信', provider: '华南理工大学', contact: '陈教授', contactPhone: '13800139004', description: '提供5G基站、终端设备的射频性能测试、协议一致性测试服务' },
  { id: 4, name: '嵌入式系统开发', industry: '电子信息', provider: '广东工业大学', contact: '刘老师', contactPhone: '13800139006', description: '提供基于ARM/RISC-V的嵌入式系统软硬件开发服务，包括RTOS移植、驱动开发' },
]

export default function ServicePool() {
  const { user, hasPermission } = useAuth()
  const [quotas, setQuotas] = useState(mockQuotas)
  const [acceptances, setAcceptances] = useState(mockAcceptances)
  const [techServices, setTechServices] = useState(mockTechServices)
  const [techInterests, setTechInterests] = useState(mockTechInterests)
  const [capabilities] = useState(mockCapabilities)

  // Quota modals
  const [quotaPublishOpen, setQuotaPublishOpen] = useState(false)
  const [acceptOpen, setAcceptOpen] = useState(false)
  const [acceptQuota, setAcceptQuota] = useState(null)
  const [publishForm] = Form.useForm()
  const [acceptForm] = Form.useForm()

  // Tech service modals
  const [techPublishOpen, setTechPublishOpen] = useState(false)
  const [interestOpen, setInterestOpen] = useState(false)
  const [interestService, setInterestService] = useState(null)
  const [techForm] = Form.useForm()
  const [interestForm] = Form.useForm()

  // Capability modals
  const [capPublishOpen, setCapPublishOpen] = useState(false)
  const [capForm] = Form.useForm()

  // Completion proof
  const [proofOpen, setProofOpen] = useState(false)
  const [proofService, setProofService] = useState(null)
  const [proofForm] = Form.useForm()

  const role = user?.role || 'admin'
  const schoolId = user?.schoolId
  const enterpriseId = user?.enterpriseId

  // ======== Training Quota Handlers ========

  const handleQuotaPublish = () => {
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
      setQuotaPublishOpen(false)
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
    const acc = acceptances.find(a => a.id === id)
    if (acc) {
      setAcceptances(acceptances.map(a => a.id === id ? { ...a, status: 'completed', completeDate: new Date().toISOString().split('T')[0] } : a))
      setQuotas(quotas.map(qq => qq.id === acc.quotaId ? { ...qq, completedCount: qq.completedCount + acc.assignedCount, status: (qq.completedCount + acc.assignedCount) >= qq.targetCount ? 'completed' : 'in_progress' } : qq))
    }
    message.success('已完成该批次培训')
  }

  // ======== Tech Service Handlers ========

  const handleTechPublish = () => {
    techForm.validateFields().then(values => {
      const ent = mockEnterprises.find(e => e.id === values.enterpriseId)
      const newService = {
        id: techServices.length + 1,
        ...values,
        enterpriseName: ent?.name || '未知',
        status: 'pending',
        publishDate: new Date().toISOString().split('T')[0],
      }
      delete newService.enterpriseId
      setTechServices([...techServices, newService])
      message.success('发布技术服务需求成功！')
      setTechPublishOpen(false)
      techForm.resetFields()
    })
  }

  const handleInterest = () => {
    interestForm.validateFields().then(values => {
      const teacher = mockTeachers.find(t => t.id === values.teacherId)
      const unitName = teacher ? `${teacher.name}（${mockSchools.find(s => s.id === teacher.schoolId)?.name || ''}）` : values.unitName
      const newInterest = {
        id: techInterests.length + 1,
        serviceId: interestService.id,
        unitName,
        contact: values.contact,
        type: values.type,
        status: 'pending',
        message: values.message,
      }
      setTechInterests([...techInterests, newInterest])
      message.success('已表达承接意向，等待企业确认！')
      setInterestOpen(false)
      setInterestService(null)
      interestForm.resetFields()
    })
  }

  const handleSubmitProof = () => {
    proofForm.validateFields().then(values => {
      setTechInterests(techInterests.map(ti =>
        ti.serviceId === proofService.id ? { ...ti, status: 'completed', proof: values.proof, proofNote: values.note } : ti
      ))
      setTechServices(techServices.map(ts =>
        ts.id === proofService.id ? { ...ts, status: 'completed' } : ts
      ))
      message.success('完成证明已提交！')
      setProofOpen(false)
      setProofService(null)
      proofForm.resetFields()
    })
  }

  const handleCapPublish = () => {
    capForm.validateFields().then(values => {
      message.success('服务能力发布成功！')
      setCapPublishOpen(false)
      capForm.resetFields()
    })
  }

  // Filtered data
  const filteredAcceptances = useMemo(() => {
    if (role === 'school') return acceptances.filter(a => a.schoolId === schoolId)
    return acceptances
  }, [role, schoolId, acceptances])

  // ======== Column Definitions ========

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

  const techColumns = [
    { title: '服务名称', dataIndex: 'name', key: 'name' },
    { title: '企业', dataIndex: 'enterpriseName', key: 'enterpriseName', render: (t) => <Tag color="blue">{t}</Tag> },
    { title: '技术领域', dataIndex: 'field', key: 'field', render: (t) => <Tag>{t}</Tag> },
    { title: '预算（元）', dataIndex: 'budget', key: 'budget', render: (v) => <span style={{ color: '#faad14', fontWeight: 'bold' }}>¥{v.toLocaleString()}</span> },
    { title: '发布日期', dataIndex: 'publishDate', key: 'publishDate' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={techStatusMap[s]?.color}>{techStatusMap[s]?.text}</Tag> },
    { title: '操作', key: 'action', render: (_, r) => {
      if (role === 'teacher' || role === 'school') {
        if (r.status === 'pending') {
          return <Button size="small" type="primary" onClick={() => { setInterestService(r); setInterestOpen(true) }}>表达意向</Button>
        }
        if (r.status === 'in_progress') {
          const myInterest = techInterests.find(ti => ti.serviceId === r.id && (ti.type === 'teacher' || ti.type === 'school'))
          if (myInterest && myInterest.status !== 'completed') {
            return <Button size="small" type="primary" onClick={() => { setProofService(r); setProofOpen(true) }}>提交完成证明</Button>
          }
        }
      }
      return <Button size="small" onClick={() => message.info('查看详细')}>查看</Button>
    }},
  ]

  // ======== Tab Items ========

  const tabItems = useMemo(() => {
    const items = []

    // Tab 1: Social Training
    items.push({
      key: 'training',
      label: <span><TrophyOutlined /> 社会培训</span>,
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            {hasPermission('quota.publish') && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setQuotaPublishOpen(true)} style={{ marginRight: 16 }}>发布培训指标</Button>
            )}
          </div>
          <Table dataSource={quotas} columns={quotaColumns} rowKey="id" pagination={false} style={{ marginBottom: 24 }} />
          {(role === 'admin' || role === 'enterprise' || role === 'school') && (
            <Card title="承接列表" size="small" style={{ marginTop: 16 }}>
              <Table dataSource={filteredAcceptances} columns={acceptColumns} rowKey="id" pagination={false} />
            </Card>
          )}
        </div>
      ),
    })

    // Tab 2: Technical Services
    items.push({
      key: 'tech',
      label: <span><ToolOutlined /> 技术服务</span>,
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            {role === 'enterprise' && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setTechPublishOpen(true)}>发布技术难题</Button>
            )}
          </div>
          <Table dataSource={techServices} columns={techColumns} rowKey="id" pagination={false} />
        </div>
      ),
    })

    // Tab 3: Capabilities Display
    items.push({
      key: 'capabilities',
      label: <span><TeamOutlined /> 服务能力展示</span>,
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            {(role === 'school' || role === 'teacher') && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCapPublishOpen(true)}>发布服务能力</Button>
            )}
          </div>
          {capabilities.length === 0 ? (
            <Empty description="暂无服务能力展示" />
          ) : (
            <Row gutter={[16, 16]}>
              {capabilities.map(c => (
                <Col xs={24} sm={12} lg={8} key={c.id}>
                  <Card hoverable>
                    <Tag color="purple" style={{ marginBottom: 8 }}>{c.industry}</Tag>
                    <h4 style={{ marginBottom: 8 }}>{c.name}</h4>
                    <div style={{ color: '#666', fontSize: 13, marginBottom: 8 }}>
                      <div>提供单位：{c.provider}</div>
                      <div>联系人：{c.contact} | {c.contactPhone}</div>
                    </div>
                    <Paragraph ellipsis={{ rows: 3 }} style={{ fontSize: 13, color: '#888', marginBottom: 0 }}>
                      {c.description}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      ),
    })

    return items
  }, [quotas, techServices, filteredAcceptances, capabilities, role, hasPermission])

  return (
    <Card title="技术服务池">
      <Tabs items={tabItems} />

      {/* Publish Quota Modal */}
      <Modal title="发布培训指标" open={quotaPublishOpen} onOk={handleQuotaPublish} onCancel={() => { setQuotaPublishOpen(false); publishForm.resetFields() }} width={600}>
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

      {/* Accept Quota Modal */}
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

      {/* Publish Tech Service Modal */}
      <Modal title="发布技术难题" open={techPublishOpen} onOk={handleTechPublish} onCancel={() => { setTechPublishOpen(false); techForm.resetFields() }} width={600}>
        <Form form={techForm} layout="vertical">
          <Form.Item name="enterpriseId" label="企业" rules={[{ required: true }]}>
            <Select options={mockEnterprises.map(e => ({ value: e.id, label: e.name }))} />
          </Form.Item>
          <Form.Item name="name" label="服务名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="field" label="技术领域" rules={[{ required: true }]}>
            <Select options={[
              { value: '智能制造', label: '智能制造' },
              { value: 'AI算法', label: 'AI算法' },
              { value: '网络通信', label: '网络通信' },
              { value: '新能源', label: '新能源' },
              { value: '物联网', label: '物联网' },
              { value: '嵌入式', label: '嵌入式' },
            ]} />
          </Form.Item>
          <Form.Item name="budget" label="预算（元）" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="需求描述" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="请详细描述技术难题和需求..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Interest Modal */}
      <Modal title="表达承接意向" open={interestOpen} onOk={handleInterest} onCancel={() => { setInterestOpen(false); setInterestService(null); interestForm.resetFields() }} width={500}>
        {interestService && (
          <div>
            <p style={{ marginBottom: 16, color: '#666' }}>
              服务：<strong>{interestService.name}</strong> | 预算：<strong style={{ color: '#faad14' }}>¥{interestService.budget.toLocaleString()}</strong>
            </p>
            <Form form={interestForm} layout="vertical">
              <Form.Item name="type" label="承接主体类型" rules={[{ required: true }]}>
                <Select options={[
                  { value: 'school', label: '院校' },
                  { value: 'teacher', label: '教师个人' },
                ]} />
              </Form.Item>
              <Form.Item name="teacherId" label="选择教师">
                <Select allowClear placeholder="选择教师（院校承接时可选）" options={mockTeachers.map(t => ({ value: t.id, label: `${t.name} (${mockSchools.find(s => s.id === t.schoolId)?.name || ''})` }))} />
              </Form.Item>
              <Form.Item name="unitName" label="单位/个人名称" rules={[{ required: true }]}>
                <Input placeholder="如：深圳大学计算机学院" />
              </Form.Item>
              <Form.Item name="contact" label="联系人" rules={[{ required: true }]}>
                <Input placeholder="联系人姓名" />
              </Form.Item>
              <Form.Item name="message" label="承接说明" rules={[{ required: true }]}>
                <Input.TextArea rows={3} placeholder="请说明技术能力和承接方案..." />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* Publish Capability Modal */}
      <Modal title="发布服务能力" open={capPublishOpen} onOk={handleCapPublish} onCancel={() => { setCapPublishOpen(false); capForm.resetFields() }} width={600}>
        <Form form={capForm} layout="vertical">
          <Form.Item name="name" label="能力名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="industry" label="对应产业" rules={[{ required: true }]}>
            <Select options={[
              { value: '智能制造', label: '智能制造' },
              { value: '信息通信', label: '信息通信' },
              { value: '电子信息', label: '电子信息' },
              { value: '新能源', label: '新能源' },
              { value: '物联网', label: '物联网' },
            ]} />
          </Form.Item>
          <Form.Item name="contact" label="联系人" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="contactPhone" label="联系电话"><Input placeholder="选填" /></Form.Item>
          <Form.Item name="description" label="能力介绍" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Completion Proof Modal */}
      <Modal title={<span><CheckCircleOutlined /> 提交完成证明</span>}
        open={proofOpen} onOk={handleSubmitProof}
        onCancel={() => { setProofOpen(false); setProofService(null); proofForm.resetFields() }}
        width={550} okText="提交">
        {proofService && (
          <div>
            <p style={{ marginBottom: 16, color: '#666' }}>
              服务：<strong>{proofService.name}</strong>
              <span style={{ marginLeft: 16 }}>预算：¥{proofService.budget.toLocaleString()}</span>
            </p>
            <Form form={proofForm} layout="vertical">
              <Form.Item name="proof" label="完成证明" rules={[{ required: true }]}>
                <Input.TextArea rows={3} placeholder="描述完成的成果、效果等" />
              </Form.Item>
              <Form.Item name="note" label="补充说明">
                <Input.TextArea rows={3} placeholder="可选：补充说明完成情况" />
              </Form.Item>
              <Form.Item name="attachment" label="附件链接">
                <Input placeholder="代码仓库/文档链接（模拟）" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </Card>
  )
}
