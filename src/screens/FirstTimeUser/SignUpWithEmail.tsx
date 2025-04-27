import React, { useRef, useState } from 'react';
import { auth, createUserWithEmailAndPassword } from "./firebaseConfig";
import { View, Text, TouchableOpacity, Alert, TextInput, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Button } from "../../components/Themed";
import axios from 'axios';
import { ENV_VARS } from "../../../config";

interface AuthProps {
    navigation: any;
}

export const SignUpWithEmail = ({ navigation }: AuthProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleEmailSignUp = async () => {
        if (password !== confirmPassword) {
            Alert.alert("Passwords do not match");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const response = await axios.post(
                ENV_VARS.TOKEN_URL,
                {
                    email: email,
                    password: password,
                    returnSecureToken: true
                }
            );

            const { idToken, localId } = response.data;
            navigation.navigate("StepTwo", { user: userCredential.user, idToken, localId });

        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View className="flex-1 justify-center">
                <View className="mb-20">
                    <Text className="text-white text-3xl font-sans ml-7 mt-20 w-72">
                        What's your email?
                    </Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter email"
                        className="text-white ml-7 mt-5 w-80 py-3 px-4 bg-gray-800 rounded"
                    />
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter password"
                        secureTextEntry
                        className="text-white ml-7 mt-5 w-80 py-3 px-4 bg-gray-800 rounded"
                    />
                        <TextInput
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm password"
                            secureTextEntry
                            className="text-white ml-7 mt-5 w-80 py-3 px-4 bg-gray-800 rounded"
                        />
                    <TouchableOpacity onPress={handleEmailSignUp} className="mt-14">
                        <Button text="Create Account" onPress={handleEmailSignUp} className="bg-[#7DFFA6]" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};
