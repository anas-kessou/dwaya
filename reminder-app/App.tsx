import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, Modal } from 'react-native';
import { ref, onValue, set } from 'firebase/database';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, rtdb } from './src/config/firebase';
import { alarmService } from './src/services/alarmService';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

export default function App() {
  const [alarmActive, setAlarmActive] = useState(false);
  const [alarmData, setAlarmData] = useState<any>(null);

  // 1. Listen for alarms from Firebase RTDB
  useEffect(() => {
    const alarmRef = ref(rtdb, 'alarm');
    const unsubscribe = onValue(alarmRef, (snapshot) => {
      const val = snapshot.val();
      if (val && val.status === true) {
        setAlarmActive(true);
        setAlarmData(val.data);
        alarmService.start();
        activateKeepAwakeAsync();
      } else {
        setAlarmActive(false);
        setAlarmData(null);
        alarmService.stop();
        deactivateKeepAwake();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleTaken = async () => {
    if (!alarmData?.reminderId) return;

    try {
      // 1. Update Firestore reminder status
      const reminderRef = doc(db, 'reminders', alarmData.reminderId);
      await updateDoc(reminderRef, {
        status: 'taken',
        dismissedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. Stop alarm in RTDB (this will trigger the effect to stop local alarm)
      await set(ref(rtdb, 'alarm/status'), false);
      
      console.log('Reminder marked as TAKEN');
    } catch (error) {
      console.error('Error marking as taken:', error);
    }
  };

  const handleSnooze = async () => {
    // For now, just stop the alarm locally and in RTDB
    // A real snooze would schedule a new alarm doc or use a timeout
    await set(ref(rtdb, 'alarm/status'), false);
    alert('Snooze pressed (5 min simulation)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.content}>
        <Text style={styles.title}>DWAYA</Text>
        <Text style={styles.subtitle}>Dispositif de Rappel Dédié</Text>
        
        <View style={styles.statusBox}>
          <View style={[styles.statusIndicator, { backgroundColor: alarmActive ? '#ff4b4b' : '#4caf50' }]} />
          <Text style={styles.statusText}>
            {alarmActive ? 'ALARME ACTIVE' : 'En attente de rappels...'}
          </Text>
        </View>

        {/* Dummy graphics to look premium */}
        <View style={styles.graphicContainer}>
           <View style={styles.circle} />
        </View>
      </View>

      {/* Full Screen Alarm Modal */}
      <Modal visible={alarmActive} animationType="slide" transparent={false}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: '#fff' }]}>
          <View style={styles.alarmHeader}>
            <Text style={styles.alarmAppName}>DWAYA REMINDER</Text>
            <View style={styles.pulseContainer}>
               <View style={styles.pulse} />
            </View>
          </View>

          <View style={styles.medicineCard}>
            <Text style={styles.medLabel}>Médicament à prendre :</Text>
            <Text style={styles.medName}>{alarmData?.medicineName || 'Chargement...'}</Text>
            <Text style={styles.medDosage}>{alarmData?.dosage} • {alarmData?.quantity} comprimé(s)</Text>
            <View style={styles.layerBadge}>
               <Text style={styles.layerText}>{alarmData?.layer?.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.takenButton} onPress={handleTaken}>
              <Text style={styles.buttonText}>J'AI PRIS</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.snoozeButton} onPress={handleSnooze}>
              <Text style={styles.snoozeText}>SNOOZE</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  graphicContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#eee',
    position: 'absolute',
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
  },
  alarmHeader: {
    alignItems: 'center',
  },
  alarmAppName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ff4b4b',
    letterSpacing: 3,
  },
  pulseContainer: {
    marginTop: 20,
  },
  pulse: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff4b4b22',
    borderWidth: 2,
    borderColor: '#ff4b4b',
  },
  medicineCard: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  medLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  medName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  medDosage: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  layerBadge: {
    marginTop: 20,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 10,
  },
  layerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#444',
  },
  actionContainer: {
    width: '100%',
    gap: 15,
  },
  takenButton: {
    backgroundColor: '#4caf50',
    width: '100%',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  snoozeButton: {
    backgroundColor: '#f8f9fa',
    width: '100%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  snoozeText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
