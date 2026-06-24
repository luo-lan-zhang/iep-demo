import { useState } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Progress, Divider, Empty, Button, Tooltip, Tabs } from 'antd'
import {
  ApartmentOutlined, BankOutlined, GlobalOutlined, UserOutlined,
  TeamOutlined, ExperimentOutlined, ProjectOutlined,
  NodeIndexOutlined, SafetyCertificateOutlined, BarChartOutlined,
  ArrowUpOutlined, ShopOutlined, FundOutlined,
  TrophyOutlined, BookOutlined, PieChartOutlined,
  StarOutlined, DeploymentUnitOutlined, FileTextOutlined, BulbOutlined
} from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { mockParks } from '../mock/parks'
import { mockSchools } from '../mock/schools'
import { mockEnterprises } from '../mock/enterprises'
import { mockTeachers } from '../mock/teachers'
import { mockStudents } from '../mock/students'
import { mockResources, mockApplications } from '../mock/resources'
import { mockTrainingQuotas } from '../mock/training'

// ─── Project mock for school dashboard ──────────────────────────────────────
const schoolProjectsData = [
  { id: 1, name: '智能仓储管理系统开发', enterpriseId: 1, enterpriseName: '华为', budget: 500000, schoolId: 1, status: 'in_progress', progress: 65 },
  { id: 2, name: 'AI质检模型训练', enterpriseId: 2, enterpriseName: '腾讯', budget: 300000, schoolId: 1, status: 'in_progress', progress: 40 },
  { id: 3, name: '5G基站天线优化设计', enterpriseId: 1, enterpriseName: '华为', budget: 800000, schoolId: null, status: 'pending', progress: 0 },
  { id: 4, name: '工业机器人控制算法', enterpriseId: 5, enterpriseName: '大疆', budget: 600000, schoolId: 1, status: 'in_progress', progress: 40 },
  { id: 5, name: '学生成绩分析平台', enterpriseId: 2, enterpriseName: '腾讯', budget: 200000, schoolId: 1, status: 'completed', progress: 100 },
]
const projectStatusMap = {
  pending: { text: '待审核', color: 'orange' },
  in_progress: { text: '进行中', color: 'processing' },
  completed: { text: '已结项', color: 'green' },
}

// ─── Five-dimension config ──────────────────────────────────────────────────
const FIVE_DIMS = [
  { key: 'knowledge',       label: '知识建构', color: '#1677ff' },
  { key: 'engineering',     label: '工程实践', color: '#722ed1' },
  { key: 'innovation',      label: '迭代创新', color: '#13c2c2' },
  { key: 'teamwork',        label: '团队协同', color: '#52c41a' },
  { key: 'competency',      label: '职业胜任', color: '#faad14' },
]

const classAvgDims = { knowledge: 81, engineering: 75, innovation: 78, teamwork: 80, competency: 76 }
const defaultDims = { knowledge: 81, engineering: 75, innovation: 78, teamwork: 80, competency: 76 }

const getStudentDims = (sid) => {
  const saved = localStorage.getItem(`student_eval_${sid}`)
  return saved ? JSON.parse(saved).dims : defaultDims
}

const getEvalHistory = (sid) => {
  const saved = localStorage.getItem(`student_eval_history_${sid}`)
  return saved ? JSON.parse(saved) : []
}

const getLastEvalDims = (sid) => {
  const history = getEvalHistory(sid)
  if (history.length > 0) {
    const last = history[history.length - 1]
    return last.dims || { knowledge: 85, engineering: 90, innovation: 90, teamwork: 84, competency: 93 }
  }
  return { knowledge: 85, engineering: 90, innovation: 90, teamwork: 84, competency: 93 }
}

