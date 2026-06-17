import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as echarts from 'echarts'

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
const getBarOption = () => ({
  title: { text: '协同育人数量对比', left: 'center', textStyle: { color: '#b8d4ff', fontSize: 13, fontWeight: 500 } },
  tooltip: { trigger: 'axis' },
  legend: { data: ['2023', '2024'], bottom: 0, textStyle: { color: '#8ba9cc', fontSize: 11 } },
  grid: { left: '12%', right: '8%', top: '18%', bottom: '14%' },
  xAxis: { type: 'category', data: ['订单培养', '现代学徒制', '共建产业学院', '1+X证书', '顶岗实习'], axisLabel: { color: '#8ba9cc', fontSize: 10, rotate: 15 } },
  yAxis: { type: 'value', axisLabel: { color: '#8ba9cc' }, splitLine: { lineStyle: { color: '#1a3350' } } },
  series: [
    { name: '2023', type: 'bar', data: [320, 280, 45, 560, 410], itemStyle: { color: '#1e5fa8' }, barWidth: 14 },
    { name: '2024', type: 'bar', data: [480, 360, 72, 780, 520], itemStyle: { color: '#00d4ff' }, barWidth: 14 },
  ],
})

const getHorizontalBarOption = () => ({
  title: { text: '建材行业领域占比', left: 'center', textStyle: { color: '#b8d4ff', fontSize: 13, fontWeight: 500 } },
  tooltip: { trigger: 'axis' },
  grid: { left: '22%', right: '12%', top: '18%', bottom: '10%' },
  xAxis: { type: 'value', axisLabel: { color: '#8ba9cc', formatter: '{value}%' }, splitLine: { lineStyle: { color: '#1a3350' } } },
  yAxis: { type: 'category', data: ['水泥', '玻璃', '陶瓷', '混凝土', '新型建材', '石材'], axisLabel: { color: '#8ba9cc', fontSize: 11 }, inverse: true },
  series: [{
    type: 'bar', data: [28, 22, 18, 15, 10, 7],
    itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
      { offset: 0, color: '#0d47a1' }, { offset: 1, color: '#00e5ff' },
    ]) },
    barWidth: 12, label: { show: true, position: 'right', color: '#b8d4ff', formatter: '{c}%', fontSize: 11 },
  }],
})

const getGroupedBarOption = () => ({
  title: { text: '双师型教师占比', left: 'center', textStyle: { color: '#b8d4ff', fontSize: 13, fontWeight: 500 } },
  tooltip: { trigger: 'axis' },
  legend: { data: ['标杆院校', '双高计划', '高职院校', '职业院校'], bottom: 0, textStyle: { color: '#8ba9cc', fontSize: 11 } },
  grid: { left: '10%', right: '6%', top: '18%', bottom: '14%' },
  xAxis: { type: 'category', data: ['2020', '2021', '2022', '2023', '2024'], axisLabel: { color: '#8ba9cc', fontSize: 10 } },
  yAxis: { type: 'value', axisLabel: { color: '#8ba9cc', formatter: '{value}%' }, splitLine: { lineStyle: { color: '#1a3350' } } },
  series: [
    { name: '标杆院校', type: 'bar', data: [45, 52, 58, 65, 72], itemStyle: { color: '#1677ff' }, barWidth: 6, barGap: '10%' },
    { name: '双高计划', type: 'bar', data: [38, 44, 50, 56, 63], itemStyle: { color: '#00d4ff' }, barWidth: 6 },
    { name: '高职院校', type: 'bar', data: [28, 33, 38, 42, 48], itemStyle: { color: '#7c4dff' }, barWidth: 6 },
    { name: '职业院校', type: 'bar', data: [20, 25, 30, 35, 40], itemStyle: { color: '#b388ff' }, barWidth: 6 },
  ],
})

