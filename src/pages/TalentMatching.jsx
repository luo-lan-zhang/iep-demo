import { useState, useMemo } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, Select, Tabs, message, Descriptions, Empty, Space, Progress, Tooltip, Row, Col } from 'antd'
import { PlusOutlined, SendOutlined, StarOutlined, CheckCircleOutlined, CloseCircleOutlined, TeamOutlined, FileTextOutlined, NodeIndexOutlined, TrophyOutlined, EyeOutlined } from '@ant-design/icons'
import { mockEnterprises } from '../mock/enterprises'
import { mockStudents } from '../mock/students'
import { mockTeachers } from '../mock/teachers'
import { useAuth } from '../context/AuthContext'

// ─── Mock Data ───────────────────────────────────────────────────────────────
const initialPositions = [
  { id: 1, title: 'HarmonyOS开发工程师', enterpriseId: 1, enterpriseName: '华为技术有限公司', salary: '25K-40K', education: '本科', description: '负责HarmonyOS应用开发，参与核心模块设计', requirements: '熟悉Java/Kotlin，有移动端开发经验', status: 'active' },
  { id: 2, title: 'AI算法工程师', enterpriseId: 2, enterpriseName: '腾讯科技（深圳）有限公司', salary: '30K-50K', education: '硕士', description: '从事AI大模型算法研究和应用开发', requirements: '熟悉深度学习框架，有NLP/CV经验', status: 'active' },
  { id: 3, title: '嵌入式软件工程师', enterpriseId: 5, enterpriseName: '大疆创新科技有限公司', salary: '20K-35K', education: '本科', description: '负责嵌入式系统软件开发', requirements: '熟悉C/C++，有RTOS开发经验', status: 'active' },
  { id: 4, title: '自动驾驶测试工程师', enterpriseId: 3, enterpriseName: '广州小鹏汽车科技有限公司', salary: '15K-30K', education: '本科', description: '负责自动驾驶系统测试和验证', requirements: '有测试经验，了解自动驾驶', status: 'active' },
  { id: 5, title: '产品经理', enterpriseId: 2, enterpriseName: '腾讯科技（深圳）有限公司', salary: '20K-40K', education: '本科', description: '负责产品规划和需求分析', requirements: '有互联网产品经验', status: 'closed' },
]

const initialApplications = [
  { id: 1, positionId: 1, studentId: 1, studentName: '张三', major: '计算机科学与技术', enterpriseName: '华为技术有限公司', positionTitle: 'HarmonyOS开发工程师', status: 'approved', applyDate: '2024-07-01', matchScore: 92 },
  { id: 2, positionId: 2, studentId: 2, studentName: '李四', major: '软件工程', enterpriseName: '腾讯科技（深圳）有限公司', positionTitle: 'AI算法工程师', status: 'pending', applyDate: '2024-07-05', matchScore: 88 },
  { id: 3, positionId: 1, studentId: 3, studentName: '王五', major: '人工智能', enterpriseName: '华为技术有限公司', positionTitle: 'HarmonyOS开发工程师', status: 'approved', applyDate: '2024-06-28', matchScore: 95 },
  { id: 4, positionId: 3, studentId: 4, studentName: '赵六', major: '电子信息工程', enterpriseName: '大疆创新科技有限公司', positionTitle: '嵌入式软件工程师', status: 'rejected', applyDate: '2024-06-20', matchScore: 75 },
  { id: 5, positionId: 2, studentId: 1, studentName: '张三', major: '计算机科学与技术', enterpriseName: '腾讯科技（深圳）有限公司', positionTitle: 'AI算法工程师', status: 'pending', applyDate: '2024-07-08', matchScore: 85 },
  { id: 6, positionId: 4, studentId: 2, studentName: '李四', major: '软件工程', enterpriseName: '广州小鹏汽车科技有限公司', positionTitle: '自动驾驶测试工程师', status: 'approved', applyDate: '2024-07-03', matchScore: 82 },
  { id: 7, positionId: 3, studentId: 5, studentName: '孙七', major: '物联网工程', enterpriseName: '大疆创新科技有限公司', positionTitle: '嵌入式软件工程师', status: 'pending', applyDate: '2024-07-10', matchScore: 91 },
  { id: 8, positionId: 1, studentId: 7, studentName: '张三', major: '计算机科学与技术', enterpriseName: '华为技术有限公司', positionTitle: 'HarmonyOS开发工程师', status: 'rejected', applyDate: '2024-07-06', matchScore: 68 },
  { id: 9, positionId: 2, studentId: 7, studentName: '张三', major: '计算机科学与技术', enterpriseName: '腾讯科技（深圳）有限公司', positionTitle: 'AI算法工程师', status: 'pending', applyDate: '2024-07-15', matchScore: 87 },
  { id: 10, positionId: 3, studentId: 7, studentName: '张三', major: '计算机科学与技术', enterpriseName: '大疆创新科技有限公司', positionTitle: '嵌入式软件工程师', status: 'pending', applyDate: '2024-07-18', matchScore: 83 },
  { id: 11, positionId: 4, studentId: 7, studentName: '张三', major: '计算机科学与技术', enterpriseName: '广州小鹏汽车科技有限公司', positionTitle: '自动驾驶测试工程师', status: 'approved', applyDate: '2024-07-12', matchScore: 90 },
  { id: 12, positionId: 5, studentId: 7, studentName: '张三', major: '计算机科学与技术', enterpriseName: '腾讯科技（深圳）有限公司', positionTitle: '产品经理', status: 'rejected', applyDate: '2024-06-25', matchScore: 72 },
  { id: 13, positionId: 1, studentId: 4, studentName: '赵六', major: '电子信息工程', enterpriseName: '华为技术有限公司', positionTitle: 'HarmonyOS开发工程师', status: 'approved', applyDate: '2024-07-16', matchScore: 88 },
]

