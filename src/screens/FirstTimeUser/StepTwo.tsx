import { Text, View, Button } from '../../components/Themed';
import { TextInput } from "react-native";
import * as React from "react";
import { updateProfile } from 'firebase/auth'; 
import { useRoute, RouteProp } from "@react-navigation/native";
import axios from 'axios';

interface StepTwoProps {
  navigation: any;
}

type StepTwoRouteParams = {
  StepTwo: {
    user: any;
    idToken: string; 
    localId: string;  
  };
};

export function StepTwoScreen({ navigation }: StepTwoProps) {
  const [firstName, setFirstName] = React.useState<string>('');
  const [lastName, setLastName] = React.useState<string>('');
  const route = useRoute<RouteProp<StepTwoRouteParams, 'StepTwo'>>(); 

  const { user, idToken, localId } = route.params || {};  

  const handleGetStarted = async () => {
    const fullName = firstName + " " + lastName;

    try {
      if (firstName.trim() !== "") {
        await updateProfile(user, {
          displayName: fullName, 
        });
      }
      const userData = {
        email: user.email !== undefined ? user.email : null,  
        phoneNumber: user.phoneNumber !== undefined ? user.phoneNumber : null,
        id: localId, 
        username: firstName + "_" + lastName,
        firstName: firstName,
        lastName: lastName,
      };
      console.log('User data: ', userData)

      const synqApiUrl = `https://synq.azurewebsites.net/api/users/${localId}`;
      
      await axios.put(synqApiUrl, userData, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      navigation.navigate("StepThree");
    } catch (error) {
      console.error("Error updating profile or sending API request:", error);
    }
  };

  return (
    <View className="flex-1 justify-center">
      <View className="mb-20">
        <Text className="text-white text-2xl ml-7 mt-24">
          What's your name?
        </Text>
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
