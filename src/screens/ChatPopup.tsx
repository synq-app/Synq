import React, { useState } from 'react';
import {
  Modal,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Text, View } from '../components/Themed';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
  doc,
  setDoc,
} from 'firebase/firestore';

const auth = getAuth();
const db = getFirestore();

const ChatPopup = ({ visible, onClose, friend }: any) => {
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (!message.trim()) {
      Alert.alert('Please enter a message');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('You must be logged in to send messages');
      return;
    }

    try {
      const chatId =
        currentUser.uid < friend.id
          ? `${currentUser.uid}_${friend.id}`
          : `${friend.id}_${currentUser.uid}`;

      const chatDocRef = doc(db, 'chats', chatId);

      await setDoc(
        chatDocRef,
        {
          participants: [currentUser.uid, friend.id],
          createdAt: Timestamp.now(),
        },
        { merge: true }
      );

      const messagesRef = collection(db, 'chats', chatId, 'messages');

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore write timeout')), 5000)
      );

      const addDocPromise = addDoc(messagesRef, {
        text: message.trim(),
        senderId: currentUser.uid,
        createdAt: Timestamp.now(),
      });

      await Promise.race([addDocPromise, timeoutPromise]);
      setMessage('');
      onClose();
    } catch (error: any) {
      Alert.alert('Failed to send message', error.message || error.toString());
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-center items-center bg-black/80 px-6">
        <View className="bg-[#222] p-5 rounded-2xl w-full">
          <Text className="text-white text-lg mb-3">
            Chat with {friend?.displayName || 'Friend'}
          </Text>

          <TextInput
            className="bg-white text-black rounded-lg p-3 mb-4 min-h-[60px]"
            placeholder="Type your message..."
            multiline
            value={message}
            onChangeText={setMessage}
            placeholderTextColor="#888"
            textAlignVertical="top"
          />

          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-600 px-5 py-2 rounded-lg"
            >
              <Text className="text-white">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSend}
              className="bg-[#1DB954] px-5 py-2 rounded-lg"
            >
              <Text className="text-black font-bold">Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ChatPopup;
