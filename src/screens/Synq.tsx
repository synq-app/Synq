import { Text, View, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import * as React from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const db = getFirestore();
const auth = getAuth();

const availableTimes = [15, 30, 60];

type AuthProps = {
  navigation: any;
};

export const SynqScreen = ({ navigation }: AuthProps) => {
  const [checkedTime, setCheckedTime] = React.useState<number>(availableTimes[0]);
  const [memo, setMemo] = React.useState<string>('');

  const handleSaveMemo = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userDocRef, { memo: memo }, { merge: true });
      } catch (error) {
        console.error("Error saving memo: ", error);
        Alert.alert('Error', 'Failed to save memo. Please try again later.');
      }
    } else {
      Alert.alert('Error', 'No user is logged in.');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
      <View className='items-center mt-20' style={{ width: '70%' }}>
        <View style={{ alignItems: "center" }}>
          <Text className="text-white text-3xl text-center mt-100 w-300">
            Tap when you're free to meet up
          </Text>
        </View>
        <View className="mb-20 w-90%">
          <TextInput
            multiline
            numberOfLines={4}
            value={memo}
            onChangeText={setMemo}
            editable
            className="bg-black w-[300px] border mt-10 border-b-[#7DFFA6] text-white text-base italic text-center mt-5 font-italic p-3"
            placeholderTextColor={'#A0A0A0'}
            placeholder='Optional note: (Anyone want to grab a drink?)'
          />
        </View>
        <TouchableOpacity onPress={() => {
          handleSaveMemo();
          navigation.navigate('AvailableFriends');
        }}>
          <Image
            source={require('../screens/FirstTimeUser/pulse.gif')}
            style={{ width: 280, height: 280 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
