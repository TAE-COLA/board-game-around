import { Flex, FlexProps, Text } from '@chakra-ui/react';
import { useLoungeContext } from 'features';
import React from 'react';

const RuleBox: React.FC<FlexProps> = ({ ...props }) => {
  const lounge = useLoungeContext();

  return (
    <Flex direction='column' paddingX='6' paddingY='4' gap='4' background='gray.100' borderRadius='md' {...props}>
      <Text fontSize='xl' fontWeight='bold'>{lounge.game.name} 게임이 곧 시작됩니다!</Text>
      <Text>게임 설명: {lounge.game.description}</Text>
    </Flex>
  )
};

export default RuleBox;