const initialInterviews = [
  { id: 1, positionId: 1, studentId: 1, studentName: '张三', enterpriseName: '华为技术有限公司', positionTitle: 'HarmonyOS开发工程师', status: 'pending', interviewDate: '2024-08-01 14:00', inviteDate: '2024-07-20', source: 'enterprise' },
  { id: 2, positionId: 2, studentId: 5, studentName: '孙七', enterpriseName: '腾讯科技（深圳）有限公司', positionTitle: 'AI算法工程师', status: 'accepted', interviewDate: '2024-08-05 10:00', inviteDate: '2024-07-22', source: 'enterprise' },
  { id: 3, positionId: 4, studentId: 3, studentName: '王五', enterpriseName: '广州小鹏汽车科技有限公司', positionTitle: '自动驾驶测试工程师', status: 'rejected', interviewDate: '2024-08-10 15:00', inviteDate: '2024-07-25', source: 'enterprise' },
  { id: 4, positionId: 1, studentId: 3, studentName: '王五', enterpriseName: '华为技术有限公司', positionTitle: 'HarmonyOS开发工程师', status: 'accepted', interviewDate: '2024-08-08 09:30', inviteDate: '2024-07-24', source: 'enterprise' },
  { id: 5, positionId: 3, studentId: 1, studentName: '张三', enterpriseName: '大疆创新科技有限公司', positionTitle: '嵌入式软件工程师', status: 'pending', interviewDate: '2024-08-12 15:00', inviteDate: '2024-07-26', source: 'teacher' },
  { id: 6, positionId: 2, studentId: 7, studentName: '张三', enterpriseName: '腾讯科技（深圳）有限公司', positionTitle: 'AI算法工程师', status: 'confirmed', interviewDate: '2024-08-15 10:00', inviteDate: '2024-07-28', source: 'enterprise' },
  { id: 7, positionId: 1, studentId: 7, studentName: '张三', enterpriseName: '华为技术有限公司', positionTitle: 'HarmonyOS开发工程师', status: 'pending', interviewDate: '2024-08-18 14:00', inviteDate: '2024-07-30', source: 'enterprise' },
  { id: 8, positionId: 3, studentId: 7, studentName: '张三', enterpriseName: '大疆创新科技有限公司', positionTitle: '嵌入式软件工程师', status: 'accepted', interviewDate: '2024-08-20 10:00', inviteDate: '2024-08-01', source: 'teacher' },
]

const initialRecommendations = [
  { id: 1, positionId: 1, studentId: 5, studentName: '孙七', major: '物联网工程', teacherId: 1, teacherName: '张教授', reason: '该生HarmonyOS开发能力突出，获得过省级竞赛奖项', status: 'pending', recommendDate: '2024-07-10' },
  { id: 2, positionId: 2, studentId: 1, studentName: '张三', major: '计算机科学与技术', teacherId: 1, teacherName: '张教授', reason: 'AI方向成绩优异，有丰富的项目实战经验', status: 'pending', recommendDate: '2024-07-12' },
  { id: 3, positionId: 4, studentId: 6, studentName: '周八', major: '机械工程', teacherId: 4, teacherName: '陈教授', reason: '自动驾驶项目经验丰富，团队协作能力强', status: 'interviewed', recommendDate: '2024-07-08' },
  { id: 4, positionId: 3, studentId: 2, studentName: '李四', major: '软件工程', teacherId: 1, teacherName: '张教授', reason: '嵌入式系统课程成绩优异，参加过全国电子设计大赛', status: 'pending', recommendDate: '2024-07-15' },
  { id: 5, positionId: 1, studentId: 1, studentName: '张三', major: '计算机科学与技术', teacherId: 2, teacherName: '李教授', reason: '全栈开发能力突出，有华为HCIA认证', status: 'interviewed', recommendDate: '2024-07-08' },
  { id: 6, positionId: 2, studentId: 5, studentName: '孙七', major: '物联网工程', teacherId: 2, teacherName: '李教授', reason: '精通Python和TensorFlow，参加过Kaggle竞赛', status: 'pending', recommendDate: '2024-07-18' },
]

const statusMap = {
  pending: { text: '待审核', color: 'orange' },
  approved: { text: '已通过', color: 'green' },
  rejected: { text: '已拒绝', color: 'red' },
  accepted: { text: '已接受', color: 'green' },
  confirmed: { text: '已确认', color: 'purple' },
  interviewed: { text: '已邀约', color: 'blue' },
}
const posStatusMap = { active: { text: '招聘中', color: 'green' }, closed: { text: '已关闭', color: 'default' } }

