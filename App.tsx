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

  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean | null>(null);  
  const isFirstTimeUser = false;

  useEffect(() => {
    const auth = getAuth();  
    console.log('auth: ', auth)

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('user: ', user)
      if (user) {
        setIsUserLoggedIn(true);  
      } else {
        setIsUserLoggedIn(false); 
      }
    });

    return () => unsubscribe();
  }, []);

  if (!isLoadingComplete || isUserLoggedIn === null) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} isFirstTimeUser={isFirstTimeUser} isUserLoggedIn={isUserLoggedIn} />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}
