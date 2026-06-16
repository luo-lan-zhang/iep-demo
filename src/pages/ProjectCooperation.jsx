import { useState, useMemo } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, InputNumber, Select, Tabs, message, Progress, Descriptions, Rate, Slider, Row, Col, Divider, Empty, Tooltip } from 'antd'
import { PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, SendOutlined, StarOutlined, BarChartOutlined, TeamOutlined, ScheduleOutlined } from '@ant-design/icons'
import { mockEnterprises } from '../mock/enterprises'
import { mockTeachers } from '../mock/teachers'
import { mockSchools } from '../mock/schools'
import { mockStudents } from '../mock/students'
import { useAuth } from '../context/AuthContext'

// ─── Five-Dimension Evaluation Config ───────────────────────────────────────
const FIVE_DIMS = [
  { key: 'profession',  label: '职业胜任力', desc: '专业知识掌握程度、岗位技能熟练度', color: '#1677ff' },
  { key: 'innovation',  label: '技术创新力', desc: '技术选型判断、方案创新能力',        color: '#722ed1' },
  { key: 'teamwork',    label: '团队协作力', desc: '沟通协作、任务配合能力',            color: '#13c2c2' },
  { key: 'learning',    label: '终身学习力', desc: '自主学习、跟进新技术的能力',         color: '#52c41a' },
  { key: 'adaptability', label: '职业适应力', desc: '需求理解、抗压与自我调节能力',      color: '#faad14' },
]

// ─── Mock Data ───────────────────────────────────────────────────────────────
const initialProjects = [
  { id: 1, name: '智能仓储管理系统开发', enterpriseId: 1, enterpriseName: '华为', budget: 500000, teacherId: 1, teacherName: '张教授', schoolId: 1, status: 'in_progress', progress: 65, description: '开发一套基于RFID和AGV的智能仓储管理系统', deliverables: '完整的仓储管理系统，包含Web端和移动端', requirements: '有Java/Spring Boot开发经验', tags: ['仓储', 'RFID', 'AGV'], assignedStudents: [1, 2, 3, 7] },
  { id: 2, name: 'AI质检模型训练',     enterpriseId: 2, enterpriseName: '腾讯', budget: 300000, teacherId: 2, teacherName: '李教授', schoolId: 1, status: 'in_progress', progress: 40,  description: '基于深度学习的工业质检模型训练和部署', deliverables: '质检模型、训练数据集', requirements: '熟悉CV、PyTorch', tags: ['AI', 'CV'], assignedStudents: [1, 5, 7] },
  { id: 3, name: '5G基站天线优化设计',   enterpriseId: 1, enterpriseName: '华为', budget: 800000, teacherId: null, teacherName: null, schoolId: null, status: 'pending', progress: 0,  description: '5G基站天线阵列的优化设计', deliverables: '设计方案', requirements: '', tags: ['5G', '天线'], assignedStudents: [] },
  { id: 4, name: '工业机器人控制算法',   enterpriseId: 5, enterpriseName: '大疆', budget: 600000, teacherId: null, teacherName: null, schoolId: 1, status: 'pending_publish', progress: 0,  description: '六轴工业机器人控制算法优化', deliverables: '源码', requirements: '熟悉ROS', tags: ['机器人'], assignedStudents: [] },
  { id: 5, name: '学生成绩分析平台',     enterpriseId: 2, enterpriseName: '腾讯', budget: 200000, teacherId: 1, teacherName: '张教授', schoolId: 1, status: 'completed', progress: 100, description: '在校学生学业成绩分析平台', deliverables: '平台', requirements: '', tags: ['大数据'], assignedStudents: [1, 2, 7] },
]

// Tasks with 五维 evaluation data
const initialTasks = [
  { id: 1, projectId: 1, name: '需求分析', assigneeId: 1, assignee: '张三', deadline: '2024-08-15', status: 'completed', score: 92, comment: '需求文档撰写清晰完整', dims: { profession: 90, innovation: 85, teamwork: 95, learning: 88, adaptability: 92 } },
  { id: 2, projectId: 1, name: '后端API开发', assigneeId: 2, assignee: '李四', deadline: '2024-09-30', status: 'submitted', score: null, comment: '', dims: null },
  { id: 3, projectId: 1, name: '前端界面开发', assigneeId: 3, assignee: '王五', deadline: '2024-10-15', status: 'pending', score: null, comment: '', dims: null },
  { id: 4, projectId: 1, name: 'AGV调度算法', assigneeId: 4, assignee: '赵六', deadline: '2024-09-01', status: 'in_progress', score: null, comment: '', dims: null },
  { id: 5, projectId: 2, name: '数据集标注', assigneeId: 5, assignee: '孙七', deadline: '2024-08-30', status: 'completed', score: 88, comment: '数据质量很高', dims: { profession: 85, innovation: 75, teamwork: 90, learning: 80, adaptability: 85 } },
  { id: 6, projectId: 2, name: '模型训练调优', assigneeId: 6, assignee: '周八', deadline: '2024-10-01', status: 'in_progress', score: null, comment: '', dims: null },
  { id: 7, projectId: 5, name: '数据采集模块', assigneeId: 1, assignee: '张三', deadline: '2024-06-01', status: 'completed', score: 95, comment: '主动完成，质量优秀', dims: { profession: 95, innovation: 90, teamwork: 95, learning: 92, adaptability: 90 } },
]

