import React, { useState, useEffect } from 'react';
import { Button, Text, View } from '../components/Themed';
import { Image, TouchableOpacity, Modal, StyleSheet, Alert, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { getFirestore, doc, getDoc, setDoc, updateDoc, getDocs, collection } from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker';
import { storage } from './FirstTimeUser/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import StatusIndicator from './Status';
import Icon from 'react-native-vector-icons/Ionicons';

const db = getFirestore();
const auth = getAuth();

type AuthProps = {
  navigation: any;
};

export const ProfileScreen = ({ navigation }: AuthProps) => {
  const [profileImage, setProfileImage] = useState<string | undefined>();
  const [isQRExpanded, setQRExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>("");
  const [connections, setConnections] = useState<{ name: string; imageUrl: string }[]>([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [newInterest, setNewInterest] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  const accountData = {
    id: auth.currentUser?.uid,
    email: auth.currentUser?.email,
    displayName: auth.currentUser?.displayName,
  };

  const fetchTopConnections = async () => {
    try {
      const connectionsSnapshot = await getDocs(collection(db, 'users'));
      const fetchedConnections: { name: string; imageUrl: string }[] = [];
      connectionsSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData?.imageurl && userData?.displayName) {
          fetchedConnections.push({
            name: userData.displayName,
            imageUrl: userData.imageurl,
          });
        }
      });
      setConnections(fetchedConnections);
    } catch (error) {
      console.error("Error fetching top connections:", error);
    }
  };

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
        } else {
          await setDoc(userDocRef, { imageurl: "" });
        }
      }
    };

    if (auth.currentUser) {
      fetchProfileImage();
      fetchTopConnections();
    }
  }, [auth.currentUser]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      uploadImage(uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!uri) {
      alert("No image selected.");
      return;
    }

    setIsUploading(true);
    const fileName = uri.split('/').pop();
    const storageRef = ref(storage, `images/${auth.currentUser?.uid}/${fileName}`);

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on('state_changed',
        (snapshot) => {
        },
        (error) => {
          alert("Error uploading image: " + error.message);
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setImageUrl(downloadURL);
          setIsUploading(false);

          if (auth.currentUser) {
            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userDocRef, {
              imageurl: downloadURL,
            });
          } else {
            alert("User is not authenticated.");
          }
          // alert("Image uploaded successfully!");
        }
      );
    } catch (error: any) {
      alert("Error: " + error.message);
      setIsUploading(false);
    }
  };

  const signOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          onPress: () => {
            auth.signOut()
              .then(() => {
                navigation.navigate('Welcome');
              })
              .catch((error) => {
                alert("Error signing out: " + error.message);
              });
          },
        },
      ],
      { cancelable: false }
    );
  };

  const addInterest = async () => {
    if (newInterest.trim() !== '') {
      setInterests(prevInterests => {
        const updatedInterests = [...prevInterests, newInterest];
        if (auth.currentUser) {
          const userDocRef = doc(db, 'users', auth.currentUser.uid);
          updateDoc(userDocRef, {
            interests: updatedInterests
          })
            .then(() => {
              console.log("Interests updated successfully");
            })
            .catch((error) => {
              console.error("Error updating interests: ", error);
            });
        }
        return updatedInterests;
      });
      setNewInterest('');
    }
  };

  useEffect(() => {
    const fetchUserInterests = async () => {
      if (auth.currentUser?.uid) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData?.interests) {
            setInterests(userData.interests);
          }
        }
      }
    };

    fetchUserInterests();
  }, []);

  const topFriends = [
    { id: 1, name: "Alex", streak: 10 },
    { id: 2, name: "Jamie", streak: 8 }
  ];

  const badges = [
    { id: 1, name: "Explorer" },
    { id: 2, name: "Foodie" }
  ];

  const favoritedActivities = [
    { id: 1, name: "Hiking" },
    { id: 2, name: "Wine Tasting" }
  ];

  const accentGreen = "#7DFFA6";

  return (
    <ScrollView className="bg-gray-900" style={{ flex: 1 }}>
      <View className="flex flex-row justify-between p-4 mt-16 mb-[-10px] bg-gray-900">
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Icon name="notifications-outline" size={26} color="#7DFFA6" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Icon name="settings-outline" size={26} color="#7DFFA6" />
        </TouchableOpacity>
      </View>
      <View className="py-12 items-center bg-gray-900">
      <View className="w-48 h-48 flex justify-center items-center relative">
      <TouchableOpacity
            onPress={() => setQRExpanded(true)}
            className="absolute opacity-50 border-2 border-green-500 rounded-md z-10 mt-24 w-48 h-48"
            >
            <QRCode
              value={JSON.stringify(accountData)}
              size={195}
              color='#050606'
              backgroundColor="white"
              logoMargin={2}
              logoBackgroundColor="transparent"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={pickImage}
            className="absolute z-20 w-40 h-40 justify-center items-center"
          >
            <Image
              source={{ uri: profileImage || 'https://example.com/default-profile.jpg' }}
              className="w-40 h-40 rounded-full border-2 border-white"
            />
          </TouchableOpacity>
        </View>
        <Text className="text-2xl mt-5 font-medium">{auth.currentUser?.displayName?.split(" ")[0]}</Text>
        <Text className="text-base mb-2 ml-4 mt-2 text-gray-500">Looking to go for a walk outside!</Text>

        <Text className="text-green-400 mt-4">Active SYNQ: 00:00:00</Text>
      </View>

      <Modal visible={isQRExpanded} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 justify-center items-center"
          activeOpacity={1}
          onPress={() => setQRExpanded(false)}
        >
          <View className="bg-white p-6 rounded-lg">
            <QRCode
              value={JSON.stringify(accountData)}
              size={300}
              color="#050606"
              backgroundColor="white"
              logoSize={60}
              logoMargin={2}
              logoBackgroundColor="transparent"
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <View className="flex flex-row justify-around mb-5 bg-gray-900">
      <TouchableOpacity onPress={() => setActiveTab("profile")}>
          <Text style={{ fontSize: 16, fontWeight: activeTab === "profile" ? "bold" : "normal", color: activeTab === "profile" ? "#7DFFA6" : "white" }}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("friends")}>
          <Text style={{ fontSize: 16, fontWeight: activeTab === "friends" ? "bold" : "normal", color: activeTab === "friends" ? "#7DFFA6" : "white" }}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("badges")}>
          <Text style={{ fontSize: 16, fontWeight: activeTab === "badges" ? "bold" : "normal", color: activeTab === "badges" ? "#7DFFA6" : "white" }}>Badges</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("favorites")}>
          <Text style={{ fontSize: 16, fontWeight: activeTab === "favorites" ? "bold" : "normal", color: activeTab === "favorites" ? "#7DFFA6" : "white" }}>Favorites</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "profile" && (
        <View className="bg-gray-900">
          <Text className="text-lg mb-2 ml-4 mt-2 font-bold text-[#7DFFA6]">{auth.currentUser?.displayName}</Text>
          <Text className="text-base mb-2 ml-4 mt-2">Location: Washington, DC</Text>
          {/* <StatusIndicator status={'Available'} /> */}
          <Text className="text-lg mt-5 font-medium ml-2 text-white mb-2">My Interests</Text>
          <View className="flex flex-row flex-wrap mt-2 ml-2 bg-gray-900">

            {interests.map((interest, index) => (
              <View key={index} className="bg-gray-900 py-2 px-3 rounded-full mr-3 mb-3 border border-green-400">
                <Text className="text-green-400 text-sm">{interest}</Text>
              </View>
            ))}
          </View>
          <View className="flex flex-row items-center mt-5 mb-2 bg-gray-900">
            <TextInput
              className="h-10 w-[65%] bg-gray-800 text-white rounded-full pl-2 text-lg ml-2"
              placeholder="Add an interest"
              placeholderTextColor="#aaa"
              value={newInterest}
              onChangeText={setNewInterest}
            />
            <TouchableOpacity onPress={addInterest} className="bg-[#7DFFA6] px-5 py-1 rounded-full ml-2">
              <Text className="text-black text-lg font-bold">Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {activeTab === "friends" && (
        <View className="bg-gray-900">
          <Text className="text-lg font-bold text-white mt-2 ml-4 mb-5">Top Friends</Text>
          {topFriends.map((friend) => (
            <View key={friend.id} className="mb-2 p-2 bg-white rounded-2xl ml-4 w-4/5">
              <Text className="text-black">{friend.name} - Connections: {friend.streak}</Text>
            </View>
          ))}
          <TouchableOpacity
            onPress={() => navigation.navigate('Add Friends')}
            className="bg-[#7DFFA6] w-24 h-8 rounded-lg self-center justify-center mt-5"
          >
            <Text className="text-black text-center">Add friends</Text>
          </TouchableOpacity>
        </View>

      )}

      {activeTab === "badges" && (
        <View className="bg-gray-900">
          <Text className="text-lg font-bold mb-2 mt-2 ml-2">Badges</Text>
          {badges.map((badge) => (
            <View key={badge.id} className="mb-2 p-2 bg-transparent rounded-md">
              <Text className="text-white">{badge.name}</Text>
            </View>
          ))}
        </View>
      )}

      {activeTab === "favorites" && (
        <View className="bg-gray-900">
          <Text className="text-lg font-bold mb-2 ml-3 mt-2">Favorited Activities</Text>
          {favoritedActivities.map((activity) => (
            <View key={activity.id} className="mb-2 p-2 bg-transparent rounded-md ml-3 mt-2">
              <Text className="text-white">{activity.name}</Text>
            </View>
          ))}
        </View>
      )}
      <TouchableOpacity onPress={signOut} className="bg-gray-900 w-32 h-8 rounded-lg self-center mt-10 mb-10 border border-white">
        <Text className="text-white text-center text-lg">Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}