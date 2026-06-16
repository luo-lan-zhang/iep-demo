import { useState, useEffect } from 'react'
import { Card, Row, Col, Tag, Modal, Empty } from 'antd'
import { NodeIndexOutlined } from '@ant-design/icons'

const mockReports = [
  {
    id: 1, title: '2024年Q3 人工智能行业人才需求报告',
    summary: 'AI分析全国招聘数据，深度剖析人工智能行业人才供需态势。',
    industry: '人工智能', period: '2024-Q3', generatedAt: '2024-10-01',
    hotSkills: ['大模型训练', '机器学习', '深度学习', '自然语言处理', '计算机视觉', 'AI工程化'],
    totalDemand: 12.6, avgSalary: '35.8K',
    keyFindings: [
      'AI大模型方向人才需求同比增长180%，供需比仅为1:8',
      'AI工程化岗位需求增长300%，成为新兴热门方向',
      'AI+行业复合型人才薪资溢价达40%，企业愿为跨界能力买单',
      '应届生AI岗位起薪同比上涨15%，平均达22K/月',
    ],
  },
  {
    id: 2, title: '2024年Q3 半导体行业人才需求报告',
    summary: 'AI分析全国半导体行业人才招聘数据，全面呈现芯片人才市场格局。',
    industry: '半导体', period: '2024-Q3', generatedAt: '2024-10-01',
    hotSkills: ['芯片设计', 'EDA工具', '半导体工艺', '封装测试', 'FPGA开发'],
    totalDemand: 8.3, avgSalary: '42.5K',
    keyFindings: [
      '芯片设计人才缺口达12万人，模拟芯片设计工程师尤为紧缺',
      'RISC-V生态快速发展催生新的人才需求，相关岗位增长200%',
      '半导体设备工程师需求同比增长85%，受自主产线建设驱动',
    ],
  },
]

export default function TalentReport() {
  const [reports] = useState(mockReports)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 4 }}>人才需求报告</h2>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 13 }}>AI智能分析招聘数据，洞察产业人才需求趋势</p>
      {reports.length === 0 ? <Empty description="暂无人才需求报告数据" /> : (
        <Row gutter={[16, 16]}>
          {reports.map(r => (
            <Col xs={24} lg={12} key={r.id}>
              <div
                style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: 20, cursor: 'pointer', height: '100%' }}
                onClick={() => { setSelected(r); setOpen(true) }}
              >
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{r.title}</h3>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>{r.summary}</p>
                <div style={{ marginBottom: 8 }}>
                  <Tag color="blue">{r.industry}</Tag>
                  <Tag color="green">{r.period}</Tag>
                  <Tag color="orange">AI生成</Tag>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                  <span>需求人数: <strong style={{ color: '#1677ff' }}>{r.totalDemand}万人</strong></span>
                  <span>平均薪资: <strong style={{ color: '#faad14' }}>{r.avgSalary}</strong></span>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={selected?.title || '人才需求报告'} open={open}
        onCancel={() => { setOpen(false); setSelected(null) }}
        width={750} footer={null}
      >
        {selected && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <Tag color="blue">{selected.industry}</Tag>
              <Tag color="green">{selected.period}</Tag>
              <Tag color="orange">AI生成</Tag>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{selected.title}</h3>
            <p style={{ color: '#666', fontSize: 13, marginBottom: 20 }}>{selected.summary}</p>
            <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
              <Col xs={24} sm={12}>
                <div style={{ background: '#e6f4ff', padding: '12px 16px', borderRadius: 8, border: '1px solid #91caff' }}>
                  <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>总需求人数</div>
                  <span style={{ fontSize: 22, fontWeight: 700, color: '#1677ff' }}>{selected.totalDemand}万人</span>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ background: '#fff7e6', padding: '12px 16px', borderRadius: 8, border: '1px solid #ffd591' }}>
                  <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>平均薪资</div>
                  <span style={{ fontSize: 22, fontWeight: 700, color: '#faad14' }}>{selected.avgSalary}</span>
                </div>
              </Col>
            </Row>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 12 }}>热门技能</h4>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
              {selected.hotSkills.map(s => (
                <Tag key={s} color="geekblue" style={{ fontSize: 12, padding: '2px 8px' }}>{s}</Tag>
              ))}
            </div>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 12 }}>关键发现</h4>
            <ul style={{ paddingLeft: 20, lineHeight: 2, color: '#444', fontSize: 13 }}>
              {selected.keyFindings.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  )
}
