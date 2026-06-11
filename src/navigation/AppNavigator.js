import React, { useEffect, useState } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Pill, Clock, User } from 'lucide-react-native';
import notifee, { EventType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import DashboardScreen from '../screens/main/DashboardScreen';
// ... existing imports ...
import MedicationsScreen from '../screens/main/MedicationsScreen';
import HistoryScreen from '../screens/main/HistoryScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import AddMedicationScreen from '../screens/main/AddMedicationScreen';
import AlarmModalScreen from '../screens/main/AlarmModalScreen';

// We will create these in Phase 2
const MedicationsPlaceholder = () => <></>;

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#3B82F6' }}>
    <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarIcon: ({color}) => <Home color={color} size={24} /> }} />
    <Tab.Screen name="Medications" component={MedicationsScreen} options={{ tabBarIcon: ({color}) => <Pill color={color} size={24} /> }} />
    <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarIcon: ({color}) => <Clock color={color} size={24} /> }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({color}) => <User color={color} size={24} /> }} />
  </Tab.Navigator>
);

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const navigationRef = useNavigationContainerRef();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);

  useEffect(() => {
    // Check if user has completed onboarding before
    const checkOnboarding = async () => {
      const value = await AsyncStorage.getItem('has_seen_onboarding');
      setHasSeenOnboarding(value === 'true');
    };
    checkOnboarding();
  }, [user]); // Re-run when user logs in

  useEffect(() => {
    // Listen for notification taps when app is open or opened from background
    return notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification) {
        // Extract medication info from the notification ID we set earlier
        // Format was: `${medication.id}-${timeString}`
        const idParts = detail.notification.id.split('-');
        
        if (navigationRef.isReady()) {
          navigationRef.navigate('AlarmModal', {
            medication: { id: idParts[0], name: detail.notification.title.replace('💊 Time to take ', '') },
            scheduledTime: idParts[1] || 'Now'
          });
        }
      }
    });
  }, []);

  if (loading || (user && hasSeenOnboarding === null)) return null;

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Logged In Routes
          <>
            {!hasSeenOnboarding && (
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            )}
            
            <Stack.Group>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="AddMedication" component={AddMedicationScreen} />
            </Stack.Group>
            {/* Add this specific Modal Group */}
            <Stack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
              <Stack.Screen name="AlarmModal" component={AlarmModalScreen} />
            </Stack.Group>
          </>
        ) : (
          // Logged Out Routes
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
