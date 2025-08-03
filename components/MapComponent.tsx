import { Platform, View, Text } from 'react-native';
import { Doc, Id } from '~/convex/_generated/dataModel';
import { Suspense, lazy } from 'react';
import * as Location from 'expo-location';
import { api } from '~/convex/_generated/api';
import { useMutation } from 'convex/react';

// Dynamically import both components to avoid issues
const MapComponentWeb = lazy(() =>
  import('./MapComponentWeb').then((module) => ({ default: module.MapComponentWeb }))
);

const MapComponentMobile = lazy(() =>
  import('./MapComponentMobile').then((module) => ({ default: module.MapComponentMobile }))
);

export const MapComponent = ({
  handlePresentModalPress,
  hajzle,
  initialLocation,
}: {
  handlePresentModalPress: (id: Id<'hajzle'>) => void;
  hajzle: Doc<'hajzle'>[] | undefined;
  initialLocation: Location.LocationObject | null;
}) => {
  if (Platform.OS === 'web') {
    return (
      <Suspense
        fallback={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}>
            <p>Loading map...</p>
          </div>
        }>
        <MapComponentWeb
          handlePresentModalPress={handlePresentModalPress}
          hajzle={hajzle}
          initialLocation={initialLocation}
        />
      </Suspense>
    );
  }

  return (
    <Suspense
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading map...</Text>
        </View>
      }>
      <MapComponentMobile
        handlePresentModalPress={handlePresentModalPress}
        hajzle={hajzle}
        initialLocation={initialLocation}
      />
    </Suspense>
  );
};
