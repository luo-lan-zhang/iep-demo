import { useState, useEffect } from 'react'
import { Card, Row, Col, Tag, Modal, Divider, Empty } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'

const mockReports = [
  {
    id: 1, title: '2024年Q3电子信息产业分析报告',
    summary: 'AI智能分析产业数据，涵盖市场规模、技术趋势等核心维度。',
    industry: '电子信息', period: '2024-Q3', generatedAt: '2024-10-01',
    tags: ['AI生成', '市场分析'],
    metrics: [
      { label: '市场规模', value: '¥12.8万亿', change: '+8.5%' },
      { label: '企业数量', value: '3.2万家', change: '+5.2%' },
    ],
    sections: [
      { title: '市场概况', content: '电子信息产业整体保持稳健增长态势，产业规模达到12.8万亿元。' },
      { title: '技术趋势', content: 'AI大模型与边缘计算的融合成为本季度最显著技术趋势。' },
    ],
  },
  {
    id: 2, title: '2024年智能制造产业趋势报告',
    summary: 'AI驱动的智能制造转型加速，产业规模达8.6万亿元。',
    industry: '智能制造', period: '2024-Q3', generatedAt: '2024-10-01',
    tags: ['AI生成', '智能制造'],
    metrics: [
      { label: '产业规模', value: '¥8.6万亿', change: '+11.2%' },
      { label: '机器人密度', value: '392台/万人', change: '+8.7%' },
    ],
    sections: [
      { title: '行业概况', content: '智能制造产业延续高速增长态势。' },
      { title: '技术突破', content: '数字孪生技术应用广度显著扩大。' },
    ],
  },
]

export default function IndustryReport() {
  const [reports] = useState(mockReports)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 4 }}>产业报告</h2>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 13 }}>AI智能分析产业数据，自动生成产业洞察报告</p>
      {reports.length === 0 ? <Empty description="暂无产业报告数据" /> : (
        <Row gutter={[16, 16]}>
          {reports.map(r => (
            <Col xs={24} lg={12} key={r.id}>
              <div
                style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: 20, cursor: 'pointer', height: '100%' }}
                onClick={() => { setSelected(r); setOpen(true) }}
              >
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{r.title}</h3>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>{r.summary}</p>
                <Tag color="purple">{r.industry}</Tag>
                <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                  {r.period} | 生成于 {r.generatedAt}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={selected?.title || '产业报告'} open={open} onCancel={() => { setOpen(false); setSelected(null) }}
        width={800} footer={null}
      >
        {selected && (
          <div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <Tag color="purple">{selected.industry}</Tag>
              <Tag color="blue">{selected.period}</Tag>
              {selected.tags.map(t => <Tag key={t} style={{ fontSize: 11 }}>{t}</Tag>)}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{selected.title}</h3>
            <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
              {selected.metrics.map(m => (
                <Col xs={12} sm={6} key={m.label}>
                  <div style={{ background: '#f6ffed', borderRadius: 8, padding: '12px 16px', border: '1px solid #b7eb8f' }}>
                    <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>{m.label}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: '#389e0d' }}>{m.value}</span>
                      <span style={{ fontSize: 12, color: m.change.startsWith('+') ? '#52c41a' : '#ff4d4f' }}>{m.change}</span>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
            <Divider />
            {selected.sections.map(s => (
              <div key={s.title} style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 15, fontWeight: 600, color: '#1677ff', marginBottom: 8 }}>{s.title}</h4>
                <p style={{ fontSize: 14, color: '#444', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{s.content}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
