import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Plus, ChevronRight, TrendingUp, Pill } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import notifee from '@notifee/react-native';
import tw from 'twrnc';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'medications'), 
      where('user_id', '==', user.uid), 
      where('is_active', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMedications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error("Error loading data:", error);
      setLoading(false);
      setRefreshing(false);
    });

    return unsubscribe;
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    // onSnapshot will handle the update automatically, we just show the spinner temporarily
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleQuickTake = async (med) => {
    ReactNativeHapticFeedback.trigger("selection");
    try {
      // 1. Log the Dose
      await addDoc(collection(db, 'doseLogs'), {
        user_id: user.uid,
        medication_id: med.id,
        medication_name: med.name,
        scheduled_time: med.times?.[0] || 'PRN',
        taken_time: new Date().toISOString(),
        status: 'taken',
        dose_date: new Date().toISOString().split('T')[0]
      });

      // 2. Inventory Deduction Logic
      const medRef = doc(db, 'medications', med.id);
      const snapshot = await getDoc(medRef);
      
      if (snapshot.exists()) {
        const medData = snapshot.data();
        if (typeof medData.inventory_count === 'number' && medData.inventory_count > 0) {
          const newCount = medData.inventory_count - 1;
          await updateDoc(medRef, { inventory_count: newCount });

          if (typeof medData.refill_reminder === 'number' && newCount <= medData.refill_reminder) {
            await notifee.displayNotification({
              title: '⚠️ Prescription Refill Needed',
              body: `You only have ${newCount} ${medData.form}s of ${medData.name} left.`,
              android: { channelId: 'default' },
            });
          }
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Dose Recorded!',
        text2: `You took your ${med.name}.`,
      });
      ReactNativeHapticFeedback.trigger("notificationSuccess");

    } catch (err) {
      console.error("Failed to log quick take", err);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not record dose.' });
    }
  };

  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white`}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const renderHeader = () => (
    <View>
      {/* Header */}
      <View style={tw`px-5 pt-4 pb-4`}>
        <Text style={tw`text-2xl font-bold text-gray-900`}>Hi there,</Text>
        <Text style={tw`text-gray-500`}>Let's check your medications for today</Text>
      </View>

      {/* Overview Card */}
      <View style={tw`mx-5 bg-blue-600 rounded-3xl p-5 mb-5 shadow-lg shadow-blue-200`}>
        <Text style={tw`text-sm font-medium text-blue-100`}>Medication Status</Text>
        <View style={tw`flex-row items-center justify-between`}>
          <View>
            <View style={tw`flex-row items-end`}>
              <Text style={tw`text-4xl font-black text-white mt-1`}>
                {medications.length} 
              </Text>
              <Text style={tw`text-sm text-blue-100 mb-1 ml-2`}>active drugs</Text>
            </View>
          </View>
          {medications.some(m => m.inventory_count <= (m.refill_reminder || 5)) && (
            <View style={tw`bg-white/20 px-3 py-1 rounded-full`}>
              <Text style={tw`text-white font-bold text-xs`}>⚠️ Low Stock</Text>
            </View>
          )}
        </View>
      </View>

      {/* Section Title */}
      <View style={tw`px-5 flex-row items-center justify-between mb-3`}>
        <Text style={tw`text-base font-bold text-gray-900`}>Scheduled Today</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Medications')}>
          <Text style={tw`text-blue-500 font-medium`}>View all</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <FlatList
        data={medications}
        ListHeaderComponent={renderHeader}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />}
        contentContainerStyle={tw`pb-10`}
        ListEmptyComponent={
          <View style={tw`mx-5 items-center py-10 bg-gray-50 rounded-2xl`}>
            <View style={tw`w-14 h-14 bg-blue-100 rounded-full items-center justify-center mb-3`}>
              <Plus color="#3B82F6" size={28} />
            </View>
            <Text style={tw`text-sm font-bold text-gray-900 mb-1`}>No active medications</Text>
            <Text style={tw`text-xs text-gray-500 mb-4 px-10 text-center`}>Add your first medication to get daily reminders.</Text>
            <TouchableOpacity style={tw`bg-blue-600 px-6 py-3 rounded-xl`} onPress={() => navigation.navigate('AddMedication')}>
              <Text style={tw`text-white font-bold`}>Add Now</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={tw`mx-5 bg-white border border-gray-100 rounded-2xl p-4 mb-3 flex-row items-center shadow-sm`}>
            <View style={tw`w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-3`}>
              <Pill color="#3B82F6" size={20} />
            </View>
            <View style={tw`flex-1`}>
              <View style={tw`flex-row items-center`}>
                <Text style={tw`font-bold text-gray-900`}>{item.name}</Text>
                {item.inventory_count <= (item.refill_reminder || 5) && (
                  <View style={tw`ml-2 bg-red-100 px-2 py-0.5 rounded-full`}>
                    <Text style={tw`text-[10px] font-bold text-red-600`}>LOW</Text>
                  </View>
                )}
              </View>
              <Text style={tw`text-xs text-gray-500`}>{item.strength} · {item.times?.[0] || 'As needed'}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => handleQuickTake(item)}
              style={tw`bg-blue-600 px-4 py-2 rounded-full`}
            >
              <Text style={tw`text-white text-xs font-bold`}>Take</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
