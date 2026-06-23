import { Flex, Spinner } from '@chakra-ui/react';
import React from 'react';

export const Loading: React.FC = () => {
  return (
    <Flex minHeight='100dvh' justify='center' align='center'>
      <Spinner size='xl' />
    </Flex>
  );
};
