import { Flex, Form, Grid, TextField, View, Text, ProgressCircle } from '@adobe/react-spectrum';
import React, { useEffect } from 'react';
import MiniMap from '../components/MiniMap';
import Links from '../components/Links';
import BayMeshApi, { NodeInfo, NodeLocation } from '../utils/BayMeshApi';
import NodeInformation from '../components/NodeInformation';
import { useParams } from 'react-router-dom';

export default function Node() {
    const params = useParams();
    const bayMeshApi = new BayMeshApi();
    const [nodeHexId, setNodeHexId] = React.useState<string | undefined>(params.nodeHexId);
    const [isLoading, setIsLoading] = React.useState(true);
    const [nodeInfo, setNodeInfo] = React.useState<NodeInfo | null>(null);
    const [nodeLocation, setNodeLocation] = React.useState<NodeLocation | null>(null);

    useEffect(() => {
        Promise.all([
            bayMeshApi.getNodeInfo(nodeHexId),
            bayMeshApi.getNodeLocations(nodeHexId, 1)
        ]).then(([nodeInfo, nodeLocations]) => {
            if (nodeLocations && nodeLocations.length > 0) {
                setNodeLocation(nodeLocations[0]);
                // console.log(nodeLocations[0]);
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
        setNodeLocation(null);
        setNodeInfo(null);
        setNodeHexId(params.nodeHexId);
    }, [params.nodeHexId])

    if (!nodeHexId) {
        return <p>error</p>
    }

    if (isLoading) {
        return (
            <Flex direction={"column"} justifyContent={"center"} alignItems={"center"}>
                <ProgressCircle size='L' aria-label="Loading…" isIndeterminate />
            </Flex>
        )
    }

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
                    <NodeInformation nodeInfo={nodeInfo} />
                </View>
                <View gridArea="links">
                    <Links nodeHexId={nodeHexId} />
                </View>
                <View gridArea="map">
                    {nodeLocation && (
                        <Flex direction={'column'} alignItems={'center'}>
                            <MiniMap nodeLocation={nodeLocation} />
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
            <Links nodeHexId={nodeHexId} />
        </>
    );
};
