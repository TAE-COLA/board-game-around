import { Button, Flex, FlexProps } from '@chakra-ui/react';
import { Game, User } from 'entities';
import React from 'react';
import { PlayerList, RuleBox } from 'widgets';

type IProps = FlexProps & {
  user: User;
  game: Game;
  players: User[];
  owner: User;
  onClickStartButton: () => void;
};

const LoungeBody: React.FC<IProps> = ({
  user,
  game,
  players,
  owner,
  onClickStartButton,
  ...props
}) => {
  return (
    <Flex width='100%' gap='8' {...props}>
      <RuleBox game={game} flex='2' />
      <Flex direction='column' flex='1'>
        <PlayerList players={players} owner={owner} flex='1'/>
        <Button onClick={onClickStartButton} size='lg' colorScheme='pink' isDisabled={user.id !== owner.id}>시작하기</Button>
      </Flex>
    </Flex>
  )
};

export default LoungeBody;