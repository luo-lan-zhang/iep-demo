import { useState, useMemo } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, InputNumber, Select, Tabs, message, Progress, Descriptions, Rate, Slider, Row, Col, Divider, Empty, Tooltip } from 'antd'
import { PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, SendOutlined, StarOutlined, BarChartOutlined, TeamOutlined, ScheduleOutlined, EyeOutlined } from '@ant-design/icons'
import { mockEnterprises } from '../mock/enterprises'
import { mockTeachers } from '../mock/teachers'
import { mockSchools } from '../mock/schools'
import { mockStudents } from '../mock/students'
import { mockMentors } from '../mock/mentors'
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
  { id: 1, name: '物联网固件AI污点检测与POC智能协同验证系统', enterpriseId: 1, enterpriseName: '华为', budget: 500000, teacherId: 1, teacherName: '张教授', schoolId: 1, status: 'in_progress', progress: 65, description: '物联网固件AI污点检测与POC智能协同验证', deliverables: '污点检测系统', requirements: 'AI、物联网安全', tags: ['AI', '物联网'], assignedStudents: [1, 2, 3, 7] },
  { id: 2, name: '矿用无线张力油压监测系统', enterpriseId: 2, enterpriseName: '腾讯', budget: 286000, teacherId: 1, teacherName: '张教授', schoolId: 1, status: 'in_progress', progress: 90, description: '矿用无线张力油压监测系统开发', deliverables: '监测系统', requirements: '无线传感、矿山', tags: ['矿山', '无线'], assignedStudents: [5, 6, 7] },
  { id: 3, name: '5G基站天线优化设计', enterpriseId: 1, enterpriseName: '华为', budget: 800000, teacherId: null, teacherName: null, schoolId: null, status: 'pending', progress: 0, description: '5G基站天线阵列的优化设计', deliverables: '设计方案', requirements: '', tags: ['5G', '天线'], assignedStudents: [] },
  { id: 4, name: '工业机器人控制算法', enterpriseId: 1, enterpriseName: '华为', budget: 600000, teacherId: 6, teacherName: '陈教授', schoolId: 1, status: 'teacher_accepted', progress: 5, description: '六轴工业机器人控制算法优化', deliverables: '源码', requirements: '熟悉ROS', tags: ['机器人'], assignedStudents: [4] },
  { id: 5, name: '学生成绩分析平台', enterpriseId: 2, enterpriseName: '腾讯', budget: 200000, teacherId: 1, teacherName: '张教授', schoolId: 1, status: 'completed', progress: 100, description: '在校学生学业成绩分析平台', deliverables: '平台', requirements: '', tags: ['大数据'], assignedStudents: [1, 2, 7] },
  { id: 6, name: '自动驾驶感知算法优化', enterpriseId: 1, enterpriseName: '华为', budget: 400000, teacherId: 1, teacherName: '张教授', schoolId: 1, status: 'pending_complete', progress: 100, description: '多传感器融合的自动驾驶环境感知算法', deliverables: '算法模型', requirements: '熟悉传感器融合', tags: ['自动驾驶', 'AI'], assignedStudents: [1, 3, 7] },
]

const enterpriseProjects = [
  { id: 101, name: '区块链电子档案',                       publisher: '河北圣诺联合科技有限公司', enterpriseName: '河北圣诺',  budget: 350600, teacherName: '陈新',   status: 'in_progress', progress: 80,  description: '区块链电子档案管理系统开发', deliverables: '电子档案管理系统', requirements: '区块链、档案管理' },
  { id: 102, name: '燃气管线绘制辅助工具开发项目',          publisher: '河北恒华信息技术有限公司', enterpriseName: '恒华信息',  budget: 286000, teacherName: '张晓蕾', status: 'in_progress', progress: 90,  description: '燃气管线绘制辅助工具开发', deliverables: '管线绘制工具', requirements: 'GIS、管线设计' },
  { id: 103, name: '信息安全课程开发服务',                 publisher: '易县卓升电子科技有限公司', enterpriseName: '卓升电子',  budget: 200000, teacherName: '马晓丽', status: 'completed',   progress: 100, description: '信息安全课程开发服务', deliverables: '信息安全课程内容', requirements: '信息安全、教学' },
  { id: 104, name: '系统及网络安全维护',                   publisher: '河北仁谦信息科技有限公司北京分公司', enterpriseName: '仁谦信息',  budget: 396000, teacherName: '贺宏',   status: 'completed',   progress: 100, description: '系统及网络安全维护服务', deliverables: '安全维护方案', requirements: '网络安全、系统维护' },
  { id: 105, name: '自定位机器人网络安全虚拟仿真测试平台',  publisher: '石家庄市顶天科技开发有限公司', enterpriseName: '顶天科技',  budget: 300500, teacherName: '武雪芳', status: 'completed',   progress: 100, description: '机器人网络安全虚拟仿真测试平台', deliverables: '仿真测试平台', requirements: '机器人、网络安全' },
  { id: 106, name: '企业生产数据分析与可视化解决方案',      publisher: '河北国龙制药有限公司', enterpriseName: '国龙制药',  budget: 300000, teacherName: '陈建伟', status: 'in_progress', progress: 90,  description: '企业生产数据分析与可视化', deliverables: '数据分析可视化平台', requirements: '数据分析、可视化' },
  { id: 107, name: '数实合一智慧古建信息系统',              publisher: '河北棣烨信息技术有限公司', enterpriseName: '棣烨',      budget: 204700, teacherName: '底雪峰', status: 'completed',   progress: 100, description: '数实合一智慧古建信息系统', deliverables: '智慧古建信息系统', requirements: '古建、数字化' },
  { id: 108, name: '微晶玻璃晶化炉自动控制系统',            publisher: '河北美科微晶材料有限公司', enterpriseName: '美科',      budget: 450000, teacherName: '陶玉梅', status: 'completed',   progress: 100, description: '微晶玻璃晶化炉自动控制系统', deliverables: '自动控制系统', requirements: '自动化、微晶玻璃' },
  { id: 109, name: '虚拟实验教学资源软件',                  publisher: '河北惠美电子科技有限公司', enterpriseName: '惠美',      budget: 401000, teacherName: '刘娇',   status: 'completed',   progress: 100, description: '虚拟实验教学资源软件开发', deliverables: '虚拟实验软件', requirements: '虚拟实验、教学' },
  { id: 110, name: '分级数据存储系统',                      publisher: '河北高誉教育科技有限公司', enterpriseName: '高誉',      budget: 200000, teacherName: '李擎',   status: 'completed',   progress: 100, description: '分级数据存储系统开发', deliverables: '数据存储系统', requirements: '数据存储、分级' },
  { id: 111, name: '数字矿山主流岩体识别系统',              publisher: '河北诺桦网络科技有限公司', enterpriseName: '诺桦',      budget: 200000, teacherName: '罗文',   status: 'completed',   progress: 100, description: '数字矿山主流岩体识别系统开发', deliverables: '岩体识别系统', requirements: '矿山、岩体识别' },
]

