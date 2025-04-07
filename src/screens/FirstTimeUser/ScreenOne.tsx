import { useEffect } from 'react';
import { View } from '../../components/Themed';
import { Image } from 'react-native';

export default function ScreenOne({ navigation }: any) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('ScreenTwo'); 
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View className="items-center justify-center bg-black">
      <Image
        source={require('../../assets/animations/AssemblyAndDiceRoll.gif')}
        style={{ width: 800, height: 800 }}
        resizeMode="contain"
      />
    </View>
  );
}
