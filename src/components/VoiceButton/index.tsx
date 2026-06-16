import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface VoiceButtonProps {
  text: string;
  size?: 'small' | 'medium' | 'large';
  onPlay: (text: string) => void;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ text, size = 'medium', onPlay }) => {
  return (
    <View
      className={classnames(styles.button, styles[size])}
      onClick={() => onPlay(text)}
    >
      <Text className={styles.icon}>🔊</Text>
      <Text className={styles.label}>
        {size === 'large' ? '听语音提示' : '听一听'}
      </Text>
    </View>
  );
};

export default VoiceButton;
