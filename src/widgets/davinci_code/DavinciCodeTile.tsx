import { Card, CardBody, CardProps, Divider, Flex, Spacer, Text } from '@chakra-ui/react';
import { DavinciCodeTile as TileEntity, User } from 'entities';
import { useAuthContext } from 'features';
import React from 'react';

const tileSizes = {
  myTile: {
    width: '54px',
    height: '76px'
  },
  otherTile: {
    width: '40px',
    height: '56px'
  }
};

type IProps = CardProps & {
  player: User;
  tile: TileEntity;
};

const DavinciCodeTile: React.FC<IProps> = ({
  player,  
  tile,
  ...props
}) => {
  const auth = useAuthContext();
  const isMyTile = auth.id === player.id;
  const size = isMyTile ? tileSizes.myTile : tileSizes.otherTile;

  return (
    <Card
      width={size.width}
      height={size.height}
      background={tile.isWhite ? 'white' : 'black'}
      opacity={isMyTile && tile.isRevealed ? 0.3 : 1}
      {...props}
    >
      <CardBody width="100%" height="100%">
        <Flex direction="column" height="100%" alignItems="center" justifyContent="center">
          <Text as="kbd" fontSize="xl" color={tile.isWhite ? 'black' : 'white'}>
            {isMyTile || tile.isRevealed ? tile.number : '>'}
          </Text>
          <Spacer />
          <Divider />
        </Flex>
      </CardBody>
    </Card>
  );
};

export default DavinciCodeTile;