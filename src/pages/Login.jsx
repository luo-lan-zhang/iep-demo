import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, message, Tag, Tooltip } from 'antd'
import { UserOutlined, LockOutlined, CrownOutlined, ApartmentOutlined, BankOutlined, UserSwitchOutlined, TeamOutlined, GlobalOutlined, SafetyCertificateOutlined, ExperimentOutlined } from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'
import './Login.css'

const roles = [
  { user: 'council',    label: '产教融合理事会', icon: <CrownOutlined />,              color: 'red' },
  { user: 'park',       label: '园区',           icon: <ApartmentOutlined />,           color: 'purple' },
  { user: 'enterprise', label: '企业',           icon: <GlobalOutlined />,              color: 'orange' },
  { user: 'mentor',     label: '企业导师',        icon: <SafetyCertificateOutlined />,  color: 'geekblue' },
  { user: 'school',     label: '院校',           icon: <BankOutlined />,                color: 'blue' },
  { user: 'teacher',    label: '教师',           icon: <UserSwitchOutlined />,          color: 'cyan' },
  { user: 'student',    label: '学生',           icon: <TeamOutlined />,                color: 'green' },
]

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const onFinish = (values) => {
    setLoading(true)
    setTimeout(() => {
      const result = login(values.username, values.password)
      if (result.success) {
        message.success('登录成功！')
        navigate('/admin/dashboard', { replace: true })
      } else {
        message.error(result.message)
      }
      setLoading(false)
    }, 500)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <ExperimentOutlined style={{ fontSize: 40, color: '#1677ff', marginBottom: 8 }} />
          <h1>产教融合智慧云平台</h1>
          <p>Industry-Education Integration Smart Platform</p>
        </div>
        <Form onFinish={onFinish} size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="统一密码: admin123" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登 录
            </Button>
          </Form.Item>
        </Form>
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 8, fontWeight: 500 }}>测试账号（统一密码: admin123）</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {roles.map(a => (
              <Tooltip key={a.user} title={`用户名: ${a.user}`}>
                <Tag color={a.color} style={{ cursor: 'pointer', padding: '2px 8px' }} onClick={() => {
                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
                  const input = document.querySelector('input[id="username"]')
                  if (input) { nativeInputValueSetter.call(input, a.user); input.dispatchEvent(new Event('input', { bubbles: true })) }
                }}>
                  {a.icon} {a.label}
                </Tag>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