const getPieOption = () => ({
  title: { text: '行业类型比例', left: 'center', textStyle: { color: '#b8d4ff', fontSize: 13, fontWeight: 500 } },
  tooltip: { trigger: 'item', formatter: '{b}: {c}家 ({d}%)' },
  series: [{
    type: 'pie', radius: ['45%', '72%'], center: ['50%', '55%'],
    label: { color: '#8ba9cc', fontSize: 10 },
    emphasis: { label: { fontSize: 14, fontWeight: 'bold' } },
    data: [
      { value: 156, name: '玻璃', itemStyle: { color: '#1677ff' } },
      { value: 98, name: '陶瓷', itemStyle: { color: '#00d4ff' } },
      { value: 210, name: '水泥', itemStyle: { color: '#7c4dff' } },
      { value: 67, name: '泥沙', itemStyle: { color: '#ff9800' } },
    ],
  }],
})

const getLineOption = () => ({
  title: { text: '行业新增分析量', left: 'center', textStyle: { color: '#b8d4ff', fontSize: 13, fontWeight: 500 } },
  tooltip: { trigger: 'axis' },
  legend: { data: ['企业', '院校'], bottom: 0, textStyle: { color: '#8ba9cc', fontSize: 11 } },
  grid: { left: '12%', right: '6%', top: '18%', bottom: '14%' },
  xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'], axisLabel: { color: '#8ba9cc', fontSize: 9 } },
  yAxis: { type: 'value', axisLabel: { color: '#8ba9cc' }, splitLine: { lineStyle: { color: '#1a3350' } } },
  series: [
    { name: '企业', type: 'line', data: [65, 59, 80, 81, 56, 55, 70, 90, 85, 78, 92, 88], smooth: true, lineStyle: { color: '#00d4ff', width: 2 }, itemStyle: { color: '#00d4ff' }, symbol: 'circle', symbolSize: 4 },
    { name: '院校', type: 'line', data: [45, 48, 60, 65, 52, 48, 62, 75, 70, 68, 80, 76], smooth: true, lineStyle: { color: '#1677ff', width: 2 }, itemStyle: { color: '#1677ff' }, symbol: 'circle', symbolSize: 4 },
  ],
})

const getCityPieOption = () => ({
  title: { text: '新增入会城市分布', left: 'center', textStyle: { color: '#b8d4ff', fontSize: 13, fontWeight: 500 } },
  tooltip: { trigger: 'item', formatter: '{b}: {c}家 ({d}%)' },
  series: [{
    type: 'pie', radius: '60%', center: ['50%', '55%'],
    label: { color: '#8ba9cc', fontSize: 9, formatter: '{b}\n{d}%' },
    data: [
      { value: 45, name: '深圳', itemStyle: { color: '#1677ff' } },
      { value: 38, name: '广州', itemStyle: { color: '#00d4ff' } },
      { value: 28, name: '东莞', itemStyle: { color: '#7c4dff' } },
      { value: 22, name: '佛山', itemStyle: { color: '#ff9800' } },
      { value: 18, name: '惠州', itemStyle: { color: '#4caf50' } },
      { value: 32, name: '其他', itemStyle: { color: '#607d8b' } },
    ],
  }],
})

// ─── Line colors for China map ───────────────────────────────────────────────
const MAP_LINES = [
  { from: '深圳', to: '北京', coords: [[114.07, 22.62], [116.40, 39.90]] },
  { from: '深圳', to: '上海', coords: [[114.07, 22.62], [121.47, 31.23]] },
  { from: '广州', to: '武汉', coords: [[113.26, 23.13], [114.30, 30.60]] },
  { from: '深圳', to: '成都', coords: [[114.07, 22.62], [104.06, 30.67]] },
  { from: '广州', to: '杭州', coords: [[113.26, 23.13], [120.15, 30.28]] },
  { from: '深圳', to: '重庆', coords: [[114.07, 22.62], [106.55, 29.57]] },
]

