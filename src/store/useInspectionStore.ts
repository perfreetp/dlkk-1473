import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type { RejectedItem } from '@/types/inspection';

const STORAGE_KEY = 'inspection_app_state_v1';

interface InspectionState {
  materialStatus: Record<string, 'pending' | 'done' | 'missing'>;
  formAnswers: Record<string, string>;
  currentQuestionIndex: number;
  submissionStatus: 'not_started' | 'draft' | 'submitted' | 'rejected' | 'approved';
  rejectedItems: RejectedItem[];
  voiceEnabled: boolean;
  voiceSpeed: 'slow' | 'normal';
  submitDate: string | null;
  focusedMaterialId: string | null;
  focusedFieldId: string | null;

  updateMaterialStatus: (id: string, status: 'pending' | 'done' | 'missing') => void;
  updateFormAnswer: (id: string, value: string) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setSubmissionStatus: (status: 'not_started' | 'draft' | 'submitted' | 'rejected' | 'approved') => void;
  setRejectedItems: (items: RejectedItem[]) => void;
  toggleVoice: () => void;
  setVoiceSpeed: (speed: 'slow' | 'normal') => void;
  clearRejectedItem: (fieldId: string) => void;
  setFocusedMaterialId: (id: string | null) => void;
  setFocusedFieldId: (id: string | null) => void;
  clearRejectedForMaterial: (materialId: string) => void;
  clearRejectedForField: (fieldId: string) => void;
  clearAllRejected: () => void;
  hydrateFromStorage: () => void;
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

type PersistableState = Omit<
  InspectionState,
  | 'updateMaterialStatus'
  | 'updateFormAnswer'
  | 'setCurrentQuestionIndex'
  | 'setSubmissionStatus'
  | 'setRejectedItems'
  | 'toggleVoice'
  | 'setVoiceSpeed'
  | 'clearRejectedItem'
  | 'setFocusedMaterialId'
  | 'setFocusedFieldId'
  | 'clearRejectedForMaterial'
  | 'clearRejectedForField'
  | 'clearAllRejected'
  | 'hydrateFromStorage'
>;

const loadFromStorage = (): Partial<PersistableState> => {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (raw && typeof raw === 'string') {
      const parsed = JSON.parse(raw);
      console.info('[Store] Hydrated from storage:', Object.keys(parsed).length, 'keys');
      return parsed;
    }
  } catch (err) {
    console.error('[Store] Failed to load from storage:', err);
  }
  return {};
};

const saveToStorage = (state: InspectionState) => {
  try {
    const toPersist = {
      materialStatus: state.materialStatus,
      formAnswers: state.formAnswers,
      currentQuestionIndex: state.currentQuestionIndex,
      submissionStatus: state.submissionStatus,
      rejectedItems: state.rejectedItems,
      voiceEnabled: state.voiceEnabled,
      voiceSpeed: state.voiceSpeed,
      submitDate: state.submitDate,
    };
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(toPersist));
  } catch (err) {
    console.error('[Store] Failed to save to storage:', err);
  }
};

export const useInspectionStore = create<InspectionState>((set, get) => {
  const saved = loadFromStorage();

  return {
    materialStatus: saved.materialStatus ?? initialMaterialStatus,
    formAnswers: saved.formAnswers ?? {},
    currentQuestionIndex: saved.currentQuestionIndex ?? 0,
    submissionStatus: saved.submissionStatus ?? 'draft',
    rejectedItems: saved.rejectedItems ?? [],
    voiceEnabled: saved.voiceEnabled ?? true,
    voiceSpeed: saved.voiceSpeed ?? 'slow',
    submitDate: saved.submitDate ?? null,
    focusedMaterialId: null,
    focusedFieldId: null,

    updateMaterialStatus: (id, status) =>
      set((state) => {
        const nextRejected =
          status === 'done'
            ? state.rejectedItems.filter((r) => r.fieldId !== id)
            : state.rejectedItems;

        const next = {
          ...state,
          materialStatus: { ...state.materialStatus, [id]: status },
          rejectedItems: nextRejected,
        };
        saveToStorage(next);
        return next;
      }),

    updateFormAnswer: (id, value) =>
      set((state) => {
        const oldValue = state.formAnswers[id]?.trim() || '';
        const newValue = value?.trim() || '';
        const hasChanged = oldValue !== newValue;

        let nextRejected = state.rejectedItems;
        if (hasChanged) {
          nextRejected = state.rejectedItems.filter((r) => r.fieldId !== id);
        }

        const next = {
          ...state,
          formAnswers: { ...state.formAnswers, [id]: value },
          rejectedItems: nextRejected,
        };
        saveToStorage(next);
        return next;
      }),

    setCurrentQuestionIndex: (index) =>
      set((state) => {
        const next = { ...state, currentQuestionIndex: index };
        saveToStorage(next);
        return next;
      }),

    setSubmissionStatus: (status) =>
      set((state) => {
        const next = {
          ...state,
          submissionStatus: status,
          submitDate:
            status === 'submitted' && state.submitDate === null
              ? new Date().toISOString().slice(0, 10)
              : state.submitDate,
        };
        saveToStorage(next);
        return next;
      }),

    setRejectedItems: (items) =>
      set((state) => {
        const next = { ...state, rejectedItems: items };
        saveToStorage(next);
        return next;
      }),

    toggleVoice: () =>
      set((state) => {
        const next = { ...state, voiceEnabled: !state.voiceEnabled };
        saveToStorage(next);
        return next;
      }),

    setVoiceSpeed: (speed) =>
      set((state) => {
        const next = { ...state, voiceSpeed: speed };
        saveToStorage(next);
        return next;
      }),

    clearRejectedItem: (fieldId) =>
      set((state) => {
        const next = {
          ...state,
          rejectedItems: state.rejectedItems.filter((r) => r.fieldId !== fieldId),
        };
        saveToStorage(next);
        return next;
      }),

    setFocusedMaterialId: (id) => set({ focusedMaterialId: id }),
    setFocusedFieldId: (id) => set({ focusedFieldId: id }),

    clearRejectedForMaterial: (materialId) =>
      set((state) => {
        const next = {
          ...state,
          rejectedItems: state.rejectedItems.filter((r) => r.fieldId !== materialId),
        };
        saveToStorage(next);
        return next;
      }),

    clearRejectedForField: (fieldId) =>
      set((state) => {
        const next = {
          ...state,
          rejectedItems: state.rejectedItems.filter((r) => r.fieldId !== fieldId),
        };
        saveToStorage(next);
        return next;
      }),

    clearAllRejected: () =>
      set((state) => {
        const next = { ...state, rejectedItems: [] };
        saveToStorage(next);
        return next;
      }),

    hydrateFromStorage: () => {
      const saved = loadFromStorage();
      if (Object.keys(saved).length > 0) {
        set((state) => ({ ...state, ...saved }));
      }
    },
  };
});
