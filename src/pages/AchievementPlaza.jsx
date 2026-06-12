import { useState, useMemo } from 'react'
import { Card, Row, Col, Tag, Button, Modal, Form, Input, Select, message, Space, Empty, Typography, Popconfirm, Image } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, ExperimentOutlined, BookOutlined, TrophyOutlined, TeamOutlined } from '@ant-design/icons'
import { mockTeachers } from '../mock/teachers'
import { mockSchools } from '../mock/schools'
import { useAuth } from '../context/AuthContext'

const { Text, Paragraph } = Typography

const typeConfig = {
  '科研成果': { color: 'blue', icon: <FileTextOutlined /> },
  '技术方案': { color: 'purple', icon: <ExperimentOutlined /> },
  '专利软著': { color: 'cyan', icon: <BookOutlined /> },
  '教学案例': { color: 'gold', icon: <TrophyOutlined /> },
}

const mockAchievements = [
  { id: 1, title: '基于深度学习的医学影像分析系统', type: '科研成果', teacherId: 1, teacherName: '张教授', schoolId: 1, schoolName: '深圳大学', description: '提出了一种新型的CNN-Transformer混合架构，在肺部CT影像分析中达到99.2%的准确率，发表于Nature Medicine。该成果已应用于合作医院的临床辅助诊断系统。', completionDate: '2024-03-15', tags: ['AI', '深度学习', '医学影像'], certificateUrl: '' },
  { id: 2, title: '产线AI视觉检测技术方案', type: '技术方案', teacherId: 2, teacherName: '李教授', schoolId: 1, schoolName: '深圳大学', description: '针对电子制造产线质检需求，基于YOLOv8和多光谱成像技术，实现缺陷检测准确率99.6%。方案已在华为产线试点应用，漏检率降低80%。', completionDate: '2024-05-20', tags: ['机器视觉', '工业检测', 'AI'], certificateUrl: '' },
  { id: 3, title: '智能医疗影像识别系统V2.0', type: '专利软著', teacherId: 1, teacherName: '张教授', schoolId: 1, schoolName: '深圳大学', description: '发明专利：一种基于多模态融合的医疗影像智能识别方法及系统。专利号：ZL202410000123.4，已获得授权。', completionDate: '2024-05-20', tags: ['专利', '医疗影像', '多模态'], certificateUrl: '' },
  { id: 4, title: '工业机器人智能分拣教学案例', type: '教学案例', teacherId: 3, teacherName: '王老师', schoolId: 2, schoolName: '深圳职业技术学院', description: '基于机器视觉的工业机器人智能分拣系统完整教学案例，包含项目任务书、实验指导手册、视频资源。已在高职院校推广使用。', completionDate: '2024-04-10', tags: ['机器人', '教学', '分拣'], certificateUrl: '' },
  { id: 5, title: '5G毫米波通信天线技术方案', type: '技术方案', teacherId: 2, teacherName: '李教授', schoolId: 1, schoolName: '深圳大学', description: '设计了一种新型宽带毫米波天线阵列，工作频率覆盖24-43GHz，适用于5G基站和终端设备。该方案已在多家通信设备制造商试用。', completionDate: '2024-02-28', tags: ['5G', '天线', '通信'], certificateUrl: '' },
  { id: 6, title: '新能源汽车电池管理系统', type: '专利软著', teacherId: 4, teacherName: '陈教授', schoolId: 3, schoolName: '华南理工大学', description: '发明专利：一种基于电化学模型的动力电池SOC在线估计方法及系统。专利号：ZL202410000567.8', completionDate: '2024-03-30', tags: ['新能源', '电池管理系统', '汽车'], certificateUrl: '' },
  { id: 7, title: '无人机编队协同控制教学案例', type: '教学案例', teacherId: 5, teacherName: '黄老师', schoolId: 2, schoolName: '深圳职业技术学院', description: '面向无人机应用技术课程的编队控制综合教学案例，包含理论讲解、仿真实验、实飞训练三个阶段，适合高职院校无人机专业教学。', completionDate: '2024-06-10', tags: ['无人机', '编队控制', '教学'], certificateUrl: '' },
  { id: 8, title: '基于知识图谱的智能问答系统', type: '科研成果', teacherId: 6, teacherName: '刘老师', schoolId: 4, schoolName: '广东工业大学', description: '构建了面向制造业的领域知识图谱，并开发了基于大语言模型和知识图谱的智能问答系统，在多家制造企业完成部署验证。', completionDate: '2024-06-01', tags: ['知识图谱', '大模型', '问答系统'], certificateUrl: '' },
]

