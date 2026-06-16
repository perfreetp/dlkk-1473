import React, { useMemo, useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { formFields } from '@/data/formFields';
import { submissionInfo } from '@/data/submission';
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
    setSubmissionStatus,
    submissionStatus,
    focusedFieldId,
    setFocusedFieldId,
  } = useInspectionStore();

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (submissionStatus === 'submitted' || submissionStatus === 'approved') {
      setShowSuccess(true);
    }
  }, [submissionStatus]);

  useEffect(() => {
    if (focusedFieldId) {
      const index = formFields.findIndex((f) => f.id === focusedFieldId);
      if (index >= 0) {
        setCurrentQuestionIndex(index);
        setTimeout(() => {
          Taro.showToast({
            title: `📍 请修改「${formFields[index].question.replace(/\*/g, '').slice(0, 12)}」`,
            icon: 'none',
            duration: 2500,
          });
        }, 300);
        setTimeout(() => {
          setFocusedFieldId(null);
        }, 5000);
      } else {
        setFocusedFieldId(null);
      }
    }
  }, [focusedFieldId]);

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

  const doSubmit = () => {
    setSubmissionStatus('submitted');
    setShowSuccess(true);
    Taro.showToast({ title: '✅ 提交成功', icon: 'none', duration: 1500 });
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
            doSubmit();
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
          doSubmit();
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

  const goProgress = () => {
    setShowSuccess(false);
    Taro.switchTab({ url: '/pages/progress/index' });
  };

  const error = currentField?.required ? validateField(currentField.id) : undefined;

  if (showSuccess) {
    return (
      <View className={styles.successPage}>
        <View className={styles.successContent}>
          <Text className={styles.successBigIcon}>🎉</Text>
          <Text className={styles.successBigTitle}>提交成功！</Text>
          <Text className={styles.successBigDesc}>
            您的2026年度民办幼儿园年检申报已提交给教育局审核。{'\n'}
            通常在5-10个工作日内会有审核结果。{'\n'}
            您可以在"进度查询"中随时查看。
          </Text>
          <View className={styles.qrCodeBox}>
            <Text className={styles.qrCodeText}>
              现场咨询二维码{'\n'}（扫码获取排队信息）
            </Text>
          </View>
          <Text className={styles.qrCodeHint}>
            如需到现场办理，请向工作人员出示此页面
          </Text>
          <View className={styles.successBtns}>
            <View className={styles.successBtnPrimary} onClick={goProgress}>
              <Text className={styles.successBtnText}>查看进度</Text>
            </View>
            <View
              className={styles.successBtnOutline}
              onClick={() => setShowSuccess(false)}
            >
              <Text className={styles.successBtnTextOutline}>返回修改</Text>
            </View>
          </View>
          <View className={styles.successContact}>
            <Text className={styles.successContactTitle}>📞 咨询方式</Text>
            <Text className={styles.successContactText}>
              电话：{submissionInfo.contactPhone}{'\n'}
              地址：{submissionInfo.contactAddress}
            </Text>
          </View>
        </View>
      </View>
    );
  }

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
            focused={focusedFieldId === currentField.id}
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
        <Text className={styles.autoSaveText}>💾 填写内容已自动保存（刷新也不丢失）</Text>
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
