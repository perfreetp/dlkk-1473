import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface Step {
  step: number;
  title: string;
  desc: string;
  icon: string;
}

interface StepGuideProps {
  steps: Step[];
  currentStep?: number;
}

const StepGuide: React.FC<StepGuideProps> = ({ steps, currentStep = 0 }) => {
  return (
    <View className={styles.container}>
      {steps.map((item, index) => (
        <View key={item.step} className={styles.stepWrapper}>
          <View
            className={classnames(styles.stepItem, {
              [styles.active]: index <= currentStep,
              [styles.completed]: index < currentStep,
            })}
          >
            <View className={styles.stepIcon}>
              <Text className={styles.stepEmoji}>{item.icon}</Text>
            </View>
            <View className={styles.stepContent}>
              <Text className={styles.stepTitle}>
                第{item.step}步：{item.title}
              </Text>
              <Text className={styles.stepDesc}>{item.desc}</Text>
            </View>
          </View>
          {index < steps.length - 1 && (
            <View className={styles.connector}>
              <Text className={styles.arrow}>▼</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

export default StepGuide;
