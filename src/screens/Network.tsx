import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Text, View, TextInput, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import * as Contacts from 'expo-contacts';

type Contact = {
  id: string;
  name: string;
  phoneNumbers?: { number: string }[];
};

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

type AuthProps = {
  navigation: any;
};

export const NetworkScreen = ({ navigation }: AuthProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(''); 
  const [sortedContacts, setSortedContacts] = useState<Contact[]>([]);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const loadContacts = async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        try {
          const { data } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
          });

          if (data.length > 0) {
            const validContacts = data
              .filter(contact => contact.id)
              .map(contact => ({
                id: contact.id!,
                name: contact.name,
                phoneNumbers: contact.phoneNumbers?.map(phone => ({
                  number: phone.number || '',
                })),
              }));

            validContacts.sort((a, b) => {
              const lastNameA = a.name.split(' ').pop()?.toLowerCase() || '';
              const lastNameB = b.name.split(' ').pop()?.toLowerCase() || '';
              return lastNameA.localeCompare(lastNameB);
            });

            setContacts(validContacts);
            setSortedContacts(validContacts);
            setFilteredContacts(validContacts);
          } else {
            setError('No contacts found');
          }
        } catch (err) {
          setError('Error fetching contacts');
        }
      } else {
        setError('Permission to access contacts was denied');
      }
    };

    loadContacts();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const filtered = sortedContacts.filter(contact =>
        contact.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(sortedContacts);
    }
  };

  const handleIndexPress = useCallback((letter: string) => {
    const index = sortedContacts.findIndex(contact =>
      contact.name.toUpperCase().startsWith(letter)
    );
    if (index !== -1) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
    }
  }, [sortedContacts]);

  const getItemLayout = (_: any, index: number) => ({
    length: 70,
    offset: 70 * index,
    index,
  });

  return (
    <View className="flex-1 bg-gray-900 pt-10">
      <View className="flex-row justify-between items-center px-6 pb-4 border-b border-gray-700 mt-8">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-white text-3xl">{"<"}</Text>
        </TouchableOpacity>
        <Text className="text-white text-2xl flex-1 text-center">Network</Text>
      </View>

      <TextInput
        className="bg-gray-700 text-white p-3 rounded-lg mb-4 mt-4 mx-4"
        placeholder="Search contacts..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {error ? (
        <Text className="text-red-500 text-center text-lg mt-6">{error}</Text>
      ) : (
        <View className="flex-1 flex-row">
          <FlatList
            ref={flatListRef}
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            style={{ width: '85%' }}
            renderItem={({ item }) => (
              <View className="px-4 py-4 mb-2 mx-4 border-b border-gray-600 shadow-lg flex-row items-center">
                <View className="flex-1">
                  <Text className="text-white text-lg font-medium">{item.name}</Text>
                  {item.phoneNumbers && item.phoneNumbers.length > 0 && (
                    <Text className="text-gray-400 mt-1 text-sm">{item.phoneNumbers[0].number}</Text>
                  )}
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text className="text-center text-gray-500 text-lg mt-6">No contacts available</Text>
            }
            getItemLayout={getItemLayout}
            onScrollToIndexFailed={(error) => {
              const offset = error.index * 70;
              flatListRef.current?.scrollToOffset({ offset, animated: true });
            }}
          />
          <ScrollView
            className="pr-4"
            style={{ width: '15%' }}
            contentContainerStyle={{ alignItems: 'center' }}
            showsVerticalScrollIndicator={false}
          >
            {alphabet.map(letter => (
              <TouchableOpacity
                key={letter}
                onPress={() => handleIndexPress(letter)}
                className="py-1"
              >
                <Text className="text-gray-400 text-xs">{letter}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};
