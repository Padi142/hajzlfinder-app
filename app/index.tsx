import { Stack, Link } from 'expo-router';

import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import { MapComponent } from '~/components/MapComponent';
import { ScreenContent } from '~/components/ScreenContent';
import { api } from '~/convex/_generated/api';
import { useQuery } from 'convex/react';

export default function Home() {
  const hajzle = useQuery(api.hajzl.list);
  return (
    <>
      <Stack.Screen options={{ title: 'Hajzlfinder Mobile' }} />
        <MapComponent hajzle={hajzle} />
    </>
  );
}
