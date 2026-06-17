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
  { id: 1, title: '关于促进产教融合的若干政策措施', type: 'education', content: '为深化产教融合，促进教育链、人才链与产业链、创新链有机衔接，现提出政策措施如下：一、支持企业深度参与职业教育，对参与产教融合的企业给予税收优惠；二、鼓励院校与企业共建实训基地，政府给予建设补贴；三、建立产教融合型企业和院校认证制度，对认证单位给予政策倾斜。', publisherName: '产教融合理事会', publisherType: 'council', status: 'published', publishDate: '2024-07-01', target: 'all', reviewComment: '' },
  { id: 2, title: '2024年产教融合项目申报指南', type: 'industry', content: '2024年度产教融合项目申报工作现已启动，请各企业、院校于规定时间内提交申报材料。本年度重点支持人工智能、集成电路、新能源、智能制造等领域的校企合作项目。申报截止日期：2024年9月30日。', publisherName: '产教融合理事会', publisherType: 'council', status: 'published', publishDate: '2024-07-10', target: 'all', reviewComment: '' },
  { id: 3, title: '校企合作实训基地建设方案', type: 'innovation', content: '为进一步推进校企合作，现发布实训基地建设方案。方案鼓励院校与企业共建共享实训资源，对符合条件的实训基地给予最高200万元的建设补贴。建设标准包括：实训场地面积不少于500平方米，设备总值不少于300万元，年服务学生不少于200人。', publisherName: '深圳大学', publisherType: 'school', status: 'published', publishDate: '2024-07-15', target: 'enterprise', reviewComment: '' },
  { id: 4, title: '技能人才引进与培育扶持办法', type: 'talent', content: '为加快技能人才队伍建设，制定本扶持办法。一、企业引进高技能人才给予每人最高10万元安家补贴；二、院校开设紧缺技能专业给予每个专业50万元建设资金；三、校企联合培养技能人才按每人5000元标准给予企业培训补贴。', publisherName: '产教融合理事会', publisherType: 'council', status: 'published', publishDate: '2024-07-20', target: 'all', reviewComment: '' },
  { id: 5, title: '科技创新券使用管理办法', type: 'innovation', content: '为鼓励中小企业利用高校科研资源开展技术创新，特制定科技创新券使用管理办法。创新券面值分为5万元、10万元、20万元三档，可用于支付高校实验室使用、技术检测、专利评估等费用。每家企业年度申领上限为50万元。', publisherName: '产教融合办公室', publisherType: 'school', status: 'published', publishDate: '2024-07-25', target: 'enterprise', reviewComment: '' },
  { id: 6, title: '园区企业人才需求信息采集通知', type: 'talent', content: '为全面掌握园区企业人才需求状况，现面向园区各入驻企业开展人才需求信息采集工作。请各企业填写《人才需求信息表》，包括岗位名称、专业要求、学历要求、招聘数量等信息。采集结果将作为园区人才服务工作的决策依据。', publisherName: '深圳南山科技园', publisherType: 'park', status: 'pending', publishDate: '2024-08-01', target: 'enterprise', reviewComment: '' },
  { id: 7, title: '物联网产业技术标准征求意见稿', type: 'industry', content: '由产教融合理事会牵头制定的《物联网产业技术标准（征求意见稿）》现面向各单位公开征求意见。标准涵盖传感器接口规范、数据传输协议、设备互操作等关键技术要求。意见反馈截止日期为2024年9月15日。', publisherName: '华为技术有限公司', publisherType: 'enterprise', status: 'pending', publishDate: '2024-08-05', target: 'all', reviewComment: '' },
  { id: 8, title: '深化现代职业教育体系建设改革方案', type: 'education', content: '贯彻落实国家关于深化现代职业教育体系建设改革的要求，结合本区域产业特点，制定本方案。重点任务包括：建设3个高水平产教融合实训基地、培育50家产教融合型企业、培养100名双师型骨干教师。', publisherName: '深圳职业技术学院', publisherType: 'school', status: 'draft', publishDate: '', target: 'school', reviewComment: '' },
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

  const filtered = role === 'council' || role === 'park' ? policies : policies.filter(p => p.publisherType === role)

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
