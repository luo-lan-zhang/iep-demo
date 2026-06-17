import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Typography, Row, Col, Card, Space, Tag, Divider } from 'antd'
import {
  ExperimentOutlined, ProjectOutlined, NodeIndexOutlined,
  TrophyOutlined, BankOutlined, GlobalOutlined, UserOutlined,
  TeamOutlined, SafetyCertificateOutlined, ApartmentOutlined,
  ArrowRightOutlined, ThunderboltOutlined,
  DeploymentUnitOutlined, BookOutlined,
  FundOutlined, GiftOutlined, RiseOutlined,
  StarOutlined, CheckCircleOutlined, RocketOutlined,
  AimOutlined, HeartOutlined, BulbOutlined,
  RadarChartOutlined, CodeOutlined, DotChartOutlined,
  GatewayOutlined, RobotOutlined, BranchesOutlined,
  ScanOutlined, EyeOutlined, AudioOutlined,
  CloudOutlined, ShakeOutlined, KeyOutlined,
  DashboardOutlined
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

// ─── Data ───────────────────────────────────────────────────────────────────
const features = [
  { icon: <ProjectOutlined />, title: '项目合作', desc: '企业发布需求→教师审核→学校复审\n→教师下发→学生执行→五维评价', color: '#1677ff' },
  { icon: <NodeIndexOutlined />, title: '人才对接', desc: '岗位发布→智能匹配→简历投递\n→面试邀约→教师推荐→AI推荐', color: '#36cfc9' },
  { icon: <ExperimentOutlined />, title: '共享资源池', desc: '院校发布闲置硬件设备\n企业申请使用，学校获取积分收益', color: '#1677ff' },
  { icon: <TrophyOutlined />, title: '成果广场', desc: '教师发布科研成果/技术方案/专利软著\n企业浏览对接', color: '#36cfc9' },
  { icon: <DeploymentUnitOutlined />, title: '技术服务情况', desc: '社会培训指标发布与承接\n技术服务需求对接', color: '#1677ff' },
  { icon: <BookOutlined />, title: '教学资源转化', desc: '企业项目→教学文件转化\n入库评审→积分激励', color: '#36cfc9' },
  { icon: <FundOutlined />, title: '智慧驾驶舱', desc: '数字大屏实时展示产业全景\n各端口数据可视化分析', color: '#1677ff', isBig: true },
]

const roles = [
  { role: 'council', label: '产教融合理事会', icon: <ApartmentOutlined />, desc: '用户管理·项目审核·积分仲裁' },
  { role: 'park', label: '园区', icon: <GatewayOutlined />, desc: '区域数据·园区企业管理' },
  { role: 'enterprise', label: '企业', icon: <GlobalOutlined />, desc: '发布需求·对接人才·管理导师' },
  { role: 'mentor', label: '企业导师', icon: <SafetyCertificateOutlined />, desc: '项目指导·评审成果' },
  { role: 'school', label: '院校', icon: <BankOutlined />, desc: '管理教师·审核资源·激励政策' },
  { role: 'teacher', label: '教师', icon: <UserOutlined />, desc: '承接项目·发布成果·五维评价' },
  { role: 'student', label: '学生', icon: <TeamOutlined />, desc: '接受任务·提交成果·投递岗位' },
]

const flowSteps = [
  { icon: <ScanOutlined />, title: 'AI需求感知', desc: 'AI实时分析汇聚企业技术难题与岗位需求变化', color: '#1677ff' },
  { icon: <RobotOutlined />, title: '智能匹配', desc: 'AI算法精准匹配教师团队，自动推送任务', color: '#36cfc9' },
  { icon: <BranchesOutlined />, title: '协同执行', desc: '项目看板全程透明，任务进度实时跟踪', color: '#1677ff' },
  { icon: <StarOutlined />, title: '价值闭环', desc: '贡献→积分→收益，AI驱动价值量化', color: '#36cfc9' },
]

const stats = [
  { value: '7', suffix: '', label: '核心角色', desc: '覆盖产教融合全链路参与者' },
  { value: '6', suffix: '+', label: '功能模块', desc: '从项目合作到积分管理全覆盖' },
  { value: '5', suffix: '维', label: '评价体系', desc: 'AI辅助五维能力评估模型' },
  { value: '7×24', suffix: '', label: 'AI驱动', desc: '智能匹配·自动推送·数据洞察' },
]

// ─── Animated Counter ──────────────────────────────────────────────────────
function AnimatedStat({ value, suffix, label, desc, delay }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect() }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const num = parseInt(value) || 0
    if (num === 0) { setCount(value); return }
    let start = 0
    const step = Math.ceil(num / 40)
    const timer = setInterval(() => {
      start += step
      if (start >= num) { clearInterval(timer); setCount(num) }
      else setCount(start)
    }, delay || 40)
    return () => clearInterval(timer)
  }, [visible])

  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '24px 12px', transition: 'all 0.6s', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)' }}>
      <div style={{ fontSize: 42, fontWeight: 700, background: 'linear-gradient(135deg, #1677ff, #36cfc9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#e8f4f8', marginTop: 8 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{desc}</div>
    </div>
  )
}

