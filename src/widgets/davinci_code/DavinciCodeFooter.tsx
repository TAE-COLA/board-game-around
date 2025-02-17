import { Flex, FlexProps, Text } from '@chakra-ui/react';
import { DavinciCodeChip as chipEntity, User } from 'entities';
import { useAuthContext } from 'features';
import React from 'react';
import { DavinciCodeHands } from 'widgets';

type IProps = FlexProps & {
  hands: {
    [key: string]: chipEntity[];
  };
};

const DavinciCodeFooter: React.FC<IProps> = ({ 
  hands, 
  ...props 
}) => {
  const { id: authId, name: authName } = useAuthContext();
  const myHands = hands[authId];

  return (
    <Flex direction='column' width='100%' gap='4' {...props}>
      <DavinciCodeHands
        key={authId}
        player={{ id: authId, name: authName } as User}
        hands={myHands}
      />
    </Flex>
  );
};

export default DavinciCodeFooter;