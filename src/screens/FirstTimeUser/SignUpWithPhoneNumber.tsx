import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import {
  auth,
  signInWithPhoneNumber,
  app
} from './firebaseConfig';
import { SynqButton } from '../../components/Themed';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import axios from 'axios';
import { ENV_VARS } from '../../../config';

interface AuthProps {
  navigation: any;
}

export const SignUpWithPhoneNumber = ({ navigation }: AuthProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirm, setConfirm] = useState<any>(null);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [countryCode, setCountryCode] = useState('+1');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const recaptchaVerifier = useRef(null);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && !code[index]) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePhoneNumberChange = (text: string) => {
    const formattedText = text.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(formattedText);
  };

  const sendVerificationCode = async () => {
    if (!recaptchaVerifier.current) {
      Alert.alert('Error', 'ReCAPTCHA not initialized');
      return;
    }

    const formattedPhoneNumber = `${countryCode}${phoneNumber}`;
    try {
      auth.useDeviceLanguage();

      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        recaptchaVerifier.current
      );
      setConfirm(confirmation);
      setIsCodeSent(true);
    } catch (error: any) {
      console.log('Error sending code: ', error.message);
      Alert.alert('Error', 'Could not send verification code');
    }
  };

  const verifyCode = async () => {
    try {
      const fullCode = code.join('');
      const userCredential = await confirm.confirm(fullCode);
      const user = userCredential.user;

      const response = await axios.put(
        ENV_VARS.TOKEN_URL,
        {
          email: user.uid + '@synq.com',
          password: user.uid,
          returnSecureToken: true
        }
      );
      const { idToken, localId } = response.data;

      navigation.navigate('StepTwo', { user, idToken, localId });
    } catch (error: any) {
      console.error('Verification failed or API sync error:', error.message);
      Alert.alert('Error', 'Invalid code or failed to sync with server.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 justify-center">
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={app.options}
          attemptInvisibleVerification={true}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('Welcome')}
          style={{ position: 'absolute', top: 60, right: 20, zIndex: 3 }}
        >
          <Text style={{ fontSize: 28, color: 'white' }}>×</Text>
        </TouchableOpacity>

        <View className="mb-20">
          {!isCodeSent ? (
            <>
              <Text className="text-white text-3xl ml-6 w-80 mt-10">
                What's your phone number?
              </Text>
              <View className="flex flex-row items-center mt-10">
                <TextInput
                  value={countryCode}
                  editable={true}
                  onChangeText={setCountryCode}
                  className="text-white bg-gray-800 w-18 h-12 mt-5 ml-5 rounded-md px-4 py-0 text-lg text-center"
                />
                <TextInput
                  value={phoneNumber}
                  onChangeText={handlePhoneNumberChange}
                  className="border-b-4 bg-gray-800 border-synq-accent-light text-white w-2/3 h-12 mt-5 ml-2 rounded-md px-2 py-0 text-lg"
                  keyboardType="phone-pad"
                />
              </View>
              <Text className="text-white text-xs w-3/4 ml-6 mt-4">
                Synq will send you a text with a verification code. Message and
                data rates may apply.
              </Text>
              <TouchableOpacity onPress={sendVerificationCode} className="mt-10">
                <SynqButton text="Send Code" onPress={sendVerificationCode} style={{ backgroundColor: '#7DFFA6' }} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text className="text-white text-2xl text-center">Enter code</Text>
              <Text className="text-white text-sm text-center mt-2">
                Sent to ({phoneNumber.slice(0, 3)}) {phoneNumber.slice(3, 6)}-{phoneNumber.slice(6, 10)}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 30 }}>
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
                      textAlign: 'center',
                      fontSize: 24,
                      marginHorizontal: 5,
                      color: 'white'
                    }}
                  />
                ))}
              </View>
              <Text className="text-white mt-10 text-sm text-center">
                Didn’t receive a code? Try again.
              </Text>
              <TouchableOpacity onPress={verifyCode} className="mt-6" style={{ alignSelf: 'center' }}>
                <SynqButton text="Continue" onPress={verifyCode} className="bg-[#7DFFA6]" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
