import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { inspectionInfo } from '@/data/inspectionInfo';
import StepGuide from '@/components/StepGuide';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const info = inspectionInfo;

  const handleNavigate = (url: string) => {
    Taro.switchTab({ url }).catch((err) => {
      console.error('[HomePage] Navigation error:', err);
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.heroSection}>
        <Text className={styles.heroTitle}>🏛️ 年检申报助手</Text>
        <Text className={styles.heroSubtitle}>
          乡镇民办幼儿园年度检验申报
        </Text>

        <View className={styles.timeCard}>
          <Text className={styles.timeLabel}>📅 本年度年检时间</Text>
          <Text className={styles.timeValue}>{info.year}年度年检</Text>
          <Text className={styles.timeRange}>
            {info.startDate} 至 {info.endDate}
          </Text>
          <View className={styles.countdown}>
            <Text className={styles.countdownText}>
              ⏰ 距截止还有 {info.daysRemaining} 天
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>📋 办理条件</Text>
          <View className={styles.conditionList}>
            {info.conditions.map((cond) => (
              <View key={cond.id} className={styles.conditionItem}>
                <Text className={styles.conditionIcon}>
                  {cond.met ? '✅' : '❌'}
                </Text>
                <Text
                  className={`${styles.conditionText} ${
                    cond.met ? styles.conditionMet : styles.conditionNotMet
                  }`}
                >
                  {cond.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>👣 办理流程</Text>
          <StepGuide steps={info.steps} currentStep={0} />
        </View>

        <View className={styles.actionButtons}>
          <View
            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            onClick={() => handleNavigate('/pages/materials/index')}
          >
            <Text className={styles.actionBtnText}>📋 开始准备材料</Text>
          </View>
          <View
            className={`${styles.actionBtn} ${styles.actionBtnAccent}`}
            onClick={() => handleNavigate('/pages/filling/index')}
          >
            <Text className={styles.actionBtnText}>✏️ 开始在线填报</Text>
          </View>
          <View
            className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
            onClick={() => handleNavigate('/pages/progress/index')}
          >
            <Text className={styles.actionBtnText}>📊 查看申报进度</Text>
          </View>
        </View>

        <View className={styles.helpNote}>
          <Text className={styles.helpNoteText}>
            💡 如有疑问，可点击底部"语音帮助"听语音解答，也可让家人协助操作
          </Text>
        </View>
      </View>
    </View>
  );
};

export default HomePage;
