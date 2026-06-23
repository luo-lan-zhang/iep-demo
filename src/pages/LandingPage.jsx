import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as echarts from 'echarts'
import { Tag } from 'antd'
import { TrophyOutlined, ReadOutlined } from '@ant-design/icons'

// ─── Mock data ──────────────────────────────────────────────────────────────
const NEWS_ITEMS = [
  { id: 1, title: '2024年产教融合共同体年度工作会议在京召开', summary: '会议总结了本年度产教融合工作成果，部署了下一阶段重点任务，来自全国各地的200余位代表参会。', date: '2024-07-15', img: '' },
  { id: 2, title: '教育部发布新版职业教育专业目录', summary: '新版目录对接产业数字化转型需求，新增人工智能、大数据等新兴专业方向，优化传统专业设置。', date: '2024-07-12', img: '' },
  { id: 3, title: '深圳产教融合型企业认定数量突破50家', summary: '深圳持续推进产教融合型企业建设培育，新认定12家产教融合型企业，涵盖信息技术、智能制造等领域。', date: '2024-07-08', img: '' },
  { id: 4, title: '全国职业院校技能大赛总决赛圆满落幕', summary: '本届大赛共设102个赛项，参赛院校超过3000所，在产教融合实训基地中完成全部比赛环节。', date: '2024-07-03', img: '' },
]

const NOTICES = [
  { id: 1, title: '关于组织开展2024年度产教融合型企业申报工作的通知', summary: '各有关单位：根据《国家产教融合建设试点实施方案》要求，现组织开展2024年度产教融合型企业申报工作。', date: '2024-07-10' },
  { id: 2, title: '关于开展产教融合实训基地考核评估的通知', summary: '为进一步规范产教融合实训基地建设与管理，决定对已认定的实训基地开展年度考核评估工作。', date: '2024-07-05' },
  { id: 3, title: '关于公布第三批产教融合型专业建设名单的公告', summary: '经学校申报、专家评审、公示等程序，确定第三批产教融合型专业建设点58个，现予以公布。', date: '2024-06-28' },
  { id: 4, title: '关于举办产教融合数字化能力提升研修班的通知', summary: '为提升教师数字化教学能力和企业导师实践指导能力，决定举办产教融合数字化能力提升专题研修班。', date: '2024-06-20' },
]

const NAV_ITEMS = [
  '网站首页', '共同体概况', '成员矩阵', '行业研究', '资源中心',
  '产业学院', '人才培养', '科研合作', '政策文件', '就业服务', '申请加入',
]

// ─── Chart config generators ─────────────────────────────────────────────────
const getPolicyBarOption = () => ({
  title: { text: '历年政策出台数', left: 'center', textStyle: { color: '#b8d4ff', fontSize: 13, fontWeight: 600 } },
  tooltip: { trigger: 'axis', formatter: (p) => {
    const prev = { '2021': 60, '2022': 103, '2023': 126, '2024': 167 }[p[0].name] || 0
    const curr = p[0].value
    const yoy = prev ? Math.round((curr - prev) / prev * 100) : '-'
    return `${p[0].name}年<br/>${p.map(x => x.marker + ' ' + x.seriesName + ': ' + x.value).join('<br/>')}<br/>合计同比: ${yoy}%`
  } },
  legend: { data: ['园区', '企业', '院校'], bottom: 2, textStyle: { color: '#8ba9cc', fontSize: 10 } },
  grid: { left: '8%', right: '8%', top: '16%', bottom: '14%' },
  xAxis: { type: 'category', data: ['2020', '2021', '2022', '2023', '2024'], axisLabel: { color: '#8ba9cc', fontSize: 10 } },
  yAxis: { type: 'value', axisLabel: { color: '#8ba9cc', fontSize: 9 }, splitLine: { lineStyle: { color: '#1a3350' } } },
  series: [
    { name: '园区', type: 'bar', data: [12, 18, 25, 32, 45], itemStyle: { color: '#1677ff' }, barWidth: 10, barGap: '20%', label: { show: true, position: 'top', color: '#8ba9cc', fontSize: 8 } },
    { name: '企业', type: 'bar', data: [28, 35, 48, 56, 72], itemStyle: { color: '#52c41a' }, barWidth: 10, label: { show: true, position: 'top', color: '#8ba9cc', fontSize: 8 } },
    { name: '院校', type: 'bar', data: [20, 25, 30, 38, 50], itemStyle: { color: '#722ed1' }, barWidth: 10, label: { show: true, position: 'top', color: '#8ba9cc', fontSize: 8 } },
  ],
})

