import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView } from 'react-native';
import Icon from '../components/Icon';
import Constants from 'expo-constants';

export default function HistoryModal({ 
  isVisible, 
  onClose, 
  recentHistory, 
  savedHistory, 
  onSaveEntry, 
  onDeleteEntry,
  formatSessionTime
}) {
  const renderItem = (item, isSaved) => (
    <View key={`${isSaved ? 's' : 'r'}-${item.id}`} style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <Text style={styles.dateText}>{new Date(item.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</Text>
        {isSaved && (
          <TouchableOpacity onPress={() => onDeleteEntry(item.id)} style={styles.deleteIcon}>
            <Icon name="trash_alt" size={16} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.historyBody}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={styles.statValue}>{formatSessionTime(item.totalSessionTime)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Work Rounds</Text>
          <Text style={styles.statValue}>{item.workRoundsCompleted}</Text>
        </View>
      </View>
      {!isSaved && (
        <TouchableOpacity style={styles.saveButton} onPress={() => onSaveEntry(item)}>
          <Text style={styles.saveButtonText}>SAVE SESSION</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Session History</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="times" size={24} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          
          <Text style={styles.sectionHeader}>RECENT SESSIONS (UNSAVED)</Text>
          {recentHistory.length === 0 ? (
            <Text style={styles.emptyText}>No recent sessions. Start the timer to log history!</Text>
          ) : (
            recentHistory.map(item => renderItem(item, false))
          )}

          <Text style={[styles.sectionHeader, { marginTop: 40 }]}>SAVED HISTORY</Text>
          {savedHistory.length === 0 ? (
            <Text style={styles.emptyText}>No saved sessions yet.</Text>
          ) : (
            savedHistory.map(item => renderItem(item, true))
          )}

        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: '#0b0f1a',
    paddingTop: Constants.statusBarHeight + 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#e2e8f0',
    letterSpacing: 1,
  },
  closeButton: {
    padding: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
    letterSpacing: 2,
    marginBottom: 16,
  },
  emptyText: {
    color: '#475569',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  historyCard: {
    backgroundColor: '#1c2230',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2d3748',
  },
  dateText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteIcon: {
    padding: 5,
  },
  historyBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 1,
  },
  statValue: {
    color: '#e2e8f0',
    fontSize: 28,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  }
});
