export const mockResources = [
  { id: 1, name: 'GPU服务器集群', category: '设备', description: 'NVIDIA A100 GPU服务器x4，可用于AI训练', specs: '4×A100 80GB, 512GB RAM, 2TB SSD', status: 'idle', dailyPoints: 500, publisher: '石家庄信息工程职业学院', publisherType: 'school', publishDate: '2024-06-01' },
  { id: 2, name: '3D打印机', category: '设备', description: '工业级SLA光固化3D打印机', specs: '成型尺寸 600×600×400mm, 精度0.05mm', status: 'idle', dailyPoints: 300, publisher: '石家庄信息工程职业学院', publisherType: 'school', publishDate: '2024-06-05' },
  { id: 3, name: '示波器套装', category: '设备', description: '数字示波器+信号发生器套装，共10套', specs: '4通道, 1GHz带宽', status: 'rented', dailyPoints: 100, publisher: '深圳职业技术学院', publisherType: 'school', publishDate: '2024-05-20' },
  { id: 4, name: '工业机器人平台', category: '设备', description: '六轴工业机器人实训平台', specs: '负载5kg, 臂展800mm', status: 'idle', dailyPoints: 400, publisher: '深圳职业技术学院', publisherType: 'school', publishDate: '2024-06-10' },
  { id: 5, name: '高性能计算工作站', category: '设备', description: '双路工作站用于科学计算', specs: '2×Xeon, 256GB RAM, RTX 4090', status: 'idle', dailyPoints: 350, publisher: '石家庄信息工程职业学院', publisherType: 'school', publishDate: '2024-06-08' },
  { id: 6, name: '南山科技园路演大厅', category: '场地', description: '可容纳200人的多功能路演大厅，配备LED大屏、音响系统', specs: '面积500㎡, 容纳200人, 配备投影/音响/灯光', status: 'idle', dailyPoints: 800, publisher: '深圳南山科技园', publisherType: 'park', publishDate: '2024-06-15' },
  { id: 7, name: '园区创新展厅', category: '场地', description: '科技创新成果展示厅，可举办产品发布会及技术交流会', specs: '面积300㎡, 展位20个, 配备多媒体展示系统', status: 'idle', dailyPoints: 600, publisher: '深圳南山科技园', publisherType: 'park', publishDate: '2024-06-20' },
  { id: 8, name: '华为5G测试实验室', category: '场地', description: '5G通信设备测试环境，支持NSA/SA双模测试', specs: '覆盖5G全频段, 支持射频/协议/性能测试', status: 'idle', dailyPoints: 1000, publisher: '华为技术有限公司', publisherType: 'enterprise', publishDate: '2024-07-01' },
  { id: 9, name: 'AI算法专家顾问', category: '专家', description: '资深AI算法专家，提供大模型训练、推理优化等咨询服务', specs: '15年AI领域经验, 曾主导多个大型AI项目', status: 'idle', dailyPoints: 1200, publisher: '华为技术有限公司', publisherType: 'enterprise', publishDate: '2024-07-05' },
  { id: 10, name: '智能制造技术顾问', category: '专家', description: '智能制造领域专家，提供产线数字化改造方案咨询', specs: '10年智能制造经验, 服务过20+企业', status: 'idle', dailyPoints: 900, publisher: '深圳职业技术学校', publisherType: 'school', publishDate: '2024-07-10' },
  { id: 11, name: '开放数据集', category: '其他', description: '产教融合相关行业数据集，含标注数据', specs: '50GB脱敏数据, 涵盖制造/通信/软件行业', status: 'idle', dailyPoints: 200, publisher: '产教融合理事会', publisherType: 'school', publishDate: '2024-07-15' },
]

export const mockApplications = [
  { id: 1, resourceId: 3, enterpriseId: 1, enterpriseName: '华为技术有限公司', reason: '用于新产品测试验证', period: '2024-07-01 ~ 2024-07-30', status: 'approved', points: 3000, applyDate: '2024-06-15', approveDate: '2024-06-16' },
  { id: 2, resourceId: 1, enterpriseId: 2, enterpriseName: '腾讯科技（深圳）有限公司', reason: 'AI模型训练需求', period: '2024-07-15 ~ 2024-08-15', status: 'pending', points: 15500, applyDate: '2024-06-20', approveDate: '' },
]
