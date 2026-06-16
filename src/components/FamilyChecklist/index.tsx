import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { materials } from '@/data/materials';
import { formFields } from '@/data/formFields';
import { useInspectionStore } from '@/store/useInspectionStore';
import styles from './index.module.scss';

interface ChecklistItem {
  id: string;
  type: 'material' | 'form' | 'rejected';
  name: string;
  status: 'missing' | 'pending' | 'empty' | 'rejected';
  actionText: string;
  category?: string;
}

const FamilyChecklist: React.FC = () => {
  const {
    materialStatus,
    formAnswers,
    rejectedItems,
    setFocusedMaterialId,
    setFocusedFieldId,
    setCurrentQuestionIndex,
  } = useInspectionStore();

  const checklist = useMemo((): ChecklistItem[] => {
    const items: ChecklistItem[] = [];

    rejectedItems.forEach((r) => {
      const isMaterial = r.fieldId.startsWith('m');
      if (isMaterial) {
        const mat = materials.find((m) => m.id === r.fieldId);
        if (mat && materialStatus[r.fieldId] !== 'done') {
          items.push({
            id: r.fieldId,
            type: 'rejected',
            name: r.fieldName,
            status: 'rejected',
            actionText: '去修改',
            category: mat.category,
          });
        }
      } else {
        const field = formFields.find((f) => f.id === r.fieldId);
        if (field) {
          const hasValue = !!formAnswers[r.fieldId]?.trim();
          if (!hasValue) {
            items.push({
              id: r.fieldId,
              type: 'rejected',
              name: r.fieldName,
              status: 'rejected',
              actionText: '去填写',
            });
          }
        }
      }
    });

    materials.forEach((m) => {
      const isRejected = rejectedItems.some((r) => r.fieldId === m.id);
      if (isRejected) return;
      if (materialStatus[m.id] === 'missing') {
        items.push({
          id: m.id,
          type: 'material',
          name: m.name,
          status: 'missing',
          actionText: '去补充',
          category: m.category,
        });
      } else if (materialStatus[m.id] === 'pending' && m.required) {
        items.push({
          id: m.id,
          type: 'material',
          name: m.name,
          status: 'pending',
          actionText: '去准备',
          category: m.category,
        });
      }
    });

    formFields.forEach((f) => {
      if (!f.required) return;
      const isRejected = rejectedItems.some((r) => r.fieldId === f.id);
      if (isRejected) return;
      if (!formAnswers[f.id]?.trim()) {
        items.push({
          id: f.id,
          type: 'form',
          name: f.question.replace(/\*/g, '').trim(),
          status: 'empty',
          actionText: '去填写',
        });
      }
    });

    return items;
  }, [materialStatus, formAnswers, rejectedItems]);

  const handleItemClick = (item: ChecklistItem) => {
    if (item.type === 'material' || item.type === 'rejected') {
      if (item.id.startsWith('m')) {
        setFocusedMaterialId(item.id);
        Taro.switchTab({ url: '/pages/materials/index' });
      } else {
        const index = formFields.findIndex((f) => f.id === item.id);
        if (index >= 0) {
          setFocusedFieldId(item.id);
          setCurrentQuestionIndex(index);
          Taro.switchTab({ url: '/pages/filling/index' });
        }
      }
    } else {
      const index = formFields.findIndex((f) => f.id === item.id);
      if (index >= 0) {
        setCurrentQuestionIndex(index);
        Taro.switchTab({ url: '/pages/filling/index' });
      }
    }
  };

  const getStatusLabel = (status: ChecklistItem['status']) => {
    const labels: Record<string, string> = {
      missing: '缺失',
      pending: '待准备',
      empty: '未填写',
      rejected: '被退回',
    };
    return labels[status];
  };

  if (checklist.length === 0) {
    return (
      <View className={styles.container}>
        <View className={styles.header}>
          <Text className={styles.icon}>👨‍👩‍👧</Text>
          <Text className={styles.title}>家属代办清单</Text>
        </View>
        <View className={styles.allDone}>
          <Text className={styles.allDoneIcon}>🎉</Text>
          <Text className={styles.allDoneText}>太棒了！所有事项已完成</Text>
          <Text className={styles.allDoneSub}>可以提交申报了</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.icon}>👨‍👩‍👧</Text>
        <View className={styles.headerText}>
          <Text className={styles.title}>家属代办清单</Text>
          <Text className={styles.subtitle}>共 {checklist.length} 项待处理</Text>
        </View>
      </View>

      <View className={styles.tip}>
        <Text className={styles.tipText}>
          💡 可以让家人帮忙按清单一项项完成，点右边按钮直接跳转
        </Text>
      </View>

      <View className={styles.list}>
        {checklist.map((item, index) => (
          <View key={item.id} className={styles.item}>
            <View className={styles.itemIndex}>
              <Text className={styles.itemIndexText}>{index + 1}</Text>
            </View>
            <View className={styles.itemContent}>
              <View className={styles.itemRow}>
                <Text
                  className={classnames(styles.itemName, {
                    [styles.nameRejected]: item.status === 'rejected',
                    [styles.nameMissing]: item.status === 'missing',
                  })}
                >
                  {item.name}
                </Text>
                <Text
                  className={classnames(styles.statusBadge, styles[item.status])}
                >
                  {getStatusLabel(item.status)}
                </Text>
              </View>
              {item.category && (
                <Text className={styles.itemCategory}>{item.category}</Text>
              )}
            </View>
            <View className={styles.itemAction} onClick={() => handleItemClick(item)}>
              <Text className={styles.actionText}>{item.actionText} ›</Text>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.summary}>
        <Text className={styles.summaryText}>
          🔴 被退回 {checklist.filter((i) => i.status === 'rejected').length} 项 ·
          🟡 材料缺失 {checklist.filter((i) => i.status === 'missing').length} 项 ·
          ⚪ 未填写 {checklist.filter((i) => i.status === 'empty').length} 项
        </Text>
      </View>
    </View>
  );
};

export default FamilyChecklist;
