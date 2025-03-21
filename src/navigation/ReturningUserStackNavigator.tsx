import { FontAwesome } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { Pressable } from 'react-native';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import ModalScreen from '../screens/ModalScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import { HomeScreen } from '../screens/Home';
import { NetworkScreen } from '../screens/Network';
import { ProfileScreen } from '../screens/Profile';
import { SynqScreen } from '../screens/Synq';
import { ChatStackNavigator } from './ChatStackNavigator';
import WelcomeScreen from '../screens/FirstTimeUser/Welcome';
import SignInWithEmail from '../screens/FirstTimeUser/SignInWithEmail';
import SignInWithPhoneNumber from '../screens/FirstTimeUser/SignInWithPhoneNumber';
import { SignUpWithEmail } from '../screens/FirstTimeUser/SignUpWithEmail';
import { SignUpWithPhoneNumber } from '../screens/FirstTimeUser/SignUpWithPhoneNumber';
import { StepTwoScreen } from '../screens/FirstTimeUser/StepTwo';
import IntroToAddingConnections from '../screens/FirstTimeUser/IntroToAddingConnections';
import { Notifications } from '../screens/Notifications';
import { Settings } from '../screens/Settings';
import { Explore } from '../screens/Explore';
import AddFriendsScreen from '../screens/AddFriends';
import { ProfileNavigator } from './ProfileNavigator';

const ReturningUserStack = createNativeStackNavigator();
export function ReturningUserStackNavigator() {
  return (
    <ReturningUserStack.Navigator>
      <ReturningUserStack.Screen name="Default" component={BottomTabNavigator} options={{ headerShown: false }} />
      <ReturningUserStack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <ReturningUserStack.Screen name="SignInWithEmail" component={SignInWithEmail} options={{ headerShown: false }} />
      <ReturningUserStack.Screen name="SignInWithPhoneNumber" component={SignInWithPhoneNumber} options={{ headerShown: false }} />
      <ReturningUserStack.Screen name="SignUpWithEmail" component={SignUpWithEmail} options={{ headerShown: false }} />
      <ReturningUserStack.Screen name="SignUpWithPhoneNumber" component={SignUpWithPhoneNumber} options={{ headerShown: false }} />
      <ReturningUserStack.Screen name="StepTwo" component={StepTwoScreen} options={{ headerShown: false }} />
      <ReturningUserStack.Screen name="IntroToAddingConnections" component={IntroToAddingConnections} options={{ headerShown: false }} />
      <ReturningUserStack.Screen name="Notifications" component={Notifications} options={{ headerShown: false }} />
      <ReturningUserStack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
      <ReturningUserStack.Screen name="Explore" component={Explore} options={{ headerShown: false }} />
      <ReturningUserStack.Screen name="Add Friends" component={AddFriendsScreen} options={{ headerShown: false }} />
      <ReturningUserStack.Screen name="Network" component={NetworkScreen} options={{ headerShown: false }} />

      <ReturningUserStack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
      <ReturningUserStack.Group screenOptions={{ presentation: 'modal' }}>
        <ReturningUserStack.Screen name="Modal" component={ModalScreen} />
      </ReturningUserStack.Group>
    </ReturningUserStack.Navigator>
  );
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator();
function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].accent,
        headerShown: false,
      }}>
      <BottomTab.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate('Modal')}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}>
              <FontAwesome
                name="info-circle"
                size={25}
                color={Colors[colorScheme].text}
                style={{ marginRight: 15 }}
              />
            </Pressable>
          ),
        })}
      />
      <BottomTab.Screen
        name="Chats"
        component={ChatStackNavigator}
        options={{
          headerTitle: "",
          tabBarIcon: ({ color }) => <TabBarIcon name="comments" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Synq"
        component={SynqScreen}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
      {/* <BottomTab.Screen
        name="Network"
        component={NetworkScreen}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="address-book" color={color} />,
        }}
      /> */}
      <BottomTab.Screen
        name="Explore"
        component={Explore}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Me"
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={22} style={{ marginBottom: -3 }} {...props} />;
}