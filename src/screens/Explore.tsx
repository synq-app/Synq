import React, { useEffect, useState } from 'react';
import { TouchableOpacity, ActivityIndicator, FlatList, StyleSheet, ScrollView, TextInput, Modal, Image } from 'react-native';
import { Text, View } from '../components/Themed';
import axios from 'axios';

const accentGreen = '#7DFFA6';

type AuthProps = {
    navigation: any;
};

export const Explore = ({ navigation }: AuthProps) => {
    const yelpAPIKey = 'todo';
    const yelpEndpoint = 'https://api.yelp.com/v3/businesses/search';

    const [recommendedActivities, setRecommendedActivities] = useState<{ name: string; rating: number; location: string; image: string }[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('fun activities');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedActivity, setSelectedActivity] = useState<{ name: string; rating: number; location: string; image: string } | null>(null);
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const fetchActivityRecommendations = async (category: string) => {
        setIsLoading(true);

        try {
            const response = await axios.get(yelpEndpoint, {
                params: {
                    term: category,
                    location: 'Washington, DC',
                    limit: 5,
                },
                headers: {
                    Authorization: `Bearer ${yelpAPIKey}`,
                },
            });
            const activities = response.data.businesses.map((business: any) => ({
                name: business.name,
                rating: business.rating,
                location: business.location.address1 || 'Unknown location',
                image: business.image_url || 'https://via.placeholder.com/300',
            }));

            setRecommendedActivities(activities);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching activities from Yelp:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchActivityRecommendations(selectedCategory);
    }, [selectedCategory]);

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
    };

    const handleSearchChange = (text: string) => {
        setSearchTerm(text);
    };

    const handleSearchSubmit = () => {
        if (searchTerm.trim()) {
            setSelectedCategory(searchTerm.trim());
        }
    };

    const handleActivityPress = (activity: { name: string; rating: number; location: string; image: any }) => {
        setSelectedActivity(activity);
        setModalVisible(true);
    };

    const renderActivity = ({ item }: { item: { name: string; rating: number; location: string; image: any } }) => (
        <TouchableOpacity onPress={() => handleActivityPress(item)}>
            <View style={styles.activityContainer}>
                <Text style={styles.activityText}>{item.name}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, marginTop: 40 }}>
            <Text style={{ fontSize: 26, marginTop: 60, marginLeft: 20 }}>Explore</Text>
            <TextInput
                style={styles.searchBar}
                placeholder="Search for activities..."
                value={searchTerm}
                onChangeText={handleSearchChange}
                onSubmitEditing={handleSearchSubmit}
            />

            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                {['fun activities', 'restaurants', 'outdoors', 'music', 'events'].map((category) => (
                    <TouchableOpacity
                        key={category}
                        style={[
                            styles.categoryButton,
                            selectedCategory === category && styles.selectedCategoryButton,
                        ]}
                        onPress={() => handleCategoryChange(category)}
                    >
                        <Text style={styles.categoryButtonText}>{category}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {isLoading ? (
                <ActivityIndicator size="large" color={accentGreen} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={recommendedActivities}
                    renderItem={renderActivity}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.activityList}
                />
            )}

            {/* Modal for Activity Details */}
            <Modal animationType="slide" transparent={true} visible={modalVisible}>
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        {selectedActivity?.image && (
                            <Image source={{ uri: selectedActivity.image }} style={styles.modalImage} />
                        )}
                        <Text style={styles.modalTitle}>{selectedActivity?.name}</Text>
                        <Text style={styles.modalText}>⭐ Rating: {selectedActivity?.rating}</Text>
                        <Text style={styles.modalText}>📍 Location: {selectedActivity?.location}</Text>

                        <TouchableOpacity style={styles.sendButton}>
                            <Text style={styles.sendButtonText}>Send to Friend</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    searchBar: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        marginVertical: 10,
        marginHorizontal: 20,
        fontSize: 16,
        marginTop: 40,
        fontFamily: 'Avenir',
        color: 'white',
    },
    categoriesContainer: {
        marginTop: 15,
        paddingLeft: 20,
        marginBottom: -160
    },
    categoryButton: {
        marginRight: 15,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#e0e0e0',
        borderRadius: 20,
        height: 40,
    },
    selectedCategoryButton: {
        backgroundColor: accentGreen,
    },
    categoryButtonText: {
        fontSize: 16,
        color: '#333',
    },
    activityContainer: {
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        width: 350,
        marginLeft: 5,
    },
    activityText: {
        fontSize: 18,
        color: '#333',
    },
    activityList: {
        marginTop: 30,
        paddingLeft: 20,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: "black"
    },
    modalText: {
        fontSize: 16,
        marginBottom: 5,
        color: "black"
    },
    modalImage: {
        width: 250,
        height: 150,
        borderRadius: 10,
        marginBottom: 10,
    },
    sendButton: {
        marginTop: 10,
        backgroundColor: accentGreen,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    sendButtonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