// ─── Calculate match score between student and position ──────────────────────
function calcMatchScore(student, position) {
  let score = 70
  const skillKeywords = (position.title + position.requirements + position.description).toLowerCase()
  const studentMajor = student.major.toLowerCase()
  if (skillKeywords.includes(studentMajor.substring(0, 2))) score += 10
  if (skillKeywords.includes('java') && student.major.includes('计算机')) score += 5
  if (skillKeywords.includes('python') && student.major.includes('计算机')) score += 5
  if (skillKeywords.includes('嵌入式') && student.major.includes('电子')) score += 8
  if (skillKeywords.includes('AI') && student.major.includes('智能')) score += 10
  if (skillKeywords.includes('自动') && student.major.includes('自动化')) score += 8
  if (skillKeywords.includes('机械') && student.major.includes('机械')) score += 8
  return Math.min(98, score + Math.floor(Math.random() * 10))
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function TalentMatching() {
  const { user, hasPermission } = useAuth()
  const [positions, setPositions] = useState(initialPositions)
  const [applications, setApplications] = useState(initialApplications)
  const [interviews, setInterviews] = useState(initialInterviews)
  const [recommendations, setRecommendations] = useState(initialRecommendations)

  // Modals
  const [postOpen, setPostOpen] = useState(false); const [postForm] = Form.useForm()
  const [applyOpen, setApplyOpen] = useState(false); const [applyPosition, setApplyPosition] = useState(null)
  const [recommendOpen, setRecommendOpen] = useState(false); const [recommendPosition, setRecommendPosition] = useState(null); const [recommendForm] = Form.useForm()
  const [detailOpen, setDetailOpen] = useState(false); const [detailPosition, setDetailPosition] = useState(null)
  const [inviteOpen, setInviteOpen] = useState(false); const [inviteTarget, setInviteTarget] = useState(null); const [inviteForm] = Form.useForm()
  const [studentDetailOpen, setStudentDetailOpen] = useState(false); const [detailStudent, setDetailStudent] = useState(null)
  const [viewAppOpen, setViewAppOpen] = useState(false); const [viewApp, setViewApp] = useState(null)

  const role = user?.role || 'admin'
  const enterpriseId = user?.enterpriseId
  const studentId = user?.id
  const teacherId = user?.teacherId
  const students = mockStudents

  // ─── Filtered Data ─────────────────────────────────────────────────────
  const filteredPositions = useMemo(() => {
    if (role === 'enterprise') return positions.filter(p => p.enterpriseId === enterpriseId)
    return positions
  }, [positions, role, enterpriseId])

  const myApplications = useMemo(() => {
    if (role === 'student') return applications.filter(a => a.studentId === studentId)
    if (role === 'enterprise') {
      const posIds = positions.filter(p => p.enterpriseId === enterpriseId).map(p => p.id)
      return applications.filter(a => posIds.includes(a.positionId))
    }
    return applications
  }, [role, studentId, applications, positions, enterpriseId])

  const myInterviews = useMemo(() => {
    if (role === 'student') return interviews.filter(i => i.studentId === studentId)
    if (role === 'enterprise') {
      const posIds = positions.filter(p => p.enterpriseId === enterpriseId).map(p => p.id)
      return interviews.filter(i => posIds.includes(i.positionId))
    }
    return interviews
  }, [role, studentId, interviews, positions, enterpriseId])

  const myRecommendations = useMemo(() => {
    if (role === 'teacher') return recommendations.filter(r => r.teacherId === teacherId)
    if (role === 'enterprise') {
      const posIds = positions.filter(p => p.enterpriseId === enterpriseId).map(p => p.id)
      return recommendations.filter(r => posIds.includes(r.positionId))
    }
    return recommendations
  }, [role, teacherId, recommendations, positions, enterpriseId])

  // Enterprise: 匹配学生列表（根据企业岗位匹配学生）
  const matchedStudents = useMemo(() => {
    if (role !== 'enterprise') return []
    const entPositions = positions.filter(p => p.enterpriseId === enterpriseId && p.status === 'active')
    const result = []
    students.forEach(s => {
      entPositions.forEach(p => {
        const score = calcMatchScore(s, p)
        if (score >= 65) {
          const alreadyApplied = applications.find(a => a.positionId === p.id && a.studentId === s.id)
          const alreadyInterviewed = interviews.find(i => i.positionId === p.id && i.studentId === s.id)
          const alreadyRecommended = recommendations.find(r => r.positionId === p.id && r.studentId === s.id)
          result.push({
            key: `${s.id}_${p.id}`,
            studentId: s.id,
            studentName: s.name,
            major: s.major,
            grade: s.grade,
            positionTitle: p.title,
            positionId: p.id,
            matchScore: score,
            status: alreadyInterviewed ? 'interviewed' : alreadyApplied ? 'applied' : alreadyRecommended ? 'recommended' : 'matched',
          })
        }
      })
    })
    return result.sort((a, b) => b.matchScore - a.matchScore)
  }, [role, enterpriseId, positions, students, applications, interviews, recommendations])

  const [selectedMatchPosition, setSelectedMatchPosition] = useState('all')

  const filteredMatched = useMemo(() => {
    if (selectedMatchPosition === 'all') return matchedStudents
    return matchedStudents.filter(m => m.positionId === parseInt(selectedMatchPosition))
  }, [matchedStudents, selectedMatchPosition])

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handlePost = () => {
    postForm.validateFields().then(values => {
      const ent = mockEnterprises.find(e => e.id === values.enterpriseId)
      setPositions([{ id: positions.length + 1, ...values, enterpriseName: ent?.name || '未知', status: 'active' }, ...positions])
      message.success('岗位发布成功！'); setPostOpen(false); postForm.resetFields()
    })
  }

  const handleApply = () => {
    const student = mockStudents.find(s => s.id === studentId)
    if (applications.find(a => a.positionId === applyPosition.id && a.studentId === studentId)) {
      message.warning('您已投递过该岗位'); setApplyOpen(false); setApplyPosition(null); return
    }
    const score = calcMatchScore(student, applyPosition)
    setApplications([...applications, { id: applications.length + 1, positionId: applyPosition.id, studentId, studentName: student?.name || '', major: student?.major || '', enterpriseName: applyPosition.enterpriseName, positionTitle: applyPosition.title, status: 'pending', applyDate: new Date().toISOString().split('T')[0], matchScore: score }])
    message.success('简历投递成功！'); setApplyOpen(false); setApplyPosition(null)
  }

  const handleApproveApp = (appId) => {
    setApplications(applications.map(a => a.id === appId ? { ...a, status: 'approved' } : a))
    message.success('已通过申请')
  }
  const handleRejectApp = (appId) => {
    setApplications(applications.map(a => a.id === appId ? { ...a, status: 'rejected' } : a))
    message.success('已拒绝申请')
  }

  // 发送面试邀请
  const handleSendInvite = () => {
    inviteForm.validateFields().then(v => {
      setInterviews([...interviews, {
        id: interviews.length + 1, positionId: inviteTarget.positionId, studentId: inviteTarget.studentId,
        studentName: inviteTarget.studentName, enterpriseName: inviteTarget.enterpriseName,
        positionTitle: inviteTarget.positionTitle, status: 'pending',
        interviewDate: v.interviewDate, inviteDate: new Date().toISOString().split('T')[0], source: v.source || 'enterprise',
      }])
      setApplications(applications.map(a =>
        a.positionId === inviteTarget.positionId && a.studentId === inviteTarget.studentId
          ? { ...a, status: 'interviewed' } : a
      ))
      message.success(`已向 ${inviteTarget.studentName} 发送面试邀请！`)
      setInviteOpen(false); setInviteTarget(null); inviteForm.resetFields()
    })
  }

  // 学生接受/拒绝面试
  const handleAcceptInterview = (invId) => {
    setInterviews(interviews.map(i => i.id === invId ? { ...i, status: 'accepted' } : i))
    message.success('已接受面试邀请！')
  }
  const handleRejectInterview = (invId) => {
    setInterviews(interviews.map(i => i.id === invId ? { ...i, status: 'rejected' } : i))
    message.success('已拒绝面试邀请')
  }

  // 企业同意学生面试确认
  const handleConfirmInterview = (invId) => {
    setInterviews(interviews.map(i => i.id === invId ? { ...i, status: 'confirmed' } : i))
    message.success('已确认面试安排')
  }

  // 教师推荐
  const handleRecommend = () => {
    recommendForm.validateFields().then(values => {
      const student = mockStudents.find(s => s.id === values.studentId)
      const teacher = mockTeachers.find(t => t.id === teacherId)
      setRecommendations([...recommendations, {
        id: recommendations.length + 1, positionId: recommendPosition.id, studentId: values.studentId,
        studentName: student?.name || '', major: student?.major || '',
        teacherId, teacherName: teacher?.name || '', reason: values.reason,
        status: 'pending', recommendDate: new Date().toISOString().split('T')[0],
      }])
      message.success(`已推荐 ${student?.name} 给 ${recommendPosition.enterpriseName} 的 ${recommendPosition.title} 岗位！`)
      setRecommendOpen(false); setRecommendPosition(null); recommendForm.resetFields()
    })
  }

  // 企业查看教师推荐 → 发面试邀请
  const handleRecommendToInvite = (rec) => {
    setInviteTarget({
      studentId: rec.studentId, studentName: rec.studentName,
      positionId: rec.positionId, positionTitle: positions.find(p => p.id === rec.positionId)?.title || '',
      enterpriseName: positions.find(p => p.id === rec.positionId)?.enterpriseName || '',
    })
    inviteForm.resetFields(); setInviteOpen(true)
  }

  // ─── Columns ───────────────────────────────────────────────────────────
  const positionCols = [
    { title: '岗位名称', dataIndex: 'title', key: 'title', render: (t, r) => <a onClick={() => { setDetailPosition(r); setDetailOpen(true) }}>{t}</a> },
    { title: '企业', dataIndex: 'enterpriseName', key: 'enterpriseName', render: (t) => <Tag color="blue">{t}</Tag> },
    { title: '薪资', dataIndex: 'salary', key: 'salary', render: (v) => <span style={{ color: '#faad14', fontWeight: 'bold' }}>{v}</span> },
    { title: '学历', dataIndex: 'education', key: 'education' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={posStatusMap[s]?.color}>{posStatusMap[s]?.text}</Tag> },
    { title: '操作', key: 'action', render: (_, r) => {
      if (r.status !== 'active') return <span style={{ color: '#999' }}>-</span>
      if (role === 'student') return <Button size="small" type="primary" icon={<SendOutlined />} onClick={() => { setApplyPosition(r); setApplyOpen(true) }}>投递简历</Button>
      if (role === 'teacher') return <Button size="small" type="primary" icon={<StarOutlined />} onClick={() => { setRecommendPosition(r); setRecommendOpen(true) }}>推荐学生</Button>
      if (role === 'enterprise') return <a onClick={() => { setDetailPosition(r); setDetailOpen(true) }}>查看</a>
      return <span style={{ color: '#999' }}>-</span>
    }},
  ]

  // 企业：岗位匹配学生列表列
  const matchCols = [
    { title: '学生姓名', dataIndex: 'studentName', key: 'studentName', render: (t, r) => <a onClick={() => { setDetailStudent(r); setStudentDetailOpen(true) }}>{t}</a> },
    { title: '专业', dataIndex: 'major', key: 'major' },
    { title: '年级', dataIndex: 'grade', key: 'grade' },
    { title: '匹配岗位', dataIndex: 'positionTitle', key: 'positionTitle', render: (t) => <Tag color="blue">{t}</Tag> },
    { title: '匹配度', dataIndex: 'matchScore', key: 'matchScore', render: (v) => <Progress percent={v} size="small" format={() => `${v}%`} strokeColor={v >= 90 ? '#52c41a' : v >= 80 ? '#1677ff' : '#faad14'} /> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => {
      const m = { matched: { text: '待邀约', color: 'orange' }, applied: { text: '已投递', color: 'blue' }, interviewed: { text: '已邀约', color: 'green' }, recommended: { text: '教师推荐', color: 'purple' } }
      return <Tag color={m[s]?.color}>{m[s]?.text}</Tag>
    }},
    { title: '操作', key: 'action', render: (_, r) => {
      if (r.status === 'matched' || r.status === 'recommended') {
        return <Button size="small" type="primary" icon={<SendOutlined />} onClick={() => {
          setInviteTarget({
            studentId: r.studentId, studentName: r.studentName,
            positionId: r.positionId, positionTitle: r.positionTitle,
            enterpriseName: positions.find(p => p.id === r.positionId)?.enterpriseName || '',
          })
          inviteForm.resetFields(); setInviteOpen(true)
        }}>发送面试邀请</Button>
      }
      if (r.status === 'applied') return <Tag color="blue">待审核</Tag>
      if (r.status === 'interviewed') return <Tag color="green">已邀约</Tag>
      return <span style={{ color: '#999' }}>-</span>
    }},
  ]

  // 我的投递列（学生）= 学生看自己的投递状态
  const studentAppCols = [
    { title: '岗位名称', dataIndex: 'positionTitle', key: 'positionTitle' },
    { title: '企业', dataIndex: 'enterpriseName', key: 'enterpriseName', render: (t) => <Tag color="blue">{t}</Tag> },
    { title: '匹配度', dataIndex: 'matchScore', key: 'matchScore', render: (v) => v ? <Tag color={v >= 90 ? 'green' : v >= 80 ? 'blue' : 'orange'}>{v}%</Tag> : '-' },
    { title: '投递日期', dataIndex: 'applyDate', key: 'applyDate' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag> },
    { title: '操作', key: 'action', render: (_, r) => <Button size="small" icon={<EyeOutlined />} onClick={() => { setViewApp(r); setViewAppOpen(true) }}>查看</Button> },
  ]

  // 我的投递列（企业）= 企业看谁投了+审核+面试
  const entAppCols = [
    { title: '学生姓名', dataIndex: 'studentName', key: 'studentName' },
    { title: '专业', dataIndex: 'major', key: 'major' },
    { title: '匹配度', dataIndex: 'matchScore', key: 'matchScore', render: (v) => <Progress percent={v} size="small" format={() => `${v}%`} strokeColor={v >= 90 ? '#52c41a' : v >= 80 ? '#1677ff' : '#faad14'} /> },
    { title: '投递日期', dataIndex: 'applyDate', key: 'applyDate' },
    { title: '状态', key: 'status', render: (_, r) => {
      if (r.status === 'rejected' || r.status === 'pending') {
        return <Tag color={statusMap[r.status]?.color}>{statusMap[r.status]?.text}</Tag>
      }
      const inv = interviews.find(i => i.studentId === r.studentId && i.positionId === r.positionId)
      if (inv) {
        const ist = { pending: { text: '等待学生确认', color: 'orange' }, accepted: { text: '已接受面试', color: 'green' }, confirmed: { text: '已确认面试', color: 'purple' }, rejected: { text: '已拒绝面试', color: 'red' } }
        return <Tag color={ist[inv.status]?.color}>{ist[inv.status]?.text}</Tag>
      }
      return <Tag color={statusMap[r.status]?.color}>{statusMap[r.status]?.text}</Tag>
    }},
    { title: '操作', key: 'action', render: (_, r) => {
      if (r.status === 'pending') {
        return <span style={{ display: 'flex', gap: 4 }}>
          <Button size="small" type="primary" icon={<CheckCircleOutlined />} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} onClick={() => handleApproveApp(r.id)}>通过</Button>
          <Button size="small" danger icon={<CloseCircleOutlined />} onClick={() => handleRejectApp(r.id)}>拒绝</Button>
        </span>
      }
      if (r.status === 'approved') {
        const hasInvite = interviews.some(ri => ri.studentId === r.studentId && ri.positionId === r.positionId)
        if (hasInvite) return <span style={{ color: '#999' }}>-</span>
        const pos = positions.find(p => p.id === r.positionId)
        return <Button size="small" type="primary" icon={<SendOutlined />} onClick={() => { setInviteTarget({ studentId: r.studentId, studentName: r.studentName, positionId: r.positionId, positionTitle: r.positionTitle, enterpriseName: pos?.enterpriseName || '' }); inviteForm.resetFields(); setInviteOpen(true) }}>发送面试</Button>
      }
      return <span style={{ color: '#999' }}>-</span>
    }},
  ]

  // 面试邀约列（学生）
  const interviewColsStudent = [
    { title: '企业', dataIndex: 'enterpriseName', key: 'enterpriseName', render: (t) => <Tag color="blue">{t}</Tag> },
    { title: '岗位', dataIndex: 'positionTitle', key: 'positionTitle' },
    { title: '面试时间', dataIndex: 'interviewDate', key: 'interviewDate' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag> },
    { title: '操作', key: 'action', render: (_, r) => {
      if (r.status === 'pending') {
        return <span style={{ display: 'flex', gap: 4 }}>
          <Button size="small" type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} icon={<CheckCircleOutlined />} onClick={() => handleAcceptInterview(r.id)}>接受面试</Button>
          <Button size="small" danger icon={<CloseCircleOutlined />} onClick={() => handleRejectInterview(r.id)}>拒绝</Button>
        </span>
      }
      return <Tag color={r.status === 'accepted' ? 'green' : 'red'}>{r.status === 'accepted' ? '已接受' : '已拒绝'}</Tag>
    }},
  ]

  // 面试邀约列（企业）
  const interviewColsEnt = [
    { title: '学生', dataIndex: 'studentName', key: 'studentName' },
    { title: '岗位', dataIndex: 'positionTitle', key: 'positionTitle' },
    { title: '面试时间', dataIndex: 'interviewDate', key: 'interviewDate' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag> },
    { title: '操作', key: 'action', render: (_, r) => {
      if (r.status === 'accepted') return <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleConfirmInterview(r.id)}>确认面试</Button>
      if (r.status === 'pending') return <Tag color="orange">等待学生确认</Tag>
      return <span style={{ color: '#999' }}>-</span>
    }},
  ]

  // 教师推荐列（企业看）
  const entRecCols = [
    { title: '学生', dataIndex: 'studentName', key: 'studentName' },
    { title: '专业', dataIndex: 'major', key: 'major' },
    { title: '推荐教师', dataIndex: 'teacherName', key: 'teacherName', render: (t) => <Tag color="cyan">{t}</Tag> },
    { title: '推荐理由', dataIndex: 'reason', key: 'reason', ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => {
      const m = { pending: { text: '待处理', color: 'orange' }, interviewed: { text: '已邀约', color: 'green' }, rejected: { text: '已拒绝', color: 'red' } }
      return <Tag color={m[s]?.color}>{m[s]?.text}</Tag>
    }},
    { title: '操作', key: 'action', render: (_, r) => {
      if (r.status === 'pending') return <Button size="small" type="primary" icon={<SendOutlined />} onClick={() => handleRecommendToInvite(r)}>发送面试邀请</Button>
      return <span style={{ color: '#999' }}>-</span>
    }},
  ]

  // 教师推荐列（教师看自己的）
  const teacherRecCols = [
    { title: '学生', dataIndex: 'studentName', key: 'studentName' },
    { title: '推荐岗位', dataIndex: 'positionId', key: 'positionId', render: (id) => positions.find(p => p.id === id)?.title || '-' },
    { title: '推荐理由', dataIndex: 'reason', key: 'reason', ellipsis: true },
    { title: '推荐日期', dataIndex: 'recommendDate', key: 'recommendDate' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'interviewed' ? 'green' : s === 'rejected' ? 'red' : 'orange'}>{s === 'interviewed' ? '企业已邀约面试' : s === 'rejected' ? '企业已拒绝' : '待企业处理'}</Tag> },
  ]

  // ─── Tab Items ─────────────────────────────────────────────────────────
  const tabItems = useMemo(() => {
    const items = []

    // 岗位列表 - 所有人可见
    items.push({ key: 'list', label: '岗位列表', children: (
      <div>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          {hasPermission('talent.post') && <Button type="primary" icon={<PlusOutlined />} onClick={() => { postForm.resetFields(); setPostOpen(true) }}>发布岗位</Button>}
        </div>
        <Table dataSource={filteredPositions} columns={positionCols} rowKey="id" />
      </div>
    )})

    // 发布岗位
    if (hasPermission('talent.post')) items.push({ key: 'post', label: '发布岗位', children: (
      <div style={{ maxWidth: 500 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { postForm.resetFields(); setPostOpen(true) }}>发布新岗位</Button>
        <div style={{ marginTop: 16, color: '#666' }}>企业发布招聘岗位，系统自动匹配适合的学生。</div>
      </div>
    )})

    // 企业：匹配学生
    if (role === 'enterprise') items.push({ key: 'match', label: '匹配学生', children: (
      <div>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#666' }}>匹配岗位：</span>
          <Select value={selectedMatchPosition} onChange={setSelectedMatchPosition} style={{ width: 220 }}
            options={[{ value: 'all', label: '全部岗位' }, ...positions.filter(p => p.enterpriseId === enterpriseId).map(p => ({ value: String(p.id), label: p.title }))]} />
          <span style={{ color: '#999', fontSize: 13 }}>共 {filteredMatched.length} 位匹配学生</span>
        </div>
        {filteredMatched.length === 0 ? <Empty description="暂未匹配到适合的学生" /> : (
          <Table dataSource={filteredMatched} columns={matchCols} rowKey="key" />
        )}
      </div>
    )})

    // 面试邀约
    if (role === 'student' || role === 'enterprise' || role === 'council') items.push({
      key: 'interviews', label: '面试邀约', children: (
        <div>
          {role === 'student' && <p style={{ color: '#666', marginBottom: 12 }}>企业发来的面试邀请，请确认是否参加面试。</p>}
          <Table dataSource={myInterviews} columns={role === 'student' ? interviewColsStudent : interviewColsEnt} rowKey="id" />
        </div>
      )
    })

    // 我的投递/申请
    if (role === 'student' || role === 'enterprise') items.push({
      key: 'mine', label: role === 'enterprise' ? '投递管理' : '我的投递', children: (
        <Table dataSource={myApplications} columns={role === 'enterprise' ? entAppCols : studentAppCols} rowKey="id" />
      )
    })

    // 教师：我的推荐
    if (role === 'teacher') items.push({
      key: 'recommends', label: '我的推荐', children: (
        <div>
          <p style={{ color: '#666', marginBottom: 12 }}>您向企业推荐的学生，可查看企业处理状态。</p>
          <Table dataSource={myRecommendations} columns={teacherRecCols} rowKey="id" />
        </div>
      )
    })

    // 企业：教师推荐
    if (role === 'enterprise') items.push({
      key: 'teacherRecs', label: '教师推荐', children: (
        <div>
          <p style={{ color: '#666', marginBottom: 12 }}>教师推荐的学生，可发送面试邀请。</p>
          <Table dataSource={myRecommendations} columns={entRecCols} rowKey="id" />
        </div>
      )
    })

    // 智能推荐
    items.push({ key: 'ai', label: '智能推荐', children: (
      <div>
        {role === 'student' && (
          <div>
            <h4 style={{ marginBottom: 16 }}>推荐岗位（基于您的专业方向 — 计算机科学与技术）</h4>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              {[
                { title: '匹配岗位数', value: positions.filter(p => p.status === 'active').length, icon: <NodeIndexOutlined />, color: '#1677ff' },
                { title: '已投递', value: applications.filter(a => a.studentId === (user?.id || 7)).length, icon: <SendOutlined />, color: '#52c41a' },
                { title: '面试邀约', value: interviews.filter(i => i.studentId === (user?.id || 7)).length, icon: <StarOutlined />, color: '#fa8c16' },
                { title: 'AI匹配度', value: '92%', icon: <TrophyOutlined />, color: '#722ed1' },
              ].map((s, i) =>
                <Col xs={24} sm={12} lg={6} key={i}>
                  <Card size="small" style={{ background: s.color + '15', border: 'none', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: '#666' }}>{s.title}</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: s.color, display: 'flex', alignItems: 'center', gap: 8 }}>{s.icon} {s.value}</div>
                  </Card>
                </Col>
              )}
            </Row>
            <Table dataSource={positions.filter(p => p.status === 'active').slice(0, 5)} columns={[
              { title: '岗位名称', dataIndex: 'title', key: 'title' },
              { title: '企业', dataIndex: 'enterpriseName', key: 'enterpriseName', render: (t) => <Tag color="blue">{t}</Tag> },
              { title: '薪资', dataIndex: 'salary', key: 'salary' },
              { title: '匹配度', key: 'match', render: () => <Progress percent={Math.round(70 + Math.random() * 25)} size="small" format={v => `${v}%`} /> },
              { title: '操作', key: 'action', render: (_, r) => <Button size="small" type="primary" icon={<SendOutlined />} onClick={() => { setApplyPosition(r); setApplyOpen(true) }}>投递简历</Button> },
            ]} rowKey="id" />
            <div style={{ marginTop: 16, padding: 12, background: '#f0f5ff', borderRadius: 8, fontSize: 13, color: '#1677ff' }}>
              <strong>AI 职业建议：</strong>您的专业技能与嵌入式/IoT方向高度匹配，建议在投递简历时突出您的项目经验和竞赛获奖经历。人工智能方向岗位需求增长迅速，建议同步关注。
            </div>
          </div>
        )}
        {role === 'enterprise' && (
          <div>
            <h4 style={{ marginBottom: 16 }}>推荐学生（基于企业岗位需求）</h4>
            <Table dataSource={filteredMatched.slice(0, 5)} columns={[
              { title: '姓名', dataIndex: 'studentName', key: 'studentName' },
              { title: '专业', dataIndex: 'major', key: 'major' },
              { title: '匹配岗位', dataIndex: 'positionTitle', key: 'positionTitle', render: (t) => <Tag color="blue">{t}</Tag> },
              { title: '匹配度', dataIndex: 'matchScore', key: 'matchScore', render: (v) => <Progress percent={v} size="small" format={() => `${v}%`} /> },
              { title: '操作', key: 'action', render: (_, r) => <Button size="small" type="primary" icon={<SendOutlined />} onClick={() => { setInviteTarget({ studentId: r.studentId, studentName: r.studentName, positionId: r.positionId, positionTitle: r.positionTitle, enterpriseName: positions.find(p => p.id === r.positionId)?.enterpriseName || '' }); inviteForm.resetFields(); setInviteOpen(true) }}>发送面试邀请</Button> },
            ]} rowKey="key" />
          </div>
        )}
        {role === 'teacher' && (
          <div>
            <h4 style={{ marginBottom: 12 }}>推荐适合推荐的岗位 — 为学生匹配合适机会</h4>
            <Table dataSource={positions.filter(p => p.status === 'active')} columns={[
              { title: '岗位名称', dataIndex: 'title', key: 'title' },
              { title: '企业', dataIndex: 'enterpriseName', key: 'enterpriseName', render: (t) => <Tag color="blue">{t}</Tag> },
              { title: '薪资', dataIndex: 'salary', key: 'salary' },
              { title: '推荐理由', key: 'reason', render: (_, r) => {
                const recs = recommendations.filter(rec => rec.positionId === r.id && rec.teacherId === teacherId)
                return recs.length > 0 ? <Tag color="green">已推荐 {recs.length} 名学生</Tag> : <Tag color="orange">待推荐</Tag>
              }},
              { title: '操作', key: 'action', render: (_, r) => <Button size="small" type="primary" icon={<StarOutlined />} onClick={() => { setRecommendPosition(r); setRecommendOpen(true) }}>推荐学生</Button> },
            ]} rowKey="id" />
            <div style={{ marginTop: 16, padding: 12, background: '#fff7e6', borderRadius: 8, fontSize: 13, color: '#666' }}>
              <strong>推荐提示：</strong>选择学生时，优先考虑专业方向对口、有相关项目经验的学生，推荐理由写清楚能为企业解决什么问题。
            </div>
          </div>
        )}
        {role === 'mentor' && (
          <div>
            <h4 style={{ marginBottom: 12 }}>匹配学生 — 为所属企业项目推荐人选</h4>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              {[
                { title: '可用岗位', value: positions.filter(p => p.status === 'active').length, icon: <NodeIndexOutlined />, color: '#1677ff' },
                { title: '推荐学生', value: recommendations.length, icon: <TeamOutlined />, color: '#52c41a' },
                { title: '面试邀约', value: interviews.length, icon: <StarOutlined />, color: '#fa8c16' },
                { title: '已入职', value: applications.filter(a => a.status === 'approved').length, icon: <CheckCircleOutlined />, color: '#722ed1' },
              ].map((s, i) =>
                <Col xs={24} sm={12} lg={6} key={i}>
                  <Card size="small" style={{ background: s.color + '15', border: 'none', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: '#666' }}>{s.title}</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: s.color, display: 'flex', alignItems: 'center', gap: 8 }}>{s.icon} {s.value}</div>
                  </Card>
                </Col>
              )}
            </Row>
            <h4 style={{ marginBottom: 12 }}>推荐学生投递</h4>
            <Table dataSource={positions.filter(p => p.status === 'active')} columns={[
              { title: '岗位名称', dataIndex: 'title', key: 'title' },
              { title: '企业', dataIndex: 'enterpriseName', key: 'enterpriseName', render: (t) => <Tag color="blue">{t}</Tag> },
              { title: '薪资', dataIndex: 'salary', key: 'salary' },
              { title: '匹配学生', key: 'match', render: (_, r) => {
                const apps = applications.filter(a => a.positionId === r.id)
                return apps.length > 0 ? <Tag color="green">{apps.length} 名投递</Tag> : <Tag color="orange">暂无投递</Tag>
              }},
              { title: '操作', key: 'action', render: (_, r) =>
                <Button size="small" type="primary" icon={<StarOutlined />} onClick={() => { setRecommendPosition(r); setRecommendOpen(true) }}>推荐学生</Button>
              },
            ]} rowKey="id" />
            <div style={{ marginTop: 16, padding: 12, background: '#f0f5ff', borderRadius: 8, fontSize: 13, color: '#1677ff' }}>
              <strong>导师建议：</strong>作为企业导师，您可以发挥自身行业经验优势，为学生提供精准的岗位匹配推荐，帮助企业快速锁定优秀人才。
            </div>
          </div>
        )}
        {role === 'school' && (
          <div>
            <h4 style={{ marginBottom: 16 }}>人才匹配分析（本校）</h4>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              {[{ title: '本校在招岗位', value: positions.filter(p => p.status === 'active').length, icon: <NodeIndexOutlined />, color: '#1677ff' },
                { title: '本校学生投递', value: applications.length, icon: <SendOutlined />, color: '#52c41a' },
                { title: '企业面试邀约', value: interviews.length, icon: <TeamOutlined />, color: '#fa8c16' },
                { title: '成功匹配数', value: applications.filter(a => a.status === 'approved').length, icon: <CheckCircleOutlined />, color: '#722ed1' },
              ].map((s, i) =>
                <Col xs={24} sm={12} lg={6} key={i}>
                  <Card size="small" style={{ background: s.color + '15', border: 'none', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: '#666' }}>{s.title}</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: s.color, display: 'flex', alignItems: 'center', gap: 8 }}>{s.icon} {s.value}</div>
                  </Card>
                </Col>
              )}
            </Row>
            <h4 style={{ marginBottom: 12 }}>热门岗位需求排行</h4>
            <Table dataSource={positions.filter(p => p.status === 'active').map(p => ({ ...p, appCount: applications.filter(a => a.positionId === p.id).length })).sort((a, b) => b.appCount - a.appCount)} columns={[
              { title: '排名', key: 'rank', width: 60, render: (_, __, i) => <Tag color={i === 0 ? 'red' : i === 1 ? 'orange' : i === 2 ? 'blue' : 'default'}>{i + 1}</Tag> },
              { title: '岗位名称', dataIndex: 'title', key: 'title' },
              { title: '企业', dataIndex: 'enterpriseName', key: 'enterpriseName', render: (t) => <Tag color="blue">{t}</Tag> },
              { title: '薪资', dataIndex: 'salary', key: 'salary' },
              { title: '投递数', dataIndex: 'appCount', key: 'appCount' },
            ]} rowKey="id" pagination={false} />
            <div style={{ marginTop: 16, padding: 12, background: '#f0f5ff', borderRadius: 8, fontSize: 13, color: '#1677ff' }}>
              <strong>AI 分析：</strong>当前本校学生最热门的岗位方向为计算机/软件方向，人工智能相关岗位需求增长迅速，建议学校增加 AI 实训课程开设比例。
            </div>
          </div>
        )}
        {(role === 'council' || role === 'park') && (
          <div>
            <h4 style={{ marginBottom: 16 }}>人才供需智能分析</h4>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              {[{ title: '平台总岗位', value: positions.length, icon: <NodeIndexOutlined />, color: '#1677ff' },
                { title: '招聘中岗位', value: positions.filter(p => p.status === 'active').length, icon: <SendOutlined />, color: '#52c41a' },
                { title: '累计投递', value: applications.length, icon: <TeamOutlined />, color: '#fa8c16' },
                { title: '成功匹配', value: applications.filter(a => a.status === 'approved').length, icon: <CheckCircleOutlined />, color: '#722ed1' },
                { title: '面试邀约', value: interviews.length, icon: <StarOutlined />, color: '#eb2f96' },
                { title: '教师推荐', value: recommendations.length, icon: <TrophyOutlined />, color: '#13c2c2' },
              ].map((s, i) =>
                <Col xs={24} sm={12} lg={8} xl={4} key={i}>
                  <Card size="small" style={{ background: s.color + '15', border: 'none', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: '#666' }}>{s.title}</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: s.color, display: 'flex', alignItems: 'center', gap: 8 }}>{s.icon} {s.value}</div>
                  </Card>
                </Col>
              )}
            </Row>
            <h4 style={{ marginBottom: 12 }}>人才供需热力图 — 按技术方向</h4>
            <Table dataSource={[
              { field: 'AI/机器学习', positions: 3, candidates: 2, ratio: '67%' },
              { field: '嵌入式/IoT', positions: 2, candidates: 1, ratio: '50%' },
              { field: '自动驾驶', positions: 1, candidates: 1, ratio: '100%' },
              { field: '云计算/后端', positions: 2, candidates: 1, ratio: '50%' },
              { field: '前端/移动端', positions: 1, candidates: 0, ratio: '0%' },
            ]} columns={[
              { title: '技术方向', dataIndex: 'field', key: 'field', render: (t) => <Tag color="purple">{t}</Tag> },
              { title: '岗位需求', dataIndex: 'positions', key: 'positions' },
              { title: '候选人数', dataIndex: 'candidates', key: 'candidates' },
              { title: '匹配率', dataIndex: 'ratio', key: 'ratio', render: (v) => <Progress percent={parseInt(v)} size="small" strokeColor={parseInt(v) >= 50 ? '#52c41a' : '#ff4d4f'} /> },
              { title: '状态', key: 'status', render: (_, r) => parseInt(r.ratio) >= 80 ? <Tag color="green">供不应求</Tag> : parseInt(r.ratio) >= 40 ? <Tag color="orange">基本平衡</Tag> : <Tag color="red">缺口较大</Tag> },
            ]} rowKey="field" pagination={false} />
            <div style={{ marginTop: 16, padding: 12, background: '#fff7e6', borderRadius: 8, fontSize: 13, color: '#666' }}>
              <strong>AI 建议：</strong>AI/机器学习与嵌入式方向人才供需缺口明显，建议加大产教融合培养力度，鼓励相关专业院校与企业对接开展定向培养项目。
            </div>
          </div>
        )}
      </div>
    )})

    return items
  }, [filteredPositions, positionCols, matchCols, selectedMatchPosition, filteredMatched, myInterviews, interviewColsStudent, interviewColsEnt, myApplications, studentAppCols, entAppCols, myRecommendations, teacherRecCols, entRecCols, role, hasPermission])

  return (
    <Card title="人才对接">
      <Tabs items={tabItems} />

      {/* 发布岗位 */}
      <Modal title="发布新岗位" open={postOpen} onOk={handlePost} onCancel={() => { setPostOpen(false); postForm.resetFields() }} width={600}>
        <Form form={postForm} layout="vertical">
          <Form.Item name="enterpriseId" label="所属企业" rules={[{ required: true }]}><Select options={mockEnterprises.map(e => ({ value: e.id, label: e.name }))} /></Form.Item>
          <Form.Item name="title" label="岗位名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="salary" label="薪资范围"><Input placeholder="例如: 20K-40K" /></Form.Item>
          <Form.Item name="education" label="学历要求">
            <Select options={[{ value: '大专', label: '大专' }, { value: '本科', label: '本科' }, { value: '硕士', label: '硕士' }, { value: '博士', label: '博士' }]} />
          </Form.Item>
          <Form.Item name="description" label="岗位描述"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="requirements" label="任职要求"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>

      {/* 投递简历 */}
      <Modal title="投递简历" open={applyOpen} onOk={handleApply} onCancel={() => { setApplyOpen(false); setApplyPosition(null) }}>
        {applyPosition && (
          <div>
            <p>确认向 <strong>{applyPosition.enterpriseName}</strong> 投递 <strong>{applyPosition.title}</strong> 岗位？</p>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="岗位名称">{applyPosition.title}</Descriptions.Item>
              <Descriptions.Item label="企业">{applyPosition.enterpriseName}</Descriptions.Item>
              <Descriptions.Item label="薪资范围">{applyPosition.salary}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* 推荐学生 */}
      <Modal title="推荐学生" open={recommendOpen} onOk={handleRecommend} onCancel={() => { setRecommendOpen(false); setRecommendPosition(null); recommendForm.resetFields() }}>
        {recommendPosition && (
          <div>
            <p style={{ color: '#666', marginBottom: 16 }}>向 <strong>{recommendPosition.enterpriseName}</strong> 推荐学生应聘 <strong>{recommendPosition.title}</strong></p>
            <Form form={recommendForm} layout="vertical">
              <Form.Item name="studentId" label="选择学生" rules={[{ required: true }]}>
                <Select options={mockStudents.map(s => ({ value: s.id, label: `${s.name} (${s.major}, ${s.grade})` }))} />
              </Form.Item>
              <Form.Item name="reason" label="推荐理由" rules={[{ required: true }]}><Input.TextArea rows={3} placeholder="说明推荐该生的理由" /></Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* 发送面试邀请 */}
      <Modal title="发送面试邀请" open={inviteOpen} onOk={handleSendInvite} onCancel={() => { setInviteOpen(false); setInviteTarget(null); inviteForm.resetFields() }}>
        {inviteTarget && (
          <div>
            <p>向 <strong>{inviteTarget.studentName}</strong> 发送 <strong>{inviteTarget.positionTitle}</strong> 岗位的面试邀请</p>
            <Form form={inviteForm} layout="vertical">
              <Form.Item name="interviewDate" label="面试时间" rules={[{ required: true }]}><Input placeholder="例如: 2024-08-15 14:00" /></Form.Item>
              <Form.Item name="location" label="面试方式"><Input placeholder="例如: 线上腾讯会议 / 线下华为大厦" /></Form.Item>
              <Form.Item name="source" label="来源" initialValue="enterprise" hidden><Input /></Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* 岗位详情 */}
      <Modal title="岗位详情" open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={600}>
        {detailPosition && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="岗位名称">{detailPosition.title}</Descriptions.Item>
            <Descriptions.Item label="企业">{detailPosition.enterpriseName}</Descriptions.Item>
            <Descriptions.Item label="薪资"><span style={{ color: '#faad14', fontWeight: 'bold' }}>{detailPosition.salary}</span></Descriptions.Item>
            <Descriptions.Item label="学历要求">{detailPosition.education}</Descriptions.Item>
            <Descriptions.Item label="岗位描述">{detailPosition.description}</Descriptions.Item>
            <Descriptions.Item label="任职要求">{detailPosition.requirements}</Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={posStatusMap[detailPosition.status]?.color}>{posStatusMap[detailPosition.status]?.text}</Tag></Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 学生详情 */}
      <Modal title="学生详情" open={studentDetailOpen} onCancel={() => setStudentDetailOpen(false)} footer={null} width={500}>
        {detailStudent && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="姓名">{detailStudent.studentName}</Descriptions.Item>
            <Descriptions.Item label="专业">{detailStudent.major}</Descriptions.Item>
            <Descriptions.Item label="年级">{detailStudent.grade}</Descriptions.Item>
            <Descriptions.Item label="匹配岗位">{detailStudent.positionTitle}</Descriptions.Item>
            <Descriptions.Item label="匹配度">
              <Progress percent={detailStudent.matchScore} format={() => `${detailStudent.matchScore}%`} strokeColor={detailStudent.matchScore >= 90 ? '#52c41a' : detailStudent.matchScore >= 80 ? '#1677ff' : '#faad14'} />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal title="投递详情" open={viewAppOpen} onCancel={() => { setViewAppOpen(false); setViewApp(null) }} footer={null} width={520}>
        {viewApp && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="岗位名称">{viewApp.positionTitle}</Descriptions.Item>
            <Descriptions.Item label="企业">{viewApp.enterpriseName}</Descriptions.Item>
            <Descriptions.Item label="投递日期">{viewApp.applyDate}</Descriptions.Item>
            <Descriptions.Item label="匹配度">
              <Tag color={viewApp.matchScore >= 90 ? 'green' : viewApp.matchScore >= 80 ? 'blue' : 'orange'}>{viewApp.matchScore}%</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态" span={2}>
              <Tag color={statusMap[viewApp.status]?.color}>{statusMap[viewApp.status]?.text}</Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  )
}
