import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Card, CardFooter, CardHeader, CardProps, Flex } from '@chakra-ui/react';
import { DavinciCodeTile as tileEntity, User } from 'entities';
import { useAuthContext } from 'features';
import React from 'react';
import { DavinciCodeTile } from 'widgets';

type IProps = CardProps & {
  player: User;
  hands: tileEntity[];
  turn: User;
  phase: 'DRAW' | 'GUESS';
  isFinished: boolean;
  onClickTile: (index: number) => void;
};

const DavinciCodeHands: React.FC<IProps> = ({
  player,
  hands,
  turn,
  phase,
  onClickTile,
  ...props
}) => {
  const auth = useAuthContext();
  const isMyHand = auth.id === player.id;

  return (
    <Card width='fit-content' height='fit-content' align='center' gap='4' padding='4' {...props}>
      <CardHeader fontWeight='bold' padding='1'>
        {isMyHand ? '나' : player.name}
      </CardHeader>
      <Flex direction='row' alignItems='center' gap='3'>
        {hands.map((tile, index) => (
          <Flex direction='column' gap={2} align='center' key={index}>
            <DavinciCodeTile player={player} tile={tile} onClick={() => onClickTile(index)} />
            {tile.isRevealed ? <ViewIcon opacity={0.5} /> : <ViewOffIcon opacity={0.5} />}
          </Flex>
        ))}
      </Flex>
      <CardFooter>
        {isMyHand ?? turn.id === player.id
          ? phase === 'DRAW'
            ? '타일을 뽑고 있습니다...'
            : '추론하고 있습니다...'
          : ''}
      </CardFooter>
    </Card>
  );
};

export default DavinciCodeHands;
