import { Stack, Link } from 'expo-router';

import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import { MapComponent } from '~/components/MapComponent';
import { ScreenContent } from '~/components/ScreenContent';
import { api } from '~/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useCallback, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  useBottomSheetTimingConfigs,
} from '@gorhom/bottom-sheet';
import { Easing } from 'react-native-reanimated';
import { Text, StyleSheet } from 'react-native';
import { Id } from '~/convex/_generated/dataModel';
import { BottomSheetContent } from '~/components/BottomSheetContent';

export default function Home() {
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

  const hajzle = useQuery(api.hajzl.list);
  return (
    <>
      <GestureHandlerRootView style={styles.container}>
        <BottomSheetModalProvider>
          <Stack.Screen options={{ title: 'Hajzlfinder Mobile' }} />
          <MapComponent
            handlePresentModalPress={(id: Id<'hajzle'>) => handlePresentModalPress(id)}
            hajzle={hajzle}
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
});
