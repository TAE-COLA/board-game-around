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
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
} from '@chakra-ui/react';
import { PageProps, Paths, useAuthContext } from 'app';
import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { GameName } from 'shared';
import { AnimatedEffect, Header, MotionBox, MotionEffect, Page } from 'shared/ui';
import { useTheMindIntent } from './useTheMindIntent';

const CARD_TIMER_SECONDS = 30;
const DANGER_SECONDS = 10;
const EMOJI_VISIBLE_MS = 3000;
const EMOJIS = ['🙂‍↕️', '🙂‍↔️', '🥱'];
const EMOJI_EFFECTS: Record<string, MotionEffect> = {
  '🙂‍↕️': 'nudge-y',
  '🙂‍↔️': 'nudge-x',
  '🥱': 'balloon',
};

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

const dangerShake = {
  x: [0, -3, 3, -2, 2, 0],
  transition: { duration: 0.28, repeat: Infinity, repeatDelay: 0.7 },
};

const popIn = {
  initial: { opacity: 0, scale: 0.72, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.84, y: -8 },
  transition: { type: 'spring', stiffness: 520, damping: 24 },
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
  const hasVisibleEmoji = Object.values(state.emojis ?? {}).some(
    (emoji) => typeof emoji.shownAt === 'number' && serverNow - emoji.shownAt < EMOJI_VISIBLE_MS
  );
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
    if (!isTimerRunning && !hasVisibleEmoji) {
      setNow(Date.now());
      return;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 500);

    return () => window.clearInterval(intervalId);
  }, [hasVisibleEmoji, isTimerRunning, state.lastPlayedAt]);

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
    <Page loading={loading} minHeight='100dvh'>
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

      <Flex direction='column' width='100%' height='100%' gap={{ base: 4, md: 8 }} paddingBottom={4}>
        <Header
          direction={{ base: 'column', sm: 'row' }}
          align={{ base: 'stretch', sm: 'center' }}
        >
          <Flex
            width={{ base: '100%', sm: 'auto' }}
            justify='space-between'
            align='center'
            gap={3}
            minWidth={0}
          >
            <Heading size={{ base: 'md', md: 'lg' }}>{GameName.TheMind.korean}</Heading>
            <Button onClick={onEvent.onClickExitButton} colorScheme='pink' size={{ base: 'sm', md: 'md' }}>
              Exit
            </Button>
          </Flex>
        </Header>

        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={{ base: 2, md: 4 }}>
          <Stat padding={{ base: 3, md: 4 }} background='gray.100' borderRadius='md' minWidth={0}>
            <StatLabel>Level</StatLabel>
            <StatNumber fontSize={{ base: 'xl', md: '2xl' }}>
              {state.level} / {state.maxLevel}
            </StatNumber>
            <Text marginTop={1} color='gray.500' fontSize={{ base: 'xs', md: 'sm' }}>
              {getRewardLabel(state.level)}
            </Text>
          </Stat>
          <Stat padding={{ base: 3, md: 4 }} background='gray.100' borderRadius='md' minWidth={0}>
            <StatLabel>Lives</StatLabel>
            <StatNumber fontSize={{ base: 'xl', md: '2xl' }}>{state.lives}</StatNumber>
          </Stat>
          <Stat padding={{ base: 3, md: 4 }} background='gray.100' borderRadius='md' minWidth={0}>
            <StatLabel>Stars</StatLabel>
            <StatNumber fontSize={{ base: 'xl', md: '2xl' }}>{state.stars}</StatNumber>
          </Stat>
          <Stat padding={{ base: 3, md: 4 }} background='gray.100' borderRadius='md' minWidth={0}>
            <StatLabel>Phase</StatLabel>
            <StatNumber fontSize={{ base: 'xl', md: '2xl' }}>{phaseLabel[state.phase]}</StatNumber>
          </Stat>
        </SimpleGrid>

        <Flex gap={2} wrap='wrap'>
          {state.phase === 'READY' && (
            <Button
              onClick={onEvent.onClickReadyButton}
              colorScheme='pink'
              isDisabled={isReady}
              width={{ base: '100%', sm: 'auto' }}
              size={{ base: 'sm', md: 'md' }}
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
                flex={{ base: '1 0 100%', sm: '0 0 auto' }}
                size={{ base: 'sm', md: 'md' }}
              >
                {votedStar ? '별 투표 완료' : '별 사용 동의'}
              </Button>
              {state.starVotePlayerIds.length > 0 && (
                <Button
                  onClick={onEvent.onClickCancelStarVoteButton}
                  variant='outline'
                  flex={{ base: '1 0 100%', sm: '0 0 auto' }}
                  size={{ base: 'sm', md: 'md' }}
                >
                  별 투표 취소
                </Button>
              )}
            </>
          )}
          {state.phase === 'LEVEL_COMPLETE' && (
            <Button
              onClick={onEvent.onClickNextLevelButton}
              colorScheme='pink'
              width={{ base: '100%', sm: 'auto' }}
              size={{ base: 'sm', md: 'md' }}
            >
              다음 레벨 준비
            </Button>
          )}
          {isEnded && (
            <>
              {state.phase === 'GAME_LOST' && (
                <Button
                  onClick={onEvent.onClickRestartButton}
                  colorScheme='pink'
                  flex={{ base: '1 0 100%', sm: '0 0 auto' }}
                  size={{ base: 'sm', md: 'md' }}
                >
                  처음부터 다시 시작
                </Button>
              )}
              <Button
                onClick={onEvent.onClickExitButton}
                colorScheme='pink'
                variant='outline'
                flex={{ base: '1 0 100%', sm: '0 0 auto' }}
                size={{ base: 'sm', md: 'md' }}
              >
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
          <MotionBox
            padding={{ base: 3, md: 4 }}
            background={isTimerDanger ? 'red.50' : 'gray.100'}
            border='1px solid'
            borderColor={isTimerDanger ? 'red.300' : 'gray.200'}
            borderRadius='md'
            animate={isTimerDanger ? dangerShake : { x: 0 }}
          >
            <Flex justify='space-between' align='center' gap={4} marginBottom={3}>
              <Text fontWeight='bold' color={isTimerDanger ? 'red.600' : 'gray.700'} minWidth={0}>
                {isTimerRunning
                  ? isTimerDanger
                    ? '서둘러야 합니다'
                    : '다음 카드를 기다리는 중'
                  : '첫 카드 대기 중'}
              </Text>
              <Text
                fontWeight='bold'
                fontSize={{ base: 'xl', md: '2xl' }}
                color={isTimerDanger ? 'red.600' : 'gray.800'}
                flexShrink={0}
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
          </MotionBox>
        )}
        {state.phase === 'LEVEL_COMPLETE' && (
          <Text color='green.600'>레벨 {state.level}을 완료했습니다.</Text>
        )}
        {state.phase === 'GAME_WON' && <Text color='green.600'>팀이 모든 레벨을 완료했습니다.</Text>}
        {state.phase === 'GAME_LOST' && (
          <Text color='red.600'>라이프가 없는 상태에서 레벨에 실패했습니다.</Text>
        )}

        <Flex direction={{ base: 'column', lg: 'row' }} gap={{ base: 5, md: 6 }} flex={1} minHeight={0}>
          <Flex direction='column' flex='1' gap={4}>
            <Heading size='md'>Players</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 3, md: 4 }}>
              {state.players.map((player) => (
                <Flex
                  key={player.id}
                  align='center'
                  justify='space-between'
                  gap={3}
                  padding={{ base: 3, md: 4 }}
                  background='gray.100'
                  borderRadius='md'
                  minHeight={{ base: '72px', md: '84px' }}
                >
                  <Flex direction='column' gap={1} minWidth={0} flex='1'>
                    <Flex align='center' gap={2} minHeight='38px' minWidth={0}>
                      <Text fontWeight='bold' noOfLines={1}>
                        {player.name}
                      </Text>
                      {state.emojis?.[player.id] &&
                        serverNow - state.emojis[player.id].shownAt < EMOJI_VISIBLE_MS && (
                          <AnimatedEffect
                            key={`${player.id}-${state.emojis[player.id].shownAt}`}
                            effect={EMOJI_EFFECTS[state.emojis[player.id].value] ?? 'none'}
                            display='inline-flex'
                            alignItems='center'
                            justifyContent='center'
                            width='42px'
                            height='38px'
                            flexShrink={0}
                            fontSize={{ base: '2xl', md: '3xl' }}
                            lineHeight='1'
                          >
                            {state.emojis[player.id].value}
                          </AnimatedEffect>
                        )}
                    </Flex>
                    <Text color='gray.600'>{hands[player.id]?.length ?? 0} cards</Text>
                  </Flex>
                  <Flex gap={1.5} wrap='wrap' justify='flex-end' align='center' flexShrink={0}>
                    {player.id === auth.id && <Badge colorScheme='pink'>You</Badge>}
                    {state.readyPlayerIds.includes(player.id) && (
                      <Badge colorScheme='green'>Ready</Badge>
                    )}
                    {state.starVotePlayerIds.includes(player.id) && (
                      <Badge colorScheme='yellow'>Star</Badge>
                    )}
                    {player.id === auth.id && (
                      <Popover placement='top' isLazy>
                        <PopoverTrigger>
                          <Button
                            size='xs'
                            minWidth='28px'
                            height='22px'
                            paddingX={2}
                            variant='outline'
                          >
                            🙂
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent width='auto' borderRadius='md'>
                          <PopoverBody padding='2'>
                            <Flex gap={2}>
                              {EMOJIS.map((emoji) => (
                                <Button
                                  key={emoji}
                                  size='sm'
                                  minWidth='36px'
                                  paddingX={2}
                                  variant='ghost'
                                  fontSize='xl'
                                  onClick={() => onEvent.onClickEmoji(emoji)}
                                >
                                  {emoji}
                                </Button>
                              ))}
                            </Flex>
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>
                    )}
                  </Flex>
                </Flex>
              ))}
            </SimpleGrid>
          </Flex>

          <Flex direction='column' flex='1' gap={4}>
            <Heading size='md'>Your Hand</Heading>
            <Flex wrap='wrap' gap={{ base: 2, md: 3 }}>
              {myHand.map((card) => {
                const isPlayableCard = state.phase === 'PLAYING' && card === myLowestCard;

                return (
                  <Button
                    key={card}
                    width={{
                      base: isPlayableCard ? '60px' : '54px',
                      md: isPlayableCard ? '72px' : '64px',
                    }}
                    height={{
                      base: isPlayableCard ? '90px' : '80px',
                      md: isPlayableCard ? '108px' : '96px',
                    }}
                    minWidth={{
                      base: isPlayableCard ? '60px' : '54px',
                      md: isPlayableCard ? '72px' : '64px',
                    }}
                    border='1px solid'
                    borderColor={isPlayableCard ? 'pink.400' : 'gray.300'}
                    borderRadius='md'
                    background={isPlayableCard ? 'pink.50' : 'white'}
                    color='gray.900'
                    fontWeight='bold'
                    fontSize={{
                      base: isPlayableCard ? '2xl' : 'xl',
                      md: isPlayableCard ? '3xl' : '2xl',
                    }}
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

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 3, md: 4 }}>
              <Box padding={{ base: 3, md: 4 }} background='gray.100' borderRadius='md'>
                <Heading size='sm' marginBottom={3}>
                  Played
                </Heading>
                <Flex gap={2} wrap='wrap'>
                  <AnimatePresence initial={false}>
                    {pilePreview(state.playedCards).map((card, index) => (
                      <MotionBox key={`${card}-${index}`} {...popIn}>
                        <Badge colorScheme='pink' fontSize='md'>
                          {card}
                        </Badge>
                      </MotionBox>
                    ))}
                  </AnimatePresence>
                  {state.playedCards.length === 0 && <Text color='gray.600'>Empty</Text>}
                </Flex>
              </Box>

              <Box padding={{ base: 3, md: 4 }} background='gray.100' borderRadius='md'>
                <Heading size='sm' marginBottom={3}>
                  Discarded
                </Heading>
                <Flex gap={2} wrap='wrap'>
                  <AnimatePresence initial={false}>
                    {pilePreview(state.discardedCards).map((card, index) => (
                      <MotionBox key={`${card}-${index}`} {...popIn}>
                        <Badge colorScheme='gray' fontSize='md'>
                          {card}
                        </Badge>
                      </MotionBox>
                    ))}
                  </AnimatePresence>
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
