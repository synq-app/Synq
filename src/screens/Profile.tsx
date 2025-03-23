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
    <ScrollView style={{ flex: 1, backgroundColor: "black" }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 14, marginTop: 60, marginBottom: -10 }}>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Icon name="notifications-outline" size={26} color="#7DFFA6" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Icon name="settings-outline" size={26} color="#7DFFA6" />
        </TouchableOpacity>
      </View>
      <View className="py-12 items-center">
        <View style={styles.qrContainer}>
          <TouchableOpacity
            onPress={() => setQRExpanded(true)}
            style={styles.qrCode}
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
            style={styles.profileImageWrapper}
          >
            <Image
              source={{ uri: profileImage || 'https://example.com/default-profile.jpg' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 22, marginTop: 20, fontWeight: '500' }}>{auth.currentUser?.displayName?.split(" ")[0]}</Text>
        <Text style={{ fontSize: 16, marginBottom: 10, marginLeft: 14, marginTop: 10, color: 'grey' }}>Looking to go for a walk outside!</Text>

        <Text className="text-green-400 mt-4">Active SYNQ: 00:00:00</Text>
      </View>

      <Modal visible={isQRExpanded} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setQRExpanded(false)}
        >
          <View style={styles.expandedQR}>
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

      <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 20 }}>
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
        <View>
          <Text style={{ fontSize: 18, marginBottom: 10, marginLeft: 14, marginTop: 10, fontWeight: "bold", color: accentGreen }}>{auth.currentUser?.displayName}</Text>
          <Text style={{ fontSize: 16, marginBottom: 10, marginLeft: 14, marginTop: 10 }}>Location: Washington, DC</Text>

          {/* <StatusIndicator status={'Available'} /> */}
          <Text style={{ fontSize: 18, marginTop: 20, fontWeight: '500', marginLeft: 10, color: 'white', marginBottom: 10 }}>My Interests</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, marginLeft: 10 }}>
            {interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 20 }}>
            <TextInput
              style={styles.input}
              placeholder="Add an interest"
              placeholderTextColor="#aaa"
              value={newInterest}
              onChangeText={setNewInterest}
            />
            <TouchableOpacity onPress={addInterest} style={styles.addButton}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {activeTab === "friends" && (
        <View>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: 'white', marginTop: 10, marginLeft: 14, marginBottom: 20 }}>Top Friends</Text>
          {topFriends.map((friend) => (
            <View key={friend.id} style={{ marginBottom: 10, padding: 10, backgroundColor: "#f5f5f5", borderRadius: 20, marginLeft: 14, width: '80%' }}>
              <Text style={{ color: 'black' }}>{friend.name} - Connections: {friend.streak}</Text>
            </View>
          ))}
          <TouchableOpacity onPress={() => navigation.navigate('Add Friends')} style={{ backgroundColor: accentGreen, width: 100, height: 30, borderRadius: 10, alignSelf: 'center', alignContent: 'center', justifyContent: 'center', marginTop: 20 }}>
            <Text style={{ alignContent: 'center', alignSelf: 'center', justifyContent: 'center', color: 'black' }}>Add friends</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === "badges" && (
        <View>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, marginTop: 10, marginLeft: 10 }}>Badges</Text>
          {badges.map((badge) => (
            <View key={badge.id} style={{ marginBottom: 10, padding: 10, backgroundColor: "black", borderRadius: 5 }}>
              <Text>{badge.name}</Text>
            </View>
          ))}
        </View>
      )}

      {activeTab === "favorites" && (
        <View>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, marginLeft: 14, marginTop: 10 }}>Favorited Activities</Text>
          {favoritedActivities.map((activity) => (
            <View key={activity.id} style={{ marginBottom: 10, padding: 10, backgroundColor: "black", borderRadius: 5, marginLeft: 14, marginTop: 10 }}>
              <Text>{activity.name}</Text>
            </View>
          ))}
        </View>
      )}
      <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    width: '65%',
    backgroundColor: '#333',
    color: 'white',
    borderRadius: 20,
    paddingLeft: 10,
    fontSize: 16,
    marginLeft: 10
  },
  addButton: {
    backgroundColor: "#7DFFA6",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  interestTag: {
    backgroundColor: 'black',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#7DFFA6'
  },
  interestText: {
    color: '#7DFFA6',
    fontSize: 16,
  },
  qrContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  qrCode: {
    position: 'absolute',
    opacity: 0.5,
    borderWidth: 2,
    borderColor: 'green',
    borderRadius: 4,
    zIndex: 1,
    marginTop: 90,
    height: 200,
    width: 200
  },
  profileImageWrapper: {
    position: 'absolute',
    zIndex: 2,
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center'
  },
  profileImage: {
    width: 160,
    height: 160,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  expandedQR: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  signOutButton: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 5,
    marginTop: 80,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'white'
  },
  signOutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});