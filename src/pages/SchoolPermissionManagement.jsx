import { useState, useMemo } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, Select, message, Tabs, Switch, Space } from 'antd'
import { PlusOutlined, SettingOutlined } from '@ant-design/icons'
import { mockTeachers } from '../mock/teachers'
import { mockSchools } from '../mock/schools'
import { useAuth } from '../context/AuthContext'

const TITLES = ['教授', '副教授', '讲师', '助教']

const PERMISSION_KEYS = [
  { key: 'project.accept',      label: '项目承接',     desc: '查看并可承接企业发布的项目' },
  { key: 'project.assignTask',  label: '分配任务',     desc: '向学生下发项目任务' },
  { key: 'project.evaluate',    label: '五维评价',     desc: '对学生任务进行五维打分评价' },
  { key: 'talent.recommend',    label: '人才推荐',     desc: '向企业推荐学生' },
  { key: 'research.publish',    label: '发布成果',     desc: '发布科研成果到成果广场' },
  { key: 'teaching.upload',     label: '教学资源上传', desc: '上传教学资源文件' },
  { key: 'points.apply',        label: '积分申请',     desc: '申请积分兑换' },
]

const defaultPermissions = {
  '教授':   ['project.accept', 'project.assignTask', 'project.evaluate', 'talent.recommend', 'research.publish', 'teaching.upload', 'points.apply'],
  '副教授': ['project.accept', 'project.assignTask', 'project.evaluate', 'talent.recommend', 'research.publish', 'teaching.upload'],
  '讲师':   ['project.assignTask', 'project.evaluate', 'talent.recommend', 'teaching.upload'],
  '助教':   ['project.assignTask', 'project.evaluate'],
}

function loadPermissions() {
  try {
    const saved = localStorage.getItem('school_permission_config')
    return saved ? JSON.parse(saved) : defaultPermissions
  } catch { return defaultPermissions }
}

function savePermissions(cfg) {
  localStorage.setItem('school_permission_config', JSON.stringify(cfg))
}

export default function SchoolPermissionManagement() {
  const { user } = useAuth()
  const role = user?.role || 'admin'
  const schoolId = user?.schoolId

  const [teachers, setTeachers] = useState(mockTeachers.map(t => ({ ...t })))
  const [permissions, setPermissions] = useState(loadPermissions)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const filteredTeachers = useMemo(() => {
    if (role === 'school') return teachers.filter(t => t.schoolId === schoolId)
    return teachers
  }, [teachers, role, schoolId])

  const schoolMap = Object.fromEntries(mockSchools.map(s => [s.id, s.name]))

  const togglePermission = (title, permKey) => {
    const current = permissions[title] || []
    const updated = current.includes(permKey)
      ? current.filter(k => k !== permKey)
      : [...current, permKey]
    const cfg = { ...permissions, [title]: updated }
    setPermissions(cfg)
    savePermissions(cfg)
  }

  const handleAdd = () => {
    form.validateFields().then(values => {
      setTeachers([...teachers, { id: teachers.length + 1, ...values, schoolId: schoolId || values.schoolId }])
      message.success('添加教师成功！')
      setModalOpen(false)
      form.resetFields()
    })
  }

  const teacherColumns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '所属院校', dataIndex: 'schoolId', key: 'schoolId', render: (id) => schoolMap[id] || '未知' },
    { title: '职称', dataIndex: 'title', key: 'title', render: (t, r) => (
      <Select size="small" value={t} style={{ width: 100 }}
        onChange={v => {
          setTeachers(teachers.map(tr => tr.id === r.id ? { ...tr, title: v } : tr))
          const permCount = (permissions[v] || []).length
          message.success(`已更新为${v}，关联 ${permCount} 项权限`)
        }}
        options={TITLES.map(t => ({ value: t, label: t }))}
      />
    )},
    { title: '院系', dataIndex: 'department', key: 'department' },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '关联权限', key: 'perms', render: (_, r) => {
      const ps = permissions[r.title] || []
      if (ps.length === 0) return <Tag color="default">无权限</Tag>
      return <Space wrap size={[0, 4]}>{ps.map(k => {
        const def = PERMISSION_KEYS.find(p => p.key === k)
        return <Tag key={k} color="blue">{def?.label || k}</Tag>
      })}</Space>
    }},
  ]

  const permTab = (
    <div>
      <p style={{ color: '#666', marginBottom: 16 }}>按教师职称配置可用权限，修改后即时生效。教师登录时根据其职称自动赋予对应权限。</p>
      <Table
        dataSource={TITLES.map(title => ({ key: title, title, ...PERMISSION_KEYS.reduce((acc, p) => ({ ...acc, [p.key]: (permissions[title] || []).includes(p.key) }), {}) }))}
        rowKey="key"
        pagination={false}
        columns={[
          { title: '职称', dataIndex: 'title', key: 'title', width: 100, render: (t) => <Tag color="blue" style={{ fontSize: 14 }}>{t}</Tag> },
          ...PERMISSION_KEYS.map(p => ({
            title: (
              <div>
                <div style={{ fontWeight: 500 }}>{p.label}</div>
                <div style={{ fontSize: 11, color: '#999', fontWeight: 400 }}>{p.desc}</div>
              </div>
            ),
            key: p.key,
            align: 'center',
            width: 140,
            render: (_, r) => <Switch checked={r[p.key]} onChange={() => togglePermission(r.title, p.key)} />,
          })),
        ]}
      />
    </div>
  )

  const teacherTab = (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>添加教师</Button>
        <span style={{ marginLeft: 12, color: '#666', fontSize: 13 }}>点击职称列可直接切换职称，权限自动同步</span>
      </div>
      <Table dataSource={filteredTeachers} columns={teacherColumns} rowKey="id" />

      <Modal title="添加教师" open={modalOpen} onOk={handleAdd} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="schoolId" label="所属院校" rules={[{ required: true }]} initialValue={role === 'school' ? schoolId : undefined}>
            <Select options={mockSchools.map(s => ({ value: s.id, label: s.name }))} disabled={role === 'school'} />
          </Form.Item>
          <Form.Item name="title" label="职称" initialValue="讲师">
            <Select options={TITLES.map(t => ({ value: t, label: t }))} />
          </Form.Item>
          <Form.Item name="department" label="院系"><Input /></Form.Item>
          <Form.Item name="phone" label="联系电话"><Input /></Form.Item>
          <Form.Item name="email" label="邮箱"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  )

  return (
    <Card title={<span><SettingOutlined /> 权限管理</span>}>
      <Tabs items={[
        { key: 'perm', label: '权限配置', children: permTab },
        { key: 'teacher', label: '教师账号', children: teacherTab },
      ]} />
    </Card>
  )
}
