import { Button, Flex, FlexProps } from '@chakra-ui/react';
import { Game, User } from 'entities';
import React from 'react';
import { MemberColumnFlex, RuleBox } from 'widgets';

type IProps = FlexProps & {
  game: Game;
  members: User[];
  onClickStartButton: () => void;
};

const LoungeBody: React.FC<IProps> = ({
  game,
  members,
  onClickStartButton,
  ...props
}) => {
  return (
    <Flex width='100%' gap='8' {...props}>
      <RuleBox game={game} flex='2' />
      <Flex direction='column' flex='1'>
        <MemberColumnFlex members={members} flex='1'/>
        <Button onClick={onClickStartButton} size='lg' colorScheme='pink'>시작하기</Button>
      </Flex>
    </Flex>
  )
};

export default LoungeBody;