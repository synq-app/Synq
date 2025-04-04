import React, { useRef, useState } from 'react';
import { auth, createUserWithEmailAndPassword } from "./firebaseConfig";
import { View, Text, TouchableOpacity, Alert, TextInput, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Button } from "../../components/Themed";

interface AuthProps {
    navigation: any;
}

export const SignUpWithEmail = ({ navigation }: AuthProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLogin, setIsLogin] = useState(false);

    const handleEmailSignUp = async () => {
        if (password !== confirmPassword) {
            Alert.alert("Passwords do not match");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            navigation.navigate("StepTwo", { user: userCredential.user });
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View className="flex-1 justify-center">
                <TouchableOpacity
                    onPress={() => navigation.navigate("Welcome")}
                    style={{ position: "absolute", top: 60, right: 20, zIndex: 3 }}
                >
                    <Text style={{ fontSize: 28, color: "white" }}>×</Text>
                </TouchableOpacity>

                <View className="mb-20">
                    <Text style={{ color: "white", fontSize: 32, fontFamily: 'JosefinSans_400Regular', width: 300, marginLeft: 30, marginTop: 90 }}>
                        What's your email?
                    </Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter email"
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
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter password"
                        secureTextEntry
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
                    {!isLogin && (
                        <TextInput
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm password"
                            secureTextEntry
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
                    )}
                    <TouchableOpacity onPress={handleEmailSignUp} style={{ marginTop: 60 }}>
                        <Button text="Create Account" onPress={handleEmailSignUp} style={{ backgroundColor: '#7DFFA6' }} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};
