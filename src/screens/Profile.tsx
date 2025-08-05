import React, { useState, useEffect } from 'react';
import { SynqButton, SynqText, View } from '../components/Themed';
import { Image, TouchableOpacity, Modal, Alert, ScrollView, TextInput } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getFirestore, doc, getDoc, setDoc, updateDoc, getDocs, collection, onSnapshot } from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker';
import { storage } from './FirstTimeUser/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { presetActivities, stateAbbreviations } from '../constants/Mocks';
import axios from 'axios';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import * as mime from 'mime';


const defaultPic = require('../assets/images/default-profile-pic.jpg');

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
  const [showInputModal, setShowInputModal] = useState(false);
  const [connections, setConnections] = useState<{ name: string; imageUrl: string }[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [showInput, setShowInput] = useState(false);

  const accountData = {
    id: auth.currentUser?.uid,
    email: auth.currentUser?.email,
    displayName: auth.currentUser?.displayName,
  };

  useEffect(() => {
    if (auth.currentUser?.uid) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const unsubscribe = onSnapshot(userDocRef, (userDocSnap) => {
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const fullStateName = userData.state || 'Not available';
          const stateAbbreviation = stateAbbreviations[fullStateName] || fullStateName;
          setCity(userData.city || 'Not available');
          setState(stateAbbreviation);
          setMemo(userData.memo || '');
        } else {
          console.log('No such document!');
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const fetchTopConnections = async () => {
    try {
      if (!auth.currentUser) return;

      const userId = auth.currentUser.uid;
      const friendsCol = collection(db, "users", userId, "friends");
      const friendsSnapshot = await getDocs(friendsCol);

      const friendsList = await Promise.all(
        friendsSnapshot.docs.map(async (friendDoc) => {
          const friendId = friendDoc.id;
          const friendProfileRef = doc(db, "users", friendId);
          const friendProfileSnap = await getDoc(friendProfileRef);

          if (friendProfileSnap.exists()) {
            const friendData = friendProfileSnap.data();
            return {
              name: friendData.displayName || "",
              imageUrl: friendData.imageurl || "",
            };
          } else {
            return null;
          }
        })
      );

      const validFriends = friendsList.filter(Boolean) as { name: string; imageUrl: string }[];

      setConnections(validFriends);
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
      mediaTypes: ['images'],
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
    if (!uri || !auth.currentUser?.uid) {
      alert("No image selected or user not authenticated.");
      return;
    }

    setIsUploading(true);
    const fileName = uri.split('/').pop();
    const storageRef = ref(storage, `images/${auth.currentUser.uid}/${fileName}`);

    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Firebase Storage
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on('state_changed',
        () => { }, // Optional: progress tracking
        (error) => {
          alert("Error uploading image to Firebase: " + error.message);
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setImageUrl(downloadURL);
          setIsUploading(false);

          // Save download URL to Firestore
          const userDocRef = doc(db, 'users', auth.currentUser!.uid);
          await updateDoc(userDocRef, {
            imageurl: downloadURL,
          });

          // Upload to backend API sending raw Blob without auth header
          if (auth.currentUser) {
            await uploadProfileImageToBackend(auth.currentUser.uid, uri);
          }
        }
      );
    } catch (error: any) {
      alert("Error: " + error.message);
      setIsUploading(false);
    }
  };
  const convertToPNG = async (uri: string): Promise<string> => {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [], // no resize or crop, just format conversion
      { format: ImageManipulator.SaveFormat.PNG }
    );
    return result.uri;
  };
  const uploadProfileImageToBackend = async (userId: string, uri: string) => {
    try {
      // Convert image to PNG
      const pngUri = await convertToPNG(uri);

      const responseFetch = await fetch(pngUri);
      const blob = await responseFetch.blob();

      const contentType = 'image/png'; // force png

      const response = await fetch(`https://synqapp.com/api/users/${userId}/images/profileImage`, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: blob,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
    } catch (error: any) {
      console.error('❌ Failed to upload profile image to backend:', error.message);
      // Alert.alert('Error', 'Could not sync profile image with server.');
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
      setShowInput(false);
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

  return (
    <ScrollView className="bg-primary-background" style={{ flex: 1 }}>
      <View className="flex flex-row justify-between p-4 mt-16 mb-[-10px] bg-black">
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Icon name="notifications-outline" size={26} color="#7DFFA6" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Icon name="settings-outline" size={26} color="#7DFFA6" />
        </TouchableOpacity>
      </View>
      <View className="py-12 items-center bg-black">
        <View className="w-48 h-48 items-center justify-center relative">
          <View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center z-0">
            <View className="opacity-50 border-2 border-[#7DFFA6] rounded-xl p-1">
              <QRCode
                value={JSON.stringify(accountData)}
                size={200}
                color="#050606"
                backgroundColor="white"
              />
            </View>
          </View>
          <TouchableOpacity
            onPress={pickImage}
            className="z-10 w-40 h-40 rounded-full overflow-hidden border-2 border-white"
          >
            <Image
              source={profileImage ? { uri: profileImage } : defaultPic}
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setQRExpanded(true)}
            className="absolute bottom-[-12px] right-[-12px] bg-[#7DFFA6] rounded-full p-2 z-20"
          >
            <Icon name="qr-code-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <SynqText className="text-2xl mt-5 font-medium text-accent">{auth.currentUser?.displayName}</SynqText>
        <SynqText className="text-sm ml-4 mt-2">{city}, {state}</SynqText>
        <View>
          <SynqText>{memo || ""}</SynqText>
        </View>
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
      <View className="bg-black">
        <SynqText className="text-lg font-medium ml-4 text-primary-text mb-2">Top Synqs</SynqText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="ml-4 mt-4">
          {connections.length > 0 ? (
            connections.map((connection, index) => (
              <View key={index} className="items-center mr-4">
                <Image
                  source={{ uri: connection.imageUrl }}
                  className="w-16 h-16 rounded-full bg-white"
                />
                <SynqText className="text-primary-text text-xs mt-2 text-center" numberOfLines={1}>
                  {connection.name}
                </SynqText>
              </View>
            ))
          ) : (
            <SynqText className="text-primary-text ml-4">No connections found.</SynqText>
          )}
        </ScrollView>
        <SynqText className="text-lg font-medium ml-4 text-primary-text mt-6">Top Activities</SynqText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="ml-4 mt-4">
          {interests.map((interest) => (
            <View key={interest} className="items-center mr-6">
              <Image
                source={{
                  uri: `https://picsum.photos/id/${(presetActivities as { [key: string]: { id: number; name: string } })[interest.toLowerCase()]?.id}/200/300`,
                }}
                className="w-16 h-16 rounded-full bg-white"
              />
              <SynqText className="text-primary-text text-xs mt-2 text-center">{interest}</SynqText>
            </View>
          ))}
          <TouchableOpacity onPress={() => setShowInputModal(true)} className="items-center mr-4">
            <View className="w-16 h-16 rounded-full border-2 border-green-400 bg-black justify-center items-center">
              <SynqText className="text-green-400 text-3xl">+</SynqText>
            </View>
            <SynqText className="text-white text-xs mt-2 text-center">Add</SynqText>
          </TouchableOpacity>
        </ScrollView>

        <Modal visible={showInputModal} transparent animationType="fade">
          <TouchableOpacity
            className="flex-1 justify-center items-center bg-blur bg-opacity-50"
            activeOpacity={1}
            onPressOut={() => setShowInputModal(false)}
          >
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
              }}
            />
            <View className="bg-black p-6 rounded-lg w-80 border border-gray-700">
              <SynqText className="text-white text-lg mb-4">What's your favorite social activity?</SynqText>
              <TextInput
                className="h-10 w-full bg-gray-800 text-white rounded-full pl-4 pb-2 text-base"
                placeholder="Enter your interest"
                placeholderTextColor="#aaa"
                value={newInterest}
                onChangeText={setNewInterest}
              />
              <View className="flex flex-row justify-between mt-4">
                <TouchableOpacity
                  onPress={() => setShowInputModal(false)}
                  className="bg-gray-700 px-5 py-2 rounded-full"
                >
                  <SynqText className="text-white">Cancel</SynqText>
                </TouchableOpacity>
                <TouchableOpacity onPress={addInterest} className="bg-[#7DFFA6] px-5 py-2 rounded-full">
                  <SynqText className="text-black">Add</SynqText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
      <TouchableOpacity onPress={signOut} className="bg-black w-32 h-8 rounded-lg self-center mt-10 mb-10 border border-white">
        <SynqText className="text-white text-center text-lg">Sign Out</SynqText>
      </TouchableOpacity>
    </ScrollView>
  );
};
