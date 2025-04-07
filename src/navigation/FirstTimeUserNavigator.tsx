import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/FirstTimeUser/Welcome';
import { StepTwoScreen } from '../screens/FirstTimeUser/StepTwo';
import SignInWithEmail from '../screens/FirstTimeUser/SignInWithEmail';
import SignInWithPhoneNumber from '../screens/FirstTimeUser/SignInWithPhoneNumber';
import { SignUpWithEmail } from '../screens/FirstTimeUser/SignUpWithEmail';
import { SignUpWithPhoneNumber } from '../screens/FirstTimeUser/SignUpWithPhoneNumber';
import IntroToAddingConnections from '../screens/FirstTimeUser/IntroToAddingConnections';
import { Notifications } from '../screens/Notifications';
import { Settings } from '../screens/Settings';
import AddFriendsScreen from '../screens/AddFriends';
import { NetworkScreen } from '../screens/Network';
import { AvailableFriends } from '../screens/AvailableFriends';
import { GettingStarted } from '../screens/GettingStarted';
import ScreenOne from '../screens/FirstTimeUser/ScreenOne';
import ScreenTwo from '../screens/FirstTimeUser/ScreenTwo';
import ScreenThree from '../screens/FirstTimeUser/ScreenThree';

const FirstTimeUserStack = createNativeStackNavigator();
export function FirstTimeUserNavigator() {
  return (
    <FirstTimeUserStack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <FirstTimeUserStack.Screen name="ScreenOne" component={ScreenOne} options={{ headerShown: false }}/> 
      <FirstTimeUserStack.Screen name="ScreenTwo" component={ScreenTwo} options={{ headerShown: false }}/>   
      <FirstTimeUserStack.Screen name="ScreenThree" component={ScreenThree} options={{ headerShown: false }}/>   
      <FirstTimeUserStack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <FirstTimeUserStack.Screen name="SignInWithEmail" component={SignInWithEmail} options={{ headerShown: false }} />
      <FirstTimeUserStack.Screen name="SignInWithPhoneNumber" component={SignInWithPhoneNumber} options={{ headerShown: false }}/>
      <FirstTimeUserStack.Screen name="SignUpWithEmail" component={SignUpWithEmail} options={{ headerShown: false }}/>
      <FirstTimeUserStack.Screen name="SignUpWithPhoneNumber" component={SignUpWithPhoneNumber} options={{ headerShown: false }}/>
      <FirstTimeUserStack.Screen name="StepTwo" component={StepTwoScreen} options={{ headerShown: false }}/>
      <FirstTimeUserStack.Screen name="IntroToAddingConnections" component={IntroToAddingConnections} options={{ headerShown: false }} />
      <FirstTimeUserStack.Screen name="Add Friends" component={AddFriendsScreen} options={{ headerShown: false }} />
      <FirstTimeUserStack.Screen name="Network" component={NetworkScreen} options={{ headerShown: false }} />
      <FirstTimeUserStack.Screen name="Notifications" component={Notifications} options={{ headerShown: false }}/>   
      <FirstTimeUserStack.Screen name="Settings" component={Settings} options={{ headerShown: false }}/>   
      <FirstTimeUserStack.Screen name="AvailableFriends" component={AvailableFriends} options={{ headerShown: false }}/>   
      <FirstTimeUserStack.Screen name="GettingStarted" component={GettingStarted} options={{ headerShown: false }}/>   
    </FirstTimeUserStack.Navigator>
  );
}