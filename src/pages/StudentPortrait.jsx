import { useState, useEffect, useRef } from 'react'
import { Card, Row, Col, Select, Descriptions, Tag, Image, Upload, Button, message, Progress, Empty, Table } from 'antd'
import { UploadOutlined, UserOutlined } from '@ant-design/icons'
import * as echarts from 'echarts'
import { mockStudents } from '../mock/students'
import { mockSchools } from '../mock/schools'

const FIVE_DIMS = [
  { key: 'profession',  label: '知识建构', color: '#1677ff' },
  { key: 'innovation',  label: '工程实践', color: '#722ed1' },
  { key: 'teamwork',    label: '迭代创新', color: '#13c2c2' },
  { key: 'learning',    label: '团队协同', color: '#52c41a' },
  { key: 'adaptability', label: '职业胜任', color: '#faad14' },
]

const MOCK_PORTRAITS = {
  1: {
    completedProjects: 3,
    projects: [
      { name: '物联网固件AI污点检测系统', role: '前端开发', score: 92, date: '2024-06' },
      { name: '学生成绩分析平台', role: '后端开发', score: 88, date: '2024-03' },
      { name: '自动驾驶感知算法优化', role: '算法工程师', score: 95, date: '2024-01' },
    ],
    dims: { profession: 90, innovation: 92, teamwork: 91, learning: 88, adaptability: 94 },
    avgDims: { profession: 78, innovation: 72, teamwork: 80, learning: 75, adaptability: 76 },
  },
  2: {
    completedProjects: 2,
    projects: [
      { name: '物联网固件AI污点检测系统', role: '数据采集', score: 85, date: '2024-05' },
      { name: '学生成绩分析平台', role: '全栈开发', score: 90, date: '2024-02' },
    ],
    dims: { profession: 85, innovation: 88, teamwork: 82, learning: 90, adaptability: 86 },
    avgDims: { profession: 78, innovation: 72, teamwork: 80, learning: 75, adaptability: 76 },
  },
  3: {
    completedProjects: 2,
    projects: [
      { name: '物联网固件AI污点检测系统', role: '模型训练', score: 78, date: '2024-04' },
      { name: '自动驾驶感知算法优化', role: '数据分析', score: 82, date: '2024-02' },
    ],
    dims: { profession: 80, innovation: 76, teamwork: 85, learning: 82, adaptability: 78 },
    avgDims: { profession: 78, innovation: 72, teamwork: 80, learning: 75, adaptability: 76 },
  },
  4: {
    completedProjects: 1,
    projects: [
      { name: '工业机器人控制算法', role: '测试工程师', score: 75, date: '2024-03' },
    ],
    dims: { profession: 75, innovation: 70, teamwork: 78, learning: 74, adaptability: 80 },
    avgDims: { profession: 78, innovation: 72, teamwork: 80, learning: 75, adaptability: 76 },
  },
  5: {
    completedProjects: 3,
    projects: [
      { name: '矿用无线张力油压监测系统', role: '设备选型', score: 95, date: '2024-06' },
      { name: '区块链电子档案', role: '前端开发', score: 87, date: '2024-03' },
      { name: '5G基站天线优化设计', role: '测试', score: 83, date: '2024-01' },
    ],
    dims: { profession: 91, innovation: 85, teamwork: 93, learning: 88, adaptability: 90 },
    avgDims: { profession: 78, innovation: 72, teamwork: 80, learning: 75, adaptability: 76 },
  },
  6: {
    completedProjects: 2,
    projects: [
      { name: '矿用无线张力油压监测系统', role: '架构设计', score: 88, date: '2024-04' },
      { name: '数字矿山岩体识别', role: '全栈', score: 84, date: '2024-02' },
    ],
    dims: { profession: 83, innovation: 89, teamwork: 80, learning: 86, adaptability: 82 },
    avgDims: { profession: 78, innovation: 72, teamwork: 80, learning: 75, adaptability: 76 },
  },
  7: {
    completedProjects: 4,
    projects: [
      { name: '物联网固件AI污点检测系统', role: '系统测试', score: 80, date: '2024-06' },
      { name: '矿用无线张力油压监测系统', role: '系统调优', score: 75, date: '2024-04' },
      { name: '学生成绩分析平台', role: '前端', score: 89, date: '2024-02' },
      { name: '自动驾驶感知算法', role: '测试', score: 91, date: '2023-12' },
    ],
    dims: { profession: 87, innovation: 82, teamwork: 90, learning: 85, adaptability: 88 },
    avgDims: { profession: 78, innovation: 72, teamwork: 80, learning: 75, adaptability: 76 },
  },
  8: {
    completedProjects: 1,
    projects: [
      { name: '虚拟实验教学资源软件', role: '开发工程师', score: 79, date: '2024-05' },
    ],
    dims: { profession: 76, innovation: 78, teamwork: 82, learning: 80, adaptability: 77 },
    avgDims: { profession: 78, innovation: 72, teamwork: 80, learning: 75, adaptability: 76 },
  },
}

