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
      { label: '从业人员', value: '680万人', change: '+3.1%' },
    ],
    sections: [
      { title: '市场概况', content: '电子信息产业整体保持稳健增长态势，产业规模达到12.8万亿元，同比增长8.5%。其中集成电路、新型显示、智能终端三大细分领域贡献了超六成的产业增量。深圳作为全国电子信息产业重镇，产业规模占全国比重约15%。' },
      { title: '技术趋势', content: 'AI大模型与边缘计算的融合成为本季度最显著技术趋势。AI芯片需求持续攀升，国产替代进程加速。5G-A（5.5G）商用部署全面铺开，为工业互联网和车联网提供更强网络底座。' },
      { title: '人才需求', content: '产业人才需求旺盛，嵌入式开发、AI算法、芯片设计三类岗位需求同比增长超过25%。企业普遍面临"招人难、留人难"问题，产教融合人才培养模式成为破局关键。' },
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
      { label: '数字化率', value: '47.3%', change: '+6.5%' },
    ],
    sections: [
      { title: '行业概况', content: '智能制造产业延续高速增长态势，本季度产业规模达到8.6万亿元，同比增长11.2%。工业机器人装机量持续攀升，中国连续十年位居全球最大工业机器人市场。' },
      { title: '技术突破', content: '数字孪生技术应用广度显著扩大，已有超过40%的制造企业试点应用。AI质检、预测性维护等场景渗透率快速提升，平均降低企业运维成本20-30%。' },
      { title: '产教融合机遇', content: '智能制造领域技能人才缺口达300万人，校企联合培养模式效果显著。深圳职业技术学院等院校已与华为、大疆等企业建立产教融合实训基地，年培养智能制造人才超2000人。' },
    ],
  },
  {
    id: 3, title: '2024年新能源产业人才需求白皮书',
    summary: '新能源产业高速发展，技术人才缺口持续扩大。',
    industry: '新能源', period: '2024-Q3', generatedAt: '2024-10-05',
    tags: ['AI生成', '人才分析'],
    metrics: [
      { label: '产业规模', value: '¥10.5万亿', change: '+15.3%' },
      { label: '人才缺口', value: '120万人', change: '+18.5%' },
      { label: '岗位薪资', value: '¥28.5K/月', change: '+12.3%' },
    ],
    sections: [
      { title: '产业概况', content: '新能源产业保持高速增长，本季度产业规模突破10.5万亿元。新能源汽车渗透率首次超过50%，储能产业同比增长超60%。' },
      { title: '人才需求分析', content: '电池技术、电控系统、电力电子等方向人才最为紧缺。企业普遍反映"招到合适的技术人才比融资更难"。产教融合定向培养成为企业首选的人才获取渠道。' },
      { title: '校企合作建议', content: '建议院校开设新能源材料与器件、储能科学与工程等紧缺专业，与龙头企业共建实习实训基地。企业应深度参与人才培养方案制定，提供真实项目和岗位实践机会。' },
    ],
  },
  {
    id: 4, title: '2024年Q3人工智能产业生态报告',
    summary: '大模型技术驱动AI产业生态重塑，应用落地加速。',
    industry: '人工智能', period: '2024-Q3', generatedAt: '2024-10-08',
    tags: ['AI生成', '市场分析'],
    metrics: [
      { label: '产业规模', value: '¥1.8万亿', change: '+22.5%' },
      { label: 'AI企业数', value: '6.5万家', change: '+15.8%' },
      { label: '岗位需求', value: '85万人', change: '+30.2%' },
    ],
    sections: [
      { title: '产业生态', content: '大模型技术持续驱动AI产业生态重塑，国内已有超过200个大模型发布。AI应用从"能用"向"好用"快速演进，落地场景覆盖医疗、教育、制造、金融等各行各业。' },
      { title: '技术路线', content: '多模态、Agent智能体、端侧推理成为三大技术热点。AI人才结构呈现"橄榄型"特征，中间层的AI应用开发工程师需求最为旺盛。' },
      { title: '产教融合实践', content: '全国已有超过300所高校开设AI相关专业。腾讯与石家庄信息工程职业学院共建AI创新班，华为与多所院校联合开展AI大模型实训项目，"学中做、做中学"的培养模式成效显著。' },
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
