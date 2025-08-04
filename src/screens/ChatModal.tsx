import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
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

    const unsubscribe = onSnapshot(
      chatsQuery,
      async (querySnapshot) => {
        const chatsData: typeof chatList = [];

        await Promise.all(
          querySnapshot.docs.map(async (chatDoc) => {
            const chatId = chatDoc.id;
            const data = chatDoc.data();

            if (!data.participants || !Array.isArray(data.participants)) {
              return;
            }

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
              friendPhotoURL: friendData?.photoURL || friendData?.imageUrl || friendData?.imageurl,
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
      },
      (error) => {
        console.error('Error fetching chats:', error);
        setLoading(false);
      }
    );

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
      onPress={() => {
        onOpenChat({
          id: item.friendId,
          displayName: item.friendName,
          photoURL: item.friendPhotoURL,
        });
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomColor: '#444',
        borderBottomWidth: 1,
      }}
    >
      <Image
        source={{
          uri: item.friendPhotoURL || 'https://www.gravatar.com/avatar/?d=mp&s=50',
        }}
        style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ color: 'white', fontSize: 18 }}>{item.friendName}</Text>
        <Text
          style={{ color: '#AAA', fontSize: 14 }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.lastMessage || 'No messages yet'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View
        style={{
          flex: 1,
          backgroundColor: '#121212',
          paddingTop: Platform.OS === 'ios' ? 60 : 40,
          paddingHorizontal: 0,
          position: 'relative',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#333',
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 22,
              fontWeight: '600',
              flex: 1,
              textAlign: 'center',
            }}
          >
            Your Chats
          </Text>

          <TouchableOpacity
            onPress={onClose}
            style={{
              position: 'absolute',
              right: 16,
              padding: 8,
              zIndex: 10,
            }}
            accessibilityLabel="Close chats"
          >
            <Text style={{ color: 'white', fontSize: 28, lineHeight: 28 }}>×</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1DB954"
            style={{ marginTop: 40 }}
          />
        ) : chatList.length === 0 ? (
          <Text style={{ color: 'white', textAlign: 'center', marginTop: 40 }}>
            You have no chats yet
          </Text>
        ) : (
          <FlatList
            data={chatList}
            keyExtractor={(item) => item.chatId}
            renderItem={renderChatItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            style={{ flex: 1 }}
          />
        )}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#121212',
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderTopWidth: 1,
            borderTopColor: '#333',
            flexDirection: 'row',
            justifyContent: 'flex-start',
          }}
        >
        </View>
      </View>
    </Modal>
  );
};
