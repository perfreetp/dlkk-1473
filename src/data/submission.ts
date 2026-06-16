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
  reviewerName: '李老师',
  reviewerPhone: '13812345678',
  reviewerOfficeHours: '周一至周五 上午 9:00-11:30，下午 14:00-16:30',
  reviewNote: '您好！您的材料有几处需要调整，主要是照片清晰度和盖章问题。改好后重新提交即可，有问题随时打电话找我，不用客气。',
  onSiteNote: '如需现场协助，可携带所有材料原件到教育局305室，李老师会帮您一起核对。',
};
