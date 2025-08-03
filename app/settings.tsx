import { Stack } from 'expo-router';
import { Text, TouchableOpacity, Linking, View } from 'react-native';

import { Container } from '~/components/Container';

export default function Settings() {
  const handleWebsitePress = () => {
    Linking.openURL('https://hajzlfinder.com');
  };

  const handleInstagramPress = () => {
    Linking.openURL('https://instagram.com/matyslav_');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      />
      <Container>
        <View className="gap-4">
          <Text className="mb-2 text-xl font-semibold">Links</Text>

          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={handleWebsitePress}
              className="aspect-square flex-1 items-center justify-center rounded-2xl bg-blue-500 p-4 shadow-lg">
              <Text className="mb-2 text-3xl">🌐</Text>
              <Text className="text-center text-sm font-medium text-white">Website</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleInstagramPress}
              className="aspect-square flex-1 items-center justify-center rounded-2xl bg-pink-500 p-4 shadow-lg">
              <Text className="mb-2 text-3xl">📸</Text>
              <Text className="text-center text-sm font-medium text-white">Instagram</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Container>
    </>
  );
}
