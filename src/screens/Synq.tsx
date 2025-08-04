import React, { useEffect, useState, useRef } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons'; // Optional, for chat icon
import { ChatModal } from './ChatModal';
import ChatPopup from './ChatPopup';

const db = getFirestore();
const auth = getAuth();


export const SynqScreen = ({ navigation }: any) => {
  const [memo, setMemo] = useState('');
  const [synqTime, setSynqTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null);
  const [isUserAvailable, setIsUserAvailable] = useState(false);

  const [availableFriends, setAvailableFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  const [chatPopupVisible, setChatPopupVisible] = useState(false);
  const [currentChatFriend, setCurrentChatFriend] = useState<any>(null);

  const [allChatsVisible, setAllChatsVisible] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const handleSaveMemo = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userDocRef, { memo }, { merge: true });
      } catch (error) {
        console.error('Error saving memo: ', error);
      }
    } else {
      Alert.alert('Error', 'No user is logged in.');
    }
  };

  const updateSynqTimeInFirestore = (synqTime: number) => {
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      setDoc(userDocRef, { activeSynqTime: synqTime }, { merge: true }).catch(
        (error) => {
          console.error('Error updating synq time in Firestore:', error);
        }
      );
    }
  };

  const startTimer = () => {
    if (isTimerRunning) return;

    setIsTimerRunning(true);
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      setSynqTime(elapsedTime);
      updateSynqTimeInFirestore(elapsedTime);
    }, 1000);
    setIntervalId(interval);

    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      setDoc(userDocRef, { status: 'available', activeSynqTime: 0 }, { merge: true })
        .then(() => setIsUserAvailable(true))
        .catch((error) => console.error('Error setting user status:', error));
    }
  };

  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId as unknown as number);
      setIsTimerRunning(false);
      setIntervalId(null);

      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        setDoc(
          userDocRef,
          { activeSynqTime: synqTime, status: 'unavailable' },
          { merge: true }
        )
          .then(() => setIsUserAvailable(false))
          .catch((error) => console.error('Error updating user status:', error));
      }
    }
  };

  const handleSynqPress = () => {
    handleSaveMemo();
    startTimer();
  };

  const toggleSelection = (id: string) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

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
      console.log(friendsSnapshot)

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

  useEffect(() => {
    const checkUserStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data?.status === 'available') {
            setIsUserAvailable(true);
            fetchAvailableFriends();
          }
        }
      }
    };

    checkUserStatus();
  }, []);

  if (isUserAvailable) {
    return (
      <View style={{ flex: 1, backgroundColor: 'black', paddingTop: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingTop: 80,
            paddingBottom: 16,
          }}
        >
          <TouchableOpacity onPress={() => setAllChatsVisible(true)}>
            <Ionicons name="chatbubble-ellipses-outline" size={28} color="white" />
          </TouchableOpacity>

          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
            Synq is active
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('EditMemoScreen', { memo })}
          >
            <Ionicons name="create-outline" size={26} color="white" />
          </TouchableOpacity>

        </View>

        <Text style={{ color: 'white', fontSize: 16, textAlign: 'center', marginBottom: 12 }}>
          Here are more available friends
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#1DB954" />
        ) : (
          <>
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
                      setCurrentChatFriend(item);
                      setChatPopupVisible(true);
                    }}
                    style={{
                      padding: 16,
                      margin: 8,
                      borderRadius: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: isSelected ? '#1DB954' : 'white',
                    }}
                  >
                    <Image
                      source={{
                        uri: item.photoURL || 'https://www.gravatar.com/avatar/?d=mp&s=50',
                      }}
                      style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
                    />
                    <View>
                      <Text style={{ color: 'white', fontSize: 18 }}>{item.displayName}</Text>
                      <Text style={{ color: '#AAA', fontSize: 14 }}>{item.memo}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={{ paddingBottom: 80 }}
              style={{ width: '100%', paddingHorizontal: 16 }}
            />

            <TouchableOpacity
              disabled={selectedFriends.length === 0}
              onPress={() => {
                if (selectedFriends.length === 1) {
                  const friend = availableFriends.find(
                    (f) => f.id === selectedFriends[0]
                  );
                  if (friend) {
                    setCurrentChatFriend(friend);
                    setChatPopupVisible(true);
                  }
                } else {
                  Alert.alert('Group chat coming soon');
                }
              }}
              style={{
                backgroundColor: selectedFriends.length > 0 ? '#1DB954' : '#666',
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 12,
                alignSelf: 'center',
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  color: selectedFriends.length > 0 ? 'black' : 'white',
                  fontSize: 18,
                  textAlign: 'center',
                }}
              >
                Connect
              </Text>
            </TouchableOpacity>
          </>
        )}

        <ChatPopup
          visible={chatPopupVisible}
          onClose={() => setChatPopupVisible(false)}
          friend={currentChatFriend}
        />

        <ChatModal
          visible={allChatsVisible}
          onClose={() => setAllChatsVisible(false)}
          onOpenChat={(friend: any) => {
            setCurrentChatFriend(friend);
            setChatPopupVisible(true);
          }}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: '80%', alignItems: 'center', marginTop: 80 }}>
          <Text style={{ color: 'white', fontSize: 30, textAlign: 'center', marginTop: 80, fontWeight: '600' }}>
            Tap when you're free to meet up
          </Text>

          <View style={{ width: '90%', marginBottom: 20, marginTop: 20 }}>
            <TextInput
              multiline
              numberOfLines={4}
              value={memo}
              onChangeText={setMemo}
              editable
              style={{
                width: 360,
                color: 'white',
                fontSize: 16,
                textAlign: 'center',
                borderBottomWidth: 1,
                borderBottomColor: '#7DFFA6',
                backgroundColor: 'black',
                paddingHorizontal: 12,
                paddingVertical: 8,
                fontStyle: 'italic',
                marginLeft: -50,
              }}
              placeholder="Optional note: (Anyone want to grab a drink?)"
              placeholderTextColor="#A0A0A0"
            />
          </View>

          <TouchableOpacity onPress={handleSynqPress}>
            <Image
              source={require('../screens/FirstTimeUser/pulse.gif')}
              style={{ width: 280, height: 280 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};