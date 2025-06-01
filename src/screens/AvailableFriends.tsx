import React, { useEffect, useState, useRef } from 'react';
import { Text, View, FlatList, TouchableOpacity,Image, SafeAreaView, ActivityIndicator,} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, getDoc, doc } from 'firebase/firestore';

type AuthProps = {
  navigation: any;
};

type Friend = {
  id: string;
  displayName: string;
  photoURL: string | null;
  memo?: string;
  activeSynqTime?: number;
};

export const AvailableFriends = ({ navigation }: AuthProps) => {
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [availableFriends, setAvailableFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const flatListRef = useRef<FlatList>(null);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchAvailableFriends = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log('No authenticated user found.');
          setAvailableFriends([]);
          setLoading(false);
          return;
        }

        const friendsCol = collection(db, 'users', currentUser.uid, 'friends');
        const friendsSnapshot = await getDocs(friendsCol);

        const friendsList: Friend[] = [];

        for (const friendDoc of friendsSnapshot.docs) {
          const friendId = friendDoc.id;
          const friendProfileRef = doc(db, 'users', friendId);
          const friendProfileSnap = await getDoc(friendProfileRef);

          if (friendProfileSnap.exists()) {
            const profileData = friendProfileSnap.data();
            const activeSynqTime = profileData.activeSynqTime || 0;
            const isAvailable = activeSynqTime > 0;

            if (isAvailable) {
              friendsList.push({
                id: friendId,
                displayName: profileData.displayName || 'Unnamed Friend',
                photoURL:
                  profileData.photoURL ||
                  profileData.imageUrl ||
                  profileData.imageurl ||
                  null,
                memo: profileData.memo || '',
                activeSynqTime,
              });
            }
          }
        }
        setAvailableFriends(friendsList);
      } catch (error) {
        console.error('Error fetching available friends:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailableFriends();
  }, []);

  const toggleSelection = (id: string) => {
    setSelectedFriends((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((friendId) => friendId !== id);
      } else {
        return [...prevSelected, id];
      }
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
          <Text className="text-white text-2xl">{'<'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-2xl flex-1 text-center mt-4">
          Available Friends
        </Text>
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
              className={`p-4 m-2 rounded-lg flex-row items-center border ${
                isSelected ? 'border-green-400' : 'border-white'
              }`}
            >
              <Image
                source={{
                  uri:
                    item.photoURL ||
                    'https://www.gravatar.com/avatar/?d=mp&s=50',
                }}
                className="w-12 h-12 rounded-full mr-4"
              />
              <View>
                <Text className="text-white text-lg">{item.displayName}</Text>
                <Text className="text-gray-400 text-sm">
                  {item.memo || ''}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <TouchableOpacity
        disabled={selectedFriends.length === 0}
        onPress={() => {
          if (selectedFriends.length > 0) {
            navigation.navigate('Default');
          }
        }}
        className={`${
          selectedFriends.length > 0 ? 'bg-green-400' : 'bg-gray-500'
        } py-4 px-8 rounded-lg mx-6 mb-16 w-48 self-center`}
      >
        <Text
          className={`text-center ${
            selectedFriends.length > 0 ? 'text-black' : 'text-white'
          } text-lg`}
        >
          Connect
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
