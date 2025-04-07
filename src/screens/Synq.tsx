import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const db = getFirestore();
const auth = getAuth();

const availableTimes = [15, 30, 60];

type AuthProps = {
  navigation: any;
};

export const SynqScreen = ({ navigation }: AuthProps) => {
  const [checkedTime, setCheckedTime] = useState<number>(availableTimes[0]);
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
        console.log("Memo saved successfully.");
      } catch (error) {
        console.error("Error saving memo: ", error);
        Alert.alert('Error', 'Failed to save memo. Please try again later.');
      }
    } else {
      Alert.alert('Error', 'No user is logged in.');
    }
  };

  const updateSynqTimeInFirestore = (synqTime: number) => {
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      setDoc(userDocRef, { activeSynqTime: synqTime }, { merge: true })
        .then(() => {
          // console.log('Synq time updated in Firestore:', synqTime);
        })
        .catch((error) => {
          console.error('Error updating synq time in Firestore:', error);
        });
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
  };

  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId as unknown as number);
      setIsTimerRunning(false);
      setIntervalId(null);

      if (auth.currentUser) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        setDoc(userDocRef, { activeSynqTime: synqTime }, { merge: true })
          .then(() => {
            console.log('Synq time saved to Firestore on stop:', synqTime);
          })
          .catch((error) => {
            console.error('Error saving active Synq time to Firestore on stop:', error);
          });
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
      <View style={{ alignItems: 'center', marginTop: 20, width: '70%' }}>
        <Text style={{ color: 'white', fontSize: 30, textAlign: 'center', marginTop: 100 }}>
          Tap when you're free to meet up
        </Text>

        <View style={{ marginBottom: 20, width: '90%' }}>
          <TextInput
            multiline
            numberOfLines={4}
            value={memo}
            onChangeText={setMemo}
            editable
            style={{
              backgroundColor: 'black',
              width: 350,
              borderBottomWidth: 1,
              borderColor: '#7DFFA6',
              color: 'white',
              fontSize: 16,
              textAlign: 'center',
              marginTop: 5,
              padding: 10,
              fontStyle: 'italic',
              marginLeft: -50
            }}
            placeholderTextColor="#A0A0A0"
            placeholder="Optional note: (Anyone want to grab a drink?)"
          />
        </View>

        <TouchableOpacity
          onPress={() => {
            handleSaveMemo();
            navigation.navigate('SynqActivated');
            // navigation.navigate('AvailableFriends');
            // if (isTimerRunning) {
            //   stopTimer();
            // } else {
            //   startTimer(); 
            // }
          }}
        >
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