export default function StudentPortrait() {
  const [studentId, setStudentId] = useState(1)
  const [avatar, setAvatar] = useState(import.meta.env.BASE_URL + 'tupian.jpg')
  const radarRef = useRef(null)
  const chartRef = useRef(null)

  const student = mockStudents.find(s => s.id === studentId)
  const school = mockSchools.find(s => s.id === student?.schoolId)
  const portrait = MOCK_PORTRAITS[studentId] || MOCK_PORTRAITS[1]

  useEffect(() => {
    if (!radarRef.current) return
    if (chartRef.current) { try { chartRef.current.dispose() } catch {} }
    const inst = echarts.init(radarRef.current)
    chartRef.current = inst

    const dimLabels = FIVE_DIMS.map(d => d.label)
    const studentValues = FIVE_DIMS.map(d => portrait.dims[d.key])
    const avgValues = FIVE_DIMS.map(d => portrait.avgDims[d.key])

    inst.setOption({
      tooltip: {},
      legend: { data: ['该学生', '班级平均'], bottom: 0, textStyle: { color: '#666', fontSize: 12 } },
      radar: {
        center: ['50%', '46%'],
        radius: '65%',
        indicator: FIVE_DIMS.map(d => ({ name: d.label, max: 100 })),
        axisName: { color: '#333', fontSize: 12 },
      },
      series: [
        {
          type: 'radar', name: '该学生',
          data: [{ value: studentValues, name: '该学生' }],
          symbol: 'circle', symbolSize: 5,
          lineStyle: { color: '#1677ff', width: 2 },
          areaStyle: { color: 'rgba(22,119,255,0.15)' },
          itemStyle: { color: '#1677ff' },
        },
        {
          type: 'radar', name: '班级平均',
          data: [{ value: avgValues, name: '班级平均' }],
          symbol: 'circle', symbolSize: 4,
          lineStyle: { color: '#faad14', width: 2, type: 'dashed' },
          areaStyle: { color: 'rgba(250,173,20,0.08)' },
          itemStyle: { color: '#faad14' },
        },
      ],
    })

    const handleResize = () => { try { inst.resize() } catch {} }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      try { inst.dispose() } catch {}
    }
  }, [studentId, portrait])

  const avgScore = Math.round(Object.values(portrait.dims).reduce((a, b) => a + b, 0) / 5)
  const latestProjectScore = portrait.projects[0]?.score || '-'

  const handleUpload = (info) => {
    if (info.file.status === 'done') {
      const reader = new FileReader()
      reader.onload = (e) => setAvatar(e.target.result)
      reader.readAsDataURL(info.file.originFileObj)
      message.success('头像上传成功')
    }
  }

  const projectColumns = [
    { title: '项目名称', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: '担任角色', dataIndex: 'role', key: 'role', width: 100 },
    { title: '评分', dataIndex: 'score', key: 'score', width: 70, render: (v) => <Tag color="gold">{v}分</Tag> },
    { title: '时间', dataIndex: 'date', key: 'date', width: 90 },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Select value={studentId} onChange={setStudentId} style={{ width: 240 }}
          options={mockStudents.map(s => ({ value: s.id, label: `${s.name} - ${s.major}` }))}
        />
      </Card>

      <Row gutter={16}>
        <Col span={6}>
          <Card title="学生简历" size="small">
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              {avatar ? (
                <Image src={avatar} width={120} height={120} style={{ borderRadius: 8, objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: 120, height: 120, margin: '0 auto', borderRadius: 8,
                  background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px dashed #d9d9d9',
                }}>
                  <UserOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />
                </div>
              )}
              <Upload showUploadList={false} customRequest={({ file, onSuccess }) => setTimeout(() => onSuccess?.('ok'), 500)}
                onChange={handleUpload} accept="image/*">
                <Button icon={<UploadOutlined />} size="small" style={{ marginTop: 8 }}>上传照片</Button>
              </Upload>
            </div>

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="姓名">{student?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="学校">{school?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="专业">{student?.major || '-'}</Descriptions.Item>
              <Descriptions.Item label="年级">{student?.grade || '-'}</Descriptions.Item>
              <Descriptions.Item label="电话">{student?.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{student?.email || '-'}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>完成的项目</div>
              {portrait.projects.length === 0 ? (
                <Empty description="暂无完成项目" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <Table dataSource={portrait.projects} columns={projectColumns} rowKey="name" size="small" pagination={false} />
              )}
            </div>
          </Card>
        </Col>

        <Col span={10}>
          <Card title="五维度能力评价" size="small" style={{ height: '100%' }}>
            <div ref={radarRef} style={{ width: '100%', height: 380 }} />
          </Card>
        </Col>

        <Col span={8}>
          <Card title="能力详情" size="small">
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>五维度评分</div>
              {FIVE_DIMS.map(d => (
                <div key={d.key} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13 }}>{d.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: d.color }}>{portrait.dims[d.key]}分</span>
                  </div>
                  <Progress percent={portrait.dims[d.key]} strokeColor={d.color} showInfo={false} size="small" />
                </div>
              ))}
              <div style={{
                marginTop: 12, padding: '10px 14px', background: 'linear-gradient(135deg, #e6f7ff, #f0f5ff)',
                borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>综合均分</span>
                <span style={{ fontSize: 24, fontWeight: 700, color: '#1677ff', fontFamily: 'DIN, monospace' }}>{avgScore}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>最新项目分数</div>
              <div style={{
                textAlign: 'center', padding: '20px 0',
                background: 'linear-gradient(135deg, #fffbe6, #fff7e6)',
                borderRadius: 8, border: '1px solid #ffe58f',
              }}>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
                  {portrait.projects[0]?.name || '暂无'}
                </div>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#faad14', fontFamily: 'DIN, monospace' }}>
                  {latestProjectScore}
                </div>
                <div style={{ fontSize: 12, color: '#999' }}>分</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
