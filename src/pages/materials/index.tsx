import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { materials, materialCategories } from '@/data/materials';
import { useInspectionStore } from '@/store/useInspectionStore';
import MaterialItem from '@/components/MaterialItem';
import { playVoiceTip } from '@/utils/voiceHelper';
import styles from './index.module.scss';

const MaterialsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const { materialStatus, updateMaterialStatus, voiceEnabled } = useInspectionStore();

  const enrichedMaterials = useMemo(() => {
    return materials.map((m) => ({
      ...m,
      status: materialStatus[m.id] || m.status,
    }));
  }, [materialStatus]);

  const filteredMaterials = useMemo(() => {
    if (activeCategory === '全部') return enrichedMaterials;
    return enrichedMaterials.filter((m) => m.category === activeCategory);
  }, [enrichedMaterials, activeCategory]);

  const doneCount = Object.values(materialStatus).filter((s) => s === 'done').length;
  const pendingCount = Object.values(materialStatus).filter((s) => s === 'pending').length;
  const missingCount = Object.values(materialStatus).filter((s) => s === 'missing').length;

  const handleVoiceTip = (tip: string) => {
    if (voiceEnabled) {
      playVoiceTip(tip);
    }
  };

  const handleSubmit = () => {
    if (missingCount > 0) {
      Taro.showModal({
        title: '⚠️ 还有材料缺失',
        content: `您还有${missingCount}项材料缺失，建议补充完整后再提交。是否继续？`,
        confirmText: '继续提交',
        cancelText: '去补充',
      });
      return;
    }
    if (pendingCount > 0) {
      Taro.showModal({
        title: '📋 还有材料未准备',
        content: `您还有${pendingCount}项材料待准备，建议准备完整后再提交。`,
        confirmText: '我知道了',
        showCancel: false,
      });
      return;
    }
    Taro.switchTab({ url: '/pages/progress/index' }).catch((err) => {
      console.error('[MaterialsPage] Navigation error:', err);
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>📋 材料清单</Text>
        <Text className={styles.headerDesc}>
          按类别准备材料，点击展开查看说明和示例
        </Text>
      </View>

      <View className={styles.assistantNote}>
        <Text className={styles.assistantIcon}>🤝</Text>
        <Text className={styles.assistantText}>
          家属或代办人可协助准备材料，点击状态标签可切换准备状态
        </Text>
      </View>

      <View className={styles.tabBar}>
        {materialCategories.map((cat) => (
          <View
            key={cat}
            className={`${styles.tab} ${activeCategory === cat ? styles.tabActive : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            <Text className={styles.tabText}>{cat}</Text>
          </View>
        ))}
      </View>

      <View className={styles.content}>
        {filteredMaterials.map((material) => (
          <MaterialItem
            key={material.id}
            material={material}
            onStatusChange={updateMaterialStatus}
            onVoiceTip={handleVoiceTip}
          />
        ))}
      </View>

      <View className={styles.summaryBar}>
        <View className={styles.summaryLeft}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryDone}>✅ {doneCount}</Text>
            <Text className={styles.summaryLabel}>已准备</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryPending}>📋 {pendingCount}</Text>
            <Text className={styles.summaryLabel}>待准备</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryMissing}>❌ {missingCount}</Text>
            <Text className={styles.summaryLabel}>缺失</Text>
          </View>
        </View>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text className={styles.submitBtnText}>去填报</Text>
        </View>
      </View>
    </View>
  );
};

export default MaterialsPage;
