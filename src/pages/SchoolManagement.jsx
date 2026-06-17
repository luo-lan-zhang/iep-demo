import { useState } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, Select, message, Descriptions } from 'antd'
import { PlusOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { mockSchools } from '../mock/schools'

export default function SchoolManagement() {
  const [schools, setSchools] = useState(mockSchools.map(s => ({ ...s, auditStatus: s.auditStatus || 'approved' })))
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [viewSchool, setViewSchool] = useState(null)
  const [viewOpen, setViewOpen] = useState(false)

  const columns = [
    { title: '院校名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (t) => <Tag color="blue">{t}</Tag> },
    { title: '地址', dataIndex: 'address', key: 'address', ellipsis: true },
    { title: '联系人', dataIndex: 'contact', key: 'contact' },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => (
      <Tag color={s === 'active' ? 'green' : 'red'}>{s === 'active' ? '启用' : '停用'}</Tag>
    )},
    { title: '审核', dataIndex: 'auditStatus', key: 'auditStatus', render: (s) => (
      <Tag color={s === 'approved' ? 'green' : s === 'pending' ? 'orange' : 'red'}>
        {s === 'approved' ? '已通过' : s === 'pending' ? '待审核' : '已拒绝'}
      </Tag>
    )},
    { title: '操作', key: 'action', render: (_, r) => (
      <span style={{ display: 'flex', gap: 4 }}>
        <Button size="small" icon={<EyeOutlined />} onClick={() => { setViewSchool(r); setViewOpen(true) }}>查看</Button>
        {r.auditStatus === 'pending' && (
          <>
            <Button size="small" type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} icon={<CheckCircleOutlined />}
              onClick={() => {
                setSchools(schools.map(s => s.id === r.id ? { ...s, auditStatus: 'approved', status: 'active' } : s))
                message.success(`${r.name} 审核已通过`)
              }}>通过</Button>
            <Button size="small" danger icon={<CloseCircleOutlined />}
              onClick={() => {
                setSchools(schools.map(s => s.id === r.id ? { ...s, auditStatus: 'rejected' } : s))
                message.warning(`${r.name} 审核已拒绝`)
              }}>拒绝</Button>
          </>
        )}
        {r.auditStatus === 'rejected' && (
          <Button size="small" type="primary"
            onClick={() => {
              setSchools(schools.map(s => s.id === r.id ? { ...s, auditStatus: 'approved', status: 'active' } : s))
              message.success(`${r.name} 已重新审核通过`)
            }}>重新审核</Button>
        )}
      </span>
    )},
  ]

  const handleAdd = () => {
    form.validateFields().then(values => {
      const newSchool = {
        id: schools.length + 1,
        ...values,
        auditStatus: 'pending',
        status: 'inactive',
      }
      setSchools([...schools, newSchool])
      message.success('院校已添加，等待审核！')
      setModalOpen(false)
      form.resetFields()
    })
  }

  return (
    <Card title="院校管理" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>添加院校</Button>}>
      <Table dataSource={schools} columns={columns} rowKey="id" />

      <Modal title="添加院校" open={modalOpen} onOk={handleAdd} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="院校名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select options={[{ value: '本科院校', label: '本科院校' }, { value: '高职院校', label: '高职院校' }, { value: '专科院校', label: '专科院校' }]} />
          </Form.Item>
          <Form.Item name="address" label="地址"><Input /></Form.Item>
          <Form.Item name="contact" label="联系人"><Input /></Form.Item>
          <Form.Item name="phone" label="联系电话"><Input /></Form.Item>
        </Form>
      </Modal>

      <Modal title="院校详情" open={viewOpen} onCancel={() => { setViewOpen(false); setViewSchool(null) }} footer={null} width={520}>
        {viewSchool && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="院校名称">{viewSchool.name}</Descriptions.Item>
            <Descriptions.Item label="类型"><Tag color="blue">{viewSchool.type}</Tag></Descriptions.Item>
            <Descriptions.Item label="地址" span={2}>{viewSchool.address}</Descriptions.Item>
            <Descriptions.Item label="联系人">{viewSchool.contact}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{viewSchool.phone}</Descriptions.Item>
            <Descriptions.Item label="启用状态">
              <Tag color={viewSchool.status === 'active' ? 'green' : 'red'}>{viewSchool.status === 'active' ? '启用' : '停用'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="审核状态">
              <Tag color={viewSchool.auditStatus === 'approved' ? 'green' : viewSchool.auditStatus === 'pending' ? 'orange' : 'red'}>
                {viewSchool.auditStatus === 'approved' ? '已通过' : viewSchool.auditStatus === 'pending' ? '待审核' : '已拒绝'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  )
}
