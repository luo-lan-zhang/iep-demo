export const mockResources = [
  { id: 1, schoolId: 1, name: 'GPU服务器集群', category: '计算设备', description: 'NVIDIA A100 GPU服务器x4，可用于AI训练', specs: '4×A100 80GB, 512GB RAM, 2TB SSD', status: 'idle', dailyPoints: 500, publisher: '深圳大学', publishDate: '2024-06-01' },
  { id: 2, schoolId: 1, name: '3D打印机', category: '制造设备', description: '工业级SLA光固化3D打印机', specs: '成型尺寸 600×600×400mm, 精度0.05mm', status: 'idle', dailyPoints: 300, publisher: '深圳大学', publishDate: '2024-06-05' },
  { id: 3, schoolId: 2, name: '示波器套装', category: '测试仪器', description: '数字示波器+信号发生器套装，共10套', specs: '4通道, 1GHz带宽', status: 'rented', dailyPoints: 100, publisher: '深圳职业技术学院', publishDate: '2024-05-20' },
  { id: 4, schoolId: 2, name: '工业机器人平台', category: '教学设备', description: '六轴工业机器人实训平台', specs: '负载5kg, 臂展800mm', status: 'idle', dailyPoints: 400, publisher: '深圳职业技术学院', publishDate: '2024-06-10' },
  { id: 5, schoolId: 3, name: '高性能计算工作站', category: '计算设备', description: '双路工作站用于科学计算', specs: '2×Xeon, 256GB RAM, RTX 4090', status: 'idle', dailyPoints: 350, publisher: '华南理工大学', publishDate: '2024-06-08' },
]

export const mockApplications = [
  { id: 1, resourceId: 3, enterpriseId: 1, enterpriseName: '华为技术有限公司', reason: '用于新产品测试验证', period: '2024-07-01 ~ 2024-07-30', status: 'approved', points: 3000, applyDate: '2024-06-15', approveDate: '2024-06-16' },
  { id: 2, resourceId: 1, enterpriseId: 2, enterpriseName: '腾讯科技（深圳）有限公司', reason: 'AI模型训练需求', period: '2024-07-15 ~ 2024-08-15', status: 'pending', points: 15500, applyDate: '2024-06-20', approveDate: '' },
]
