import { useState } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, Select, message, Descriptions } from 'antd'
import { PlusOutlined, EyeOutlined } from '@ant-design/icons'

const initialPlatforms = [
  { id: 1, name: '具身智能实验室', type: '实验室', location: '石家庄信息工程职业学院知行楼A栋3层', capacity: 60, equipment: '人形机器人、力反馈手套、3D视觉系统、激光雷达', status: 'active', schoolId: 1, schoolName: '石家庄信息工程职业学院' },
  { id: 2, name: '大数据产教实习基地', type: '实习基地', location: '石家庄信息工程职业学院科技楼B栋5层', capacity: 120, equipment: 'GPU服务器集群、Hadoop集群、数据可视化大屏', status: 'active', schoolId: 1, schoolName: '石家庄信息工程职业学院' },
  { id: 3, name: '5G通信联合实验室', type: '实验室', location: '石家庄信息工程职业学院信息楼2层', capacity: 40, equipment: '5G基站设备、频谱分析仪、矢量网络分析仪', status: 'active', schoolId: 1, schoolName: '石家庄信息工程职业学院' },
  { id: 4, name: '工业机器人实训中心', type: '实训中心', location: '深圳职业技术学院知行楼1层', capacity: 80, equipment: '六轴工业机器人、AGV小车、PLC控制系统', status: 'active', schoolId: 2, schoolName: '深圳职业技术学院' },
  { id: 5, name: '新能源电池检测中心', type: '实验室', location: '石家庄信息工程职业学院新能源楼1层', capacity: 30, equipment: '充放电测试系统、电化学工作站、热分析仪', status: 'active', schoolId: 3, schoolName: '石家庄信息工程职业学院' },
  { id: 6, name: '智能制造实训车间', type: '实训中心', location: '石家庄信息工程职业学院工训中心', capacity: 100, equipment: '数控机床、3D打印机、数字化产线', status: 'active', schoolId: 4, schoolName: '石家庄信息工程职业学院' },
]

const typeMap = { '实验室': 'purple', '实习基地': 'blue', '实训中心': 'green', '创新中心': 'orange' }

export default function PlatformManagement() {
  const [platforms, setPlatforms] = useState(initialPlatforms)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [viewOpen, setViewOpen] = useState(false)
  const [viewItem, setViewItem] = useState(null)

  const columns = [
    { title: '平台名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (t) => <Tag color={typeMap[t] || 'default'}>{t}</Tag> },
    { title: '所属院校', dataIndex: 'schoolName', key: 'schoolName' },
    { title: '地址', dataIndex: 'location', key: 'location', ellipsis: true },
    { title: '容量(人)', dataIndex: 'capacity', key: 'capacity' },
    { title: '主要设备', dataIndex: 'equipment', key: 'equipment', ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => (
      <Tag color={s === 'active' ? 'green' : 'red'}>{s === 'active' ? '运行中' : '维护中'}</Tag>
    )},
    { title: '操作', key: 'action', render: (_, r) => (
      <Button size="small" icon={<EyeOutlined />} onClick={() => { setViewItem(r); setViewOpen(true) }}>查看</Button>
    )},
  ]

  const handleAdd = () => {
    form.validateFields().then(values => {
      setPlatforms([...platforms, { id: platforms.length + 1, ...values }])
      message.success('添加平台成功！')
      setModalOpen(false)
      form.resetFields()
    })
  }

  return (
    <Card title="平台管理" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>添加平台</Button>}>
      <Table dataSource={platforms} columns={columns} rowKey="id" />
      <Modal title="添加平台" open={modalOpen} onOk={handleAdd} onCancel={() => setModalOpen(false)} width={560}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="平台名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="type" label="平台类型" rules={[{ required: true }]}>
            <Select options={[{ value: '实验室', label: '实验室' }, { value: '实习基地', label: '实习基地' }, { value: '实训中心', label: '实训中心' }, { value: '创新中心', label: '创新中心' }]} />
          </Form.Item>
          <Form.Item name="schoolName" label="所属院校" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="location" label="地址"><Input /></Form.Item>
          <Form.Item name="capacity" label="容量(人)"><Input placeholder="例如: 60" /></Form.Item>
          <Form.Item name="equipment" label="主要设备"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
      <Modal title="平台详情" open={viewOpen} onCancel={() => { setViewOpen(false); setViewItem(null) }} footer={null} width={520}>
        {viewItem && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="平台名称" span={2}>{viewItem.name}</Descriptions.Item>
            <Descriptions.Item label="类型"><Tag color={typeMap[viewItem.type] || 'default'}>{viewItem.type}</Tag></Descriptions.Item>
            <Descriptions.Item label="所属院校">{viewItem.schoolName}</Descriptions.Item>
            <Descriptions.Item label="地址" span={2}>{viewItem.location}</Descriptions.Item>
            <Descriptions.Item label="容量(人)">{viewItem.capacity}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={viewItem.status === 'active' ? 'green' : 'red'}>{viewItem.status === 'active' ? '运行中' : '维护中'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="主要设备" span={2}>{viewItem.equipment}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  )
}
