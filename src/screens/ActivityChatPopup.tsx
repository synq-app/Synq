import React, { useEffect, useState } from 'react';
import { Modal, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Text, View } from '../components/Themed';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, Timestamp, setDoc } from 'firebase/firestore';

const db = getFirestore();
const auth = getAuth();

interface Friend {
  id: string;
  displayName: string;
  photoURL?: string;
  memo?: string;
}

interface Activity {
  name: string;
  image: string;
  location?: string;
}

export const ActivityChatPopup = ({
  visible,
  onClose,
  activity,
  onCloseAndNavigateBack,
}: {
  visible: boolean;
  onClose: () => void;
  activity: Activity;
  onCloseAndNavigateBack: () => void;
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  useEffect(() => {
    if (!visible) {
      setSelectedFriends([]);
      setShowConfirmation(false);
      return;
    }

    const fetchFriends = async () => {
      setLoading(true);
      try {
        const userId = currentUser.uid;
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

        setFriends(friendsList.filter(Boolean) as Friend[]);
      } catch (error) {
        console.error('Error fetching friends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [visible]);

  const handleSelectFriend = (friendId: string) => {
    setSelectedFriends((prevSelected) => {
      if (prevSelected.includes(friendId)) {
        return prevSelected.filter((id) => id !== friendId);
      } else {
        return [...prevSelected, friendId];
      }
    });
  };

  const sendActivityToChat = async (friendId: string) => {
    if (!activity) return;

    try {
      const chatId =
        currentUser.uid < friendId
          ? `${currentUser.uid}_${friendId}`
          : `${friendId}_${currentUser.uid}`;

      const chatDocRef = doc(db, 'chats', chatId);
      await setDoc(
        chatDocRef,
        {
          participants: [currentUser.uid, friendId],
          createdAt: Timestamp.now(),
        },
        { merge: true }
      );

      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        type: 'activity',
        text: activity.name,
        image: activity.image,
        location: activity.location || '',
        rating: 0,
        senderId: currentUser.uid,
        createdAt: Timestamp.now(),
        read: false,
      });

    } catch (error: any) {
      console.error('Error sending activity:', error.message);
      throw error;
    }
  };

  const sendActivity = async () => {
    if (selectedFriends.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one friend to send this activity to.');
      return;
    }

    setLoading(true);
    const successfullySent: string[] = [];
    const failedToSend: string[] = [];
    
    for (const friendId of selectedFriends) {
      try {
        await sendActivityToChat(friendId);
        successfullySent.push(friendId);
      } catch (e) {
        failedToSend.push(friendId);
      }
    }

    setLoading(false);
    
    if (failedToSend.length > 0) {
        setConfirmationMessage(`Successfully sent to ${successfullySent.length} friends. Failed to send to ${failedToSend.length} friends.`);
    } else {
        setConfirmationMessage(`Activity sent to ${successfullySent.length} friends!`);
    }

    setShowConfirmation(true);
  };

  const renderFriendItem = ({ item }: { item: Friend }) => {
    const isSelected = selectedFriends.includes(item.id);
    return (
      <TouchableOpacity
        className={`flex-row items-center p-3 rounded-lg my-1 ${isSelected ? 'bg-green-600' : 'bg-gray-800'}`}
        onPress={() => handleSelectFriend(item.id)}
      >
        <Image
          source={{ uri: item.photoURL || 'https://www.gravatar.com/avatar/?d=mp&s=50' }}
          className="w-12 h-12 rounded-full mr-3"
        />
        <View className="flex-1 bg-transparent">
          <Text className={`text-lg font-semibold ${isSelected ? 'text-white' : 'text-white'}`}>{item.displayName}</Text>
          <Text className={`text-sm ${isSelected ? 'text-gray-200' : 'text-gray-400'}`}>{item.memo}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const ConfirmationModal = () => (
    <Modal visible={showConfirmation} animationType="fade" transparent>
      <View className="flex-1 justify-center items-center bg-black/80 px-6">
        <View className="bg-gray-800 p-6 rounded-2xl w-full">
          <Text className="text-white text-xl font-bold mb-4 text-center">Confirmation</Text>
          <Text className="text-white text-base mb-6 text-center">{confirmationMessage}</Text>
          <TouchableOpacity
            onPress={() => {
              setShowConfirmation(false);
              onCloseAndNavigateBack();
            }}
            className="bg-green-600 px-5 py-3 rounded-lg"
          >
            <Text className="text-white text-lg font-bold text-center">OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-center items-center bg-black/80 px-6">
        <View className="bg-gray-900 p-5 rounded-2xl w-full max-h-[90%]">
          <View className="flex-row justify-between items-center w-full">
            <Text className="text-white text-2xl mb-3 font-bold">Send Activity</Text>
            <TouchableOpacity onPress={onCloseAndNavigateBack} className="p-2">
              <Text className="text-white text-2xl font-bold">×</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            <View className="flex-row items-center bg-gray-800 p-3 rounded-lg mb-4">
              <Image source={{ uri: activity.image }} className="w-12 h-12 rounded-lg mr-3" />
              <Text className="text-white text-base font-semibold">{activity.name}</Text>
            </View>

            <Text className="text-white text-lg mb-2 font-semibold">
              Select one or more friends to send this to:
            </Text>

            {loading ? (
              <ActivityIndicator size="large" color="#1DB954" className="mt-3" />
            ) : friends.length === 0 ? (
              <Text className="text-white text-center mt-5">No friends available</Text>
            ) : (
              <FlatList
                data={friends}
                keyExtractor={(item) => item.id}
                renderItem={renderFriendItem}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 20 }}
                scrollEnabled={false}
              />
            )}

            <View className="flex-row justify-end mt-4">
              <TouchableOpacity
                onPress={onClose}
                className="bg-gray-600 px-5 py-2 rounded-lg mr-2"
              >
                <Text className="text-white font-semibold">Cancel</Text>
              </TouchableOpacity>
              {selectedFriends.length > 0 && (
                <TouchableOpacity
                  onPress={sendActivity}
                  className="bg-green-600 px-5 py-2 rounded-lg"
                >
                  <Text className="text-white font-bold">Send ({selectedFriends.length})</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
      <ConfirmationModal />
    </Modal>
  );
};