// Tasks with 五维 evaluation data
const initialTasks = [
  { id: 1, projectId: 1, name: '需求分析', assigneeId: 1, assignee: '高怡希', deadline: '2026-01-20', status: 'completed', score: 92, comment: '需求文档撰写清晰完整', dims: { profession: 90, innovation: 92, teamwork: 91, learning: 88, adaptability: 94 } },
  { id: 2, projectId: 1, name: '数据采集', assigneeId: 2, assignee: '彭子芮', deadline: '2026-03-26', status: 'completed', score: 90, comment: '数据质量高，按时交付', dims: { profession: 88, innovation: 85, teamwork: 92, learning: 90, adaptability: 88 } },
  { id: 3, projectId: 1, name: '模型训练', assigneeId: 3, assignee: '张子怡', deadline: '2026-05-26', status: 'completed', score: 89, comment: '模型效果优秀', dims: { profession: 90, innovation: 92, teamwork: 85, learning: 88, adaptability: 86 } },
  { id: 4, projectId: 1, name: '系统测试', assigneeId: 4, assignee: '胡瑜韬', deadline: '2026-07-26', status: 'in_progress', score: null, comment: '', dims: null },
  { id: 5, projectId: 2, name: '设备选型', assigneeId: 5, assignee: '牛凯琦', deadline: '2025-09-26', status: 'completed', score: 95, comment: '选型方案详尽合理', dims: { profession: 95, innovation: 90, teamwork: 95, learning: 92, adaptability: 90 } },
  { id: 6, projectId: 2, name: '架构设计', assigneeId: 6, assignee: '王雪',   deadline: '2025-10-12', status: 'completed', score: 92, comment: '架构设计清晰，可扩展性强', dims: { profession: 90, innovation: 88, teamwork: 94, learning: 91, adaptability: 89 } },
  { id: 7, projectId: 2, name: '系统调优', assigneeId: 7, assignee: '李思琪', deadline: '2026-04-05', status: 'completed', score: 90, comment: '性能提升显著', dims: { profession: 88, innovation: 86, teamwork: 92, learning: 90, adaptability: 91 } },
]

const statusMap = {
  pending:           { text: '待承接',   color: 'orange' },
  teacher_accepted:  { text: '待企业确认',   color: 'purple' },
  in_progress:       { text: '进行中',       color: 'processing' },
  pending_complete:  { text: '待确认结项',   color: 'geekblue' },
  completed:         { text: '已结项',       color: 'green' },
}

const taskStatusMap = {
  pending:      { text: '待开始',   color: 'default' },
  in_progress:  { text: '进行中',   color: 'processing' },
  submitted:    { text: '待评价',   color: 'orange' },
  completed:    { text: '已完成',   color: 'green' },
}

