import React, { useEffect, useState } from 'react';
import { TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { Text, View } from '../components/Themed';
import {
    getFirestore,
    collection,
    query,
    where,
    onSnapshot,
    getDoc,
    doc,
    updateDoc,
    setDoc,
    deleteDoc,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const Notifications = ({ navigation }: any) => {
    const [notificationsData, setNotificationsData] = useState<
        { id: string; from: string; name: string; message: string; action: string }[]
    >([]);
    const db = getFirestore();
    const auth = getAuth();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (!user) {
                console.log('No user is signed in.');
                return;
            }

            const q = query(
                collection(db, 'friendRequests'),
                where('to', '==', user.uid),
                where('status', '==', 'pending')
            );

            const unsubscribeSnapshot = onSnapshot(q, async (snapshot) => {
                const requests = await Promise.all(
                    snapshot.docs.map(async (docSnap) => {
                        const data = docSnap.data();
                        const fromRef = doc(db, 'users', data.from);
                        const fromSnap = await getDoc(fromRef);
                        const sender = fromSnap.exists() ? fromSnap.data() : { displayName: "Unknown User" };

                        return {
                            id: docSnap.id,
                            from: data.from,
                            name: sender.displayName || "Unknown User",
                            message: 'sent you a friend request',
                            action: 'Accept',
                        };
                    })
                );
                setNotificationsData(requests);
            });

            return () => unsubscribeSnapshot();
        });

        return () => unsubscribeAuth();
    }, []);

    const handleAccept = async (requestId: string, fromId: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.log('No current user in handleAccept');
            return;
        }

        const requestRef = doc(db, 'friendRequests', requestId);
        const requestSnap = await getDoc(requestRef);

        if (!requestSnap.exists()) {
            console.log('Request does not exist:', requestId);
            return;
        }

        const requestData = requestSnap.data();

        if (requestData.to !== currentUser.uid) {
            console.log('Current user is not the intended recipient');
            return;
        }

        try {
            await updateDoc(requestRef, {
                status: 'accepted',
            });

            await setDoc(doc(db, 'users', currentUser.uid, 'friends', fromId), {
                uid: fromId,
                createdAt: new Date(),
            });

            await setDoc(doc(db, 'users', fromId, 'friends', currentUser.uid), {
                uid: currentUser.uid,
                createdAt: new Date(),
            });

            setNotificationsData((prev) => prev.filter((req) => req.id !== requestId));
        } catch (err) {
            console.error('Error accepting friend request:', err);
        }
    };

    const handleDecline = async (requestId: string) => {
        try {
            await deleteDoc(doc(db, 'friendRequests', requestId));
            console.log('Friend request deleted.');
            setNotificationsData((prev) => prev.filter((req) => req.id !== requestId));
        } catch (err) {
            console.error('Error declining friend request:', err);
        }
    };

    return (
        <SafeAreaView>
            <View className="w-full h-full justify-end pl-14">
                <View className="absolute h-2/5 w-screen top-0 bg-green-400 rounded-b-xl" />
                <View className="absolute top-0 gap-6 p-8 flex-row bg-transparent">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text className="text-black text-2xl">{"<"}</Text>
                    </TouchableOpacity>
                    <Text className="text-black text-2xl">Notifications</Text>
                </View>

                <View className="flex bg-gray-900 pr-8 pb-20 rounded-t-xl gap-8">
                    <Text className="text-gray-400 self-end">Clear All</Text>
                    <View className="bg-gray-900" style={{ height: 450 }}>
                        <FlatList
                            data={notificationsData}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <View className="mb-8 bg-gray-900 p-4 rounded-md border border-gray-700">
                                    <Text className="text-white px-1 text-lg">
                                        <Text className="text-green-400 font-semibold">{item.name} </Text>
                                        {item.message}
                                    </Text>
                                    <View className="flex-row gap-4 justify-center mt-4 bg-gray-900">
                                        <TouchableOpacity
                                            onPress={() => handleAccept(item.id, item.from)}
                                            className="bg-white px-6 py-2 rounded"
                                        >
                                            <Text className="text-black font-bold text-center">Accept</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDecline(item.id)}
                                            className="bg-gray-700 px-6 py-2 rounded"
                                        >
                                            <Text className="text-white font-bold text-center">Decline</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                            ListEmptyComponent={
                                <Text className="text-gray-400 text-center mt-10">You currently have no notifications.</Text>
                            }
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};
