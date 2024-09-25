import { Button, Flex, FlexProps } from '@chakra-ui/react';
import { useAuthContext, useLoungeContext } from 'features';
import React from 'react';
import { PlayerList, RuleBox } from 'widgets';

type IProps = FlexProps & {
  onClickStartButton: () => void;
};

const LoungeBody: React.FC<IProps> = ({
  onClickStartButton,
  ...props
}) => {
  const auth = useAuthContext();
  const lounge = useLoungeContext();

  return (
    <Flex width='100%' gap='8' {...props}>
      <RuleBox flex='2' />
      <Flex direction='column' flex='1'>
        <PlayerList owner={lounge.owner} flex='1'/>
        <Button onClick={onClickStartButton} size='lg' colorScheme='pink' isDisabled={auth.id !== lounge.owner.id}>시작하기</Button>
      </Flex>
    </Flex>
  )
};

export default LoungeBody;