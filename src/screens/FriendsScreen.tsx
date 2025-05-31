import React, { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, getDoc, doc, getFirestore } from 'firebase/firestore';

export const FriendsScreen = ({ navigation }: any) => {
  const [friends, setFriends] = useState<Array<{ id: string; displayName: string }>>([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        if (!auth.currentUser) {
          console.log('❌ No authenticated user found');
          setFriends([]);
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
              return {
                id: friendId,
                displayName: profileData.displayName || 'Unnamed Friend',
              };
            } else {
              return {
                id: friendId,
                displayName: 'Unknown Friend',
              };
            }
          })
        );

        setFriends(friendsList);
      } catch (error) {
        console.error('🔥 Error fetching friends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [auth.currentUser]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
      <View style={{ padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>All Friends</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddFriends')} 
          style={{
            backgroundColor: '#1DB954',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Add Friend</Text>
        </TouchableOpacity>
      </View>

      {friends.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'gray' }}>You have no friends yet.</Text>
        </View>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: '#1e1e1e',
                padding: 16,
                marginBottom: 12,
                borderRadius: 12,
                borderColor: '#333',
                borderWidth: 1,
              }}
            >
              <Text style={{ fontSize: 18, color: 'white' }}>{item.displayName}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};