// ─── Reveal on Scroll ──────────────────────────────────────────────────────
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setTimeout(() => setVisible(true), delay); observer.disconnect() }
    }, { threshold: 0.15 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)' }}>
      {children}
    </div>
  )
}

// ─── Particles / Neural Grid ───────────────────────────────────────────────
function NeuralBg() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Grid pattern */}
      <svg style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.06 }}>
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#60a5fa" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* Floating particles */}
      {[...Array(40)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: i % 2 === 0 ? 4 : 8,
          height: i % 2 === 0 ? 4 : 8,
          borderRadius: '50%',
          background: i % 3 === 0 ? 'rgba(54,207,201,0.5)' : i % 3 === 1 ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.2)',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float-${i % 4} ${Math.random() * 8 + 5}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 5}s`,
          boxShadow: i % 2 === 0 ? `0 0 ${Math.random() * 10 + 5}px rgba(54,207,201,0.3)` : 'none',
        }} />
      ))}
      {/* Connecting lines */}
      <svg style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.04 }}>
        {[...Array(8)].map((_, i) => (
          <line key={i} x1={`${Math.random() * 100}%`} y1={`${Math.random() * 100}%`} x2={`${Math.random() * 100}%`} y2={`${Math.random() * 100}%`} stroke="#60a5fa" strokeWidth="1" />
        ))}
      </svg>
      {/* Glowing orbs */}
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(22,119,255,0.12), transparent 70%)', top: '-15%', right: '-10%', animation: 'pulseGlow 6s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(54,207,201,0.08), transparent 70%)', bottom: '5%', left: '-8%', animation: 'pulseGlow 8s ease-in-out infinite 1s' }} />
      <style>{`
        @keyframes float-0 { 0%,100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-25px) translateX(10px); } }
        @keyframes float-1 { 0%,100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(15px) translateX(-15px); } }
        @keyframes float-2 { 0%,100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-20px) translateX(-5px); } }
        @keyframes float-3 { 0%,100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(10px) translateX(20px); } }
        @keyframes pulseGlow { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ═══════════════ HERO ═══════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #020b1a 0%, #0a1f3d 25%, #0d2b52 50%, #061830 75%, #020b1a 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', padding: '40px 24px',
      }}>
        <NeuralBg />

        <div style={{ maxWidth: 1100, width: '100%', position: 'relative', zIndex: 1 }}>
          <Row align="middle" gutter={[48, 48]}>
            <Col xs={24} md={14}>
              <div style={{ animation: 'fadeSlideUp 0.8s forwards' }}>
                <Tag icon={<RobotOutlined />} color="#36cfc9" style={{ fontSize: 13, padding: '4px 14px', borderRadius: 20, marginBottom: 20, border: 'none' }}>
                  AI驱动 · 产教融合数字化平台
                </Tag>
                <Title level={1} style={{
                  color: '#fff', fontSize: 44, margin: '0 0 16px', lineHeight: 1.15, letterSpacing: -1, fontWeight: 700,
                }}>
                  产教融合云平台
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, lineHeight: 1.9, maxWidth: 560, marginBottom: 24 }}>
                  以<b style={{ color: 'rgba(255,255,255,0.85)' }}>人工智能</b>为核心驱动，构建连接园区、企业、院校、师生七大角色的数字化生态。
                  AI实时感知产业需求变化，通过<b style={{ color: 'rgba(255,255,255,0.85)' }}>"需求感知→智能匹配→任务触达"</b>
                  的智能调度体系，实现教学资源与产业需求的动态契合。
                </Paragraph>

                {/* AI visual chips */}
                <Row gutter={[8, 8]} style={{ marginBottom: 28 }}>
                  {[
                    { icon: <RobotOutlined />, label: 'AI智能匹配' },
                    { icon: <RadarChartOutlined />, label: '五维评估' },
                    { icon: <NodeIndexOutlined />, label: '数据分析' },
                    { icon: <CloudOutlined />, label: '智慧决策' },
                  ].map((item, i) => (
                    <Col key={i}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '5px 14px',
                        background: 'rgba(54,207,201,0.1)',
                        border: '1px solid rgba(54,207,201,0.2)',
                        borderRadius: 20,
                        color: '#36cfc9', fontSize: 12,
                      }}>
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                    </Col>
                  ))}
                </Row>

                <Space size={16} wrap>
                  <Button
                    type="primary" size="large"
                    icon={<RocketOutlined />}
                    onClick={() => navigate('/login')}
                    style={{
                      height: 54, borderRadius: 27, paddingInline: 38, fontSize: 16,
                      background: 'linear-gradient(90deg, #1677ff, #36cfc9)',
                      border: 'none',
                      boxShadow: '0 8px 32px rgba(22,119,255,0.35)',
                      fontWeight: 500,
                    }}
                  >
                    进入后台管理
                    <ArrowRightOutlined style={{ marginLeft: 6 }} />
                  </Button>
                  <Button
                    size="large" ghost
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    style={{ height: 54, borderRadius: 27, paddingInline: 28, borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', fontSize: 15 }}
                  >
                    了解更多
                  </Button>
                </Space>
              </div>
            </Col>

            <Col xs={24} md={10}>
              <div style={{
                animation: 'fadeSlideUp 0.8s forwards 0.2s',
              }}>
                {/* AI Scene - Neural Network Visualization */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 20, padding: 28,
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(54,207,201,0.15)',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #1677ff, #36cfc9)' }} />

                  <Title level={4} style={{ color: '#e8f4f8', marginBottom: 20, textAlign: 'center', fontSize: 15, fontWeight: 600 }}>
                    <RobotOutlined style={{ marginRight: 8, color: '#36cfc9' }} />
                    AI 智能场景演示
                  </Title>

                  {/* Neural network nodes */}
                  <svg viewBox="0 0 320 200" style={{ width: '100%', height: 180 }}>
                    {/* Layer 1 - Input */}
                    {[0, 1, 2].map(i => (
                      <circle key={`l1-${i}`} cx={40} cy={40 + i * 55} r={8} fill="rgba(22,119,255,0.6)" stroke="#1677ff" strokeWidth="1.5">
                        <animate attributeName="r" values="8;10;8" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                      </circle>
                    ))}
                    {/* Layer 2 - Hidden */}
                    {[0, 1, 2, 3].map(i => (
                      <circle key={`l2-${i}`} cx={120} cy={20 + i * 45} r={6} fill="rgba(54,207,201,0.5)" stroke="#36cfc9" strokeWidth="1">
                        <animate attributeName="r" values="6;8;6" dur={`${2.5 + i * 0.2}s`} repeatCount="indefinite" />
                      </circle>
                    ))}
                    {/* Layer 3 - Hidden */}
                    {[0, 1, 2, 3].map(i => (
                      <circle key={`l3-${i}`} cx={200} cy={20 + i * 45} r={6} fill="rgba(22,119,255,0.5)" stroke="#1677ff" strokeWidth="1">
                        <animate attributeName="r" values="6;9;6" dur={`${3 + i * 0.15}s`} repeatCount="indefinite" />
                      </circle>
                    ))}
                    {/* Layer 4 - Output */}
                    {[0, 1, 2].map(i => (
                      <circle key={`l4-${i}`} cx={280} cy={40 + i * 55} r={8} fill="rgba(54,207,201,0.6)" stroke="#36cfc9" strokeWidth="1.5">
                        <animate attributeName="r" values="8;11;8" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                      </circle>
                    ))}
                    {/* Connections L1→L2 */}
                    {[0, 1, 2].flatMap(i => [0, 1, 2, 3].map(j => (
                      <line key={`c1-${i}-${j}`} x1={48} y1={40 + i * 55} x2={114} y2={20 + j * 45} stroke="rgba(22,119,255,0.12)" strokeWidth="0.8" />
                    )))}
                    {/* Connections L2→L3 */}
                    {[0, 1, 2, 3].flatMap(i => [0, 1, 2, 3].map(j => (
                      <line key={`c2-${i}-${j}`} x1={126} y1={20 + i * 45} x2={194} y2={20 + j * 45} stroke="rgba(54,207,201,0.12)" strokeWidth="0.8" />
                    )))}
                    {/* Connections L3→L4 */}
                    {[0, 1, 2, 3].flatMap(i => [0, 1, 2].map(j => (
                      <line key={`c3-${i}-${j}`} x1={206} y1={20 + i * 45} x2={272} y2={40 + j * 55} stroke="rgba(22,119,255,0.12)" strokeWidth="0.8" />
                    )))}
                    {/* Labels */}
                    <text x={40} y={185} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={10}>产业需求</text>
                    <text x={120} y={185} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={10}>AI分析</text>
                    <text x={200} y={185} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={10}>智能匹配</text>
                    <text x={280} y={185} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={10}>精准推送</text>
                  </svg>

                  {/* 7角色快速入口 */}
                  <Row gutter={[8, 8]} style={{ marginTop: 12 }}>
                    {roles.map((r, i) => (
                      <Col span={12} key={r.role}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '7px 10px',
                          background: `rgba(255,255,255,${0.03 + i * 0.01})`,
                          borderRadius: 8,
                          border: '1px solid rgba(255,255,255,0.06)',
                          transition: 'all 0.3s',
                          cursor: 'default',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(22,119,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(22,119,255,0.3)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = `rgba(255,255,255,${0.03 + i * 0.01})`; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
                        >
                          <span style={{ color: '#36cfc9', fontSize: 16 }}>{r.icon}</span>
                          <span style={{ color: '#e8f4f8', fontSize: 12 }}>{r.label}</span>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(180deg, #061830 0%, #0a1f3d 100%)',
        padding: '40px 24px 60px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Row gutter={[16, 16]}>
            {stats.map((s, i) => (
              <Col xs={12} md={6} key={i}>
                <div style={{
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(8px)',
                }}>
                  <AnimatedStat {...s} delay={i * 80} />
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ═══════════════ FEATURES ════════════════════════════════════ */}
      <section id="features" style={{
        background: 'linear-gradient(180deg, #0a1f3d 0%, #0d2b52 50%, #0a1f3d 100%)',
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <Tag icon={<BulbOutlined />} color="#36cfc9" style={{ fontSize: 13, padding: '4px 14px', borderRadius: 20, marginBottom: 12, border: 'none' }}>功能矩阵</Tag>
              <Title level={2} style={{ fontSize: 32, marginBottom: 12, fontWeight: 700, color: '#e8f4f8' }}>
                AI驱动的核心功能
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, display: 'block', margin: '0 auto', maxWidth: 500 }}>
                六大功能模块，覆盖产教融合全业务流程
              </Text>
            </div>
          </Reveal>

          <Row gutter={[24, 24]}>
            {features.map((f, i) => (
              <Col xs={24} sm={12} md={8} key={i}>
                <Reveal delay={i * 100}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: 16,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      height: '100%', overflow: 'hidden',
                      transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                    bodyStyle={{ padding: 28 }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-6px)'
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(22,119,255,0.15)'
                      e.currentTarget.style.borderColor = 'rgba(54,207,201,0.3)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                    }}
                  >
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: `${f.color}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26, color: f.color, marginBottom: 18,
                    }}>
                      {f.icon}
                    </div>
                    <Title level={4} style={{ fontSize: 17, marginBottom: 8, fontWeight: 600, color: '#e8f4f8' }}>{f.title}</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-line' }}>{f.desc}</Text>
                  </Card>
                </Reveal>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ═══════════════ AI FLOW ═════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(180deg, #0a1f3d 0%, #061830 100%)',
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <Tag icon={<RobotOutlined />} color="#1677ff" style={{ fontSize: 13, padding: '4px 14px', borderRadius: 20, marginBottom: 12, border: 'none' }}>AI工作流</Tag>
              <Title level={2} style={{ fontSize: 32, marginBottom: 12, fontWeight: 700, color: '#e8f4f8' }}>
                AI驱动的智能调度闭环
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>从需求感知到价值闭环的全链路AI赋能</Text>
            </div>
          </Reveal>

          <Row gutter={[16, 16]} justify="center">
            {flowSteps.map((step, i) => (
              <Col xs={24} sm={12} md={6} key={i}>
                <Reveal delay={i * 120}>
                  <div style={{
                    textAlign: 'center', padding: '32px 20px',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.08)',
                    position: 'relative', height: '100%',
                    transition: 'all 0.3s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 30px rgba(22,119,255,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${step.color}, rgba(54,207,201,0.6))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28, color: '#fff', margin: '0 auto 16px',
                      boxShadow: `0 8px 24px ${step.color}33`,
                    }}>
                      {step.icon}
                    </div>
                    <div style={{
                      position: 'absolute', top: 16, right: 16,
                      width: 24, height: 24, borderRadius: '50%',
                      background: step.color,
                      color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 'bold',
                    }}>{i + 1}</div>
                    <Title level={4} style={{ fontSize: 16, marginBottom: 8, color: step.color, fontWeight: 600 }}>{step.title}</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.6 }}>{step.desc}</Text>
                  </div>
                </Reveal>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ═══════════════ VALUE CHAIN ═════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(180deg, #061830 0%, #0a1f3d 100%)',
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <Tag icon={<StarOutlined />} color="#1677ff" style={{ fontSize: 13, padding: '4px 14px', borderRadius: 20, marginBottom: 12, border: 'none' }}>价值体系</Tag>
              <Title level={2} style={{ fontSize: 32, marginBottom: 12, fontWeight: 700, color: '#e8f4f8' }}>
                价值共生 · AI量化体系
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, display: 'block', margin: '0 auto', maxWidth: 500 }}>
                AI驱动"贡献→积分→收益"的量化路径，所有参与方的贡献可被精确计量
              </Text>
            </div>
          </Reveal>

          <Row gutter={[24, 24]} justify="center">
            {[
              { step: '1', title: '贡 献', desc: '企业发布项目、导师指导、学生交付成果等所有参与行为由AI全程记录', color: '#1677ff', icon: <HeartOutlined /> },
              { step: '2', title: '积 分', desc: 'AI智能算法根据贡献度、完成质量自动计算并分配"贡献积分"', color: '#36cfc9', icon: <NodeIndexOutlined /> },
              { step: '3', title: '收 益', desc: '积分与园区租金减免、职称晋升、学分置换等核心利益直接挂钩', color: '#1677ff', icon: <GiftOutlined /> },
            ].map((item, i) => (
              <Col xs={24} md={8} key={i}>
                <Reveal delay={i * 150}>
                  <Card
                    style={{
                      borderRadius: 16,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      height: '100%', textAlign: 'center',
                      transition: 'all 0.4s',
                    }}
                    hoverable
                    onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${item.color}22` }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <div style={{
                      width: 60, height: 60, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${item.color}, rgba(54,207,201,0.6))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26, color: '#fff', margin: '0 auto 16px',
                      boxShadow: `0 8px 20px ${item.color}33`,
                    }}>
                      {item.icon}
                    </div>
                    <Title level={4} style={{ fontSize: 18, color: item.color, marginBottom: 12, fontWeight: 600 }}>{item.title}</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.8 }}>{item.desc}</Text>
                  </Card>
                </Reveal>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ═══════════════ COCKPIT PREVIEW ═════════════════════════ */}
      <section style={{
        background: 'linear-gradient(180deg, #061830 0%, #020b1a 50%, #061830 100%)',
        padding: '60px 24px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Scanline overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(54,207,201,0.02) 2px, rgba(54,207,201,0.02) 4px)', pointerEvents: 'none', zIndex: 1 }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <Tag icon={<DashboardOutlined />} color="#36cfc9" style={{ fontSize: 13, padding: '4px 14px', borderRadius: 20, marginBottom: 12, border: 'none' }}>数字大屏</Tag>
              <Title level={2} style={{ fontSize: 32, fontWeight: 700, color: '#e8f4f8', marginBottom: 8 }}>
                智慧驾驶舱
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>全端口数据实时可视化 · 产业全景一屏掌控</Text>
            </div>
          </Reveal>

          <Reveal>
            {/* Big Screen Frame */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(22,119,255,0.08), rgba(54,207,201,0.05))',
              borderRadius: 20,
              border: '1px solid rgba(54,207,201,0.15)',
              padding: '4px',
              boxShadow: '0 0 60px rgba(22,119,255,0.08), inset 0 0 60px rgba(22,119,255,0.03)',
            }}>
              <div style={{
                background: 'linear-gradient(180deg, #061830 0%, #0a1f3d 100%)',
                borderRadius: 18,
                padding: 32,
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(54,207,201,0.08)',
              }}>
                {/* Top scanning line */}
                <div style={{
                  position: 'absolute', left: '5%', right: '5%', height: 1,
                  background: 'linear-gradient(90deg, transparent, #36cfc9, transparent)',
                  animation: 'scanLine 4s ease-in-out infinite',
                  opacity: 0.6,
                }} />

                {/* Header bar */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 24, paddingBottom: 16,
                  borderBottom: '1px solid rgba(54,207,201,0.1)',
                }}>
                  <Space>
                    <DashboardOutlined style={{ color: '#36cfc9', fontSize: 20 }} />
                    <span style={{ color: '#e8f4f8', fontSize: 16, fontWeight: 600, letterSpacing: 2 }}>智慧驾驶舱 · 实时数据大屏</span>
                  </Space>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['产业全景', '资源整合', '人才供需', '服务成果'].map(label => (
                      <span key={label} style={{
                        padding: '3px 12px', borderRadius: 12,
                        background: 'rgba(54,207,201,0.1)',
                        color: '#36cfc9', fontSize: 11, border: '1px solid rgba(54,207,201,0.15)',
                      }}>{label}</span>
                    ))}
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'monospace' }}>
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>

                {/* KPI Row */}
                <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
                  {[
                    { label: '平台注册用户', value: '2,847', unit: '人', change: '+12.5%' },
                    { label: '合作企业', value: '86', unit: '家', change: '+5.2%' },
                    { label: '院校数量', value: '12', unit: '所', change: '+8.3%' },
                    { label: '累计项目', value: '45', unit: '个', change: '+23.1%' },
                    { label: '成果转化', value: '¥1.2', unit: '亿', change: '+15.7%' },
                    { label: '培训人次', value: '3,560', unit: '人', change: '+18.9%' },
                  ].map((kpi, i) => (
                    <Col xs={12} sm={8} md={4} key={i}>
                      <div style={{
                        background: 'rgba(22,119,255,0.06)',
                        borderRadius: 10, padding: '12px 10px',
                        border: '1px solid rgba(54,207,201,0.08)',
                        textAlign: 'center',
                      }}>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 4 }}>{kpi.label}</div>
                        <div style={{ color: '#36cfc9', fontSize: 22, fontWeight: 700, fontFamily: 'monospace' }}>
                          {kpi.value}<span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{kpi.unit}</span>
                        </div>
                        <div style={{ color: '#52c41a', fontSize: 10 }}>{kpi.change}</div>
                      </div>
                    </Col>
                  ))}
                </Row>

                {/* Port Data Section */}
                <div style={{
                  background: 'rgba(22,119,255,0.04)',
                  borderRadius: 12, padding: 20,
                  border: '1px solid rgba(54,207,201,0.06)',
                  marginBottom: 20,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <DotChartOutlined style={{ color: '#36cfc9' }} />
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500 }}>各端口数据概览</span>
                  </div>
                  <Row gutter={[12, 12]}>
                    {[
                      { port: '理事会', data: '审核项目 12 项·积分仲裁 5 起·政策发布 3 条', icon: <ApartmentOutlined />, color: '#ff4d4f' },
                      { port: '园区', data: '入驻企业 28 家·产教数据报告 4 份', icon: <GatewayOutlined />, color: '#722ed1' },
                      { port: '企业', data: '发布项目 8 个·岗位 15 个·对接成果 6 次', icon: <GlobalOutlined />, color: '#fa8c16' },
                      { port: '企业导师', data: '指导项目 6 个·评审成果 23 项', icon: <SafetyCertificateOutlined />, color: '#2f54eb' },
                      { port: '院校', data: '管理教师 45 人·审核资源 18 份·激励政策 5 条', icon: <BankOutlined />, color: '#1677ff' },
                      { port: '教师', data: '承接项目 10 个·发布成果 15 项·评价学生 32 次', icon: <UserOutlined />, color: '#13c2c2' },
                      { port: '学生', data: '参与项目 28 人·提交成果 46 次·投递岗位 22 次', icon: <TeamOutlined />, color: '#52c41a' },
                    ].map((item, i) => (
                      <Col xs={24} sm={12} md={8} key={i}>
                        <div style={{
                          display: 'flex', alignItems: 'flex-start', gap: 10,
                          padding: '10px 12px',
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: 8,
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}>
                          <span style={{ color: item.color, fontSize: 18, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                          <div>
                            <div style={{ color: '#e8f4f8', fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{item.port}</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, lineHeight: 1.5 }}>{item.data}</div>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>

                {/* Bottom Chart Bars */}
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <div style={{
                      background: 'rgba(22,119,255,0.04)',
                      borderRadius: 10, padding: 16,
                      border: '1px solid rgba(54,207,201,0.06)',
                    }}>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 12 }}>各端口项目参与热度</div>
                      {[
                        { label: '企业', value: 92, color: '#1677ff' },
                        { label: '院校', value: 85, color: '#36cfc9' },
                        { label: '教师', value: 78, color: '#722ed1' },
                        { label: '学生', value: 95, color: '#52c41a' },
                      ].map((bar, i) => (
                        <div key={i} style={{ marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{bar.label}</span>
                            <span style={{ color: bar.color, fontSize: 11, fontWeight: 600 }}>{bar.value}%</span>
                          </div>
                          <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${bar.value}%`, height: '100%', background: `linear-gradient(90deg, ${bar.color}, rgba(54,207,201,0.5))`, borderRadius: 3, transition: 'width 1.5s' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div style={{
                      background: 'rgba(22,119,255,0.04)',
                      borderRadius: 10, padding: 16,
                      border: '1px solid rgba(54,207,201,0.06)',
                    }}>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 12 }}>积分分布 TOP 5</div>
                      {[
                        { label: '华为技术', value: 45000, color: '#1677ff' },
                        { label: '深圳大学', value: 38000, color: '#36cfc9' },
                        { label: '腾讯科技', value: 32000, color: '#722ed1' },
                        { label: '大疆创新', value: 28000, color: '#fa8c16' },
                        { label: '深职院', value: 22000, color: '#52c41a' },
                      ].map((bar, i) => {
                        const pct = Math.round((bar.value / 45000) * 100)
                        return (
                          <div key={i} style={{ marginBottom: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{bar.label}</span>
                              <span style={{ color: bar.color, fontSize: 11, fontWeight: 600 }}>{bar.value.toLocaleString()}</span>
                            </div>
                            <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: bar.color, borderRadius: 3, opacity: 0.7 }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </Col>
                </Row>

                {/* Bottom border glow */}
                <div style={{
                  position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 1,
                  background: 'linear-gradient(90deg, transparent, rgba(54,207,201,0.3), transparent)',
                }} />
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Button
                type="primary" ghost
                icon={<DashboardOutlined />}
                onClick={() => navigate('/admin/cockpit')}
                style={{
                  height: 44, borderRadius: 22, paddingInline: 28,
                  borderColor: 'rgba(54,207,201,0.3)', color: '#36cfc9',
                  fontSize: 14,
                }}
              >
                进入智慧驾驶舱
                <ArrowRightOutlined style={{ marginLeft: 6 }} />
              </Button>
            </div>
          </Reveal>
        </div>

        <style>{`
          @keyframes scanLine {
            0%, 100% { top: 5%; }
            50% { top: 90%; }
          }
        `}</style>
      </section>

      {/* ═══════════════ ROLES ═══════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(180deg, #0a1f3d 0%, #0d2b52 100%)',
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <Tag icon={<TeamOutlined />} color="#36cfc9" style={{ fontSize: 13, padding: '4px 14px', borderRadius: 20, marginBottom: 12, border: 'none' }}>角色矩阵</Tag>
              <Title level={2} style={{ fontSize: 32, marginBottom: 12, fontWeight: 700, color: '#e8f4f8' }}>
                七大角色 · AI赋能各司其职
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>不同角色在平台中拥有对应的AI辅助权限与功能</Text>
            </div>
          </Reveal>

          <Row gutter={[16, 16]}>
            {roles.map((r, i) => (
              <Col xs={12} md={8} key={i}>
                <Reveal delay={i * 80}>
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    padding: '16px 18px',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.08)',
                    transition: 'all 0.3s',
                    height: '100%',
                    cursor: 'default',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(22,119,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(54,207,201,0.3)'; e.currentTarget.style.background = 'rgba(22,119,255,0.08)' }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'rgba(54,207,201,0.1)',
                      color: '#36cfc9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, flexShrink: 0,
                    }}>{r.icon}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#e8f4f8', marginBottom: 2 }}>{r.label}</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.5 }}>{r.desc}</div>
                    </div>
                  </div>
                </Reveal>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ═══════════════ CTA ════════════════════════════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #020b1a 0%, #0a1f3d 40%, #0d2b52 70%, #061830 100%)',
        padding: '80px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <NeuralBg />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
          <Reveal>
            <Tag icon={<RobotOutlined />} color="#36cfc9" style={{ fontSize: 13, padding: '4px 14px', borderRadius: 20, marginBottom: 20, border: 'none' }}>
              AI驱动 · 即刻体验
            </Tag>
            <Title level={2} style={{ color: '#e8f4f8', fontSize: 32, marginBottom: 16, fontWeight: 700 }}>
              开启AI赋能产教融合之旅
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, display: 'block', marginBottom: 36, lineHeight: 1.8 }}>
              连接产业与教育，AI驱动人才培养与产业需求动态契合
              <br />构建"空间→人才→资源"全面融合的敏捷育人生态
            </Text>
            <Button
              type="primary" size="large"
              icon={<RocketOutlined />}
              onClick={() => navigate('/login')}
              style={{
                height: 56, borderRadius: 28, paddingInline: 44,
                fontSize: 17, fontWeight: 500,
                background: 'linear-gradient(90deg, #1677ff, #36cfc9)',
                border: 'none',
                boxShadow: '0 8px 32px rgba(22,119,255,0.35)',
              }}
            >
              进入后台管理
              <ArrowRightOutlined style={{ marginLeft: 8, fontSize: 18 }} />
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═════════════════════════════════════ */}
      <footer style={{
        background: '#020b1a',
        padding: '32px 24px',
        textAlign: 'center',
        borderTop: '1px solid rgba(54,207,201,0.1)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Space>
            <RobotOutlined style={{ color: '#36cfc9', fontSize: 18 }} />
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 500 }}>产教融合云平台</Text>
            <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>·</Text>
            <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>© 2024 · 纯前端Demo演示版本</Text>
          </Space>
        </div>
      </footer>

      <style>{`
        @keyframes fadeSlideUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .ant-card-body { padding: 24px !important; }
      `}</style>
    </div>
  )
}
