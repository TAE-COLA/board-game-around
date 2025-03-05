import { Flex, FlexProps } from '@chakra-ui/react';
import { DavinciCodeTile as tileEntity, User } from 'entities';
import { useAuthContext } from 'features';
import React from 'react';
import { DavinciCodeHands } from 'widgets';

type IProps = FlexProps & {
  hands: {
    [key: string]: tileEntity[];
  };
};

const DavinciCodeFooter: React.FC<IProps> = ({ hands, ...props }) => {
  const { id: authId, name: authName } = useAuthContext();
  const myHands = hands[authId];

  return (
    <Flex width='100%' justify='center' {...props}>
      <DavinciCodeHands
        key={authId}
        player={{ id: authId, name: authName } as User}
        hands={myHands}
        onClickTile={() => {}}
      />
    </Flex>
  );
};

export default DavinciCodeFooter;
