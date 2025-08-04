import React, { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, getDoc, doc, getFirestore } from 'firebase/firestore';
import FriendProfilePopup from './FriendProfilePopup';

export const FriendsScreen = ({ navigation }: any) => {
  const [friends, setFriends] = useState<
    Array<{ id: string; displayName: string; photoURL: string | null }>
  >([]);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [profileVisible, setProfileVisible] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  const handleRemoveFriend = async (friendId: string) => {
    try {
      setFriends((prev) => prev.filter(f => f.id !== friendId));
      setProfileVisible(false);
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        if (!auth.currentUser) return;

        const userId = auth.currentUser.uid;
        const usersCol = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCol);

        const usersList = usersSnapshot.docs
          .filter((docSnap) => {
            const data = docSnap.data();
            return (
              docSnap.id !== userId &&                      // Exclude current user
              data.firstName && typeof data.firstName === 'string' // Must have firstName
            );
          })
          .map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              displayName: data.displayName || data.firstName || 'Unnamed User',
              photoURL: data.photoURL || data.imageUrl || data.imageurl || null,
              location:
                data.city && data.state
                  ? `${data.city}, ${data.state}`
                  : data.city || data.state || 'N/A',
              interests: data.interests || [],
            };
          });

        setFriends(usersList);
      } catch (error) {
        console.error('Error fetching all users:', error);
      }
    };

    fetchAllUsers();
  }, []);


  // useEffect(() => {
  //   const fetchFriends = async () => {
  //     try {
  //       if (!auth.currentUser) {
  //         console.log('❌ No authenticated user found');
  //         setFriends([]);
  //         return;
  //       }
  //       const userId = auth.currentUser.uid;
  //       const friendsCol = collection(db, 'users', userId, 'friends');
  //       const friendsSnapshot = await getDocs(friendsCol);
  //       const friendsList = await Promise.all(
  //         friendsSnapshot.docs.map(async (docSnap) => {
  //           const friendId = docSnap.id;
  //           const friendProfileRef = doc(db, 'users', friendId);
  //           const friendProfileSnap = await getDoc(friendProfileRef);
  //           if (friendProfileSnap.exists()) {
  //             const profileData = friendProfileSnap.data();
  //             return {
  //               id: friendId,
  //               displayName: profileData.displayName || 'Unnamed Friend',
  //               photoURL: profileData.photoURL || profileData.imageUrl || profileData.imageurl || null,
  //               location: profileData.location || `${profileData.city || ''}${profileData.state ? ', ' + profileData.state : ''}` || 'N/A',
  //               interests: profileData.interests || [],
  //             };
  //           } else {
  //             return {
  //               id: friendId,
  //               displayName: 'Unknown Friend',
  //               photoURL: null,
  //               location: 'N/A',
  //               interests: [],
  //             };
  //           }
  //         })
  //       );
  //       setFriends(friendsList);
  //     } catch (error) {
  //       console.error('Error fetching friends:', error);
  //     } finally {
  //     }
  //   };
  //   fetchFriends();
  // }, [auth.currentUser]);

  const openProfile = async (friendId: string) => {
    try {
      const friendDoc = await getDoc(doc(db, 'users', friendId));
      if (friendDoc.exists()) {
        const data = friendDoc.data();
        setSelectedFriend({
          id: friendId,
          displayName: data.displayName || 'Unnamed Friend',
          photoURL: data.photoURL || data.imageUrl || data.imageurl || null,
          location: data.city + ", " + data.state || '',
          interests: data.interests || [],
        });
        setProfileVisible(true);
      }
    } catch (error) {
      console.error('Error opening profile:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <View className="flex-row justify-between items-center p-5">
        <Text className="text-white text-2xl font-bold">All Friends</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddFriends')}
          className="bg-[#1DB954] px-4 py-2 rounded-full"
        >
          <Text className="text-white font-bold">Add Friends</Text>
        </TouchableOpacity>
      </View>

      {friends.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400">You have no friends yet.</Text>
        </View>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => openProfile(item.id)}
              className="flex-row items-center bg-[#1e1e1e] p-4 mb-3 rounded-xl border border-gray-800"
            >
              <Image
                source={{
                  uri: item.photoURL || 'https://www.gravatar.com/avatar/?d=mp&s=50',
                }}
                className="w-12 h-12 rounded-full mr-4"
              />
              <Text className="text-white text-lg">{item.displayName}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {selectedFriend && (
        <FriendProfilePopup
          visible={profileVisible}
          onClose={() => setProfileVisible(false)}
          friend={selectedFriend}
          onRemoveFriend={handleRemoveFriend}

        />
      )}
    </SafeAreaView>
  );
};
