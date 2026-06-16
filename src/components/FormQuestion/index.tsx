import React from 'react';
import { View, Text, Input, Picker } from '@tarojs/components';
import classnames from 'classnames';
import type { FormField } from '@/types/inspection';
import styles from './index.module.scss';

interface FormQuestionProps {
  field: FormField;
  value: string;
  onChange: (id: string, value: string) => void;
  onVoiceTip: (tip: string) => void;
  error?: string;
}

const FormQuestion: React.FC<FormQuestionProps> = ({
  field,
  value,
  onChange,
  onVoiceTip,
  error,
}) => {
  const handleSelectChange = (e) => {
    const index = e.detail.value;
    if (field.options && index >= 0) {
      onChange(field.id, field.options[index]);
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.questionRow}>
        <Text className={styles.question}>{field.question}</Text>
        {field.required && <Text className={styles.required}>*</Text>}
      </View>

      <View className={styles.voiceHint} onClick={() => onVoiceTip(field.voiceTip)}>
        <Text className={styles.voiceIcon}>🔊</Text>
        <Text className={styles.voiceText}>听提示</Text>
      </View>

      {field.type === 'text' && (
        <Input
          className={classnames(styles.input, { [styles.inputError]: error })}
          value={value}
          placeholder={field.placeholder}
          placeholderClass={styles.placeholder}
          maxlength={field.validation?.maxLength || 140}
          onInput={(e) => onChange(field.id, e.detail.value)}
        />
      )}

      {field.type === 'textarea' && (
        <View className={styles.textareaWrapper}>
          <Input
            className={classnames(styles.textarea, { [styles.inputError]: error })}
            value={value}
            placeholder={field.placeholder}
            placeholderClass={styles.placeholder}
            maxlength={field.validation?.maxLength || 200}
            onInput={(e) => onChange(field.id, e.detail.value)}
          />
        </View>
      )}

      {field.type === 'select' && field.options && (
        <Picker mode="selector" range={field.options} onChange={handleSelectChange}>
          <View className={classnames(styles.selectBox, { [styles.inputError]: error })}>
            <Text className={classnames({ [styles.placeholder]: !value })}>
              {value || field.placeholder}
            </Text>
            <Text className={styles.selectArrow}>▼</Text>
          </View>
        </Picker>
      )}

      {field.type === 'date' && (
        <Picker mode="date" onChange={(e) => onChange(field.id, e.detail.value)}>
          <View className={classnames(styles.selectBox, { [styles.inputError]: error })}>
            <Text className={classnames({ [styles.placeholder]: !value })}>
              {value || field.placeholder}
            </Text>
            <Text className={styles.selectArrow}>▼</Text>
          </View>
        </Picker>
      )}

      {field.type === 'photo' && (
        <View className={styles.photoBox}>
          {value ? (
            <View className={styles.photoPreview}>
              <Text className={styles.photoOk}>✅ 已上传</Text>
            </View>
          ) : (
            <View
              className={styles.photoPlaceholder}
              onClick={() => onChange(field.id, 'uploaded')}
            >
              <Text className={styles.photoIcon}>📷</Text>
              <Text className={styles.photoText}>点击拍照或从相册选择</Text>
            </View>
          )}
        </View>
      )}

      {error && (
        <View className={styles.errorBox}>
          <Text className={styles.errorIcon}>❌</Text>
          <Text className={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

export default FormQuestion;
