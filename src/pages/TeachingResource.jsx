import { useState, useMemo } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, InputNumber, Select, Tabs, message, Row, Col, Space, Empty, Typography, Progress, Popconfirm, Descriptions, Upload } from 'antd'
import { PlusOutlined, UploadOutlined, CheckCircleOutlined, CloseCircleOutlined, FileTextOutlined, BookOutlined, LinkOutlined } from '@ant-design/icons'
import { mockTeachers } from '../mock/teachers'
import { mockSchools } from '../mock/schools'
import { useAuth } from '../context/AuthContext'

const { Text, Paragraph } = Typography

const difficultyConfig = {
  '初级': { color: 'green' },
  '中级': { color: 'orange' },
  '高级': { color: 'red' },
}

// ==================== Mock Data ====================

const mockTeachingResources = [
  { id: 1, name: '智能仓储系统-项目任务书', teacherId: 1, teacherName: '张教授', schoolId: 1, schoolName: '深圳大学', difficulty: '初级', domain: '物联网', fileType: '项目任务书', description: '基于RFID的智能仓储管理系统项目任务书，包含项目背景、目标、技术路线、验收标准等内容。', fileCount: 3, status: 'approved', submitDate: '2024-05-10', reviewComment: '内容完整，符合教学要求' },
  { id: 2, name: 'AI视觉检测-实验指导手册', teacherId: 2, teacherName: '李教授', schoolId: 1, schoolName: '深圳大学', difficulty: '高级', domain: 'AI算法', fileType: '指导手册', description: '基于深度学习的工业缺陷检测实验指导手册，包含数据集准备、模型训练、部署推理全流程。', fileCount: 5, status: 'approved', submitDate: '2024-05-15', reviewComment: '实验设计合理，技术深度适中' },
  { id: 3, name: '工业机器人编程-教学资源包', teacherId: 3, teacherName: '王老师', schoolId: 2, schoolName: '深圳职业技术学院', difficulty: '中级', domain: '智能制造', fileType: '资源', description: '六轴工业机器人编程教学资源包，包含课件、实验指导书、仿真模型、考核题库。', fileCount: 8, status: 'pending', submitDate: '2024-06-01', reviewComment: '' },
  { id: 4, name: '5G通信技术-课程设计指导书', teacherId: 4, teacherName: '陈教授', schoolId: 3, schoolName: '华南理工大学', difficulty: '中级', domain: '信息通信', fileType: '指导手册', description: '5G通信系统课程设计指导书，涵盖5G网络架构、Massive MIMO、波束赋形等关键技术。', fileCount: 2, status: 'needs_revision', submitDate: '2024-05-20', reviewComment: '建议补充实验数据和仿真代码' },
  { id: 5, name: '嵌入式系统开发-项目案例集', teacherId: 5, teacherName: '黄老师', schoolId: 2, schoolName: '深圳职业技术学院', difficulty: '初级', domain: '嵌入式', fileType: '项目任务书', description: '基于STM32的嵌入式开发项目案例集，包含8个由浅入深的项目案例。', fileCount: 6, status: 'pending', submitDate: '2024-06-10', reviewComment: '' },
]

const reviewStatusMap = {
  pending: { text: '待评审', color: 'orange' },
  approved: { text: '已通过', color: 'green' },
  needs_revision: { text: '需修改', color: 'red' },
}

