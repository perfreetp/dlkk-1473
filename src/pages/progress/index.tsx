import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { submissionInfo } from '@/data/submission';
import { materials } from '@/data/materials';
import { useInspectionStore } from '@/store/useInspectionStore';
import { formFields } from '@/data/formFields';
import styles from './index.module.scss';

const mockRejectedItems = [
  { fieldId: 'm4', fieldName: '消防安全检查合格证', reason: '证件照片模糊，请重新拍摄上传清晰的证件照片' },
  { fieldId: 'm12', fieldName: '员工花名册', reason: '缺少幼儿园公章，请在纸质文件上盖章后重新拍照上传' },
  { fieldId: 'f4', fieldName: '举办者联系电话', reason: '电话格式不正确，请输入11位手机号码' },
];

const ProgressPage: React.FC = () => {
  const {
    submissionStatus,
    setSubmissionStatus,
    setRejectedItems,
    rejectedItems,
    materialStatus,
    formAnswers,
    submitDate,
    setFocusedMaterialId,
    setFocusedFieldId,
    clearAllRejected,
  } = useInspectionStore();

  const status = submissionStatus;
  const info = submissionInfo;

  const doneMaterialCount = useMemo(
    () => Object.values(materialStatus).filter((s) => s === 'done').length,
    [materialStatus]
  );

  const allRejectedFixed = useMemo(() => {
    if (rejectedItems.length === 0) return true;
    return rejectedItems.every((item) => {
      const fieldId = item.fieldId;
      if (fieldId.startsWith('m')) {
        return materialStatus[fieldId] === 'done';
      } else {
        const originalAnswer = formAnswers[fieldId]?.trim() || '';
        return !!originalAnswer;
      }
    });
  }, [rejectedItems, materialStatus, formAnswers]);

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
      desc: `材料已准备${doneMaterialCount}/${materials.length}项，请继续完成`,
      heroClass: styles.statusHeroDraft,
    },
    submitted: {
      icon: '📤',
      title: '已提交审核',
      desc: submitDate
        ? `${submitDate}已提交，教育部门正在审核，请耐心等待`
        : '教育部门正在审核您的申报材料，请耐心等待',
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

  const handleFixItem = (fieldId: string) => {
    const isFormField = fieldId.startsWith('f');

    if (isFormField) {
      const index = formFields.findIndex((f) => f.id === fieldId);
      if (index >= 0) {
        setFocusedFieldId(fieldId);
        useInspectionStore.getState().setCurrentQuestionIndex(index);
      }
      Taro.switchTab({ url: '/pages/filling/index' }).catch((err) => {
        console.error('[ProgressPage] Navigation error:', err);
      });
    } else {
      setFocusedMaterialId(fieldId);
      Taro.switchTab({ url: '/pages/materials/index' }).catch((err) => {
        console.error('[ProgressPage] Navigation error:', err);
      });
    }

    Taro.showToast({
      title: '✏️ 请修改此项',
      icon: 'none',
      duration: 1500,
    });
  };

  const handleCallPhone = (phone: string) => {
    Taro.makePhoneCall({
      phoneNumber: phone,
    }).catch((err) => {
      console.error('[ProgressPage] Call error:', err);
      Taro.showToast({
        title: `请手动拨打 ${phone}`,
        icon: 'none',
        duration: 2000,
      });
    });
  };

  const handleResubmit = () => {
    if (!allRejectedFixed) {
      const remaining = rejectedItems.length;
      Taro.showToast({
        title: `还有 ${remaining} 项未修改`,
        icon: 'none',
        duration: 2000,
      });
      return;
    }

    Taro.showModal({
      title: '📤 确认重新提交',
      content: '所有退回项均已修改完成，确认重新提交年检申报吗？',
      confirmText: '确认提交',
      cancelText: '再检查',
      success: (res) => {
        if (res.confirm) {
          clearAllRejected();
          setSubmissionStatus('submitted');
          Taro.showToast({ title: '✅ 重新提交成功', icon: 'none', duration: 2000 });
        }
      },
    });
  };

  const handleSimulateReject = () => {
    Taro.showModal({
      title: '🔍 模拟审核退回',
      content: '为了演示退回修改功能，将模拟教育部门退回材料，确认进入退回场景吗？',
      confirmText: '演示退回',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          setRejectedItems(mockRejectedItems);
          setSubmissionStatus('rejected');
          Taro.showToast({ title: '已退回，可查看原因', icon: 'none', duration: 2000 });
        }
      },
    });
  };

  const handleSimulateApprove = () => {
    Taro.showModal({
      title: '✅ 模拟审核通过',
      content: '确认模拟教育部门审核通过吗？',
      confirmText: '通过',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          setSubmissionStatus('approved');
          Taro.showToast({ title: '审核通过！', icon: 'success' });
        }
      },
    });
  };

  const showSimulationButtons = status === 'submitted';

  const showSuccessCard = status === 'approved' || status === 'submitted';
  const successCardConfig =
    status === 'approved'
      ? {
          icon: '🎉',
          title: '年检申报已通过！',
          desc: `您的2026年度民办幼儿园年检申报已通过审核。请携带相关原件到${info.contactAddress}现场确认。`,
        }
      : {
          icon: '📤',
          title: '提交成功，等待审核',
          desc: `您的2026年度民办幼儿园年检申报已成功提交。教育部门将在5-10个工作日内审核，请在"进度查询"中随时关注。如需加急，可拨打咨询电话。`,
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
              <Text className={styles.timelineDate}>
                {doneMaterialCount > 0 ? `已准备${doneMaterialCount}项` : '待开始'}
              </Text>
            </View>
          </View>
          <View className={styles.timelineItem}>
            <View
              className={`${styles.timelineDot} ${
                status !== 'not_started' ? styles.timelineDotDone : styles.timelineDot
              }`}
            />
            <View className={styles.timelineLine} />
            <View className={styles.timelineContent}>
              <Text className={styles.timelineLabel}>在线填报</Text>
              <Text className={styles.timelineDate}>
                {status === 'not_started' ? '待开始' : status === 'draft' ? '填报中' : '已完成'}
              </Text>
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
                {status === 'approved'
                  ? '✅ 已通过'
                  : status === 'rejected'
                  ? '❌ 退回修改'
                  : '等待中'}
              </Text>
            </View>
          </View>
        </View>

        {showSimulationButtons && (
          <View className={styles.simulateCard}>
            <Text className={styles.simulateTitle}>🧪 功能演示</Text>
            <Text className={styles.simulateDesc}>
              以下按钮用于演示审核通过/退回场景，实际应用中由教育部门决定。
            </Text>
            <View className={styles.simulateBtns}>
              <View className={styles.simulateBtnReject} onClick={handleSimulateReject}>
                <Text className={styles.simulateBtnText}>🔍 模拟退回</Text>
              </View>
              <View className={styles.simulateBtnApprove} onClick={handleSimulateApprove}>
                <Text className={styles.simulateBtnTextWhite}>✅ 模拟通过</Text>
              </View>
            </View>
          </View>
        )}

        {status === 'rejected' && (
          <View className={styles.communicationCard}>
            <Text className={styles.communicationTitle}>💬 审核老师沟通</Text>
            <View className={styles.communicationNote}>
              <Text className={styles.communicationNoteText}>{info.reviewNote}</Text>
            </View>
            <View className={styles.communicationInfo}>
              <Text className={styles.communicationIcon}>👩‍💼</Text>
              <Text className={styles.communicationText}>负责老师：{info.reviewerName}</Text>
            </View>
            <View className={styles.communicationInfo}>
              <Text className={styles.communicationIcon}>📱</Text>
              <Text className={styles.communicationText}>{info.reviewerPhone}</Text>
              <View
                className={styles.communicationPhoneBtn}
                onClick={() => handleCallPhone(info.reviewerPhone)}
              >
                <Text className={styles.communicationPhoneText}>📞 拨号</Text>
              </View>
            </View>
            <View className={styles.communicationInfo}>
              <Text className={styles.communicationIcon}>🕐</Text>
              <Text className={styles.communicationText}>{info.reviewerOfficeHours}</Text>
            </View>
            <View className={styles.communicationOnSite}>
              <Text className={styles.communicationOnSiteText}>💡 {info.onSiteNote}</Text>
            </View>
          </View>
        )}

        {(status === 'submitted' || status === 'approved') && (
          <View className={styles.communicationCard}>
            <Text className={styles.communicationTitle}>📍 现场办理提示</Text>
            <View className={styles.communicationOnSite}>
              <Text className={styles.communicationOnSiteText}>
                {status === 'approved'
                  ? `年检已通过！请携带所有材料原件到${info.contactAddress}完成最终确认。有问题可拨打咨询电话。`
                  : '审核期间如有疑问，可拨打咨询电话或携带材料到现场，工作人员会协助您处理。'}
              </Text>
            </View>
            <View className={styles.communicationInfo}>
              <Text className={styles.communicationIcon}>📞</Text>
              <Text className={styles.communicationText}>{info.contactPhone}</Text>
              <View
                className={styles.communicationPhoneBtn}
                onClick={() => handleCallPhone(info.contactPhone)}
              >
                <Text className={styles.communicationPhoneText}>拨号</Text>
              </View>
            </View>
            <View className={styles.communicationInfo}>
              <Text className={styles.communicationIcon}>📍</Text>
              <Text className={styles.communicationText}>{info.contactAddress}</Text>
            </View>
            <View className={styles.communicationInfo}>
              <Text className={styles.communicationIcon}>🕐</Text>
              <Text className={styles.communicationText}>{info.reviewerOfficeHours}</Text>
            </View>
          </View>
        )}

        {status === 'rejected' && rejectedItems.length > 0 && (
          <View className={styles.rejectedCard}>
            <Text className={styles.rejectedTitle}>
              ⚠️ 退回原因及修改建议（共{rejectedItems.length}项，{rejectedItems.filter((r) => {
                if (r.fieldId.startsWith('m')) return materialStatus[r.fieldId] === 'done';
                return !!formAnswers[r.fieldId]?.trim();
              }).length}项已修改）
            </Text>
            {rejectedItems.map((item) => {
              const isFixed = item.fieldId.startsWith('m')
                ? materialStatus[item.fieldId] === 'done'
                : !!formAnswers[item.fieldId]?.trim();
              return (
                <View key={item.fieldId} className={styles.rejectedItem}>
                  <Text className={styles.rejectedIcon}>{isFixed ? '✅' : '❌'}</Text>
                  <View className={styles.rejectedInfo}>
                    <Text
                      className={styles.rejectedFieldName}
                      style={{ opacity: isFixed ? 0.5 : 1, textDecoration: isFixed ? 'line-through' : 'none' }}
                    >
                      {item.fieldName}
                      {isFixed && '（已修改）'}
                    </Text>
                    <Text className={styles.rejectedReason}>{item.reason}</Text>
                  </View>
                  {!isFixed && (
                    <View
                      className={styles.rejectedAction}
                      onClick={() => handleFixItem(item.fieldId)}
                    >
                      <Text className={styles.rejectedActionText}>去修改</Text>
                    </View>
                  )}
                </View>
              );
            })}
            {allRejectedFixed ? (
              <View className={styles.resubmitBtn} onClick={handleResubmit}>
                <Text className={styles.resubmitBtnText}>✅ 改完了，重新提交</Text>
              </View>
            ) : (
              <>
                <View className={styles.submitDisabled}>
                  <Text className={styles.submitDisabledText}>
                    还有 {rejectedItems.filter((r) => {
                      if (r.fieldId.startsWith('m')) return materialStatus[r.fieldId] !== 'done';
                      return !formAnswers[r.fieldId]?.trim();
                    }).length} 项待修改
                  </Text>
                </View>
                <Text className={styles.fixHint}>
                  请先将所有退回项修改完成，修改后"重新提交"按钮会自动亮起
                </Text>
              </>
            )}
          </View>
        )}

        {status === 'rejected' && rejectedItems.length === 0 && (
          <View className={styles.successCard}>
            <Text className={styles.successIcon}>👍</Text>
            <Text className={styles.successTitle}>所有问题已修改</Text>
            <Text className={styles.successDesc}>退回项已全部处理完成，可重新提交审核。</Text>
            <View className={styles.resubmitBtn} onClick={handleResubmit}>
              <Text className={styles.resubmitBtnText}>重新提交审核</Text>
            </View>
          </View>
        )}

        {showSuccessCard && (
          <View className={styles.successCard}>
            <Text className={styles.successIcon}>{successCardConfig.icon}</Text>
            <Text className={styles.successTitle}>{successCardConfig.title}</Text>
            <Text className={styles.successDesc}>{successCardConfig.desc}</Text>
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
