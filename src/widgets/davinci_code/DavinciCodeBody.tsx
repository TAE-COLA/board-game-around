import { Flex, FlexProps, Text } from '@chakra-ui/react';
import { DavinciCodeChip as chipEntity, User } from 'entities';
import React from 'react';
import { DavinciCodeHands } from 'widgets';

type IProps = FlexProps & {
  players: User[];
  hands: {
    [key: string]: chipEntity[];
  };
  turn: User;
  finishedPlayers: User[];
};

const DavinciCodeBody: React.FC<IProps> = ({ 
  players,
  hands,
  turn,
  finishedPlayers,
  ...props 
}) => {
  return (
    <Flex width='100%' gap='8' {...props}>
      <Flex direction='column' gap='4'>
        <Text>
          players: {players.map(player => player.name).join(', ')}
        </Text>
        <Text>
          hands: {Object.keys(hands).map(key => `${key}: ${hands[key].map(chip => chip.number).join(', ')}`).join(', ')}  
        </Text>
        <Text>
          turn: {turn.name}
        </Text>
        <Text>
          finishedPlayers: {finishedPlayers.map(player => player.name).join(', ')}
        </Text>
        {
          Object.keys(hands).map(key => (
            <DavinciCodeHands
              key={key}
              hands={hands[key]}
            />
          ))
        }
      </Flex>
    </Flex>
  );
};

export default DavinciCodeBody;