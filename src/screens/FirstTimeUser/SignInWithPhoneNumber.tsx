import React, { useState, useRef } from 'react';
import { Text, TextInput, TouchableOpacity, Alert, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { Button } from "../../components/Themed";
import { signInWithPhoneNumber } from 'firebase/auth';
import { auth, app } from './firebaseConfig';  // Import your firebase auth configuration

const SignInWithPhoneNumber = ({ navigation }: any) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [confirm, setConfirm] = useState<any>(null);
  const [countryCode, setCountryCode] = useState("+1");
  const recaptchaVerifier = useRef(null);
  const inputs = useRef<(TextInput | null)[]>([]);


  const handlePhoneNumberChange = (text: string) => {
    const formattedText = text.replace(/\D/g, "").slice(0, 10);  // Limiting input to 10 digits
    setPhoneNumber(formattedText);
  };

  const handleChange = (text: any, index: any) => {
    let newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
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
      Alert.alert("Error", "Failed to send verification code.");
    }
  };

  const verifyCode = async () => {
    try {
      const userCredential = await confirm.confirm(code);
      const user = userCredential.user;
      navigation.replace("Returning", { user: userCredential.user });
    } catch (error) {
      Alert.alert("Error", "Incorrect verification code. Please try again.");
    }
  };

  const handleKeyPress = (e: any, index: any) => {
    if (e.nativeEvent.key === "Backspace" && index > 0 && !code[index]) {
      inputs.current[index - 1]?.focus();
    }
  };


  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 30 }}>
        {/* Close button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Welcome")}
          style={{ position: "absolute", top: 60, right: 20, zIndex: 3 }}
        >
          <Text style={{ fontSize: 28, color: "white" }}>×</Text>
        </TouchableOpacity>

        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={app.options}
          attemptInvisibleVerification={true}
        />

        {!isCodeSent ? (
          <Text style={{ color: "white", fontSize: 32, fontFamily: 'JosefinSans_400Regular', width: 300, marginLeft: 10, marginTop: 50 }}>
            Sign in with phone number
          </Text>
        ) : null}

        {!isCodeSent ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 30 }}>
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
                  marginLeft: 10,
                  width: 50,
                  fontSize: 18,
                  height: 50,
                  marginTop: 20
                }}
              />
              <TextInput
                value={phoneNumber}
                onChangeText={handlePhoneNumberChange}
                placeholder="Enter phone number"
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
            <Text style={{ color: "white", fontSize: 12, width: 320, marginLeft: 20, marginTop: 20 }}>
              Synq will send you a text with a verification code. Message and data rates may apply.
            </Text>
            <TouchableOpacity onPress={sendVerificationCode} style={{ marginTop: 60 }}>
              <Button text="Send Code" onPress={sendVerificationCode} style={{ backgroundColor: '#7DFFA6' }} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={{ color: "white", fontSize: 32, alignSelf: 'center' }}>Enter code</Text>
            <Text style={{ color: "white", fontSize: 12, alignSelf: 'center', marginTop: 10, width: 190, alignItems: 'center', textAlign: 'center' }}>Your temporary code was sent to ({phoneNumber.slice(0, 3)}) {phoneNumber.slice(3, 6)}-{phoneNumber.slice(6, 10)}</Text>


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
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SignInWithPhoneNumber;
