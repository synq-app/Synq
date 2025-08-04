import React, { useState } from 'react';
import {
  TextInput,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Button,
} from 'react-native';
import { View, Text } from '../components/Themed';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const db = getFirestore();
const auth = getAuth();

const EditMemoScreen = ({ navigation, route }: any) => {
  const [memo, setMemo] = useState(route.params?.memo || '');

  const handleSave = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { memo }, { merge: true });
        navigation.goBack();
      } catch (err) {
        Alert.alert('Error', 'Could not save memo');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-center p-5">
            <Text className="text-white mb-20 text-2xl text-center font-semibold">
              Edit your Synq memo
            </Text>

            <TextInput
              value={memo}
              onChangeText={setMemo}
              multiline
              numberOfLines={5}
              className="text-white bg-[#222] rounded-xl p-4 text-base min-h-[120px] mb-20"
              placeholder="I'm free if anyone wants to grab coffee..."
              placeholderTextColor="#888"
            />

            <View className="rounded-lg overflow-hidden">
              <Button title="Update note" onPress={handleSave} color="#1DB954" />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditMemoScreen;
