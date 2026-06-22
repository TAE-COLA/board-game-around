import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
} from '@chakra-ui/react';
import { PageProps, Paths, useAuthContext } from 'app';
import React, { useEffect, useState } from 'react';
import { Header, Page } from 'widgets';
import { useTheMindIntent } from './useTheMindIntent';

const CARD_TIMER_SECONDS = 30;
const DANGER_SECONDS = 10;

const phaseLabel = {
  READY: '준비',
  PLAYING: '진행 중',
  LEVEL_COMPLETE: '레벨 완료',
  GAME_WON: '승리',
  GAME_LOST: '패배',
};

const pilePreview = (cards: number[]) => cards.slice(-12);

const getRewardLabel = (level: number) => {
  if ([2, 5, 8].includes(level)) return '클리어 보상: 스타 +1';
  if ([3, 6, 9].includes(level)) return '클리어 보상: 라이프 +1';
  return '클리어 보상 없음';
};

export const TheMindPage: React.FC<PageProps> = ({ navigate, toast }) => {
  const auth = useAuthContext();
  const { state, loading, onEvent, sideEffect } = useTheMindIntent();
  const hands = state.hands ?? {};
  const myHand = hands[auth.id] ?? [];
  const myLowestCard = myHand[0];
  const isReady = state.readyPlayerIds.includes(auth.id);
  const votedStar = state.starVotePlayerIds.includes(auth.id);
  const isEnded = state.phase === 'GAME_WON' || state.phase === 'GAME_LOST';
  const [now, setNow] = useState(Date.now());
  const [closedResultKey, setClosedResultKey] = useState<string | null>(null);
  const [expiredTimerKey, setExpiredTimerKey] = useState<number | null>(null);
  const serverNow = now + state.serverTimeOffset;
  const elapsedSeconds =
    state.lastPlayedAt && state.phase === 'PLAYING'
      ? Math.floor((serverNow - state.lastPlayedAt) / 1000)
      : 0;
  const remainingSeconds =
    state.lastPlayedAt && state.phase === 'PLAYING'
      ? Math.min(CARD_TIMER_SECONDS, Math.max(0, CARD_TIMER_SECONDS - elapsedSeconds))
      : CARD_TIMER_SECONDS;
  const timerProgress = (remainingSeconds / CARD_TIMER_SECONDS) * 100;
  const isTimerRunning = state.phase === 'PLAYING' && !!state.lastPlayedAt;
  const isTimerDanger = isTimerRunning && remainingSeconds <= DANGER_SECONDS;
  const resultKey = state.lastResult
    ? `${state.lastResult.type}-${state.lastResult.level}-${state.lastResult.lives}-${state.phase}`
    : null;
  const isResultModalOpen = !!state.lastResult && closedResultKey !== resultKey;
  const isSuccessResult = state.lastResult?.type === 'SUCCESS';

  const closeResultModal = () => {
    setClosedResultKey(resultKey);
  };

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

  useEffect(() => {
    if (!isTimerRunning) {
      setNow(Date.now());
      return;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isTimerRunning, state.lastPlayedAt]);

  useEffect(() => {
    if (resultKey && resultKey !== closedResultKey) return;
    if (!resultKey) setClosedResultKey(null);
  }, [resultKey, closedResultKey]);

  useEffect(() => {
    if (!isTimerRunning || remainingSeconds > 0 || !state.lastPlayedAt) return;
    if (expiredTimerKey === state.lastPlayedAt) return;

    setExpiredTimerKey(state.lastPlayedAt);
    onEvent.onTimerExpired(serverNow);
  }, [expiredTimerKey, isTimerRunning, onEvent, remainingSeconds, serverNow, state.lastPlayedAt]);

  return (
    <Page loading={loading} minHeight='100vh'>
      <Modal
        isOpen={isResultModalOpen}
        onClose={closeResultModal}
        size='md'
        isCentered
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isSuccessResult ? '레벨 성공' : '레벨 실패'}</ModalHeader>
          <ModalBody>
            <Flex direction='column' gap={3}>
              <Text fontSize='lg' fontWeight='bold' color={isSuccessResult ? 'green.600' : 'red.600'}>
                {isSuccessResult
                  ? `레벨 ${state.lastResult?.level}을 완료했습니다.`
                  : `레벨 ${state.lastResult?.level}에 실패했습니다.`}
              </Text>
              <Text color='gray.600'>
                {isSuccessResult
                  ? state.phase === 'GAME_WON'
                    ? '모든 레벨을 완료했습니다.'
                    : '다음 레벨을 시작하기 전에 준비 상태로 넘어갑니다.'
                  : state.phase === 'GAME_LOST'
                    ? '라이프가 없는 상태에서 실패해 게임이 종료되었습니다.'
                    : `라이프가 ${state.lastResult?.lives}개 남았습니다. 같은 레벨을 다시 준비합니다.`}
              </Text>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeResultModal} colorScheme={isSuccessResult ? 'green' : 'red'}>
              확인
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
            <Text marginTop={1} color='gray.500' fontSize='sm'>
              {getRewardLabel(state.level)}
            </Text>
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
            <>
              {state.phase === 'GAME_LOST' && (
                <Button onClick={onEvent.onClickRestartButton} colorScheme='pink'>
                  처음부터 다시 시작
                </Button>
              )}
              <Button onClick={onEvent.onClickExitButton} colorScheme='pink' variant='outline'>
                메인으로 나가기
              </Button>
            </>
          )}
        </Flex>

        {state.phase === 'PLAYING' && (
          <Text color='gray.600'>
            내 손에서 가장 낮은 카드만 낼 수 있습니다. 상대 손에 더 낮은 카드가 남아 있으면
            레벨을 다시 시작합니다.
          </Text>
        )}
        {state.phase === 'PLAYING' && (
          <Box
            padding='4'
            background={isTimerDanger ? 'red.50' : 'gray.100'}
            border='1px solid'
            borderColor={isTimerDanger ? 'red.300' : 'gray.200'}
            borderRadius='md'
          >
            <Flex justify='space-between' align='center' gap={4} marginBottom={3}>
              <Text fontWeight='bold' color={isTimerDanger ? 'red.600' : 'gray.700'}>
                {isTimerRunning
                  ? isTimerDanger
                    ? '서둘러야 합니다'
                    : '다음 카드를 기다리는 중'
                  : '첫 카드 대기 중'}
              </Text>
              <Text
                fontWeight='bold'
                fontSize='2xl'
                color={isTimerDanger ? 'red.600' : 'gray.800'}
              >
                {isTimerRunning ? `${remainingSeconds}s` : '--'}
              </Text>
            </Flex>
            <Progress
              value={isTimerRunning ? timerProgress : 100}
              colorScheme={isTimerDanger ? 'red' : 'pink'}
              size='sm'
              borderRadius='full'
              background={isTimerDanger ? 'red.100' : 'gray.200'}
            />
            <Text marginTop={2} color={isTimerDanger ? 'red.500' : 'gray.500'} fontSize='sm'>
              {isTimerRunning
                ? remainingSeconds === 0
                  ? '시간이 모두 흘렀습니다. 팀의 감각을 다시 맞춰야 합니다.'
                  : '누군가 카드를 낼 때마다 30초 타이머가 다시 시작됩니다.'
                : '누군가 첫 카드를 내면 30초 타이머가 시작됩니다.'}
            </Text>
          </Box>
        )}
        {state.phase === 'LEVEL_COMPLETE' && (
          <Text color='green.600'>레벨 {state.level}을 완료했습니다.</Text>
        )}
        {state.phase === 'GAME_WON' && <Text color='green.600'>팀이 모든 레벨을 완료했습니다.</Text>}
        {state.phase === 'GAME_LOST' && (
          <Text color='red.600'>라이프가 없는 상태에서 레벨에 실패했습니다.</Text>
        )}

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
              {myHand.map((card) => {
                const isPlayableCard = state.phase === 'PLAYING' && card === myLowestCard;

                return (
                  <Button
                    key={card}
                    width={isPlayableCard ? '72px' : '64px'}
                    height={isPlayableCard ? '108px' : '96px'}
                    minWidth={isPlayableCard ? '72px' : '64px'}
                    border='1px solid'
                    borderColor={isPlayableCard ? 'pink.400' : 'gray.300'}
                    borderRadius='md'
                    background={isPlayableCard ? 'pink.50' : 'white'}
                    color='gray.900'
                    fontWeight='bold'
                    fontSize={isPlayableCard ? '3xl' : '2xl'}
                    opacity={state.phase === 'PLAYING' && !isPlayableCard ? 0.45 : 1}
                    transform={isPlayableCard ? 'translateY(-4px)' : undefined}
                    boxShadow={isPlayableCard ? 'md' : undefined}
                    onClick={() => onEvent.onClickCard(card)}
                    isDisabled={!isPlayableCard}
                  >
                    {card}
                  </Button>
                );
              })}
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
