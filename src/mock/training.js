export const mockTrainingQuotas = [
  { id: 1, enterpriseId: 1, enterpriseName: '华为技术有限公司', title: 'HarmonyOS开发工程师培训', targetCount: 50, completedCount: 20, deadline: '2024-09-30', status: 'in_progress', points: 20000 },
  { id: 2, enterpriseId: 2, enterpriseName: '腾讯科技（深圳）有限公司', title: 'AI大模型应用培训', targetCount: 30, completedCount: 5, deadline: '2024-10-15', status: 'in_progress', points: 15000 },
  { id: 3, enterpriseId: 3, enterpriseName: '广州小鹏汽车科技有限公司', title: '智能驾驶算法培训', targetCount: 20, completedCount: 0, deadline: '2024-08-31', status: 'pending', points: 12000 },
  { id: 4, enterpriseId: 5, enterpriseName: '大疆创新科技有限公司', title: '嵌入式系统开发培训', targetCount: 40, completedCount: 40, deadline: '2024-06-30', status: 'completed', points: 16000 },
  { id: 5, enterpriseId: 1, enterpriseName: '华为技术有限公司', title: '5G通信技术培训', targetCount: 60, completedCount: 35, deadline: '2024-12-31', status: 'in_progress', points: 25000 },
]

export const mockTrainingAcceptances = [
  { id: 1, quotaId: 1, quotaTitle: 'HarmonyOS开发工程师培训', schoolId: 1, schoolName: '石家庄信息工程职业学院', assignedCount: 20, status: 'in_progress', acceptDate: '2024-07-01', completeDate: '' },
  { id: 2, quotaId: 1, quotaTitle: 'HarmonyOS开发工程师培训', schoolId: 2, schoolName: '深圳职业技术学院', assignedCount: 15, status: 'completed', acceptDate: '2024-07-01', completeDate: '2024-08-15' },
  { id: 3, quotaId: 2, quotaTitle: 'AI大模型应用培训', schoolId: 1, schoolName: '石家庄信息工程职业学院', assignedCount: 10, status: 'in_progress', acceptDate: '2024-07-10', completeDate: '' },
  { id: 4, quotaId: 4, quotaTitle: '嵌入式系统开发培训', schoolId: 2, schoolName: '深圳职业技术学院', assignedCount: 25, status: 'completed', acceptDate: '2024-05-01', completeDate: '2024-06-25' },
]
