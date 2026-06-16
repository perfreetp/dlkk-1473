import Taro from '@tarojs/taro';
import { useInspectionStore } from '@/store/useInspectionStore';

let innerAudioContext: Taro.InnerAudioContext | null = null;
let currentToastTimer: ReturnType<typeof setTimeout> | null = null;

const getRate = (): number => {
  const speed = useInspectionStore.getState().voiceSpeed;
  return speed === 'slow' ? 0.75 : 1.0;
};

const isH5 = Taro.getEnv() === Taro.ENV_TYPE.WEB;
const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP;

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
  Taro.hideToast();
};

const estimateDuration = (text: string, rate: number): number => {
  const charsPerSecond = rate < 1 ? 2.5 : 3.5;
  return Math.max(3000, (text.length / charsPerSecond) * 1000);
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
      const zhVoice = voices.find(
        (v) => v.lang && (v.lang.toLowerCase().startsWith('zh-cn') || v.lang.toLowerCase().startsWith('zh'))
      );
      if (zhVoice) utter.voice = zhVoice;

      const estDurationMs = estimateDuration(text, rate);
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
        resolve(true);
      }, estDurationMs + 1000);
    } catch (err) {
      console.error('[VoiceHelper] Web Speech API error:', err);
      resolve(false);
    }
  });
};

const getTTSAudioUrl = (text: string): string => {
  const encoded = encodeURIComponent(text);
  return `https://dict.youdao.com/dictvoice?type=2&audio=${encoded}`;
};

const audioPlay = (text: string, rate: number): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      if (innerAudioContext) {
        innerAudioContext.stop();
        innerAudioContext.destroy();
      }

      const ctx = Taro.createInnerAudioContext();
      innerAudioContext = ctx;
      ctx.src = getTTSAudioUrl(text);

      if (isWeapp) {
        try {
          (ctx as any).playbackRate = rate;
        } catch (e) {
          console.warn('[VoiceHelper] playbackRate not supported');
        }
      }

      const estDurationMs = estimateDuration(text, rate);
      let started = false;

      ctx.onPlay(() => {
        started = true;
        showPlayingToast(text, estDurationMs);
        console.info('[VoiceHelper] Audio started playing');
      });

      ctx.onEnded(() => {
        hidePlayingToast();
        resolve(true);
      });

      ctx.onStop(() => {
        hidePlayingToast();
        resolve(true);
      });

      ctx.onError((err) => {
        console.error('[VoiceHelper] Audio error:', err);
        hidePlayingToast();
        resolve(false);
      });

      ctx.play();

      setTimeout(() => {
        if (!started) {
          console.warn('[VoiceHelper] Audio timeout, fallback to toast');
          hidePlayingToast();
          const duration = estimateDuration(text, rate);
          showPlayingToast(text, duration);
          setTimeout(hidePlayingToast, duration);
          resolve(false);
        }
      }, 8000);

      setTimeout(() => {
        hidePlayingToast();
        resolve(true);
      }, estDurationMs + 2000);
    } catch (err) {
      console.error('[VoiceHelper] Audio play error:', err);
      resolve(false);
    }
  });
};

export const playVoiceTip = async (text: string): Promise<boolean> => {
  const state = useInspectionStore.getState();
  if (!state.voiceEnabled) {
    console.info('[VoiceHelper] Voice disabled, skip playing');
    Taro.showToast({
      title: '🔇 语音已关闭',
      icon: 'none',
      duration: 1000,
    });
    return false;
  }

  const rate = getRate();
  const speedLabel = rate < 1 ? '慢速' : '正常';
  console.info(`[VoiceHelper] Playing (${speedLabel}, rate=${rate}):`, text.substring(0, 30) + '...');

  if (isH5) {
    const ok = await webSpeechSpeak(text, rate);
    if (ok) return true;
    return audioPlay(text, rate);
  }

  return audioPlay(text, rate);
};

export const stopVoice = (): void => {
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      (window as any).speechSynthesis?.cancel?.();
    }
    if (innerAudioContext) {
      innerAudioContext.stop();
      try {
        innerAudioContext.destroy();
      } catch (e) {}
      innerAudioContext = null;
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
    Taro.showToast({
      title: '🔇 语音已关闭',
      icon: 'none',
      duration: 1000,
    });
    return false;
  }

  const combined = `问题：${question}。${answer}`;
  const rate = getRate();
  const speedLabel = rate < 1 ? '慢速' : '正常';
  console.info(`[VoiceHelper] Playing FAQ (${speedLabel}, rate=${rate}):`, question);

  if (isH5) {
    const ok = await webSpeechSpeak(combined, rate);
    if (ok) return true;
    return audioPlay(combined, rate);
  }

  return audioPlay(combined, rate);
};
