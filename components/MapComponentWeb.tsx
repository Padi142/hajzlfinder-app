'use client';

import { useEffect, useRef, useState } from 'react';
import { Map } from '@vis.gl/react-maplibre';
import type { MapRef, ViewStateChangeEvent } from '@vis.gl/react-maplibre';
import { Doc, Id } from '~/convex/_generated/dataModel';
import {
  addMapMarkers,
  updateMapMarkerPositions,
  clearMapMarkers,
  resetClusterIndex,
  type Restroom,
} from './map-utils';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as Location from 'expo-location';
import { DEFAULT_LOCATION } from '~/app/lib/constants';

export const MapComponentWeb = ({
  handlePresentModalPress,
  hajzle,
  initialLocation,
}: {
  handlePresentModalPress: (id: Id<'hajzle'>) => void;
  hajzle: Doc<'hajzle'>[] | undefined;
  initialLocation: Location.LocationObject | null;
}) => {
  const mapRef = useRef<MapRef | null>(null);
  const [mapZoom, setMapZoom] = useState(13);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(null);

  const restrooms: Restroom[] | undefined = hajzle?.map((hajzl) => ({
    _id: hajzl._id,
    name: hajzl.name,
    description: hajzl.description,
    lat: hajzl.lat,
    lng: hajzl.lng,
    createdAt: hajzl._creationTime,
    _creationTime: hajzl._creationTime,
  }));

  // Handle flying to selected restroom
  useEffect(() => {
    if (selectedRestroom && mapRef.current && mapLoaded) {
      mapRef.current.flyTo({
        center: [selectedRestroom.lng, selectedRestroom.lat],
        zoom: 16,
        duration: 1000,
      });
    }
  }, [selectedRestroom, mapLoaded]);

  // Handle marker management
  useEffect(() => {
    if (mapLoaded) {
      resetClusterIndex();

      addMapMarkers(mapRef, restrooms, selectedRestroom, (restroom) => {
        setSelectedRestroom(restroom);
        handlePresentModalPress(restroom._id);
      });

      const map = mapRef.current?.getMap();
      if (map) {
        const handleMapMove = () => {
          updateMapMarkerPositions(mapRef, restrooms, selectedRestroom, (restroom) => {
            setSelectedRestroom(restroom);
            handlePresentModalPress(restroom._id);
          });
        };

        map.on('move', handleMapMove);
        map.on('zoom', handleMapMove);

        return () => {
          map.off('move', handleMapMove);
          map.off('zoom', handleMapMove);
        };
      }
    }

    return () => {
      clearMapMarkers();
    };
  }, [hajzle, selectedRestroom, mapLoaded, handlePresentModalPress]);

  if (!restrooms || restrooms.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-200">
        Loading Map...
      </div>
    );
  }

  return (
    <div className="pt-[60px] sm:pt-0" style={{ height: '100vh', width: '100%' }}>
      <Map
        ref={mapRef}
        onZoom={(e: ViewStateChangeEvent) => setMapZoom(e.viewState.zoom)}
        onClick={(e: any) => {
          console.log('Map clicked at:', e.lngLat.lat, e.lngLat.lng);
        }}
        initialViewState={{
          latitude: initialLocation?.coords.latitude ?? DEFAULT_LOCATION.latitude,
          longitude: initialLocation?.coords.longitude ?? DEFAULT_LOCATION.longitude,
          zoom: 13,
        }}
        style={{ height: '100%', width: '100%' }}
        mapStyle={require('~/assets/map/map-light.json')}
        attributionControl={false}
        onLoad={() => setMapLoaded(true)}
      />
    </div>
  );
};
