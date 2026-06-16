import type { SubmissionInfo } from '@/types/inspection';

export const submissionInfo: SubmissionInfo = {
  status: 'draft',
  submitDate: null,
  reviewDate: null,
  rejectedItems: [
    {
      fieldId: 'm4',
      fieldName: '消防安全检查合格证',
      reason: '证件照片模糊，请重新拍摄上传清晰的证件照片',
    },
    {
      fieldId: 'm12',
      fieldName: '员工花名册',
      reason: '缺少幼儿园公章，请在纸质文件上盖章后重新拍照上传',
    },
  ],
  totalItems: 15,
  completedItems: 8,
  contactPhone: '0571-87654321',
  contactAddress: 'XX县教育局学前教育科（教育局3楼305室）',
};
