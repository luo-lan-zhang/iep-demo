import { useState } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, Select, message, Popconfirm } from 'antd'
import { PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'

const priorityColors = {
  high: { text: '重要', color: 'red' },
  normal: { text: '普通', color: 'blue' },
  low: { text: '一般', color: 'default' },
}

const targetLabels = { all: '全体', enterprise: '企业', school: '院校', park: '园区' }

const initialNotices = [
  { id: 1, title: '关于2024年产教融合项目申报的通知', content: '各合作企业、院校：2024年度产教融合项目申报工作现已启动，请各单位于2024年9月30日前提交申报材料。项目申报方向包括人工智能应用、智能制造升级、新能源技术开发、数字经济发展等重点领域。申报材料请发送至指定邮箱。', priority: 'high', status: 'published', publishDate: '2024-07-01', publisherName: '产教融合理事会', publisherType: 'council', target: 'all' },
  { id: 2, title: '产教融合示范基地认定办法发布', content: '为进一步推动产教融合深度发展，现发布《产教融合示范基地认定办法》，自发布之日起施行。认定条件包括：基地面积不少于1000平方米、年服务学生不少于500人、合作企业不少于10家。通过认定的基地将获得政府专项资金支持。', priority: 'normal', status: 'published', publishDate: '2024-07-10', publisherName: '产教融合理事会', publisherType: 'council', target: 'all' },
  { id: 3, title: '关于召开理事会年度会议的通知', content: '定于2024年8月20日在深圳大学召开产教融合理事会年度会议，请各理事单位准时参加。会议议程：一、总结2023-2024年度工作；二、审议新增理事单位名单；三、讨论下年度重点工作计划；四、表彰优秀合作单位。', priority: 'high', status: 'published', publishDate: '2024-07-15', publisherName: '产教融合理事会', publisherType: 'council', target: 'all' },
  { id: 4, title: '园区企业安全生产检查通知', content: '根据上级部门工作部署，园区管理办公室将于2024年8月1日至15日对园区各入驻企业开展安全生产专项检查。检查内容包括消防设施、用电安全、危化品管理等。请各企业提前做好自查自纠工作，配合检查组完成检查。', priority: 'high', status: 'published', publishDate: '2024-07-20', publisherName: '深圳南山科技园管理办公室', publisherType: 'park', target: 'enterprise' },
  { id: 5, title: '华为鸿蒙生态合作企业招募公告', content: '华为技术有限公司现面向园区企业招募鸿蒙生态合作伙伴。入选企业将获得华为提供的技术支持、开发工具、市场推广等资源。优先招募领域：智能家居、智慧办公、智慧出行、影音娱乐等场景应用开发企业。', priority: 'normal', status: 'published', publishDate: '2024-07-25', publisherName: '华为技术有限公司', publisherType: 'enterprise', target: 'enterprise' },
  { id: 6, title: '深圳大学产学研合作项目征集', content: '深圳大学科技处现面向企业征集2024年产学研合作项目。合作形式包括联合实验室建设、技术委托开发、成果转化等。学校提供科研团队、实验设备、知识产权等资源支持。有意向的企业请于8月30日前提交合作意向书。', priority: 'normal', status: 'published', publishDate: '2024-08-01', publisherName: '深圳大学', publisherType: 'school', target: 'enterprise' },
  { id: 7, title: '园区企业用电高峰限电通知', content: '接供电部门通知，近期持续高温天气导致电力供应紧张，园区将于2024年8月5日至20日期间实施错峰用电。各企业请合理安排生产计划，避开高峰时段用电。具体错峰时段安排详见附件。如有特殊情况请提前联系园区管理处。', priority: 'high', status: 'pending', publishDate: '', publisherName: '深圳南山科技园管理办公室', publisherType: 'park', target: 'all' },
  { id: 8, title: '关于举办产教融合成果展览会的通知', content: '为展示产教融合工作成果，促进校企深入合作，定于2024年9月10日至12日在深圳会展中心举办产教融合成果展览会。本次展会设置企业展区、院校展区、创新成果展区三大板块，欢迎各单位踊跃报名参展。', priority: 'low', status: 'draft', publishDate: '', publisherName: '深圳职业技术学院', publisherType: 'school', target: 'all' },
]

const statusColors = {
  draft: { text: '草稿', color: 'default' },
  pending: { text: '待审核', color: 'orange' },
  published: { text: '已发布', color: 'green' },
  rejected: { text: '已拒绝', color: 'red' },
}

export default function NoticesManagement() {
  const { user } = useAuth()
  const [notices, setNotices] = useState(initialNotices)
  const [publishOpen, setPublishOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewItem, setReviewItem] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [publishForm] = Form.useForm()
  const [reviewForm] = Form.useForm()

  const role = user?.role || 'council'
  const filtered = role === 'council' || role === 'park' ? notices : notices.filter(n => n.publisherType === role)

  const handlePublish = () => {
    publishForm.validateFields().then(v => {
      setNotices([{ id: notices.length + 1, ...v, publisherName: user?.name || '未知', publisherType: role, status: role === 'council' ? 'published' : 'pending', publishDate: role === 'council' ? new Date().toISOString().split('T')[0] : '' }, ...notices])
      message.success(role === 'council' ? '通知发布成功！' : '通知提交成功，等待理事会审核！')
      setPublishOpen(false); publishForm.resetFields()
    })
  }

  const handleReview = (action) => {
    const comment = reviewForm.getFieldValue('comment') || ''
    setNotices(notices.map(n => n.id === reviewItem.id ? { ...n, status: action === 'published' ? 'published' : 'rejected', publishDate: action === 'published' ? new Date().toISOString().split('T')[0] : n.publishDate, reviewComment: comment } : n))
    message.success(action === 'published' ? '通知审核通过并发布！' : '通知已拒绝')
    setReviewOpen(false); setReviewItem(null); reviewForm.resetFields()
  }

  const handleDelete = (id) => {
    setNotices(notices.filter(n => n.id !== id))
    message.success('已删除通知')
  }

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '优先级', dataIndex: 'priority', key: 'priority', render: (p) => <Tag color={priorityColors[p]?.color}>{priorityColors[p]?.text}</Tag> },
    { title: '发送对象', dataIndex: 'target', key: 'target', render: (t) => <Tag>{targetLabels[t] || t}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColors[s]?.color}>{statusColors[s]?.text}</Tag> },
    { title: '发布日期', dataIndex: 'publishDate', key: 'publishDate', render: (d) => d || '-' },
    {
      title: '操作', key: 'action', render: (_, r) => (
        <span style={{ display: 'inline-flex', gap: 4 }}>
          <Button size="small" onClick={() => { setDetailItem(r); setDetailOpen(true) }}>查看</Button>
          {role === 'council' && r.status === 'pending' && (
            <Button size="small" type="primary" onClick={() => { setReviewItem(r); reviewForm.resetFields(); setReviewOpen(true) }}>审核</Button>
          )}
          <Popconfirm title="确定删除此通知？" onConfirm={() => handleDelete(r.id)} okText="确定" cancelText="取消">
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </span>
      )
    },
  ]

  return (
    <Card title="通知管理">
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { publishForm.resetFields(); setPublishOpen(true) }}>发布通知</Button>
      </div>
      <Table dataSource={filtered} columns={columns} rowKey="id" />

      {/* Detail Modal */}
      <Modal title="通知详情" open={detailOpen} onCancel={() => { setDetailOpen(false); setDetailItem(null) }} footer={null} width={650}>
        {detailItem && (
          <div>
            <Tag color={priorityColors[detailItem.priority]?.color}>{priorityColors[detailItem.priority]?.text}</Tag>
            <Tag>{targetLabels[detailItem.target] || detailItem.target}</Tag>
            <Tag color={statusColors[detailItem.status]?.color}>{statusColors[detailItem.status]?.text}</Tag>
            <h3 style={{ fontSize: 18, marginTop: 12 }}>{detailItem.title}</h3>
            <div style={{ color: '#999', fontSize: 12, marginBottom: 16 }}>发布方：{detailItem.publisherName} | {detailItem.publishDate || '未发布'}</div>
            <div style={{ lineHeight: 1.8, color: '#333', whiteSpace: 'pre-wrap' }}>{detailItem.content}</div>
          </div>
        )}
      </Modal>

      <Modal title="发布通知" open={publishOpen} onOk={handlePublish} onCancel={() => { setPublishOpen(false); publishForm.resetFields() }} width={600}>
        <Form form={publishForm} layout="vertical">
          <Form.Item name="title" label="通知标题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="priority" label="优先级" rules={[{ required: true }]}>
            <Select options={[{ value: 'high', label: '重要' }, { value: 'normal', label: '普通' }, { value: 'low', label: '一般' }]} />
          </Form.Item>
          <Form.Item name="target" label="发送对象" rules={[{ required: true }]}>
            <Select options={[{ value: 'all', label: '全体' }, { value: 'enterprise', label: '企业' }, { value: 'school', label: '院校' }, { value: 'park', label: '园区' }]} />
          </Form.Item>
          <Form.Item name="content" label="通知内容" rules={[{ required: true }]}>
            <Input.TextArea rows={6} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="通知审核" open={reviewOpen} onCancel={() => { setReviewOpen(false); setReviewItem(null) }} width={550} footer={null}>
        {reviewItem && (
          <div>
            <div style={{ marginBottom: 12 }}><Tag color="blue">{reviewItem.publisherName}</Tag><span style={{ fontWeight: 500, marginLeft: 8 }}>{reviewItem.title}</span></div>
            <div style={{ background: '#fafafa', padding: 12, borderRadius: 6, marginBottom: 16, maxHeight: 200, overflow: 'auto', color: '#666', fontSize: 13, lineHeight: 1.8 }}>{reviewItem.content}</div>
            <Form form={reviewForm} layout="vertical">
              <Form.Item name="comment" label="审核意见"><Input.TextArea rows={3} placeholder="请输入审核意见（选填）" /></Form.Item>
            </Form>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 16 }}>
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleReview('published')} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>通过发布</Button>
              <Button danger icon={<CloseCircleOutlined />} onClick={() => handleReview('rejected')}>拒绝</Button>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  )
}
