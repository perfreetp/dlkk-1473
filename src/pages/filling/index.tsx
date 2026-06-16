import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { formFields } from '@/data/formFields';
import { useInspectionStore } from '@/store/useInspectionStore';
import FormQuestion from '@/components/FormQuestion';
import ProgressBar from '@/components/ProgressBar';
import { playVoiceTip } from '@/utils/voiceHelper';
import styles from './index.module.scss';

const FillingPage: React.FC = () => {
  const {
    formAnswers,
    updateFormAnswer,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    voiceEnabled,
  } = useInspectionStore();

  const totalFields = formFields.length;
  const answeredCount = Object.keys(formAnswers).filter(
    (id) => formAnswers[id] && formAnswers[id].trim()
  ).length;

  const currentField = formFields[currentQuestionIndex];
  const currentValue = formAnswers[currentField?.id] || '';

  const incompleteFields = useMemo(() => {
    return formFields.filter((f) => {
      if (!f.required) return false;
      const answer = formAnswers[f.id];
      return !answer || !answer.trim();
    });
  }, [formAnswers]);

  const validateField = (fieldId: string): string | undefined => {
    const field = formFields.find((f) => f.id === fieldId);
    if (!field || !field.required) return undefined;
    const value = formAnswers[fieldId];
    if (!value || !value.trim()) return '此项为必填项，请填写';
    if (field.validation) {
      if (field.validation.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) return field.validation.message || '格式不正确';
      }
      if (field.validation.maxLength && value.length > field.validation.maxLength) {
        return field.validation.message || `不能超过${field.validation.maxLength}个字`;
      }
    }
    return undefined;
  };

  const handleVoiceTip = (tip: string) => {
    if (voiceEnabled) {
      playVoiceTip(tip);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    const error = validateField(currentField.id);
    if (error) {
      Taro.showModal({
        title: '⚠️ 填写提示',
        content: error,
        showCancel: false,
        confirmText: '知道了',
      });
      return;
    }
    if (currentQuestionIndex < totalFields - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = () => {
    if (incompleteFields.length > 0) {
      Taro.showModal({
        title: '⚠️ 还有必填项未完成',
        content: `您还有${incompleteFields.length}项必填内容未填写，建议全部完成后再提交。`,
        confirmText: '继续提交',
        cancelText: '去补填',
        success: (res) => {
          if (res.confirm) {
            Taro.switchTab({ url: '/pages/progress/index' });
          }
        },
      });
      return;
    }
    Taro.showModal({
      title: '✅ 确认提交',
      content: '所有必填项已填写完成，确认提交年检申报吗？',
      confirmText: '确认提交',
      cancelText: '再检查',
      success: (res) => {
        if (res.confirm) {
          useInspectionStore.getState().setSubmissionStatus('submitted');
          Taro.switchTab({ url: '/pages/progress/index' });
        }
      },
    });
  };

  const jumpToField = (fieldId: string) => {
    const index = formFields.findIndex((f) => f.id === fieldId);
    if (index >= 0) {
      setCurrentQuestionIndex(index);
    }
  };

  const error = currentField?.required ? validateField(currentField.id) : undefined;

  return (
    <View className={styles.container}>
      <View className={styles.progressSection}>
        <ProgressBar
          current={answeredCount}
          total={totalFields}
          label={`填报进度：第${currentQuestionIndex + 1}题 / 共${totalFields}题`}
        />
      </View>

      {currentField && (
        <View className={styles.questionCard}>
          <FormQuestion
            field={currentField}
            value={currentValue}
            onChange={updateFormAnswer}
            onVoiceTip={handleVoiceTip}
            error={error}
          />
        </View>
      )}

      {incompleteFields.length > 0 && (
        <View className={styles.incompleteSection}>
          <Text className={styles.incompleteTitle}>
            📋 未完成必填项（{incompleteFields.length}项）
          </Text>
          {incompleteFields.map((field) => (
            <View
              key={field.id}
              className={styles.incompleteItem}
              onClick={() => jumpToField(field.id)}
            >
              <View className={styles.incompleteDot} />
              <Text className={styles.incompleteText}>{field.question}</Text>
              <Text className={styles.incompleteAction}>去填写 ›</Text>
            </View>
          ))}
        </View>
      )}

      <View className={styles.autoSaveTip}>
        <Text className={styles.autoSaveText}>💾 填写内容已自动保存</Text>
      </View>

      <View className={styles.navButtons}>
        <View
          className={`${styles.navBtn} ${styles.navBtnPrev} ${
            currentQuestionIndex === 0 ? styles.navBtnDisabled : ''
          }`}
          onClick={handlePrev}
        >
          <Text className={styles.navBtnText}>上一题</Text>
        </View>
        {currentQuestionIndex < totalFields - 1 ? (
          <View className={`${styles.navBtn} ${styles.navBtnNext}`} onClick={handleNext}>
            <Text className={styles.navBtnText}>下一题</Text>
          </View>
        ) : (
          <View className={`${styles.navBtn} ${styles.navBtnSubmit}`} onClick={handleSubmit}>
            <Text className={styles.navBtnText}>提交申报</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default FillingPage;
