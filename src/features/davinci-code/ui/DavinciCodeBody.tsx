import { Flex, FlexProps } from '@chakra-ui/react';
import { useAuthContext } from 'app';
import { User } from 'features/auth';
import { DavinciCodeTile as tileEntity } from '../model';
import React from 'react';
import { DavinciCodeHands } from './DavinciCodeHands';

type IProps = FlexProps & {
  players: User[];
  hands: {
    [key: string]: tileEntity[];
  };
  turn: User;
  phase: 'INITIAL_DRAW' | 'DRAW' | 'GUESS';
  finishedPlayers: User[];
  onClickTile: (player: User, index: number) => void;
};

export const DavinciCodeBody: React.FC<IProps> = ({
  players,
  hands,
  turn,
  phase,
  finishedPlayers,
  onClickTile,
  ...props
}) => {
  const { id: authId } = useAuthContext();

  return (
    <Flex
      width='100%'
      direction={{ base: 'column', lg: 'row' }}
      justify='center'
      align='center'
      gap='8'
      {...props}
    >
      {players
        .filter((player) => player.id !== authId)
        .map((player) => (
          <DavinciCodeHands
            key={player.id}
            player={player}
            hands={hands[player.id]}
            turn={turn}
            phase={phase}
            isFinishedPlayer={finishedPlayers.includes(player)}
            onClickTile={(index) => onClickTile(player, index)}
          />
        ))}
    </Flex>
  );
};
