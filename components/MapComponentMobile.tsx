import { MapView, Camera, PointAnnotation } from '@maplibre/maplibre-react-native';
import { View, Text } from 'react-native';
import { Doc, Id } from '~/convex/_generated/dataModel';
import { ToiletMarker } from './ToiletMarker';
import * as Location from 'expo-location';
import { DEFAULT_LOCATION } from '~/app/lib/constants';

export const MapComponentMobile = ({
  handlePresentModalPress,
  hajzle,
  initialLocation,
}: {
  handlePresentModalPress: (id: Id<'hajzle'>) => void;
  hajzle: Doc<'hajzle'>[] | undefined;
  initialLocation: Location.LocationObject | null;
}) => {
  if (!hajzle) {
    return (
      <View>
        <Text>No hajzle</Text>
      </View>
    );
  }

  return (
    <MapView style={{ flex: 1 }} mapStyle={require('~/assets/map/map-light.json')}>
      <Camera
        centerCoordinate={[
          initialLocation?.coords.longitude ?? DEFAULT_LOCATION.longitude,
          initialLocation?.coords.latitude ?? DEFAULT_LOCATION.latitude,
        ]}
        zoomLevel={13}
      />
      {hajzle.map((hajzl) => (
        <PointAnnotation
          onSelected={() => handlePresentModalPress(hajzl._id)}
          key={hajzl._id}
          id={hajzl._id}
          coordinate={[hajzl.lng, hajzl.lat]}
          title={hajzl.name}
          snippet={hajzl.description}>
          <ToiletMarker isSelected={false} />
        </PointAnnotation>
      ))}
    </MapView>
  );
};
