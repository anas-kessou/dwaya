import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { BellRing, ShieldCheck, Clock } from 'lucide-react-native';
import notifee from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

export default function OnboardingScreen({ navigation }) {
  
  const handleAllowPermissions = async () => {
    // 1. Request iOS/Android 13+ Notification Permissions
    const settings = await notifee.requestPermission();

    // 2. Mark onboarding as complete in local storage
    await AsyncStorage.setItem('has_seen_onboarding', 'true');

    // 3. Navigate to Main Dashboard
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white justify-between px-6 pb-10 pt-10`}>
      <View style={tw`items-center mt-10`}>
        <View style={tw`w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-6`}>
          <BellRing color="#3B82F6" size={48} />
        </View>
        <Text style={tw`text-3xl font-black text-gray-900 text-center mb-3`}>Never Miss a Dose</Text>
        <Text style={tw`text-base text-gray-500 text-center mb-10 px-4`}>
          To keep you on track, Dwaya needs permission to run background alarms and wake your phone.
        </Text>

        <View style={tw`w-full space-y-6`}>
          <View style={tw`flex-row items-center mb-6`}>
            <View style={tw`w-12 h-12 bg-green-50 rounded-full items-center justify-center mr-4`}>
              <Clock color="#10B981" size={24} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`font-bold text-gray-900 text-lg`}>Exact Alarms</Text>
              <Text style={tw`text-gray-500 text-sm`}>Ensures your reminders fire at the exact minute, even if the app is closed.</Text>
            </View>
          </View>

          <View style={tw`flex-row items-center`}>
            <View style={tw`w-12 h-12 bg-blue-50 rounded-full items-center justify-center mr-4`}>
              <ShieldCheck color="#3B82F6" size={24} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`font-bold text-gray-900 text-lg`}>Full-Screen Alerts</Text>
              <Text style={tw`text-gray-500 text-sm`}>Allows the alarm to bypass your lock screen so you see it immediately.</Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={tw`w-full h-14 bg-blue-600 rounded-xl items-center justify-center shadow-lg shadow-blue-300`}
        onPress={handleAllowPermissions}
      >
        <Text style={tw`text-white font-bold text-lg`}>Allow Permissions</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
