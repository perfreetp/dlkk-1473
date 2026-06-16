import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import type { Material } from '@/types/inspection';
import styles from './index.module.scss';

interface MaterialItemProps {
  material: Material;
  onStatusChange: (id: string, status: 'pending' | 'done' | 'missing') => void;
  onVoiceTip: (tip: string) => void;
}

const MaterialItem: React.FC<MaterialItemProps> = ({ material, onStatusChange, onVoiceTip }) => {
  const [expanded, setExpanded] = useState(false);

  const statusLabels: Record<string, string> = {
    done: '已准备',
    pending: '待准备',
    missing: '缺失',
  };

  return (
    <View className={styles.container}>
      <View className={styles.header} onClick={() => setExpanded(!expanded)}>
        <View className={styles.headerLeft}>
          <Text className={styles.name}>{material.name}</Text>
          {material.required && <Text className={styles.required}>必填</Text>}
        </View>
        <View className={styles.headerRight}>
          <View
            className={classnames(styles.statusBadge, styles[material.status])}
            onClick={(e) => {
              e.stopPropagation();
              const next: Record<string, 'pending' | 'done' | 'missing'> = {
                pending: 'done',
                done: 'missing',
                missing: 'pending',
              };
              onStatusChange(material.id, next[material.status]);
            }}
          >
            <Text className={styles.statusText}>{statusLabels[material.status]}</Text>
          </View>
          <Text className={classnames(styles.expandIcon, { [styles.rotated]: expanded })}>▼</Text>
        </View>
      </View>

      {material.warnings.length > 0 && (
        <View className={styles.warnings}>
          {material.warnings.map((w, i) => (
            <View key={i} className={styles.warningItem}>
              <Text className={styles.warningIcon}>⚠️</Text>
              <Text className={styles.warningText}>{w}</Text>
            </View>
          ))}
        </View>
      )}

      {expanded && (
        <View className={styles.detail}>
          <Text className={styles.description}>{material.description}</Text>
          <View className={styles.tipBox}>
            <Text className={styles.tipIcon}>💡</Text>
            <Text className={styles.tipText}>{material.tip}</Text>
          </View>
          <View className={styles.exampleSection}>
            <Text className={styles.exampleLabel}>示例图片（点击可查看大图）：</Text>
            <Image
              className={styles.exampleImage}
              src={material.exampleImage}
              mode="aspectFill"
              onError={() => console.error('[MaterialItem] Image load error:', material.id)}
            />
          </View>
          <View className={styles.voiceButton} onClick={() => onVoiceTip(material.tip)}>
            <Text className={styles.voiceIcon}>🔊</Text>
            <Text className={styles.voiceText}>听一听说明</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default MaterialItem;
