import { SynqText, ScreenView, View } from '../components/Themed';
import { FeedScreen } from './Feed';

export function HomeScreen() {
  const SynqActive: boolean = true;

  return (
    SynqActive ?
      <FeedScreen />
      :
      <ScreenView className="justify-end ">
        <View className='items-center'>
          <SynqText className='flex text-center'>Home is where a list of your currently active connections will appear...</SynqText>
          <SynqText className='flex text-center py-14'>{"Tap the SYNQ button if you're available now"}</SynqText>
        </View>
      </ScreenView>

  );
}
