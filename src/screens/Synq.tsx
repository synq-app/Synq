import { Text, View, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import * as React from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const auth = getAuth();

const availableTimes = [15, 30, 60];

type AuthProps = {
  navigation: any;
};

export const SynqScreen = ({ navigation }: AuthProps) => {
  const [checkedTime, setCheckedTime] = React.useState<number>(availableTimes[0]);
  const [memo, setMemo] = React.useState<string>('');
  const [recommendedActivities, setRecommendedActivities] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const yelpAPIKey = 'replace'; // TODO
  const yelpEndpoint = 'https://api.yelp.com/v3/businesses/search';

  const fetchActivityRecommendations = async () => {
    if (!memo.trim()) {
      Alert.alert('Please enter a memo description!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.get(yelpEndpoint, {
        params: {
          term: memo,
          location: 'Washington, DC',
          limit: 5,
          // categories: 'restaurants,events,active', 
        },
        headers: {
          Authorization: `Bearer ${yelpAPIKey}`,
        },
      });
      // const activities = response.data.businesses.map((business: any) => 
      //   business.name + " " +  business.rating + " ☆").slice(0, 5)

      const activities = response.data.businesses.map((business: any) =>
        business.name).slice(0, 5)

      setRecommendedActivities(activities);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching activities from Yelp:', error);
      Alert.alert('Error', 'Could not fetch activity recommendations.');
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
      <View className='w-4/5 items-center'>
        <View style={{ alignItems: "center" }}>
          <Text style={{
            fontSize: 32,
            color: 'white',
            marginTop: 200,
            width: 300,
            fontFamily: 'Avenir',
            textAlign: "center"
          }}>
            Tap when you're free to meet up
          </Text>
        </View>
        <View style={{ width: '100%', marginBottom: 20, marginLeft: -40 }}>
          <TextInput
            multiline
            numberOfLines={4}
            value={memo}
            onChangeText={setMemo}
            editable
            style={{
              backgroundColor: 'black',
              borderRadius: 8,
              borderBottomWidth: 1,
              borderBottomColor: '#7DFFA6',
              padding: 12,
              fontSize: 14,
              color: 'white',
              textAlignVertical: 'top',
              fontStyle: 'italic',
              width: 340,
              marginTop: 30
            }}
            placeholderTextColor={'#A0A0A0'}
            placeholder='Optional note: (Anyone want to grab a drink?)'
          />
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Modal')}>
          <Image
            source={require('../screens/FirstTimeUser/pulse.gif')}
            style={{ width: 200, height: 200, marginTop: 10 }}
            resizeMode="contain"
          />

        </TouchableOpacity>

        <TouchableOpacity
          onPress={fetchActivityRecommendations}
          style={{
            borderWidth: 1,
            borderRadius: 8,
            marginTop: 40,
            padding: 10,
            marginBottom: 30,
            marginRight: 80,
            width: 280
          }}>
          <Text style={{ color: 'white', fontSize: 14, fontFamily: 'Avenir' }}>Need some inspiration? Click here to generate activity suggestions</Text>
        </TouchableOpacity>
        {isLoading && <ActivityIndicator size="large" color="#4A90E2" />}
        {recommendedActivities.length > 0 && (
          <View style={{ width: '100%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 14, marginTop: 10, fontFamily: 'Avenir', marginLeft: -10 }}>
              Recommended Activities
            </Text>
            <View style={{ marginTop: 0 }}>
              {recommendedActivities.map((activity, index) => (
                <Text key={index} style={{ fontSize: 14, color: 'white', marginBottom: 8, marginLeft: -14, fontFamily: 'Avenir' }}>
                  {activity}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
