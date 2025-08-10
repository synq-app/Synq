import React, { useEffect, useState, useRef } from 'react';
import { TextInput, TouchableOpacity, Alert, ScrollView, Image, FlatList, ActivityIndicator } from 'react-native';
import { Text, View } from '../components/Themed';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
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
  const [currentChatFriend, setCurrentChatFriend] = useState<{
    id: string;
    displayName: string;
    photoURL?: string;
    chatId: string;
  } | null>(null);
  const [allChatsVisible, setAllChatsVisible] = useState(false);
  const [groupChatPopupVisible, setGroupChatPopupVisible] = useState(false);
  const [groupChatInfo, setGroupChatInfo] = useState<{
    chatId: string;
    participants: string[];
    groupName: string;
  } | null>(null);

  const flatListRef = useRef<FlatList>(null);

  const handleSaveMemo = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert('Error', 'No user is logged in.');
    try {
      await setDoc(doc(db, 'users', user.uid), { memo }, { merge: true });
    } catch (error) {
      console.error('Error saving memo: ', error);
    }
  };

  const updateSynqTimeInFirestore = (synqTime: number) => {
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      setDoc(userDocRef, { activeSynqTime: synqTime }, { merge: true }).catch(
        (error) => console.error('Error updating synq time:', error)
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
      setDoc(doc(db, 'users', user.uid), { status: 'available', activeSynqTime: 0 }, { merge: true })
        .then(() => setIsUserAvailable(true))
        .catch((error) => console.error('Error setting user status:', error));
    }
  };

  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId as unknown as number);
      setIsTimerRunning(false);
      setIntervalId(null);
    }

    const user = auth.currentUser;
    if (user) {
      setDoc(doc(db, 'users', user.uid), { activeSynqTime: synqTime, status: 'unavailable' }, { merge: true })
        .then(() => setIsUserAvailable(false))
        .catch((error) => console.error('Error updating status:', error));
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
                photoURL: profileData.photoURL || profileData.imageUrl || profileData.imageurl || null,
                memo: profileData.memo || 'No memo available',
              };
            }
          }
          return null;
        })
      );

      setAvailableFriends(friendsList.filter(Boolean) as any);
    } catch (error) {
      console.error('🔥 Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkUserStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        const data = userSnap.data();
        if (data?.status === 'available') {
          setIsUserAvailable(true);
          fetchAvailableFriends();
        }
      }
    };
    checkUserStatus();
  }, []);
  if (isUserAvailable) {
    return (
      <View className="flex-1 bg-black pt-4">
        <View className="flex-row justify-between items-center px-4 pt-20 pb-4">
          <TouchableOpacity onPress={() => setAllChatsVisible(true)}>
            <Ionicons name="chatbubble-ellipses-outline" size={28} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Synq is active</Text>
          <TouchableOpacity onPress={() => navigation.navigate('EditMemoScreen', { memo })}>
            <Ionicons name="create-outline" size={26} color="white" />
          </TouchableOpacity>
        </View>

        <Text className="text-white text-center text-base mb-3">
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
                    className={`p-4 m-2 rounded-xl flex-row items-center border-2 ${isSelected ? 'border-[#1DB954]' : 'border-white'
                      }`}
                  >
                    <Image
                      source={{
                        uri: item.photoURL || 'https://www.gravatar.com/avatar/?d=mp&s=50',
                      }}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                    <View>
                      <Text className="text-white text-lg">{item.displayName}</Text>
                      <Text className="text-gray-400 text-sm">{item.memo}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={{ paddingBottom: 80 }}
              className="w-full px-4"
            />

            <TouchableOpacity
              disabled={selectedFriends.length === 0}
              onPress={async () => {
                if (selectedFriends.length === 1) {
                  const friend = availableFriends.find(f => f.id === selectedFriends[0]);
                  if (friend) {
                    setCurrentChatFriend(friend);
                    setChatPopupVisible(true);
                  }
                }
                else if (selectedFriends.length > 1) {
                  const currentUser = auth.currentUser;
                  if (!currentUser) return;

                  const groupParticipants = [currentUser.uid, ...selectedFriends];
                  const groupName = `Group with ${selectedFriends.length} friends`; 

                  const chatDocRef = doc(collection(db, 'chats'));
                  await setDoc(chatDocRef, {
                    participants: groupParticipants,
                    type: 'group',
                    groupName,
                    createdAt: Timestamp.now(),
                  });

                  setGroupChatInfo({
                    chatId: chatDocRef.id,
                    participants: groupParticipants,
                    groupName,
                  });

                  setGroupChatPopupVisible(true);
                }
                else {
                  Alert.alert('Group chat coming soon');
                }
              }}
              className={`${selectedFriends.length > 0 ? 'bg-[#1DB954]' : 'bg-gray-600'
                } py-4 px-8 rounded-xl self-center mb-6`}
            >
              <Text
                className={`text-center text-lg ${selectedFriends.length > 0 ? 'text-black font-bold' : 'text-white'
                  }`}
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
        {groupChatInfo && (
          <ChatPopup
            visible={groupChatPopupVisible}
            onClose={() => {
              setGroupChatPopupVisible(false);
              navigation.navigate('FullChatScreen', {
                chatId: groupChatInfo.chatId,
                type: 'group',
                groupName: groupChatInfo.groupName,
                participants: groupChatInfo.participants,
              });
              setSelectedFriends([]); 
              setGroupChatInfo(null);
            }}
            groupChat={groupChatInfo} 
          />
        )}

        <ChatModal
          visible={allChatsVisible}
          onClose={() => setAllChatsVisible(false)}
          onOpenChat={(friend: any) => {
            setAllChatsVisible(false);
            navigation.navigate('FullChatScreen', {
              chatId: friend.chatId,
              friendId: friend.id,
              friendName: friend.displayName,
              photoURL: friend.photoURL
            });
          }}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 bg-black justify-center items-center">
        <View className="w-4/5 items-center mt-20">
          <Text className="text-white text-2xl text-center mt-20 font-semibold">
            Tap when you're free to meet up
          </Text>
          
          <View className="w-[90%] my-5">
            <TextInput
              multiline
              numberOfLines={4}
              value={memo}
              onChangeText={setMemo}
              className="text-white text-center text-base italic border-b border-[#7DFFA6] bg-black px-3 py-2 w-[360px] -ml-12"
              placeholder="Optional note: (Anyone want to grab a drink?)"
              placeholderTextColor="#A0A0A0"
            />
          </View>

          <TouchableOpacity onPress={handleSynqPress}>
            <Image
              source={require('../screens/FirstTimeUser/pulse.gif')}
              className="w-72 h-72"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};
