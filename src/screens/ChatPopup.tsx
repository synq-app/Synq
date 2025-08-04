import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
  doc,
  getDoc,
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

    const docRef = await Promise.race([addDocPromise, timeoutPromise]) as import('firebase/firestore').DocumentReference;
    setMessage('');
    onClose();
  } catch (error: any) {
    Alert.alert('Failed to send message', error.message || error.toString());
  }
};

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.8)',
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            backgroundColor: '#222',
            padding: 20,
            borderRadius: 16,
            width: '100%',
          }}
        >
          <Text style={{ color: 'white', fontSize: 18, marginBottom: 12 }}>
            Chat with {friend?.displayName || 'Friend'}
          </Text>
          <TextInput
            style={{
              backgroundColor: 'white',
              color: 'black',
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
              minHeight: 60,
              textAlignVertical: 'top',
            }}
            placeholder="Type your message..."
            multiline
            value={message}
            onChangeText={setMessage}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: '#555',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: 'white' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSend}
              style={{
                backgroundColor: '#1DB954',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: 'black', fontWeight: 'bold' }}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ChatPopup;
