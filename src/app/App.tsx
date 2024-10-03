import { Flex } from '@chakra-ui/react';
import { PageRouter } from 'app';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';


const App: React.FC = () => {
  const background = "linear(to-br, blue.200, pink.200)";
  
  return (
    <Flex className="app" flexDirection="column" width="100%" minHeight="100vh" overflowX="hidden" bgGradient={background}>
      <BrowserRouter>
        <PageRouter />
      </BrowserRouter>
    </Flex>
  );
}

export default App