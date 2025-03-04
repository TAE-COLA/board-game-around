import { Card, CardHeader, CardProps, Flex } from '@chakra-ui/react';
import { DavinciCodeTile as tileEntity, User } from 'entities';
import { useAuthContext } from 'features';
import React from 'react';
import { DavinciCodeTile } from 'widgets';

type IProps = CardProps & {
  player: User;
  hands: tileEntity[];
}

const DavinciCodeHands: React.FC<IProps> = ({
  player,
  hands,
  ...props
}) => {
  const auth = useAuthContext();
  const isMyHand = auth.id === player.id;

  return (
    <Card width='fit-content' height='fit-content' align='center' gap='4' padding='4' {...props}>
      <CardHeader fontWeight='bold' padding='1'>{isMyHand ? "나" : player.name}</CardHeader>
      <Flex direction='row' alignItems='center' gap='4'>
        {hands.map((tile, index) =>
          <DavinciCodeTile
            key={index}
            player={player}
            tile={tile}
          />
        )}
      </Flex>
    </Card>
  );
}

export default DavinciCodeHands;