const statusMap = {
  pending:          { text: '待教师审核',   color: 'orange' },
  teacher_approved: { text: '待学校审核',   color: 'purple' },
  pending_publish:  { text: '待发布',       color: 'geekblue' },
  in_progress:      { text: '进行中',       color: 'processing' },
  completed:        { text: '已结项',       color: 'green' },
}

const taskStatusMap = {
  pending:      { text: '待开始',   color: 'default' },
  in_progress:  { text: '进行中',   color: 'processing' },
  submitted:    { text: '待评价',   color: 'orange' },
  completed:    { text: '已完成',   color: 'green' },
}

export default function ProjectCooperation() {
  const { user, hasPermission } = useAuth()
  const [projects, setProjects] = useState(initialProjects)
  const [tasks, setTasks] = useState(initialTasks)
  const [filterStatus, setFilterStatus] = useState('all')

  // Modals
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishForm] = Form.useForm()
  const [auditOpen, setAuditOpen] = useState(false)
  const [auditProject, setAuditProject] = useState(null)
  const [auditStep, setAuditStep] = useState('teacher')
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false)
  const [publishConfirmProject, setPublishConfirmProject] = useState(null)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [taskOpen, setTaskOpen] = useState(false)
  const [taskForm] = Form.useForm()
  const [taskProjectId, setTaskProjectId] = useState(null)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [submitTask, setSubmitTask] = useState(null)
  const [submitForm] = Form.useForm()
  const [evaluateOpen, setEvaluateOpen] = useState(false)
  const [evaluateTask, setEvaluateTask] = useState(null)
  const [evaluateForm] = Form.useForm()
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailProject, setDetailProject] = useState(null)
  const [dimScores, setDimScores] = useState({ profession: 80, innovation: 75, teamwork: 80, learning: 75, adaptability: 75 })
  const [studentAccepted, setStudentAccepted] = useState(() => {
    const saved = localStorage.getItem('student_accepted')
    return saved ? JSON.parse(saved) : []
  })

  const role = user?.role || 'council'
  const enterpriseId = user?.enterpriseId
  const teacherId = user?.teacherId
  const schoolId = user?.schoolId
  const studentId = user?.id || 7

  // ─── Filtered ─────────────────────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    let list = projects
    if (role === 'enterprise') list = list.filter(p => p.enterpriseId === enterpriseId)
    if (role === 'teacher') list = list.filter(p => p.teacherId === teacherId || p.status === 'pending' || p.status === 'pending_publish')
    if (role === 'school') list = list.filter(p => p.schoolId === schoolId || !p.schoolId)
    if (role === 'student') return []  // 学生不能查看项目列表
    if (filterStatus !== 'all') list = list.filter(p => p.status === filterStatus)
    return list
  }, [projects, role, enterpriseId, teacherId, schoolId, filterStatus])

  const visibleTasks = useMemo(() => {
    if (role === 'student') return tasks.filter(t => t.assigneeId === user?.id)
    if (role === 'teacher' && teacherId) {
      const tIds = projects.filter(p => p.teacherId === teacherId).map(p => p.id)
      return tasks.filter(t => tIds.includes(t.projectId))
    }
    return tasks
  }, [role, tasks, user, teacherId, projects])

  // Gantt Chart
  const [ganttOpen, setGanttOpen] = useState(false)
  const [ganttProject, setGanttProject] = useState(null)
  const [teamOpen, setTeamOpen] = useState(false)
  const [teamProject, setTeamProject] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])

  const handleAddTeamMember = (studentIds) => {
    if (!teamProject) return
    setProjects(projects.map(p =>
      p.id === teamProject.id ? { ...p, assignedStudents: [...new Set([...(p.assignedStudents||[]), ...studentIds])] } : p
    ))
    message.success(`已将 ${studentIds.length} 名学生加入项目团队`)
    setTeamOpen(false); setTeamProject(null)
  }

  // Gantt chart: compute task positions
  const getGanttData = (projectId) => {
    const projTasks = tasks.filter(t => t.projectId === projectId)
    if (projTasks.length === 0) return { tasks: [], weeks: 0, startDate: '' }
    const startDates = projTasks.map(t => {
      const d = new Date(t.deadline)
      return isNaN(d.getTime()) ? new Date() : d
    })
    const minDate = new Date(Math.min(...startDates))
    const maxDate = new Date(Math.max(...startDates))
    const weekDiff = Math.max(4, Math.ceil((maxDate - minDate) / (7 * 24 * 60 * 60 * 1000)) + 2)
    return { tasks: projTasks, weeks: weekDiff, startDate: minDate.toISOString().split('T')[0], minDate }
  }
  const handlePublish = () => {
    publishForm.validateFields().then(v => {
      const ent = mockEnterprises.find(e => e.id === v.enterpriseId)
      setProjects([{
        id: projects.length + 1, ...v, enterpriseName: ent?.name || '未知',
        teacherId: null, teacherName: null, schoolId: null,
        status: 'pending', progress: 0,
        tags: v.tags ? v.tags.split(',').map(t => t.trim()) : [],
      }, ...projects])
      message.success('项目已发布，等待教师审核！')
      setPublishOpen(false); publishForm.resetFields()
    })
  }

  const handleTeacherAudit = (action) => {
    if (action === 'approve') {
      setProjects(projects.map(p =>
        p.id === auditProject.id ? { ...p, status: 'teacher_approved', teacherId, teacherName: user?.name, schoolId: schoolId || 1 } : p
      ))
      setAuditStep('school')
    } else {
      setProjects(projects.map(p => p.id === auditProject.id ? { ...p, status: 'completed' } : p))
      message.success('已拒绝该项目')
      setAuditOpen(false); setAuditProject(null); setAuditStep('teacher')
    }
  }

  const handleSchoolAudit = (action) => {
    if (action === 'approve') {
      setProjects(projects.map(p => p.id === auditProject.id ? { ...p, status: 'pending_publish' } : p))
      message.success('学校审核通过，教师可发布给学生')
    } else {
      setProjects(projects.map(p => p.id === auditProject.id ? { ...p, status: 'pending' } : p))
      message.success('学校驳回，退回')
    }
    setAuditOpen(false); setAuditProject(null); setAuditStep('teacher')
  }

  const handlePublishToStudents = () => {
    if (selectedStudents.length === 0) {
      message.warning('请至少选择一个学生')
      return
    }
    setProjects(projects.map(p =>
      p.id === publishConfirmProject.id ? { ...p, status: 'in_progress', progress: 5, assignedStudents: selectedStudents } : p
    ))
    message.success(`项目已下发给 ${selectedStudents.length} 名学生，可在任务分配中分发具体模块`)
    setPublishConfirmOpen(false); setPublishConfirmProject(null); setSelectedStudents([])
  }

  const handleStudentAccept = (projectId) => {
    const key = `${studentId}_${projectId}`
    const updated = [...studentAccepted, key]
    setStudentAccepted(updated)
    localStorage.setItem('student_accepted', JSON.stringify(updated))
    message.success('已确认接收该项目')
  }

  const handleCreateTask = () => {
    taskForm.validateFields().then(v => {
      const student = mockStudents.find(s => s.id === v.assigneeId)
      setTasks([...tasks, {
        id: tasks.length + 1, projectId: taskProjectId, name: v.name,
        assigneeId: v.assigneeId, assignee: student?.name || '未知',
        deadline: v.deadline, status: 'pending', score: null, comment: '', dims: null,
      }])
      message.success(`任务已下发给 ${student?.name}`)
      setTaskOpen(false); taskForm.resetFields(); setTaskProjectId(null)
    })
  }

  const handleSubmit = () => {
    submitForm.validateFields().then(v => {
      setTasks(tasks.map(t => t.id === submitTask.id ? { ...t, status: 'submitted', submitNote: v.note } : t))
      message.success('成果已提交，等待教师评价！')
      setSubmitOpen(false); setSubmitTask(null); submitForm.resetFields()
    })
  }

  // 五维评价 + 综合评分
  const handleEvaluate = () => {
    evaluateForm.validateFields().then(v => {
      const avgScore = Math.round(
        (dimScores.profession + dimScores.innovation + dimScores.teamwork +
         dimScores.learning + dimScores.adaptability) / 5
      )
      setTasks(tasks.map(t =>
        t.id === evaluateTask.id ? {
          ...t, status: 'completed', score: avgScore,
          comment: v.comment, dims: { ...dimScores }
        } : t
      ))
      message.success(`✅ ${evaluateTask.assignee} — 五维均分 ${avgScore} 分，评价完成！`)

      // 保存评价到学生简历（localStorage持久化）
      const studentId = evaluateTask.assigneeId
      // 更新五维均分（取最新评价）
      const evalData = { dims: { ...dimScores }, avgScore, comment: v.comment, taskName: evaluateTask.name, projectName: projects.find(p => p.id === evaluateTask.projectId)?.name, date: new Date().toISOString().split('T')[0] }
      localStorage.setItem(`student_eval_${studentId}`, JSON.stringify(evalData))
      // 保存评价历史
      const history = JSON.parse(localStorage.getItem(`student_eval_history_${studentId}`) || '[]')
      history.push(evalData)
      localStorage.setItem(`student_eval_history_${studentId}`, JSON.stringify(history))

      setEvaluateOpen(false); setEvaluateTask(null); evaluateForm.resetFields()
      setDimScores({ profession: 80, innovation: 75, teamwork: 80, learning: 75, adaptability: 75 })

      // Update project progress
      const projTasks = tasks.filter(t => t.projectId === evaluateTask.projectId)
      const completed = projTasks.filter(t => t.status === 'completed' || (t.id === evaluateTask.id)).length
      const total = projTasks.length
      const p = projects.find(pj => pj.id === evaluateTask.projectId)
      if (p && p.status === 'in_progress') {
        const newProgress = Math.min(100, Math.round((completed / total) * 100))
        setProjects(projects.map(pj => pj.id === evaluateTask.projectId ? { ...pj, progress: newProgress } : pj))
        if (newProgress >= 100) message.success('🎉 项目所有任务已完成！')
      }
    })
  }

  // ─── Columns ────────────────────────────────────────────────────────────
  const projectColumns = [
    { title: '项目名称', dataIndex: 'name', key: 'name', render: (t, r) => <a onClick={() => { setDetailProject(r); setDetailOpen(true) }}>{t}</a> },
    { title: '企业', dataIndex: 'enterpriseName', key: 'enterpriseName', render: (t) => <Tag color="blue">{t}</Tag> },
    { title: '预算', dataIndex: 'budget', key: 'budget', render: (v) => `¥${(v/10000).toFixed(1)}万` },
    { title: '负责教师', dataIndex: 'teacherName', key: 'teacherName', render: (v) => v || <Tag color="default">待指定</Tag> },
    { title: '进度', key: 'progress', render: (_, r) => <Progress percent={r.progress} size="small" format={() => r.progress > 0 ? `${r.progress}%` : '-'} /> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag> },
    {
      title: '操作', key: 'action', width: 250, render: (_, r) => {
        const acts = []
        if (r.status === 'pending' && role === 'teacher') acts.push(<Button key="ta" size="small" type="primary" onClick={() => { setAuditProject(r); setAuditStep('teacher'); setAuditOpen(true) }}>教师审核</Button>)
        if (r.status === 'teacher_approved' && role === 'school') acts.push(<Button key="sa" size="small" type="primary" onClick={() => { setAuditProject(r); setAuditStep('school'); setAuditOpen(true) }}>学校审核</Button>)
        if (r.status === 'pending_publish' && r.teacherId === teacherId) acts.push(<Button key="pp" size="small" type="primary" onClick={() => { setPublishConfirmProject(r); setPublishConfirmOpen(true) }}>下发项目</Button>)
        if (r.status === 'in_progress' && r.teacherId === teacherId) {
          acts.push(<Button key="at" size="small" onClick={() => { setTaskProjectId(r.id); taskForm.resetFields(); setTaskOpen(true) }}>分配任务</Button>)
          acts.push(<Button key="tm" size="small" icon={<TeamOutlined />} onClick={() => { setTeamProject(r); setTeamMembers(r.assignedStudents || []); setTeamOpen(true) }}>团队</Button>)
          acts.push(<Button key="gt" size="small" icon={<ScheduleOutlined />} onClick={() => { setGanttProject(r); setGanttOpen(true) }}>甘特图</Button>)
        }
        if (acts.length === 0) acts.push(<span key="-" style={{ color: '#999' }}>-</span>)
        return <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{acts}</span>
      }
    },
  ]

  const taskColumns = [
    { title: '任务名称', dataIndex: 'name', key: 'name' },
    { title: '所属项目', key: 'pn', render: (_, r) => projects.find(p => p.id === r.projectId)?.name || '-' },
    { title: '负责人', dataIndex: 'assignee', key: 'assignee' },
    { title: '截止日期', dataIndex: 'deadline', key: 'deadline' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={taskStatusMap[s]?.color}>{taskStatusMap[s]?.text}</Tag> },
    {
      title: '五维均分', dataIndex: 'score', key: 'score', render: (s, r) => {
        if (!s) return '-'
        return (
          <Tooltip title={
            <div>
              {FIVE_DIMS.map(d => (
                <div key={d.key} style={{ marginBottom: 2 }}>
                  {d.label}: {r.dims?.[d.key] || 0}分
                </div>
              ))}
              <Divider style={{ margin: '4px 0', borderColor: 'rgba(255,255,255,0.2)' }} />
              <div style={{ fontWeight: 'bold' }}>综合: {s}分</div>
            </div>
          }>
            <span style={{ cursor: 'pointer' }}>
              <Rate disabled value={Math.round(s/20)} allowHalf />
              <span style={{ fontSize: 12, color: '#999', marginLeft: 4 }}>{s}分</span>
            </span>
          </Tooltip>
        )
      }
    },
    {
      title: '操作', key: 'action', width: 160, render: (_, r) => {
        if (r.assigneeId === studentId && (r.status === 'pending' || r.status === 'in_progress')) {
          if (role === 'student') return <Button size="small" type="primary" icon={<SendOutlined />} onClick={() => { setSubmitTask(r); submitForm.resetFields(); setSubmitOpen(true) }}>提交成果</Button>
          if (role === 'teacher') return <Button size="small" onClick={() => { setTaskProjectId(r.projectId); taskForm.resetFields(); setTaskOpen(true) }}>编辑</Button>
        }
        if (r.status === 'submitted' && role === 'teacher') {
          return <Button size="small" type="primary" icon={<StarOutlined />} onClick={() => { setEvaluateTask(r); evaluateForm.resetFields(); setDimScores({ profession: 80, innovation: 75, teamwork: 80, learning: 75, adaptability: 75 }); setEvaluateOpen(true) }}>五维评价</Button>
        }
        return <span style={{ color: '#999' }}>-</span>
      }
    },
  ]

  // Student task columns — simpler view
  const studentTaskColumns = [
    { title: '任务名称', dataIndex: 'name', key: 'name' },
    { title: '所属项目', key: 'pn', render: (_, r) => projects.find(p => p.id === r.projectId)?.name || '-' },
    { title: '截止日期', dataIndex: 'deadline', key: 'deadline' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={taskStatusMap[s]?.color}>{taskStatusMap[s]?.text}</Tag> },
    {
      title: '五维评价', key: 'dims', render: (_, r) => {
        if (!r.dims) return <span style={{ color: '#ccc' }}>待评价</span>
        const avg = r.score
        return (
          <Tooltip title={
            <div style={{ width: 200 }}>
              {FIVE_DIMS.map(d => (
                <div key={d.key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span>{d.label}</span>
                  <span style={{ color: d.color, fontWeight: 'bold' }}>{r.dims?.[d.key] || 0}</span>
                </div>
              ))}
              <Divider style={{ margin: '4px 0', borderColor: 'rgba(255,255,255,0.2)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>综合评分</span>
                <span style={{ color: '#ffd700' }}>{avg}分</span>
              </div>
            </div>
          }>
            <span style={{ cursor: 'pointer', color: '#1677ff' }}>
              <BarChartOutlined /> {avg}分
            </span>
          </Tooltip>
        )
      }
    },
    {
      title: '评语', dataIndex: 'comment', key: 'comment', render: (c) => c || <span style={{ color: '#ccc' }}>-</span>,
    },
    {
      title: '操作', key: 'action', render: (_, r) => {
        if (r.status === 'pending' || r.status === 'in_progress') {
          return <Button size="small" type="primary" icon={<SendOutlined />} onClick={() => { setSubmitTask(r); submitForm.resetFields(); setSubmitOpen(true) }}>提交成果</Button>
        }
        if (r.status === 'submitted') return <Tag color="orange">等待评价</Tag>
        return <span style={{ color: '#999' }}>-</span>
      }
    },
  ]

  // ─── Tab Items ──────────────────────────────────────────────────────────
  const tabItems = useMemo(() => {
    const items = []

    // 学生：我的项目（可接收+看详情）+ 我的任务
    if (role === 'student') {
      const myProjects = projects.filter(p => p.assignedStudents?.includes(studentId))
      items.push({
        key: 'projects', label: '我的项目', children: (
          <div>
            {myProjects.length === 0 ? (
              <Empty description="暂无教师下发的项目" />
            ) : (
              <Table dataSource={myProjects} columns={[
                { title: '项目名称', dataIndex: 'name', key: 'name', render: (t, r) => <a onClick={() => { setDetailProject(r); setDetailOpen(true) }}>{t}</a> },
                { title: '企业', dataIndex: 'enterpriseName', key: 'enterpriseName', render: (t) => <Tag color="blue">{t}</Tag> },
                { title: '负责教师', dataIndex: 'teacherName', key: 'teacherName' },
                { title: '进度', key: 'progress', render: (_, r) => <Progress percent={r.progress} size="small" /> },
                { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag> },
                { title: '接收状态', key: 'accept', render: (_, r) => {
                  const key = `${studentId}_${r.id}`
                  if (studentAccepted.includes(key)) return <Tag color="green">已接收</Tag>
                  return <Tag color="orange">待接收</Tag>
                }},
                { title: '操作', key: 'action', render: (_, r) => {
                  const key = `${studentId}_${r.id}`
                  if (!studentAccepted.includes(key)) {
                    return <Button size="small" type="primary" onClick={() => handleStudentAccept(r.id)}>接收项目</Button>
                  }
                  return <Button size="small" onClick={() => { setDetailProject(r); setDetailOpen(true) }}>查看详情</Button>
                }},
              ]} rowKey="id" pagination={false} size="small" />
            )}
          </div>
        )
      })
      items.push({
        key: 'tasks', label: '我的任务', children: (
          <div>
            <div style={{ marginBottom: 12, color: '#666' }}>教师下发的具体任务模块，请按时完成并提交成果。</div>
            {visibleTasks.length === 0 ? <Empty description="暂无任务分配" /> : (
              <Table dataSource={visibleTasks} columns={studentTaskColumns} rowKey="id" />
            )}
          </div>
        )
      })
      return items
    }

    // 非学生角色：项目列表
    items.push({
      key: 'list', label: '项目列表', children: (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 160 }}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'pending', label: '待教师审核' },
                { value: 'teacher_approved', label: '待学校审核' },
                { value: 'pending_publish', label: '待发布' },
                { value: 'in_progress', label: '进行中' },
                { value: 'completed', label: '已结项' },
              ]}
            />
            {(role === 'enterprise' || role === 'council') && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { publishForm.resetFields(); setPublishOpen(true) }}>发布新项目</Button>
            )}
          </div>
          {filteredProjects.length === 0 ? (
            <Empty description="暂无项目" />
          ) : (
            <Table dataSource={filteredProjects} columns={projectColumns} rowKey="id" />
          )}
        </div>
      )
    })

    if (role === 'enterprise' || role === 'council') {
      items.push({
        key: 'publish', label: '发布项目', children: (
          <div style={{ maxWidth: 500 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { publishForm.resetFields(); setPublishOpen(true) }}>发布新项目</Button>
            <div style={{ marginTop: 16, color: '#666' }}>企业发布 → 教师审核 → 学校复审 → 教师下发 → 分配任务 → 学生执行 → 五维评价</div>
          </div>
        )
      })
    }

    // 任务分配/管理
    items.push({
      key: 'tasks', label: '任务分配', children: (
        <div>
          {role === 'teacher' && (
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                const act = projects.filter(p => p.teacherId === teacherId && p.status === 'in_progress')
                if (act.length === 0) { message.warning('没有进行中的项目'); return }
                setTaskProjectId(act[0].id); taskForm.resetFields(); setTaskOpen(true)
              }}>下发任务给学生</Button>
              <span style={{ marginLeft: 12, color: '#666' }}>将项目任务/模块下发给具体学生执行</span>
            </div>
          )}
          <Table dataSource={visibleTasks} columns={taskColumns} rowKey="id" />
        </div>
      )
    })

    return items
  }, [filteredProjects, projectColumns, taskColumns, studentTaskColumns, filterStatus, role, teacherId, visibleTasks])

  return (
    <Card title="项目合作管理">
      <Tabs items={tabItems} />

      {/* 发布项目 */}
      <Modal title="发布新项目" open={publishOpen} onOk={handlePublish} onCancel={() => { setPublishOpen(false); publishForm.resetFields() }} width={640}>
        <Form form={publishForm} layout="vertical">
          <Form.Item name="enterpriseId" label="企业" rules={[{ required: true }]}>
            <Select options={mockEnterprises.map(e => ({ value: e.id, label: e.name }))} />
          </Form.Item>
          <Form.Item name="name" label="项目名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="项目描述"><Input.TextArea rows={4} /></Form.Item>
          <Form.Item name="budget" label="拟投入金额(元)" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="deliverables" label="交付物要求"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="requirements" label="技术要求"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="tags" label="标签"><Input placeholder="用逗号分隔" /></Form.Item>
        </Form>
      </Modal>

      {/* 审核 */}
      <Modal title={auditStep === 'teacher' ? '教师初审' : '学校复审'} open={auditOpen} onCancel={() => { setAuditOpen(false); setAuditProject(null); setAuditStep('teacher') }} footer={null} width={520}>
        {auditProject && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Tag color="blue">{auditProject.enterpriseName}</Tag>
              <span style={{ fontSize: 16, fontWeight: 500, marginLeft: 8 }}>{auditProject.name}</span>
            </div>
            {auditStep === 'teacher' && <div style={{ background: '#f0f5ff', padding: 12, borderRadius: 6, marginBottom: 16 }}><strong>教师初审：</strong>确认学校有能力承接，项目内容合理。</div>}
            {auditStep === 'school' && <div style={{ background: '#f6ffed', padding: 12, borderRadius: 6, marginBottom: 16 }}><strong>学校复审：</strong>确认符合教学规划，可下发给学生执行。</div>}
            <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="项目描述">{auditProject.description}</Descriptions.Item>
              <Descriptions.Item label="预算">¥{auditProject.budget.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="交付物">{auditProject.deliverables || '无'}</Descriptions.Item>
            </Descriptions>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => auditStep === 'teacher' ? handleTeacherAudit('approve') : handleSchoolAudit('approve')} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                {auditStep === 'teacher' ? '通过（待学校审核）' : '通过'}
              </Button>
              <Button danger icon={<CloseCircleOutlined />} onClick={() => auditStep === 'teacher' ? handleTeacherAudit('reject') : handleSchoolAudit('reject')}>驳回</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 下发项目确认 - 选择学生 */}
      <Modal title="下发项目给学生" open={publishConfirmOpen} onOk={handlePublishToStudents} onCancel={() => { setPublishConfirmOpen(false); setPublishConfirmProject(null); setSelectedStudents([]) }} width={520}>
        {publishConfirmProject && (
          <div>
            <p>项目：<strong>{publishConfirmProject.name}</strong></p>
            <p style={{ color: '#666', marginBottom: 16 }}>选择要下发此项目的学生（选中的学生可在首页看到此项目）</p>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="请选择学生"
              value={selectedStudents}
              onChange={setSelectedStudents}
              options={mockStudents.map(s => ({ value: s.id, label: `${s.name} (${s.major})` }))}
            />
          </div>
        )}
      </Modal>

      {/* 分配任务 */}
      <Modal title="分配任务给学生" open={taskOpen} onOk={handleCreateTask} onCancel={() => { setTaskOpen(false); taskForm.resetFields(); setTaskProjectId(null) }}>
        <Form form={taskForm} layout="vertical">
          <Form.Item name="projectId" label="所属项目" rules={[{ required: true }]}>
            <Select options={projects.filter(p => p.teacherId === teacherId && p.status === 'in_progress').map(p => ({ value: p.id, label: p.name }))}
              onChange={v => setTaskProjectId(v)} />
          </Form.Item>
          <Form.Item name="name" label="模块/任务名称" rules={[{ required: true }]}><Input placeholder="例如: 数据库设计" /></Form.Item>
          <Form.Item name="assigneeId" label="下发给学生" rules={[{ required: true }]}>
            <Select options={mockStudents.map(s => ({ value: s.id, label: `${s.name} (${s.major})` }))} />
          </Form.Item>
          <Form.Item name="deadline" label="截止日期" rules={[{ required: true }]}><Input placeholder="例如: 2024-12-31" /></Form.Item>
        </Form>
      </Modal>

      {/* 学生提交 */}
      <Modal title="提交成果" open={submitOpen} onOk={handleSubmit} onCancel={() => { setSubmitOpen(false); setSubmitTask(null); submitForm.resetFields() }}>
        {submitTask && <p>任务：<strong>{submitTask.name}</strong></p>}
        <Form form={submitForm} layout="vertical">
          <Form.Item name="note" label="提交说明" rules={[{ required: true }]}><Input.TextArea rows={4} placeholder="描述完成的内容、方法和关键成果" /></Form.Item>
          <Form.Item name="file" label="附件链接"><Input placeholder="代码仓库/文档链接（模拟）" /></Form.Item>
        </Form>
      </Modal>

      {/* ─── 五维评价 Modal ────────────────────────────────────────── */}
      <Modal title={<span><StarOutlined /> 五维评价 — {evaluateTask?.assignee}</span>}
        open={evaluateOpen} onOk={handleEvaluate}
        onCancel={() => { setEvaluateOpen(false); setEvaluateTask(null); evaluateForm.resetFields() }}
        width={640} okText="提交评价">
        {evaluateTask && (
          <div>
            <p style={{ marginBottom: 16 }}>
              任务：<strong>{evaluateTask.name}</strong>
              {evaluateTask.submitNote && (
                <div style={{ background: '#fafafa', padding: 12, borderRadius: 6, marginTop: 8 }}>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>学生提交说明：</div>
                  <div style={{ color: '#666' }}>{evaluateTask.submitNote}</div>
                </div>
              )}
            </p>

            <Divider orientation="left" style={{ fontSize: 14, fontWeight: 500 }}>五维能力评价</Divider>
            <div style={{ padding: '0 8px' }}>
              {FIVE_DIMS.map(d => (
                <div key={d.key} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, color: d.color }}>{d.label}</span>
                    <span style={{ color: '#666', fontSize: 13 }}>{dimScores[d.key]}分</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>{d.desc}</div>
                  <Slider
                    min={0} max={100} step={1}
                    value={dimScores[d.key]}
                    onChange={v => setDimScores(prev => ({ ...prev, [d.key]: v }))}
                    trackStyle={{ backgroundColor: d.color }}
                    handleStyle={{ borderColor: d.color }}
                  />
                </div>
              ))}
            </div>

            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, background: '#f0f5ff', padding: '12px 16px', borderRadius: 8 }}>
              <span style={{ fontWeight: 500 }}>五维综合评分</span>
              <span style={{ fontSize: 28, fontWeight: 'bold', color: '#faad14' }}>
                {Math.round(
                  (dimScores.profession + dimScores.innovation + dimScores.teamwork +
                   dimScores.learning + dimScores.adaptability) / 5
                )}
                <span style={{ fontSize: 14, color: '#999' }}> 分</span>
              </span>
            </div>

            <Form form={evaluateForm} layout="vertical">
              <Form.Item name="comment" label="评语" rules={[{ required: true }]}>
                <Input.TextArea rows={3} placeholder="请对学生的整体表现进行评价" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* 甘特图 */}
      <Modal title={<span><ScheduleOutlined /> 项目甘特图 — {ganttProject?.name}</span>}
        open={ganttOpen} onCancel={() => setGanttOpen(false)} footer={null} width={900}>
        {ganttProject && (() => {
          const gData = getGanttData(ganttProject.id)
          if (gData.tasks.length === 0) return <Empty description="暂无任务数据" />
          const statusColors = { pending: '#d9d9d9', in_progress: '#1677ff', submitted: '#faad14', completed: '#52c41a' }
          const weekMs = 7 * 24 * 60 * 60 * 1000
          return (
            <div>
              <p style={{ color: '#666', marginBottom: 16 }}>任务时间线（甘特图），按截止日期排列</p>
              <div style={{ overflowX: 'auto', position: 'relative' }}>
                <div style={{ display: 'flex', marginBottom: 8, fontSize: 12, color: '#999', paddingLeft: 180 }}>
                  {Array.from({ length: gData.weeks }, (_, i) => (
                    <div key={i} style={{ width: 60, minWidth: 60, textAlign: 'center', borderLeft: '1px solid #f0f0f0' }}>
                      W{i + 1}
                    </div>
                  ))}
                </div>
                {gData.tasks.map(t => {
                  const taskStart = new Date(t.deadline)
                  const daysFromStart = Math.max(0, Math.floor((taskStart - gData.minDate) / (24 * 60 * 60 * 1000)))
                  const weekPos = Math.floor(daysFromStart / 7)
                  const taskWeeks = 1.5
                  return (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 6, height: 32 }}>
                      <div style={{ width: 180, minWidth: 180, fontSize: 13, paddingRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Tag color={statusColors[t.status]} style={{ fontSize: 10, marginRight: 4 }}>{t.assignee}</Tag>
                        {t.name}
                      </div>
                      <div style={{ position: 'relative', flex: 1, display: 'flex' }}>
                        {Array.from({ length: gData.weeks }, (_, i) => (
                          <div key={i} style={{ width: 60, minWidth: 60, borderLeft: '1px solid #f5f5f5', height: 24 }} />
                        ))}
                        <div style={{
                          position: 'absolute', top: 2, left: weekPos * 60, width: 60 * taskWeeks, height: 20,
                          background: statusColors[t.status], borderRadius: 4, opacity: 0.8,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, color: '#fff'
                        }}>
                          {t.status === 'completed' ? '✓' : t.status === 'in_progress' ? '▶' : '○'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}
      </Modal>

      {/* 团队管理 */}
      <Modal title={<span><TeamOutlined /> 项目团队 — {teamProject?.name}</span>}
        open={teamOpen} onOk={() => handleAddTeamMember(teamMembers)} onCancel={() => { setTeamOpen(false); setTeamProject(null); setTeamMembers([]) }}
        okText="确认添加" width={520}>
        {teamProject && (
          <div>
            <p style={{ color: '#666', marginBottom: 16 }}>选择需要加入此项目的学生：</p>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="选择学生加入团队"
              value={teamMembers}
              onChange={setTeamMembers}
              options={mockStudents.map(s => ({ value: s.id, label: `${s.name} (${s.major})` }))}
            />
            <div style={{ marginTop: 16, padding: 12, background: '#fafafa', borderRadius: 6 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>当前团队成员：</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(teamProject.assignedStudents || []).map(sid => {
                  const stu = mockStudents.find(s => s.id === sid)
                  return stu ? <Tag key={sid} color="blue">{stu.name}</Tag> : null
                })}
                <Tag><TeamOutlined /> 共{(teamProject.assignedStudents || []).length}人</Tag>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 详情 */}
      <Modal title="项目详情" open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={640}>
        {detailProject && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="项目名称">{detailProject.name}</Descriptions.Item>
            <Descriptions.Item label="发布企业">{detailProject.enterpriseName}</Descriptions.Item>
            <Descriptions.Item label="预算">¥{detailProject.budget.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="负责教师">{detailProject.teacherName || '待指定'}</Descriptions.Item>
            <Descriptions.Item label="项目描述">{detailProject.description}</Descriptions.Item>
            <Descriptions.Item label="交付物要求">{detailProject.deliverables || '无'}</Descriptions.Item>
            <Descriptions.Item label="进度"><Progress percent={detailProject.progress} /></Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={statusMap[detailProject.status]?.color}>{statusMap[detailProject.status]?.text}</Tag></Descriptions.Item>
            <Descriptions.Item label="标签">{detailProject.tags?.map(t => <Tag key={t}>{t}</Tag>) || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  )
}
