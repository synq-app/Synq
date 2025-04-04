import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const db = getFirestore();
const auth = getAuth();

const OPEN_CAGE_API_KEY = '53a680c9fd6343c2a3d7d53958216851';

type AuthProps = {
    navigation: any;
};

export const GettingStarted = ({ navigation }: AuthProps) => {
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [filteredCities, setFilteredCities] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleChangeText = async (text: string) => {
        setCity(text);

        if (text.trim() === '') {
            setFilteredCities([]);
            return;
        }

        setLoading(true);

        try {
            const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
                params: {
                    q: text,
                    key: OPEN_CAGE_API_KEY,
                    limit: 5,
                },
            });

            const cities = response.data.results.map((item: any) => ({
                city: item.components.city || item.components.town || item.components.village,
                state: item.components.state || item.components.region,
            }));

            setFilteredCities(cities);
        } catch (error) {
            console.error("Error fetching city data: ", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCity = (selectedCity: string, selectedState: string) => {
        setCity(selectedCity);
        setState(selectedState);
        setFilteredCities([]);
    };

    const handleSaveCity = async () => {
        if (city.trim() === '' || state.trim() === '') {
            Alert.alert('Error', 'Please enter a city and state.');
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
                onChangeText={handleChangeText}
            />

            {filteredCities.length > 0 && (
                <FlatList
                    data={filteredCities}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="px-4 py-2 border-b border-gray-600"
                            onPress={() => handleSelectCity(item.city, item.state)}
                        >
                            <Text className="text-white text-lg">{item.city}, {item.state}</Text>
                        </TouchableOpacity>
                    )}
                    className="w-4/5 max-h-36 bg-gray-800 rounded-lg mt-2"
                />
            )}

            <TouchableOpacity
                className="bg-green-400 w-20 px-4 py-2 rounded-xl"
                onPress={handleSaveCity}
                disabled={loading}
            >
                <Text className="text-lg text-black font-bold">{'Next'}</Text>
            </TouchableOpacity>
        </View>
    );
};
