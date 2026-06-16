import { create } from 'zustand';
import type { RejectedItem } from '@/types/inspection';

interface InspectionState {
  materialStatus: Record<string, 'pending' | 'done' | 'missing'>;
  formAnswers: Record<string, string>;
  currentQuestionIndex: number;
  submissionStatus: 'not_started' | 'draft' | 'submitted' | 'rejected' | 'approved';
  rejectedItems: RejectedItem[];
  voiceEnabled: boolean;
  voiceSpeed: 'slow' | 'normal';

  updateMaterialStatus: (id: string, status: 'pending' | 'done' | 'missing') => void;
  updateFormAnswer: (id: string, value: string) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setSubmissionStatus: (status: 'not_started' | 'draft' | 'submitted' | 'rejected' | 'approved') => void;
  setRejectedItems: (items: RejectedItem[]) => void;
  toggleVoice: () => void;
  setVoiceSpeed: (speed: 'slow' | 'normal') => void;
  getIncompleteMaterials: () => string[];
  getIncompleteFormFields: () => string[];
}

const initialMaterialStatus: Record<string, 'pending' | 'done' | 'missing'> = {
  m1: 'done',
  m2: 'done',
  m3: 'pending',
  m4: 'missing',
  m5: 'done',
  m6: 'pending',
  m7: 'pending',
  m8: 'pending',
  m9: 'pending',
  m10: 'done',
  m11: 'missing',
  m12: 'pending',
  m13: 'done',
  m14: 'pending',
  m15: 'pending',
};

export const useInspectionStore = create<InspectionState>((set, get) => ({
  materialStatus: initialMaterialStatus,
  formAnswers: {},
  currentQuestionIndex: 0,
  submissionStatus: 'draft',
  rejectedItems: [],
  voiceEnabled: true,
  voiceSpeed: 'slow',

  updateMaterialStatus: (id, status) =>
    set((state) => ({
      materialStatus: { ...state.materialStatus, [id]: status },
    })),

  updateFormAnswer: (id, value) =>
    set((state) => ({
      formAnswers: { ...state.formAnswers, [id]: value },
    })),

  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),

  setSubmissionStatus: (status) => set({ submissionStatus: status }),

  setRejectedItems: (items) => set({ rejectedItems: items }),

  toggleVoice: () => set((state) => ({ voiceEnabled: !state.voiceEnabled })),

  setVoiceSpeed: (speed) => set({ voiceSpeed: speed }),

  getIncompleteMaterials: () => {
    const { materialStatus } = get();
    return Object.entries(materialStatus)
      .filter(([, status]) => status !== 'done')
      .map(([id]) => id);
  },

  getIncompleteFormFields: () => {
    const { formAnswers } = get();
    return Object.keys(formAnswers).filter((id) => !formAnswers[id]);
  },
}));
