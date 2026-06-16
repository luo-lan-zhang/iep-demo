import { useState } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, Select, message } from 'antd'
import { PlusOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'

const policyTypes = [
  { value: 'industry', label: '产业政策' },
  { value: 'education', label: '教育政策' },
  { value: 'innovation', label: '创新政策' },
  { value: 'talent', label: '人才政策' },
]

const initialPolicies = [
  { id: 1, title: '关于促进产教融合的若干政策措施', type: 'education', content: '为深化产教融合，促进教育链、人才链与产业链、创新链有机衔接，现提出政策措施如下...', publisherName: '产教融合理事会', publisherType: 'council', status: 'published', publishDate: '2024-07-01', target: 'all', reviewComment: '' },
  { id: 2, title: '2024年产教融合项目申报指南', type: 'industry', content: '2024年度产教融合项目申报工作现已启动，请各企业、院校于规定时间内提交申报材料。', publisherName: '华为技术有限公司', publisherType: 'enterprise', status: 'draft', publishDate: '2024-07-10', target: 'school', reviewComment: '' },
  { id: 3, title: '校企合作实训基地建设方案', type: 'innovation', content: '为进一步推进校企合作，现发布实训基地建设方案，鼓励院校与企业共建共享实训资源。', publisherName: '深圳大学', publisherType: 'school', status: 'pending', publishDate: '2024-07-15', target: 'enterprise', reviewComment: '' },
]

const statusColors = {
  draft: { text: '草稿', color: 'default' },
  pending: { text: '待审核', color: 'orange' },
  published: { text: '已发布', color: 'green' },
  rejected: { text: '已拒绝', color: 'red' },
}

const targetLabels = { all: '全体', enterprise: '企业', school: '院校', park: '园区' }

export default function PolicyManagement() {
  const { user } = useAuth()
  const [policies, setPolicies] = useState(initialPolicies)
  const [publishOpen, setPublishOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewItem, setReviewItem] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [publishForm] = Form.useForm()
  const [reviewForm] = Form.useForm()

  const role = user?.role || 'council'

  const filtered = role === 'council' ? policies : policies.filter(p => p.publisherType === role)

  const handlePublish = () => {
    publishForm.validateFields().then(v => {
      setPolicies([{ id: policies.length + 1, ...v, publisherName: user?.name || '未知', publisherType: role, status: role === 'council' ? 'published' : 'pending', publishDate: new Date().toISOString().split('T')[0], reviewComment: '' }, ...policies])
      message.success(role === 'council' ? '政策发布成功！' : '政策提交成功，等待理事会审核！')
      setPublishOpen(false); publishForm.resetFields()
    })
  }

  const handleReview = (action) => {
    const comment = reviewForm.getFieldValue('comment') || ''
    setPolicies(policies.map(p => p.id === reviewItem.id ? { ...p, status: action === 'published' ? 'published' : 'rejected', reviewComment: comment } : p))
    message.success(action === 'published' ? '政策审核通过并发布！' : '政策已被驳回')
    setReviewOpen(false); setReviewItem(null); reviewForm.resetFields()
  }

  const columns = [
    { title: '政策标题', dataIndex: 'title', key: 'title' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (t) => <Tag>{policyTypes.find(pt => pt.value === t)?.label || t}</Tag> },
    { title: '发布方', dataIndex: 'publisherName', key: 'publisherName' },
    { title: '发送对象', dataIndex: 'target', key: 'target', render: (t) => <Tag>{targetLabels[t] || t}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColors[s]?.color}>{statusColors[s]?.text}</Tag> },
    { title: '发布日期', dataIndex: 'publishDate', key: 'publishDate' },
    {
      title: '操作', key: 'action', render: (_, r) => (
        <span style={{ display: 'inline-flex', gap: 4 }}>
          <Button size="small" onClick={() => { setDetailItem(r); setDetailOpen(true) }}>查看</Button>
          {role === 'council' && r.status === 'pending' && (
            <Button size="small" type="primary" onClick={() => { setReviewItem(r); reviewForm.resetFields(); setReviewOpen(true) }}>审核</Button>
          )}
        </span>
      )
    },
  ]

  return (
    <Card title="政策管理">
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { publishForm.resetFields(); setPublishOpen(true) }}>发布政策</Button>
      </div>
      <Table dataSource={filtered} columns={columns} rowKey="id" />

      {/* Detail Modal */}
      <Modal title="政策详情" open={detailOpen} onCancel={() => { setDetailOpen(false); setDetailItem(null) }} footer={null} width={650}>
        {detailItem && (
          <div>
            <Tag>{policyTypes.find(pt => pt.value === detailItem.type)?.label || detailItem.type}</Tag>
            <Tag>{targetLabels[detailItem.target] || detailItem.target}</Tag>
            <Tag color={statusColors[detailItem.status]?.color}>{statusColors[detailItem.status]?.text}</Tag>
            <h3 style={{ fontSize: 18, marginTop: 12 }}>{detailItem.title}</h3>
            <div style={{ color: '#999', fontSize: 12, marginBottom: 16 }}>发布方：{detailItem.publisherName} | {detailItem.publishDate}</div>
            <div style={{ lineHeight: 1.8, color: '#333', whiteSpace: 'pre-wrap' }}>{detailItem.content}</div>
            {detailItem.reviewComment && (
              <div style={{ background: '#fff7e6', padding: 12, borderRadius: 8, border: '1px solid #ffd591', color: '#666', fontSize: 13, marginTop: 16 }}>
                <strong>审核意见：</strong>{detailItem.reviewComment}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal title="发布政策" open={publishOpen} onOk={handlePublish} onCancel={() => { setPublishOpen(false); publishForm.resetFields() }} width={600}>
        <Form form={publishForm} layout="vertical">
          <Form.Item name="title" label="政策标题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="type" label="政策类型" rules={[{ required: true }]}>
            <Select options={policyTypes} />
          </Form.Item>
          <Form.Item name="target" label="发送对象" rules={[{ required: true }]}>
            <Select options={[{ value: 'all', label: '全体' }, { value: 'enterprise', label: '企业' }, { value: 'school', label: '院校' }, { value: 'park', label: '园区' }]} />
          </Form.Item>
          <Form.Item name="content" label="政策内容" rules={[{ required: true }]}>
            <Input.TextArea rows={6} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="政策审核" open={reviewOpen} onCancel={() => { setReviewOpen(false); setReviewItem(null) }} width={550} footer={null}>
        {reviewItem && (
          <div>
            <div style={{ marginBottom: 12 }}><Tag color="blue">{reviewItem.publisherName}</Tag><span style={{ fontWeight: 500, marginLeft: 8 }}>{reviewItem.title}</span></div>
            <div style={{ background: '#fafafa', padding: 12, borderRadius: 6, marginBottom: 16, maxHeight: 200, overflow: 'auto', color: '#666', fontSize: 13, lineHeight: 1.8 }}>{reviewItem.content}</div>
            <Form form={reviewForm} layout="vertical">
              <Form.Item name="comment" label="审核意见"><Input.TextArea rows={3} placeholder="请输入审核意见（选填）" /></Form.Item>
            </Form>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 16 }}>
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleReview('published')} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>通过发布</Button>
              <Button danger icon={<CloseCircleOutlined />} onClick={() => handleReview('rejected')}>驳回</Button>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  )
}
