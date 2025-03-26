import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Card, CardFooter, CardHeader, CardProps, Flex } from '@chakra-ui/react';
import { useAuthContext } from 'app';
import { DavinciCodeTileModel as tileEntity, User } from 'models';
import React from 'react';
import { DavinciCodeTile } from 'widgets';

type Props = CardProps & {
  player: User;
  hands: tileEntity[];
  turn: User;
  phase: 'INITIAL_DRAW' | 'DRAW' | 'GUESS';
  isFinishedPlayer: boolean;
  onClickTile: (index: number) => void;
};

export const DavinciCodeHands: React.FC<Props> = ({
  player,
  hands,
  turn,
  phase,
  isFinishedPlayer,
  onClickTile,
  ...props
}) => {
  const auth = useAuthContext();
  const isMyHand = auth.id === player.id;

  return (
    <Card
      width='fit-content'
      height='fit-content'
      align='center'
      gap={4}
      padding={4}
      opacity={isFinishedPlayer ? 0.5 : 1}
      {...props}
    >
      <CardHeader fontWeight='bold' padding={1}>
        {isMyHand ? '나' : player.name}
      </CardHeader>
      <Flex direction='row' alignItems='center' gap={3}>
        {hands.map((tile, index) => (
          <Flex direction='column' gap={2} align='center' key={index}>
            <DavinciCodeTile player={player} tile={tile} onClick={() => onClickTile(index)} />
            {tile.isRevealed ? <ViewIcon opacity={0.5} /> : <ViewOffIcon opacity={0.5} />}
          </Flex>
        ))}
      </Flex>
      <CardFooter>
        {turn.id === player.id
          ? phase === 'INITIAL_DRAW' || phase === 'DRAW'
            ? '타일을 뽑고 있습니다...'
            : '추론하고 있습니다...'
          : ''}
      </CardFooter>
    </Card>
  );
};
