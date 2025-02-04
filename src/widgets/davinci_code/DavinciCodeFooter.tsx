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
  const auth = useAuthContext();
  const myHands = hands[auth.id];

  return (
    <Flex direction='column' width='100%' gap='4' {...props}>
      <DavinciCodeHands
        key={auth.id}
        player={{ id: auth.id, name: auth.name } as User}
        hands={myHands}
      />
    </Flex>
  );
};

export default DavinciCodeFooter;