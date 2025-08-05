import { FlatList, ListRenderItemInfo, TouchableOpacity } from 'react-native';
import { User, UserRow } from '../components/UserRow';
import { SynqButton, Text, View } from '../components/Themed';
import * as React from 'react';
import { mockUsers } from '../constants/Mocks';

export default function AddFriendsScreen({ navigation }: any) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const [invited, setInvited] = React.useState<string[]>([]);

  const onSelectFriend = (id: string) => (selected.includes(id)
    ? setSelected(selected.filter((x) => x !== id))
    : setSelected([...selected, id])
  );

  const sendInvites = () => {
    setInvited([...invited, ...selected]);
    setSelected([]);
  };

  const renderRow = ({ item }: ListRenderItemInfo<User>) => {
    return (
      <TouchableOpacity
        disabled={invited.includes(item.id)}
        onPress={() => onSelectFriend(item.id)}
        className="flex-column mt-4"
      >
        <UserRow user={item} selected={selected.includes(item.id)} invited={invited.includes(item.id)} />
      </TouchableOpacity>
    );
  };

  const navigateToNetworkTab = () => {
    navigation.navigate('Network'); // Ensure 'Network' is the name of the tab in your navigation setup
  };

  return (
    <View className="flex-1 items-center pt-8 mt-10">
      <View className="w-full flex-row justify-between items-center px-8">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className='text-white text-3xl'>
            {"<"}
          </Text>
        </TouchableOpacity>
        <Text className="text-white text-2xl text-center flex-1 mt-2">Add Connections</Text>
      </View>
      <View className="w-5/6 h-full">
        <TouchableOpacity onPress={navigateToNetworkTab} className="mt-4 p-2">
          <Text className="text-blue-500 text-lg">Add from Contacts</Text>
        </TouchableOpacity>
        <Text className="text-xl mt-8 mb-4">Suggested</Text>
        <View className="w-full border-b-2 border-solid border-synq-accent-light dark:border-synq-accent-dark" />
        <FlatList
          className="flex-grow"
          data={mockUsers}
          keyExtractor={(friend) => friend.id}
          renderItem={renderRow}
        />
        {selected.length > 0 ? (
          <SynqButton text="Add" className="mb-20" onPress={sendInvites} />
        ) : (
          invited.length > 0 && <SynqButton text="Continue" className="mb-20" onPress={() => { }} />
        )}
      </View>

    </View>
  );
}
