import Taro from '@tarojs/taro';

let innerAudioContext: Taro.InnerAudioContext | null = null;

export const playVoiceTip = (text: string): void => {
  console.info('[VoiceHelper] Playing voice tip:', text.substring(0, 30) + '...');

  Taro.showToast({
    title: '正在播放语音提示...',
    icon: 'none',
    duration: 2000,
  });

  try {
    if (!innerAudioContext) {
      innerAudioContext = Taro.createInnerAudioContext();
    }
    innerAudioContext.onError((err) => {
      console.error('[VoiceHelper] Audio error:', err);
    });
  } catch (err) {
    console.error('[VoiceHelper] Failed to create audio context:', err);
  }
};

export const stopVoice = (): void => {
  try {
    if (innerAudioContext) {
      innerAudioContext.stop();
    }
  } catch (err) {
    console.error('[VoiceHelper] Failed to stop voice:', err);
  }
};

export const playFAQVoice = (question: string, answer: string): void => {
  console.info('[VoiceHelper] Playing FAQ voice:', question);
  Taro.showToast({
    title: '正在播放语音回答...',
    icon: 'none',
    duration: 3000,
  });
};
