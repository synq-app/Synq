import React, { useEffect, useState } from 'react';
import {
  Modal,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Text, View } from '../components/Themed';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
} from 'firebase/firestore';

const db = getFirestore();
const auth = getAuth();

export const ChatModal = ({
  visible,
  onClose,
  onOpenChat,
}: {
  visible: boolean;
  onClose: () => void;
  onOpenChat: (friend: any) => void;
}) => {
  const [chatList, setChatList] = useState<
    {
      chatId: string;
      friendId: string;
      friendName: string;
      friendPhotoURL?: string;
      lastMessage?: string;
      lastMessageTime?: Date | null;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  useEffect(() => {
    if (!visible) return;

    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(chatsQuery, async (querySnapshot) => {
      const chatsData: typeof chatList = [];

      await Promise.all(
        querySnapshot.docs.map(async (chatDoc) => {
          const chatId = chatDoc.id;
          const data = chatDoc.data();

          if (!Array.isArray(data.participants)) return;

          const friendId = data.participants.find(
            (uid: string) => uid !== currentUser.uid
          );
          if (!friendId) return;

          const friendDoc = await getDoc(doc(db, 'users', friendId));
          const friendData = friendDoc.exists() ? friendDoc.data() : null;

          const messagesRef = collection(db, 'chats', chatId, 'messages');
          const lastMessageQuery = query(
            messagesRef,
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          const lastMessageSnap = await getDocs(lastMessageQuery);
          const lastMessageDoc = lastMessageSnap.docs[0];
          const lastMessageData = lastMessageDoc?.data();

          chatsData.push({
            chatId,
            friendId,
            friendName: friendData?.displayName || 'Unnamed',
            friendPhotoURL:
              friendData?.photoURL ||
              friendData?.imageUrl ||
              friendData?.imageurl,
            lastMessage: lastMessageData?.text || '',
            lastMessageTime:
              lastMessageData?.createdAt?.toDate?.() || null,
          });
        })
      );

      chatsData.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
      });

      setChatList(chatsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [visible]);

  const renderChatItem = ({
    item,
  }: {
    item: {
      chatId: string;
      friendId: string;
      friendName: string;
      friendPhotoURL?: string;
      lastMessage?: string;
      lastMessageTime?: Date | null;
    };
  }) => (
    <TouchableOpacity
      onPress={() =>
        onOpenChat({
          id: item.friendId,
          displayName: item.friendName,
          photoURL: item.friendPhotoURL,
        })
      }
      className="flex-row items-center px-4 py-3 border-b border-gray-700"
    >
      <Image
        source={{
          uri:
            item.friendPhotoURL ||
            'https://www.gravatar.com/avatar/?d=mp&s=50',
        }}
        className="w-12 h-12 rounded-full mr-3"
      />
      <View className="flex-1">
        <Text className="text-white text-lg">{item.friendName}</Text>
        <Text className="text-gray-400 text-sm" numberOfLines={1}>
          {item.lastMessage || 'No messages yet'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View
        className={`flex-1 bg-[#121212] ${
          Platform.OS === 'ios' ? 'pt-16' : 'pt-10'
        } relative`}
      >
        <View className="flex-row items-center justify-center border-b border-gray-800 px-4 pb-3 relative">
          <Text className="text-white text-xl font-semibold text-center">
            Your Chats
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="absolute right-4 top-0 bottom-0 justify-center"
            accessibilityLabel="Close chats"
          >
            <Text className="text-white text-3xl">×</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1DB954"
            className="mt-10"
          />
        ) : chatList.length === 0 ? (
          <Text className="text-white text-center mt-10">
            You have no chats yet
          </Text>
        ) : (
          <FlatList
            data={chatList}
            keyExtractor={(item) => item.chatId}
            renderItem={renderChatItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            className="flex-1"
          />
        )}
      </View>
    </Modal>
  );
};
