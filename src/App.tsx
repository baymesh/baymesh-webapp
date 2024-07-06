import { defaultTheme, Flex, Footer, Grid, Provider, View } from '@adobe/react-spectrum';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import Home from './views/Home';
import Node from './views/Node';
import NodeMap from './views/NodeMap';
import NodeList from './views/NodeList';


import './App.css'
import NodeSearch from './components/NodeSearch';
import BayMeshApi, { NodeInfoMap } from './utils/BayMeshApi';
import { useEffect } from 'react';
import React from 'react';

export default function App() {
  const navigate = useNavigate();
  const bayMeshApi = new BayMeshApi();
  const [nodeInfos, setNodeInfos] = React.useState<NodeInfoMap>({});

  useEffect(() => {
    bayMeshApi.getNodeInfos().then((nodeInfos) => {
      setNodeInfos(nodeInfos);
    })
  }, []);

  const headerMenuItem = (icon: string, displayText: string, linkTo: string) => {
    const selected = window.location.pathname === linkTo;
    return (
      <Link key={icon} to={linkTo}>
        <View
          backgroundColor={selected ? "gray-200" : "gray-100"}
          padding={"size-50"}
          paddingBottom={"size-75"}
          borderRadius={"regular"}
        >
          <Flex alignItems="center" direction={"column"} wrap>
            <div>{icon}</div>
            <div>{displayText}</div>
          </Flex>
        </View>
      </Link>
    )
  };

  return (
    <Provider theme={defaultTheme} colorScheme="light" router={{ navigate }}>
      <View paddingStart={"size-100"} paddingEnd={"size-100"}>
        <Grid
          areas={{
            base: [
              'header',
              'search',
              'content',
              'footer'
            ],
            L: [
              'header search',
              'content content',
              'footer footer'
            ]
          }}
          columns={{
            base: ['1fr'],
            L: ['7r', '2fr']
          }}
          rows={{
            base: ['auto', 'auto', 'auto', 'size-300'],
            L: ['auto', 'auto', 'size-300']
          }}
          gap="size-100"
          height={"100dvh"} >
          <View paddingTop={"size-100"} gridArea="header">
            <Flex direction={"row"} wrap={"wrap"} justifyContent={"left"} width="100%" gap={"size-100"}>
              {headerMenuItem("🏠", "Home", "/")}
              {headerMenuItem("📟", "Nodes", "/nodeList")}
              {headerMenuItem("🛰️1", "OHR", "/node/a20afe2c")}
              {headerMenuItem("🛰️2", "NOHR", "/node/75f1804c")}
              {headerMenuItem("🛰️3", "JimM", "/node/eecfe349")}
              {headerMenuItem("🛰️4", "MAM", "/node/fa6dc348")}
            </Flex>
          </View>
          <View gridArea="search" justifySelf={"end"} paddingTop="size-300" paddingEnd={"size-100"}><NodeSearch nodeInfos={nodeInfos} /></View>
          <View gridArea="content">
            <Routes>
              <Route path="/node/:nodeHexId" element={<Node />} />
              <Route path="/nodeMap/:nodeHexId" element={<NodeMap />} />
              <Route path="/nodeList" element={<NodeList nodeInfos={nodeInfos} />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </View>
          <View gridArea='footer'>
            <Flex alignItems={"center"} direction={"column"}>
              <Footer>built with 🩸 &amp; 💦 by <a href="https://k6sh.com" target={"_blank"} rel={"noreferrer"}>K6SH</a> and the <a href="https://bayme.sh" target={"_blank"} rel={"noreferrer"}>bayme.sh</a> team</Footer>
            </Flex>
          </View>
        </Grid>
      </View>
    </Provider >
  )
}