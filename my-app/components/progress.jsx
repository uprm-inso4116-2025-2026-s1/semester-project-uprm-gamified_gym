import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressBar } from 'react-native-paper';

export default function PartialFillCard() {
  const currentXP = 65;
  const totalXP = 100;
  const progress = currentXP / totalXP;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Partial Fill</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>partial</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>User has gained some XP</Text>

      <View style={styles.levelRow}>
        <Text style={styles.levelText}>⭐ Level 2</Text>
        <Text style={styles.xpText}>{`${currentXP} / ${totalXP} XP`}</Text>
      </View>

      <ProgressBar progress={progress} color="#3b82f6" style={styles.progressBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  badge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#374151',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 4,
    fontSize: 14,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  levelText: {
    fontSize: 14,
    color: '#111827',
  },
  xpText: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBar: {
    height: 8,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#e5e7eb',
  },
});
