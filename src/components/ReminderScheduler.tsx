import { useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, triggerReminderAlarm } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export function ReminderScheduler() {
  const { user } = useAuth();
  const medicationsRef = useRef<any[]>([]);
  const triggeredTodayRef = useRef<Set<string>>(new Set());

  // 1. Sync medications
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'medications'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      medicationsRef.current = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Check for reminders every minute
  useEffect(() => {
    const checkReminders = async () => {
      if (!user || medicationsRef.current.length === 0) return;

      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // "HH:mm"
      const todayDate = now.toISOString().split('T')[0]; // "YYYY-MM-DD"

      // Reset triggered set if it's a new day (optional, but good for long sessions)
      // For simplicity, we just check if it's already triggered in this session
      
      for (const med of medicationsRef.current) {
        if (med.reminderTime === currentTime) {
          const triggerKey = `${med.id}_${todayDate}_${med.reminderTime}`;
          
          if (!triggeredTodayRef.current.has(triggerKey)) {
            triggeredTodayRef.current.add(triggerKey);
            console.log(`Triggering reminder for ${med.name} at ${currentTime}`);
            
            try {
              // Create reminder doc in Firestore
              const reminderDoc = await addDoc(collection(db, 'reminders'), {
                userId: user.uid,
                medicationId: med.id,
                medicineName: med.name,
                dosage: med.dosage,
                quantity: med.quantity,
                layer: med.layer,
                scheduledTime: med.reminderTime,
                status: 'ringing',
                createdAt: serverTimestamp(),
              });

              // Trigger RTDB alarm for the second phone
              await triggerReminderAlarm({
                id: reminderDoc.id,
                ...med,
                medicineName: med.name
              });
            } catch (error) {
              console.error('Error creating reminder:', error);
            }
          }
        }
      }
    };

    const interval = setInterval(checkReminders, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [user]);

  return null; // Background component
}
