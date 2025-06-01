import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const db = getFirestore();
const auth = getAuth();

type AuthProps = {
  navigation: any;
};

export const SynqScreen = ({ navigation }: AuthProps) => {
  const [memo, setMemo] = useState<string>('');
  const [synqTime, setSynqTime] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null);

  const handleSaveMemo = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userDocRef, { memo: memo }, { merge: true });
      } catch (error) {
        console.error('Error saving memo: ', error);
      }
    } else {
      Alert.alert('Error', 'No user is logged in.');
    }
  };

  const updateSynqTimeInFirestore = (synqTime: number) => {
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      setDoc(userDocRef, { activeSynqTime: synqTime }, { merge: true }).catch(
        (error) => {
          console.error('Error updating synq time in Firestore:', error);
        }
      );
    }
  };

  const startTimer = () => {
    if (isTimerRunning) return;

    setIsTimerRunning(true);
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      setSynqTime(elapsedTime);
      updateSynqTimeInFirestore(elapsedTime);
    }, 1000);
    setIntervalId(interval);

    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      setDoc(
        userDocRef,
        {
          status: 'available',
          activeSynqTime: 0,
        },
        { merge: true }
      ).then(() => {
        console.log('User status set to available.');
      }).catch((error) => {
        console.error('Error setting user status:', error);
      });
    }
  };

  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId as unknown as number);
      setIsTimerRunning(false);
      setIntervalId(null);

      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        setDoc(
          userDocRef,
          {
            activeSynqTime: synqTime,
            status: 'unavailable',
          },
          { merge: true }
        ).then(() => {
          console.log('User status set to unavailable.');
        }).catch((error) => {
          console.error('Error updating user status:', error);
        });
      }
    }
  };

  const handleSynqPress = () => {
    handleSaveMemo();
    navigation.navigate('SynqActivated');
    isTimerRunning ? stopTimer() : startTimer();
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 bg-black justify-center items-center">
        <View className="w-[80%] items-center mt-20">
          <Text
            className="text-white text-3xl text-center mt-24 font-semibold"
            style={{ fontFamily: 'Avenir' }}
          >
            Tap when you're free to meet up
          </Text>

          <View className="w-[90%] mb-5 mt-5">
            <TextInput
              multiline
              numberOfLines={4}
              value={memo}
              onChangeText={setMemo}
              editable
              className="w-[360px] text-white text-base text-center border-b border-[#7DFFA6] bg-black px-4 py-2 italic ml-[-50px]"
              style={{ fontFamily: 'Avenir' }}
              placeholder="Optional note: (Anyone want to grab a drink?)"
              placeholderTextColor="#A0A0A0"
            />
          </View>

          <TouchableOpacity onPress={handleSynqPress}>
            <Image
              source={require('../screens/FirstTimeUser/pulse.gif')}
              className="w-[280px] h-[280px]"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};
