import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Mail, Lock } from 'lucide-react-native';
import { auth } from '../../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import tw from 'twrnc';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // We don't need to navigate! AppNavigator will auto-switch to Dashboard.
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={tw`flex-1 bg-white justify-center px-6`}
    >
      <View style={tw`mb-8`}>
        <Text style={tw`text-3xl font-bold text-gray-900 mb-2`}>Welcome back</Text>
        <Text style={tw`text-gray-500`}>Log in to your account</Text>
      </View>

      {error ? (
        <View style={tw`mb-4 p-3 rounded-lg bg-red-100`}>
          <Text style={tw`text-red-600 text-sm`}>{error}</Text>
        </View>
      ) : null}

      <View style={tw`space-y-4`}>
        <View style={tw`mb-4`}>
          <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Email</Text>
          <View style={tw`flex-row items-center border border-gray-300 rounded-xl px-3 h-12`}>
            <Mail color="#9CA3AF" size={20} />
            <TextInput
              style={tw`flex-1 ml-2 text-base text-gray-900`}
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        <View style={tw`mb-6`}>
          <Text style={tw`text-sm font-medium text-gray-700 mb-1`}>Password</Text>
          <View style={tw`flex-row items-center border border-gray-300 rounded-xl px-3 h-12`}>
            <Lock color="#9CA3AF" size={20} />
            <TextInput
              style={tw`flex-1 ml-2 text-base text-gray-900`}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity 
          style={tw`w-full h-12 bg-blue-600 rounded-xl items-center justify-center flex-row`}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={tw`text-white font-semibold text-lg`}>Log in</Text>
          )}
        </TouchableOpacity>

        <View style={tw`flex-row justify-center mt-6`}>
          <Text style={tw`text-gray-600`}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={tw`text-blue-600 font-bold`}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
