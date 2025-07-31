import { MapView, Camera, PointAnnotation } from '@maplibre/maplibre-react-native';
import { View, Text } from 'react-native';
import { Doc } from '~/convex/_generated/dataModel';
import { ToiletMarker } from './ToiletMarker';

export const MapComponent = ({ hajzle }: { hajzle: Doc<"hajzle">[] | undefined }) => {
  if (!hajzle) return (<View><Text>No hajzle</Text></View>);
  
 
  
  return (
    <MapView style={{ flex: 1 }} mapStyle={require('~/assets/map/map-light.json')}>
      <Camera
        centerCoordinate={[16.60796, 49.19522]}
        zoomLevel={13}
      />
              {hajzle.map((hajzl) => (
          <PointAnnotation
            key={hajzl._id}
            id={hajzl._id}
            coordinate={[hajzl.lng, hajzl.lat]}
            title={hajzl.name}
            snippet={hajzl.description}
          >
            <ToiletMarker isSelected={false} />
          </PointAnnotation>
        ))}
    </MapView>
  );
};