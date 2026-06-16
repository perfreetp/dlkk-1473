import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface LargeTextCardProps {
  title: string;
  content: string;
  icon?: string;
  type?: 'info' | 'warning' | 'success' | 'accent';
  subContent?: string;
}

const LargeTextCard: React.FC<LargeTextCardProps> = ({
  title,
  content,
  icon,
  type = 'info',
  subContent,
}) => {
  return (
    <View className={classnames(styles.card, styles[type])}>
      {icon && <Text className={styles.icon}>{icon}</Text>}
      <Text className={styles.title}>{title}</Text>
      <Text className={styles.content}>{content}</Text>
      {subContent && <Text className={styles.subContent}>{subContent}</Text>}
    </View>
  );
};

export default LargeTextCard;
