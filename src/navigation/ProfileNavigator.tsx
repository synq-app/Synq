import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ProfileScreen } from '../screens/Profile';
import { Settings } from '../screens/Settings';
import { Explore } from '../screens/Explore'; // Import the Explore component

const ProfileStack = createNativeStackNavigator();

export function ProfileNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={Settings} />
      <ProfileStack.Screen name="Explore" component={Explore} /> 
    </ProfileStack.Navigator>
  );
}