import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { Text, View } from '../components/Themed';

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-2xl font-bold">Modal</Text>
      <View className="my-8 h-px w-4/5 bg-gray-400" />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}
