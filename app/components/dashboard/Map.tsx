import React from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";

function Map() {
  return (
    <div className="relative w-full h-screen">
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}
      >
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={{ lat: 40.7128, lng: -74.006 }}
          zoom={14}
        >
          {/* You can add markers or other components here */}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default Map;
