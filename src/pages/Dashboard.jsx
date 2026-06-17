import { useState } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Progress, Descriptions, Divider, Empty, Button, message, Tooltip, Modal, Tabs } from 'antd'
import {
  ApartmentOutlined, BankOutlined, GlobalOutlined, UserOutlined,
  TeamOutlined, ExperimentOutlined, ProjectOutlined,
  NodeIndexOutlined, SafetyCertificateOutlined, BarChartOutlined,
  ArrowUpOutlined, ArrowDownOutlined, ShopOutlined, FundOutlined,
  TrophyOutlined, BookOutlined, PieChartOutlined
} from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { mockParks } from '../mock/parks'
import { mockSchools } from '../mock/schools'
import { mockEnterprises } from '../mock/enterprises'
import { mockTeachers } from '../mock/teachers'
import { mockStudents } from '../mock/students'
import { mockResources } from '../mock/resources'
import { mockTrainingQuotas } from '../mock/training'

// ─── Five-dimension config ──────────────────────────────────────────────────
const FIVE_DIMS = [
  { key: 'profession',  label: '职业胜任力', color: '#1677ff' },
  { key: 'innovation',  label: '技术创新力', color: '#722ed1' },
  { key: 'teamwork',    label: '团队协作力', color: '#13c2c2' },
  { key: 'learning',    label: '终身学习力', color: '#52c41a' },
  { key: 'adaptability',label: '职业适应力', color: '#faad14' },
]

const defaultDims = { profession: 70, innovation: 70, teamwork: 70, learning: 70, adaptability: 70 }

const getStudentDims = (sid) => {
  const saved = localStorage.getItem(`student_eval_${sid}`)
  return saved ? JSON.parse(saved).dims : defaultDims
}

const getEvalHistory = (sid) => {
  const saved = localStorage.getItem(`student_eval_history_${sid}`)
  return saved ? JSON.parse(saved) : []
}

const mockStudentResume = {
  name: '张三', major: '计算机科学与技术', grade: '2022级', school: '深圳大学', studentId: '20220101',
  skills: ['Java', 'Python', 'Spring Boot', 'MySQL', 'Linux', 'Docker', 'Vue.js', 'Git'],
  projects: [
    { name: '校园二手交易平台', role: '后端开发', tech: 'Spring Boot + MySQL' },
    { name: '智能考勤系统', role: '全栈', tech: 'Vue + Spring Boot' },
  ],
  certifications: ['软件设计师（中级）', '英语CET-6'],
}

const mockStudentProjects = [
  { id: 1, name: '智能仓储管理系统开发', teacher: '张教授', enterprise: '华为', status: 'in_progress', progress: 65, tags: ['仓储', 'RFID'], assignedStudents: [1, 2, 3, 7] },
  { id: 2, name: 'AI质检模型训练', teacher: '李教授', enterprise: '腾讯', status: 'in_progress', progress: 40, tags: ['AI', 'CV'], assignedStudents: [1, 5, 7] },
  { id: 5, name: '学生成绩分析平台', teacher: '张教授', enterprise: '腾讯', status: 'completed', progress: 100, tags: ['大数据'], assignedStudents: [1, 2, 7] },
]

