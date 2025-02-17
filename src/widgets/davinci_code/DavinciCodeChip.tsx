import { Card, CardBody, CardProps, Divider, Flex, Spacer, Text } from '@chakra-ui/react';
import { DavinciCodeChip as ChipEntity, User } from 'entities';
import { useAuthContext } from 'features';
import React from 'react';

const chipSizes = {
  myChip: {
    width: '54px',
    height: '76px'
  },
  otherChip: {
    width: '40px',
    height: '56px'
  }
};

type IProps = CardProps & {
  player: User;
  chip: ChipEntity;
};

const DavinciCodeChip: React.FC<IProps> = ({
  player,  
  chip,
  ...props
}) => {
  const auth = useAuthContext();
  const isMyChip = auth.id === player.id;
  const size = isMyChip ? chipSizes.myChip : chipSizes.otherChip;

  return (
    <Card
      width={size.width}
      height={size.height}
      background={chip.isWhite ? 'white' : 'black'}
      opacity={isMyChip && chip.isRevealed ? 0.3 : 1}
      {...props}
    >
      <CardBody width="100%" height="100%">
        <Flex direction="column" height="100%" alignItems="center" justifyContent="center">
          <Text as="kbd" fontSize="xl" color={chip.isWhite ? 'black' : 'white'}>
            {isMyChip || chip.isRevealed ? chip.number : '>'}
          </Text>
          <Spacer />
          <Divider />
        </Flex>
      </CardBody>
    </Card>
  );
};

export default DavinciCodeChip;