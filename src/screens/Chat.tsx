import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  Text,
  TextInput,
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useHeaderHeight } from '@react-navigation/elements';

type User = {
  id: string;
  firstName: string;
  photoURL?: string;
};

type Message = {
  id: string;
  sender: User;
  text: string;
  timestamp: number;
};

export function ChatScreen({ navigation, route }: any) {
  const { messages: initialMessages, users } = route.params as {
    messages: Message[];
    users: User[];
  };

  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [text, setText] = useState('');
  const [currentUserProfile, setCurrentUserProfile] = useState<User | null>(null);

  const headerHeight = useHeaderHeight();
  const auth = getAuth();
  const db = getFirestore();

  const currentUserId = auth.currentUser?.uid;
  const otherUser = users.find((u) => u.id !== currentUserId);
  const chatTitle = otherUser ? `You & ${otherUser.firstName}` : 'Chat';

  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      if (!currentUserId) return;
      const docRef = doc(db, 'users', currentUserId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setCurrentUserProfile({
          id: currentUserId,
          firstName: data.displayName || 'You',
          photoURL: data.imageurl || 'https://www.gravatar.com/avatar/?d=mp',
        });
      } else {
        setCurrentUserProfile({
          id: currentUserId,
          firstName: 'You',
          photoURL: 'https://www.gravatar.com/avatar/?d=mp',
        });
      }
    };
    fetchCurrentUserProfile();
  }, [currentUserId]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleSend = () => {
    if (!text.trim() || !currentUserProfile) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: currentUserProfile,
      text: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setText('');
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isCurrentUser = item.sender.id === currentUserId;

    const timeString = new Date(item.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View
        className={`flex-row items-end my-2 px-4 ${
          isCurrentUser ? 'justify-end' : 'justify-start'
        }`}
      >
        {!isCurrentUser && (
          <Image
            source={{ uri: item.sender.photoURL || 'https://www.gravatar.com/avatar/?d=mp' }}
            className="w-9 h-9 rounded-full mr-2"
          />
        )}
        <View
          className={`p-3 rounded-xl max-w-[75%] ${
            isCurrentUser ? 'bg-green-500' : 'bg-gray-800'
          }`}
        >  
          <Text className="text-white">{item.text}</Text>
          <Text className="text-gray-300 text-xs mt-1 text-right">{timeString}</Text>
        </View>
        {isCurrentUser && (
          <Image
            source={{ uri: item.sender.photoURL || 'https://www.gravatar.com/avatar/?d=mp' }}
            className="w-9 h-9 rounded-full ml-2"
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity onPress={() => navigation.navigate('Default')}>
          <Text className="text-white text-2xl">{'<'}</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1 text-center mr-8">{chatTitle}</Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight + 24}
      >
        <View className="bg-gray-950 p-3 flex-row items-center">
          <TextInput
            className="flex-1 h-12 bg-gray-800 rounded-lg px-3 text-white"
            value={text}
            onChangeText={(val) => {
              setText(val);
            }}
            onSubmitEditing={handleSend}
            placeholder="Send a message"
            placeholderTextColor="#888"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
