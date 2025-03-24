import { Card, CardBody, CardProps, Divider, Flex, Spacer, Text } from '@chakra-ui/react';
import { useAuthContext } from 'app';
import { DavinciCodeTile as TileEntity, User } from 'models';
import React, { useCallback } from 'react';

type Props = CardProps & {
  player: User;
  tile: TileEntity;
  size?: { width: string; height: string };
  onClick: () => void;
};

export const DavinciCodeTile: React.FC<Props> = ({
  player,
  tile,
  size = { width: '54px', height: '76px' },
  onClick,
  ...props
}) => {
  const auth = useAuthContext();
  const isMyTile = auth.id === player.id;

  const handleClick = useCallback(() => {
    if (isMyTile || tile.isRevealed) return;
    onClick();
  }, [isMyTile, tile.isRevealed, onClick]);

  return (
    <Card
      width={size.width}
      height={size.height}
      background={tile.isWhite ? 'white' : 'black'}
      border={tile.isWhite ? '1px solid gray' : '1px solid white'}
      opacity={isMyTile && tile.isRevealed ? 0.3 : 1}
      onClick={handleClick}
      cursor={isMyTile || tile.isRevealed ? 'default' : 'pointer'}
      {...props}
    >
      <CardBody width='100%' height='100%'>
        <Flex direction='column' height='100%' align='center' justify='center'>
          <Text as='kbd' fontSize='xl' color={tile.isWhite ? 'black' : 'white'}>
            {isMyTile || tile.isRevealed ? tile.number : '?'}
          </Text>
          <Spacer />
          {(isMyTile || tile.isRevealed) && <Divider borderColor='gray' />}
        </Flex>
      </CardBody>
    </Card>
  );
};