const getJobTrendOption = () => ({
  title: { text: '新一代信息技术各岗位趋势', left: 'center', textStyle: { color: '#b8d4ff', fontSize: 13, fontWeight: 600 } },
  tooltip: { trigger: 'axis' },
  legend: { data: ['AI工程师', '大数据', '云计算', '物联网', '安全'], bottom: 2, textStyle: { color: '#8ba9cc', fontSize: 9 } },
  grid: { left: '8%', right: '6%', top: '16%', bottom: '14%' },
  xAxis: { type: 'category', data: ['22Q1', '22Q3', '23Q1', '23Q3', '24Q1', '24Q3'], axisLabel: { color: '#8ba9cc', fontSize: 9 } },
  yAxis: { type: 'value', axisLabel: { color: '#8ba9cc', fontSize: 9 }, splitLine: { lineStyle: { color: '#1a3350' } } },
  series: [
    { name: 'AI工程师', type: 'line', data: [320, 380, 450, 520, 580, 680], smooth: true, lineStyle: { color: '#00d4ff', width: 2 }, itemStyle: { color: '#00d4ff' }, symbol: 'circle', symbolSize: 4 },
    { name: '大数据', type: 'line', data: [280, 310, 360, 400, 450, 500], smooth: true, lineStyle: { color: '#1677ff', width: 2 }, itemStyle: { color: '#1677ff' }, symbol: 'circle', symbolSize: 4 },
    { name: '云计算', type: 'line', data: [200, 240, 280, 320, 350, 420], smooth: true, lineStyle: { color: '#52c41a', width: 2 }, itemStyle: { color: '#52c41a' }, symbol: 'circle', symbolSize: 4 },
    { name: '物联网', type: 'line', data: [150, 180, 220, 260, 300, 360], smooth: true, lineStyle: { color: '#ff9800', width: 2 }, itemStyle: { color: '#ff9800' }, symbol: 'circle', symbolSize: 4 },
    { name: '安全', type: 'line', data: [100, 130, 160, 190, 230, 280], smooth: true, lineStyle: { color: '#722ed1', width: 2 }, itemStyle: { color: '#722ed1' }, symbol: 'circle', symbolSize: 4 },
  ],
})

const getResourceBarOption = () => ({
  title: { text: '项目转化教学资源统计', left: 'center', textStyle: { color: '#b8d4ff', fontSize: 13, fontWeight: 600 } },
  tooltip: { trigger: 'axis' },
  grid: { left: '22%', right: '14%', top: '14%', bottom: '8%' },
  xAxis: { type: 'value', axisLabel: { color: '#8ba9cc', fontSize: 9 }, splitLine: { lineStyle: { color: '#1a3350' } } },
  yAxis: { type: 'category', data: ['实训指导书', '实训任务单', '源代码', '脱敏数据集', '设备操作手册', '技能考核题库'], axisLabel: { color: '#8ba9cc', fontSize: 8 }, inverse: true },
  series: [{
    type: 'bar', data: [156, 238, 89, 45, 72, 128],
    itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#0d47a1' }, { offset: 1, color: '#00e5ff' }]) },
    barWidth: 14, label: { show: true, position: 'right', color: '#b8d4ff', formatter: '{c} 份', fontSize: 9 },
  }],
})

const getAchievementPieOption = () => ({
  title: { text: '', left: 'center' },
  tooltip: { trigger: 'item', formatter: '{b}: {c}项 ({d}%)' },
  series: [{
    type: 'pie', radius: ['42%', '72%'], center: ['50%', '52%'],
    label: { color: '#8ba9cc', fontSize: 8, formatter: '{b}\n{d}%', distanceToLabelLine: 3 },
    data: [
      { value: 38, name: '发明专利', itemStyle: { color: '#1677ff' } },
      { value: 65, name: '实用新型专利', itemStyle: { color: '#00d4ff' } },
      { value: 42, name: '外观设计专利', itemStyle: { color: '#52c41a' } },
      { value: 86, name: '软著', itemStyle: { color: '#722ed1' } },
      { value: 28, name: '其他', itemStyle: { color: '#ff9800' } },
    ],
  }],
})

// ─── Sub-Components ──────────────────────────────────────────────────────────

