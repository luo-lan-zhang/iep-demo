import { useState, useEffect, useRef } from 'react'
import { Card, Row, Col, Select, Descriptions, Tag, Image, Progress, Empty, Table } from 'antd'
import { UserOutlined, FileTextOutlined, FundOutlined, BulbOutlined, ProjectOutlined } from '@ant-design/icons'
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
      legend: { data: ['学生平时', '班级平均'], bottom: 0, textStyle: { color: '#666', fontSize: 12 } },
      radar: {
        center: ['50%', '46%'],
        radius: '65%',
        indicator: FIVE_DIMS.map(d => ({ name: d.label, max: 100 })),
        axisName: { color: '#333', fontSize: 12 },
      },
      series: [
        {
          type: 'radar', name: '学生平时',
          data: [{ value: studentValues, name: '学生平时' }],
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


  const projectColumns = [
    { title: '项目名称', dataIndex: 'name', key: 'name', width: 180, render: (t) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-all', lineHeight: 1.5 }}>{t}</div> },
    { title: '角色', dataIndex: 'role', key: 'role', width: 90 },
    { title: '评分', dataIndex: 'score', key: 'score', width: 70, render: (v) => <Tag color="gold">{v}分</Tag> },
    { title: '时间', dataIndex: 'date', key: 'date', width: 90 },
  ]

  return (
    <div style={{ padding: 24 }}>

      <Row gutter={16} style={{ alignItems: 'stretch' }}>
        <Col span={8} style={{ display: 'flex' }}>
          <Card title="学生简历" size="small" style={{ width: '100%' }}>
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
                <Table dataSource={portrait.projects} columns={projectColumns} rowKey="name" size="small" pagination={{ pageSize: 3, size: 'small' }} />
              )}
            </div>
          </Card>
        </Col>

        <Col span={11} style={{ display: 'flex' }}>
          <Card title="五维能力评估" size="small" style={{ width: '100%' }}>
            <div ref={radarRef} style={{ width: '100%', height: 460 }} />
          </Card>
        </Col>
        <Col span={5} style={{ display: 'flex' }}>
          <Card title={<span><ProjectOutlined /> 最新项目</span>} size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 440, overflowY: 'auto' }}>
              {portrait.projects.map((p, i) => (
                <div key={i} style={{
                  padding: '10px 12px', borderRadius: 8, border: '1px solid #e8e8e8',
                  background: i === 0 ? 'linear-gradient(135deg, #e6f7ff, #f0f5ff)' : '#fafafa',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#333', marginBottom: 6, lineHeight: 1.5 }}>{p.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#999' }}>{p.role} · {p.date}</span>
                    <Tag color="gold" style={{ fontSize: 11, margin: 0 }}>{p.score}分</Tag>
                  </div>
                </div>
              ))}
              {portrait.projects.length === 0 && (
                <Empty description="暂无项目" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Row 2: 综评报告 + 项目诊断 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title={<span><FileTextOutlined /> 综评报告</span>} style={{ height: '100%' }}>
            <p style={{ fontSize: 13, color: '#555', lineHeight: 1.9, textIndent: '2em' }}>
              学业成绩优异，逻辑思维灵活敏锐，深耕编程开发、算法应用等专业内容，主动关注人工智能、前端架构等行业前沿技术，自主学习意愿极强。具备出色的创新思辨能力，能够结合项目场景优化算法模型、改良开发方案，擅长联动计算机、新媒体、工业交互等跨领域知识解决开发难题，项目创新度突出。短板方面，工程规范化素养有待提升，编写项目开发手册、技术说明文档意识薄弱，代码编写规范性、模块化整洁度不足；项目前期用户需求拆解研判能力不足，代码实验、项目运行结果标准化可复现能力需要专项强化。
            </p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title={<span><FundOutlined /> 本项目个性化智能诊断报告</span>} style={{ height: '100%' }}>
            <p style={{ fontSize: 13, color: '#555', lineHeight: 1.9, textIndent: '2em' }}>
              创新优势凸显，能够跳出传统开发范式，针对项目原有业务逻辑、算法模型、交互架构提出轻量化改良方案，主动调研行业同类项目前沿解法，结合跨领域思路优化项目功能，适配多元化使用场景，项目创意维度评分位居小组前列。但项目落地短板直观显现：项目全流程文档缺失完整架构，需求调研记录、版本迭代日志、接口调试文档撰写零散潦草；项目部署调试步骤无标准化记录，不同运行环境下项目成果复现难度较高，项目工程化、标准化落地能力有待补齐。
            </p>
          </Card>
        </Col>
      </Row>

      {/* Row 3: 提升建议 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title={<span style={{ color: '#1677ff' }}><BulbOutlined /> 提升建议</span>}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: '#f6ffed', borderRadius: 8, padding: 16, border: '1px solid #b7eb8f' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#52c41a', marginBottom: 8 }}>📋 工程规范提升</div>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8, margin: 0 }}>
                  建议系统学习项目开发文档编写规范，在每次迭代中同步维护需求文档、接口文档及部署手册。参考行业标准（如GB/T 8567）建立个人代码规范检查清单，使用ESLint、Prettier等工具辅助代码格式化训练，逐步养成模块化、可维护的编码习惯。
                </p>
              </div>
              <div style={{ background: '#e6f7ff', borderRadius: 8, padding: 16, border: '1px solid #91d5ff' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1677ff', marginBottom: 8 }}>🔍 需求分析能力</div>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8, margin: 0 }}>
                  参与项目初期需求调研环节，学习使用用户故事地图、流程图等工具进行需求拆解。建议在每次开发前完成需求分析文档并请导师评审，通过反复练习提升对业务场景的理解力和需求到代码的转化能力。
                </p>
              </div>
              <div style={{ background: '#fff7e6', borderRadius: 8, padding: 16, border: '1px solid #ffd591' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fa8c16', marginBottom: 8 }}>🧪 实验复现标准化</div>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8, margin: 0 }}>
                  建立标准化实验环境配置流程，使用Docker容器化技术统一运行环境，记录完整的环境依赖、参数配置与运行步骤。引入自动化测试框架（如Jest、Pytest），确保项目在不同环境下结果可复现、可验证。
                </p>
              </div>
              <div style={{ background: '#f9f0ff', borderRadius: 8, padding: 16, border: '1px solid #d3adf7' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#722ed1', marginBottom: 8 }}>🚀 前沿技术拓展</div>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8, margin: 0 }}>
                  继续保持对AI大模型、前端微架构、云原生等前沿方向的关注，建议每季度参与一次行业技术沙龙或开源项目贡献。结合专业方向，选择2-3个技术主题进行深度学习并产出技术博客，积累个人技术品牌影响力。
                </p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