// ─── Simple SVG Radar Chart ────────────────────────────────────────────────
function RadarChart({ dims, size = 260 }) {
  const cx = size / 2, cy = size / 2, radius = size * 0.38
  const angles = FIVE_DIMS.map((_, i) => (Math.PI * 2 * i) / 5 - Math.PI / 2)
  const getPoint = (value, idx) => {
    const angle = angles[idx]; const r = (value / 100) * radius
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }
  const polygonPoints = FIVE_DIMS.map((d, i) => { const p = getPoint(dims?.[d.key] || 50, i); return `${p.x},${p.y}` }).join(' ')
  return (
    <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
      {[20, 40, 60, 80, 100].map(level => {
        const pts = FIVE_DIMS.map((_, i) => { const a = angles[i]; const r = (level / 100) * radius; return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}` }).join(' ')
        return <polygon key={level} points={pts} fill="none" stroke="#f0f0f0" strokeWidth={1} />
      })}
      {FIVE_DIMS.map((_, i) => { const p = getPoint(100, i); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#f0f0f0" strokeWidth={1} /> })}
      <polygon points={polygonPoints} fill="rgba(22, 119, 255, 0.15)" stroke="#1677ff" strokeWidth={2} />
      {FIVE_DIMS.map((d, i) => { const p = getPoint(dims?.[d.key] || 50, i); return <circle key={i} cx={p.x} cy={p.y} r={4} fill="#1677ff" stroke="#fff" strokeWidth={2} /> })}
      {FIVE_DIMS.map((d, i) => {
        const a = angles[i]; const lr = radius + 28; const lx = cx + lr * Math.cos(a); const ly = cy + lr * Math.sin(a)
        const anchor = Math.abs(a) < 0.1 ? 'middle' : a > 0 && a < Math.PI - 0.1 ? 'start' : 'end'
        return (
          <g key={i}>
            <text x={lx} y={ly} textAnchor={anchor} fontSize={11} fill={d.color} dominantBaseline="middle" fontWeight={500}>{d.label}</text>
            <text x={lx} y={ly + 14} textAnchor={anchor} fontSize={10} fill="#999" dominantBaseline="middle">{dims?.[d.key] || 0}分</text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const role = user?.role

  // ═══ Student Dashboard ═══════════════════════════════
  if (role === 'student') {
    const sid = user?.id || 7
    const liveDims = getStudentDims(sid)
    const evalHistory = getEvalHistory(sid)
    const avgScore = Math.round(Object.values(liveDims).reduce((a, b) => a + b, 0) / 5)
    const [accepted, setAccepted] = useState(() => {
      const s = localStorage.getItem('student_accepted')
      return s ? JSON.parse(s) : []
    })

    const [submitModal, setSubmitModal] = useState(null)
    const [submitNote, setSubmitNote] = useState('')
    const getSubmissions = () => JSON.parse(localStorage.getItem('project_submissions') || '[]')
    const hasSubmitted = (pid) => getSubmissions().some(s => s.projectId === pid && s.studentId === sid)

    const handleSubmit = () => {
      const subs = getSubmissions()
      subs.push({ projectId: submitModal.id, studentId: sid, note: submitNote, date: new Date().toISOString().split('T')[0] })
      localStorage.setItem('project_submissions', JSON.stringify(subs))
      message.success(`成果已提交！项目：${submitModal.name}`)
      setSubmitModal(null)
      setSubmitNote('')
    }

    const handleAccept = (pid) => {
      const key = `${sid}_${pid}`
      const up = [...accepted, key]
      setAccepted(up)
      localStorage.setItem('student_accepted', JSON.stringify(up))
      message.success('已确认接收该项目')
    }

    const handleShowDetail = (p) => {
      Modal.info({
        title: p.name,
        width: 600,
        content: (
          <Descriptions column={1} bordered size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="项目名称">{p.name}</Descriptions.Item>
            <Descriptions.Item label="负责教师">{p.teacher}</Descriptions.Item>
            <Descriptions.Item label="企业">{p.enterprise}</Descriptions.Item>
            <Descriptions.Item label="进度"><Progress percent={p.progress} /></Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={p.status === 'in_progress' ? 'processing' : 'green'}>{p.status === 'in_progress' ? '进行中' : '已结项'}</Tag></Descriptions.Item>
            <Descriptions.Item label="标签">{p.tags.map(t => <Tag key={t}>{t}</Tag>)}</Descriptions.Item>
          </Descriptions>
        ),
        okText: '关闭',
      })
    }

    return (
      <div>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card title={<span><UserOutlined /> 个人简历</span>}>
              <Descriptions column={2} size="small" style={{ marginBottom: 12 }}>
                <Descriptions.Item label="姓名">{mockStudentResume.name}</Descriptions.Item>
                <Descriptions.Item label="学号">{mockStudentResume.studentId}</Descriptions.Item>
                <Descriptions.Item label="院校">{mockStudentResume.school}</Descriptions.Item>
                <Descriptions.Item label="专业">{mockStudentResume.major}</Descriptions.Item>
                <Descriptions.Item label="年级">{mockStudentResume.grade}</Descriptions.Item>
              </Descriptions>
              <Divider orientation="left" style={{ fontSize: 13, margin: '12px 0' }}>技能标签</Divider>
              <div style={{ marginBottom: 12 }}>{mockStudentResume.skills.map(s => <Tag key={s} color="blue" style={{ marginBottom: 4 }}>{s}</Tag>)}</div>
              <Divider orientation="left" style={{ fontSize: 13, margin: '12px 0' }}>项目经历</Divider>
              {mockStudentResume.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 8, padding: '8px 12px', background: '#fafafa', borderRadius: 6 }}>
                  <div style={{ fontWeight: 500 }}>{p.name}</div>
                  <div style={{ color: '#666', fontSize: 13 }}>角色：{p.role} | 技术栈：{p.tech}</div>
                </div>
              ))}
              {evalHistory.length > 0 && (
                <>
                  <Divider orientation="left" style={{ fontSize: 13, margin: '12px 0' }}>教师评价记录</Divider>
                  {evalHistory.map((e, i) => (
                    <div key={i} style={{ marginBottom: 8, padding: '8px 12px', background: '#fff7e6', borderRadius: 6, border: '1px solid #ffd591' }}>
                      <div style={{ fontWeight: 500 }}>{e.projectName} — {e.taskName}</div>
                      <div style={{ color: '#666', fontSize: 13 }}>
                        五维均分：<span style={{ color: '#faad14', fontWeight: 'bold' }}>{e.avgScore}分</span>
                        <span style={{ margin: '0 8px' }}>|</span>
                        评语：{e.comment}
                        <span style={{ margin: '0 8px' }}>|</span>
                        {e.date}
                      </div>
                    </div>
                  ))}
                </>
              )}
              <Divider orientation="left" style={{ fontSize: 13, margin: '12px 0' }}>证书</Divider>
              <div>{mockStudentResume.certifications.map(c => <Tag key={c} color="green" style={{ marginBottom: 4 }}><SafetyCertificateOutlined /> {c}</Tag>)}</div>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card title={<span><BarChartOutlined /> 五维能力评估</span>}>
              <div style={{ textAlign: 'center', position: 'relative' }}>
                <RadarChart dims={liveDims} size={250} />
                <div style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1677ff' }}>{avgScore}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>综合评分</div>
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                {FIVE_DIMS.map(d => (
                  <div key={d.key} style={{ marginBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 2 }}>
                      <span style={{ color: d.color }}>{d.label}</span>
                      <span>{liveDims[d.key]}分</span>
                    </div>
                    <Progress percent={liveDims[d.key]} size="small" strokeColor={d.color} showInfo={false} />
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title={<span><ProjectOutlined /> 项目看板</span>} style={{ marginBottom: 16 }}>
              <Tabs items={[
                {
                  key: 'kanban', label: '看板视图', children: (
                    <div style={{ display: 'flex', gap: 12, overflow: 'auto', paddingBottom: 16 }}>
                      {[
                        { title: '待接收', key: 'pending', color: '#1677ff', items: mockStudentProjects.filter(p => p.assignedStudents?.includes(sid) && !accepted.includes(`${sid}_${p.id}`)) },
                        { title: '进行中', key: 'active', color: '#52c41a', items: mockStudentProjects.filter(p => p.assignedStudents?.includes(sid) && accepted.includes(`${sid}_${p.id}`) && p.status !== 'completed' && !hasSubmitted(p.id)) },
                        { title: '已提交', key: 'submitted', color: '#faad14', items: mockStudentProjects.filter(p => hasSubmitted(p.id)) },
                        { title: '已结项', key: 'done', color: '#999', items: mockStudentProjects.filter(p => p.assignedStudents?.includes(sid) && p.status === 'completed' && !hasSubmitted(p.id)) },
                      ].map(col => (
                        <div key={col.key} style={{ minWidth: 260, background: `${col.color}08`, borderRadius: 12, padding: 12, border: `1px solid ${col.color}22` }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: col.color, marginBottom: 12, paddingBottom: 8, borderBottom: `2px solid ${col.color}33` }}>
                            {col.title} <span style={{ fontSize: 12, opacity: 0.7 }}>({col.items.length})</span>
                          </div>
                          {col.items.length === 0 ? (
                            <div style={{ color: '#ccc', textAlign: 'center', padding: 20 }}>暂无项目</div>
                          ) : col.items.map(p => (
                            <div key={p.id} style={{ background: '#fff', borderRadius: 8, padding: 12, marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer' }}
                              onClick={() => handleShowDetail(p)}>
                              <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>{p.name}</div>
                              <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{p.teacher} · {p.enterprise}</div>
                              <Progress percent={p.progress} size="small" />
                              <div style={{ marginTop: 8, display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                {col.key === 'pending' && (
                                  <Button size="small" type="primary" onClick={(e) => { e.stopPropagation(); handleAccept(p.id) }}>接收</Button>
                                )}
                                {col.key === 'active' && (
                                  <Button size="small" type="primary" onClick={(e) => { e.stopPropagation(); setSubmitModal(p); setSubmitNote('') }}>提交成果</Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )
                },
                {
                  key: 'list', label: '列表视图', children: (
                    <Table dataSource={mockStudentProjects.filter(p => p.assignedStudents?.includes(sid))} columns={[
                      { title: '项目名称', dataIndex: 'name', key: 'name' },
                      { title: '负责教师', dataIndex: 'teacher', key: 'teacher', render: (t) => <Tag color="cyan">{t}</Tag> },
                      { title: '企业', dataIndex: 'enterprise', key: 'enterprise', render: (t) => <Tag color="blue">{t}</Tag> },
                      { title: '进度', key: 'progress', render: (_, r) => <Progress percent={r.progress} size="small" /> },
                      { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'in_progress' ? 'processing' : 'green'}>{s === 'in_progress' ? '进行中' : '已结项'}</Tag> },
                      {
                        title: '接收', key: 'accept', render: (_, r) => {
                          const k = `${sid}_${r.id}`
                          return accepted.includes(k) ? <Tag color="green">已接收</Tag> : <Tag color="orange">待接收</Tag>
                        }
                      },
                      {
                        title: '操作', key: 'action', render: (_, r) => {
                          const k = `${sid}_${r.id}`
                          if (!accepted.includes(k)) return <Button size="small" type="primary" onClick={() => handleAccept(r.id)}>接收项目</Button>
                          if (hasSubmitted(r.id)) return <Tag color="green">已提交</Tag>
                          if (r.status !== 'completed') return <Button size="small" type="primary" onClick={() => { setSubmitModal(r); setSubmitNote('') }}>提交成果</Button>
                          return <Tag color="green">已结项</Tag>
                        }
                      },
                    ]} rowKey="id" pagination={false} size="small" />
                  )
                },
              ]} />
            </Card>
          </Col>
        </Row>

        {/* Submit Modal */}
        <Modal title={`提交成果 — ${submitModal?.name}`} open={!!submitModal} onOk={handleSubmit} onCancel={() => { setSubmitModal(null); setSubmitNote('') }} okText="提交">
          <p style={{ color: '#666', marginBottom: 16 }}>请描述您完成的成果内容和关键产出：</p>
          <Input.TextArea rows={4} value={submitNote} onChange={e => setSubmitNote(e.target.value)} placeholder="描述完成的内容、技术方案和关键成果..." />
        </Modal>
      </div>
    )
  }

  const parkId = user?.parkId
  const isPark = role === 'park'

  const parkEnterprises = isPark ? mockEnterprises.filter(e => e.parkId === parkId) : mockEnterprises
  const parkName = isPark ? mockParks.find(p => p.id === parkId)?.name || '本园区' : ''

  // ═══ General Dashboard ═══════════════════════════════
  const statsCards = isPark ? [
    { title: '园区企业', value: parkEnterprises.length, icon: <GlobalOutlined />, color: '#1677ff', bg: '#e6f4ff' },
    { title: '合作院校', value: mockSchools.length, icon: <BankOutlined />, color: '#52c41a', bg: '#f6ffed' },
    { title: '教师资源', value: mockTeachers.length, icon: <UserOutlined />, color: '#722ed1', bg: '#f9f0ff' },
    { title: '共享资源', value: mockResources.length, icon: <ExperimentOutlined />, color: '#eb2f96', bg: '#fff0f6' },
  ] : [
    { title: '园区数量', value: mockParks.length, icon: <ApartmentOutlined />, color: '#1677ff', bg: '#e6f4ff' },
    { title: '院校数量', value: mockSchools.length, icon: <BankOutlined />, color: '#52c41a', bg: '#f6ffed' },
    { title: '企业数量', value: mockEnterprises.length, icon: <GlobalOutlined />, color: '#faad14', bg: '#fffbe6' },
    { title: '教师总数', value: mockTeachers.length, icon: <UserOutlined />, color: '#722ed1', bg: '#f9f0ff' },
    { title: '学生总数', value: mockStudents.length, icon: <TeamOutlined />, color: '#13c2c2', bg: '#e6fffb' },
    { title: '共享资源', value: mockResources.length, icon: <ExperimentOutlined />, color: '#eb2f96', bg: '#fff0f6' },
  ]

  const projData = [
    { id: 1, name: '智能仓储管理系统开发', enterprise: '华为技术有限公司', budget: 500000, leader: '张教授', status: 'in_progress', progress: 65 },
    { id: 2, name: 'AI质检模型训练', enterprise: '腾讯科技（深圳）有限公司', budget: 300000, leader: '李教授', status: 'recruiting', progress: 0 },
    { id: 3, name: '5G基站天线优化设计', enterprise: '华为技术有限公司', budget: 800000, leader: '', status: 'pending', progress: 0 },
    { id: 4, name: '工业机器人控制算法', enterprise: '大疆创新科技有限公司', budget: 600000, leader: '陈教授', status: 'in_progress', progress: 40 },
    { id: 5, name: '学生成绩分析平台', enterprise: '腾讯科技（深圳）有限公司', budget: 200000, leader: '', status: 'completed', progress: 100 },
  ]

  const sm = { pending: { text: '待审核', color: 'orange' }, recruiting: { text: '招募中', color: 'blue' }, in_progress: { text: '进行中', color: 'processing' }, completed: { text: '已结项', color: 'green' } }

  const latestResources = mockResources.map(r => ({ key: r.id, name: r.name, school: r.publisher, status: r.status, statusText: r.status === 'idle' ? '空闲' : '已租借', dailyPoints: r.dailyPoints }))

  const latestTraining = mockTrainingQuotas.map(q => ({
    key: q.id, title: q.title, enterprise: q.enterpriseName,
    progress: Math.round((q.completedCount / q.targetCount) * 100),
    completedCount: q.completedCount, targetCount: q.targetCount,
    status: q.status,
    statusText: q.status === 'completed' ? '已完成' : q.status === 'in_progress' ? '进行中' : '待承接',
  }))

  const displayProj = isPark ? projData.filter(p => parkEnterprises.some(e => e.name === p.enterprise)) : projData
  const displayTraining = isPark ? latestTraining.filter(t => parkEnterprises.some(e => e.name === t.enterprise)) : latestTraining

  return (
    <div>
      {isPark && (
        <div style={{ background: 'linear-gradient(135deg, #e6f4ff, #f0f5ff)', borderRadius: 14, padding: '20px 28px', marginBottom: 20, border: '1px solid #d6e4ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#1677ff', fontSize: 13, fontWeight: 500, marginBottom: 2 }}>园区工作台</div>
            <div style={{ color: '#1a1a1a', fontSize: 22, fontWeight: 700 }}>{parkName} <span style={{ fontSize: 14, fontWeight: 400, color: '#666' }}>— 园区数据概览</span></div>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 700, color: '#1677ff' }}>{parkEnterprises.length}</div><div style={{ color: '#666', fontSize: 12 }}>园区企业</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 700, color: '#52c41a' }}>{displayProj.length}</div><div style={{ color: '#666', fontSize: 12 }}>关联项目</div></div>
          </div>
        </div>
      )}
      <Row gutter={[16, 16]}>
        {statsCards.map((card, i) => (
          <Col xs={12} sm={8} md={6} lg={4} key={i}>
            <Card hoverable>
              <Statistic title={card.title} value={card.value}
                prefix={<span style={{ color: card.color, backgroundColor: card.bg, padding: 8, borderRadius: 8, marginRight: 8 }}>{card.icon}</span>}
                valueStyle={{ color: card.color }} />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="最新合作项目" extra={<span style={{ cursor: 'pointer', color: '#1677ff' }} onClick={() => navigate('/admin/projects')}>查看全部</span>}>
            <Table dataSource={displayProj} columns={[
              { title: '项目名称', dataIndex: 'name', key: 'name' },
              { title: '企业', dataIndex: 'enterprise', key: 'enterprise' },
              { title: '预算(元)', dataIndex: 'budget', key: 'budget', render: (v) => `¥${v.toLocaleString()}` },
              { title: '进度', key: 'progress', render: (_, r) => <Progress percent={r.progress} size="small" format={() => r.progress > 0 ? `${r.progress}%` : '-'} /> },
              { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={sm[s]?.color}>{sm[s]?.text}</Tag> },
            ]} pagination={false} size="small" rowKey="id" />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="人才对接概览" extra={<span style={{ cursor: 'pointer', color: '#1677ff' }} onClick={() => navigate('/admin/talent')}>查看全部</span>}>
            <Row gutter={[16, 16]}>
              <Col span={8}><Card size="small"><Statistic title="在招岗位" value={3} prefix={<NodeIndexOutlined />} valueStyle={{ color: '#1677ff' }} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="简历投递" value={24} prefix={<TeamOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="成功匹配" value={8} prefix={<ProjectOutlined />} valueStyle={{ color: '#722ed1' }} /></Card></Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="最新共享资源" extra={<span style={{ cursor: 'pointer', color: '#1677ff' }} onClick={() => navigate('/admin/resources')}>查看全部</span>}>
            <Table dataSource={latestResources} columns={[
              { title: '资源名称', dataIndex: 'name', key: 'name' },
              { title: '所属院校', dataIndex: 'school', key: 'school' },
              { title: '状态', dataIndex: 'statusText', key: 'status', render: (t, r) => <Tag color={r.status === 'idle' ? 'green' : 'blue'}>{t}</Tag> },
              { title: '每日积分', dataIndex: 'dailyPoints', key: 'dailyPoints' },
            ]} pagination={false} size="small" />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="培训指标进展" extra={<span style={{ cursor: 'pointer', color: '#1677ff' }} onClick={() => navigate('/admin/services')}>查看全部</span>}>
            <Table dataSource={displayTraining} columns={[
              { title: '培训指标', dataIndex: 'title', key: 'title' },
              { title: '企业', dataIndex: 'enterprise', key: 'enterprise' },
              { title: '进度', key: 'progress', render: (_, r) => <Progress percent={r.progress} size="small" format={() => `${r.completedCount}/${r.targetCount}`} /> },
              { title: '状态', dataIndex: 'statusText', key: 'status', render: (t, r) => <Tag color={r.status === 'completed' ? 'green' : r.status === 'in_progress' ? 'blue' : 'orange'}>{t}</Tag> },
            ]} pagination={false} size="small" />
          </Card>
        </Col>
      </Row>

      {/* ─── Data Cockpit (for enterprise/school/council) ─── */}
      {role !== 'student' && role !== 'mentor' && role !== 'teacher' && role !== 'park' && (
        <Card title={<span><FundOutlined /> 数据驾驶舱</span>} style={{ marginTop: 24 }}>
          {/* Industry Panorama */}
          <h3 style={{ marginBottom: 16, color: '#333' }}>
            <BankOutlined style={{ marginRight: 8 }} />产业全景
          </h3>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}>
              <Card hoverable>
                <Statistic title="产业产值" value="1.2亿" prefix={<FundOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff', fontSize: 28 }} />
                <div style={{ marginTop: 8 }}><Tag color="green"><ArrowUpOutlined /> 15.6%</Tag><span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>同比增长</span></div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card hoverable>
                <Statistic title="服务企业数" value={86} prefix={<ShopOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a', fontSize: 28 }} />
                <div style={{ marginTop: 8 }}><Tag color="green"><ArrowUpOutlined /> 8.3%</Tag><span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>同比增长</span></div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card hoverable>
                <Statistic title="合作院校" value={12} prefix={<TeamOutlined style={{ color: '#722ed1' }} />} valueStyle={{ color: '#722ed1', fontSize: 28 }} />
                <div style={{ marginTop: 8 }}><Tag color="green"><ArrowUpOutlined /> 4.2%</Tag><span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>同比增长</span></div>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card hoverable>
                <Statistic title="累计项目" value={45} prefix={<ProjectOutlined style={{ color: '#faad14' }} />} valueStyle={{ color: '#faad14', fontSize: 28 }} />
                <div style={{ marginTop: 8 }}><Tag color="green"><ArrowUpOutlined /> 22.1%</Tag><span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>同比增长</span></div>
              </Card>
            </Col>
          </Row>

          {/* Resource Integration */}
          <h3 style={{ marginBottom: 16, color: '#333' }}>
            <PieChartOutlined style={{ marginRight: 8 }} />资源整合情况
          </h3>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} md={16}>
              <Card title="资源整合指标" size="small">
                {[{name:'设备捐赠价值',value:'580万元',percent:72,color:'#1677ff'},{name:'企业服务项目数',value:'68项',percent:85,color:'#52c41a'},{name:'企业师资数量',value:'45人',percent:56,color:'#faad14'},{name:'校企共建课程',value:'32门',percent:64,color:'#722ed1'}].map(item => (
                  <div key={item.name} style={{ marginBottom: 16 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span>{item.name}</span>
                      <span style={{ fontWeight:'bold' }}>{item.value}</span>
                    </div>
                    <Progress percent={item.percent} strokeColor={item.color} size="small" />
                  </div>
                ))}
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="投入排行榜 Top 3" size="small">
                {[{rank:1,name:'华为技术有限公司',type:'企业',score:98,value:'12项合作'},{rank:2,name:'深圳大学',type:'院校',score:92,value:'10项合作'},{rank:3,name:'腾讯科技（深圳）有限公司',type:'企业',score:87,value:'8项合作'}].map(item => (
                  <div key={item.rank} style={{ padding:'10px 12px', marginBottom:8, background: item.rank===1?'#fff7e6':'#fafafa', borderRadius:6, border: item.rank===1?'1px solid #ffd591':'none' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span><Tag color={item.rank===1?'gold':item.rank===2?'blue':'cyan'} style={{ fontWeight:'bold' }}>#{item.rank}</Tag><strong>{item.name}</strong></span>
                      <Tag color={item.type==='企业'?'blue':'green'}>{item.type}</Tag>
                    </div>
                    <div style={{ marginTop:4, display:'flex', justifyContent:'space-between', color:'#666', fontSize:12 }}>
                      <span>综合评分：{item.score}</span>
                      <span>{item.value}</span>
                    </div>
                  </div>
                ))}
              </Card>
            </Col>
          </Row>

          {/* Talent Supply & Demand */}
          <h3 style={{ marginBottom: 16, color: '#333' }}>
            <TeamOutlined style={{ marginRight: 8 }} />人才供需情况
          </h3>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} md={8}>
              <Card size="small"><Statistic title="岗位缺口总数" value={2860} suffix="个" valueStyle={{ color:'#f5222d', fontSize:32 }} /></Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="热门岗位 Top 5" size="small">
                {[{name:'AI算法工程师',demand:520,growth:35},{name:'嵌入式开发工程师',demand:450,growth:28},{name:'大数据工程师',demand:380,growth:22},{name:'智能制造工程师',demand:320,growth:18},{name:'云计算架构师',demand:290,growth:25}].map((job,i) => (
                  <div key={job.name} style={{ marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>
                    <Tag color={i===0?'gold':i<3?'blue':'default'}>{i+1}</Tag>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between' }}>
                        <span>{job.name}</span>
                        <span style={{ fontWeight:'bold', color:'#1677ff' }}>{job.demand}人</span>
                      </div>
                      <Progress percent={job.demand/520*100} size="small" strokeColor={i===0?'#faad14':'#1677ff'} showInfo={false} />
                    </div>
                    <Tag color="green">+{job.growth}%</Tag>
                  </div>
                ))}
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="学历需求分布" size="small">
                {[{level:'博士',percent:8,count:229},{level:'硕士',percent:25,count:715},{level:'本科',percent:45,count:1287},{level:'大专及以下',percent:22,count:629}].map(edu => (
                  <div key={edu.level} style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span>{edu.level}</span>
                      <span style={{ color:'#666' }}>{edu.count}人 ({edu.percent}%)</span>
                    </div>
                    <Progress percent={edu.percent} size="small" strokeColor={edu.level==='博士'?'#722ed1':edu.level==='硕士'?'#1677ff':edu.level==='本科'?'#52c41a':'#faad14'} />
                  </div>
                ))}
              </Card>
            </Col>
          </Row>

          {/* Service Results */}
          <h3 style={{ marginBottom: 16, color: '#333' }}>
            <TrophyOutlined style={{ marginRight: 8 }} />服务成果
          </h3>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}><Card hoverable size="small"><Statistic title="培训总人次" value="2,860人次" prefix={<TeamOutlined style={{ color:'#1677ff' }} />} valueStyle={{ fontSize:22 }} /></Card></Col>
            <Col xs={12} sm={6}><Card hoverable size="small"><Statistic title="专利数" value={38} prefix={<ExperimentOutlined style={{ color:'#722ed1' }} />} suffix="项" valueStyle={{ fontSize:22 }} /></Card></Col>
            <Col xs={12} sm={6}><Card hoverable size="small"><Statistic title="软著数" value={52} prefix={<BookOutlined style={{ color:'#52c41a' }} />} suffix="项" valueStyle={{ fontSize:22 }} /></Card></Col>
            <Col xs={12} sm={6}><Card hoverable size="small"><Statistic title="研究成果" value={27} prefix={<FundOutlined style={{ color:'#faad14' }} />} suffix="项" valueStyle={{ fontSize:22 }} /></Card></Col>
            <Col xs={12} sm={6}><Card hoverable size="small"><Statistic title="成果转化率" value={68} suffix="%" prefix={<ArrowUpOutlined style={{ color:'#f5222d' }} />} valueStyle={{ color:'#f5222d', fontSize:22 }} /></Card></Col>
            <Col xs={12} sm={6}><Card hoverable size="small"><Statistic title="项目合同总额" value="3,200万元" prefix={<ShopOutlined style={{ color:'#1677ff' }} />} valueStyle={{ fontSize:22 }} /></Card></Col>
          </Row>
        </Card>
      )}
    </div>
  )
}
