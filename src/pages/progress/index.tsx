import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { submissionInfo } from '@/data/submission';
import { useInspectionStore } from '@/store/useInspectionStore';
import { formFields } from '@/data/formFields';
import styles from './index.module.scss';

const ProgressPage: React.FC = () => {
  const { submissionStatus, setSubmissionStatus, setRejectedItems, formAnswers } =
    useInspectionStore();

  const status = submissionStatus;
  const info = submissionInfo;

  const statusConfig: Record<
    string,
    { icon: string; title: string; desc: string; heroClass: string }
  > = {
    not_started: {
      icon: '📋',
      title: '尚未开始',
      desc: '请先准备材料并填写申报信息',
      heroClass: styles.statusHeroDraft,
    },
    draft: {
      icon: '✏️',
      title: '填报中',
      desc: `已完成${info.completedItems}/${info.totalItems}项，请继续填写`,
      heroClass: styles.statusHeroDraft,
    },
    submitted: {
      icon: '📤',
      title: '已提交审核',
      desc: '教育部门正在审核您的申报材料，请耐心等待',
      heroClass: styles.statusHeroSubmitted,
    },
    rejected: {
      icon: '❌',
      title: '审核退回',
      desc: '您的申报材料有部分问题，请按退回意见修改',
      heroClass: styles.statusHeroRejected,
    },
    approved: {
      icon: '✅',
      title: '审核通过',
      desc: '恭喜！您的年检申报已通过审核',
      heroClass: styles.statusHeroApproved,
    },
  };

  const currentConfig = statusConfig[status];
  const rejectedItems = info.rejectedItems;

  const handleFixItem = (fieldId: string) => {
    const isFormField = fieldId.startsWith('f');
    if (isFormField) {
      Taro.switchTab({ url: '/pages/filling/index' }).catch((err) => {
        console.error('[ProgressPage] Navigation error:', err);
      });
      const index = formFields.findIndex((f) => f.id === fieldId);
      if (index >= 0) {
        useInspectionStore.getState().setCurrentQuestionIndex(index);
      }
    } else {
      Taro.switchTab({ url: '/pages/materials/index' }).catch((err) => {
        console.error('[ProgressPage] Navigation error:', err);
      });
    }
  };

  const handleResubmit = () => {
    Taro.showModal({
      title: '📤 确认重新提交',
      content: '修改完成后，确认重新提交年检申报吗？',
      confirmText: '确认提交',
      cancelText: '再检查',
      success: (res) => {
        if (res.confirm) {
          setSubmissionStatus('submitted');
          setRejectedItems([]);
          Taro.showToast({ title: '提交成功', icon: 'success' });
        }
      },
    });
  };

  return (
    <View className={styles.container}>
      <View className={`${styles.statusHero} ${currentConfig.heroClass}`}>
        <Text className={styles.statusIcon}>{currentConfig.icon}</Text>
        <Text className={styles.statusTitle}>{currentConfig.title}</Text>
        <Text className={styles.statusDesc}>{currentConfig.desc}</Text>
      </View>

      <View className={styles.content}>
        <View className={styles.timelineCard}>
          <Text className={styles.timelineTitle}>📅 办理进度</Text>
          <View className={styles.timelineItem}>
            <View className={`${styles.timelineDot} ${styles.timelineDotDone}`} />
            <View className={styles.timelineLine} />
            <View className={styles.timelineContent}>
              <Text className={styles.timelineLabel}>准备材料</Text>
              <Text className={styles.timelineDate}>已完成</Text>
            </View>
          </View>
          <View className={styles.timelineItem}>
            <View className={`${styles.timelineDot} ${styles.timelineDotDone}`} />
            <View className={styles.timelineLine} />
            <View className={styles.timelineContent}>
              <Text className={styles.timelineLabel}>在线填报</Text>
              <Text className={styles.timelineDate}>已完成</Text>
            </View>
          </View>
          <View className={styles.timelineItem}>
            <View
              className={`${styles.timelineDot} ${
                status === 'submitted' || status === 'approved'
                  ? styles.timelineDotDone
                  : status === 'rejected'
                  ? styles.timelineDotError
                  : styles.timelineDotActive
              }`}
            />
            <View className={styles.timelineLine} />
            <View className={styles.timelineContent}>
              <Text className={styles.timelineLabel}>提交审核</Text>
              <Text className={styles.timelineDate}>
                {status === 'submitted'
                  ? '审核中...'
                  : status === 'approved'
                  ? '已通过'
                  : status === 'rejected'
                  ? '已退回'
                  : '待提交'}
              </Text>
            </View>
          </View>
          <View className={styles.timelineItem}>
            <View
              className={`${styles.timelineDot} ${
                status === 'approved' ? styles.timelineDotDone : styles.timelineDot
              }`}
            />
            <View className={styles.timelineContent}>
              <Text className={styles.timelineLabel}>审核结果</Text>
              <Text className={styles.timelineDate}>
                {status === 'approved' ? '已通过' : '等待中'}
              </Text>
            </View>
          </View>
        </View>

        {status === 'rejected' && rejectedItems.length > 0 && (
          <View className={styles.rejectedCard}>
            <Text className={styles.rejectedTitle}>⚠️ 退回原因及修改建议</Text>
            {rejectedItems.map((item) => (
              <View key={item.fieldId} className={styles.rejectedItem}>
                <Text className={styles.rejectedIcon}>❌</Text>
                <View className={styles.rejectedInfo}>
                  <Text className={styles.rejectedFieldName}>{item.fieldName}</Text>
                  <Text className={styles.rejectedReason}>{item.reason}</Text>
                </View>
                <View
                  className={styles.rejectedAction}
                  onClick={() => handleFixItem(item.fieldId)}
                >
                  <Text className={styles.rejectedActionText}>去修改</Text>
                </View>
              </View>
            ))}
            <View className={styles.resubmitBtn} onClick={handleResubmit}>
              <Text className={styles.resubmitBtnText}>修改后重新提交</Text>
            </View>
          </View>
        )}

        {status === 'approved' && (
          <View className={styles.successCard}>
            <Text className={styles.successIcon}>🎉</Text>
            <Text className={styles.successTitle}>年检申报已通过！</Text>
            <Text className={styles.successDesc}>
              您的{info.year}年度民办幼儿园年检申报已通过审核。请携带相关原件到现场确认。
            </Text>
            <View className={styles.qrCodeBox}>
              <Text className={styles.qrCodeText}>
                现场咨询二维码{'\n'}（扫码获取排队信息）
              </Text>
            </View>
            <Text className={styles.qrCodeHint}>
              到现场后请出示此页面，工作人员会协助您完成最后确认
            </Text>
          </View>
        )}

        <View className={styles.contactCard}>
          <Text className={styles.contactTitle}>📞 咨询联系方式</Text>
          <View className={styles.contactItem}>
            <Text className={styles.contactIcon}>📞</Text>
            <Text className={styles.contactText}>电话：{info.contactPhone}</Text>
          </View>
          <View className={styles.contactItem}>
            <Text className={styles.contactIcon}>📍</Text>
            <Text className={styles.contactText}>地址：{info.contactAddress}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProgressPage;
