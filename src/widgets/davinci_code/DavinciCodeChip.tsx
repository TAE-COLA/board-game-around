import { Card, CardBody, CardProps, Divider, Flex, Spacer, Text } from '@chakra-ui/react';
import { DavinciCodeChip as ChipEntity, User } from 'entities';
import { useAuthContext } from 'features';
import React from 'react';

type IProps = CardProps & {
  player: User;
  chip: ChipEntity;
}

const DavinciCodeChip: React.FC<IProps> = ({
  player,  
  chip,
  ...props
}) => {
  const auth = useAuthContext();
  const isMyChip = auth.id === player.id;

  return (
    <Card width={isMyChip ? '72px' : '54px'} height={isMyChip ? '100px' : '75px'} background={chip.isWhite ? 'white' : 'black'} opacity={isMyChip && chip.isRevealed ? 0.3 : 1}  {...props}>
      <CardBody width='100%' height='100%'>
        <Flex direction='column' height='100%' alignItems='center' paddingBottom='2'>
          <Text as='kbd' fontSize='xl' color={chip.isWhite ? 'black' : 'white'}>{isMyChip || chip.isRevealed ? chip.number : '>'}</Text>
          <Spacer />
          <Divider />
        </Flex>
      </CardBody>
    </Card>
  );
};

export default DavinciCodeChip;