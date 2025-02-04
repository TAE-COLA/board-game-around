import { Card, CardHeader, CardProps, Flex, FlexProps, Text } from '@chakra-ui/react';
import { DavinciCodeChip as chipEntity, User } from 'entities';
import { useAuthContext } from 'features';
import React from 'react';
import { DavinciCodeChip } from 'widgets';

type IProps = CardProps & {
  player: User;
  hands: chipEntity[];
}

const DavinciCodeHands: React.FC<IProps> = ({
  player,
  hands,
  ...props
}) => {
  const auth = useAuthContext();
  const isMyHand = auth.id === player.id;

  return (
    <Card width='fit-content' align='center' gap='4' padding='4' {...props}>
      <CardHeader fontWeight='bold' padding='1'>{isMyHand ? "나" : player.name}</CardHeader>
      <Flex direction='row' alignItems='center' gap='4'>
        {hands.map((chip, index) => 
          <DavinciCodeChip
            key={index}
            player={player}
            chip={chip}
          />
        )}
      </Flex>
    </Card>
  );
}

export default DavinciCodeHands;