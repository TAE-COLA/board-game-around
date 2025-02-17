import { FlexProps, SimpleGrid } from '@chakra-ui/react';
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
  const { id: authId } = useAuthContext();

  return (
    <SimpleGrid width="100%" minChildWidth="xs" columnGap="4" rowGap="4" {...props}>
      {players
        .filter(player => player.id !== authId)
        .map(player => (
          <DavinciCodeHands
            key={player.id}
            player={player}
            hands={hands[player.id]}
          />
        ))
      }
    </SimpleGrid>
  );
};

export default DavinciCodeBody;