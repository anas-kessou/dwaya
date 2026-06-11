import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Plus, Pill, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import notifee from '@notifee/react-native';
import { useAuth } from '../../contexts/AuthContext';
import tw from 'twrnc';

export default function MedicationsScreen({ navigation }) {
  const { user } = useAuth();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Using onSnapshot so the list auto-updates instantly when we add/delete!
    const q = query(collection(db, 'medications'), where('user_id', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMedications(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
      setRefreshing(false);
    });

    return unsubscribe;
  }, [user]);

  const handleDelete = (med) => {
    Alert.alert(
      "Delete Medication",
      `Are you sure you want to remove ${med.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              // 1. Delete from Firebase
              await deleteDoc(doc(db, 'medications', med.id));
              
              // 2. Cancel all Native Alarms for this medication
              if (med.times && med.times.length > 0) {
                for (const time of med.times) {
                  const alarmId = `${med.id}-${time}`;
                  await notifee.cancelNotification(alarmId);
                }
              }
            } catch (err) {
              console.error("Error deleting: ", err);
            }
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  if (loading) {
    return <View style={tw`flex-1 items-center justify-center bg-white`}><ActivityIndicator color="#3B82F6" /></View>;
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <View style={tw`flex-row items-center justify-between px-5 pt-4 pb-4 bg-white border-b border-gray-100`}>
        <Text style={tw`text-2xl font-bold text-gray-900`}>My Medications</Text>
      </View>

      <FlatList
        data={medications}
        contentContainerStyle={tw`p-5 pb-20`}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />}
        ListEmptyComponent={
          <View style={tw`items-center justify-center py-20`}>
            <View style={tw`w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4`}>
              <Pill color="#3B82F6" size={32} />
            </View>
            <Text style={tw`text-lg font-bold text-gray-900 mb-2`}>No medications found</Text>
            <Text style={tw`text-gray-500 text-center mb-6`}>Start by adding your first medication to stay on track.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={tw`bg-white border border-gray-200 rounded-2xl p-4 mb-3 flex-row items-center shadow-sm`}>
            <View style={tw`w-12 h-12 rounded-xl bg-blue-50 items-center justify-center mr-4`}>
              <Pill color="#3B82F6" size={24} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`font-bold text-gray-900 text-lg`}>{item.name}</Text>
              <Text style={tw`text-xs text-gray-500 mt-1`}>{item.strength} • {item.form}</Text>
              <Text style={tw`text-blue-600 font-medium text-xs mt-1`}>Scheduled: {item.times?.[0]}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item)} style={tw`p-2 bg-red-50 rounded-full`}>
              <Trash2 color="#EF4444" size={20} />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={tw`absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-xl`}
        onPress={() => navigation.navigate('AddMedication')}
      >
        <Plus color="white" size={28} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
