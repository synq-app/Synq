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
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 30 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Welcome")}
          style={{ position: "absolute", top: 60, right: 20, zIndex: 3 }}
        >
          <Text style={{ fontSize: 28, color: "white" }}>×</Text>
        </TouchableOpacity>

        <Text style={{ color: "white", fontSize: 32, fontFamily: 'JosefinSans_400Regular', width: 300, marginTop: -20 }}>
          Sign in with email
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          style={{
            color: "white",
            marginTop: 20,
            width: '100%',
            paddingVertical: 10,
            paddingHorizontal: 15,
            backgroundColor: '#333',
            borderRadius: 5
          }}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
          style={{
            color: "white",
            marginTop: 15,
            width: '100%',
            paddingVertical: 10,
            paddingHorizontal: 15,
            backgroundColor: '#333',
            borderRadius: 5
          }}
        />

        <TouchableOpacity onPress={handleEmailLogin} style={{ marginTop: 20 }}>
          <Button text="Sign In" onPress={handleEmailLogin} style={{ backgroundColor: '#7DFFA6' }} />
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SignInWithEmail;
