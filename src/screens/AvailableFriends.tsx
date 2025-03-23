import React, { useState, useRef } from 'react';
import { Text, View, FlatList, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { mockUsers } from '../../src/constants/Mocks';

type AuthProps = {
    navigation: any;
};

export const AvailableFriends = ({ navigation }: AuthProps) => {
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const flatListRef = useRef<FlatList>(null);

    const toggleSelection = (id: string) => {
        setSelectedFriends((prevSelected) => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter((friendId) => friendId !== id);
            } else {
                return [...prevSelected, id];
            }
        });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'bg-gray-900' }}>
            <View className="flex-row justify-between items-center px-6 pb-4 mt-8">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text className='text-white text-2xl'>
                        {"<"}
                    </Text>
                </TouchableOpacity>
                <Text className="text-white text-2xl flex-1 text-center mt-4">Available Friends</Text>
            </View>
            <Text className="text-white text-sm text-center mb-10">Select one or more friends to connect with</Text>

            <FlatList
                ref={flatListRef}
                data={mockUsers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const isSelected = selectedFriends.includes(item.id);
                    return (
                        <TouchableOpacity
                            onPress={() => toggleSelection(item.id)}
                            className={`p-4 m-2 rounded-lg flex-row items-center border ${isSelected ? 'border-green-400' : 'border-white'}`}
                        >
                            <Image source={item.photoUrl} className="w-12 h-12 rounded-full mr-4" />
                            <View>
                                <Text className="text-white text-lg">{`${item.firstName} ${item.lastName}`}</Text>
                                <Text className="text-gray-400 text-sm">{`${item.availability.location.latitude.toFixed(2)} miles away`}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
                contentContainerStyle={{ paddingBottom: 80 }}
            />

            <TouchableOpacity
                disabled={selectedFriends.length === 0}
                style={{
                    backgroundColor: selectedFriends.length > 0 ? '#7DFFA6' : 'gray',
                    paddingVertical: 15,
                    borderRadius: 8,
                    marginHorizontal: 20,
                    marginBottom: 60,
                    width: 200,
                    alignContent: 'center',
                    alignSelf: 'center'
                }}
            >
                <Text style={{ textAlign: 'center', color:  selectedFriends.length > 0 ? 'black' : 'white', fontSize: 18 }}>Connect</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};
