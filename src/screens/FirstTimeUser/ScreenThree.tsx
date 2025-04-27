import { useRef, useState } from 'react';
import { View, Text, Button } from '../../components/Themed';
import { TouchableOpacity, Alert, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SvgXml } from 'react-native-svg'; 
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { auth, signInWithPhoneNumber, app } from "./firebaseConfig";
import axios from 'axios';
import { ENV_VARS } from '../../../config';

const synqSvg = `
  <svg width="390" height="565" viewBox="0 0 390 565" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M315.808 523.349C309.142 527.14 300.865 522.325 300.865 514.656V302.238C300.865 298.642 302.796 295.322 305.923 293.545L463.367 204.029C470.033 200.239 478.31 205.053 478.31 212.722V360.975C478.31 362.753 478.783 364.498 479.682 366.032L504.916 409.08C506.747 412.203 506.747 416.072 504.916 419.195L483.3 456.065C480.533 460.784 474.488 462.404 469.732 459.701L453.672 450.573C450.608 448.831 446.852 448.831 443.788 450.574L315.808 523.349ZM349.216 338.697C349.216 335.101 351.147 331.782 354.273 330.004L422.996 290.928C429.662 287.138 437.939 291.953 437.939 299.621V377.51C437.939 381.106 436.008 384.425 432.881 386.203L364.159 425.278C357.493 429.069 349.216 424.254 349.216 416.585V338.697Z" fill="#FFFFFF" fill-opacity="0.07"/>
    <path d="M251.12 195.328C245.103 198.652 237.801 198.652 231.784 195.329L95.7129 120.195C81.9369 112.588 81.9361 92.7866 95.7115 85.1788L116.892 73.4815C120.939 71.2466 125.635 70.4826 130.181 71.3195L240.127 91.5575C251.28 93.6103 256.698 78.4499 246.771 72.9685L214.009 54.8785C200.232 47.2716 200.232 27.4694 214.009 19.8621L231.785 10.0464C237.801 6.72391 245.103 6.72386 251.12 10.0463L387.185 85.1778C400.963 92.7852 400.962 112.589 387.184 120.195L365.3 132.276C361.686 134.271 357.543 135.099 353.439 134.646L261.603 124.506C250.737 123.306 246.101 137.915 255.671 143.2L268.89 150.498C282.666 158.105 282.666 177.906 268.891 185.514L251.12 195.328Z" fill="#FFFFFF" fill-opacity="0.07"/>
    <path d="M206.977 279.648C210.164 281.408 212.143 284.761 212.143 288.402V537.876C212.143 541.517 214.122 544.87 217.31 546.63L236.881 557.436C239.889 559.097 243.54 559.097 246.548 557.436L266.119 546.63C269.307 544.87 271.286 541.517 271.286 537.876V288.402C271.286 284.761 273.265 281.408 276.452 279.648L473.143 171.046C476.331 169.286 478.31 165.932 478.31 162.291V141.433C478.31 137.791 476.33 134.438 473.142 132.678L453.563 121.871C450.555 120.211 446.905 120.211 443.897 121.872L246.548 230.841C243.54 232.502 239.889 232.502 236.881 230.841L39.5239 121.872C36.5156 120.211 32.8651 120.211 29.8568 121.872L10.2856 132.678C7.09815 134.438 5.11914 137.791 5.11914 141.432V162.291C5.11914 165.932 7.09812 169.286 10.2855 171.046L206.977 279.648Z" fill="#FFFFFF" fill-opacity="0.07"/>
    <path d="M5.11914 298.827V217.8C5.11914 210.186 13.2878 205.366 19.9526 209.045L177.397 295.975C180.584 297.735 182.563 301.088 182.563 304.729V347.207C182.563 354.82 174.394 359.641 167.729 355.961L79.1043 307.019C72.4394 303.339 64.2701 308.159 64.2701 315.773V325.588C64.2701 329.229 66.249 332.583 69.4364 334.343L177.397 393.954C180.585 395.714 182.563 399.068 182.563 402.709V510.505C182.563 518.118 174.395 522.939 167.73 519.259L10.2854 432.322C7.09804 430.562 5.11914 427.209 5.11914 423.568V381.097C5.11914 373.484 13.288 368.663 19.9529 372.343L108.579 421.279C115.244 424.959 123.413 420.138 123.413 412.525V402.709C123.413 399.068 121.434 395.714 118.246 393.954L10.2854 334.343C7.09806 332.583 5.11914 329.229 5.11914 325.588V298.827Z" fill="#FFFFFF" fill-opacity="0.07"/>
  </svg>
`;
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
            navigation.navigate("StepTwo", { user: userCredential.user});
        } catch (error) {
            Alert.alert("Error", "Incorrect verification code. Please try again.");
        }
    };
    

    return (
        <View className="flex-1 justify-center items-center bg-black relative">
            <SvgXml
                xml={synqSvg}
                width="390"
                height="565"
                className="absolute top-0"
            />
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View className="flex-1 justify-center px-4">
                    <FirebaseRecaptchaVerifierModal
                        ref={recaptchaVerifier}
                        firebaseConfig={app.options}
                        // attemptInvisibleVerification={true}
                        attemptInvisibleVerification={false}

                    />
                    <View className="mb-20">
                        {!isCodeSent ? (
                            <>
                                <Text className="text-white text-3xl w-80 mt-10 text-left">
                                    What's your phone number?
                                </Text>
                                <View className="flex flex-row items-center mt-8">
                                    <TextInput
                                        value={countryCode}
                                        editable={true}
                                        onChangeText={setCountryCode}
                                        className="text-white bg-gray-800 w-18 h-10 mt-5 ml-2 rounded-md px-4 py-2 text-lg text-center"
                                    />
                                    <TextInput
                                        value={phoneNumber}
                                        onChangeText={handlePhoneNumberChange}
                                        className="border-b-4 bg-gray-800 border-synq-accent-light text-white w-3/4 h-12 mt-5 ml-2 rounded-md px-2 py-0 text-lg"
                                        keyboardType="phone-pad"
                                    />
                                </View>
                                <Text className="text-white text-xs mt-4 ml-2">
                                    Synq will send you a text with a verification code. Message and data rates may apply.
                                </Text>
                                <Text className="text-[#6DFE95] text-sm mt-4 ml-2"
                                    onPress={() => navigation.navigate('SignUpWithEmail')}
                                >
                                    Use email instead? Click here.
                                </Text>
                                <TouchableOpacity onPress={sendVerificationCode} className="mt-10">
                                    <Button text="Send Code" onPress={sendVerificationCode} className="bg-[#6DFE95] px-8 py-2 rounded-md" />
                                </TouchableOpacity>
                            </>
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
                </View>
            </TouchableWithoutFeedback>
        </View>
    );
}
