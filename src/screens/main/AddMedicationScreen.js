import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ChevronLeft, Plus, Clock, X, Package, Calendar } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { scheduleMedicationAlarm } from '../../services/alarmService';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

const FORMS = ['Tablet', 'Capsule', 'Liquid', 'Injection', 'Patch', 'Inhaler'];
const FREQUENCIES = ['Daily', 'As needed (PRN)', 'Specific Days'];

export default function AddMedicationScreen({ navigation }) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [strength, setStrength] = useState('');
  const [form, setForm] = useState('Tablet');
  const [frequency, setFrequency] = useState('Daily');
  
  // Multiple Times Array
  const [times, setTimes] = useState(['08:00']);
  const [showTimePicker, setShowTimePicker] = useState({ show: false, index: 0 });

  // Inventory
  const [inventoryCount, setInventoryCount] = useState('');
  const [refillReminder, setRefillReminder] = useState('10'); // Default alert at 10 pills
  
  // Time Picker Handlers
  const onTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowTimePicker({ show: false, index: 0 });
    }
    if (selectedDate) {
      const hours = String(selectedDate.getHours()).padStart(2, '0');
      const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
      const newTimes = [...times];
      newTimes[showTimePicker.index] = `${hours}:${minutes}`;
      setTimes(newTimes);
    }
  };

  const addTime = () => setTimes([...times, '12:00']);
  const removeTime = (idx) => setTimes(times.filter((_, i) => i !== idx));

  async function handleSave() {
    // 1. FORM VALIDATION
    if (name.trim().length < 2) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Medication name must be at least 2 characters.' });
      ReactNativeHapticFeedback.trigger("notificationError");
      return;
    }

    if (inventoryCount && (isNaN(inventoryCount) || parseInt(inventoryCount, 10) < 0)) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Inventory must be a valid positive number.' });
      ReactNativeHapticFeedback.trigger("notificationError");
      return;
    }

    setSaving(true);
    
    try {
      const payload = {
        user_id: user.uid,
        name: name.trim(),
        strength: strength.trim(),
        form,
        frequency,
        times: frequency === 'As needed (PRN)' ? [] : times,
        inventory_count: inventoryCount ? parseInt(inventoryCount, 10) : null,
        refill_reminder: refillReminder ? parseInt(refillReminder, 10) : null,
        is_active: true,
        created_at: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'medications'), payload);
      const savedMed = { id: docRef.id, ...payload };
      
      if (frequency !== 'As needed (PRN)') {
        for (const t of times) {
          await scheduleMedicationAlarm(savedMed, t);
        }
      }
      
      // 2. SUCCESS FEEDBACK
      ReactNativeHapticFeedback.trigger("notificationSuccess", { enableVibrateFallback: true });
      Toast.show({
        type: 'success',
        text1: 'Medication Saved! 💊',
        text2: `${name} has been added to your schedule.`,
        visibilityTime: 4000,
      });

      setSaving(false);
      navigation.goBack();
    } catch (err) {
      console.error('Error saving:', err);
      Toast.show({ type: 'error', text1: 'Network Error', text2: 'Could not save medication. Please try again.' });
      ReactNativeHapticFeedback.trigger("notificationError");
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        {/* Header */}
        <View style={tw`flex-row items-center px-5 pt-4 pb-4 border-b border-gray-100`}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-3`}>
            <ChevronLeft color="#000" size={28} />
          </TouchableOpacity>
          <Text style={tw`text-xl font-bold text-gray-900`}>Add Medication</Text>
        </View>

        <ScrollView contentContainerStyle={tw`p-5 pb-10`}>
          {/* Core Details */}
          <View style={tw`mb-6`}>
            <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>Medication Name *</Text>
            <TextInput style={tw`bg-gray-50 border border-gray-200 rounded-xl px-4 h-12 text-gray-900`} placeholder="e.g., Metformin" value={name} onChangeText={setName} />
          </View>

          <View style={tw`flex-row gap-4 mb-6`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>Strength</Text>
              <TextInput style={tw`bg-gray-50 border border-gray-200 rounded-xl px-4 h-12 text-gray-900`} placeholder="500mg" value={strength} onChangeText={setStrength} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>Form</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`flex-row`}>
                {FORMS.map(f => (
                  <TouchableOpacity key={f} onPress={() => setForm(f)} style={tw`px-3 py-2 mr-2 rounded-lg border ${form === f ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}>
                    <Text style={tw`text-sm ${form === f ? 'text-white font-bold' : 'text-gray-700'}`}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Schedule & Times */}
          <View style={tw`p-4 bg-blue-50 rounded-2xl mb-6`}>
            <Text style={tw`text-base font-bold text-gray-900 mb-3 flex-row items-center`}>
              <Calendar color="#3B82F6" size={18} /> Schedule
            </Text>
            
            <View style={tw`flex-row flex-wrap gap-2 mb-4`}>
              {FREQUENCIES.map(freq => (
                <TouchableOpacity key={freq} onPress={() => setFrequency(freq)} style={tw`px-3 py-2 rounded-full border ${frequency === freq ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                  <Text style={tw`text-xs ${frequency === freq ? 'text-white font-bold' : 'text-gray-700'}`}>{freq}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {frequency !== 'As needed (PRN)' && (
              <View>
                <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>Reminder Times</Text>
                {times.map((t, idx) => (
                  <View key={idx} style={tw`flex-row items-center mb-2`}>
                    <TouchableOpacity onPress={() => setShowTimePicker({ show: true, index: idx })} style={tw`flex-1 flex-row items-center bg-white border border-gray-200 rounded-xl px-4 h-12`}>
                      <Clock color="#9CA3AF" size={18} />
                      <Text style={tw`ml-2 text-base text-gray-900 font-medium`}>{t}</Text>
                    </TouchableOpacity>
                    {times.length > 1 && (
                      <TouchableOpacity onPress={() => removeTime(idx)} style={tw`ml-3 p-2 bg-red-100 rounded-full`}>
                        <X color="#EF4444" size={16} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity onPress={addTime} style={tw`flex-row items-center mt-2 py-2`}>
                  <Plus color="#3B82F6" size={18} />
                  <Text style={tw`text-blue-600 font-bold ml-1`}>Add another time</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Inventory Tracking */}
          <View style={tw`p-4 bg-gray-50 rounded-2xl mb-8 border border-gray-200`}>
            <Text style={tw`text-base font-bold text-gray-900 mb-3 flex-row items-center`}>
              <Package color="#10B981" size={18} /> Inventory Tracking
            </Text>
            <View style={tw`flex-row gap-4`}>
              <View style={tw`flex-1`}>
                <Text style={tw`text-xs text-gray-500 mb-1`}>Current Stock (Pills)</Text>
                <TextInput style={tw`bg-white border border-gray-200 rounded-xl px-4 h-10 text-gray-900`} placeholder="e.g. 30" value={inventoryCount} onChangeText={setInventoryCount} keyboardType="numeric" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-xs text-gray-500 mb-1`}>Alert me when at</Text>
                <TextInput style={tw`bg-white border border-gray-200 rounded-xl px-4 h-10 text-gray-900`} placeholder="e.g. 10" value={refillReminder} onChangeText={setRefillReminder} keyboardType="numeric" />
              </View>
            </View>
          </View>

          {showTimePicker.show && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onTimeChange}
            />
          )}

          {/* Save Button */}
          <TouchableOpacity style={tw`w-full h-14 rounded-xl flex-row items-center justify-center ${name ? 'bg-blue-600' : 'bg-gray-300'}`} onPress={handleSave} disabled={saving || !name}>
            {saving ? <ActivityIndicator color="white" /> : <Text style={tw`text-white font-bold text-lg`}>Save Medication</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
