import { Button, Flex, FlexProps } from '@chakra-ui/react';
import { DavinciCodeTile as tileEntity, User } from 'entities';
import { useAuthContext } from 'features';
import React from 'react';
import { DavinciCodeHands } from 'widgets';

type IProps = FlexProps & {
  hand: tileEntity[];
};

const DavinciCodeFooter: React.FC<IProps> = ({ hand, ...props }) => {
  const { id: authId, name: authName } = useAuthContext();

  return (
    <Flex width='100%' justify='center' position='relative' {...props}>
      <DavinciCodeHands
        key={authId}
        player={{ id: authId, name: authName } as User}
        hands={hand}
        onClickTile={() => {}}
      />
      <Flex position='absolute' bottom={0} right={0}>
        <Button>턴 종료</Button>
      </Flex>
    </Flex>
  );
};

export default DavinciCodeFooter;
