import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import { faqs, faqCategories } from '@/data/faqs';
import { useInspectionStore } from '@/store/useInspectionStore';
import { playVoiceTip, playFAQVoice } from '@/utils/voiceHelper';
import styles from './index.module.scss';

const VoicePage: React.FC = () => {
  const { voiceEnabled, toggleVoice, voiceSpeed, setVoiceSpeed } = useInspectionStore();
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const filteredFaqs = activeCategory === '全部'
    ? faqs
    : faqs.filter((f) => f.category === activeCategory);

  const handlePlayFaq = (faq: typeof faqs[0]) => {
    if (voiceEnabled) {
      playFAQVoice(faq.question, faq.voiceText);
    }
    setExpandedFaq(expandedFaq === faq.id ? null : faq.id);
  };

  const assistantSteps = [
    { num: '1', text: '让家属或代办人打开这个小程序' },
    { num: '2', text: '点击"材料清单"，帮忙准备和拍照上传' },
    { num: '3', text: '点击"分步填报"，帮忙逐项填写信息' },
    { num: '4', text: '填完后点击"提交"，完成年检申报' },
  ];

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>🔊 语音帮助</Text>
        <Text className={styles.headerDesc}>
          不识字也能听明白，点击喇叭按钮播放语音提示
        </Text>
      </View>

      <View className={styles.settingsCard}>
        <Text className={styles.settingsTitle}>⚙️ 语音设置</Text>
        <View className={styles.settingRow}>
          <View>
            <Text className={styles.settingLabel}>语音播放</Text>
            <Text className={styles.settingDesc}>开启后可播放语音提示</Text>
          </View>
          <View
            className={`${styles.toggleBtn} ${voiceEnabled ? styles.toggleOn : styles.toggleOff}`}
            onClick={toggleVoice}
          >
            <Text className={styles.toggleText}>{voiceEnabled ? '已开启' : '已关闭'}</Text>
          </View>
        </View>
        <View className={styles.settingRow}>
          <View>
            <Text className={styles.settingLabel}>播放语速</Text>
            <Text className={styles.settingDesc}>选择适合的语速</Text>
          </View>
          <View className={styles.speedBtns}>
            <View
              className={`${styles.speedBtn} ${voiceSpeed === 'slow' ? styles.speedBtnActive : styles.speedBtnNormal}`}
              onClick={() => setVoiceSpeed('slow')}
            >
              <Text className={styles.speedBtnText}>慢速</Text>
            </View>
            <View
              className={`${styles.speedBtn} ${voiceSpeed === 'normal' ? styles.speedBtnActive : styles.speedBtnNormal}`}
              onClick={() => setVoiceSpeed('normal')}
            >
              <Text className={styles.speedBtnText}>正常</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.assistantCard}>
        <Text className={styles.assistantTitle}>🤝 家属/代办人协助说明</Text>
        {assistantSteps.map((step) => (
          <View key={step.num} className={styles.assistantStep}>
            <View className={styles.assistantStepNum}>
              <Text className={styles.assistantStepText}>{step.num}</Text>
            </View>
            <Text className={styles.assistantStepContent}>{step.text}</Text>
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionHeader}>❓ 常见问题</Text>
        <View className={styles.categoryTabs}>
          {faqCategories.map((cat) => (
            <View
              key={cat}
              className={`${styles.categoryTab} ${activeCategory === cat ? styles.categoryTabActive : styles.categoryTabNormal}`}
              onClick={() => setActiveCategory(cat)}
            >
              <Text className={styles.categoryTabText}>{cat}</Text>
            </View>
          ))}
        </View>
        {filteredFaqs.map((faq) => (
          <View key={faq.id} className={styles.faqCard}>
            <View className={styles.faqQuestion} onClick={() => handlePlayFaq(faq)}>
              <Text className={styles.faqQuestionText}>{faq.question}</Text>
              <View className={styles.faqPlayBtn}>
                <Text className={styles.faqPlayIcon}>🔊</Text>
              </View>
            </View>
            {expandedFaq === faq.id && (
              <View className={styles.faqAnswer}>
                <Text className={styles.faqAnswerText}>{faq.answer}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default VoicePage;
