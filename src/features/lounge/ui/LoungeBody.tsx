import { Button, Flex, FlexProps } from '@chakra-ui/react';
import { useAuthContext, useLoungeContext } from 'app';
import React from 'react';
import { GameName } from 'shared';
import { PlayerList } from './PlayerList';
import { RuleBox } from './RuleBox';

type IProps = FlexProps & {
  onClickStartButton: () => void;
};

export const LoungeBody: React.FC<IProps> = ({ onClickStartButton, ...props }) => {
  const auth = useAuthContext();
  const lounge = useLoungeContext();
  const isOwner = auth.id === lounge.owner.id;
  const canStartTheMind =
    !GameName.isTheMind(lounge.game.name) ||
    (lounge.players.length >= 2 && lounge.players.length <= 4);

  return (
    <Flex width='100%' direction={{ base: 'column', lg: 'row' }} gap={{ base: 4, md: 8 }} {...props}>
      <RuleBox flex='2' />
      <Flex direction='column' flex='1' gap={4} minWidth={0}>
        <PlayerList players={lounge.players} owner={lounge.owner} flex='1' />
        <Button
          onClick={onClickStartButton}
          size={{ base: 'md', md: 'lg' }}
          colorScheme='pink'
          isDisabled={!isOwner || !canStartTheMind}
        >
          시작하기
        </Button>
      </Flex>
    </Flex>
  );
};
