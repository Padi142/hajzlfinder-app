import { Stack, Link, router } from 'expo-router';

import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import { MapComponent } from '~/components/MapComponent';
import { ScreenContent } from '~/components/ScreenContent';
import { api } from '~/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  useBottomSheetTimingConfigs,
} from '@gorhom/bottom-sheet';
import { Easing } from 'react-native-reanimated';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Id } from '~/convex/_generated/dataModel';
import { BottomSheetContent } from '~/components/BottomSheetContent';

import * as Location from 'expo-location';
import Octicons from '@expo/vector-icons/Octicons';
import { getOrSetRandomId } from '~/lib/utils';

export default function Home() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [selectedHajzlId, setSelectedHajzlId] = useState<Id<'hajzle'> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addVote = useMutation(api.hajzl.vote);
  const voteRestroom = useMutation(api.hajzl.voteRestroom);
  const reportRestroom = useMutation(api.hajzl.report);

  const [isVoteLoading, setIsVoteLoading] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [isRestroomVoteLoading, setIsRestroomVoteLoading] = useState(false);
  const [restroomVoteError, setRestroomVoteError] = useState<string | null>(null);
  const [isReporting, setIsReporting] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState(false);

  const [reportReason, setReportReason] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);

  // Fast timing animation configuration
  const animationConfigs = useBottomSheetTimingConfigs({
    duration: 200,
    easing: Easing.out(Easing.quad),
  });
  const handlePresentModalPress = useCallback((hajzlId: Id<'hajzle'>) => {
    setSelectedHajzlId(hajzlId);
    setIsModalOpen(true);
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
    if (index === -1) {
      setIsModalOpen(false);
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    async function getCurrentLocation() {
      setIsLocationLoading(true);
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
      setIsLocationLoading(false);
    }
    getCurrentLocation();
  }, []);

  const handleVote = async (codeId: Id<'accessCodes'>, isUpvote: boolean) => {
    const id = await getOrSetRandomId();

    setIsVoteLoading(true);
    setVoteError(null);
    try {
      await addVote({
        accessCodeId: codeId,
        isUpvote,
        userId: id,
      });
    } catch (error) {
      setVoteError('Failed to vote. Please try again.');
    } finally {
      setIsVoteLoading(false);
    }
  };

  const handleRestroomVote = async (isUpvote: boolean) => {
    const id = await getOrSetRandomId();

    setIsRestroomVoteLoading(true);
    setRestroomVoteError(null);
    try {
      await voteRestroom({
        restroomId: selectedHajzlId!,
        isUpvote,
        userId: id,
      });
    } catch (error) {
      setRestroomVoteError('Failed to vote. Please try again.');
    } finally {
      setIsRestroomVoteLoading(false);
    }
  };

  const handleReport = async () => {
    const id = await getOrSetRandomId();

    setIsReporting(true);
    setReportError(null);
    try {
      await reportRestroom({
        restroomId: selectedHajzlId!,
        reason: reportReason || undefined,
        userId: id,
      });
      setReportSuccess(true);
      setReportReason('');
      setShowReportForm(false);
      setTimeout(() => setReportSuccess(false), 3000);
    } catch (error) {
      setReportError('Failed to report. Please try again.');
    } finally {
      setIsReporting(false);
    }
  };

  const hajzle = useQuery(api.hajzl.list);
  return (
    <>
      <GestureHandlerRootView style={styles.container}>
        <Stack.Screen options={{ title: 'Hajzlfinder Mobile' }} />
        {!isModalOpen && (
          <>
            <TouchableOpacity
              style={styles.floatingButton}
              onPress={() => {
                getCurrentLocation();
              }}>
              {isLocationLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Octicons name="location" size={24} color="white" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => {
                router.push('/settings');
              }}>
              <Octicons name="gear" size={24} color="#000" />
            </TouchableOpacity>
          </>
        )}
        <BottomSheetModalProvider>
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
              <BottomSheetContent
                hajzlId={selectedHajzlId}
                isVoteLoading={isVoteLoading}
                voteError={voteError}
                isRestroomVoteLoading={isRestroomVoteLoading}
                restroomVoteError={restroomVoteError}
                isReporting={isReporting}
                reportError={reportError}
                reportSuccess={reportSuccess}
                handleRestroomVote={handleRestroomVote}
                handleReport={handleReport}
                handleCodeVote={handleVote}
              />
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
    zIndex: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  settingsButton: {
    backgroundColor: '#FFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 1,
    elevation: 5,
    top: 60,
    right: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