const SCATTER_CITIES = [
  { name: '深圳', value: [114.07, 22.62, 120] },
  { name: '广州', value: [113.26, 23.13, 90] },
  { name: '北京', value: [116.40, 39.90, 80] },
  { name: '上海', value: [121.47, 31.23, 70] },
  { name: '武汉', value: [114.30, 30.60, 50] },
  { name: '成都', value: [104.06, 30.67, 45] },
  { name: '杭州', value: [120.15, 30.28, 40] },
  { name: '重庆', value: [106.55, 29.57, 55] },
  { name: '东莞', value: [113.75, 23.05, 35] },
  { name: '佛山', value: [113.12, 23.02, 30] },
]

const FLOW_POINTS = [
  { coords: [[114.07, 22.62], [116.40, 39.90]] },
  { coords: [[114.07, 22.62], [121.47, 31.23]] },
  { coords: [[113.26, 23.13], [114.30, 30.60]] },
  { coords: [[114.07, 22.62], [104.06, 30.67]] },
  { coords: [[113.26, 23.13], [120.15, 30.28]] },
]

// ─── Main Component ──────────────────────────────────────────────────────────
export default function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState('')
  const [mapRegistered, setMapRegistered] = useState(false)

  // Refs for charts
  const barRef = useRef(null)
  const hBarRef = useRef(null)
  const groupedBarRef = useRef(null)
  const pieRef = useRef(null)
  const lineRef = useRef(null)
  const cityPieRef = useRef(null)
  const mapRef = useRef(null)
  const chartInstances = useRef([])

  const disposeCharts = useCallback(() => {
    chartInstances.current.forEach(c => { try { c.dispose() } catch {} })
    chartInstances.current = []
  }, [])

  // Load china map geojson
  const [mapError, setMapError] = useState(false)
  useEffect(() => {
    let cancelled = false
    fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(geo => {
        if (cancelled) return
        echarts.registerMap('china', geo)
        setMapRegistered(true)
      })
      .catch(() => {
        if (!cancelled) setMapError(true)
      })
    return () => { cancelled = true }
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
    create(barRef, getBarOption)
    create(hBarRef, getHorizontalBarOption)
    create(groupedBarRef, getGroupedBarOption)
    create(pieRef, getPieOption)
    create(lineRef, getLineOption)
    create(cityPieRef, getCityPieOption)
    return disposeCharts
  }, [disposeCharts])

  // Create map chart after geo is registered
  useEffect(() => {
    if (!mapRegistered || !mapRef.current) return
    const inst = echarts.init(mapRef.current)
    const FLOW_SERIES = FLOW_POINTS.map((fp, i) => ({
      type: 'lines', coordinateSystem: 'geo', polyline: false,
      data: [{ coords: fp.coords }],
      lineStyle: { color: '#00e5ff', width: 1.5, opacity: 0.6, curveness: 0.2 },
      effect: { show: true, period: 4 + i * 0.5, trailLength: 0.2, symbol: 'arrow', symbolSize: 6, color: '#fff' },
      zlevel: i,
    }))
    inst.setOption({
      tooltip: { trigger: 'item' },
      geo: {
        map: 'china', roam: false, zoom: 1.22, center: [108, 35],
        itemStyle: { areaColor: '#0d2b52', borderColor: '#1a5080', borderWidth: 1 },
        emphasis: { itemStyle: { areaColor: '#1a4478' }, label: { show: false } },
      },
      series: [
        ...FLOW_SERIES,
        {
          type: 'effectScatter', coordinateSystem: 'geo',
          data: SCATTER_CITIES.map(c => ({ name: c.name, value: c.value })),
          symbolSize: v => Math.sqrt(v[2]) * 3,
          showEffectOn: 'render', rippleEffect: { brushType: 'stroke', scale: 3, period: 4 },
          itemStyle: { color: '#00e5ff' }, label: { show: true, position: 'right', formatter: '{b}', color: '#b8d4ff', fontSize: 10 },
        },
      ],
    })
    chartInstances.current.push(inst)
    return () => { try { inst.dispose() } catch {} }
  }, [mapRegistered])

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
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #0d47a1, #1565c0)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>
              产融
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#0d47a1', lineHeight: 1.2 }}>产教融合云平台</div>
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

          {/* Dashboard grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px 1fr', gridTemplateRows: 'auto auto auto', gap: 14 }}>
            {/* Row 1: Bar chart | Stat cards | Horizontal bar */}
            <div style={{ background: 'rgba(10,30,60,0.85)', borderRadius: 10, border: '1px solid rgba(0,212,255,0.15)', padding: 10, minHeight: 260 }} ref={barRef} />

            {/* Stat cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(13,71,161,0.6), rgba(21,101,192,0.4))', borderRadius: 10, border: '1px solid rgba(0,212,255,0.2)', padding: 20, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 12, color: '#8ba9cc', marginBottom: 8 }}>协同育人数量</div>
                <div style={{ fontSize: 40, fontWeight: 700, color: '#00e5ff', fontFamily: 'DIN, monospace' }}>2,612</div>
                <div style={{ fontSize: 11, color: '#4caf50', marginTop: 4 }}>↑ 28.5% 同比增长</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, rgba(13,71,161,0.6), rgba(21,101,192,0.4))', borderRadius: 10, border: '1px solid rgba(0,212,255,0.2)', padding: 20, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 12, color: '#8ba9cc', marginBottom: 8 }}>标准制定数量</div>
                <div style={{ fontSize: 40, fontWeight: 700, color: '#ff9800', fontFamily: 'DIN, monospace' }}>158</div>
                <div style={{ fontSize: 11, color: '#4caf50', marginTop: 4 }}>↑ 15.3% 同比增长</div>
              </div>
            </div>

            <div style={{ background: 'rgba(10,30,60,0.85)', borderRadius: 10, border: '1px solid rgba(0,212,255,0.15)', padding: 10, minHeight: 260 }} ref={hBarRef} />

            {/* Row 2: Grouped bar + pie | China map | Line chart + city pie */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'rgba(10,30,60,0.85)', borderRadius: 10, border: '1px solid rgba(0,212,255,0.15)', padding: 10, minHeight: 250 }} ref={groupedBarRef} />
              <div style={{ background: 'rgba(10,30,60,0.85)', borderRadius: 10, border: '1px solid rgba(0,212,255,0.15)', padding: 10, minHeight: 250 }} ref={pieRef} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'rgba(10,30,60,0.85)', borderRadius: 10, border: '1px solid rgba(0,212,255,0.18)', minHeight: 260, position: 'relative', overflow: 'hidden' }}>
                {mapRegistered ? (
                  <div ref={mapRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
                ) : mapError ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 260, color: '#8ba9cc' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
                    <div style={{ fontSize: 13, marginBottom: 8 }}>中国产教融合地图数据暂不可用</div>
                    <div style={{ fontSize: 11, color: '#4a7aaa' }}>请使用兼容浏览器或稍后再试</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260, color: '#4a7aaa', fontSize: 13 }}>加载地图数据中...</div>
                )}
              </div>
              <div style={{ background: 'rgba(10,30,60,0.85)', borderRadius: 10, border: '1px solid rgba(0,212,255,0.15)', padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#8ba9cc', marginBottom: 8 }}>覆盖省市</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#00e5ff', fontFamily: 'DIN, monospace' }}>31</div>
                <div style={{ fontSize: 11, color: '#8ba9cc', marginTop: 4 }}>个省级行政区</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'rgba(10,30,60,0.85)', borderRadius: 10, border: '1px solid rgba(0,212,255,0.15)', padding: 10, minHeight: 250 }} ref={lineRef} />
              <div style={{ background: 'rgba(10,30,60,0.85)', borderRadius: 10, border: '1px solid rgba(0,212,255,0.15)', padding: 10, minHeight: 250 }} ref={cityPieRef} />
            </div>
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
        Copyright &copy; 2024 产教融合云平台 · Industry-Education Integration Cloud Platform · All Rights Reserved.
      </footer>
    </div>
  )
}
