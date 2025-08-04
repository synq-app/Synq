import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
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
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
            <Text className="text-white mb-20 text-2xl text-center">
              Edit your Synq memo
            </Text>

            <TextInput
              value={memo}
              onChangeText={setMemo}
              className="text-white mb-20"
              style={{
                backgroundColor: '#222',
                padding: 16,
                borderRadius: 12,
                fontSize: 16,
                minHeight: 120,
                textAlignVertical: 'top'
              }}
              multiline
              numberOfLines={5}
              placeholder="I'm free if anyone wants to grab coffee..."
              placeholderTextColor="#888"
            />
            <Button title="Update note" onPress={handleSave} color="#1DB954" />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditMemoScreen;
