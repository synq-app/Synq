import { SynqButton, Text, View } from '../../components/Themed';
import { Image, TouchableOpacity } from 'react-native';
import { useState } from 'react';

const accentGreen: string = '#7DFFA6';

export default function WelcomeScreen({ navigation }: any) {
  const [isSignInClicked, setIsSignInClicked] = useState(false);
  const [isSignUpClicked, setIsSignUpClicked] = useState(false);

  return (
    <View className="flex-1 justify-between px-4 py-8">
      <View className="flex-1 justify-center items-center">
        <Text className="text-4xl mb-8 mt-16">SYNQ</Text>
        <Text className="text-center text-lg">
          A social tool that connects you with available friends for spontaneous time together.
        </Text>
        <Image
          source={require('./pulse.gif')}
          style={{ width: 200, height: 200, marginTop: 50 }}
          resizeMode="contain"
        />
      </View>

      <View className="items-center mb-8 space-y-0">
        {!isSignInClicked && !isSignUpClicked && (
          <SynqButton
            text="Create account"
            onPress={() => setIsSignUpClicked(true)}
            style={{ backgroundColor: '#7DFFA6' }}
          />
        )}

        {isSignUpClicked && (
          <>
            <SynqButton
              text="Sign up with Email"
              onPress={() => navigation.navigate('SignUpWithEmail')}
              style={{ backgroundColor: '#7DFFA6' }}
            />
            <SynqButton
              text="Sign up with Phone Number"
              onPress={() => navigation.navigate('SignUpWithPhoneNumber')}
              style={{ backgroundColor: '#7DFFA6' }}
            />
            <TouchableOpacity
              style={{
                backgroundColor: 'black',
                borderWidth: 1,
                borderRadius: 5
              }}
              onPress={() => setIsSignUpClicked(false)}
            >
              <Text style={{ color: 'white' }}>Back</Text>
            </TouchableOpacity>
          </>
        )}

        {!isSignUpClicked && !isSignInClicked && (
          <SynqButton
            text="Sign in"
            onPress={() => setIsSignInClicked(true)}
            style={{ backgroundColor: '#7DFFA6' }}
          />
        )}

        {isSignInClicked && (
          <>
            <SynqButton
              text="Sign in with Email"
              onPress={() => navigation.navigate('SignInWithEmail')}
              style={{ backgroundColor: '#7DFFA6' }}
            />
            <SynqButton
              text="Sign in with Phone Number"
              onPress={() => navigation.navigate('SignInWithPhoneNumber')}
              style={{ backgroundColor: '#7DFFA6' }}
            />
            <TouchableOpacity
              style={{
                backgroundColor: 'black',
                borderWidth: 1,
                borderRadius: 5
              }}
              onPress={() => setIsSignInClicked(false)}
            >
              <Text style={{ color: 'white' }}>Back</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
