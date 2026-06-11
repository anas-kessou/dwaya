import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Vibration, StyleSheet } from 'react-native';
import { CheckCircle2, Clock, X, Utensils, Volume2 } from 'lucide-react-native';
import { db } from '../../config/firebase';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { scheduleMedicationAlarm } from '../../services/alarmService';
import notifee from '@notifee/react-native';
import tw from 'twrnc';

const AUTO_DISMISS_SECS = 90;

export default function AlarmModalScreen({ route, navigation }) {
  const { user } = useAuth();
  // We get the medication data passed from the Notifee event or Dashboard
  const { medication, scheduledTime } = route.params;

  const [countdown, setCountdown] = useState(AUTO_DISMISS_SECS);
  const [withFood, setWithFood] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Start continuous native vibration pattern
    Vibration.vibrate([500, 1000, 500, 1000], true);

    // 2. Start pulsing animation for the Pill icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true })
      ])
    ).start();

    // 3. Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleMissed();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      Vibration.cancel(); // Stop vibrating when screen closes
    };
  }, []);

  const handleTake = async () => {
    Vibration.cancel();
    try {
      // 1. Log the Dose
      await addDoc(collection(db, 'doseLogs'), {
        user_id: user.uid,
        medication_id: medication.id,
        medication_name: medication.name,
        scheduled_time: scheduledTime,
        taken_time: new Date().toISOString(),
        status: 'taken',
        with_food: withFood,
        dose_date: new Date().toISOString().split('T')[0]
      });

      // 2. Inventory Deduction Logic
      const medRef = doc(db, 'medications', medication.id);
      const medSnap = await getDoc(medRef);
      
      if (medSnap.exists()) {
        const medData = medSnap.data();
        if (typeof medData.inventory_count === 'number' && medData.inventory_count > 0) {
          const newCount = medData.inventory_count - 1;
          
          // Update Firebase
          await updateDoc(medRef, { inventory_count: newCount });

          // Check if refill reminder is triggered
          if (typeof medData.refill_reminder === 'number' && newCount <= medData.refill_reminder) {
            // Send a local standard push notification (Not a full screen alarm)
            await notifee.displayNotification({
              title: '⚠️ Prescription Refill Needed',
              body: `You only have ${newCount} ${medData.form}s of ${medData.name} left. Time to call the pharmacy!`,
              android: { channelId: 'default' }, // Assumes a standard default channel exists
            });
          }
        }
      }

      navigation.goBack();
    } catch (err) {
      console.error("Failed to log dose or update inventory", err);
    }
  };

  const handleSnooze = async () => {
    Vibration.cancel();
    // Calculate 10 minutes from now for snooze
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10);
    const snoozeTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    await scheduleMedicationAlarm(medication, snoozeTime);
    navigation.goBack();
  };

  const handleMissed = async () => {
    Vibration.cancel();
    try {
      await addDoc(collection(db, 'doseLogs'), {
        user_id: user.uid,
        medication_id: medication.id,
        medication_name: medication.name,
        scheduled_time: scheduledTime,
        status: 'missed',
        dose_date: new Date().toISOString().split('T')[0]
      });
      navigation.goBack();
    } catch (err) {}
  };

  return (
    <View style={tw`flex-1 bg-blue-500`}>
      {/* Progress Bar */}
      <View style={tw`absolute top-0 left-0 right-0 h-2 bg-white/20`}>
        <View style={[tw`h-full bg-white`, { width: `${(countdown / AUTO_DISMISS_SECS) * 100}%` }]} />
      </View>

      {/* Header */}
      <View style={tw`flex-row items-center justify-between px-5 pt-12 pb-2`}>
        <Text style={tw`text-white/70 text-sm font-bold`}>{scheduledTime}</Text>
        <View style={tw`flex-row items-center`}>
          <Volume2 color="rgba(255,255,255,0.7)" size={16} />
          <Text style={tw`text-white/70 ml-1 mr-4`}>{countdown}s</Text>
          <TouchableOpacity onPress={() => { Vibration.cancel(); navigation.goBack(); }}>
            <X color="white" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={tw`flex-1 items-center justify-center px-6`}>
        <Animated.View style={[tw`w-28 h-28 rounded-full bg-white/20 items-center justify-center mb-6`, { transform: [{ scale: pulseAnim }] }]}>
          <View style={tw`w-20 h-20 rounded-full bg-white/30 items-center justify-center`}>
            <Text style={tw`text-5xl`}>💊</Text>
          </View>
        </Animated.View>

        <Text style={tw`text-xs font-semibold text-white/70 uppercase tracking-widest mb-2`}>Time to take</Text>
        <Text style={tw`text-4xl font-black text-white text-center mb-1`}>{medication.name}</Text>
        <Text style={tw`text-xl font-medium text-white/90 mb-4`}>{medication.strength} • {medication.form}</Text>

        <TouchableOpacity 
          onPress={() => setWithFood(!withFood)}
          style={tw`flex-row items-center px-4 py-2 rounded-full border border-white/40 mb-8 ${withFood ? 'bg-white/20' : ''}`}
        >
          <Utensils color="white" size={16} />
          <Text style={tw`text-white text-sm ml-2`}>{withFood ? 'Taking with food ✓' : 'Taking with food?'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={tw`w-full max-w-xs h-16 bg-white rounded-2xl items-center justify-center flex-row mb-4 shadow-xl`}
          onPress={handleTake}
        >
          <CheckCircle2 color="#3B82F6" size={24} />
          <Text style={tw`text-blue-600 text-xl font-bold ml-2`}>Take Now</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={tw`flex-row items-center py-2 px-6 rounded-xl bg-white/10`}
          onPress={handleSnooze}
        >
          <Clock color="white" size={16} />
          <Text style={tw`text-white ml-2 font-medium`}>Snooze 10 min</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
