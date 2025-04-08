import { Text, View, Button } from '../../components/Themed';
import { TextInput } from "react-native"
import * as React from "react";
import { updateProfile } from 'firebase/auth'; 
import { useRoute, RouteProp } from "@react-navigation/native";

interface StepTwoProps {
  navigation: any;
}
type StepTwoRouteParams = {
  StepTwo: {
    user: any; 
  };
};

export function StepTwoScreen({ navigation }: StepTwoProps) {
  const [firstName, setFirstName] = React.useState<string>('');
  const [lastName, setLastName] = React.useState<string>('');
  const route = useRoute<RouteProp<StepTwoRouteParams, 'StepTwo'>>(); 

  const { user } = route.params || {}; 

  const handleGetStarted = async () => {
    var fullName = firstName + " " + lastName

    try {
      if (firstName.trim() !== "") {
        await updateProfile(user, {
          displayName: fullName, 
        });
      }
      // navigation.replace("Returning");
      //navigation.navigate("GettingStarted");
      navigation.navigate("StepThree");



    } catch (error) {
      console.error("Error updating display name:", error);
    }
  };

  return (
    <View className="flex-1 justify-center">
      <View className='mb-20'>
        <Text style={{ color: "white", fontSize: 32, fontFamily: 'JosefinSans_400Regular', width: 300, marginLeft: 30, marginTop: 90 }}>
          What's your name?
        </Text>
        <TextInput
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
          className="border-b-4 border-synq-accent-light"
          style={{
            color: "white",
            marginLeft: 30,
            marginTop: 20,
            width: 300,
            paddingVertical: 10,
            paddingHorizontal: 15,
            backgroundColor: '#333',
            borderRadius: 5
          }} />
           <TextInput
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name (optional)"
          className="border-b-4 border-synq-accent-light"
          style={{
            color: "white",
            marginLeft: 30,
            marginTop: 20,
            width: 300,
            paddingVertical: 10,
            paddingHorizontal: 15,
            backgroundColor: '#333',
            borderRadius: 5
          }} />
      </View>
      <Button text="Get Started" className="bg-[#7DFFA6]" onPress={handleGetStarted} />
    </View>
  );
}
