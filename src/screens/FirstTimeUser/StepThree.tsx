import { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { SvgXml } from 'react-native-svg';

const synqSvg = `
<svg width="390" height="844" viewBox="0 0 390 844" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21 382.387V224.871C21 209.649 37.3297 200.007 50.6592 207.358L357.659 376.684C364.039 380.202 368 386.911 368 394.197V476.126C368 491.349 351.669 500.991 338.339 493.638L166.333 398.75C153.003 391.396 136.672 401.038 136.672 416.262V434.385C136.672 441.67 140.633 448.379 147.013 451.897L357.66 568.087C364.039 571.605 368 578.314 368 585.599V795.127C368 810.35 351.67 819.992 338.34 812.64L31.3402 643.3C24.9612 639.782 21 633.073 21 625.788V543.872C21 528.65 37.3301 519.007 50.6597 526.36L222.668 621.237C235.998 628.589 252.328 618.947 252.328 603.724V585.599C252.328 578.314 248.367 571.605 241.987 568.087L31.3403 451.897C24.9613 448.379 21 441.67 21 434.385V382.387Z" fill="url(#paint0_linear_1704_2297)"/>
<defs>
<linearGradient id="paint0_linear_1704_2297" x1="194.5" y1="191" x2="194.5" y2="908.75" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="0.270833" stop-color="#7DFFA6"/>
<stop offset="0.884651" stop-color="#222649"/>
</linearGradient>
</defs>
</svg>
`;

export default function StepThree({ navigation }: any) {
  const [showText, setShowText] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0]; 

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
      Animated.timing(fadeAnim, {
        toValue: 1,  
        duration: 1000, 
        useNativeDriver: true,
      }).start();  

      // After 3 seconds of showing the second text, navigate to 'gettingstarted'
      setTimeout(() => {
        navigation.navigate('GettingStarted');
      }, 3000); // 3 seconds
    }, 1000); // Wait for the first text to appear after 1 second

    return () => clearTimeout(timer);
  }, [fadeAnim, navigation]);

  return (
    <View className="flex-1 justify-center items-center bg-black relative">
      <SvgXml
        xml={synqSvg}
        width="390"
        height="565"
        className="absolute top-40"
      />

      <Text className="text-white text-center px-5 w-5/6 text-base absolute top-40 text-2xl" style={{ fontFamily: 'avenir' }}>
        Welcome to Synq!
      </Text>

      {showText && (
        <Animated.Text
          className="text-white text-center px-5 w-5/6 text-base absolute top-60 text-2xl"
          style={{
            fontFamily: 'avenir',
            opacity: fadeAnim, 
          }}
        >
          We're happy to have you.
        </Animated.Text>
      )}
    </View>
  );
}
