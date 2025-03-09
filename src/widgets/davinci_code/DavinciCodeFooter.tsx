import { Button, Flex, FlexProps } from '@chakra-ui/react';
import { DavinciCodeTile as tileEntity, User } from 'entities';
import { useAuthContext } from 'features';
import React from 'react';
import { DavinciCodeHands } from 'widgets';

type IProps = FlexProps & {
  turn: User;
  phase: 'DRAW' | 'GUESS';
  hand: tileEntity[];
};

const DavinciCodeFooter: React.FC<IProps> = ({ hand, turn, phase, ...props }) => {
  const { id: authId, name: authName } = useAuthContext();

  return (
    <Flex width='100%' justify='center' position='relative' {...props}>
      <DavinciCodeHands
        key={authId}
        player={{ id: authId, name: authName } as User}
        hands={hand}
        turn={turn}
        phase={phase}
        isFinished={false}
        onClickTile={() => {}}
      />
      <Flex position='absolute' bottom={0} right={0}>
        <Button>턴 종료</Button>
      </Flex>
    </Flex>
  );
};

export default DavinciCodeFooter;
