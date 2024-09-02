import { Flex, FlexProps, Text } from '@chakra-ui/react';
import { Game } from 'entities';
import React from 'react';

type IProps = FlexProps & {
  game: Game;
};

const RuleBox: React.FC<IProps> = ({
  game,
  ...props
}) => {
  return (
    <Flex direction='column' paddingX='6' paddingY='4' gap='4' background='gray.100' borderRadius='md' {...props}>
      <Text fontSize='xl' fontWeight='bold'>{game.name} 게임이 곧 시작됩니다!</Text>
      <Text>게임 설명: {game.description}</Text>
    </Flex>
  )
};

export default RuleBox;