export default function ProjectCooperation() {
  const { user, hasPermission } = useAuth()
  const role = user?.role || 'council'
  const enterpriseId = user?.enterpriseId
  const teacherId = user?.teacherId
  const schoolId = user?.schoolId
  const studentId = user?.id || 7

  const isEnterpriseRole = role === 'enterprise' || role === 'mentor'
  const [projects, setProjects] = useState(isEnterpriseRole ? enterpriseProjects : initialProjects)
  const [tasks, setTasks] = useState(initialTasks)
  const [filterStatus, setFilterStatus] = useState('all')

  // Modals
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishForm] = Form.useForm()
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


  // ─── Filtered ─────────────────────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    let list = projects
    if (role === 'enterprise' || role === 'mentor') { /* 全部显示 */ }
    if (role === 'teacher') list = list.filter(p => p.teacherId === teacherId || p.status === 'pending')
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
    if (role === 'mentor') {
      const tIds = projects.filter(p => p.enterpriseId === enterpriseId).map(p => p.id)
      return tasks.filter(t => tIds.includes(t.projectId))
    }
    return tasks
  }, [role, tasks, user, teacherId, enterpriseId, projects])

  // Gantt Chart
  const [ganttOpen, setGanttOpen] = useState(false)
  const [ganttProject, setGanttProject] = useState(null)
  const [teamOpen, setTeamOpen] = useState(false)
  const [teamProject, setTeamProject] = useState(null)
  const [teamStudents, setTeamStudents] = useState([])
  const [teamMentors, setTeamMentors] = useState([])
  const [teamTeachers, setTeamTeachers] = useState([])
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewProject, setReviewProject] = useState(null)
  const [reviewType, setReviewType] = useState('mid') // 'mid' | 'final'
  const [reviewForm] = Form.useForm()
  const [reviews, setReviews] = useState(() => {
    try { return JSON.parse(localStorage.getItem('project_reviews') || '{}') } catch { return {} }
  })
  // Member review
  const [memberReviewOpen, setMemberReviewOpen] = useState(false)
  const [memberReviewTarget, setMemberReviewTarget] = useState(null)
  const [memberReviewProject, setMemberReviewProject] = useState(null)

  const saveReviews = (r) => { setReviews(r); localStorage.setItem('project_reviews', JSON.stringify(r)) }

  const handleAddTeamMember = () => {
    if (!teamProject) return
    const projectTeam = { students: teamStudents, mentors: teamMentors, teachers: teamTeachers }
    setProjects(projects.map(p =>
      p.id === teamProject.id ? { ...p, assignedStudents: teamStudents, teamData: projectTeam } : p
    ))
    const allNames = [
      ...teamStudents.map(sid => mockStudents.find(s => s.id === sid)?.name).filter(Boolean),
      ...teamMentors.map(mid => mockMentors.find(m => m.id === mid)?.name).filter(Boolean),
      ...teamTeachers.map(tid => mockTeachers.find(t => t.id === tid)?.name).filter(Boolean),
    ]
    message.success(`团队已更新：${allNames.length} 名成员`)
    setTeamOpen(false); setTeamProject(null); setTeamStudents([]); setTeamMentors([]); setTeamTeachers([])
  }

  const handleSubmitReview = () => {
    reviewForm.validateFields().then(v => {
      const key = `${reviewProject.id}_${reviewType}`
      const record = { ...v, date: new Date().toISOString().split('T')[0], reviewer: user?.name }
      const updated = { ...reviews, [key]: record }
      saveReviews(updated)
      if (reviewType === 'final') {
        setProjects(projects.map(p => p.id === reviewProject.id ? { ...p, status: 'pending_complete', progress: 100 } : p))
        message.success('结项评审已提交，等待企业确认结项！')
      } else {
        message.success('中期评审已保存！')
      }
      setReviewOpen(false); setReviewProject(null); reviewForm.resetFields()
    })
  }

  const handleMemberReview = () => {
    reviewForm.validateFields().then(v => {
      const key = `${memberReviewProject.id}_member_${memberReviewTarget.id}_${reviewType}`
      const record = { ...v, date: new Date().toISOString().split('T')[0], reviewer: user?.name, memberName: memberReviewTarget.name }
      const updated = { ...reviews, [key]: record }
      saveReviews(updated)
      message.success(`${memberReviewTarget.name} ${reviewType === 'mid' ? '中期' : '结项'}评审已保存！`)
      setMemberReviewOpen(false); setMemberReviewTarget(null); setMemberReviewProject(null)
      reviewForm.resetFields()
    })
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
      const ent = mockEnterprises.find(e => e.id === enterpriseId)
      setProjects([{
        id: projects.length + 1, ...v, enterpriseId, enterpriseName: ent?.name || '未知',
        teacherId: null, teacherName: null, schoolId: null,
        status: 'pending', progress: 0,
        tags: v.tags ? v.tags.split(',').map(t => t.trim()) : [],
      }, ...projects])
      message.success('项目已发布，等待承接！')
      setPublishOpen(false); publishForm.resetFields()
    })
  }

  const handleTeacherAccept = (projectId) => {
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, status: 'teacher_accepted', teacherId, teacherName: user?.name, schoolId: schoolId || 1, progress: 5 } : p
    ))
    message.success('已承接该项目，等待企业确认！')
  }

  const handleEnterpriseConfirm = (projectId) => {
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, status: 'in_progress' } : p
    ))
    message.success('已确认项目，项目进入执行阶段！')
  }

  const handleEnterpriseCompleteConfirm = (projectId) => {
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, status: 'completed', progress: 100 } : p
    ))
    message.success('已确认项目结项！')
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
        setProjects(projects.map(pj => {
          if (pj.id !== evaluateTask.projectId) return pj
          if (newProgress >= 100) return { ...pj, progress: 100, status: 'pending_complete' }
          return { ...pj, progress: newProgress }
        }))
        if (newProgress >= 100) message.success('🎉 项目所有任务已完成，等待企业确认结项！')
      }
    })
  }

  // ─── Columns ────────────────────────────────────────────────────────────
  const projectColumns = useMemo(() => {
    const isEnt = role === 'enterprise' || role === 'mentor'
    const cols = [
      { title: '项目名称', dataIndex: 'name', key: 'name', render: (t, r) => <a onClick={() => { setDetailProject(r); setDetailOpen(true) }}>{t}</a> },
    ]
    if (isEnt) {
      cols.push({ title: '发布方', key: 'publisher', render: (_, r) => <span style={{ color: '#1677ff', fontSize: 13 }}>{r.publisher || r.enterpriseName}</span> })
    }
    if (!isEnt) {
      cols.push({ title: '企业简称', dataIndex: 'enterpriseName', key: 'enterpriseName', render: (t) => <Tag color="blue">{t}</Tag> })
    }
    cols.push(
      { title: '预算', dataIndex: 'budget', key: 'budget', render: (v) => `¥${(v/10000).toFixed(1)}万` },
      { title: '承接方', dataIndex: 'teacherName', key: 'teacherName', render: (v) => v || <Tag color="default">待承接</Tag> },
      { title: '进度', key: 'progress', render: (_, r) => <Progress percent={r.progress} size="small" format={() => r.progress > 0 ? `${r.progress}%` : '-'} /> },
      { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag> },
      {
        title: '操作', key: 'action', width: 200, render: (_, r) => {
          const acts = []
          if (r.status === 'pending' && role === 'teacher') acts.push(<Button key="ta" size="small" type="primary" onClick={() => handleTeacherAccept(r.id)}>承接项目</Button>)
          if (r.status === 'teacher_accepted' && isEnt) acts.push(<Button key="ec" size="small" type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} icon={<CheckCircleOutlined />} onClick={() => handleEnterpriseConfirm(r.id)}>确认项目</Button>)
          if (r.status === 'pending_complete' && isEnt) acts.push(<Button key="cc" size="small" type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} icon={<CheckCircleOutlined />} onClick={() => handleEnterpriseCompleteConfirm(r.id)}>确认结项</Button>)
          if (r.teacherId === teacherId && !isEnt) {
            if (r.status === 'in_progress') {
              acts.push(<Button key="at" size="small" onClick={() => { setTaskProjectId(r.id); taskForm.resetFields(); setTaskOpen(true) }}>分配任务</Button>)
              acts.push(<Button key="gt" size="small" icon={<ScheduleOutlined />} onClick={() => { setGanttProject(r); setGanttOpen(true) }}>甘特图</Button>)
              acts.push(<Button key="mr" size="small" icon={<CheckCircleOutlined />} style={{ backgroundColor: '#1677ff', borderColor: '#1677ff', color: '#fff' }}
                onClick={() => { setReviewProject(r); setReviewType('mid'); reviewForm.resetFields(); setReviewOpen(true) }}>项目评审</Button>)
            }
            acts.push(<Button key="tm" size="small" icon={<TeamOutlined />} onClick={() => { setTeamProject(r); setTeamStudents(r.assignedStudents || []); setTeamMentors((r.teamData?.mentors) || []); setTeamTeachers((r.teamData?.teachers) || []); setTeamOpen(true) }}>组建团队</Button>)
          }
          if (isEnt || role === 'park') acts.push(<Button key="vd" size="small" icon={<EyeOutlined />} onClick={() => { setDetailProject(r); setDetailOpen(true) }}>查看</Button>)
          if (acts.length === 0) acts.push(<span key="-" style={{ color: '#999' }}>-</span>)
          return <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{acts}</span>
        }
      },
    )
    return cols
  }, [role, teacherId])

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
        const acts = []
        if (r.assigneeId === studentId && (r.status === 'pending' || r.status === 'in_progress')) {
          if (role === 'student') acts.push(<Button key="sb" size="small" type="primary" icon={<SendOutlined />} onClick={() => { setSubmitTask(r); submitForm.resetFields(); setSubmitOpen(true) }}>提交成果</Button>)
          if (role === 'teacher') acts.push(<Button key="ed" size="small" onClick={() => { setTaskProjectId(r.projectId); taskForm.resetFields(); setTaskOpen(true) }}>编辑</Button>)
        }
        if (r.status === 'submitted' && (role === 'teacher' || role === 'mentor')) {
          acts.push(<Button key="ev" size="small" type="primary" icon={<StarOutlined />} onClick={() => { setEvaluateTask(r); evaluateForm.resetFields(); setDimScores({ profession: 80, innovation: 75, teamwork: 80, learning: 75, adaptability: 75 }); setEvaluateOpen(true) }}>评价</Button>)
        }
        acts.push(<Button key="vd" size="small" icon={<EyeOutlined />} onClick={() => {
          const pj = projects.find(p => p.id === r.projectId)
          Modal.info({
            title: r.name,
            width: 560,
            content: (
              <Descriptions column={1} bordered size="small" style={{ marginTop: 16 }}>
                <Descriptions.Item label="任务名称">{r.name}</Descriptions.Item>
                <Descriptions.Item label="所属项目">{pj?.name || '-'}</Descriptions.Item>
                <Descriptions.Item label="负责人">{r.assignee}</Descriptions.Item>
                <Descriptions.Item label="截止日期">{r.deadline}</Descriptions.Item>
                <Descriptions.Item label="状态"><Tag color={taskStatusMap[r.status]?.color}>{taskStatusMap[r.status]?.text}</Tag></Descriptions.Item>
                {r.score && <>
                  <Descriptions.Item label="五维均分">{r.score}分</Descriptions.Item>
                  <Descriptions.Item label="评语">{r.comment || '无'}</Descriptions.Item>
                </>}
              </Descriptions>
            ),
            okText: '关闭',
          })
        }}>查看</Button>)
        if (acts.length === 0) acts.push(<span style={{ color: '#999' }}>-</span>)
        return <span style={{ display: 'flex', gap: 4 }}>{acts}</span>
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
                { title: '企业简称', dataIndex: 'enterpriseName', key: 'enterpriseName', render: (t) => <Tag color="blue">{t}</Tag> },
                { title: '承接方', dataIndex: 'teacherName', key: 'teacherName' },
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
    if (role === 'teacher') {
      items.push({
        key: 'list', label: '任务分配', children: (
          <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 160 }}
                options={[
                  { value: 'all', label: '全部状态' },
                  { value: 'pending', label: '待开始' },
                  { value: 'in_progress', label: '进行中' },
                  { value: 'submitted', label: '待评价' },
                  { value: 'completed', label: '已完成' },
                ]}
              />
            </div>
            {visibleTasks.length === 0 ? (
              <Empty description="暂无任务" />
            ) : (
              <Table dataSource={visibleTasks} columns={taskColumns} rowKey="id" />
            )}
          </div>
        )
      })
    } else {
      items.push({
        key: 'list', label: '项目列表', children: (
          <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 160 }}
                options={[
                  { value: 'all', label: '全部状态' },
                  { value: 'pending', label: '待承接' },
                  { value: 'teacher_accepted', label: '待企业确认' },
                  { value: 'in_progress', label: '进行中' },
                  { value: 'pending_complete', label: '待确认结项' },
                  { value: 'completed', label: '已结项' },
                ]}
              />
              {role === 'enterprise' && (
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
    }

    if (role === 'enterprise') {
      items.push({
        key: 'publish', label: '发布项目', children: (
          <div style={{ maxWidth: 500 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { publishForm.resetFields(); setPublishOpen(true) }}>发布新项目</Button>
            <div style={{ marginTop: 16, color: '#666' }}>企业发布 → 教师承接 → 分配任务 → 学生执行 → 五维评价</div>
          </div>
        )
      })
    }

    if (role === 'mentor') {
      // 项目看板
      const mentorProjects = projects.filter(p => p.enterpriseId === enterpriseId && p.status === 'in_progress')
      items.push({
        key: 'board', label: '项目看板', children: (
          <div>
            {mentorProjects.length === 0 ? (
              <Empty description="暂无进行中的项目" />
            ) : (
              mentorProjects.map(p => (
                <Card key={p.id} size="small" style={{ marginBottom: 12 }} title={
                  <span>
                    <a onClick={() => { setDetailProject(p); setDetailOpen(true) }}>{p.name}</a>
                    <Tag color="blue" style={{ marginLeft: 8 }}>{p.enterpriseName}</Tag>
                  </span>
                } extra={<Button size="small" onClick={() => { setDetailProject(p); setDetailOpen(true) }}>查看详情</Button>}>
                  <Descriptions column={4} size="small">
                    <Descriptions.Item label="负责教师">{p.teacherName || '未指定'}</Descriptions.Item>
                    <Descriptions.Item label="进度">
                      <Progress percent={p.progress} size="small" style={{ width: 120 }} />
                    </Descriptions.Item>
                    <Descriptions.Item label="状态"><Tag color={statusMap[p.status]?.color}>{statusMap[p.status]?.text}</Tag></Descriptions.Item>
                    <Descriptions.Item label="学生数">{p.assignedStudents?.length || 0}人</Descriptions.Item>
                  </Descriptions>
                </Card>
              ))
            )}
          </div>
        )
      })
      // 评审学生
      const submittedTasks = tasks.filter(t => t.status === 'submitted')
      const mentorProjectIds = projects.filter(p => p.enterpriseId === enterpriseId).map(p => p.id)
      const mentorSubmittedTasks = submittedTasks.filter(t => mentorProjectIds.includes(t.projectId))
      items.push({
        key: 'evaluate', label: '评审学生', children: (
          <div>
            {mentorSubmittedTasks.length === 0 ? (
              <Empty description="暂无待评审的学生成果" />
            ) : (
              <Table dataSource={mentorSubmittedTasks} columns={[
                { title: '学生', dataIndex: 'assignee', key: 'assignee' },
                { title: '任务名称', dataIndex: 'name', key: 'name' },
                { title: '所属项目', key: 'pn', render: (_, r) => projects.find(p => p.id === r.projectId)?.name || '-' },
                { title: '截止日期', dataIndex: 'deadline', key: 'deadline' },
                { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={taskStatusMap[s]?.color}>{taskStatusMap[s]?.text}</Tag> },
                { title: '操作', key: 'action', render: (_, r) => (
                  <Button size="small" type="primary" icon={<StarOutlined />} onClick={() => { setEvaluateTask(r); evaluateForm.resetFields(); setDimScores({ profession: 80, innovation: 75, teamwork: 80, learning: 75, adaptability: 75 }); setEvaluateOpen(true) }}>评价</Button>
                )},
              ]} rowKey="id" />
            )}
          </div>
        )
      })
      return items
    }

    // 任务分配/管理
    if (role !== 'teacher' && role !== 'mentor' && role !== 'enterprise') items.push({
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

    // Teacher: 评审记录 (view all review history)
    if (role === 'teacher') {
      const reviewEntries = []
      const teacherProjectIds = projects.filter(p => p.teacherId === teacherId).map(p => p.id)
      teacherProjectIds.forEach(pId => {
        const p = projects.find(pr => pr.id === pId)
        if (!p) return
        ;['mid', 'final'].forEach(type => {
          const key = `${pId}_${type}`
          if (reviews[key]) reviewEntries.push({ ...reviews[key], projectName: p.name, projectId: pId, type, memberName: null })
        })
        // member reviews
        const teamMembers = [
          ...(p.assignedStudents || []).map(sid => { const s = mockStudents.find(st => st.id === sid); return s ? { id: sid, name: s.name, role: '学生' } : null }),
          ...(p.teamData?.mentors || []).map(mid => { const m = mockMentors.find(mt => mt.id === mid); return m ? { id: mid, name: m.name, role: '导师' } : null }),
          ...(p.teamData?.teachers || []).map(tid => { const t = mockTeachers.find(tr => tr.id === tid); return t ? { id: tid, name: t.name, role: '教师' } : null }),
        ].filter(Boolean)
        teamMembers.forEach(m => {
          ;['mid', 'final'].forEach(type => {
            const k = `${pId}_member_${m.id}_${type}`
            if (reviews[k]) reviewEntries.push({ ...reviews[k], projectName: p.name, projectId: pId, type, memberName: m.name, memberRole: m.role })
          })
        })
      })
      reviewEntries.sort((a, b) => b.date.localeCompare(a.date))
      items.push({
        key: 'reviews', label: '评审记录', children: (
          <div>
            <p style={{ color: '#666', marginBottom: 12 }}>项目和团队成员的中期/结项评审记录</p>
            {reviewEntries.length === 0 ? <Empty description="暂无评审记录" /> : (
              <Table dataSource={reviewEntries} columns={[
                { title: '项目', dataIndex: 'projectName', key: 'projectName' },
                { title: '对象', key: 'target', render: (_, r) => r.memberName
                  ? <span><Tag color="orange">{r.memberRole}</Tag> {r.memberName}</span>
                  : <Tag color="blue">项目整体</Tag>
                },
                { title: '类型', dataIndex: 'type', key: 'type', render: (t) => <Tag color={t === 'mid' ? 'blue' : 'green'}>{t === 'mid' ? '中期' : '结项'}</Tag> },
                { title: '评审人', dataIndex: 'reviewer', key: 'reviewer' },
                { title: '进度', key: 'progress', render: (_, r) => <Progress percent={parseInt(r.progress) || 0} size="small" format={() => `${r.progress}%`} /> },
                { title: '评分', dataIndex: 'score', key: 'score', render: (v) => <Tag color="gold">{v}分</Tag> },
                { title: '日期', dataIndex: 'date', key: 'date' },
                { title: '意见', dataIndex: 'comment', key: 'comment', ellipsis: true },
              ]} rowKey={(_r, i) => i} size="small" pagination={{ pageSize: 10 }} />
            )}
          </div>
        )
      })
    }

    return items
  }, [filteredProjects, projectColumns, taskColumns, studentTaskColumns, filterStatus, role, teacherId, visibleTasks])

  return (
    <Card title="项目管理">
      <Tabs items={tabItems} />

      {/* 发布项目 */}
      <Modal title="发布新项目" open={publishOpen} onOk={handlePublish} onCancel={() => { setPublishOpen(false); publishForm.resetFields() }} width={640}>
        <Form form={publishForm} layout="vertical">
          <Form.Item name="name" label="项目名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="项目描述"><Input.TextArea rows={4} /></Form.Item>
          <Form.Item name="budget" label="拟投入金额(元)" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="deliverables" label="交付物要求"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="requirements" label="技术要求"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="tags" label="标签"><Input placeholder="用逗号分隔" /></Form.Item>
        </Form>
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
      <Modal title={<span><TeamOutlined /> 组建项目团队 — {teamProject?.name}</span>}
        open={teamOpen} onOk={handleAddTeamMember} onCancel={() => { setTeamOpen(false); setTeamProject(null); setTeamStudents([]); setTeamMentors([]); setTeamTeachers([]) }}
        okText="保存团队" width={600}>
        <p style={{ color: '#999', fontSize: 13, marginBottom: 12 }}>可随时更换人选，保存后立即生效。</p>
        {teamProject && (
          <div>
            <h4 style={{ marginBottom: 8 }}>学生成员</h4>
            <Select mode="multiple" style={{ width: '100%' }} placeholder="选择学生"
              value={teamStudents} onChange={setTeamStudents}
              options={mockStudents.map(s => ({ value: s.id, label: `${s.name} (${s.major})` }))}
            />
            <h4 style={{ margin: '12px 0 8px' }}>企业导师</h4>
            <Select mode="multiple" style={{ width: '100%' }} placeholder="选择企业导师"
              value={teamMentors} onChange={setTeamMentors}
              options={mockMentors.map(m => ({ value: m.id, label: `${m.name} — ${m.position}` }))}
            />
            <h4 style={{ margin: '12px 0 8px' }}>协作教师</h4>
            <Select mode="multiple" style={{ width: '100%' }} placeholder="选择院校教师"
              value={teamTeachers} onChange={setTeamTeachers}
              options={mockTeachers.filter(t => t.id !== teacherId).map(t => ({ value: t.id, label: `${t.name} (${t.title})` }))}
            />
            <div style={{ marginTop: 16, padding: 12, background: '#fafafa', borderRadius: 6 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>当前团队成员：</div>
              {(teamProject.assignedStudents || []).length === 0 && !teamProject.teamData?.mentors?.length && !teamProject.teamData?.teachers?.length
                ? <span style={{ color: '#ccc' }}>暂未添加成员</span>
                : <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {teamProject.teamData?.teachers?.map(tid => {
                    const t = mockTeachers.find(t => t.id === tid)
                    return t ? <Tag key={`t${tid}`} color="purple">{t.name}</Tag> : null
                  })}
                  {(teamProject.assignedStudents || []).map(sid => {
                    const stu = mockStudents.find(s => s.id === sid)
                    return stu ? <Tag key={sid} color="blue">{stu.name}</Tag> : null
                  })}
                  {teamProject.teamData?.mentors?.map(mid => {
                    const m = mockMentors.find(m => m.id === mid)
                    return m ? <Tag key={`m${mid}`} color="orange">{m.name}</Tag> : null
                  })}
                  <Tag><TeamOutlined /> 共{((teamProject.assignedStudents || []).length + (teamProject.teamData?.mentors?.length || 0) + (teamProject.teamData?.teachers?.length || 0))}人</Tag>
                </div>
              }
            </div>
          </div>
        )}
      </Modal>

      {/* 评审 */}
      <Modal title={<span><CheckCircleOutlined /> {reviewType === 'mid' ? '中期' : '结项'}评审 — {reviewProject?.name}</span>}
        open={reviewOpen} onOk={handleSubmitReview}
        onCancel={() => { setReviewOpen(false); setReviewProject(null); reviewForm.resetFields() }}
        okText="提交评审" width={560}>
        {reviewProject && (
          <div>
            <Descriptions column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="项目名称">{reviewProject.name}</Descriptions.Item>
              <Descriptions.Item label="当前进度"><Progress percent={reviewProject.progress} size="small" /></Descriptions.Item>
            </Descriptions>
            {reviews[`${reviewProject.id}_mid`] && (
              <div style={{ background: '#e6f4ff', padding: 12, borderRadius: 6, marginBottom: 16 }}>
                <div style={{ fontWeight: 500 }}>中期评审记录</div>
                <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                  评审人：{reviews[`${reviewProject.id}_mid`].reviewer} | 日期：{reviews[`${reviewProject.id}_mid`].date}
                </div>
                <div style={{ fontSize: 13, color: '#666' }}>进度：{reviews[`${reviewProject.id}_mid`].progress}% | 评分：{reviews[`${reviewProject.id}_mid`].score}分</div>
                <div style={{ fontSize: 13, color: '#666' }}>评语：{reviews[`${reviewProject.id}_mid`].comment}</div>
              </div>
            )}
            <Form form={reviewForm} layout="vertical">
              <Form.Item name="progress" label="当前进度(%)" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="score" label="综合评分(0-100)" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="comment" label="评审意见" rules={[{ required: true }]}>
                <Input.TextArea rows={3} placeholder={reviewType === 'mid' ? '评估中期进展质量和存在的问题' : '对项目整体完成质量进行综合评价'} />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* 成员评审 */}
      <Modal title={<span><CheckCircleOutlined /> 成员{reviewType === 'mid' ? '中期' : '结项'}评审 — {memberReviewProject?.name}</span>}
        open={memberReviewOpen} onOk={handleMemberReview}
        onCancel={() => { setMemberReviewOpen(false); setMemberReviewTarget(null); setMemberReviewProject(null); reviewForm.resetFields() }}
        okText="提交评审" width={560}>
        {memberReviewTarget && memberReviewProject && (
          <div>
            <Descriptions column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="项目">{memberReviewProject.name}</Descriptions.Item>
              <Descriptions.Item label="成员"><Tag color="blue">{memberReviewTarget.name}</Tag></Descriptions.Item>
            </Descriptions>
            {reviews[`${memberReviewProject.id}_member_${memberReviewTarget.id}_mid`] && (
              <div style={{ background: '#e6f4ff', padding: 12, borderRadius: 6, marginBottom: 16 }}>
                <div style={{ fontWeight: 500 }}>中期评审记录</div>
                <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                  进度：{reviews[`${memberReviewProject.id}_member_${memberReviewTarget.id}_mid`].progress}% | 评分：{reviews[`${memberReviewProject.id}_member_${memberReviewTarget.id}_mid`].score}分
                </div>
                <div style={{ fontSize: 13, color: '#666' }}>评语：{reviews[`${memberReviewProject.id}_member_${memberReviewTarget.id}_mid`].comment}</div>
              </div>
            )}
            <Form form={reviewForm} layout="vertical">
              <Form.Item name="progress" label="评审进度(%)" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="score" label="评分(0-100)" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="comment" label="评审意见" rules={[{ required: true }]}>
                <Input.TextArea rows={3} placeholder={reviewType === 'mid' ? '评估该成员的阶段表现' : '对该成员整个项目周期的工作进行综合评价'} />
              </Form.Item>
            </Form>
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
            <Descriptions.Item label="团队成员">
              {(detailProject.assignedStudents || []).length === 0 && !detailProject.teamData?.mentors?.length && !detailProject.teamData?.teachers?.length
                ? <span style={{ color: '#ccc' }}>暂无</span>
                : <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {detailProject.teamData?.teachers?.map(tid => {
                    const t = mockTeachers.find(t => t.id === tid)
                    return t ? <Tag key={`t${tid}`} color="purple">教师: {t.name}</Tag> : null
                  })}
                  {(detailProject.assignedStudents || []).map(sid => {
                    const stu = mockStudents.find(s => s.id === sid)
                    return stu ? <Tag key={sid} color="blue">学生: {stu.name}</Tag> : null
                  })}
                  {detailProject.teamData?.mentors?.map(mid => {
                    const m = mockMentors.find(m => m.id === mid)
                    return m ? <Tag key={`m${mid}`} color="orange">导师: {m.name}</Tag> : null
                  })}
                </div>
              }
            </Descriptions.Item>
            {role === 'teacher' && detailProject.teacherId === teacherId && detailProject.status === 'in_progress' && (
              <Descriptions.Item label="成员评审" span={2}>
                {(() => {
                  const allMembers = [
                    ...(detailProject.assignedStudents || []).map(sid => { const s = mockStudents.find(st => st.id === sid); return s ? { ...s, memberRole: '学生' } : null }),
                    ...(detailProject.teamData?.mentors || []).map(mid => { const m = mockMentors.find(mt => mt.id === mid); return m ? { ...m, memberRole: '导师' } : null }),
                    ...(detailProject.teamData?.teachers || []).map(tid => { const t = mockTeachers.find(tr => tr.id === tid); return t ? { ...t, memberRole: '教师' } : null }),
                  ].filter(Boolean)
                  if (allMembers.length === 0) return <span style={{ color: '#ccc' }}>暂无成员</span>
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {allMembers.map(m => {
                        const midKey = `${detailProject.id}_member_${m.id}_mid`
                        const finalKey = `${detailProject.id}_member_${m.id}_final`
                        return (
                          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                            <span>
                              <Tag color={m.memberRole === '学生' ? 'blue' : m.memberRole === '导师' ? 'orange' : 'purple'}>{m.memberRole}</Tag>
                              {m.name}
                            </span>
                            <span style={{ display: 'flex', gap: 4 }}>
                              <Button size="small" onClick={() => { setMemberReviewProject(detailProject); setMemberReviewTarget(m); setReviewType('mid'); reviewForm.resetFields(); setMemberReviewOpen(true) }}>
                                中期 {reviews[midKey] ? <Tag color="green" style={{ marginLeft: 2, lineHeight: '14px', padding: '0 3px', fontSize: 10 }}>✓</Tag> : null}
                              </Button>
                              <Button size="small" style={{ borderColor: '#52c41a', color: '#52c41a' }} onClick={() => { setMemberReviewProject(detailProject); setMemberReviewTarget(m); setReviewType('final'); reviewForm.resetFields(); setMemberReviewOpen(true) }}>
                                结项 {reviews[finalKey] ? <Tag color="green" style={{ marginLeft: 2, lineHeight: '14px', padding: '0 3px', fontSize: 10 }}>✓</Tag> : null}
                              </Button>
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </Descriptions.Item>
            )}
            {reviews[`${detailProject.id}_mid`] && (
              <Descriptions.Item label="中期评审">
                {reviews[`${detailProject.id}_mid`].reviewer} | {reviews[`${detailProject.id}_mid`].date} | 进度 {reviews[`${detailProject.id}_mid`].progress}% | 评分 {reviews[`${detailProject.id}_mid`].score}分
                <br />{reviews[`${detailProject.id}_mid`].comment}
              </Descriptions.Item>
            )}
            {reviews[`${detailProject.id}_final`] && (
              <Descriptions.Item label="结项评审">
                {reviews[`${detailProject.id}_final`].reviewer} | {reviews[`${detailProject.id}_final`].date} | 评分 {reviews[`${detailProject.id}_final`].score}分
                <br />{reviews[`${detailProject.id}_final`].comment}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </Card>
  )
}
