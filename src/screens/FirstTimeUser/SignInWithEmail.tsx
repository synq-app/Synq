import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, Alert, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from "../../components/Themed";
import { auth } from './firebaseConfig';

const SignInWithEmail = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      navigation.replace("Returning", { user: userCredential.user });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View className="flex-1 justify-center px-8">
        <TouchableOpacity
          onPress={() => navigation.navigate("Welcome")}
          className="absolute top-16 right-5 z-10"
        >
          <Text className="text-white text-3xl">×</Text>
        </TouchableOpacity>
        <Text className="text-white text-3xl font-['JosefinSans_400Regular'] w-72 mt-[-20px]">
          Sign in with email
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          className="text-white mt-5 w-full py-2 px-4 bg-gray-800 rounded-md"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
          className="text-white mt-4 w-full py-2 px-4 bg-gray-800 rounded-md"
        />
        <TouchableOpacity onPress={handleEmailLogin} className="mt-5">
          <Button text="Sign In" onPress={handleEmailLogin} style={{ backgroundColor: '#7DFFA6' }} />
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SignInWithEmail;
