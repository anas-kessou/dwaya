import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import notifee, { EventType } from '@notifee/react-native';
import Toast from 'react-native-toast-message'; // NEW
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Listen to background actions (e.g., User presses "Take Now" on lock screen)
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'take') {
    // Here we would save to Firebase in the background!
    await notifee.cancelNotification(detail.notification.id);
  }
});

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
      {/* Toast must be the absolute last component inside the provider */}
      <Toast /> 
    </SafeAreaProvider>
  );
}
