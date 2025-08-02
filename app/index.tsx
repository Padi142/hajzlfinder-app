import { Stack, Link } from 'expo-router';

import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import { MapComponent } from '~/components/MapComponent';
import { ScreenContent } from '~/components/ScreenContent';
import { api } from '~/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  useBottomSheetTimingConfigs,
} from '@gorhom/bottom-sheet';
import { Easing } from 'react-native-reanimated';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Id } from '~/convex/_generated/dataModel';
import { BottomSheetContent } from '~/components/BottomSheetContent';

import * as Location from 'expo-location';
import Octicons from '@expo/vector-icons/Octicons';

export default function Home() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [selectedHajzlId, setSelectedHajzlId] = useState<Id<'hajzle'> | null>(null);

  // Fast timing animation configuration
  const animationConfigs = useBottomSheetTimingConfigs({
    duration: 200,
    easing: Easing.out(Easing.quad),
  });
  const handlePresentModalPress = useCallback((hajzlId: Id<'hajzle'>) => {
    setSelectedHajzlId(hajzlId);
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const getCurrentLocation = useCallback(async () => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });
      setLocation(location);
      console.log('location', location);
    }
    getCurrentLocation();
  }, []);

  const hajzle = useQuery(api.hajzl.list);
  return (
    <>
      <GestureHandlerRootView style={styles.container}>
        <BottomSheetModalProvider>
          <Stack.Screen options={{ title: 'Hajzlfinder Mobile' }} />
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => {
              getCurrentLocation();
            }}>
            <Octicons name="location" size={24} color="white" />
          </TouchableOpacity>
          <MapComponent
            handlePresentModalPress={(id: Id<'hajzle'>) => handlePresentModalPress(id)}
            hajzle={hajzle ?? []}
            initialLocation={location}
          />
          <BottomSheetModal
            ref={bottomSheetModalRef}
            index={0}
            onChange={handleSheetChanges}
            snapPoints={['70%']}
            enableDynamicSizing={true}
            animationConfigs={animationConfigs}>
            <BottomSheetView>
              <BottomSheetContent hajzlId={selectedHajzlId} />
            </BottomSheetView>
          </BottomSheetModal>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  floatingButton: {
    backgroundColor: '#000',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    right: 30,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
