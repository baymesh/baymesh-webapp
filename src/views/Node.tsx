import { Flex, Form, Grid, TextField, View, Text } from '@adobe/react-spectrum';
import React, { useEffect } from 'react';
import MiniMap from '../components/MiniMap';
import BayMeshApi, { NodeInfo, NodeLocation } from '../utils/BayMeshApi';

export default function Node() {
    const bayMeshApi = new BayMeshApi();
    const nodeHexId = window.location.pathname.split('/')[2];
    const nodeDecId = parseInt(nodeHexId, 16);
    const [isLoading, setIsLoading] = React.useState(true);
    const [nodeInfo, setNodeInfo] = React.useState<NodeInfo | null>(null);
    const [nodeLocation, setNodeLocation] = React.useState<NodeLocation | null>(null);

    useEffect(() => {
        Promise.all([
            bayMeshApi.getNodeInfo(nodeHexId),
            bayMeshApi.getNodeLocation(nodeHexId)
        ]).then(([nodeInfo, nodeLocation]) => {
            if (nodeLocation && nodeLocation.length > 0) {
                setNodeLocation(nodeLocation[0]);
            }
            setNodeInfo(nodeInfo);
            setIsLoading(false);
        }).catch((err) => {
            console.error(err);
            setIsLoading(false);
        });
    }, []);


    if (isLoading) {
        return <p>Loading...</p>
    }

    const nodeLinks = (
        <>
            <h3>External Links:</h3>
            <ul>
                <li><a href={`https://data.bayme.sh/node?id=${nodeHexId}`} target="_blank">Bayme.sh Map</a></li>
                <li><a href={`https://meshview.armooo.net/packet_list/${nodeDecId}`} target="_blank" rel="noopener noreferrer">Armooo Meshview</a></li>
                <li><a href={`https://meshtastic.liamcottle.net/?node_id=${nodeDecId}`} target="_blank" rel="noopener noreferrer">Liam's Map</a></li>
                <li><a href={`https://meshmap.net/#${nodeDecId}`} target="_blank" rel="noopener noreferrer">Meshmap.net</a></li>
            </ul>
        </>
    )

    if (nodeInfo) {
        return (
            <Grid
                areas={{
                    base: [
                        'longName',
                        'info',
                        'map',
                        'links'
                    ],
                    M: [
                        'longName longName',
                        'info   map',
                        'links      links'
                    ],
                    L: [
                        'longName longName longName',
                        'info links  map']
                }}
                columns={{
                    M: ['1fr', '1fr'],
                    L: ['1fr', '1fr', '1fr']
                }}
                gap="size-100"
            >
                <View gridArea="longName">
                    <h1>{nodeInfo.longName}</h1>
                </View>
                <View gridArea="info">
                    <Form
                        isQuiet
                        aria-label="Quiet example"
                        maxWidth="size-3600">
                        <TextField isReadOnly label="Short Name" value={nodeInfo.shortName} />
                        <TextField isReadOnly label="MAC Address" value={nodeInfo.macaddr} />
                        <TextField isReadOnly label="Hex Id" value={nodeHexId} />
                        <TextField isReadOnly label="Hardware Model" value={nodeInfo.hwModel} />
                        <TextField isReadOnly label="Role" value={nodeInfo.role} />
                        <TextField isReadOnly label="Hop Start" value={nodeInfo.hopStart.toString()} />
                        <TextField isReadOnly label="Updated At" value={new Date(nodeInfo.updatedAt).toLocaleString()} />
                    </Form>
                </View>
                <View gridArea="links">
                    {nodeLinks}
                </View>
                <View gridArea="map">
                    {nodeLocation && (
                        <Flex direction={'column'} alignItems={'center'}>
                            <MiniMap latitude={nodeLocation.latitude} longitude={nodeLocation.longitude} />
                            <Text>Position report time: {(new Date(nodeLocation.time)).toLocaleString()}</Text>
                        </Flex>
                    )}
                </View>
            </Grid>
        );
    }


    return (
        <>
            <h1>{nodeHexId}</h1>
            <p>No node info found in cache.</p>
            {nodeLinks}
        </>
    );
};
