import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import { View } from '@adobe/react-spectrum';
import { NodeLocation } from '../utils/BayMeshApi';

import "leaflet/dist/leaflet.css";

interface MiniMapProps {
  nodeLocation: NodeLocation;
}

export default function MiniMap({ nodeLocation }: MiniMapProps) {
  const location: LatLngExpression = [nodeLocation.latitude, nodeLocation.longitude];

  var nodeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  var gatewayIcon = new L.Icon({
    iconUrl: 'https://sfo2.digitaloceanspaces.com/obj/tmp/satellite-antenna.png',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
    shadowSize: [36, 36]
  });

  const markerElements = [<Marker position={location} icon={nodeIcon} />
  ]

  if (nodeLocation.gateways) {
    Object.entries(nodeLocation.gateways).map(([_, gateway], idx) => {
      {
        if (gateway && gateway.latitude && gateway.longitude) {
          markerElements.push(<Marker
            key={idx}
            position={[gateway.latitude, gateway.longitude]}
            icon={gatewayIcon}
          />);
        }
      }
    })
  }

  return (
    <View width="320px" height="320px">
      <MapContainer center={location} zoom={12} style={{
        height: '100%', width: '100%'
      }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markerElements.reverse()}
      </MapContainer>
    </View >
  );
};