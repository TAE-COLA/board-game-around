import { Card, CardBody, CardProps, Divider, Flex, Spacer, Text } from '@chakra-ui/react';
import { DavinciCodeChip as ChipEntity } from 'entities';
import React from 'react';

type IProps = CardProps & {
  chip: ChipEntity;
}

const DavinciCodeChip: React.FC<IProps> = ({
  chip,
  ...props
}) => {
  return (
    <Card width='80px' height='100px' background={chip.isWhite ? 'white' : 'black'} {...props}>
      <CardBody width='100%' height='100%'>
        <Flex direction='column' height='100%' alignItems='center' paddingBottom='2'>
          <Text as='kbd' fontSize='xl' color={chip.isWhite ? 'black' : 'white'}>{chip.number}</Text>
          <Spacer />
          <Divider />
        </Flex>
      </CardBody>
    </Card>
  );
};

export default DavinciCodeChip;