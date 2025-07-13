import React, { useState } from 'react';
import { Text, View, TextInput } from 'react-native';
import { Button } from '../../components/Themed';
import { useRoute, RouteProp } from '@react-navigation/native';
import { updateProfile } from 'firebase/auth';
import axios from 'axios';
import { auth } from './firebaseConfig';

type StepTwoRouteParams = {
  StepTwo: {
    user: any;
    idToken: string; 
    localId: string; 
  };
};

interface StepTwoProps {
  navigation: any;
}

export function StepTwoScreen({ navigation }: StepTwoProps) {
  const [firstName, setFirstName] = React.useState<string>('');
  const [lastName, setLastName] = React.useState<string>('');
  const route = useRoute<RouteProp<StepTwoRouteParams, 'StepTwo'>>(); 

 const { user, idToken, localId } = route.params || {};  

  const handleGetStarted = async () => {
    const fullName = firstName + (lastName ? ` ${lastName}` : '');

    try {
      if (auth.currentUser && firstName.trim() !== '') {
        await updateProfile(auth.currentUser, { displayName: fullName });
      }

      const userData = {
        email: user.email ? user.email : '',
        phoneNumber: user.phoneNumber ? user.phoneNumber : '111-111-1112',
        id: localId,
        username: `${firstName}${lastName || 'user'}`,
        firstName,
        lastName
      };

      const synqApiUrl = `https://synq.azurewebsites.net/api/users/${localId}`;

      await axios.put(synqApiUrl, userData, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      navigation.navigate('StepThree');
    } catch (error: any) {
      console.error('Error updating profile or syncing with API:', error.message);
    }
  };

  return (
    <View className="flex-1 justify-center">
      <View className="mb-20">
        <Text className="text-white text-2xl ml-7 mt-24">What's your name?</Text>
        <TextInput
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
          className="mt-5 ml-7 w-3/4 py-3 px-4 bg-gray-800 rounded border-b-4 border-synq-accent-light text-white"
        />
        <TextInput
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name (optional)"
          className="mt-5 ml-7 w-3/4 py-3 px-4 bg-gray-800 rounded border-b-4 border-synq-accent-light text-white"
        />
      </View>
      <Button text="Get Started" className="bg-[#7DFFA6]" onPress={handleGetStarted} />
    </View>
  );
}
