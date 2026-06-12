import { useState, useMemo } from 'react'
import { Card, Row, Col, Tag, Button, Modal, Form, Input, Select, message, Image, Space, Empty, Typography, DatePicker, Popconfirm } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, TrophyOutlined, FileTextOutlined, ExperimentOutlined, BookOutlined, CrownOutlined } from '@ant-design/icons'
import { mockResearchProjects } from '../mock/research'
import { mockTeachers } from '../mock/teachers'
import { mockSchools } from '../mock/schools'
import { useAuth } from '../context/AuthContext'

const { Text, Paragraph } = Typography

const typeConfig = {
  '论文': { color: 'blue', icon: <FileTextOutlined /> },
  '专利': { color: 'purple', icon: <ExperimentOutlined /> },
  '软著': { color: 'cyan', icon: <BookOutlined /> },
  '竞赛': { color: 'gold', icon: <TrophyOutlined /> },
  '项目': { color: 'green', icon: <CrownOutlined /> },
}

export default function ResearchPool() {
  const { user, hasPermission } = useAuth()
  const [projects, setProjects] = useState(mockResearchProjects)
  const [filterType, setFilterType] = useState('all')
  const [filterSchool, setFilterSchool] = useState('all')
  const [publishOpen, setPublishOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailProject, setDetailProject] = useState(null)
  const [publishForm] = Form.useForm()

  const role = user?.role || 'admin'
  const teacherId = user?.teacherId
  const schoolId = user?.schoolId

  const teacherMap = Object.fromEntries(mockTeachers.map(t => [t.id, t.name]))

  // Role-based filtering: school role sees only achievements from their school
  // teacher can override filter to see their school's achievements via filterSchool
  // For school role, filter out school dropdown and auto-filter
  const isSchoolRole = role === 'school'

  const filteredProjects = useMemo(() => {
    let list = projects

    // School role: only see their own school's achievements
    if (isSchoolRole && schoolId) {
      list = list.filter(p => p.schoolId === schoolId)
    }

    if (filterType !== 'all') {
      list = list.filter(p => p.type === filterType)
    }

    if (!isSchoolRole && filterSchool !== 'all') {
      list = list.filter(p => p.schoolId === parseInt(filterSchool))
    }

    return list
  }, [projects, filterType, filterSchool, isSchoolRole, schoolId])

  const handlePublish = () => {
    publishForm.validateFields().then(values => {
      const teacher = mockTeachers.find(t => t.id === values.teacherId)
      const school = mockSchools.find(s => s.id === teacher?.schoolId)
      const newProj = {
        id: projects.length + 1,
        ...values,
        teacherName: teacher?.name || '未知',
        schoolId: teacher?.schoolId || 0,
        schoolName: school?.name || '未知',
        status: 'published',
        tags: values.tags ? values.tags.split(',').map(t => t.trim()) : [],
      }
      setProjects([newProj, ...projects])
      message.success('发布科研成果成功！')
      setPublishOpen(false)
      publishForm.resetFields()
    })
  }

  const handleDelete = (proj) => {
    setProjects(projects.filter(p => p.id !== proj.id))
    message.success('已删除成果')
  }

  const handleEdit = (proj) => {
    // For now, pre-fill the publish form with existing data and open it
    publishForm.setFieldsValue({
      teacherId: proj.teacherId,
      title: proj.title,
      type: proj.type,
      description: proj.description,
      tags: proj.tags?.join(', ') || '',
      completionDate: proj.completionDate,
      certificateUrl: proj.certificateUrl || '',
    })
    setPublishOpen(true)
    // Remove the old entry; on publish we add a new one
    setProjects(projects.filter(p => p.id !== proj.id))
  }

  const canPublish = hasPermission('research.publish')

  return (
    <Card
      title={isSchoolRole ? '本校科研成果' : '科研成果池'}
      extra={canPublish ? (
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { publishForm.resetFields(); setPublishOpen(true) }}>发布成果</Button>
      ) : null}
    >
      {/* Filters */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Space>
          <span style={{ color: '#666' }}>类型：</span>
          <Select value={filterType} onChange={setFilterType} style={{ width: 120 }}
            options={[
              { value: 'all', label: '全部' },
              { value: '论文', label: '论文' },
              { value: '专利', label: '专利' },
              { value: '软著', label: '软著' },
              { value: '竞赛', label: '竞赛' },
              { value: '项目', label: '项目' },
            ]}
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
      {filteredProjects.length === 0 ? (
        <Empty description="暂无匹配的科研成果" />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredProjects.map(p => {
            const isOwn = role === 'teacher' && p.teacherId === teacherId
            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={p.id}>
                <Card
                  hoverable
                  style={isOwn ? { border: '2px solid #1677ff' } : {}}
                  actions={[
                    <Button type="link" icon={<EyeOutlined />} onClick={() => { setDetailProject(p); setDetailOpen(true) }}>查看详情</Button>,
                    ...(isOwn ? [
                      <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(p)}>编辑</Button>,
                      <Popconfirm title="确定删除此成果？" onConfirm={() => handleDelete(p)} okText="确定" cancelText="取消">
                        <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
                      </Popconfirm>,
                    ] : []),
                  ]}
                >
                  <div style={{ marginBottom: 8 }}>
                    <Tag color={typeConfig[p.type]?.color} icon={typeConfig[p.type]?.icon}>
                      {p.type}
                    </Tag>
                    {isOwn && <Tag color="blue" style={{ marginLeft: 4 }}>我的成果</Tag>}
                  </div>
                  <Text strong style={{ fontSize: 15 }} ellipsis={{ tooltip: p.title }}>
                    {p.title}
                  </Text>
                  <div style={{ marginTop: 8, color: '#666', fontSize: 13 }}>
                    <div>{p.teacherName} · {p.schoolName}</div>
                    <div style={{ marginTop: 4 }}>{p.completionDate}</div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {p.tags.map(tag => (
                      <Tag key={tag} style={{ fontSize: 11, marginBottom: 4 }}>{tag}</Tag>
                    ))}
                  </div>
                </Card>
              </Col>
            )
          })}
        </Row>
      )}

      {/* Publish / Edit Modal */}
      <Modal title={publishForm.getFieldValue('teacherId') ? '编辑科研成果' : '发布科研成果'} open={publishOpen} onOk={handlePublish} onCancel={() => { setPublishOpen(false); publishForm.resetFields() }} width={640}>
        <Form form={publishForm} layout="vertical">
          <Form.Item name="teacherId" label="选择教师" rules={[{ required: true }]}>
            <Select options={mockTeachers.map(t => ({ value: t.id, label: `${t.name} (${mockSchools.find(s => s.id === t.schoolId)?.name || '未知'})` }))} />
          </Form.Item>
          <Form.Item name="title" label="成果名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="type" label="成果类型" rules={[{ required: true }]}>
            <Select options={[{ value: '论文', label: '论文' }, { value: '专利', label: '专利' }, { value: '软著', label: '软著' }, { value: '竞赛', label: '竞赛' }, { value: '项目', label: '项目' }]} />
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
        {detailProject && (
          <div>
            <Tag color={typeConfig[detailProject.type]?.color} icon={typeConfig[detailProject.type]?.icon} style={{ marginBottom: 16, padding: '4px 12px', fontSize: 14 }}>
              {detailProject.type}
            </Tag>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>{detailProject.title}</h3>
            <div style={{ color: '#666', marginBottom: 16 }}>
              <span>{detailProject.teacherName}</span>
              <span style={{ margin: '0 8px' }}>·</span>
              <span>{detailProject.schoolName}</span>
              <span style={{ margin: '0 8px' }}>·</span>
              <span>{detailProject.completionDate}</span>
            </div>
            <div style={{ marginBottom: 16 }}>
              {detailProject.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
            </div>
            <Paragraph style={{ fontSize: 14, lineHeight: 1.8, background: '#fafafa', padding: 16, borderRadius: 8 }}>
              {detailProject.description}
            </Paragraph>
            {detailProject.certificateUrl && (
              <div style={{ marginTop: 16 }}>
                <Text strong>证书：</Text>
                <Image width={200} src={detailProject.certificateUrl} fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QO0E2J16icJv3mEgg1MKWkFheH+vkDnCq4gaLxCVBsfx5zckFpUQmIGIor4NpSdxiF4RZFQZJKUOYSA3sDR2dGQYACUGr4hOQMpM8AsWWSf0FgcxgDI4soiOCqbEhJs6YEEf4iBiZnJsYCjYkPFqKbvQxT3ZfYVP8UQr6P4V/Nnk9OgMqjGPMkBamtGEDzDBJLUn4P1K4C8jGX9w0L9TMkL5WkIGkvY90twLUl8I+CBYUZF0yOGUtHYPf7pZkglF8nhCFPQcJ9NYwNHL1jY2RgAQk9RHxn9Z8+Y5H/BfwRIVZ0ExYmOgAAAKpJREFUeNrt3dtuklEQBdD//6vm5ipyQSi0nQVM3Pu8LSF0xeQcL0w6PP2MdsfZbBHkQ4cOHTr8d5V2Bw4dOnTo0KFDhw4dOnTo0KFDhw4dOnTo0KFDhw7/RVvbBx06dOjQoUOHDh06dOjQoUOHDh06dOjQoUOHDv071G4HOvw/abfb7YOnp6f98fFx/3q97p+enu4vLy8Xy8vLxev1erFcLhfL5XKxXq8X2+324n6/L+7f35/v/v7+fL/fP5fL5eJ2uy1ut9vidrs9ns/nYrVaLa7X6+J6vS5ut9vj3+92u8VqtVo8Ho/F4/FY3O/3xWazWXx8fCy2221xvV4X+/1+cb1eF7fbbfHx8bG43W7P1+v1sVqtnn99fT1ut9vj3Xa7LQ6Hwzn2yfn39/d5Pp/Pf87n86/v7+//b5Af/WK3222e7+/v/7y/v/95PB7nz8fHx99x/3g8/j4ej/N+v58/Pz//vt/v5/f7fZ7P5/Pn5+fn3Xa7nR+PRx+Px+PxeDzO6/V6nq7r9jRN01mW5TRN01mW5TRN01mW5TRN01mW5fT6+jrd7/d5vV7P+/1+HpfLZZ6m6TxN03mapvM0Tedpms7TNJ2naTpP03Sepuk8TdN5mqbzNE3naZrO0zTN52maztM0nadpOk/TdJ6m6TxN03mapvM8TfN5mqbzNE3n7Xabr9frfD6fT8/zfJqXy2Wepuk8TdN5mqbzNE3n5+fnfL/f52maTvM0nadjx47b7XaepLycllNOOeWUU0455ZRTTuHr16+np6en0zRNp2maTtM0naZpOk3TdJqm6TRN02maptM0Tedpms7TNJ1vv1+/fr1pmqbz9vZ2nqbpnKZpOk3TVBTg5+fn/oaE+5t7a0jURTljjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxpjj9E/hJ4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4z5D39VWf/9pf7//2+MXwHcFv8AsF3FdgAAADV0RVh0ZGF0ZTpjcmVhdGUAMjAyNC0wNy0wMVQxNjowNjoyMyswMDowMGkKrdYAAAAASUVORK5CYII=" placeholder={<Image preview={{ visible: false }} />} />
              </div>
            )}
            {!detailProject.certificateUrl && (
              <div style={{ marginTop: 16, color: '#999' }}>
                暂无证书附件
              </div>
            )}
          </div>
        )}
      </Modal>
    </Card>
  )
}
