import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
} from '@chakra-ui/react';
import { PageProps, Paths, useAuthContext } from 'app';
import React, { useEffect } from 'react';
import { Header, Page } from 'widgets';
import { useTheMindIntent } from './useTheMindIntent';

const phaseLabel = {
  READY: '준비',
  PLAYING: '진행 중',
  LEVEL_COMPLETE: '레벨 완료',
  GAME_WON: '승리',
  GAME_LOST: '패배',
};

const pilePreview = (cards: number[]) => cards.slice(-12);

export const TheMindPage: React.FC<PageProps> = ({ navigate, toast }) => {
  const auth = useAuthContext();
  const { state, loading, onEvent, sideEffect } = useTheMindIntent();
  const hands = state.hands ?? {};
  const myHand = hands[auth.id] ?? [];
  const isReady = state.readyPlayerIds.includes(auth.id);
  const votedStar = state.starVotePlayerIds.includes(auth.id);
  const isEnded = state.phase === 'GAME_WON' || state.phase === 'GAME_LOST';

  useEffect(() => {
    switch (sideEffect?.type) {
      case 'NAVIGATE_TO_MAIN':
        navigate(Paths.main, { replace: true });
        break;
      case 'SHOW_TOAST':
        toast(sideEffect.options);
        break;
    }
  }, [sideEffect]);

  return (
    <Page loading={loading} minHeight='100vh'>
      <Flex direction='column' width='100%' height='100%' gap={8}>
        <Header>
          <Flex width='100%' justify='space-between' align='center' gap={4}>
            <Heading size='lg'>The Mind</Heading>
            <Button onClick={onEvent.onClickExitButton} colorScheme='pink'>
              Exit
            </Button>
          </Flex>
        </Header>

        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Stat padding='4' background='gray.100' borderRadius='md'>
            <StatLabel>Level</StatLabel>
            <StatNumber>
              {state.level} / {state.maxLevel}
            </StatNumber>
          </Stat>
          <Stat padding='4' background='gray.100' borderRadius='md'>
            <StatLabel>Lives</StatLabel>
            <StatNumber>{state.lives}</StatNumber>
          </Stat>
          <Stat padding='4' background='gray.100' borderRadius='md'>
            <StatLabel>Stars</StatLabel>
            <StatNumber>{state.stars}</StatNumber>
          </Stat>
          <Stat padding='4' background='gray.100' borderRadius='md'>
            <StatLabel>Phase</StatLabel>
            <StatNumber fontSize='2xl'>{phaseLabel[state.phase]}</StatNumber>
          </Stat>
        </SimpleGrid>

        <Flex gap={3} wrap='wrap'>
          {state.phase === 'READY' && (
            <Button
              onClick={onEvent.onClickReadyButton}
              colorScheme='pink'
              isDisabled={isReady}
            >
              {isReady ? '준비 완료' : '준비하기'}
            </Button>
          )}
          {state.phase === 'PLAYING' && (
            <>
              <Button
                onClick={onEvent.onClickStarButton}
                colorScheme='yellow'
                isDisabled={state.stars <= 0 || votedStar}
              >
                {votedStar ? '별 투표 완료' : '별 사용 동의'}
              </Button>
              {state.starVotePlayerIds.length > 0 && (
                <Button onClick={onEvent.onClickCancelStarVoteButton} variant='outline'>
                  별 투표 취소
                </Button>
              )}
            </>
          )}
          {state.phase === 'LEVEL_COMPLETE' && (
            <Button onClick={onEvent.onClickNextLevelButton} colorScheme='pink'>
              다음 레벨 준비
            </Button>
          )}
          {isEnded && (
            <Button onClick={onEvent.onClickExitButton} colorScheme='pink'>
              메인으로 나가기
            </Button>
          )}
        </Flex>

        {state.phase === 'PLAYING' && (
          <Text color='gray.600'>
            낮은 숫자부터 차례대로 내야 합니다. 대화나 신호 없이 원하는 타이밍에 카드를
            선택하세요.
          </Text>
        )}
        {state.phase === 'LEVEL_COMPLETE' && (
          <Text color='green.600'>레벨 {state.level}을 완료했습니다.</Text>
        )}
        {state.phase === 'GAME_WON' && <Text color='green.600'>팀이 모든 레벨을 완료했습니다.</Text>}
        {state.phase === 'GAME_LOST' && <Text color='red.600'>라이프가 모두 소진되었습니다.</Text>}

        <Flex direction={{ base: 'column', lg: 'row' }} gap={6} flex={1} minHeight={0}>
          <Flex direction='column' flex='1' gap={4}>
            <Heading size='md'>Players</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {state.players.map((player) => (
                <Flex
                  key={player.id}
                  direction='column'
                  gap={2}
                  padding='4'
                  background='gray.100'
                  borderRadius='md'
                >
                  <Flex justify='space-between' align='center' gap={2}>
                    <Text fontWeight='bold'>{player.name}</Text>
                    <Flex gap={2} wrap='wrap' justify='flex-end'>
                      {player.id === auth.id && <Badge colorScheme='pink'>You</Badge>}
                      {state.readyPlayerIds.includes(player.id) && (
                        <Badge colorScheme='green'>Ready</Badge>
                      )}
                      {state.starVotePlayerIds.includes(player.id) && (
                        <Badge colorScheme='yellow'>Star</Badge>
                      )}
                    </Flex>
                  </Flex>
                  <Text color='gray.600'>{hands[player.id]?.length ?? 0} cards</Text>
                </Flex>
              ))}
            </SimpleGrid>
          </Flex>

          <Flex direction='column' flex='1' gap={4}>
            <Heading size='md'>Your Hand</Heading>
            <Flex wrap='wrap' gap={3}>
              {myHand.map((card) => (
                <Button
                  key={card}
                  width='64px'
                  height='96px'
                  minWidth='64px'
                  border='1px solid'
                  borderColor='gray.300'
                  borderRadius='md'
                  background='white'
                  color='gray.900'
                  fontWeight='bold'
                  fontSize='2xl'
                  onClick={() => onEvent.onClickCard(card)}
                  isDisabled={state.phase !== 'PLAYING'}
                >
                  {card}
                </Button>
              ))}
              {myHand.length === 0 && <Text color='gray.600'>No cards in hand.</Text>}
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Box padding='4' background='gray.100' borderRadius='md'>
                <Heading size='sm' marginBottom={3}>
                  Played
                </Heading>
                <Flex gap={2} wrap='wrap'>
                  {pilePreview(state.playedCards).map((card, index) => (
                    <Badge key={`${card}-${index}`} colorScheme='pink' fontSize='md'>
                      {card}
                    </Badge>
                  ))}
                  {state.playedCards.length === 0 && <Text color='gray.600'>Empty</Text>}
                </Flex>
              </Box>

              <Box padding='4' background='gray.100' borderRadius='md'>
                <Heading size='sm' marginBottom={3}>
                  Discarded
                </Heading>
                <Flex gap={2} wrap='wrap'>
                  {pilePreview(state.discardedCards).map((card, index) => (
                    <Badge key={`${card}-${index}`} colorScheme='gray' fontSize='md'>
                      {card}
                    </Badge>
                  ))}
                  {state.discardedCards.length === 0 && <Text color='gray.600'>Empty</Text>}
                </Flex>
              </Box>
            </SimpleGrid>
          </Flex>
        </Flex>
      </Flex>
    </Page>
  );
};
