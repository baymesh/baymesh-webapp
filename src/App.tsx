import { defaultTheme, Flex, Footer, Grid, Provider, View } from '@adobe/react-spectrum';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import Home from './views/Home';
import Node from './views/Node';

import './App.css'

export default function App() {
  const navigate = useNavigate();

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
          areas={[
            'header header',
            'content content',
            'footer footer'
          ]}
          columns={['7r', '2fr']}
          rows={['auto', 'auto', 'size-300']}
          gap="size-100"
          height={"100dvh"} >
          <View paddingTop={"size-100"} gridArea="header">
            <Flex direction={"row"} wrap={"wrap"} justifyContent={"left"} width="100%" gap={"size-100"}>
              {headerMenuItem("🏠", "Home", "/")}
              {headerMenuItem("🛰️", "OHR", "/node/3b46b95c")}
            </Flex>
          </View>
          <View gridArea="content">
            <Routes>
              <Route path="/node/*" element={<Node />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </View>
          <View gridArea='footer'>
            <Flex alignItems={"center"} direction={"column"}>
              <Footer>built with 🩸 &amp; 💦 by <a href="https://www.qrz.com/db/K6SH" target={"_blank"} rel={"noreferrer"}>K6SH</a></Footer>
            </Flex>
          </View>
        </Grid>
      </View>
    </Provider >
  )
}