import { useState } from 'react'
import { Card, Row, Col, Statistic, Progress, Tag, Table, Descriptions, Empty } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, BankOutlined, ShopOutlined, TeamOutlined, ProjectOutlined, FundOutlined, TrophyOutlined, BookOutlined, ExperimentOutlined, PieChartOutlined } from '@ant-design/icons'

export default function DataCockpit() {
  // ==================== Mock Data ====================

  const industryOverview = {
    output: '1.2亿',
    outputGrowth: 15.6,
    serviceEnterprises: 86,
    serviceGrowth: 8.3,
    coopSchools: 12,
    coopGrowth: 4.2,
    totalProjects: 45,
    projectGrowth: 22.1,
  }

  const resourceIntegration = [
    { name: '设备捐赠价值', value: '580万元', percent: 72, color: '#1677ff' },
    { name: '企业服务项目数', value: '68项', percent: 85, color: '#52c41a' },
    { name: '企业师资数量', value: '45人', percent: 56, color: '#faad14' },
    { name: '校企共建课程', value: '32门', percent: 64, color: '#722ed1' },
  ]

  const topRanking = [
    { rank: 1, name: '华为技术有限公司', type: '企业', score: 98, value: '12项合作' },
    { rank: 2, name: '石家庄信息工程职业学院', type: '院校', score: 92, value: '10项合作' },
    { rank: 3, name: '腾讯科技（深圳）有限公司', type: '企业', score: 87, value: '8项合作' },
  ]

  const talentDemand = {
    totalGaps: 2860,
    hotJobs: [
      { name: 'AI算法工程师', demand: 520, growth: 35 },
      { name: '嵌入式开发工程师', demand: 450, growth: 28 },
      { name: '大数据工程师', demand: 380, growth: 22 },
      { name: '智能制造工程师', demand: 320, growth: 18 },
      { name: '云计算架构师', demand: 290, growth: 25 },
    ],
    educationDemand: [
      { level: '博士', percent: 8, count: 229 },
      { level: '硕士', percent: 25, count: 715 },
      { level: '本科', percent: 45, count: 1287 },
      { level: '大专及以下', percent: 22, count: 629 },
    ],
  }

  const serviceResults = {
    totalTraining: '2,860人次',
    patentCount: 38,
    softwareCopyright: 52,
    researchCount: 27,
    conversionRate: 68,
    contractAmount: '3,200万元',
  }

  return (
    <div>
      <Card title="数据驾驶舱" style={{ marginBottom: 16 }}>
        {/* ============ Section 1: Industry Panorama ============ */}
        <h3 style={{ marginBottom: 16, color: '#333' }}>
          <BankOutlined style={{ marginRight: 8 }} />产业全景
        </h3>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card hoverable>
              <Statistic
                title="产业产值"
                value={industryOverview.output}
                prefix={<FundOutlined style={{ color: '#1677ff' }} />}
                valueStyle={{ color: '#1677ff', fontSize: 28 }}
              />
              <div style={{ marginTop: 8 }}>
                <Tag color="green"><ArrowUpOutlined /> {industryOverview.outputGrowth}%</Tag>
                <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>同比增长</span>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card hoverable>
              <Statistic
                title="服务企业数"
                value={industryOverview.serviceEnterprises}
                prefix={<ShopOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a', fontSize: 28 }}
              />
              <div style={{ marginTop: 8 }}>
                <Tag color="green"><ArrowUpOutlined /> {industryOverview.serviceGrowth}%</Tag>
                <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>同比增长</span>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card hoverable>
              <Statistic
                title="合作院校"
                value={industryOverview.coopSchools}
                prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1', fontSize: 28 }}
              />
              <div style={{ marginTop: 8 }}>
                <Tag color="green"><ArrowUpOutlined /> {industryOverview.coopGrowth}%</Tag>
                <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>同比增长</span>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card hoverable>
              <Statistic
                title="累计项目"
                value={industryOverview.totalProjects}
                prefix={<ProjectOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14', fontSize: 28 }}
              />
              <div style={{ marginTop: 8 }}>
                <Tag color="green"><ArrowUpOutlined /> {industryOverview.projectGrowth}%</Tag>
                <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>同比增长</span>
              </div>
            </Card>
          </Col>
        </Row>

        {/* ============ Section 2: Resource Integration ============ */}
        <h3 style={{ marginBottom: 16, color: '#333' }}>
          <PieChartOutlined style={{ marginRight: 8 }} />资源整合情况
        </h3>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={16}>
            <Card title="资源整合指标" size="small">
              {resourceIntegration.map(item => (
                <div key={item.name} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>{item.name}</span>
                    <span style={{ fontWeight: 'bold' }}>{item.value}</span>
                  </div>
                  <Progress percent={item.percent} strokeColor={item.color} size="small" />
                </div>
              ))}
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="投入排行榜 Top 3" size="small">
              {topRanking.map(item => (
                <div
                  key={item.rank}
                  style={{
                    padding: '10px 12px',
                    marginBottom: 8,
                    background: item.rank === 1 ? '#fff7e6' : '#fafafa',
                    borderRadius: 6,
                    border: item.rank === 1 ? '1px solid #ffd591' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      <Tag
                        color={item.rank === 1 ? 'gold' : item.rank === 2 ? 'blue' : 'cyan'}
                        style={{ fontWeight: 'bold' }}
                      >
                        #{item.rank}
                      </Tag>
                      <strong>{item.name}</strong>
                    </span>
                    <Tag color={item.type === '企业' ? 'blue' : 'green'}>{item.type}</Tag>
                  </div>
                  <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: 12 }}>
                    <span>综合评分：{item.score}</span>
                    <span>{item.value}</span>
                  </div>
                </div>
              ))}
            </Card>
          </Col>
        </Row>

        {/* ============ Section 3: Talent Supply & Demand ============ */}
        <h3 style={{ marginBottom: 16, color: '#333' }}>
          <TeamOutlined style={{ marginRight: 8 }} />人才供需情况
        </h3>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={8}>
            <Card size="small">
              <Statistic title="岗位缺口总数" value={talentDemand.totalGaps} suffix="个" valueStyle={{ color: '#f5222d', fontSize: 32 }} />
              <div style={{ marginTop: 8, color: '#666', fontSize: 13 }}>本季度产业人才需求数据</div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="热门岗位 Top 5" size="small">
              {talentDemand.hotJobs.map((job, i) => (
                <div key={job.name} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag color={i === 0 ? 'gold' : i < 3 ? 'blue' : 'default'}>{i + 1}</Tag>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{job.name}</span>
                      <span style={{ fontWeight: 'bold', color: '#1677ff' }}>{job.demand}人</span>
                    </div>
                    <Progress percent={job.demand / talentDemand.hotJobs[0].demand * 100} size="small" strokeColor={i === 0 ? '#faad14' : '#1677ff'} showInfo={false} />
                  </div>
                  <Tag color="green">+{job.growth}%</Tag>
                </div>
              ))}
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="学历需求分布" size="small">
              {talentDemand.educationDemand.map(edu => (
                <div key={edu.level} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>{edu.level}</span>
                    <span style={{ color: '#666' }}>{edu.count}人 ({edu.percent}%)</span>
                  </div>
                  <Progress percent={edu.percent} size="small"
                    strokeColor={
                      edu.level === '博士' ? '#722ed1' :
                      edu.level === '硕士' ? '#1677ff' :
                      edu.level === '本科' ? '#52c41a' : '#faad14'
                    }
                  />
                </div>
              ))}
            </Card>
          </Col>
        </Row>

        {/* ============ Section 4: Service Results ============ */}
        <h3 style={{ marginBottom: 16, color: '#333' }}>
          <TrophyOutlined style={{ marginRight: 8 }} />服务成果
        </h3>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card hoverable size="small">
              <Statistic title="培训总人次" value={serviceResults.totalTraining} prefix={<TeamOutlined style={{ color: '#1677ff' }} />} valueStyle={{ fontSize: 22 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card hoverable size="small">
              <Statistic title="专利数" value={serviceResults.patentCount} prefix={<ExperimentOutlined style={{ color: '#722ed1' }} />} suffix="项" valueStyle={{ fontSize: 22 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card hoverable size="small">
              <Statistic title="软著数" value={serviceResults.softwareCopyright} prefix={<BookOutlined style={{ color: '#52c41a' }} />} suffix="项" valueStyle={{ fontSize: 22 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card hoverable size="small">
              <Statistic title="研究成果" value={serviceResults.researchCount} prefix={<FundOutlined style={{ color: '#faad14' }} />} suffix="项" valueStyle={{ fontSize: 22 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card hoverable size="small">
              <Statistic title="成果转化率" value={serviceResults.conversionRate} suffix="%" prefix={<ArrowUpOutlined style={{ color: '#f5222d' }} />} valueStyle={{ color: '#f5222d', fontSize: 22 }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card hoverable size="small">
              <Statistic title="项目合同总额" value={serviceResults.contractAmount} prefix={<ShopOutlined style={{ color: '#1677ff' }} />} valueStyle={{ fontSize: 22 }} />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  )
}
