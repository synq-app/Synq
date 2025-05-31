import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import * as Location from 'expo-location';  
import { ENV_VARS } from '../../config';

const db = getFirestore();
const auth = getAuth();

const OPEN_CAGE_API_KEY = ENV_VARS.OPEN_CAGE_API_KEY;

type AuthProps = {
    navigation: any;
};

export const GettingStarted = ({ navigation }: AuthProps) => {
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Permission to access location was denied');
                return;
            }

            const { coords } = await Location.getCurrentPositionAsync({});
            reverseGeocode(coords.latitude, coords.longitude);
        };

        const reverseGeocode = async (latitude: number, longitude: number) => {
            try {
                const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
                    params: {
                        q: `${latitude},${longitude}`,
                        key: OPEN_CAGE_API_KEY,
                    },
                });

                const result = response.data.results[0];
                const cityName = result.components.city || result.components.town || result.components.village;
                const stateName = result.components.state || result.components.region;

                setCity(cityName || '');
                setState(stateName || '');
            } catch (error) {
                console.error('Error reverse geocoding:', error);
            }
        };
        getLocation();
    }, []);

    const handleSaveCity = async () => {
        if (city.trim() === '' || state.trim() === '') {
            Alert.alert('Error', 'Could not fetch location. Please enter a city and state manually.');
            return;
        }

        setLoading(true);

        try {
            const userDocRef = doc(db, 'users', auth.currentUser?.uid || '');
            await setDoc(userDocRef, { city, state }, { merge: true });
            navigation.replace("Returning");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            Alert.alert('Error', 'Failed to save city: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 justify-center items-left bg-black px-5 mb-20">
            <Text className="text-3xl text-white mb-5">Where are you located?</Text>
            <Text className="text-sm w-3/4 text-white mb-5">Set your location to find local events and meet up with friends nearby.</Text>

            <TextInput
                className="h-12 w-4/5 border border-green-400 rounded-xl pl-4 text-white text-lg mb-5"
                placeholder="Enter your city"
                placeholderTextColor="#888"
                value={city}
                editable={false} 
            />

            <TextInput
                className="h-12 w-4/5 border border-green-400 rounded-xl pl-4 text-white text-lg mb-5"
                placeholder="Enter your state"
                placeholderTextColor="#888"
                value={state}
                editable={false} 
            />

            <TouchableOpacity
                className="bg-green-400 w-20 px-4 py-2 rounded-xl"
                onPress={handleSaveCity}
                disabled={loading}
            >
                <Text className="text-lg text-black w-40">{'Next'}</Text>
            </TouchableOpacity>
        </View>
    );
};
