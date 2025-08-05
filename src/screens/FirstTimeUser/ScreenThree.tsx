import { useRef, useState } from 'react';
import { Text, SynqButton, ScreenView, SynqText } from '../../components/Themed';
import { TouchableOpacity, Alert, View, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { auth, signInWithPhoneNumber, app } from "./firebaseConfig";
import axios from 'axios';
import { ENV_VARS } from '../../../config';

export default function ScreenThree({ navigation }: any) {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [confirm, setConfirm] = useState<any>(null);
    const [isCodeSent, setIsCodeSent] = useState(false);
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
            console.log('Error sending code: ', error);
        }
    };

    const verifyCode = async () => {
        try {
            const codeString = code.join('');
            const userCredential = await confirm.confirm(codeString);
            const user = userCredential.user;
            navigation.navigate("StepTwo", { user: userCredential.user });
        } catch (error) {
            Alert.alert("Error", "Incorrect verification code. Please try again.");
        }
    };


    return (
        <ScreenView className="px-2">
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View className="flex-1 justify-center">
                    <FirebaseRecaptchaVerifierModal
                        ref={recaptchaVerifier}
                        firebaseConfig={app.options}
                        attemptInvisibleVerification={true}

                    />
                    {!isCodeSent ? (
                        <View className='justify-between h-full'>
                            <SynqText className="text-heading h-1/3 pt-36">
                                Let's get started
                            </SynqText>
                            <View className="gap-3">
                                <View className="flex flex-row justify-center gap-3">
                                    <TextInput
                                        value={countryCode}
                                        editable={true}
                                        onChangeText={setCountryCode}
                                        className="text-body border-b border-placeholder-text px-2"
                                    />
                                    <TextInput
                                        value={phoneNumber}
                                        onChangeText={handlePhoneNumberChange}
                                        className="text-body border-b border-placeholder-text w-3/4 px-2 text-center"
                                        keyboardType="phone-pad"
                                        placeholder='Enter phone number'
                                    />
                                </View>
                                <View className='gap-3 items-center'>
                                    <SynqButton text="Send code" onPress={sendVerificationCode} />
                                    <Text className="text-caption px-6">
                                        Synq will send you a text with a verification code. Message and data rates may apply.
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('SignUpWithEmail')}
                                className="pt-4"
                            >
                                <SynqText className='text-label'>Use email instead?</SynqText>
                                <SynqText className="text-label text-accent"> Click here.</SynqText>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <Text className="text-white text-3xl text-center mt-10">
                                Enter code
                            </Text>
                            <Text className="text-white text-sm mt-2 w-3/4 text-center mx-auto">
                                Your temporary code was sent to ({phoneNumber.slice(0, 3)}) {phoneNumber.slice(3, 6)}-{phoneNumber.slice(6, 10)}
                            </Text>
                            <View className="flex flex-row justify-center mt-8">
                                {code.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={(el) => (inputs.current[index] = el)}
                                        value={digit}
                                        onChangeText={(text) => handleChange(text, index)}
                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        className="text-white w-12 h-16 border-2 border-synq-accent-light rounded-lg text-center text-3xl mx-2"
                                    />
                                ))}
                            </View>
                            <Text className="text-white mt-10 text-center text-sm">
                                Didn't receive a code? Try again.
                            </Text>
                            <TouchableOpacity onPress={verifyCode} className="bg-[#6DFE95] px-8 py-2 rounded-md mt-6 mx-auto">
                                <Text className="text-black text-lg">Continue</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </TouchableWithoutFeedback>
        </ScreenView>
    );
}
