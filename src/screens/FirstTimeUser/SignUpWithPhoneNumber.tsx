import React, { useRef, useState } from 'react';
import { auth, signInWithPhoneNumber, createUserWithEmailAndPassword, app } from "./firebaseConfig";
import { View, Text, TouchableOpacity, Alert, TextInput, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Button } from "../../components/Themed";
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';

interface AuthProps {
    navigation: any;
}

export const SignUpWithPhoneNumber = ({ navigation }: AuthProps) => {
    // const [code, setCode] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [confirm, setConfirm] = useState<any>(null);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isEmailAuth, setIsEmailAuth] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [countryCode, setCountryCode] = useState("+1");
    const recaptchaVerifier = useRef(null);
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const inputs = useRef<(TextInput | null)[]>([]);

    const handleChange = (text: any, index: any) => {
        let newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: any) => {
        if (e.nativeEvent.key === "Backspace" && index > 0 && !code[index]) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handlePhoneNumberChange = (text: string) => {
        const formattedText = text.replace(/\D/g, "").slice(0, 10);
        setPhoneNumber(formattedText);
    };

    const sendVerificationCode = async () => {
        if (!recaptchaVerifier.current) {
            Alert.alert("Error", "ReCAPTCHA not initialized");
            return;
        }

        const formattedPhoneNumber = `${countryCode}${phoneNumber}`;
        try {
            const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, recaptchaVerifier.current);
            setConfirm(confirmation);
            setIsCodeSent(true);
        } catch (error: any) {
            console.log('Error sending code: ', error)
        }
    };

    const verifyCode = async () => {
        try {
            // await confirm.confirm(code);
            const userCredential = await confirm.confirm(code);
            const user = userCredential.user;
            navigation.navigate("StepTwo", { user: userCredential.user });
        } catch (error) {
            Alert.alert("Error", "Incorrect verification code. Please try again.");
        }
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>

            <View className="flex-1 justify-center">
                <FirebaseRecaptchaVerifierModal
                    ref={recaptchaVerifier}
                    firebaseConfig={app.options}
                    attemptInvisibleVerification={true}
                />
                <TouchableOpacity
                    onPress={() => navigation.navigate("Welcome")}
                    style={{ position: "absolute", top: 60, right: 20, zIndex: 3 }}
                >
                    <Text style={{ fontSize: 28, color: "white" }}>×</Text>
                </TouchableOpacity>

                <View className='mb-20'>
                    <>
                        {!isCodeSent ? (
                            <>
                                <Text style={{ color: "white", fontSize: 32, fontFamily: 'JosefinSans_400Regular', width: 300, marginLeft: 30, marginTop: 90 }}>
                                    What's your phone number?
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 40 }}>
                                    <TextInput
                                        value={countryCode}
                                        editable={true}
                                        onChangeText={setCountryCode}
                                        style={{
                                            color: "white",
                                            backgroundColor: '#333',
                                            paddingVertical: 10,
                                            paddingHorizontal: 15,
                                            borderRadius: 5,
                                            marginLeft: 20,
                                            width: 50,
                                            fontSize: 18,
                                            height: 50,
                                            marginTop: 20

                                        }}
                                    />
                                    <TextInput
                                        value={phoneNumber}
                                        onChangeText={handlePhoneNumberChange}
                                        className="border-b-4 border-synq-accent-light"
                                        style={{
                                            color: "white",
                                            marginLeft: 10,
                                            width: 260,
                                            paddingVertical: 10,
                                            paddingHorizontal: 15,
                                            backgroundColor: '#333',
                                            borderRadius: 5,
                                            fontSize: 18,
                                            height: 50,
                                            marginTop: 20

                                        }}
                                        keyboardType="phone-pad"
                                    />
                                </View>
                                <Text className="text-white" style={{ fontSize: 12, width: 320, marginLeft: 20, marginTop: 20 }}>
                                    Synq will send you a text with a verification code. Message and data rates may apply.
                                </Text>

                                <TouchableOpacity onPress={sendVerificationCode} style={{ marginTop: 60 }}>
                                    <Button text="Send Code" onPress={sendVerificationCode} style={{ backgroundColor: '#7DFFA6' }} />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={{ color: "white", fontSize: 32, alignSelf: 'center' }}>Enter code</Text>
                                <Text style={{ color: "white", fontSize: 12, alignSelf: 'center', marginTop: 10, width: 190, alignItems: 'center', textAlign: 'center' }}>Your temporary code was sent to ({phoneNumber.slice(0,3)}) {phoneNumber.slice(3,6)}-{phoneNumber.slice(6,10)}</Text>


                                <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 30 }}>
                                    {code.map((digit, index) => (
                                        <TextInput
                                            key={index}
                                            ref={(el) => (inputs.current[index] = el)}
                                            value={digit}
                                            onChangeText={(text) => handleChange(text, index)}
                                            onKeyPress={(e) => handleKeyPress(e, index)}
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            style={{
                                                width: 50,
                                                height: 60,
                                                borderWidth: 2,
                                                borderColor: '#7DFFA6',
                                                borderRadius: 10,
                                                textAlign: "center",
                                                fontSize: 24,
                                                color: "white",
                                                marginTop: 20,
                                                marginHorizontal: 5,
                                                backgroundColor: "black",
                                            }}
                                        />
                                    ))}
                                </View>
                                <Text style={{ color: "white", fontSize: 12, alignSelf: 'center', marginTop: 10 }}>Didn't receieve a code? Try again.</Text>

                                <TouchableOpacity onPress={verifyCode} className="bg-green-600 px-4 py-2 rounded mt-4" style={{ top: 30, width: 105, alignSelf: 'center', alignItems: 'center' }}>
                                    <Text className="text-white">Continue</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

