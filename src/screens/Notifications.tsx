import React from 'react';
import { TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { Text, View } from '../components/Themed';

const notificationsData = [
    { id: '1', name: 'Elliott Tang', message: 'added you as a connection', action: 'Accept' },
    { id: '2', name: 'Snow Kang', message: 'wants to SYNQ', action: 'Start Chat' },
    { id: '3', name: 'Stefanie Baarman', message: 'wants to SYNQ', action: 'Start Chat' },
    { id: '4', name: 'Chris Miller', message: 'sent you a friend request', action: 'Accept' },
    { id: '5', name: 'Julia Snodgrass', message: 'sent you a friend request', action: 'Accept' },
];

export const Notifications = ({ navigation }: any) => {
    return (
        <SafeAreaView>
            <View className="w-full h-full justify-end pl-14">
                <View className="absolute h-2/5 w-screen top-0 bg-green-400 rounded-b-xl" />
                <View className="absolute top-0 gap-6 p-8 flex-row bg-transparent">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text className="text-black text-2xl">{"<"}</Text>
                    </TouchableOpacity>
                    <Text className="text-black text-2xl">Notifications</Text>
                </View>

                <View className="flex bg-gray-900 pr-8 pb-20 rounded-t-xl gap-8">
                    <Text className="text-gray-400 self-end">Clear All</Text>
                    <View style={{ height: 450 }}>
                        <FlatList
                            data={notificationsData}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <View className="mb-8">
                                    <Text className="text-white px-5 text-lg">
                                        <Text className="text-green-400">{item.name} </Text>
                                        {item.message}
                                    </Text>
                                    <TouchableOpacity className="self-center bg-white rounded-md w-40 py-2 mt-2">
                                        <Text className="text-black text-lg text-center">{item.action}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};
