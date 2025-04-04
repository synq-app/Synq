import React, { useEffect, useRef } from "react";
import { Text, Animated, Easing, View } from "react-native";

interface StatusIndicatorProps {
  status: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === "available") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [status, pulseAnim]);

  return (
    <View className="flex flex-row items-center mt-4">
      <Text className="text-[#7DFFA6] mr-2">Status: {status}</Text>
      {status === "Available" && (
        <Animated.View
          style={[{ transform: [{ scale: pulseAnim }] }]}
          className="w-2.5 h-2.5 rounded-full bg-[#7DFFA6]"
        />
      )}
    </View>
  );
};

export default StatusIndicator;
