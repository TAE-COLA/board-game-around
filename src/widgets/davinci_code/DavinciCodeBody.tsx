import { Flex, FlexProps } from '@chakra-ui/react';
import { DavinciCodeTile as tileEntity, User } from 'entities';
import { useAuthContext } from 'features';
import React from 'react';
import { DavinciCodeHands } from 'widgets';

type IProps = FlexProps & {
  players: User[];
  hands: {
    [key: string]: tileEntity[];
  };
  turn: User;
  finishedPlayers: User[];
  onClickTile: (player: User, index: number) => void;
};

const DavinciCodeBody: React.FC<IProps> = ({
  players,
  hands,
  turn,
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
            onClickTile={(index) => onClickTile(player, index)}
          />
        ))}
    </Flex>
  );
};

export default DavinciCodeBody;
