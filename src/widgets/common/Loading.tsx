import { Flex, Spinner } from '@chakra-ui/react';
import React from 'react';

const Loading: React.FC = () => {
  return (
    <Flex height='100vh' justify='center' align='center'>
      <Spinner size='xl' />
    </Flex>
  )
}

export default Loading;