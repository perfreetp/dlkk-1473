export interface InspectionInfo {
  year: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  conditions: InspectionCondition[];
  steps: InspectionStep[];
}

export interface InspectionCondition {
  id: string;
  text: string;
  met: boolean;
}

export interface InspectionStep {
  step: number;
  title: string;
  desc: string;
  icon: string;
}

export interface Material {
  id: string;
  category: string;
  name: string;
  description: string;
  tip: string;
  exampleImage: string;
  required: boolean;
  status: 'pending' | 'done' | 'missing';
  warnings: string[];
}

export interface FormField {
  id: string;
  question: string;
  type: 'text' | 'select' | 'date' | 'photo' | 'textarea';
  placeholder: string;
  required: boolean;
  voiceTip: string;
  options?: string[];
  validation?: {
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    message?: string;
  };
  value?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  voiceText: string;
}

export interface SubmissionInfo {
  status: 'not_started' | 'draft' | 'submitted' | 'rejected' | 'approved';
  submitDate: string | null;
  reviewDate: string | null;
  rejectedItems: RejectedItem[];
  totalItems: number;
  completedItems: number;
  contactPhone: string;
  contactAddress: string;
  reviewerName: string;
  reviewerPhone: string;
  reviewerOfficeHours: string;
  reviewNote: string;
  onSiteNote: string;
}

export interface RejectedItem {
  fieldId: string;
  fieldName: string;
  reason: string;
}

export interface SubmissionRecord {
  id: string;
  submitTime: string;
  type: 'first' | 'resubmit';
  editedMaterials: { id: string; name: string }[];
  editedFields: { id: string; name: string }[];
  note: string;
}

export type MaterialCategory = '证件类' | '办园条件类' | '师资类' | '安全卫生类';
