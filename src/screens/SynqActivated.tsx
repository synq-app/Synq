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
    }, 2000); 

    const secondTimer = setTimeout(() => {
      setText("Optimizing your network...");
    }, 4000);

    const thirdTimer = setTimeout(() => {
      navigation.navigate("AvailableFriends");
    }, 6000);

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(secondTimer);
      clearTimeout(thirdTimer);
    };
  }, []); 

  return (
    <View className="bg-black">
      <Text className="text-white text-2xl text-center mt-40 mb-20"  style={{ fontFamily: 'avenir' }}>
        {text}
      </Text>

      <View className="items-center mt-55">
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
