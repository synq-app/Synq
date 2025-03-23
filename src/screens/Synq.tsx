import { Text, View, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import * as React from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const auth = getAuth();

const availableTimes = [15, 30, 60];

type AuthProps = {
  navigation: any;
};

export const SynqScreen = ({ navigation }: AuthProps) => {
  const [checkedTime, setCheckedTime] = React.useState<number>(availableTimes[0]);
  const [memo, setMemo] = React.useState<string>('');

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
      <View className='w-4/5 items-center'>
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
            style={{
              backgroundColor: 'black',
              borderRadius: 8,
              borderBottomWidth: 1,
              borderBottomColor: '#7DFFA6',
              padding: 12,
              fontSize: 14,
              color: 'white',
              textAlignVertical: 'top',
              fontStyle: 'italic',
              width: 340,
              marginTop: 30
            }}
            placeholderTextColor={'#A0A0A0'}
            placeholder='Optional note: (Anyone want to grab a drink?)'
          />
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('AvailableFriends')}>
          <Image
            source={require('../screens/FirstTimeUser/pulse.gif')}
            style={{ width: 280, height: 280, marginTop: 10 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
