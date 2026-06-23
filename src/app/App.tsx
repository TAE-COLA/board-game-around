import { Flex } from '@chakra-ui/react';
import { PageRouter } from 'app';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

export const App: React.FC = () => {
  const background = 'linear(to-br, blue.200, pink.200)';

  return (
    <Flex
      className='app'
      flexDirection='column'
      width='100%'
      minHeight='100dvh'
      overflowX='hidden'
      bgGradient={background}
    >
      <BrowserRouter>
        <PageRouter />
      </BrowserRouter>
    </Flex>
  );
};
