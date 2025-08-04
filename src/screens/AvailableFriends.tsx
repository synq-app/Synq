import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, getDoc, doc, getFirestore } from 'firebase/firestore';

type AuthProps = {
  navigation: any;
};

export const AvailableFriends = ({ navigation }: AuthProps) => {
  const [availableFriends, setAvailableFriends] = useState<
    Array<{
      id: string;
      displayName: string;
      photoURL: string | null;
      memo?: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchAvailableFriends = async () => {
      try {
        if (!auth.currentUser) {
          setAvailableFriends([]);
          setLoading(false);
          return;
        }

        const userId = auth.currentUser.uid;
        const friendsCol = collection(db, 'users', userId, 'friends');
        const friendsSnapshot = await getDocs(friendsCol);

        const friendsList = await Promise.all(
          friendsSnapshot.docs.map(async (docSnap) => {
            const friendId = docSnap.id;
            const friendProfileRef = doc(db, 'users', friendId);
            const friendProfileSnap = await getDoc(friendProfileRef);

            if (friendProfileSnap.exists()) {
              const profileData = friendProfileSnap.data();
              const isAvailable = profileData?.status === 'available';

              if (isAvailable) {
                return {
                  id: friendId,
                  displayName: profileData.displayName || 'Unnamed Friend',
                  photoURL:
                    profileData.photoURL ||
                    profileData.imageUrl ||
                    profileData.imageurl ||
                    null,
                  memo: profileData.memo || 'No memo available',
                };
              }
            }
            return null;
          })
        );

        setAvailableFriends(friendsList.filter(Boolean) as any);
      } catch (error) {
        console.error('🔥 Error fetching available friends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableFriends();
  }, [auth.currentUser]);

  const toggleSelection = (id: string) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleConnect = () => {
    const selectedUsers = availableFriends
      .filter((f) => selectedFriends.includes(f.id))
      .map((f) => ({
        id: f.id,
        firstName: f.displayName,
      }));

    const currentUser = {
      id: auth.currentUser?.uid || 'me',
      firstName: 'You',
    };

    navigation.navigate('Chats', {
      screen: 'Chat',
      params: {
        users: [currentUser, ...selectedUsers],
        messages: [],
      },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-1000">
      <View className="flex-row justify-between items-center px-6 pb-4 mt-8">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-white text-2xl">{"<"}</Text>
        </TouchableOpacity>
        <Text className="text-white text-2xl flex-1 text-center mt-4">Available Friends</Text>
      </View>

      <Text className="text-white text-sm text-center mb-10">
        Select one or more friends to connect with
      </Text>

      <FlatList
        ref={flatListRef}
        data={availableFriends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelected = selectedFriends.includes(item.id);
          return (
            <TouchableOpacity
              onPress={() => toggleSelection(item.id)}
              onLongPress={() => {
                // Instant one-on-one chat on long press
                navigation.navigate('Chats', {
                  screen: 'Chat',
                  params: {
                    users: [
                      { id: auth.currentUser?.uid || 'me', firstName: 'You' },
                      { id: item.id, firstName: item.displayName },
                    ],
                    messages: [],
                  },
                });
              }}
              className={`p-4 m-2 rounded-lg flex-row items-center border ${
                isSelected ? 'border-green-400' : 'border-white'
              }`}
            >
              <Image
                source={{
                  uri: item.photoURL || 'https://www.gravatar.com/avatar/?d=mp&s=50',
                }}
                className="w-12 h-12 rounded-full mr-4"
              />
              <View>
                <Text className="text-white text-lg">{item.displayName}</Text>
                <Text className="text-gray-400 text-sm">{item.memo}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <TouchableOpacity
        disabled={selectedFriends.length === 0}
        onPress={handleConnect}
        className={`${
          selectedFriends.length > 0 ? 'bg-green-400' : 'bg-gray-600'
        } py-4 px-8 rounded-lg mx-6 mb-16 w-48 self-center`}
      >
        <Text
          className={`text-center text-lg ${
            selectedFriends.length > 0 ? 'text-black' : 'text-white'
          }`}
        >
          Connect
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