const mockStudentResumeA = {
  name: '贾梦圆', studentId: '32419160313', major: '软件技术', grade: '2024级', school: '石家庄信息工程职业学院',
  projects: [
    { name: '智慧校园餐饮系统', role: '前端开发' },
  ],
}
const mockStudentResumeB = {
  name: '陈芝树', studentId: '32319160306', major: '软件技术', grade: '2023级', school: '石家庄信息工程职业学院',
  projects: [
    { name: '信息安全课程开发服务', role: '后端开发' },
  ],
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
    const lastDims = getLastEvalDims(sid)
    const evalHistory = getEvalHistory(sid)
    const avgScore = Math.round(Object.values(liveDims).reduce((a, b) => a + b, 0) / 5)

    // Pick which resume to show based on student id
    const resume = sid === 7 ? mockStudentResumeA : mockStudentResumeB

    return (
      <div>
        {/* Row 1: 个人简历 + 五维能力评估 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title={<span><UserOutlined /> 个人简历</span>}>
              <Table dataSource={[resume]} columns={[
                { title: '学生姓名', dataIndex: 'name', key: 'name', width: 100 },
                { title: '学号', dataIndex: 'studentId', key: 'studentId', width: 130 },
                { title: '专业', dataIndex: 'major', key: 'major', width: 100 },
                { title: '年级', dataIndex: 'grade', key: 'grade', width: 90 },
                { title: '项目经历', key: 'projects', render: (_, r) => r.projects.map((p, i) => (
                  <div key={i} style={{ fontSize: 12, lineHeight: 1.6 }}>{p.name}</div>
                )) },
                { title: '角色', key: 'role', render: (_, r) => r.projects.map((p, i) => (
                  <Tag key={i} color="blue" style={{ fontSize: 11 }}>{p.role}</Tag>
                )) },
              ]} rowKey="studentId" pagination={false} size="small" />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title={<span><BarChartOutlined /> 五维能力评估</span>}>
              <Table dataSource={FIVE_DIMS.map(d => {
                const lastVal = lastDims[d.key] || defaultDims[d.key]
                return {
                  dim: d.label,
                  classAvg: classAvgDims[d.key],
                  personalAvg: liveDims[d.key],
                  last: lastVal,
                  color: d.color,
                }
              })} columns={[
                { title: '维度', dataIndex: 'dim', key: 'dim', render: (t, r) => <span style={{ color: r.color, fontWeight: 500 }}>{t}</span> },
                { title: '班级平均', dataIndex: 'classAvg', key: 'classAvg', render: (v) => <span style={{ color: '#666' }}>{v}</span> },
                { title: '个人平均', dataIndex: 'personalAvg', key: 'personalAvg', render: (v, r) => <span style={{ color: v > r.classAvg ? '#52c41a' : '#ff4d4f', fontWeight: 500 }}>{v}</span> },
                { title: '最后一次', dataIndex: 'last', key: 'last', render: (v, r) => <Progress percent={v} size="small" strokeColor={r.color} format={() => v} /> },
              ]} rowKey="dim" pagination={false} size="small" />
            </Card>
          </Col>
        </Row>

        {/* Row 2: 综评报告 + 项目诊断 */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <Card title={<span><FileTextOutlined /> 综评报告</span>} style={{ height: '100%' }}>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.9, textIndent: '2em' }}>
                学业成绩优异，逻辑思维灵活敏锐，深耕编程开发、算法应用等专业内容，主动关注人工智能、前端架构等行业前沿技术，自主学习意愿极强。具备出色的创新思辨能力，能够结合项目场景优化算法模型、改良开发方案，擅长联动计算机、新媒体、工业交互等跨领域知识解决开发难题，项目创新度突出。短板方面，工程规范化素养有待提升，编写项目开发手册、技术说明文档意识薄弱，代码编写规范性、模块化整洁度不足；项目前期用户需求拆解研判能力不足，代码实验、项目运行结果标准化可复现能力需要专项强化。
              </p>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={<span><FundOutlined /> 本项目个性化智能诊断报告</span>} style={{ height: '100%' }}>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.9, textIndent: '2em' }}>
                创新优势凸显，能够跳出传统开发范式，针对项目原有业务逻辑、算法模型、交互架构提出轻量化改良方案，主动调研行业同类项目前沿解法，结合跨领域思路优化项目功能，适配多元化使用场景，项目创意维度评分位居小组前列。但项目落地短板直观显现：项目全流程文档缺失完整架构，需求调研记录、版本迭代日志、接口调试文档撰写零散潦草；项目部署调试步骤无标准化记录，不同运行环境下项目成果复现难度较高，项目工程化、标准化落地能力有待补齐。
              </p>
            </Card>
          </Col>
        </Row>

        {/* Row 3: 提升建议 */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title={<span style={{ color: '#1677ff' }}><BulbOutlined /> 提升建议</span>}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: '#f6ffed', borderRadius: 8, padding: 16, border: '1px solid #b7eb8f' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#52c41a', marginBottom: 8 }}>📋 工程规范提升</div>
                  <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8, margin: 0 }}>
                    建议系统学习项目开发文档编写规范，在每次迭代中同步维护需求文档、接口文档及部署手册。参考行业标准（如GB/T 8567）建立个人代码规范检查清单，使用ESLint、Prettier等工具辅助代码格式化训练，逐步养成模块化、可维护的编码习惯。
                  </p>
                </div>
                <div style={{ background: '#e6f7ff', borderRadius: 8, padding: 16, border: '1px solid #91d5ff' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1677ff', marginBottom: 8 }}>🔍 需求分析能力</div>
                  <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8, margin: 0 }}>
                    参与项目初期需求调研环节，学习使用用户故事地图、流程图等工具进行需求拆解。建议在每次开发前完成需求分析文档并请导师评审，通过反复练习提升对业务场景的理解力和需求到代码的转化能力。
                  </p>
                </div>
                <div style={{ background: '#fff7e6', borderRadius: 8, padding: 16, border: '1px solid #ffd591' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fa8c16', marginBottom: 8 }}>🧪 实验复现标准化</div>
                  <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8, margin: 0 }}>
                    建立标准化实验环境配置流程，使用Docker容器化技术统一运行环境，记录完整的环境依赖、参数配置与运行步骤。引入自动化测试框架（如Jest、Pytest），确保项目在不同环境下结果可复现、可验证。
                  </p>
                </div>
                <div style={{ background: '#f9f0ff', borderRadius: 8, padding: 16, border: '1px solid #d3adf7' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#722ed1', marginBottom: 8 }}>🚀 前沿技术拓展</div>
                  <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8, margin: 0 }}>
                    继续保持对AI大模型、前端微架构、云原生等前沿方向的关注，建议每季度参与一次行业技术沙龙或开源项目贡献。结合专业方向，选择2-3个技术主题进行深度学习并产出技术博客，积累个人技术品牌影响力。
                  </p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  const parkId = user?.parkId
  const isPark = role === 'park'
  const enterpriseId = user?.enterpriseId
  const isEnterprise = role === 'enterprise' || role === 'mentor'
  const schoolId = user?.schoolId
  const isSchool = role === 'school'

  const parkEnterprises = isPark ? mockEnterprises.filter(e => e.parkId === parkId) : mockEnterprises
  const parkName = isPark ? mockParks.find(p => p.id === parkId)?.name || '本园区' : ''
  const enterpriseName = isEnterprise ? mockEnterprises.find(e => e.id === enterpriseId)?.name || '本公司' : ''

  // ═══ School Dashboard ═════════════════════════════════
  if (isSchool) {
    const schoolTeachers = mockTeachers.filter(t => t.schoolId === schoolId)
    const schoolStudents = mockStudents.filter(s => s.schoolId === schoolId)
    const schoolProjects = schoolProjectsData.filter(p => p.schoolId === schoolId || !p.schoolId)
    const schoolName = mockSchools.find(s => s.id === schoolId)?.name || '本校'
    const completedProjects = schoolProjects.filter(p => p.status === 'completed').length
    const inProgressProjects = schoolProjects.filter(p => p.status === 'in_progress').length
    const totalBudget = schoolProjects.reduce((sum, p) => sum + (p.budget || 0), 0)
    const studentMajors = [...new Set(schoolStudents.map(s => s.major))]
    const studentGrades = schoolStudents.reduce((acc, s) => { acc[s.grade] = (acc[s.grade] || 0) + 1; return acc }, {})
    const teacherTitles = schoolTeachers.reduce((acc, t) => { acc[t.title] = (acc[t.title] || 0) + 1; return acc }, {})
    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>{schoolName}</h2>
          <span style={{ color: '#999', fontSize: 13 }}>学校数据概览</span>
        </div>
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {[
            { title: '教师总数', value: schoolTeachers.length, icon: <UserOutlined />, color: '#1677ff', bg: '#e6f4ff' },
            { title: '学生总数', value: schoolStudents.length, icon: <TeamOutlined />, color: '#52c41a', bg: '#f6ffed' },
            { title: '合作项目', value: schoolProjects.length, icon: <ProjectOutlined />, color: '#722ed1', bg: '#f9f0ff' },
            { title: '共享资源', value: mockResources.length, icon: <ExperimentOutlined />, color: '#eb2f96', bg: '#fff0f6' },
            { title: '项目预算总额', value: `¥${(totalBudget / 10000).toFixed(0)}万`, icon: <FundOutlined />, color: '#fa8c16', bg: '#fff7e6', statStyle: { fontSize: 20 } },
            { title: '进行中项目', value: inProgressProjects, icon: <PieChartOutlined />, color: '#13c2c2', bg: '#e6fffb' },
            { title: '已完成项目', value: completedProjects, icon: <TrophyOutlined />, color: '#389e0d', bg: '#f6ffed' },
            { title: '专业方向', value: studentMajors.length, icon: <BookOutlined />, color: '#cf1322', bg: '#fff1f0' },
          ].map((s, i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card size="small" style={{ background: s.bg, border: 'none', borderRadius: 8 }}>
                <Statistic title={s.title} value={s.value} prefix={s.icon} valueStyle={s.statStyle || { color: s.color }} />
              </Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} lg={8}>
            <Card title="学生年级分布" size="small">
              <Table dataSource={Object.entries(studentGrades).map(([grade, count]) => ({ grade, count }))} columns={[
                { title: '年级', dataIndex: 'grade', key: 'grade', render: (t) => <Tag color="blue">{t}</Tag> },
                { title: '人数', dataIndex: 'count', key: 'count' },
              ]} pagination={false} size="small" rowKey="grade" />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="教师职称分布" size="small">
              <Table dataSource={Object.entries(teacherTitles).map(([title, count]) => ({ title, count }))} columns={[
                { title: '职称', dataIndex: 'title', key: 'title', render: (t) => <Tag color="purple">{t}</Tag> },
                { title: '人数', dataIndex: 'count', key: 'count' },
              ]} pagination={false} size="small" rowKey="title" />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="专业方向" size="small">
              <Table dataSource={studentMajors.map((m, i) => ({ key: i, major: m, count: schoolStudents.filter(s => s.major === m).length }))} columns={[
                { title: '专业', dataIndex: 'major', key: 'major' },
                { title: '人数', dataIndex: 'count', key: 'count' },
              ]} pagination={false} size="small" rowKey="key" />
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card title="合作项目一览" size="small">
              <Table dataSource={schoolProjects} columns={[
                { title: '项目名称', dataIndex: 'name', key: 'name' },
                { title: '合作企业', dataIndex: 'enterpriseName', key: 'enterpriseName', render: (t) => <Tag color="blue">{t}</Tag> },
                { title: '预算', key: 'budget', render: (_, r) => `¥${(r.budget / 10000).toFixed(0)}万` },
                { title: '进度', key: 'progress', width: 120, render: (_, r) => <Progress percent={r.progress} size="small" format={() => r.progress > 0 ? `${r.progress}%` : '-'} /> },
                { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={projectStatusMap[s]?.color}>{projectStatusMap[s]?.text}</Tag> },
              ]} pagination={false} size="small" rowKey="id" />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title="本校教师团队" size="small">
              <Table dataSource={schoolTeachers} columns={[
                { title: '姓名', dataIndex: 'name', key: 'name' },
                { title: '职称', dataIndex: 'title', key: 'title', render: (t) => <Tag color="blue">{t}</Tag> },
                { title: '院系', dataIndex: 'department', key: 'department' },
                { title: '邮箱', dataIndex: 'email', key: 'email', ellipsis: true },
              ]} pagination={false} size="small" rowKey="id" />
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  // ═══ Teacher Dashboard ═════════════════════════════════
  if (role === 'teacher') {
    const teacherId = user?.teacherId
    const teacherName = user?.name || '教师'
    const myProjects = schoolProjectsData.filter(p => p.teacherId === teacherId || p.status === 'pending')
    const myCompleted = myProjects.filter(p => p.status === 'completed').length
    const myInProgress = myProjects.filter(p => p.status === 'in_progress').length
    const myPending = myProjects.filter(p => p.status === 'pending').length
    const myTasks = [
      { id: 1, projectName: '智能仓储管理系统开发', taskName: '后端API开发', student: '李明哲', status: 'submitted', deadline: '2024-09-30' },
      { id: 2, projectName: 'AI质检模型训练', taskName: '数据集标注', student: '孙逸凡', status: 'completed', deadline: '2024-08-30', score: 88 },
      { id: 3, projectName: '智能仓储管理系统开发', taskName: '需求分析', student: '张三', status: 'completed', deadline: '2024-08-15', score: 92 },
    ]
    const pendingEv = myTasks.filter(t => t.status === 'submitted').length
    const myRecs = [
      { id: 1, student: '孙逸凡', position: 'HarmonyOS开发工程师', enterprise: '华为', status: 'pending', date: '2024-07-10' },
      { id: 2, student: '张三', position: 'AI算法工程师', enterprise: '腾讯', status: 'pending', date: '2024-07-12' },
    ]
    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>{teacherName}</h2>
          <span style={{ color: '#999', fontSize: 13 }}>教师工作台</span>
        </div>
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {[
            { title: '我的项目', value: myProjects.length, icon: <ProjectOutlined />, color: '#1677ff', bg: '#e6f4ff' },
            { title: '进行中', value: myInProgress, icon: <PieChartOutlined />, color: '#13c2c2', bg: '#e6fffb' },
            { title: '待审核项目', value: myPending, icon: <SafetyCertificateOutlined />, color: '#fa8c16', bg: '#fff7e6' },
            { title: '已完成项目', value: myCompleted, icon: <TrophyOutlined />, color: '#389e0d', bg: '#f6ffed' },
            { title: '待评价任务', value: pendingEv, icon: <StarOutlined />, color: '#eb2f96', bg: '#fff0f6' },
            { title: '学生推荐', value: myRecs.length, icon: <TeamOutlined />, color: '#722ed1', bg: '#f9f0ff' },
          ].map((s, i) => (
            <Col xs={24} sm={12} lg={8} xl={4} key={i}>
              <Card size="small" style={{ background: s.bg, border: 'none', borderRadius: 8 }}>
                <Statistic title={s.title} value={s.value} prefix={s.icon} valueStyle={{ color: s.color }} />
              </Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card title="项目一览" size="small" extra={<a onClick={() => navigate('/admin/projects')} style={{ fontSize: 12 }}>进入项目管理</a>}>
              <Table dataSource={myProjects} columns={[
                { title: '项目名称', dataIndex: 'name', key: 'name' },
                { title: '企业', dataIndex: 'enterpriseName', key: 'enterpriseName', render: (t) => <Tag color="blue">{t}</Tag> },
                { title: '进度', key: 'progress', width: 120, render: (_, r) => <Progress percent={r.progress} size="small" format={() => r.progress > 0 ? `${r.progress}%` : '-'} /> },
                { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={projectStatusMap[s]?.color}>{projectStatusMap[s]?.text}</Tag> },
              ]} pagination={false} size="small" rowKey="id" />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title="待评审任务" size="small" extra={<a onClick={() => navigate('/admin/projects')} style={{ fontSize: 12 }}>去评审</a>}>
              <Table dataSource={myTasks} columns={[
                { title: '学生', dataIndex: 'student', key: 'student' },
                { title: '任务', dataIndex: 'taskName', key: 'taskName', ellipsis: true },
                { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'submitted' ? 'orange' : 'green'}>{s === 'submitted' ? '待评价' : '已完成'}</Tag> },
                { title: '分数', dataIndex: 'score', key: 'score', render: (v) => v || '-' },
              ]} pagination={false} size="small" rowKey="id" />
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <Card title="学生推荐记录" size="small" extra={<a onClick={() => navigate('/admin/talent')} style={{ fontSize: 12 }}>去人才对接</a>}>
              <Table dataSource={myRecs} columns={[
                { title: '学生', dataIndex: 'student', key: 'student' },
                { title: '岗位', dataIndex: 'position', key: 'position', ellipsis: true },
                { title: '企业', dataIndex: 'enterprise', key: 'enterprise', render: (t) => <Tag color="blue">{t}</Tag> },
                { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color="orange">待处理</Tag> },
              ]} pagination={false} size="small" rowKey="id" />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="快捷入口" size="small">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <Button icon={<ProjectOutlined />} onClick={() => navigate('/admin/projects')}>项目管理</Button>
                <Button icon={<TrophyOutlined />} onClick={() => navigate('/admin/achievements')}>发布成果</Button>
                <Button icon={<DeploymentUnitOutlined />} onClick={() => navigate('/admin/services')}>技术服务</Button>
                <Button icon={<StarOutlined />} onClick={() => navigate('/admin/talent')}>推荐学生</Button>
                <Button icon={<BookOutlined />} onClick={() => navigate('/admin/teaching')}>教学文件</Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  // ═══ General Dashboard ═══════════════════════════════
  const projData = [
    { id: 1, name: '智能仓储管理系统开发', enterprise: '华为技术有限公司', budget: 500000, leader: '张晓蕾', status: 'in_progress', progress: 65 },
    { id: 2, name: 'AI质检模型训练', enterprise: '腾讯科技（深圳）有限公司', budget: 300000, leader: '李教授', status: 'recruiting', progress: 0 },
    { id: 3, name: '5G基站天线优化设计', enterprise: '华为技术有限公司', budget: 800000, leader: '', status: 'pending', progress: 0 },
    { id: 4, name: '工业机器人控制算法', enterprise: '大疆创新科技有限公司', budget: 600000, leader: '陈教授', status: 'in_progress', progress: 40 },
    { id: 5, name: '学生成绩分析平台', enterprise: '腾讯科技（深圳）有限公司', budget: 200000, leader: '', status: 'completed', progress: 100 },
  ]

  const statsCards = isPark ? [
    { title: '园区企业', value: parkEnterprises.length, icon: <GlobalOutlined />, color: '#1677ff', bg: '#e6f4ff' },
    { title: '合作院校', value: mockSchools.length, icon: <BankOutlined />, color: '#52c41a', bg: '#f6ffed' },
    { title: '教师资源', value: mockTeachers.length, icon: <UserOutlined />, color: '#722ed1', bg: '#f9f0ff' },
    { title: '共享资源', value: mockResources.length, icon: <ExperimentOutlined />, color: '#eb2f96', bg: '#fff0f6' },
  ] : isEnterprise ? [
    { title: '发布项目', value: projData.filter(p => p.enterprise === enterpriseName).length, icon: <ProjectOutlined />, color: '#1677ff', bg: '#e6f4ff' },
    { title: '进行中', value: projData.filter(p => p.enterprise === enterpriseName && p.status === 'in_progress').length, icon: <PieChartOutlined />, color: '#13c2c2', bg: '#e6fffb' },
    { title: '合作院校', value: mockSchools.length, icon: <BankOutlined />, color: '#52c41a', bg: '#f6ffed' },
    { title: '在招岗位', value: 3, icon: <NodeIndexOutlined />, color: '#faad14', bg: '#fffbe6' },
    { title: '已匹配学生', value: 8, icon: <TeamOutlined />, color: '#722ed1', bg: '#f9f0ff' },
    { title: '已结项', value: projData.filter(p => p.enterprise === enterpriseName && p.status === 'completed').length, icon: <TrophyOutlined />, color: '#389e0d', bg: '#f6ffed' },
  ] : [
    { title: '园区数量', value: mockParks.length, icon: <ApartmentOutlined />, color: '#1677ff', bg: '#e6f4ff' },
    { title: '院校数量', value: mockSchools.length, icon: <BankOutlined />, color: '#52c41a', bg: '#f6ffed' },
    { title: '企业数量', value: mockEnterprises.length, icon: <GlobalOutlined />, color: '#faad14', bg: '#fffbe6' },
    { title: '教师总数', value: mockTeachers.length, icon: <UserOutlined />, color: '#722ed1', bg: '#f9f0ff' },
    { title: '学生总数', value: mockStudents.length, icon: <TeamOutlined />, color: '#13c2c2', bg: '#e6fffb' },
    { title: '共享资源', value: mockResources.length, icon: <ExperimentOutlined />, color: '#eb2f96', bg: '#fff0f6' },
  ]

  const sm = { pending: { text: '待教师承接', color: 'orange' }, teacher_accepted: { text: '待企业确认', color: 'purple' }, in_progress: { text: '进行中', color: 'processing' }, pending_complete: { text: '待确认结项', color: 'geekblue' }, completed: { text: '已结项', color: 'green' } }

  const latestResources = mockResources.map(r => ({ key: r.id, name: r.name, school: r.publisher, status: r.status, statusText: r.status === 'idle' ? '空闲' : '已租借', dailyPoints: r.dailyPoints }))

  const entAppCount = isEnterprise ? mockApplications.filter(a => a.enterpriseId === enterpriseId).length : 24
  const entApprovedCount = isEnterprise ? mockApplications.filter(a => a.enterpriseId === enterpriseId && a.status === 'approved').length : 8

  // enterprise/mentor: only show resources they applied for
  const displayResources = isEnterprise
    ? latestResources.filter(r => mockApplications.some(a => a.resourceId === r.key && a.enterpriseId === enterpriseId))
    : latestResources

  // enterprise/mentor: only show their own positions
  const entPositionCount = isEnterprise ? 3 : 3

  const latestTraining = mockTrainingQuotas.map(q => ({
    key: q.id, title: q.title, enterprise: q.enterpriseName,
    progress: Math.round((q.completedCount / q.targetCount) * 100),
    completedCount: q.completedCount, targetCount: q.targetCount,
    status: q.status,
    statusText: q.status === 'completed' ? '已完成' : q.status === 'in_progress' ? '进行中' : '待承接',
  }))

  const displayProj = isPark ? projData.filter(p => parkEnterprises.some(e => e.name === p.enterprise)) : isEnterprise ? projData.filter(p => p.enterprise === enterpriseName) : projData
  const displayTraining = isPark ? latestTraining.filter(t => parkEnterprises.some(e => e.name === t.enterprise)) : isEnterprise ? latestTraining.filter(t => t.enterprise === enterpriseName) : latestTraining

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
      {isEnterprise && (
        <div style={{ background: 'linear-gradient(135deg, #e6f4ff, #f0f5ff)', borderRadius: 14, padding: '20px 28px', marginBottom: 20, border: '1px solid #d6e4ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#1677ff', fontSize: 13, fontWeight: 500, marginBottom: 2 }}>企业工作台</div>
            <div style={{ color: '#1a1a1a', fontSize: 22, fontWeight: 700 }}>{enterpriseName} <span style={{ fontSize: 14, fontWeight: 400, color: '#666' }}>— 企业数据概览</span></div>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 700, color: '#1677ff' }}>{displayProj.filter(p => p.status === 'in_progress').length}</div><div style={{ color: '#666', fontSize: 12 }}>进行中</div></div>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 700, color: '#52c41a' }}>{displayProj.length}</div><div style={{ color: '#666', fontSize: 12 }}>总项目</div></div>
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
              <Col span={8}><Card size="small"><Statistic title="在招岗位" value={entPositionCount} prefix={<NodeIndexOutlined />} valueStyle={{ color: '#1677ff' }} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="简历投递" value={entAppCount} prefix={<TeamOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="成功匹配" value={entApprovedCount} prefix={<ProjectOutlined />} valueStyle={{ color: '#722ed1' }} /></Card></Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="最新共享资源" extra={<span style={{ cursor: 'pointer', color: '#1677ff' }} onClick={() => navigate('/admin/resources')}>查看全部</span>}>
            <Table dataSource={displayResources} columns={[
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
      {role !== 'student' && role !== 'mentor' && role !== 'teacher' && role !== 'park' && role !== 'enterprise' && (
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
                {[{rank:1,name:'华为技术有限公司',type:'企业',score:98,value:'12项合作'},{rank:2,name:'石家庄信息工程职业学院',type:'院校',score:92,value:'10项合作'},{rank:3,name:'腾讯科技（深圳）有限公司',type:'企业',score:87,value:'8项合作'}].map(item => (
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