export default function TeachingResource() {
  const { user, hasPermission } = useAuth()
  const [resources, setResources] = useState(mockTeachingResources)
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [filterDomain, setFilterDomain] = useState('all')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailResource, setDetailResource] = useState(null)
  const [uploadForm] = Form.useForm()

  const role = user?.role || 'admin'
  const teacherId = user?.teacherId
  const schoolId = user?.schoolId

  const domainOptions = useMemo(() => {
    const domains = new Set()
    resources.forEach(r => domains.add(r.domain))
    return Array.from(domains).sort()
  }, [resources])

  const filteredResources = useMemo(() => {
    let list = resources
    if (filterDifficulty !== 'all') {
      list = list.filter(r => r.difficulty === filterDifficulty)
    }
    if (filterDomain !== 'all') {
      list = list.filter(r => r.domain === filterDomain)
    }
    return list
  }, [resources, filterDifficulty, filterDomain])

  const handleUpload = () => {
    uploadForm.validateFields().then(values => {
      const teacher = mockTeachers.find(t => t.id === teacherId)
      const school = mockSchools.find(s => s.id === teacher?.schoolId)
      const newResource = {
        id: resources.length + 1,
        ...values,
        teacherId: teacherId,
        teacherName: teacher?.name || '未知',
        schoolId: teacher?.schoolId || 0,
        schoolName: school?.name || '未知',
        fileCount: values.fileCount || 1,
        status: 'pending',
        submitDate: new Date().toISOString().split('T')[0],
        reviewComment: '',
      }
      setResources([newResource, ...resources])
      message.success('教学文件上传成功，等待评审！')
      setUploadOpen(false)
      uploadForm.resetFields()
    })
  }

  const handleApprove = (id) => {
    setResources(resources.map(r => r.id === id ? { ...r, status: 'approved', reviewComment: '评审通过，内容符合教学要求' } : r))
    message.success('已通过评审')
  }

  const handleReject = (id) => {
    setResources(resources.map(r => r.id === id ? { ...r, status: 'needs_revision', reviewComment: '需修改后重新提交' } : r))
    message.success('已标记为需修改')
  }

  // ======== Sub-components ========

  const ProjectLibrary = () => (
    <div>
      {/* Filters */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Space>
          <span style={{ color: '#666' }}>难度：</span>
          <Select value={filterDifficulty} onChange={setFilterDifficulty} style={{ width: 120 }}
            options={[
              { value: 'all', label: '全部难度' },
              ...Object.keys(difficultyConfig).map(d => ({ value: d, label: d })),
            ]}
          />
        </Space>
        <Space>
          <span style={{ color: '#666' }}>技术领域：</span>
          <Select value={filterDomain} onChange={setFilterDomain} style={{ width: 150 }}
            options={[{ value: 'all', label: '全部领域' }, ...domainOptions.map(d => ({ value: d, label: d }))]}
          />
        </Space>
      </div>

      {filteredResources.length === 0 ? (
        <Empty description="暂无教学项目" />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredResources.map(r => (
            <Col xs={24} sm={12} lg={8} key={r.id}>
              <Card
                hoverable
                actions={[
                  <Button type="link" icon={<FileTextOutlined />} onClick={() => { setDetailResource(r); setDetailOpen(true) }}>查看详情</Button>,
                ]}
              >
                <div style={{ marginBottom: 8 }}>
                  <Tag color={difficultyConfig[r.difficulty]?.color}>{r.difficulty}</Tag>
                  <Tag>{r.domain}</Tag>
                  <Tag color={reviewStatusMap[r.status]?.color}>{reviewStatusMap[r.status]?.text}</Tag>
                </div>
                <Text strong style={{ fontSize: 15 }} ellipsis={{ tooltip: r.name }}>
                  {r.name}
                </Text>
                <div style={{ marginTop: 8, color: '#666', fontSize: 13 }}>
                  <div>{r.teacherName} · {r.schoolName}</div>
                  <div style={{ marginTop: 4 }}>文件数：{r.fileCount} 个</div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Tag icon={<FileTextOutlined />} color="default">{r.fileType}</Tag>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )

  const UploadSection = () => (
    <div style={{ maxWidth: 500 }}>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => { uploadForm.resetFields(); setUploadOpen(true) }}>上传教学文件</Button>
      <div style={{ marginTop: 16, color: '#666' }}>教师上传教学资源文件，提交后由学校或理事会评审。</div>
    </div>
  )

  const reviewColumns = [
    { title: '文件名称', dataIndex: 'name', key: 'name' },
    { title: '上传教师', dataIndex: 'teacherName', key: 'teacherName', render: (t) => <Tag color="blue">{t}</Tag> },
    { title: '所属院校', dataIndex: 'schoolName', key: 'schoolName' },
    { title: '难度', dataIndex: 'difficulty', key: 'difficulty', render: (d) => <Tag color={difficultyConfig[d]?.color}>{d}</Tag> },
    { title: '技术领域', dataIndex: 'domain', key: 'domain', render: (d) => <Tag>{d}</Tag> },
    { title: '文件类型', dataIndex: 'fileType', key: 'fileType' },
    { title: '提交日期', dataIndex: 'submitDate', key: 'submitDate' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={reviewStatusMap[s]?.color}>{reviewStatusMap[s]?.text}</Tag> },
    { title: '操作', key: 'action', render: (_, r) => {
      if (r.status === 'pending' && hasPermission('teaching.review')) {
        return (
          <Space>
            <Button type="link" style={{ color: 'green' }} icon={<CheckCircleOutlined />} onClick={() => handleApprove(r.id)}>通过</Button>
            <Button type="link" danger icon={<CloseCircleOutlined />} onClick={() => handleReject(r.id)}>退回</Button>
          </Space>
        )
      }
      return <Tag color={reviewStatusMap[r.status]?.color}>{reviewStatusMap[r.status]?.text}</Tag>
    }},
  ]

  const ReviewSection = () => (
    <Table dataSource={resources} columns={reviewColumns} rowKey="id" pagination={false} />
  )

  // ======== Tabs ========

  const tabItems = useMemo(() => {
    const items = []

    items.push({ key: 'library', label: '教学项目库', children: <ProjectLibrary /> })

    if (hasPermission('teaching.upload')) {
      items.push({ key: 'upload', label: '上传教学文件', children: <UploadSection /> })
    }

    if (hasPermission('teaching.review')) {
      items.push({ key: 'review', label: '教学评审', children: <ReviewSection /> })
    }

    return items
  }, [filteredResources, resources, filterDifficulty, filterDomain, role, hasPermission])

  return (
    <Card title="教学资源转化">
      <Tabs items={tabItems} />

      {/* Upload Modal */}
      <Modal title="上传教学文件" open={uploadOpen} onOk={handleUpload} onCancel={() => { setUploadOpen(false); uploadForm.resetFields() }} width={640}>
        <Form form={uploadForm} layout="vertical">
          <Form.Item name="name" label="项目名称" rules={[{ required: true }]}><Input placeholder="例如: 智能仓储系统-项目任务书" /></Form.Item>
          <Form.Item name="difficulty" label="难度" rules={[{ required: true }]}>
            <Select options={[
              { value: '初级', label: '初级' },
              { value: '中级', label: '中级' },
              { value: '高级', label: '高级' },
            ]} />
          </Form.Item>
          <Form.Item name="domain" label="技术领域" rules={[{ required: true }]}>
            <Select options={[
              { value: 'AI算法', label: 'AI算法' },
              { value: '物联网', label: '物联网' },
              { value: '智能制造', label: '智能制造' },
              { value: '信息通信', label: '信息通信' },
              { value: '嵌入式', label: '嵌入式' },
              { value: '新能源', label: '新能源' },
            ]} />
          </Form.Item>
          <Form.Item name="fileType" label="文件类型" rules={[{ required: true }]}>
            <Select options={[
              { value: '项目任务书', label: '项目任务书' },
              { value: '指导手册', label: '指导手册' },
              { value: '资源', label: '资源（课件/代码/数据等）' },
            ]} />
          </Form.Item>
          <Form.Item name="fileCount" label="文件数量" rules={[{ required: true }]}>
            <InputNumber min={1} max={50} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="描述" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="请描述该教学文件的内容和用途..." />
          </Form.Item>
          <Form.Item label="文件上传">
            <Upload.Dragger beforeUpload={() => false} multiple showUploadList={false}>
              <p className="ant-upload-drag-icon"><UploadOutlined /></p>
              <p>点击或拖拽文件到此区域上传</p>
              <p style={{ color: '#999', fontSize: 12 }}>支持单个或批量上传，系统将自动进行文件完整性校验</p>
            </Upload.Dragger>
          </Form.Item>
          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
            <FileTextOutlined /> 文件完整性校验：系统将自动检查文件格式、大小及完整性。
          </div>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal title="教学文件详情" open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={640}>
        {detailResource && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="文件名称">{detailResource.name}</Descriptions.Item>
              <Descriptions.Item label="上传教师">{detailResource.teacherName}</Descriptions.Item>
              <Descriptions.Item label="所属院校">{detailResource.schoolName}</Descriptions.Item>
              <Descriptions.Item label="难度">
                <Tag color={difficultyConfig[detailResource.difficulty]?.color}>{detailResource.difficulty}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="技术领域"><Tag>{detailResource.domain}</Tag></Descriptions.Item>
              <Descriptions.Item label="文件类型"><Tag>{detailResource.fileType}</Tag></Descriptions.Item>
              <Descriptions.Item label="文件数量">{detailResource.fileCount} 个</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={reviewStatusMap[detailResource.status]?.color}>{reviewStatusMap[detailResource.status]?.text}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="提交日期">{detailResource.submitDate}</Descriptions.Item>
              <Descriptions.Item label="描述">{detailResource.description}</Descriptions.Item>
              {detailResource.reviewComment && (
                <Descriptions.Item label="评审意见">{detailResource.reviewComment}</Descriptions.Item>
              )}
            </Descriptions>
            <div style={{ marginTop: 24 }}>
              <Text strong>文件列表</Text>
              <div style={{ marginTop: 8 }}>
                {Array.from({ length: detailResource.fileCount }, (_, i) => (
                  <div key={i} style={{ padding: '8px 12px', background: '#fafafa', borderRadius: 4, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileTextOutlined />
                    <span>{detailResource.name}_文件{i + 1}.pdf</span>
                    <Tag style={{ marginLeft: 'auto' }} color="green">已校验</Tag>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  )
}
