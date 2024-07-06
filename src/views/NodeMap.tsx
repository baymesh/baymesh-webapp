import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import { View, Flex, ProgressCircle, Text } from '@adobe/react-spectrum';
import BayMeshApi, { NodeInfo, NodeLocation } from '../utils/BayMeshApi';
import NodeInformation from '../components/NodeInformation';
import { useParams } from 'react-router-dom';

import "leaflet/dist/leaflet.css";

export default function NodeMap() {
  const params = useParams();
  const bayMeshApi = new BayMeshApi();
  const [nodeHexId, setNodeHexId] = React.useState<string | undefined>(params.nodeHexId);
  const [isLoading, setIsLoading] = React.useState(true);
  const [nodeInfo, setNodeInfo] = React.useState<NodeInfo | null>(null);
  const [nodeLocations, setNodeLocations] = React.useState<NodeLocation[]>([]);

  useEffect(() => {
    Promise.all([
      bayMeshApi.getNodeInfo(nodeHexId),
      bayMeshApi.getNodeLocations(nodeHexId, 250)
    ]).then(([nodeInfo, nodeLocations]) => {
      if (nodeLocations && nodeLocations.length > 0) {
        setNodeLocations(nodeLocations);
      }
      setNodeInfo(nodeInfo);
      setIsLoading(false);
    }).catch((err) => {
      console.error(err);
      setIsLoading(false);
    });
  }, [nodeHexId]);

  useEffect(() => {
    setIsLoading(true);
    setNodeLocations([]);
    setNodeInfo(null);
    setNodeHexId(params.nodeHexId);
  }, [params.nodeHexId])

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

  if (isLoading) {
    return (
      <Flex direction={"column"} justifyContent={"center"} alignItems={"center"}>
        <ProgressCircle size='L' aria-label="Loading…" isIndeterminate />
      </Flex>
    )
  }

  const markerElements = [];
  const lineElements = [];
  const gatewayHash = {};

  nodeLocations.forEach((nodeLocation) => {
    if (Object.keys(nodeLocation.gateways).filter(gateway => gateway !== nodeHexId).length > 0) {
      const location: LatLngExpression = [nodeLocation.latitude, nodeLocation.longitude];
      const positionTimestamp = (new Date(nodeLocation.time)).getTime();
      markerElements.push(<Marker key={`position-${positionTimestamp}`} position={location} icon={nodeIcon} />);

      if (nodeLocation.gateways) {
        Object.entries(nodeLocation.gateways).map(([gatewayId, gateway], idx) => {
          {
            if (gateway && gateway.latitude && gateway.longitude && gatewayId !== nodeHexId) {
              if (!gatewayHash[gatewayId]) {
                gatewayHash[gatewayId] = true; // for now only put one marker per gateway;
                markerElements.push(<Marker
                  key={`gateway-${gatewayId}-${positionTimestamp}`}
                  position={[gateway.latitude, gateway.longitude]}
                  icon={gatewayIcon}
                />);
              }
              lineElements.push(<Polyline key={`line-${gatewayId}-${positionTimestamp}`} positions={[location, [gateway.latitude, gateway.longitude]]} opacity={0.3} />)
            }
          }
        })
      }
    }
  });

  if (markerElements.length === 0) {
    return (
      <Flex direction={"column"} justifyContent={"center"} alignItems={"center"}>
        <Text>No Position Packets with Gateway Location Data Found</Text>
      </Flex>
    )
  }

  return (
    <View width="100%" height="100vh">
      <MapContainer center={[nodeLocations[0].latitude, nodeLocations[0].longitude]} zoom={12} style={{
        height: '100%', width: '100%'
      }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markerElements.reverse()}
        {lineElements}
      </MapContainer>
    </View >
  );
};