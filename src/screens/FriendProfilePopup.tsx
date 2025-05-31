import React from 'react';
import {
    Modal,
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';


interface FriendProfilePopupProps {
    visible: boolean;
    onClose: () => void;
    friend: {
        id: string;
        displayName: string;
        photoURL: string | null;
        location: string;
        interests: string[];
    };
    onRemoveFriend: (friendId: string) => void;  
}

const FriendProfilePopup = ({ visible, onClose, friend, onRemoveFriend }: FriendProfilePopupProps) => {
    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 justify-center items-center bg-black/80">
                <View className="bg-[#1e1e1e] rounded-2xl p-6 w-[90%] max-w-xl">
                    <TouchableOpacity
                        onPress={onClose}
                        className="absolute top-3 right-3 z-50"
                    >
                        <Text className="text-white text-xl">✕</Text>
                    </TouchableOpacity>

                    <View className="items-center justify-center mt-2 mb-4">
                        <View className="relative w-32 h-32 items-center justify-center">
                            <View style={StyleSheet.absoluteFillObject}>
                                <QRCode
                                    value={friend.id}
                                    size={128}
                                    backgroundColor="transparent"
                                    color="white"
                                />
                            </View>
                            <Image
                                source={{
                                    uri: friend.photoURL || 'https://www.gravatar.com/avatar/?d=mp&s=100',
                                }}
                                className="w-24 h-24 rounded-full z-10"
                            />
                        </View>
                        <Text
                            className="text-[#7DFFA6] text-2xl font-semibold mt-3 text-center"
                            style={{ fontFamily: 'Avenir' }}
                        >
                            {friend.displayName}
                        </Text>
                    </View>
                    <View className="mt-4">
                        <Text className="text-gray-400 text-sm">Location</Text>
                        <Text className="text-white text-lg">{friend.location || 'N/A'}</Text>
                    </View>
                    <View className="mt-4">
                        <Text className="text-gray-400 text-sm mb-1">Interests</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="flex-row"
                        >
                            {friend.interests && friend.interests.length > 0 ? (
                                friend.interests.map((interest, idx) => (
                                    <View
                                        key={idx}
                                        className="bg-[#333] px-3 py-1 rounded-full mr-2"
                                    >
                                        <Text className="text-white text-sm">{interest}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text className="text-gray-500">No interests listed.</Text>
                            )}
                        </ScrollView>
                    </View>
                    <TouchableOpacity
                    onPress={() => onRemoveFriend(friend.id)}
                    className="mt-6 border-2 border-[#7DFFA6] px-4 py-3 rounded-lg"
                    >
                    <Text className="text-[#7DFFA6] text-center font-semibold">Remove Friend</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
};
export default FriendProfilePopup;