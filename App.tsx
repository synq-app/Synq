import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import useCachedResources from './src/hooks/useCachedResources';
import useColorScheme from './src/hooks/useColorScheme';
import Navigation from './src/navigation';
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; 

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(false);

  useEffect(() => {
    const auth = getAuth();  
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsFirstTimeUser(false) 
      } else {
        setIsFirstTimeUser(true);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!isLoadingComplete) {
    return null;
  }
  else if(!isFirstTimeUser) {
    return (  
      <SafeAreaProvider>
      <Navigation colorScheme={colorScheme} isFirstTimeUser={isFirstTimeUser} />
      <StatusBar />
    </SafeAreaProvider>
    )
  }
   else {
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} isFirstTimeUser={isFirstTimeUser} />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}
