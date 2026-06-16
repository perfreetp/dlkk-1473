import type { InspectionInfo } from '@/types/inspection';

export const inspectionInfo: InspectionInfo = {
  year: '2026',
  startDate: '2026年7月1日',
  endDate: '2026年8月31日',
  daysRemaining: 45,
  conditions: [
    { id: 'c1', text: '已取得办学许可证', met: true },
    { id: 'c2', text: '在册运营满一年以上', met: true },
    { id: 'c3', text: '无重大安全事故', met: true },
    { id: 'c4', text: '师资配备符合标准', met: false },
  ],
  steps: [
    { step: 1, title: '准备材料', desc: '按清单准备各项证件和材料', icon: '📋' },
    { step: 2, title: '在线填报', desc: '逐项填写年检申报信息', icon: '✏️' },
    { step: 3, title: '提交审核', desc: '确认无误后提交教育部门审核', icon: '✅' },
  ],
};