// 积分排行榜（选项卡切换：企业/教师/学生）
function TabsRanking() {
  const [tab, setTab] = useState('enterprise')
  const data = {
    enterprise: [
      { rank: 1, name: '河北仁谦信息科技有限公司', score: 98, projects: 12 },
      { rank: 2, name: '河北圣诺联合科技有限公司', score: 92, projects: 10 },
      { rank: 3, name: '石家庄市顶天科技开发有限公司', score: 87, projects: 8 },
      { rank: 4, name: '河北恒华信息技术有限公司', score: 82, projects: 7 },
      { rank: 5, name: '河北国龙制药有限公司', score: 78, projects: 6 },
    ],
    teacher: [
      { rank: 1, name: '张教授', score: 95, projects: 8 },
      { rank: 2, name: '李教授', score: 90, projects: 7 },
      { rank: 3, name: '陈教授', score: 85, projects: 6 },
      { rank: 4, name: '王副教授', score: 80, projects: 5 },
      { rank: 5, name: '赵讲师', score: 76, projects: 4 },
    ],
    student: [
      { rank: 1, name: '高怡希', score: 93, projects: 5 },
      { rank: 2, name: '彭子芮', score: 88, projects: 4 },
      { rank: 3, name: '张子怡', score: 84, projects: 4 },
      { rank: 4, name: '胡瑜韬', score: 79, projects: 3 },
      { rank: 5, name: '牛凯琦', score: 75, projects: 3 },
    ],
  }
  const titles = { enterprise: '企业', teacher: '教师', student: '学生' }
  const colors = { 1: 'gold', 2: '#1677ff', 3: '#52c41a', 4: '#722ed1', 5: '#faad14' }
  return (
    <div style={{ background: 'rgba(10,30,60,0.85)', borderRadius: 10, border: '1px solid rgba(0,212,255,0.15)', padding: 12 }}>
      <div style={{ textAlign: 'center', color: '#b8d4ff', fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
        <TrophyOutlined style={{ marginRight: 6 }} />积分排行榜
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 10, justifyContent: 'center' }}>
        {Object.entries(titles).map(([k, v]) => (
          <span key={k} onClick={() => setTab(k)}
            style={{ padding: '3px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 500, color: tab === k ? '#fff' : '#8ba9cc', background: tab === k ? '#1677ff' : 'rgba(255,255,255,0.05)', transition: 'all 0.2s' }}>
            {v}
          </span>
        ))}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <th style={{ padding: '6px 8px', fontSize: 11, color: '#8ba9cc', textAlign: 'center', width: 36 }}>#</th>
            <th style={{ padding: '6px 8px', fontSize: 11, color: '#8ba9cc', textAlign: 'left' }}>名称</th>
            <th style={{ padding: '6px 8px', fontSize: 11, color: '#8ba9cc', textAlign: 'center', width: 50 }}>积分</th>
            <th style={{ padding: '6px 8px', fontSize: 11, color: '#8ba9cc', textAlign: 'center', width: 60 }}>项目数</th>
          </tr>
        </thead>
        <tbody>
          {data[tab].map((item) => (
            <tr key={item.rank} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '8px', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', width: 20, height: 20, borderRadius: 10, background: colors[item.rank], color: '#fff', fontSize: 11, fontWeight: 700, lineHeight: '20px', textAlign: 'center' }}>{item.rank}</span>
              </td>
              <td style={{ padding: '8px', fontSize: 12, color: '#c5d9f0' }}>{item.name}</td>
              <td style={{ padding: '8px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#faad14', fontFamily: 'DIN, monospace' }}>{item.score}</td>
              <td style={{ padding: '8px', textAlign: 'center', fontSize: 11, color: '#8ba9cc' }}>{item.projects}项</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// 项目总览
function ProjectOverview() {
  const yearData = [
    { year: '2024', total: 45, s: 8, a: 18, b: 15, c: 4 },
    { year: '2023', total: 32, s: 5, a: 12, b: 11, c: 4 },
    { year: '2022', total: 22, s: 3, a: 8, b: 8, c: 3 },
  ]
  const levelColors = { s: '#ff4d4f', a: '#faad14', b: '#1677ff', c: '#52c41a' }
  return (
    <div style={{ background: 'rgba(10,30,60,0.85)', borderRadius: 10, border: '1px solid rgba(0,212,255,0.15)', padding: 12 }}>
      <div style={{ textAlign: 'center', color: '#b8d4ff', fontSize: 13, fontWeight: 500, marginBottom: 10 }}>项目总览</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <th style={{ padding: '6px 8px', fontSize: 11, color: '#8ba9cc', textAlign: 'center' }}>年度</th>
            <th style={{ padding: '6px 8px', fontSize: 11, color: '#8ba9cc', textAlign: 'center' }}>总数</th>
            <th style={{ padding: '6px 8px', fontSize: 11, color: '#8ba9cc', textAlign: 'center' }}>S级</th>
            <th style={{ padding: '6px 8px', fontSize: 11, color: '#8ba9cc', textAlign: 'center' }}>A级</th>
            <th style={{ padding: '6px 8px', fontSize: 11, color: '#8ba9cc', textAlign: 'center' }}>B级</th>
          </tr>
        </thead>
        <tbody>
          {yearData.map((item) => (
            <tr key={item.year} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '8px', textAlign: 'center', fontSize: 12, color: '#c5d9f0', fontWeight: 500 }}>{item.year}</td>
              <td style={{ padding: '8px', textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#00e5ff', fontFamily: 'DIN, monospace' }}>{item.total}</td>
              <td style={{ padding: '8px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: levelColors.s, fontFamily: 'DIN, monospace' }}>{item.s}</td>
              <td style={{ padding: '8px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: levelColors.a, fontFamily: 'DIN, monospace' }}>{item.a}</td>
              <td style={{ padding: '8px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: levelColors.b, fontFamily: 'DIN, monospace' }}>{item.b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// 供需对接项目进度一览表
function ProjectProgressTable() {
  const projects = [
    { id: 101, name: '区块链电子档案', enterpriseName: '河北圣诺', teacherName: '陈新', budget: 350600, progress: 80, status: 'in_progress' },
    { id: 102, name: '燃气管线绘制辅助工具开发项目', enterpriseName: '恒华信息', teacherName: '张晓蕾', budget: 286000, progress: 90, status: 'in_progress' },
    { id: 103, name: '信息安全课程开发服务', enterpriseName: '卓升电子', teacherName: '马晓丽', budget: 200000, progress: 100, status: 'completed' },
    { id: 104, name: '系统及网络安全维护', enterpriseName: '仁谦信息', teacherName: '贺宏', budget: 396000, progress: 100, status: 'completed' },
    { id: 105, name: '自定位机器人网络安全虚拟仿真测试平台', enterpriseName: '顶天科技', teacherName: '武雪芳', budget: 300500, progress: 100, status: 'completed' },
    { id: 106, name: '企业生产数据分析与可视化解决方案', enterpriseName: '国龙制药', teacherName: '陈建伟', budget: 300000, progress: 90, status: 'in_progress' },
    { id: 107, name: '数实合一智慧古建信息系统', enterpriseName: '棣烨', teacherName: '底雪峰', budget: 204700, progress: 100, status: 'completed' },
    { id: 108, name: '微晶玻璃晶化炉自动控制系统', enterpriseName: '美科', teacherName: '陶玉梅', budget: 450000, progress: 100, status: 'completed' },
    { id: 109, name: '虚拟实验教学资源软件', enterpriseName: '惠美', teacherName: '刘娇', budget: 401000, progress: 100, status: 'completed' },
    { id: 110, name: '分级数据存储系统', enterpriseName: '高誉', teacherName: '李擎', budget: 200000, progress: 100, status: 'completed' },
    { id: 111, name: '数字矿山主流岩体识别系统', enterpriseName: '诺桦', teacherName: '罗文', budget: 200000, progress: 100, status: 'completed' },
  ]
  const st = { in_progress: '进行中', pending_complete: '待确认', completed: '已结项' }
  const sc = { in_progress: 'processing', pending_complete: 'orange', completed: 'green' }
  return (
    <div style={{ background: 'rgba(10,30,60,0.85)', borderRadius: 10, border: '1px solid rgba(0,212,255,0.15)', padding: 12, overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', color: '#b8d4ff', fontSize: 13, fontWeight: 500, marginBottom: 10 }}>供需对接项目进度一览表</div>
      <div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, background: 'rgba(10,30,60,0.98)' }}>
              <th style={{ padding: '5px 6px', color: '#8ba9cc', textAlign: 'left', fontSize: 10 }}>项目</th>
              <th style={{ padding: '5px 6px', color: '#8ba9cc', textAlign: 'center', fontSize: 10, width: 50 }}>企业</th>
              <th style={{ padding: '5px 6px', color: '#8ba9cc', textAlign: 'center', fontSize: 10, width: 50 }}>承接方</th>
              <th style={{ padding: '5px 6px', color: '#8ba9cc', textAlign: 'center', fontSize: 10, width: 50 }}>预算</th>
              <th style={{ padding: '5px 6px', color: '#8ba9cc', textAlign: 'center', fontSize: 10, width: 60 }}>进度</th>
              <th style={{ padding: '5px 6px', color: '#8ba9cc', textAlign: 'center', fontSize: 10, width: 50 }}>状态</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '6px', color: '#c5d9f0', fontSize: 11, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</td>
                <td style={{ padding: '6px', textAlign: 'center', fontSize: 11, color: '#8ba9cc' }}>{p.enterpriseName}</td>
                <td style={{ padding: '6px', textAlign: 'center', fontSize: 11, color: '#8ba9cc' }}>{p.teacherName}</td>
                <td style={{ padding: '6px', textAlign: 'center', fontSize: 11, color: '#faad14', fontFamily: 'DIN, monospace' }}>¥{(p.budget / 10000).toFixed(1)}万</td>
                <td style={{ padding: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                    <div style={{ flex: 1, maxWidth: 50, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${p.progress}%`, height: '100%', background: p.progress >= 100 ? '#52c41a' : '#00e5ff', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, color: '#8ba9cc', width: 26, textAlign: 'right' }}>{p.progress}%</span>
                  </div>
                </td>
                <td style={{ padding: '6px', textAlign: 'center' }}><Tag color={sc[p.status]} style={{ fontSize: 9, margin: 0, padding: '0 4px' }}>{st[p.status]}</Tag></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// 共享资源池
function SharedResourcesPanel() {
  const categories = [
    { name: '场地', count: 48, used: 32, color: '#1677ff' },
    { name: '设备', count: 156, used: 105, color: '#52c41a' },
    { name: '专家', count: 89, used: 56, color: '#722ed1' },
    { name: '其他', count: 34, used: 18, color: '#faad14' },
  ]
  const total = categories.reduce((s, c) => s + c.count, 0)
  const used = categories.reduce((s, c) => s + c.used, 0)
  return (
    <div style={{ background: 'rgba(10,30,60,0.85)', borderRadius: 10, border: '1px solid rgba(0,212,255,0.15)', padding: 12 }}>
      <div style={{ textAlign: 'center', color: '#b8d4ff', fontSize: 13, fontWeight: 500, marginBottom: 10 }}>共享资源池</div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
        <div style={{ flex: 1, textAlign: 'center', background: 'rgba(0,212,255,0.08)', borderRadius: 8, padding: '10px 8px' }}>
          <div style={{ fontSize: 11, color: '#8ba9cc' }}>资源总数</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#00e5ff', fontFamily: 'DIN, monospace' }}>{total}</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', background: 'rgba(82,196,26,0.08)', borderRadius: 8, padding: '10px 8px' }}>
          <div style={{ fontSize: 11, color: '#8ba9cc' }}>共享中</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a', fontFamily: 'DIN, monospace' }}>{used}</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', background: 'rgba(250,173,20,0.08)', borderRadius: 8, padding: '10px 8px' }}>
          <div style={{ fontSize: 11, color: '#8ba9cc' }}>利用率</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#faad14', fontFamily: 'DIN, monospace' }}>{Math.round((used/total)*100)}%</div>
        </div>
      </div>
      {categories.map((cat) => (
        <div key={cat.name} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 11, color: '#8ba9cc' }}>{cat.name}</span>
            <span style={{ fontSize: 11, color: cat.color, fontWeight: 500 }}>{cat.used}/{cat.count}</span>
          </div>
          <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${(cat.used/cat.count)*100}%`, height: '100%', background: cat.color, borderRadius: 3 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// M9: 成果转化（饼图 + 明细表 合并）
function AchievementPanel({ pieRef }) {
  const items = [
    { type: '发明专利', count: 38, value: '1,260万', color: '#1677ff' },
    { type: '实用新型专利', count: 65, value: '890万', color: '#00d4ff' },
    { type: '外观设计专利', count: 42, value: '320万', color: '#52c41a' },
    { type: '软著', count: 86, value: '680万', color: '#722ed1' },
    { type: '其他', count: 28, value: '150万', color: '#ff9800' },
  ]
  const total = items.reduce((s, i) => s + i.count, 0)
  const totalValue = '3,300万'
  return (
    <div style={{ background: 'rgba(10,30,60,0.85)', borderRadius: 10, border: '1px solid rgba(0,212,255,0.15)', padding: 10, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ textAlign: 'center', color: '#b8d4ff', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>成果转化</div>
      <div style={{ display: 'flex', flex: 1, gap: 10 }}>
        {/* pie chart */}
        <div ref={pieRef} style={{ flex: 1, minHeight: 200, overflow: 'hidden' }} />
        {/* detail */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ flex: 1, textAlign: 'center', background: 'rgba(22,119,255,0.08)', borderRadius: 4, padding: '4px 6px' }}>
              <div style={{ fontSize: 9, color: '#8ba9cc' }}>转化总数</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1677ff', fontFamily: 'DIN, monospace' }}>{total}</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', background: 'rgba(82,196,26,0.08)', borderRadius: 4, padding: '4px 6px' }}>
              <div style={{ fontSize: 9, color: '#8ba9cc' }}>经济价值</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#52c41a', fontFamily: 'DIN, monospace' }}>{totalValue}</div>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '3px 6px', fontSize: 9, color: '#8ba9cc', textAlign: 'left' }}>类型</th>
                <th style={{ padding: '3px 6px', fontSize: 9, color: '#8ba9cc', textAlign: 'center', width: 36 }}>数量</th>
                <th style={{ padding: '3px 6px', fontSize: 9, color: '#8ba9cc', textAlign: 'center', width: 48 }}>价值</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '3px 6px' }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 2, background: item.color, marginRight: 4, verticalAlign: 'middle' }} />
                    <span style={{ fontSize: 10, color: '#c5d9f0' }}>{item.type}</span>
                  </td>
                  <td style={{ padding: '3px 6px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'DIN, monospace' }}>{item.count}</td>
                  <td style={{ padding: '3px 6px', textAlign: 'center', fontSize: 10, color: '#52c41a' }}>{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState('')

  // Refs for charts
  const policyBarRef = useRef(null)
  const jobTrendRef = useRef(null)
  const resourceBarRef = useRef(null)
  const achievementPieRef = useRef(null)
  const mapRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)
  const chartInstances = useRef([])

  const disposeCharts = useCallback(() => {
    chartInstances.current.forEach(c => { try { c.dispose() } catch {} })
    chartInstances.current = []
  }, [])

  // Clock
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setCurrentTime(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Load china map geojson from local
  useEffect(() => {
    let cancelled = false
    fetch('./china.json')
      .then(r => r.json())
      .then(geo => {
        if (cancelled) return
        echarts.registerMap('china', geo)
        setMapReady(true)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  // Create charts
  useEffect(() => {
    disposeCharts()
    const create = (ref, getOption) => {
      if (!ref.current) return null
      const inst = echarts.init(ref.current)
      inst.setOption(getOption())
      chartInstances.current.push(inst)
      return inst
    }
    create(policyBarRef, getPolicyBarOption)
    create(jobTrendRef, getJobTrendOption)
    create(resourceBarRef, getResourceBarOption)
    create(achievementPieRef, getAchievementPieOption)
    return disposeCharts
  }, [disposeCharts])

  // Create map chart (京津冀地图)
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const inst = echarts.init(mapRef.current)
    inst.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} 个岗位' },
      geo: {
        map: 'china', roam: false, zoom: 2.5, center: [116.40, 39.4],
        itemStyle: { areaColor: '#0d2b52', borderColor: '#1a5080', borderWidth: 1 },
        emphasis: { itemStyle: { areaColor: '#1a4478' }, label: { show: false } },
        regions: [
          { name: '北京', itemStyle: { areaColor: '#1e5fa8' } },
          { name: '天津', itemStyle: { areaColor: '#1655a0' } },
          { name: '河北', itemStyle: { areaColor: '#0f4c8a' } },
        ],
      },
      series: [
        {
          type: 'scatter', coordinateSystem: 'geo',
          data: [
            { name: '北京', value: [116.40, 39.90, 520] },
            { name: '天津', value: [117.20, 39.13, 280] },
            { name: '石家庄', value: [114.52, 38.05, 180] },
            { name: '唐山', value: [118.18, 39.63, 95] },
            { name: '保定', value: [115.47, 38.87, 120] },
            { name: '廊坊', value: [116.68, 39.52, 140] },
            { name: '沧州', value: [116.83, 38.30, 75] },
            { name: '秦皇岛', value: [119.60, 39.93, 88] },
            { name: '雄安新区', value: [116.10, 39.02, 210] },
          ],
          symbolSize: v => Math.sqrt(v[2]) * 2.2,
          itemStyle: { color: '#ff6b35' }, label: { show: true, position: 'right', formatter: '{b}', color: '#b8d4ff', fontSize: 9 },
        },
      ],
    })
    chartInstances.current.push(inst)
    return () => { try { inst.dispose() } catch {} }
  }, [mapReady])

  // Resize handler
  useEffect(() => {
    const onResize = () => chartInstances.current.forEach(c => { try { c.resize() } catch {} })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div style={{ minWidth: 1280, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Microsoft YaHei", sans-serif', background: '#f0f2f5' }}>
      {/* ═══ Header ══════════════════════════════════════════════════════════ */}
      <header style={{ background: '#fff', borderBottom: '2px solid #e8e8e8' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px' }}>
          {/* Logo + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={`${import.meta.env.BASE_URL}xuexiao.png`} alt="logo" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#0d47a1', lineHeight: 1.2 }}>产教融合智慧管理平台</div>
              <div style={{ fontSize: 11, color: '#999', letterSpacing: 1.5 }}>INDUSTRY-EDUCATION INTEGRATION PLATFORM</div>
            </div>
          </div>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <input type="text" placeholder="搜索..." style={{ width: 240, height: 38, border: '1px solid #d9d9d9', borderRight: 'none', borderRadius: '6px 0 0 6px', padding: '0 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            <button style={{ height: 38, padding: '0 20px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: '0 6px 6px 0', cursor: 'pointer', fontSize: 13 }}>搜索</button>
          </div>
          {/* Login button */}
          <button
            onClick={() => navigate(user ? '/admin/dashboard' : '/login')}
            style={{ padding: '8px 24px', background: '#0d47a1', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
          >
            {user ? '进入平台' : '登录'}
          </button>
        </div>
        {/* Nav menu */}
        <nav style={{ background: '#0d47a1', padding: '0 24px' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', height: 44 }}>
            {NAV_ITEMS.map((item, i) => (
              <span key={i} style={{ color: i === 0 ? '#ffd54f' : '#c5d9f0', fontSize: 13, padding: '0 16px', cursor: 'pointer', whiteSpace: 'nowrap', borderRight: i < NAV_ITEMS.length - 1 ? '1px solid rgba(255,255,255,0.12)' : 'none', lineHeight: '44px', height: 44, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = i === 0 ? '#ffd54f' : '#c5d9f0'}
                onClick={() => { if (item === '政策文件') navigate('/policies') }}
              >
                {item}
              </span>
            ))}
          </div>
        </nav>
      </header>

      {/* ═══ Data Dashboard ══════════════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0d2137 40%, #102a45 100%)', padding: '28px 24px 36px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Dashboard header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ margin: 0, color: '#fff', fontSize: 22, fontWeight: 600, letterSpacing: 2 }}>
                <span style={{ display: 'inline-block', width: 4, height: 22, background: '#00e5ff', marginRight: 10, verticalAlign: 'middle' }} />
                产教融合指数 · 大数据可视化
              </h2>
              <p style={{ margin: '4px 0 0 14px', color: '#5a7da8', fontSize: 12 }}>Industry-Education Integration Index · Big Data Visualization</p>
            </div>
            <div style={{ color: '#4a7aaa', fontSize: 12, background: 'rgba(0,212,255,0.08)', padding: '6px 16px', borderRadius: 4, border: '1px solid rgba(0,212,255,0.15)' }}>
              数据更新时间：{currentTime}
            </div>
          </div>

          {/* ═══ Row 1: 历年政策出台数 | 京津冀地图(含左右参与数据) | 积分排行榜 ═══ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.5fr 1fr', gap: 14, marginBottom: 14 }}>
            {/* M1: 历年政策出台数 */}
            <div style={{ background: 'rgba(10,30,60,0.85)', borderRadius: 10, border: '1px solid rgba(0,212,255,0.15)', padding: 10, minHeight: 320, overflow: 'hidden' }} ref={policyBarRef} />

            {/* M2: 左:参与方数据卡片 + 中:京津冀地图 + 右:教师/学生/导师卡片 */}
            <div style={{ background: 'rgba(10,30,60,0.85)', borderRadius: 10, border: '1px solid rgba(0,212,255,0.18)', padding: 10, display: 'flex', flexDirection: 'column' }}>
              <div style={{ textAlign: 'center', color: '#b8d4ff', fontSize: 12, fontWeight: 500, marginBottom: 6, flexShrink: 0 }}>京津冀地图</div>
              <div style={{ flex: 1, display: 'flex', gap: 8, minHeight: 0 }}>
                {/* 左侧: 园区、企业、院校 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', width: 80, flexShrink: 0 }}>
                  {[
                    { label: '园区', value: 18, color: '#1677ff' },
                    { label: '企业', value: 86, color: '#52c41a' },
                    { label: '院校', value: 42, color: '#722ed1' },
                  ].map((item, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 6px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#8ba9cc', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: item.color, fontFamily: 'DIN, monospace' }}>{item.value}</div>
                      <div style={{ fontSize: 9, color: '#52c41a' }}>↑ {item.value > 40 ? 12 : 8}%</div>
                    </div>
                  ))}
                </div>
                {/* 中间: 地图 */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRadius: 8, minWidth: 0 }}>
                  <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
                  {!mapReady && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a7aaa', fontSize: 12 }}>加载地图数据中...</div>
                  )}
                </div>
                {/* 右侧: 教师/学生/企业导师 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', width: 80, flexShrink: 0 }}>
                  {[
                    { label: '教师', value: 356, color: '#faad14' },
                    { label: '学生', value: '5,280', color: '#ff9800' },
                    { label: '企业导师', value: 182, color: '#ff6b35' },
                  ].map((item, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 6px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#8ba9cc', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: typeof item.value === 'string' ? 16 : 20, fontWeight: 700, color: item.color, fontFamily: 'DIN, monospace' }}>{item.value}</div>
                      <div style={{ fontSize: 9, color: '#52c41a' }}>↑ 22.5%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* M3: 积分排行榜 */}
            <TabsRanking />
          </div>

          {/* ═══ Row 2: 项目总览 | 供需对接项目进度 | 新一代信息技术各岗位趋势 ═══ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.8fr 1.8fr', gap: 14, marginBottom: 14 }}>
            {/* M4: 项目总览 */}
            <ProjectOverview />
            {/* M5: 供需对接项目进度一览表 */}
            <ProjectProgressTable />
            {/* M6: 新一代信息技术各岗位趋势 */}
            <div style={{ background: 'rgba(10,30,60,0.85)', borderRadius: 10, border: '1px solid rgba(0,212,255,0.15)', padding: 10, minHeight: 300, overflow: 'hidden' }} ref={jobTrendRef} />
          </div>

          {/* ═══ Row 3: 教学资源统计 | 共享资源池 | 成果转化(饼图+明细) ═══ */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.8fr', gap: 14 }}>
            {/* M7: 项目转化教学资源统计 */}
            <div style={{ background: 'rgba(10,30,60,0.85)', borderRadius: 10, border: '1px solid rgba(0,212,255,0.15)', padding: 10, minHeight: 300, overflow: 'hidden' }} ref={resourceBarRef} />
            {/* M8: 共享资源池 */}
            <SharedResourcesPanel />
            {/* M9: 成果转化(饼图+明细表) */}
            <AchievementPanel pieRef={achievementPieRef} />
          </div>
        </div>
      </section>

      {/* ═══ News Section ════════════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        {/* News */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '2px solid #1677ff', paddingBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1a1a1a' }}>新闻速递</h3>
            <a style={{ color: '#1677ff', fontSize: 13, cursor: 'pointer' }}>更多 &gt;&gt;</a>
          </div>
          {NEWS_ITEMS.map((n, i) => (
            <div key={n.id} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: i < NEWS_ITEMS.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <div style={{ width: 120, height: 80, background: 'linear-gradient(135deg, #e3f0ff, #f0f5ff)', borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1677ff', fontSize: 28 }}>
                📰
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <a style={{ fontSize: 14, fontWeight: 500, color: '#1677ff', lineHeight: 1.5, display: 'block', cursor: 'pointer', marginBottom: 4 }}>{n.title}</a>
                <p style={{ fontSize: 12, color: '#999', lineHeight: 1.6, margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{n.summary}</p>
                <span style={{ fontSize: 11, color: '#bbb' }}>{n.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Notices */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '2px solid #1677ff', paddingBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1a1a1a' }}>通知公告</h3>
            <a style={{ color: '#1677ff', fontSize: 13, cursor: 'pointer' }}>更多 &gt;&gt;</a>
          </div>
          {NOTICES.map((n, i) => (
            <div key={n.id} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: i < NOTICES.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <div style={{ width: 48, height: 48, background: '#0d47a1', borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#fff', fontSize: 10, fontWeight: 700, lineHeight: 1.2, textAlign: 'center' }}>通知<br/>公告</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <a style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', lineHeight: 1.5, display: 'block', cursor: 'pointer', marginBottom: 4 }}>{n.title}</a>
                <p style={{ fontSize: 12, color: '#999', lineHeight: 1.6, margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{n.summary}</p>
                <span style={{ fontSize: 11, color: '#bbb' }}>{n.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Footer ══════════════════════════════════════════════════════════ */}
      <footer style={{ background: '#0d47a1', color: '#8ba9cc', textAlign: 'center', padding: '16px 24px', fontSize: 12 }}>
        Copyright &copy; 2024 产教融合智慧管理平台 · Industry-Education Integration Cloud Platform · All Rights Reserved.
      </footer>
    </div>
  )
}