export default function AchievementPlaza() {
  const { user, hasPermission } = useAuth()
  const [achievements, setAchievements] = useState(mockAchievements)
  const [filterType, setFilterType] = useState('all')
  const [filterField, setFilterField] = useState('all')
  const [filterSchool, setFilterSchool] = useState('all')
  const [publishOpen, setPublishOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailAchievement, setDetailAchievement] = useState(null)
  const [coopOpen, setCoopOpen] = useState(false)
  const [coopTarget, setCoopTarget] = useState(null)
  const [publishForm] = Form.useForm()
  const [coopForm] = Form.useForm()

  const role = user?.role || 'admin'
  const teacherId = user?.teacherId
  const schoolId = user?.schoolId

  const isSchoolRole = role === 'school'

  const filteredAchievements = useMemo(() => {
    let list = achievements

    if (isSchoolRole && schoolId) {
      list = list.filter(a => a.schoolId === schoolId)
    }

    if (filterType !== 'all') {
      list = list.filter(a => a.type === filterType)
    }

    if (filterField !== 'all') {
      list = list.filter(a => a.tags.includes(filterField))
    }

    if (!isSchoolRole && filterSchool !== 'all') {
      list = list.filter(a => a.schoolId === parseInt(filterSchool))
    }

    return list
  }, [achievements, filterType, filterField, filterSchool, isSchoolRole, schoolId])

  const fieldOptions = useMemo(() => {
    const fields = new Set()
    achievements.forEach(a => a.tags.forEach(t => fields.add(t)))
    return Array.from(fields).sort()
  }, [achievements])

  const handlePublish = () => {
    publishForm.validateFields().then(values => {
      const teacher = mockTeachers.find(t => t.id === values.teacherId)
      const school = mockSchools.find(s => s.id === teacher?.schoolId)
      const newAch = {
        id: achievements.length + 1,
        ...values,
        teacherName: teacher?.name || '未知',
        schoolId: teacher?.schoolId || 0,
        schoolName: school?.name || '未知',
        tags: values.tags ? values.tags.split(',').map(t => t.trim()) : [],
      }
      setAchievements([newAch, ...achievements])
      message.success('发布成果成功！')
      setPublishOpen(false)
      publishForm.resetFields()
    })
  }

  const handleDelete = (ach) => {
    setAchievements(achievements.filter(a => a.id !== ach.id))
    message.success('已删除成果')
  }

  const handleEdit = (ach) => {
    publishForm.setFieldsValue({
      teacherId: ach.teacherId,
      title: ach.title,
      type: ach.type,
      description: ach.description,
      tags: ach.tags?.join(', ') || '',
      completionDate: ach.completionDate,
      certificateUrl: ach.certificateUrl || '',
    })
    setAchievements(achievements.filter(a => a.id !== ach.id))
    setPublishOpen(true)
  }

  const handleCooperate = () => {
    coopForm.validateFields().then(values => {
      message.success(`已向 ${coopTarget?.teacherName} 发起对接邀请！（备注：${values.message || '无'})`)
      setCoopOpen(false)
      setCoopTarget(null)
      coopForm.resetFields()
    })
  }

  const canPublish = hasPermission('research.publish')

  return (
    <Card
      title={isSchoolRole ? '本校科研成果' : '科研成果广场'}
      extra={canPublish ? (
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { publishForm.resetFields(); setPublishOpen(true) }}>发布成果</Button>
      ) : null}
    >
      {/* Filters */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Space>
          <span style={{ color: '#666' }}>成果类型：</span>
          <Select value={filterType} onChange={setFilterType} style={{ width: 130 }}
            options={[
              { value: 'all', label: '全部类型' },
              ...Object.keys(typeConfig).map(t => ({ value: t, label: t })),
            ]}
          />
        </Space>
        <Space>
          <span style={{ color: '#666' }}>所属领域：</span>
          <Select value={filterField} onChange={setFilterField} style={{ width: 150 }}
            options={[{ value: 'all', label: '全部领域' }, ...fieldOptions.map(f => ({ value: f, label: f }))]}
          />
        </Space>
        {!isSchoolRole && (
          <Space>
            <span style={{ color: '#666' }}>院校：</span>
            <Select value={filterSchool} onChange={setFilterSchool} style={{ width: 180 }}
              options={[
                { value: 'all', label: '全部院校' },
                ...mockSchools.map(s => ({ value: String(s.id), label: s.name })),
              ]}
            />
          </Space>
        )}
      </div>

      {/* Card Grid */}
      {filteredAchievements.length === 0 ? (
        <Empty description="暂无匹配的成果" />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredAchievements.map(a => {
            const isOwn = role === 'teacher' && a.teacherId === teacherId
            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={a.id}>
                <Card
                  hoverable
                  style={isOwn ? { border: '2px solid #1677ff' } : {}}
                  actions={[
                    <Button type="link" icon={<EyeOutlined />} onClick={() => { setDetailAchievement(a); setDetailOpen(true) }}>查看</Button>,
                    <Button type="link" icon={<TeamOutlined />} onClick={() => { setCoopTarget(a); setCoopOpen(true) }}>发起对接</Button>,
                    ...(isOwn ? [
                      <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(a)}>编辑</Button>,
                      <Popconfirm title="确定删除此成果？" onConfirm={() => handleDelete(a)} okText="确定" cancelText="取消">
                        <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
                      </Popconfirm>,
                    ] : []),
                  ]}
                >
                  <div style={{ marginBottom: 8 }}>
                    <Tag color={typeConfig[a.type]?.color} icon={typeConfig[a.type]?.icon}>
                      {a.type}
                    </Tag>
                    {isOwn && <Tag color="blue" style={{ marginLeft: 4 }}>我的成果</Tag>}
                  </div>
                  <Text strong style={{ fontSize: 15 }} ellipsis={{ tooltip: a.title }}>
                    {a.title}
                  </Text>
                  <div style={{ marginTop: 8, color: '#666', fontSize: 13 }}>
                    <div>{a.teacherName} · {a.schoolName}</div>
                    <div style={{ marginTop: 4 }}>{a.completionDate}</div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {a.tags.slice(0, 3).map(tag => (
                      <Tag key={tag} style={{ fontSize: 11, marginBottom: 4 }}>{tag}</Tag>
                    ))}
                    {a.tags.length > 3 && <Tag style={{ fontSize: 11 }}>+{a.tags.length - 3}</Tag>}
                  </div>
                </Card>
              </Col>
            )
          })}
        </Row>
      )}

      {/* Publish / Edit Modal */}
      <Modal title="发布成果" open={publishOpen} onOk={handlePublish} onCancel={() => { setPublishOpen(false); publishForm.resetFields() }} width={640}>
        <Form form={publishForm} layout="vertical">
          <Form.Item name="teacherId" label="选择教师" rules={[{ required: true }]}>
            <Select options={mockTeachers.map(t => ({ value: t.id, label: `${t.name} (${mockSchools.find(s => s.id === t.schoolId)?.name || '未知'})` }))} />
          </Form.Item>
          <Form.Item name="title" label="成果名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="type" label="成果类型" rules={[{ required: true }]}>
            <Select options={Object.keys(typeConfig).map(t => ({ value: t, label: t }))} />
          </Form.Item>
          <Form.Item name="description" label="成果描述" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Input placeholder="用逗号分隔，例如: AI,深度学习,视觉" />
          </Form.Item>
          <Form.Item name="completionDate" label="完成日期" rules={[{ required: true }]}>
            <Input placeholder="例如: 2024-06-01" />
          </Form.Item>
          <Form.Item name="certificateUrl" label="证书图片链接">
            <Input placeholder="可上传证书图片URL（可选）" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal title="成果详情" open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={700}>
        {detailAchievement && (
          <div>
            <Tag color={typeConfig[detailAchievement.type]?.color} icon={typeConfig[detailAchievement.type]?.icon} style={{ marginBottom: 16, padding: '4px 12px', fontSize: 14 }}>
              {detailAchievement.type}
            </Tag>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>{detailAchievement.title}</h3>
            <div style={{ color: '#666', marginBottom: 16 }}>
              <span>{detailAchievement.teacherName}</span>
              <span style={{ margin: '0 8px' }}>·</span>
              <span>{detailAchievement.schoolName}</span>
              <span style={{ margin: '0 8px' }}>·</span>
              <span>{detailAchievement.completionDate}</span>
            </div>
            <div style={{ marginBottom: 16 }}>
              {detailAchievement.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
            </div>
            <Paragraph style={{ fontSize: 14, lineHeight: 1.8, background: '#fafafa', padding: 16, borderRadius: 8 }}>
              {detailAchievement.description}
            </Paragraph>
            {detailAchievement.certificateUrl ? (
              <div style={{ marginTop: 16 }}>
                <Text strong>证书：</Text>
                <Image width={200} src={detailAchievement.certificateUrl} />
              </div>
            ) : (
              <div style={{ marginTop: 16, color: '#999' }}>暂无证书附件</div>
            )}
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Button type="primary" size="large" icon={<TeamOutlined />} onClick={() => { setDetailOpen(false); setCoopTarget(detailAchievement); setCoopOpen(true) }}>
                发起对接
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cooperation Invite Modal */}
      <Modal title="发起对接邀请" open={coopOpen} onOk={handleCooperate} onCancel={() => { setCoopOpen(false); setCoopTarget(null); coopForm.resetFields() }} width={500}>
        {coopTarget && (
          <div>
            <p style={{ marginBottom: 16, color: '#666' }}>
              向 <strong>{coopTarget.teacherName}</strong> 发起合作对接邀请（成果：{coopTarget.title}）
            </p>
            <Form form={coopForm} layout="vertical">
              <Form.Item name="message" label="对接说明" rules={[{ required: true }]}>
                <Input.TextArea rows={4} placeholder="请说明您的合作意向和需求..." />
              </Form.Item>
              <Form.Item name="contact" label="联系方式">
                <Input placeholder="手机号或邮箱（可选）" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </Card>
  )
}
