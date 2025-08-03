import { Doc, Id } from '~/convex/_generated/dataModel';
import type { MapRef } from '@vis.gl/react-maplibre';
import maplibregl from 'maplibre-gl';
import Supercluster from 'supercluster';

export interface Restroom {
    _id: Id<"hajzle">;
    name: string;
    description: string;
    lat: number;
    lng: number;
    createdAt: number;
    _creationTime: number;
}

// Store markers and cluster instance globally to manage them properly
let currentMarkers: maplibregl.Marker[] = [];
let clusterIndex: Supercluster | null = null;

// Initialize cluster with configuration
function initializeCluster(restrooms: Restroom[]) {
    if (!clusterIndex) {
        clusterIndex = new Supercluster({
            radius: 60, // Cluster radius in pixels
            maxZoom: 16, // Max zoom to cluster points on
            minZoom: 0, // Min zoom to cluster points on
            minPoints: 2, // Minimum points to form a cluster
        });
    }

    // Convert restrooms to GeoJSON features
    const points = restrooms.map(restroom => ({
        type: 'Feature' as const,
        properties: {
            cluster: false,
            restroomId: restroom._id,
            restroom,
        },
        geometry: {
            type: 'Point' as const,
            coordinates: [restroom.lng, restroom.lat],
        },
    }));

    clusterIndex.load(points);
    return clusterIndex;
}

export function addMapMarkers(
    mapRef: React.RefObject<MapRef | null>,
    restrooms: Restroom[] | undefined,
    selectedRestroom: Restroom | null,
    onMarkerClick: (restroom: Restroom) => void
) {
    const map = mapRef.current?.getMap();
    if (!map || !restrooms || restrooms.length === 0) return;

    // Clear existing markers
    clearMapMarkers();

    // Initialize clustering
    const cluster = initializeCluster(restrooms);

    // Get current map bounds and zoom
    const bounds = map.getBounds();
    const zoom = Math.floor(map.getZoom());

    // Get clusters for current view
    const clusters = cluster.getClusters([
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth()
    ], zoom);

    // Add markers for clusters and individual points
    clusters.forEach((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const { cluster: isCluster, point_count: pointCount } = feature.properties;

        if (isCluster) {
            // Create cluster marker
            addClusterMarker(map, lng, lat, pointCount, () => {
                // Zoom into cluster on click
                const expansionZoom = Math.min(
                    cluster.getClusterExpansionZoom(feature.properties.cluster_id),
                    16
                );
                map.easeTo({
                    center: [lng, lat],
                    zoom: expansionZoom,
                    duration: 500
                });
            });
        } else {
            // Create individual restroom marker
            const restroom = feature.properties.restroom;
            const isSelected = selectedRestroom?._id === restroom._id;
            addRestroomMarker(map, restroom, isSelected, onMarkerClick);
        }
    });
}

function addClusterMarker(
    map: maplibregl.Map,
    lng: number,
    lat: number,
    pointCount: number,
    onClick: () => void
) {
    // Create cluster marker element
    const markerElement = document.createElement('div');
    markerElement.className = 'cursor-pointer transition-transform hover:scale-110';

    // Size cluster based on point count
    const size = pointCount < 10 ? 'w-10 h-10' : pointCount < 100 ? 'w-12 h-12' : 'w-14 h-14';
    const bgColor = pointCount < 10 ? 'bg-blue-500' : pointCount < 100 ? 'bg-purple-500' : 'bg-red-500';

    markerElement.innerHTML = `
        <div class="${size} ${bgColor} border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white font-bold">
            <span class="text-sm">${pointCount}</span>
        </div>
    `;

    // Add click handler
    markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick();
    });

    // Create and add marker
    const marker = new maplibregl.Marker({
        element: markerElement,
        anchor: 'center'
    })
        .setLngLat([lng, lat])
        .addTo(map);

    currentMarkers.push(marker);
}

function addRestroomMarker(
    map: maplibregl.Map,
    restroom: Restroom,
    isSelected: boolean,
    onMarkerClick: (restroom: Restroom) => void
) {
    // Create marker element
    const markerElement = document.createElement('div');
    markerElement.className = `cursor-pointer transition-transform hover:scale-110 ${isSelected ? 'scale-125 ' : ''
        }`;
    markerElement.innerHTML = `
      <div class="relative">
        <div class="${isSelected
            ? 'w-8 h-8 bg-blue-500 border-2 border-white'
            : 'w-8 h-8 bg-white border border-white'
        } rounded-full shadow-lg flex items-center justify-center">
          <span class="${isSelected ? 'text-white' : 'text-gray-700'} text-lg font-bold">🚽</span>
        </div>
        ${isSelected ? '<div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-500"></div>' : ''}
      </div>
    `;

    // Create marker
    const marker = new maplibregl.Marker({
        element: markerElement,
        anchor: 'bottom'
    })
        .setLngLat([restroom.lng, restroom.lat])
        .setPopup(
            new maplibregl.Popup({ offset: 25 }).setHTML(
                `<div class="p-2">
          <h3 class="font-bold text-sm mb-1">${restroom.name}</h3>
          <p class="text-xs text-gray-600">${restroom.description}</p>
         </div>`
            )
        );

    // Add click handler
    markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        onMarkerClick(restroom);
    });

    marker.addTo(map);
    currentMarkers.push(marker);
}

export function updateMapMarkerPositions(
    mapRef: React.RefObject<MapRef | null>,
    restrooms: Restroom[] | undefined,
    selectedRestroom?: Restroom | null,
    onMarkerClick?: (restroom: Restroom) => void
) {
    // Re-render markers with clustering when map view changes
    if (selectedRestroom !== undefined && onMarkerClick) {
        addMapMarkers(mapRef, restrooms, selectedRestroom, onMarkerClick);
    }
}

export function clearMapMarkers() {
    currentMarkers.forEach(marker => marker.remove());
    currentMarkers = [];
}

export function resetClusterIndex() {
    clusterIndex = null;
}