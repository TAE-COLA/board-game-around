import { Flex, FlexProps, Text } from '@chakra-ui/react';
import { DavinciCodeChip as chipEntity, User } from 'entities';
import { useAuthContext } from 'features';
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
  const auth = useAuthContext();

  return (
    <Flex width='100%' gap='8' {...props}>
      <Flex direction='column' width='100%' gap='4'>
        <Flex width='100%' wrap='wrap' justify='space-between' gap='8'>
          {players.map(player => 
            player.id !== auth.id &&
              <DavinciCodeHands
                key={player.id}
                player={player}
                hands={hands[player.id]}
              />
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default DavinciCodeBody;