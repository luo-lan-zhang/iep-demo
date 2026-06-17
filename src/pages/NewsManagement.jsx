import { useState } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, Select, message, Image, Upload } from 'antd'
import { PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, UploadOutlined, LinkOutlined, DeleteOutlined } from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'

const newsTypes = [
  { value: 'text', label: '文字' },
  { value: 'image', label: '图文' },
  { value: 'video', label: '视频' },
]

const statusColors = {
  pending: { text: '待审核', color: 'orange' },
  approved: { text: '已通过', color: 'green' },
  rejected: { text: '已拒绝', color: 'red' },
}

const initialNews = [
  { id: 1, title: '华为与深圳大学共建鸿蒙创新实验室', type: 'text', content: '华为技术有限公司与深圳大学签署战略合作协议，共同建设鸿蒙创新实验室。双方将在鸿蒙生态建设、人才培养、技术研发等领域展开深度合作。', publisherName: '华为技术有限公司', publisherType: 'enterprise', status: 'approved', publishDate: '2024-07-25', images: [], reviewComment: '' },
  { id: 2, title: '腾讯AI大模型培训项目启动', type: 'image', content: '腾讯科技联合深圳大学、华南理工大学等高校，正式启动AI大模型技术培训项目，面向全校招募30名优秀学生参与。', publisherName: '腾讯科技（深圳）有限公司', publisherType: 'enterprise', status: 'approved', publishDate: '2024-07-22', images: [], reviewComment: '' },
  { id: 3, title: '大疆秋季校园招聘开启', type: 'text', content: '大疆创新科技有限公司2024年秋季校园招聘正式启动，面向2025届毕业生开放嵌入式开发、AI算法、机械设计等岗位。', publisherName: '大疆创新科技有限公司', publisherType: 'enterprise', status: 'pending', publishDate: '2024-07-20', images: [], reviewComment: '' },
]

