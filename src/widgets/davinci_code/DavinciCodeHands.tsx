import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Card, CardHeader, CardProps, Flex } from '@chakra-ui/react';
import { DavinciCodeTile as tileEntity, User } from 'entities';
import { useAuthContext } from 'features';
import React from 'react';
import { DavinciCodeTile } from 'widgets';

type IProps = CardProps & {
  player: User;
  hands: tileEntity[];
  onClickTile: (index: number) => void;
};

const DavinciCodeHands: React.FC<IProps> = ({
  player,
  hands,
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
      gap='4'
      padding='4'
      {...props}
    >
      <CardHeader fontWeight='bold' padding='1'>
        {isMyHand ? '나' : player.name}
      </CardHeader>
      <Flex direction='row' alignItems='center' gap='3'>
        {hands.map((tile, index) => (
          <Flex direction='column' gap={2} align='center' key={index}>
            <DavinciCodeTile
              player={player}
              tile={tile}
              onClick={() => onClickTile(index)}
            />
            {tile.isRevealed ? (
              <ViewIcon opacity={0.5} />
            ) : (
              <ViewOffIcon opacity={0.5} />
            )}
          </Flex>
        ))}
      </Flex>
    </Card>
  );
};

export default DavinciCodeHands;
