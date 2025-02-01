import { Flex, FlexProps } from '@chakra-ui/react';
import { DavinciCodeChip as chipEntity } from 'entities';
import React from 'react';
import { DavinciCodeChip } from 'widgets';

type IProps = FlexProps & {
  hands: chipEntity[];
}

const DavinciCodeHands: React.FC<IProps> = ({
  hands,
  ...props
}) => {
  return (
    <Flex width='100%' gap='8' {...props}>
      {hands.map((chip, index) => (
        <DavinciCodeChip
          key={index}
          chip={chip}
        />
      ))}
    </Flex>
  );
}

export default DavinciCodeHands;