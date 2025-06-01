import React, { useEffect, useState, useRef } from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { getFirestore, collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

type AuthProps = {
  navigation: any;
};

type Friend = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: any;
  availability?: {
    location: {
      latitude: number;
    };
  };
};

export const AvailableFriends = ({ navigation }: AuthProps) => {
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [availableFriends, setAvailableFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const flatListRef = useRef<FlatList>(null);

useEffect(() => {
  const fetchFriendsStatus = async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // 1. Get list of current user's friends
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const friendIds = userDoc.data()?.friends || [];

      console.log('🧑‍🤝‍🧑 Friend IDs:', friendIds);

      if (friendIds.length === 0) {
        setAvailableFriends([]);
        setLoading(false);
        return;
      }

      // 2. Fetch each friend individually to get full status
      const friendPromises = friendIds.map(async (friendId: string) => {
        const friendDoc = await getDoc(doc(db, 'users', friendId));
        const data = friendDoc.data();
        console.log(`📦 Friend ${friendId}:`, { name: `${data?.firstName} ${data?.lastName}`, status: data?.status });

        return {
          id: friendId,
          firstName: data?.firstName,
          lastName: data?.lastName,
          photoUrl: { uri: data?.photoUrl },
          availability: data?.availability,
          status: data?.status,
        };
      });

      const allFriends = await Promise.all(friendPromises);
      const available = allFriends.filter(friend => friend.status === 'available');

      setAvailableFriends(available);
    } catch (error) {
      console.error('❌ Error fetching friend statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchFriendsStatus();
}, []);

  const toggleSelection = (id: string) => {
    setSelectedFriends(prevSelected =>
      prevSelected.includes(id)
        ? prevSelected.filter(friendId => friendId !== id)
        : [...prevSelected, id]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-1000 justify-center items-center">
        <ActivityIndicator size="large" color="#7DFFA6" />
        <Text className="text-white mt-4">Loading available friends...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-1000">
      <View className="flex-row justify-between items-center px-6 pb-4 mt-8">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-white text-2xl">{"<"}</Text>
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
              <Image source={item.photoUrl} className="w-12 h-12 rounded-full mr-4" />
              <View>
                <Text className="text-white text-lg">{`${item.firstName} ${item.lastName}`}</Text>
                <Text className="text-gray-400 text-sm">
                  {item.availability?.location?.latitude
                    ? `${item.availability.location.latitude.toFixed(2)} miles away`
                    : 'Distance unknown'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-10">
            No friends are currently available.
          </Text>
        }
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
