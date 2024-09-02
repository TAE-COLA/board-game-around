import { Button, Flex, FlexProps } from '@chakra-ui/react';
import { Game, User } from 'entities';
import React from 'react';
import { MemberColumnFlex, RuleBox } from 'widgets';

type IProps = FlexProps & {
  game: Game;
  members: User[];
  owner: User;
  onClickStartButton: () => void;
};

const LoungeBody: React.FC<IProps> = ({
  game,
  members,
  owner,
  onClickStartButton,
  ...props
}) => {
  return (
    <Flex width='100%' gap='8' {...props}>
      <RuleBox game={game} flex='2' />
      <Flex direction='column' flex='1'>
        <MemberColumnFlex members={members} owner={owner} flex='1'/>
        <Button onClick={onClickStartButton} size='lg' colorScheme='pink'>시작하기</Button>
      </Flex>
    </Flex>
  )
};

export default LoungeBody;