import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { User, Heart, Settings, LogOut, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import tw from 'twrnc';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');

  const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : 'ME';

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      {/* Header */}
      <View style={tw`flex-row items-center px-5 pt-4 pb-6`}>
        <View style={tw`w-16 h-16 rounded-full bg-blue-600 items-center justify-center mr-4 shadow-lg`}>
          <Text style={tw`text-xl font-bold text-white`}>{initials}</Text>
        </View>
        <View>
          <Text style={tw`text-xl font-bold text-gray-900`}>My Profile</Text>
          <Text style={tw`text-sm text-gray-500`}>{user?.email}</Text>
        </View>
      </View>

      {/* Custom Tabs */}
      <View style={tw`px-5 mb-6`}>
        <View style={tw`flex-row bg-gray-100 rounded-xl p-1`}>
          {[
            { id: 'personal', label: 'Personal', icon: User },
            { id: 'medical', label: 'Medical', icon: Heart },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={tw`flex-1 flex-row items-center justify-center py-2 rounded-lg ${isActive ? 'bg-white shadow-sm' : ''}`}
              >
                <Icon color={isActive ? "#3B82F6" : "#6B7280"} size={16} />
                <Text style={tw`ml-2 text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={tw`px-5 pb-10`}>
        
        {/* PERSONAL TAB */}
        {activeTab === 'personal' && (
          <View style={tw`bg-white border border-gray-200 rounded-2xl p-4`}>
            <Text style={tw`text-sm font-bold text-gray-900 mb-4`}>Personal Information</Text>
            <View style={tw`mb-4`}>
              <Text style={tw`text-xs text-gray-500 mb-1`}>Email</Text>
              <View style={tw`bg-gray-50 rounded-xl p-3 border border-gray-100`}>
                <Text style={tw`text-gray-900`}>{user?.email}</Text>
              </View>
            </View>
            <View style={tw`mb-4`}>
              <Text style={tw`text-xs text-gray-500 mb-1`}>User ID</Text>
              <View style={tw`bg-gray-50 rounded-xl p-3 border border-gray-100`}>
                <Text style={tw`text-gray-900 text-xs`}>{user?.uid}</Text>
              </View>
            </View>
          </View>
        )}

        {/* MEDICAL TAB */}
        {activeTab === 'medical' && (
          <View style={tw`bg-white border border-gray-200 rounded-2xl p-4`}>
            <Text style={tw`text-sm font-bold text-gray-900 mb-4`}>Medical Profile</Text>
            <View style={tw`mb-4`}>
              <Text style={tw`text-xs text-gray-500 mb-1`}>Blood Type</Text>
              <TextInput style={tw`border border-gray-200 rounded-xl px-3 h-10`} placeholder="e.g. O+" />
            </View>
            <View style={tw`mb-4`}>
              <Text style={tw`text-xs text-gray-500 mb-1`}>Allergies</Text>
              <TextInput style={tw`border border-gray-200 rounded-xl px-3 h-10`} placeholder="e.g. Penicillin" />
            </View>
            <TouchableOpacity style={tw`bg-blue-600 rounded-xl py-3 mt-2 items-center`}>
              <Text style={tw`text-white font-bold`}>Save Medical Info</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <View style={tw`bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100`}>
            <TouchableOpacity style={tw`flex-row items-center justify-between p-4`}>
              <Text style={tw`text-gray-900 font-medium`}>Privacy & Security</Text>
              <ChevronRight color="#9CA3AF" size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={tw`flex-row items-center justify-between p-4`}>
              <Text style={tw`text-gray-900 font-medium`}>App Notifications</Text>
              <Text style={tw`text-blue-600 text-xs font-bold`}>ON</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={logout}
              style={tw`flex-row items-center justify-between p-4 bg-red-50 rounded-b-2xl`}
            >
              <View style={tw`flex-row items-center`}>
                <LogOut color="#EF4444" size={20} />
                <Text style={tw`text-red-600 font-bold ml-3`}>Sign Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* LOGOUT */}
        <TouchableOpacity 
          onPress={logout}
          style={tw`flex-row items-center justify-center p-4 mt-6 bg-red-50 rounded-2xl border border-red-100 mb-6`}
        >
          <LogOut color="#EF4444" size={20} />
          <Text style={tw`ml-2 text-red-600 font-bold`}>Log Out</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <View style={tw`items-center`}>
          <Text style={tw`text-xs text-gray-400 font-medium`}>Dwaya App v1.0.0</Text>
          <Text style={tw`text-[10px] text-gray-300 mt-1`}>Built with React Native & Firebase</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
