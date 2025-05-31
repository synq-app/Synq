import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
} from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 

interface AddFriendScreenProps {
  navigation: any;
}

const AddFriendScreen = ({ navigation }: AddFriendScreenProps) => {
  const [email, setEmail] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const logAllUsers = async () => {
      const usersRef = collection(db, 'users');
      try {
        const snapshot = await getDocs(usersRef);
        console.log('📋 All users in Firestore:');
        snapshot.forEach((doc) => {
          console.log(`🧑‍🦱 User ID: ${doc.id}`, doc.data());
        });
      } catch (error) {
        console.error('❌ Error fetching users:', error);
      }
    };

    logAllUsers();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setFoundUser(null);
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        Alert.alert('No user found with that email.');
      } else {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        if (userDoc.id === currentUser?.uid) {
          Alert.alert("That's you!");
        } else {
          setFoundUser({ ...userData, uid: userDoc.id });
        }
      }
    } catch (err) {
      Alert.alert('Error searching for user.');
      console.error(err);
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
      setEmail('');
    } catch (err) {
      Alert.alert('Error sending friend request.');
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={{ padding: 16 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: 'white' }}>Add a Friend</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter email address"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 8,
          marginBottom: 12,
          color: 'white'
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Button title="Search" onPress={handleSearch} disabled={loading || email === ''} />

      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}

      {foundUser && (
        <View
          style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: '#f2f2f2',
            borderRadius: 10,
          }}
        >
          <Text style={{ fontSize: 18 }}>{foundUser.displayName || ''}</Text>
          <Text style={{ color: '#666' }}>{foundUser.email}</Text>
          <View style={{ marginTop: 12 }}>
            <Button title="Send Friend Request" onPress={handleSendRequest} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default AddFriendScreen;
