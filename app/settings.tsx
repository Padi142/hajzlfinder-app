import { Stack } from 'expo-router';
import { Text } from 'react-native';

import { Container } from '~/components/Container';

export default function Settings() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShown: true,
        }}
      />
      <Container>
        <Text>Settings</Text>
      </Container>
    </>
  );
}
