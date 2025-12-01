import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  ScrollView,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { Text, View } from '../components/Themed';
import axios from 'axios';
import { ENV_VARS } from '../../config.js';
import ChatPopup from './ChatPopup';
import { ActivityChatPopup } from './ActivityChatPopup';

const accentGreen = '#7DFFA6';

interface Activity {
  name: string;
  rating: number;
  location: string;
  image: string;
}

export const Explore = ({ navigation }: { navigation: any }) => {
  const [recommendedActivities, setRecommendedActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('things to do');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [chatPopupVisible, setChatPopupVisible] = useState(false);
  const [chatFriend, setChatFriend] = useState<any>(null);

  const handleSendToFriend = (friend: any) => {
    if (!selectedActivity) return;
    setChatFriend(friend);
    setChatPopupVisible(true);
  };

  const fetchActivityRecommendations = async (category: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://api.foursquare.com/v3/places/search', {
        params: { query: category, near: 'Washington, DC', limit: 5 },
        headers: {
          Authorization: ENV_VARS.FOURSQUARE_API_KEY,
          accept: 'application/json',
        },
      });

      const places = response.data.results;

      const placesWithImages = await Promise.all(
        places.map(async (place: any) => {
          let imageUrl = '';
          try {
            const photoRes = await axios.get(
              `https://api.foursquare.com/v3/places/${place.fsq_id}/photos`,
              { headers: { Authorization: ENV_VARS.FOURSQUARE_API_KEY, accept: 'application/json' } }
            );
            const photo = photoRes.data[0];
            if (photo) imageUrl = `${photo.prefix}original${photo.suffix}`;
          } catch {}
          if (!imageUrl && place.categories?.[0]?.icon) {
            const icon = place.categories[0].icon;
            imageUrl = `${icon.prefix}bg_64${icon.suffix}`;
          }
          if (!imageUrl) imageUrl = 'https://via.placeholder.com/300';
          return {
            name: place.name,
            rating: 4.0,
            location: place.location?.formatted_address || 'Unknown location',
            image: imageUrl,
          };
        })
      );

      setRecommendedActivities(placesWithImages);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityRecommendations(selectedCategory);
  }, [selectedCategory]);

  return (
    <View className="mt-10">
      <View className="flex-row justify-between items-center px-8 mt-16">
        <Text className="text-3xl font-semibold">Explore</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-3xl text-gray-400">×</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        className="h-10 border border-gray-300 rounded-full px-4 mx-5 mt-10 text-base text-white"
        placeholder="Search for activities..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        onSubmitEditing={() => {
          if (searchTerm.trim()) setSelectedCategory(searchTerm.trim());
        }}
        placeholderTextColor="#ccc"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 pl-5">
        {['things to do', 'restaurants', 'outdoors', 'music', 'events'].map((category) => (
          <TouchableOpacity
            key={category}
            className={`mr-4 px-5 py-2 rounded-full h-10 ${
              selectedCategory === category ? 'bg-[#7DFFA6]' : 'bg-gray-200'
            }`}
            onPress={() => setSelectedCategory(category)}
          >
            <Text className="text-base text-gray-800">{category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View className="mt-6">
        {isLoading ? (
          <ActivityIndicator size="large" color={accentGreen} className="mt-5" />
        ) : (
          <FlatList
            data={recommendedActivities}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedActivity(item);
                  setModalVisible(true);
                }}
              >
                <View className="flex-row items-center p-2 mb-3 bg-gray-100 rounded-xl w-[350px] ml-5">
                  <Image
                    source={{ uri: item.image }}
                    className="w-[60px] h-[60px] rounded-lg mr-3"
                  />
                  <View className="flex-1 bg-white">
                    <Text className="text-lg text-gray-800 font-semibold">{item.name}</Text>
                    <Text className="text-sm text-gray-600">
                      ⭐ {item.rating} • 📍 {item.location}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      {/* Activity Details Modal */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <TouchableOpacity
          className="flex-1 justify-center items-center bg-black/50"
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View className="w-[300px] p-5 bg-white rounded-xl items-center">
            {selectedActivity?.image && (
              <Image source={{ uri: selectedActivity.image }} className="w-[250px] h-[150px] rounded-lg mb-3" />
            )}
            <Text className="text-xl font-bold text-black mb-2">{selectedActivity?.name}</Text>
            <Text className="text-base text-black mb-1">⭐ Rating: {selectedActivity?.rating}</Text>
            <Text className="text-base text-black mb-3">📍 Location: {selectedActivity?.location}</Text>
            <TouchableOpacity
              className="bg-[#7DFFA6] px-5 py-2 rounded-lg mt-2"
              onPress={() => {
                setModalVisible(false);
                setChatPopupVisible(true);
              }}
            >
              <Text className="text-black font-semibold">Send to Friend</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {selectedActivity && (
        <ActivityChatPopup
          visible={chatPopupVisible}
          onClose={() => setChatPopupVisible(false)}
          activity={selectedActivity}
          onCloseAndNavigateBack={() => {
            setChatPopupVisible(false);
            navigation.goBack();
          }}
        />
      )}
    </View>
  );
};