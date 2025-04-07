import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';

type AuthProps = {
  navigation: any;
};

export const SynqActivated = ({ navigation }: AuthProps) => {
  const [text, setText] = useState("Synq activated...");

  useEffect(() => {
    const firstTimer = setTimeout(() => {
      setText("Finding connections...");
    }, 3000); 

    const secondTimer = setTimeout(() => {
      setText("Optimizing your network...");
    }, 6000);

    const thirdTimer = setTimeout(() => {
      navigation.navigate("AvailableFriends");
    }, 9000);

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(secondTimer);
      clearTimeout(thirdTimer);
    };
  }, []); 

  return (
    <View className="bg-black">
      <Text className="text-white text-3xl text-center mt-20 mb-40">
        {text}
      </Text>

      <View className="flex-1 items-center mt-50">
        <TouchableOpacity>
          <Image
            source={require('../screens/FirstTimeUser/pulse.gif')}
            style={{ width: 280, height: 280 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
