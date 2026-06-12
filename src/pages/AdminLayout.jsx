import { useState, useMemo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Dropdown, Avatar, Tag, Typography } from 'antd'
import {
  DashboardOutlined, UserOutlined,
  SettingOutlined, LogoutOutlined, BookOutlined,
  TrophyOutlined, ProjectOutlined, NodeIndexOutlined,
  DeploymentUnitOutlined, FundOutlined, GiftOutlined,
  ExperimentOutlined
} from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'
import './AdminLayout.css'

const { Text } = Typography
const { Header, Sider, Content } = Layout

const ALL_MENU_ITEMS = [
  { key: '/admin/dashboard',    icon: <DashboardOutlined />,      label: '总览面板' },
  { key: '/admin/projects',     icon: <ProjectOutlined />,        label: '项目合作' },
  { key: '/admin/talent',       icon: <NodeIndexOutlined />,      label: '人才对接' },
  { key: '/admin/achievements', icon: <TrophyOutlined />,         label: '成果广场' },
  { key: '/admin/resources',    icon: <ExperimentOutlined />,     label: '共享资源池' },
  { key: '/admin/services',     icon: <DeploymentUnitOutlined />, label: '技术服务池' },
  { key: '/admin/teaching',     icon: <BookOutlined />,           label: '教学资源转化' },
  { key: '/admin/cockpit',      icon: <FundOutlined />,           label: '数据驾驶舱' },
  { key: '/admin/points',       icon: <GiftOutlined />,           label: '积分管理' },
  { key: '/admin/system',       icon: <SettingOutlined />,        label: '系统设置' },
]

const ROLE_MENUS = {
  council:    ALL_MENU_ITEMS,
  park:       ALL_MENU_ITEMS.filter(m => ['/admin/dashboard', '/admin/projects', '/admin/resources', '/admin/services', '/admin/cockpit', '/admin/system'].includes(m.key)),
  enterprise: ALL_MENU_ITEMS.filter(m => ['/admin/dashboard', '/admin/projects', '/admin/talent', '/admin/achievements', '/admin/resources', '/admin/services', '/admin/points'].includes(m.key)),
  mentor:     ALL_MENU_ITEMS.filter(m => ['/admin/dashboard', '/admin/projects', '/admin/talent'].includes(m.key)),
  school:     ALL_MENU_ITEMS.filter(m => ['/admin/dashboard', '/admin/projects', '/admin/talent', '/admin/achievements', '/admin/resources', '/admin/services', '/admin/teaching', '/admin/cockpit'].includes(m.key)),
  teacher:    ALL_MENU_ITEMS.filter(m => ['/admin/dashboard', '/admin/projects', '/admin/achievements', '/admin/services', '/admin/teaching'].includes(m.key)),
  student:    ALL_MENU_ITEMS.filter(m => ['/admin/dashboard', '/admin/talent'].includes(m.key)),
}

const pageTitles = {
  '/admin/dashboard':    '总览面板',
  '/admin/projects':     '项目合作',
  '/admin/talent':       '人才对接',
  '/admin/achievements': '成果广场',
  '/admin/resources':    '共享资源池',
  '/admin/services':     '技术服务池',
  '/admin/teaching':     '教学资源转化',
  '/admin/cockpit':      '数据驾驶舱',
  '/admin/points':       '积分管理',
  '/admin/system':       '系统设置',
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = useMemo(() => ROLE_MENUS[user?.role] || ROLE_MENUS.council, [user?.role])

  const handleLogout = () => { logout(); navigate('/login', { replace: true }) }

  const userMenuItems = [
    { key: 'role', label: <Text type="secondary">{user?.label || ''}</Text>, disabled: true },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
  ]

  return (
    <Layout className="admin-layout">
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="dark" width={220}>
        <div className="logo-container">
          <h2>{collapsed ? '产教' : '产教融合智慧云平台'}</h2>
        </div>
        <Menu
          theme="dark" mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="admin-header">
          <div className="header-left">
            <h3>{pageTitles[location.pathname] || '产教融合智慧云平台'}</h3>
          </div>
          <div className="header-right">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                <span>{user?.name || '未知用户'}</span>
                <Tag color="blue" style={{ marginLeft: 4 }}>{user?.label || ''}</Tag>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
