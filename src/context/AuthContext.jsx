import { createContext, useContext, useState, useMemo } from 'react'

const AuthContext = createContext(null)

const roleMeta = {
  council:    { schoolId: null,      enterpriseId: null,  teacherId: null,  label: '产教融合理事会' },
  park:       { schoolId: null,      enterpriseId: null,  teacherId: null,  label: '园区', parkId: 1 },
  enterprise: { schoolId: null,      enterpriseId: 1,     teacherId: null,  label: '企业' },
  mentor:     { schoolId: null,      enterpriseId: 1,     teacherId: null,  label: '企业导师' },
  school:     { schoolId: 1,         enterpriseId: null,  teacherId: null,  label: '院校' },
  teacher:    { schoolId: 1,         enterpriseId: null,  teacherId: 1,     label: '教师' },
  student:    { schoolId: 1,         enterpriseId: null,  teacherId: null,  label: '学生' },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('auth_user')
    return saved ? JSON.parse(saved) : null
  })

  const enrichedUser = useMemo(() => {
    if (!user) return null
    const meta = roleMeta[user.role] || {}
    return { ...user, ...meta }
  }, [user])

  const accounts = {
    council:    { id: 1,  username: 'council',  name: '理事会管理员',   role: 'council',    avatar: '' },
    park:       { id: 2,  username: 'park',      name: '王园区',        role: 'park',       avatar: '' },
    enterprise: { id: 3,  username: 'enterprise', name: '赵总（华为）',  role: 'enterprise', avatar: '' },
    mentor:     { id: 4,  username: 'mentor',    name: '王导师（华为）', role: 'mentor',     avatar: '' },
    school:     { id: 5,  username: 'school',    name: '李校长（深大）', role: 'school',     avatar: '' },
    teacher:    { id: 6,  username: 'teacher',   name: '张教授（深大）', role: 'teacher',    avatar: '' },
    student:    { id: 7,  username: 'student',   name: '张三（深大）',   role: 'student',    avatar: '' },
  }

  const login = (username, password) => {
    const userData = accounts[username]
    if (userData && password === 'admin123') {
      localStorage.setItem('auth_user', JSON.stringify(userData))
      localStorage.setItem('token', 'demo-token-2024')
      setUser(userData)
      return { success: true }
    }
    return { success: false, message: '用户名或密码错误' }
  }

  const logout = () => {
    localStorage.removeItem('auth_user')
    localStorage.removeItem('token')
    setUser(null)
  }

  const hasPermission = (action, context) => {
    if (!enrichedUser) return false
    const { role, schoolId, teacherId } = enrichedUser
    if (role === 'council') return true  // 理事会全权限

    switch (action) {
      case 'project.publish':      return role === 'enterprise'
      case 'project.teacherReview': return role === 'teacher'  // 教师初审
      case 'project.schoolReview':  return role === 'school'   // 学校复审
      case 'project.publishToStudents': return role === 'teacher'  // 教师发布给学生
      case 'project.assignTask':   return role === 'teacher'   // 教师分配任务
      case 'project.submit':       return role === 'student'   // 学生提交
      case 'project.evaluate':     return role === 'teacher'   // 教师打分评价
      case 'resource.publish':  return role === 'school'
      case 'resource.apply':    return role === 'enterprise'
      case 'resource.manageApp': return role === 'school'
      case 'quota.publish':     return role === 'enterprise'
      case 'quota.accept':      return role === 'school'
      case 'quota.complete':    return role === 'school'
      case 'research.publish':  return role === 'teacher'
      case 'research.edit':     return role === 'teacher' && context?.teacherId === teacherId
      case 'research.delete':   return role === 'teacher' && context?.teacherId === teacherId
      case 'talent.post':       return role === 'enterprise'
      case 'talent.resume':     return role === 'student'
      case 'talent.recommend':  return role === 'teacher'
      case 'teaching.upload':   return role === 'teacher'
      case 'teaching.review':   return role === 'school'
      case 'points.apply':      return ['enterprise', 'mentor', 'school', 'teacher', 'student'].includes(role)
      case 'points.audit':      return role === 'council'
      case 'view.all':          return role === 'council'
      default: return false
    }
  }

  return (
    <AuthContext.Provider value={{ user: enrichedUser, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
