import { Flex, FlexProps } from '@chakra-ui/react';
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
    <Flex direction='column' paddingX='6' paddingY='4' background='gray.100' borderRadius='md' {...props}>
      게임명: {game.name}
    </Flex>
  )
};

export default RuleBox;