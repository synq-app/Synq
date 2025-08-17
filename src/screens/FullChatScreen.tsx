import React, { useEffect, useState, useRef } from 'react';
import {
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Image,
} from 'react-native';
import { Text, View } from '../components/Themed';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  Timestamp,
  getDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

const FullChatScreen = ({ route, navigation }: any) => {
  const { chatId, friendName, friendId, photoURL: friendPhoto, groupChat } = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [participantPhotos, setParticipantPhotos] = useState<Record<string, string>>({});
  const flatListRef = useRef<FlatList>(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    (async () => {
      const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
      const data = docSnap.data();
      setUserPhoto(
        data?.photoURL || data?.imageUrl || data?.imageurl || 'https://www.gravatar.com/avatar/?d=mp&s=50'
      );
    })();
  }, [currentUser]);

  useEffect(() => {
    if (groupChat?.participants?.length) {
      const fetchPhotos = async () => {
        const photos: Record<string, string> = {};
        for (const uid of groupChat.participants) {
          try {
            const docSnap = await getDoc(doc(db, 'users', uid));
            const data = docSnap.data();
            photos[uid] =
              data?.photoURL || data?.imageUrl || data?.imageurl || 'https://www.gravatar.com/avatar/?d=mp&s=50';
          } catch {
            photos[uid] = 'https://www.gravatar.com/avatar/?d=mp&s=50';
          }
        }
        setParticipantPhotos(photos);
      };
      fetchPhotos();
    }
  }, [groupChat]);

  useEffect(() => {
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt'));
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
    });
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    if (!currentUser) return;
    messages.forEach((msg) => {
      if (msg.senderId !== currentUser.uid && !msg.read) {
        const msgDoc = doc(db, 'chats', chatId, 'messages', msg.id);
        updateDoc(msgDoc, { read: true }).catch(console.error);
      }
    });
  }, [messages, currentUser, chatId]);

  const sendMessage = async () => {
    if (!messageText.trim() || !currentUser) return;
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: messageText.trim(),
      senderId: currentUser.uid,
      createdAt: Timestamp.now(),
      read: false,
    });
    setMessageText('');
  };

  const chatTitle = groupChat?.groupName || friendName || 'Chat';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View className="flex-1">
        {/* Header */}
        <View className="pt-16 pb-4 px-4 bg-[#121212] border-b border-gray-800 flex-row justify-between items-center">
          <Text className="text-white text-xl font-semibold">{chatTitle}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-white text-3xl">×</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
          keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'none'}
          onScrollBeginDrag={() => {
            if (Platform.OS === 'android') {
              Keyboard.dismiss();
            }
          }}
          renderItem={({ item }) => {
            const isMe = item.senderId === currentUser?.uid;
            let profileImage = userPhoto;

            if (!isMe) {
              profileImage = groupChat
                ? participantPhotos[item.senderId] || 'https://www.gravatar.com/avatar/?d=mp&s=50'
                : friendPhoto || 'https://www.gravatar.com/avatar/?d=mp&s=50';
            }

            const isActivity = !!item.image && (item.location || item.rating !== undefined);

            return (
              <View className={`px-3 my-2 ${isMe ? 'items-end' : 'items-start'}`}>
                <View className="flex-row items-end">
                  {!isMe && (
                    <Image source={{ uri: profileImage || '' }} className="w-8 h-8 rounded-full mr-2" />
                  )}

                  <View
                    className={`px-4 py-2 rounded-lg max-w-[75%] ${isMe ? 'bg-[#1DB954]' : 'bg-gray-700'}`}
                  >
                    {/* Activity Message */}
                    {isActivity && (
                      <View>
                        <Image
                          source={{ uri: item.image }}
                          className="w-full h-48 rounded-lg mb-2"
                          resizeMode="cover"
                        />
                        <Text className={isMe ? 'text-white font-bold text-base' : 'text-white font-bold text-base'}>
                          {item.text}
                        </Text>
                        <Text className={isMe ? 'text-white text-sm' : 'text-gray-300 text-sm'}>
                          ⭐ {item.rating} • 📍 {item.location}
                        </Text>
                      </View>
                    )}

                    {/* Normal Text Message */}
                    {!isActivity && item.text && (
                      <Text className={isMe ? 'text-black' : 'text-white'}>{item.text}</Text>
                    )}
                  </View>

                  {isMe && (
                    <Image source={{ uri: profileImage || '' }} className="w-8 h-8 rounded-full ml-2" />
                  )}
                </View>

                {isMe && (
                  <Text className="text-xs text-gray-400 mt-1 mr-10">
                    {item.read ? 'Read' : 'Sent'}
                  </Text>
                )}
              </View>
            );
          }}
        />

        {/* Input */}
        <View className="flex-row items-center p-3 border-t border-gray-800 bg-[#121212]">
          <TextInput
            placeholder="Type a message..."
            placeholderTextColor="#aaa"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            className="flex-1 text-white bg-gray-800 p-3 rounded-lg mr-2 max-h-[100px]"
            textAlignVertical="top"
          />
          <TouchableOpacity onPress={sendMessage} className="bg-[#1DB954] px-4 py-3 rounded-lg">
            <Text className="text-black font-bold">Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default FullChatScreen;