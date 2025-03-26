import { Flex, Spinner } from '@chakra-ui/react';
import React from 'react';
import { Align, Dimension, Size } from 'shared';

export const Loading: React.FC = () => {
  return (
    <Flex height={Dimension.ScreenHeight} justify={Align.Center} align={Align.Center}>
      <Spinner size={Size.Xl} />
    </Flex>
  );
};
