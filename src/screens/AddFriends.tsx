// NEEDS STYLING FIXES
import React, { useState } from 'react';
import { TextInput, Button, Alert, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { View, Text } from '../components/Themed';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface AddFriendScreenProps {
  navigation: any;
}

const AddFriendScreen = ({ navigation }: AddFriendScreenProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  const handleSearch = async () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    setLoading(true);
    setFoundUser(null);

    try {
      const usersRef = collection(db, 'users');
      const emailQuery = query(usersRef, where('email', '==', trimmed));
      const phoneQuery = query(usersRef, where('phoneNumber', '==', trimmed));
      const nameQuery = query(usersRef, where('displayName', '==', trimmed));

      const [emailSnap, phoneSnap, nameSnap] = await Promise.all([
        getDocs(emailQuery),
        getDocs(phoneQuery),
        getDocs(nameQuery),
      ]);

      const allDocs = [...emailSnap.docs, ...phoneSnap.docs, ...nameSnap.docs];

      const uniqueUsers = new Map<string, any>();
      allDocs.forEach((docSnap) => {
        if (!uniqueUsers.has(docSnap.id)) {
          uniqueUsers.set(docSnap.id, docSnap);
        }
      });

      uniqueUsers.delete(currentUser?.uid || '');

      if (uniqueUsers.size === 0) {
        Alert.alert('No user found with that name, email, or phone number.');
      } else {
        const firstDoc = Array.from(uniqueUsers.values())[0];
        const userData = firstDoc.data();
        setFoundUser({
          ...userData,
          uid: firstDoc.id,
        });
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error searching for user.');
    }

    setLoading(false);
  };

  const handleSendRequest = async () => {
    if (!foundUser || !currentUser) return;

    const requestId = `${currentUser.uid}_${foundUser.uid}`;
    try {
      await setDoc(doc(db, 'friendRequests', requestId), {
        from: currentUser.uid,
        to: foundUser.uid,
        status: 'pending',
        timestamp: new Date(),
      });
      Alert.alert('Friend request sent!');
      setFoundUser(null);
      setSearchTerm('');
    } catch (err) {
      console.error(err);
      Alert.alert('Error sending friend request.');
    }
  };

  const navigateToNetworkTab = () => {
    navigation.navigate('Network');
  };

  return (
    <SafeAreaView className="flex-1 px-4 pt-6 bg-[#121212]">
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="mb-4"
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <Text className="text-white text-2xl font-bold mb-6">Add a Friend</Text>

      <TextInput
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search by name, email, or phone"
        placeholderTextColor="#888"
        className="border border-gray-700 rounded-lg p-3 mb-4 text-white"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Button
        title="Search"
        onPress={handleSearch}
        disabled={loading || searchTerm.trim() === ''}
      />

      {loading && (
        <ActivityIndicator className="mt-6" size="large" color="#1DB954" />
      )}

      {foundUser && (
        <View className="mt-6 p-4 bg-[#1e1e1e] rounded-xl border border-gray-800 flex-row items-center">
          <Image
            source={{
              uri:
                foundUser.photoURL ||
                foundUser.imageUrl ||
                foundUser.imageurl ||
                'https://www.gravatar.com/avatar/?d=mp&s=100',
            }}
            className="w-16 h-16 rounded-full mr-4"
          />
          <View className="flex-1">
            <Text className="text-white text-lg font-semibold">
              {foundUser.displayName || 'Unknown'}
            </Text>
            <Text className="text-gray-400">{foundUser.email || ''}</Text>
            <Text className="text-gray-400">
              {foundUser.phoneNumber || ''}
            </Text>
            <TouchableOpacity
              onPress={handleSendRequest}
              className="mt-3 bg-[#1DB954] py-2 px-4 items-center w-3/4 rounded-lg"
              activeOpacity={0.8}
            >
              <Text className="text-white">Send Friend Request</Text>
            </TouchableOpacity>

          </View>
        </View>
      )}
      <TouchableOpacity onPress={navigateToNetworkTab} className="mt-4 p-2">
        <Text className="text-blue-500 text-lg">Add from Contacts</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AddFriendScreen;
