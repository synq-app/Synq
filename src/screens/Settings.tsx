import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Switch, SafeAreaView, Image } from 'react-native';
import { Text, View } from '../components/Themed';
import Colors from '../constants/Colors';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export const Settings = ({ navigation }: any) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        const fetchProfileImage = async () => {
            if (auth.currentUser?.uid) {
                const userDocRef = doc(db, 'users', auth.currentUser.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data?.imageurl) {
                        setProfileImage(data.imageurl);
                    }
                }
            }
        };
        fetchProfileImage();
    }, []);

    const toggleSwitch = () => setNotificationsEnabled(previousState => !previousState);
    return (
        <SafeAreaView >
            <View className="w-full h-full justify-end pl-14">
                <View className="absolute h-2/5 w-screen top-0 bg-green-400 rounded-b-xl" />
                <View className="absolute top-0 gap-6 p-8 flex-row bg-transparent">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text className='text-black text-2xl'>
                            {"<"}
                        </Text>
                    </TouchableOpacity>
                    <Text className='text-black text-2xl'>Preferences</Text>
                </View>
                <View className="flex bg-gray-900 pr-8 pb-8 rounded-t-xl gap-8">
                    <View className="flex-row items-center gap-1 bg-transparent">
                        {profileImage ? (
                            <Image
                                source={{ uri: profileImage }}
                                className="w-10 h-10 rounded-full"
                            />
                        ) : null}
                        <Text className="text-white text-xl">{auth.currentUser?.displayName}</Text>
                    </View>
                    <Text className='text-gray-400'>Account Settings</Text>
                    <TouchableOpacity>
                        <Text>Edit Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text>Change Password</Text>
                    </TouchableOpacity>
                    <View className="flex-row justify-between items-center bg-transparent">
                        <Text>Push Notifications</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: Colors.dark.accent }}
                            thumbColor={notificationsEnabled ? 'white' : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitch}
                            value={notificationsEnabled}
                        />
                    </View>
                    <View className="border-b-2 border-b-gray-400" />
                    <Text className='text-gray-400'>More</Text>
                    <TouchableOpacity>
                        <Text>About Us</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text>Privacy Policy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text>Terms and Conditions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text>Feedback</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView >
    );
};
