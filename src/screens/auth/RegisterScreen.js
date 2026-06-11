import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Mail, Lock, User as UserIcon, ChevronLeft } from 'lucide-react-native';
import { auth, db } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import tw from 'twrnc';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !name) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Save their profile data in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        full_name: name,
        email: email,
        created_at: new Date().toISOString()
      });
      
      // AppNavigator will auto-switch to Dashboard!
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1 bg-white justify-center px-6`}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={tw`absolute top-12 left-6 z-10`}>
        <ChevronLeft color="#000" size={32} />
      </TouchableOpacity>

      <View style={tw`mb-8 mt-12`}>
        <Text style={tw`text-3xl font-bold text-gray-900 mb-2`}>Create Account</Text>
        <Text style={tw`text-gray-500`}>Join Dwaya to manage your health</Text>
      </View>

      {error ? (
        <View style={tw`mb-4 p-3 rounded-lg bg-red-100`}>
          <Text style={tw`text-red-600 text-sm`}>{error}</Text>
        </View>
      ) : null}

      <View style={tw`space-y-4`}>
        <View style={tw`mb-4`}>
          <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Full Name</Text>
          <View style={tw`flex-row items-center border border-gray-300 rounded-xl px-3 h-12`}>
            <UserIcon color="#9CA3AF" size={20} />
            <TextInput style={tw`flex-1 ml-2 text-base text-gray-900`} placeholder="John Doe" value={name} onChangeText={setName} />
          </View>
        </View>

        <View style={tw`mb-4`}>
          <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Email</Text>
          <View style={tw`flex-row items-center border border-gray-300 rounded-xl px-3 h-12`}>
            <Mail color="#9CA3AF" size={20} />
            <TextInput style={tw`flex-1 ml-2 text-base text-gray-900`} placeholder="you@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          </View>
        </View>

        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Password</Text>
          <View style={tw`flex-row items-center border border-gray-300 rounded-xl px-3 h-12`}>
            <Lock color="#9CA3AF" size={20} />
            <TextInput style={tw`flex-1 ml-2 text-base text-gray-900`} placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
          </View>
        </View>

        <TouchableOpacity style={tw`w-full h-12 bg-blue-600 rounded-xl items-center justify-center flex-row`} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={tw`text-white font-semibold text-lg`}>Sign Up</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
