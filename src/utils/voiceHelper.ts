import Taro from '@tarojs/taro';
import { useInspectionStore } from '@/store/useInspectionStore';

let innerAudioContext: Taro.InnerAudioContext | null = null;
let currentToastTimer: ReturnType<typeof setTimeout> | null = null;

const showPlayingToast = (text: string, durationMs: number) => {
  if (currentToastTimer) clearTimeout(currentToastTimer);
  const startTime = Date.now();
  const tick = () => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
    Taro.showToast({
      title: `🔊 正在播放（约${remaining}秒）`,
      icon: 'none',
      duration: 900,
    });
    if (elapsed < durationMs) {
      currentToastTimer = setTimeout(tick, 1000);
    }
  };
  tick();
};

const hidePlayingToast = () => {
  if (currentToastTimer) {
    clearTimeout(currentToastTimer);
    currentToastTimer = null;
  }
};

const webSpeechSpeak = (text: string, rate: number): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve(false);
      return;
    }
    try {
      const synth = (window as any).speechSynthesis as SpeechSynthesis;
      synth.cancel();

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'zh-CN';
      utter.rate = rate;
      utter.pitch = 1;
      utter.volume = 1;

      const voices = synth.getVoices();
      const zhVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('zh'));
      if (zhVoice) utter.voice = zhVoice;

      const estDurationMs = Math.max(3000, text.length * 220 / rate);
      utter.onstart = () => {
        showPlayingToast(text, estDurationMs);
      };
      utter.onend = () => {
        hidePlayingToast();
        resolve(true);
      };
      utter.onerror = () => {
        hidePlayingToast();
        resolve(false);
      };

      synth.speak(utter);

      setTimeout(() => {
        hidePlayingToast();
      }, estDurationMs + 500);
    } catch (err) {
      console.error('[VoiceHelper] Web Speech API error:', err);
      resolve(false);
    }
  });
};

const getRate = (): number => {
  const speed = useInspectionStore.getState().voiceSpeed;
  return speed === 'slow' ? 0.75 : 1.0;
};

export const playVoiceTip = async (text: string): Promise<boolean> => {
  const state = useInspectionStore.getState();
  if (!state.voiceEnabled) {
    console.info('[VoiceHelper] Voice disabled, skip playing');
    return false;
  }

  console.info('[VoiceHelper] Playing voice tip (rate=' + getRate() + '):', text.substring(0, 40) + '...');

  const ok = await webSpeechSpeak(text, getRate());
  if (!ok) {
    const duration = Math.max(2000, text.length * 250 / getRate());
    showPlayingToast(text, duration);
    setTimeout(hidePlayingToast, duration);
  }
  return true;
};

export const stopVoice = (): void => {
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      (window as any).speechSynthesis?.cancel?.();
    }
    if (innerAudioContext) {
      innerAudioContext.stop();
    }
    hidePlayingToast();
  } catch (err) {
    console.error('[VoiceHelper] Failed to stop voice:', err);
  }
};

export const playFAQVoice = async (question: string, answer: string): Promise<boolean> => {
  const state = useInspectionStore.getState();
  if (!state.voiceEnabled) {
    console.info('[VoiceHelper] Voice disabled, skip FAQ');
    return false;
  }

  const combined = `你的问题是：${question}。回答：${answer}`;
  console.info('[VoiceHelper] Playing FAQ voice:', question);

  const ok = await webSpeechSpeak(combined, getRate());
  if (!ok) {
    const duration = Math.max(3000, combined.length * 250 / getRate());
    showPlayingToast(combined, duration);
    setTimeout(hidePlayingToast, duration);
  }
  return true;
};
