import { Button, Flex, FlexProps } from '@chakra-ui/react';
import { useAuthContext, useLoungeContext } from 'app';
import React from 'react';
import { PlayerList, RuleBox } from 'widgets';

type Props = FlexProps & {
  onClickStartButton: () => void;
};

export const LoungeBody: React.FC<Props> = ({ onClickStartButton, ...props }) => {
  const auth = useAuthContext();
  const lounge = useLoungeContext();

  return (
    <Flex width='100%' gap='8' {...props}>
      <RuleBox flex='2' />
      <Flex direction='column' flex='1'>
        <PlayerList players={lounge.players} owner={lounge.owner} flex='1' />
        <Button
          onClick={onClickStartButton}
          size='lg'
          colorScheme='pink'
          isDisabled={auth.id !== lounge.owner.id}
        >
          시작하기
        </Button>
      </Flex>
    </Flex>
  );
};
