import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px",
  position: "relative" as const,
};

const defaultCenter = {
  lat: 40.7831,
  lng: -73.9712, // New York City coordinates
};

function CustomMap({ mapData }: any) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  });

  const [markers, setMarkers] = useState<any[]>([]);
  const [polylines, setPolylines] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(12);
  const [isUpdating, setIsUpdating] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const polylinesRef = useRef<{ [key: string]: google.maps.Polyline }>({});

  const geocodeAddress = useCallback(async (address: string) => {
    const geocoder = new window.google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results: any, status) => {
        if (status === "OK") {
          resolve(results[0].geometry.location);
        } else {
          reject(`Geocode failed: ${status}`);
        }
      });
    });
  }, []);

  const getAlphabeticLabel = (index: number) => {
    return String.fromCharCode(65 + index); // 65 is the ASCII code for 'A'
  };

  const loadMapData = useCallback(async () => {
    setIsUpdating(true);
    try {
      const locations = new Map();
      const newPolylines: any[] = [];
      let labelIndex = 0;
      const bounds = new window.google.maps.LatLngBounds();

      // Clear existing polylines
      Object.values(polylinesRef.current).forEach((polyline) => {
        polyline.setMap(null);
      });
      polylinesRef.current = {};

      for (const route of mapData) {
        const locationA: any = await geocodeAddress(route.pointA);
        const locationB: any = await geocodeAddress(route.pointB);

        const keyA = `${locationA.lat()},${locationA.lng()}`;
        const keyB = `${locationB.lat()},${locationB.lng()}`;

        if (!locations.has(keyA)) {
          locations.set(keyA, {
            position: locationA,
            label: getAlphabeticLabel(labelIndex++),
          });
        }
        if (!locations.has(keyB)) {
          locations.set(keyB, {
            position: locationB,
            label: getAlphabeticLabel(labelIndex++),
          });
        }

        bounds.extend(locationA);
        bounds.extend(locationB);

        const polylineOptions = {
          path: [locationA, locationB],
          geodesic: true,
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 2,
        };

        newPolylines.push({
          id: route.id,
          options: polylineOptions,
        });
      }

      const newMarkers = Array.from(locations.values()).map(
        ({ position, label }, index) => ({
          position,
          label,
          key: `marker-${index}`,
        })
      );

      setMarkers(newMarkers);
      setPolylines(newPolylines);

      // Update map center and zoom based on the bounds
      if (mapRef.current) {
        mapRef.current.fitBounds(bounds);
      } else {
        // Fallback if map is not yet loaded
        const center = bounds.getCenter();
        setMapCenter({ lat: center.lat(), lng: center.lng() });
        setMapZoom(12);
      }
    } catch (error) {
      console.error("Error loading map data:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [mapData, geocodeAddress]);

  useEffect(() => {
    if (isLoaded) {
      loadMapData();
    }
  }, [isLoaded, loadMapData, mapData]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onPolylineLoad = useCallback(
    (polyline: google.maps.Polyline, id: string) => {
      polylinesRef.current[id] = polyline;
    },
    []
  );

  const onPolylineUnmount = useCallback((id: string) => {
    if (polylinesRef.current[id]) {
      polylinesRef.current[id].setMap(null);
      delete polylinesRef.current[id];
    }
  }, []);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div style={containerStyle}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={mapCenter}
        zoom={mapZoom}
        onLoad={onMapLoad}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.key}
            position={marker.position}
            label={marker.label}
          />
        ))}
        {polylines.map((polyline) => (
          <Polyline
            key={polyline.id}
            path={polyline.options.path}
            options={polyline.options}
            onLoad={(polylineInstance) =>
              onPolylineLoad(polylineInstance, polyline.id)
            }
            onUnmount={() => onPolylineUnmount(polyline.id)}
          />
        ))}
      </GoogleMap>
      {isUpdating && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: "20px",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            Updating map...
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomMap;