export default function NewsManagement() {
  const { user } = useAuth()
  const [news, setNews] = useState(initialNews)
  const [publishOpen, setPublishOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewItem, setReviewItem] = useState(null)
  const [publishForm] = Form.useForm()
  const [reviewForm] = Form.useForm()
  const [imageLinks, setImageLinks] = useState([])
  const [fileList, setFileList] = useState([])

  const role = user?.role || 'council'
  const enterpriseId = user?.enterpriseId

  const filteredNews = role === 'council' ? news : news.filter(n => n.publisherType === role && (role === 'enterprise' ? n.publisherId : true))

  const handlePublish = () => {
    publishForm.validateFields().then(v => {
      setNews([{ id: news.length + 1, ...v, publisherName: user?.name || '未知', publisherType: role, status: 'pending', publishDate: new Date().toISOString().split('T')[0], images: imageLinks.filter(l => l.trim()), files: fileList, reviewComment: '' }, ...news])
      message.success('新闻发布成功，等待理事会审核！')
      setPublishOpen(false); publishForm.resetFields(); setImageLinks([]); setFileList([])
    })
  }

  const handleReview = (action) => {
    const comment = reviewForm.getFieldValue('comment') || ''
    setNews(news.map(n => n.id === reviewItem.id ? { ...n, status: action, reviewComment: comment } : n))
    message.success(action === 'approved' ? '新闻审核通过！' : '新闻已被拒绝')
    setReviewOpen(false); setReviewItem(null); reviewForm.resetFields()
  }

  const columns = [
    { title: '新闻标题', dataIndex: 'title', key: 'title', render: (t, r) => <a onClick={() => { setDetailItem(r); setDetailOpen(true) }}>{t}</a> },
    { title: '发布方', dataIndex: 'publisherName', key: 'publisherName', render: (t, r) => <Tag color={r.publisherType === 'school' ? 'green' : 'blue'}>{t}</Tag> },
    { title: '类型', dataIndex: 'type', key: 'type', render: (t) => <Tag>{newsTypes.find(nt => nt.value === t)?.label || t}</Tag> },
    { title: '发布日期', dataIndex: 'publishDate', key: 'publishDate' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => <Tag color={statusColors[s]?.color}>{statusColors[s]?.text}</Tag> },
    {
      title: '操作', key: 'action', render: (_, r) => (
        <span style={{ display: 'inline-flex', gap: 4 }}>
          <Button size="small" icon={<EyeOutlined />} onClick={() => { setDetailItem(r); setDetailOpen(true) }}>查看</Button>
          {role === 'council' && r.status === 'pending' && (
            <Button size="small" type="primary" onClick={() => { setReviewItem(r); reviewForm.resetFields(); setReviewOpen(true) }}>审核</Button>
          )}
        </span>
      )
    },
  ]

  return (
    <Card title="新闻管理">
      <div style={{ marginBottom: 16 }}>
        {role !== 'council' && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { publishForm.resetFields(); setPublishOpen(true) }}>发布新闻</Button>
        )}
      </div>
      <Table dataSource={filteredNews} columns={columns} rowKey="id" />

      <Modal title="发布新闻" open={publishOpen} onOk={handlePublish} onCancel={() => { setPublishOpen(false); publishForm.resetFields(); setImageLinks([]); setFileList([]) }} width={650}>
        <Form form={publishForm} layout="vertical">
          <Form.Item name="title" label="新闻标题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="type" label="新闻类型" rules={[{ required: true }]}>
            <Select options={newsTypes} />
          </Form.Item>
          <Form.Item name="content" label="新闻内容" rules={[{ required: true }]}>
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item label="图片链接（可选）">
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              {imageLinks.map((link, i) => (
                <div key={i} style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4, width: '100%' }}>
                  <Input value={link} onChange={e => { const n = [...imageLinks]; n[i] = e.target.value; setImageLinks(n) }} placeholder="输入图片URL" style={{ flex: 1 }} />
                  <Button icon={<DeleteOutlined />} size="small" danger onClick={() => setImageLinks(imageLinks.filter((_, j) => j !== i))} />
                </div>
              ))}
            </div>
            <Button size="small" icon={<LinkOutlined />} onClick={() => setImageLinks([...imageLinks, ''])}>添加图片链接</Button>
          </Form.Item>
          <Form.Item label="文件上传（可选）">
            <Upload.Dragger beforeUpload={(file) => { setFileList([...fileList, { name: file.name, size: file.size }]); return false }} showUploadList={false} multiple>
              <p className="ant-upload-drag-icon"><UploadOutlined /></p>
              <p>点击或拖拽文件上传</p>
              <p style={{ color: '#999', fontSize: 12 }}>支持图片、PDF、Word等格式</p>
            </Upload.Dragger>
            {fileList.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {fileList.map((f, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: '#fafafa', borderRadius: 4, marginBottom: 4 }}>
                    <span><UploadOutlined /> {f.name}</span>
                    <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => setFileList(fileList.filter((_, j) => j !== i))} />
                  </div>
                ))}
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="新闻详情" open={detailOpen} onCancel={() => { setDetailOpen(false); setDetailItem(null) }} footer={null} width={650}>
        {detailItem && (
          <div>
            <Tag color={detailItem.publisherType === 'school' ? 'green' : 'blue'}>{detailItem.publisherName}</Tag>
            <Tag>{newsTypes.find(nt => nt.value === detailItem.type)?.label}</Tag>
            <Tag color={statusColors[detailItem.status]?.color}>{statusColors[detailItem.status]?.text}</Tag>
            <h3 style={{ fontSize: 18, marginTop: 12 }}>{detailItem.title}</h3>
            <div style={{ color: '#999', fontSize: 12, marginBottom: 16 }}>{detailItem.publishDate}</div>
            <div style={{ lineHeight: 1.8, color: '#333', whiteSpace: 'pre-wrap' }}>{detailItem.content}</div>
            {detailItem.images?.length > 0 && detailItem.images.map((img, i) => (
              img && <Image key={i} src={img} alt={`图片${i+1}`} style={{ maxWidth: '100%', marginTop: 8, borderRadius: 8 }} />
            ))}
            {detailItem.files?.length > 0 && (
              <div style={{ marginTop: 12, padding: 12, background: '#fafafa', borderRadius: 8 }}>
                <div style={{ fontWeight: 500, marginBottom: 8, fontSize: 13 }}>附件文件：</div>
                {detailItem.files.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 13 }}>
                    <UploadOutlined /> <span>{f.name}</span>
                  </div>
                ))}
              </div>
            )}
            {detailItem.reviewComment && (
              <div style={{ background: '#fff7e6', padding: 12, borderRadius: 8, border: '1px solid #ffd591', color: '#666', fontSize: 13, marginTop: 16 }}>
                <strong>审核意见：</strong>{detailItem.reviewComment}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal title="新闻审核" open={reviewOpen} onOk={() => handleReview('approved')} onCancel={() => { setReviewOpen(false); setReviewItem(null) }} width={500} okText="审核通过">
        {reviewItem && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <Tag color="blue">{reviewItem.publisherName}</Tag>
              <span style={{ fontWeight: 500, marginLeft: 8 }}>{reviewItem.title}</span>
            </div>
            <div style={{ background: '#fafafa', padding: 12, borderRadius: 6, marginBottom: 16, maxHeight: 200, overflow: 'auto', color: '#666', fontSize: 13, lineHeight: 1.8 }}>{reviewItem.content}</div>
            <Form form={reviewForm} layout="vertical">
              <Form.Item name="comment" label="审核意见">
                <Input.TextArea rows={3} placeholder="请输入审核意见（选填）" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </Card>
  )
}
