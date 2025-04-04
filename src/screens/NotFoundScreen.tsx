import { TouchableOpacity } from 'react-native';
import { Text, View } from '../components/Themed';

export default function NotFoundScreen({ navigation }: any) {
  return (
    <View className="flex-1 items-center justify-center p-5">
      <Text className="text-xl font-bold">This screen doesn't exist.</Text>
      <TouchableOpacity
        onPress={() => navigation.replace('Root')}
        className="mt-4 py-4"
      >
        <Text className="text-sm text-[#2e78b7]">Go to home screen!</Text>
      </TouchableOpacity>
    </View>
  );
}
