import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
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
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { PageProps, Paths, useAuthContext } from 'app';
import React, { useEffect, useMemo, useState } from 'react';
import { AnimatedEffect, Header, MotionEffect, Page } from 'shared/ui';
import { useTheMindIntent } from './useTheMindIntent';

const CARD_TIMER_SECONDS = 30;
const DANGER_SECONDS = 10;
const SPEECH_BUBBLE_VISIBLE_MS = 3000;
const EMOJIS = ['🙂‍↕️', '🙂‍↔️', '🥱'];
const EMOJI_EFFECTS: Record<string, MotionEffect> = {
  '🙂‍↕️': 'nudge-y',
  '🙂‍↔️': 'nudge-x',
  '🥱': 'balloon',
};

const getRewardLabel = (level: number) => {
  if ([2, 5, 8].includes(level)) return '클리어 보상: +1 스타';
  if ([3, 6, 9].includes(level)) return '클리어 보상: +1 생명';
  return '클리어 보상 없음';
};

const getPhaseLabel = (phase: string) => {
  if (phase === 'READY') return '준비 중';
  if (phase === 'PLAYING') return '진행 중';
  if (phase === 'LEVEL_COMPLETE') return '레벨 완료';
  if (phase === 'GAME_WON') return '승리';
  return '패배';
};

export const TheMindPage: React.FC<PageProps> = ({ navigate, toast }) => {
  const auth = useAuthContext();
  const { state, loading, clearSideEffects, onEvent, sideEffects } = useTheMindIntent();
  const compactHand = useBreakpointValue({ base: true, md: false }) ?? false;
  const hands = state.hands ?? {};
  const myHand = hands[auth.id] ?? [];
  const isCrowdedPlayerTiles = state.players.length >= 3;
  const myLowestCard = myHand.length > 0 ? Math.min(...myHand) : undefined;
  const myHandDescending = useMemo(() => [...myHand].sort((a, b) => b - a), [myHand]);
  const isReady = state.readyPlayerIds.includes(auth.id);
  const votedStar = state.starVotePlayerIds.includes(auth.id);
  const isEnded = state.phase === 'GAME_WON' || state.phase === 'GAME_LOST';
  const [now, setNow] = useState(Date.now());
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === 'undefined' ? 0 : window.innerWidth
  );
  const [closedResultKey, setClosedResultKey] = useState<string | null>(null);
  const [dismissedStarVoteKey, setDismissedStarVoteKey] = useState<string | null>(null);
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
  const hasVisibleSpeechBubble = Object.values(state.speechBubbles ?? {}).some(
    (bubble) =>
      typeof bubble.shownAt === 'number' && serverNow - bubble.shownAt < SPEECH_BUBBLE_VISIBLE_MS
  );
  const failureDetail =
    state.lastResult?.type === 'FAILURE' ? state.lastResult.failure : undefined;
  const resultKey = state.lastResult
    ? `${state.lastResult.type}-${state.lastResult.level}-${state.lastResult.lives}-${
        failureDetail?.playedCard ?? 'none'
      }-${state.phase}`
    : null;
  const isResultModalOpen = !!state.lastResult && closedResultKey !== resultKey;
  const isSuccessResult = state.lastResult?.type === 'SUCCESS';
  const starVoteKey =
    state.starVotePlayerIds.length > 0
      ? state.starVotePlayerIds.slice().sort().join('|')
      : null;
  const isStarVoteActive = state.phase === 'PLAYING' && state.starVotePlayerIds.length > 0;
  const isStarConsentModalOpen =
    isStarVoteActive && !votedStar && dismissedStarVoteKey !== starVoteKey;
  const starVoteRequester = state.starVotePlayerIds[0];
  const displayedPlayedCards =
    failureDetail?.playedCards && failureDetail.playedCards.length > 0
      ? failureDetail.playedCards
      : state.playedCards;
  const stackCards = displayedPlayedCards.slice(-48);
  const failedPlayedCardIndex =
    typeof failureDetail?.playedCard === 'number' ? displayedPlayedCards.length - 1 : -1;
  const stackOffset = compactHand ? 4 : 3;
  const stackCardWidth = compactHand ? 58 : 48;
  const stackCardHeight = compactHand ? 84 : 70;
  const stackGap = compactHand ? 8 : 10;
  const stackAvailableWidth = compactHand ? Math.max(0, viewportWidth - 32) : 420;
  const maxVisibleStackCards = Math.max(
    1,
    Math.floor((stackAvailableWidth + stackGap) / (stackCardWidth + stackGap))
  );
  const visibleStackCards = stackCards.slice(-maxVisibleStackCards);
  const hiddenStackCount = stackCards.length - visibleStackCards.length;
  const handCardWidth = compactHand ? 44 : 64;
  const handCardHeight = compactHand ? 68 : 96;
  const handGap = compactHand ? 6 : 8;
  const handAvailableWidth = compactHand ? Math.max(0, viewportWidth - 160) : 520;
  const maxVisibleHandCards = Math.max(
    1,
    Math.floor((handAvailableWidth + handGap) / (handCardWidth + handGap))
  );
  const visibleHandCards = compactHand
    ? myHandDescending.slice(-maxVisibleHandCards)
    : myHandDescending;
  const hiddenHandCount = myHandDescending.length - visibleHandCards.length;

  const getPlayerName = (playerId?: string) => {
    if (!playerId) return '알 수 없는 플레이어';
    return state.players.find((player) => player.id === playerId)?.name ?? '알 수 없는 플레이어';
  };
  const lowestBlockingCard = failureDetail?.blockingCards?.[0];
  const failureReasonText =
    failureDetail?.reason === 'LOWER_CARD' &&
    typeof failureDetail.playedCard === 'number' &&
    lowestBlockingCard
      ? `${getPlayerName(lowestBlockingCard.playerId)}님 손에 더 낮은 ${
          lowestBlockingCard.card
        }번 카드가 남아 있었는데, ${getPlayerName(
          failureDetail.playedByPlayerId
        )}님이 ${failureDetail.playedCard}번 카드를 먼저 냈습니다.`
      : null;

  const closeResultModal = () => {
    setClosedResultKey(resultKey);
  };

  const closeStarConsentModal = () => {
    setDismissedStarVoteKey(starVoteKey);
  };

  useEffect(() => {
    if (sideEffects.length === 0) return;

    sideEffects.forEach((sideEffect) => {
      switch (sideEffect.type) {
        case 'NAVIGATE_TO_MAIN':
          navigate(Paths.main, { replace: true });
          break;
        case 'SHOW_TOAST':
          toast(sideEffect.options);
          break;
      }
    });
    clearSideEffects();
  }, [clearSideEffects, navigate, sideEffects, toast]);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isTimerRunning && !hasVisibleSpeechBubble) {
      setNow(Date.now());
      return;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 300);

    return () => window.clearInterval(intervalId);
  }, [hasVisibleSpeechBubble, isTimerRunning, state.lastPlayedAt]);

  useEffect(() => {
    if (resultKey && resultKey !== closedResultKey) return;
    if (!resultKey) setClosedResultKey(null);
  }, [resultKey, closedResultKey]);

  useEffect(() => {
    if (!starVoteKey) setDismissedStarVoteKey(null);
  }, [starVoteKey]);

  useEffect(() => {
    if (!isTimerRunning || remainingSeconds > 0 || !state.lastPlayedAt) return;
    if (expiredTimerKey === state.lastPlayedAt) return;

    setExpiredTimerKey(state.lastPlayedAt);
    onEvent.onTimerExpired(serverNow);
  }, [expiredTimerKey, isTimerRunning, onEvent, remainingSeconds, serverNow, state.lastPlayedAt]);

  const renderCard = (card: number, isPlayableCard: boolean) => (
    <Button
      key={card}
      width={{ base: `${handCardWidth}px`, md: `${handCardWidth}px` }}
      height={{ base: `${handCardHeight}px`, md: `${handCardHeight}px` }}
      minWidth={{ base: `${handCardWidth}px`, md: `${handCardWidth}px` }}
      border='1px solid'
      borderColor={isPlayableCard ? 'pink.400' : 'gray.300'}
      borderRadius='md'
      background={isPlayableCard ? 'pink.50' : state.phase === 'PLAYING' ? 'gray.100' : 'white'}
      color={isPlayableCard ? 'gray.900' : state.phase === 'PLAYING' ? 'gray.500' : 'gray.900'}
      fontWeight='bold'
      fontSize={{ base: 'xl', md: '2xl' }}
      transform={isPlayableCard ? { base: undefined, md: 'translateY(-6px)' } : undefined}
      boxShadow={isPlayableCard ? 'md' : undefined}
      onClick={() => onEvent.onClickCard(card)}
      isDisabled={!isPlayableCard}
      _disabled={{
        opacity: 1,
        cursor: 'not-allowed',
        background: state.phase === 'PLAYING' ? 'gray.100' : 'white',
        color: state.phase === 'PLAYING' ? 'gray.500' : 'gray.900',
      }}
      padding={0}
    >
      {card}
    </Button>
  );

  const renderDiscardedCards = () => (
    <Box
      background='whiteAlpha.650'
      border='1px solid'
      borderColor='whiteAlpha.600'
      borderRadius='md'
      padding={{ base: 2, md: 3 }}
      boxShadow='sm'
      backdropFilter='blur(8px)'
    >
      <Text
        color='gray.600'
        fontSize={{ base: '10px', md: 'xs' }}
        fontWeight='bold'
        lineHeight='1'
        marginBottom={2}
      >
        버린 카드
      </Text>
      <Flex wrap='wrap' gap={1.5} minHeight={{ base: '24px', md: '28px' }} align='center'>
        {state.discardedCards.length === 0 ? (
          <Text color='gray.500' fontSize={{ base: 'xs', md: 'sm' }}>
            없음
          </Text>
        ) : (
          state.discardedCards.map((card, index) => (
            <Box
              key={`${card}-${index}`}
              width={{ base: '26px', md: '30px' }}
              height={{ base: '36px', md: '42px' }}
              border='1px solid'
              borderColor='gray.300'
              borderRadius='sm'
              background='white'
              color='gray.700'
              display='flex'
              alignItems='center'
              justifyContent='center'
              fontSize={{ base: 'xs', md: 'sm' }}
              fontWeight='bold'
              boxShadow='sm'
            >
              {card}
            </Box>
          ))
        )}
      </Flex>
    </Box>
  );

  return (
    <Page
      loading={loading}
      height='100dvh'
      maxHeight='100dvh'
      minHeight='100dvh'
      overflow='hidden'
      boxSizing='border-box'
      paddingX={{ base: 2, md: 4 }}
      paddingY={{ base: 2, md: 3 }}
      bgGradient='linear(to-br, blue.200, pink.200)'
    >
      <Modal
        isOpen={isStarConsentModalOpen}
        onClose={closeStarConsentModal}
        size='sm'
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>별을 사용할까요?</ModalHeader>
          <ModalBody>
            <Flex direction='column' gap={3}>
              <Text color='gray.700'>
                {getPlayerName(starVoteRequester)}님이 별 사용을 제안했습니다.
              </Text>
              <Text color='gray.600' fontSize='sm'>
                모두 동의하면 별 1개를 사용하고, 각 플레이어의 가장 낮은 카드가 공개되어
                버려집니다.
              </Text>
              <Badge alignSelf='flex-start' colorScheme='yellow' fontSize='sm'>
                동의 {state.starVotePlayerIds.length} / {state.players.length}
              </Badge>
            </Flex>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant='ghost' onClick={closeStarConsentModal}>
              나중에
            </Button>
            <Button colorScheme='yellow' onClick={onEvent.onClickStarButton}>
              동의
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
              {failureReasonText && (
                <Text color='red.600' fontWeight='semibold'>
                  {failureReasonText}
                </Text>
              )}
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeResultModal} colorScheme={isSuccessResult ? 'green' : 'red'}>
              확인
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Flex direction='column' height='100%' gap={{ base: 2, md: 3 }} minHeight={0}>
        <Header
          flexShrink={0}
          paddingX={{ base: 3, md: 5 }}
          paddingY={{ base: 2, md: 3 }}
          bg='whiteAlpha.800'
          backdropFilter='blur(8px)'
        >
          <Button onClick={onEvent.onClickExitButton} colorScheme='pink' size={{ base: 'sm', md: 'md' }}>
            Exit
          </Button>
        </Header>

        <Box
          flexShrink={0}
          alignSelf='center'
          width='100%'
          maxWidth={{ base: '100%', lg: '1120px', xl: '1180px' }}
          paddingX={{ base: 2, md: 3 }}
          paddingY={{ base: 1.5, md: 2 }}
          borderRadius='md'
          background='whiteAlpha.650'
          backdropFilter='blur(8px)'
          boxShadow='sm'
        >
          <Flex align='center' gap={{ base: 2, md: 3 }}>
            <Progress
              value={state.phase === 'PLAYING' ? timerProgress : 100}
              colorScheme={isTimerDanger ? 'red' : 'pink'}
              size='xs'
              borderRadius='full'
              background='whiteAlpha.700'
              flex='1'
            />
            <Text
              width={{ base: '34px', md: '42px' }}
              color={isTimerDanger ? 'red.500' : 'gray.500'}
              fontSize={{ base: 'xs', md: 'sm' }}
              fontWeight='bold'
              textAlign='right'
            >
              {state.phase === 'PLAYING' && isTimerRunning ? `${remainingSeconds}s` : '--'}
            </Text>
          </Flex>
        </Box>

        <Grid
          flex='1 1 auto'
          alignSelf='center'
          width='100%'
          maxWidth={{ base: '100%', lg: '1120px', xl: '1180px' }}
          minHeight={0}
          overflow='hidden'
          templateAreas={{
            base: '"level level" "lives stars" "discarded discarded" "stack stack" "players players"',
            md: '"status stack players"',
          }}
          templateColumns={{
            base: 'minmax(0, 1fr) minmax(0, 1fr)',
            md: 'minmax(220px, 1fr) minmax(0, 3fr) minmax(260px, 1fr)',
          }}
          templateRows={{ base: 'auto auto auto 1fr auto', md: '1fr' }}
          gap={{ base: 2, md: 3 }}
          alignItems='stretch'
        >
          <Flex
            gridArea={{ base: 'level', md: 'status' }}
            direction='column'
            justify='flex-start'
            gap={{ base: 2, md: 3 }}
            minWidth={0}
            minHeight={0}
          >
            <Box
              background='whiteAlpha.800'
              borderRadius='md'
              paddingX={{ base: 3, md: 4 }}
              paddingY={{ base: 3, md: 4 }}
              boxShadow='sm'
              backdropFilter='blur(8px)'
              minWidth={0}
            >
              <Text
                fontWeight='black'
                fontSize={{ base: 'lg', md: '3xl' }}
                lineHeight='1'
                color='gray.900'
                whiteSpace='nowrap'
              >
                LEVEL {state.level}
              </Text>
              <Text marginTop={2} color='gray.500' fontSize={{ base: '10px', md: 'sm' }} noOfLines={2}>
                {getRewardLabel(state.level)}
              </Text>
            </Box>
            <Box display={{ base: 'none', md: 'block' }}>{renderDiscardedCards()}</Box>
            <Flex
              display={{ base: 'none', md: 'flex' }}
              direction='column'
              gap={2}
              fontSize='3xl'
              paddingLeft={1}
            >
              <Text lineHeight='1.2'>{'❤️'.repeat(state.lives)}</Text>
              <Text lineHeight='1.2'>{'⭐'.repeat(state.stars)}</Text>
            </Flex>
            <Box
              display={{ base: 'none', md: 'block' }}
              marginTop='auto'
              color={isTimerDanger ? 'red.500' : 'gray.500'}
              fontSize='sm'
            >
              <Text fontWeight='bold'>{getPhaseLabel(state.phase)}</Text>
              {state.phase === 'PLAYING' && (
                <Text>{isTimerRunning ? `${remainingSeconds}s` : '--'}</Text>
              )}
              {isStarVoteActive && (
                <Badge marginTop={1} colorScheme='yellow'>
                  별 {state.starVotePlayerIds.length}/{state.players.length}
                </Badge>
              )}
            </Box>
          </Flex>

          <Box gridArea='discarded' display={{ base: 'block', md: 'none' }} minWidth={0}>
            {renderDiscardedCards()}
          </Box>

          <Flex
            gridArea='lives'
            display={{ base: 'flex', md: 'none' }}
            align='center'
            justify='center'
            minHeight='46px'
            minWidth={0}
            padding={2}
            borderRadius='md'
            border='1px solid'
            borderColor='whiteAlpha.700'
            background='whiteAlpha.800'
            boxShadow='sm'
            backdropFilter='blur(8px)'
            fontSize='xl'
          >
            <Text lineHeight='1' whiteSpace='nowrap'>
              {'❤️'.repeat(state.lives)}
            </Text>
          </Flex>
          <Flex
            gridArea='stars'
            display={{ base: 'flex', md: 'none' }}
            align='center'
            justify='center'
            minHeight='46px'
            minWidth={0}
            padding={2}
            borderRadius='md'
            border='1px solid'
            borderColor='whiteAlpha.700'
            background='whiteAlpha.800'
            boxShadow='sm'
            backdropFilter='blur(8px)'
            fontSize='xl'
          >
            <Text lineHeight='1' whiteSpace='nowrap'>
              {'⭐'.repeat(state.stars)}
            </Text>
          </Flex>

          <Flex
            gridArea='stack'
            align='center'
            justify='center'
            minWidth={0}
            minHeight={0}
            overflow='hidden'
            position='relative'
          >
            {stackCards.length === 0 ? (
              <Text color='gray.400' fontSize={{ base: 'sm', md: 'md' }}>
                아직 낸 카드 없음
              </Text>
            ) : (
              <Flex
                position='relative'
                width='100%'
                maxWidth={{ base: '100%', md: '420px' }}
                height='100%'
                marginX='auto'
                align='center'
                justify='center'
                gap={`${stackGap}px`}
                paddingX={{ base: 1, md: 0 }}
              >
                {visibleStackCards.map((card, index) => {
                  const originalIndex =
                    displayedPlayedCards.length - visibleStackCards.length + index;
                  const isFailedPlayedCard = originalIndex === failedPlayedCardIndex;

                  return (
                    <Box
                      key={`${card}-${originalIndex}`}
                      position='relative'
                      width={`${stackCardWidth}px`}
                      height={`${stackCardHeight}px`}
                      flex='0 0 auto'
                    >
                      {index === 0 &&
                        hiddenStackCount > 0 &&
                        Array.from({ length: Math.min(hiddenStackCount, 5) }).map((_, stackIndex) => (
                          <Box
                            key={`played-stack-${stackIndex}`}
                            position='absolute'
                            left={`${-(Math.min(hiddenStackCount, 5) - stackIndex) * stackOffset}px`}
                            top={`${-(Math.min(hiddenStackCount, 5) - stackIndex) * stackOffset}px`}
                            width={`${stackCardWidth}px`}
                            height={`${stackCardHeight}px`}
                            border='1px solid'
                            borderColor='gray.300'
                            borderRadius='md'
                            background='white'
                            boxShadow='sm'
                          />
                        ))}
                      <Box
                        position='relative'
                        width='100%'
                        height='100%'
                        border='1px solid'
                        borderColor={isFailedPlayedCard ? 'red.400' : 'pink.300'}
                        borderRadius='md'
                        background={isFailedPlayedCard ? 'red.100' : 'white'}
                        color={isFailedPlayedCard ? 'red.700' : 'gray.900'}
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                        fontWeight='bold'
                        fontSize={{ base: '2xl', md: '2xl' }}
                        boxShadow={{ base: 'lg', md: 'md' }}
                        zIndex={hiddenStackCount > 0 && index === 0 ? 2 : 1}
                      >
                        {card}
                      </Box>
                    </Box>
                  );
                })}
              </Flex>
            )}
          </Flex>

          <Flex
            gridArea='players'
            direction={{ base: 'row', md: 'column' }}
            gap={{ base: 1, md: 2 }}
            minWidth={0}
            minHeight={0}
            overflow={{ base: 'visible', md: 'hidden' }}
          >
            {state.players.map((player) => {
              const handCount = hands[player.id]?.length ?? 0;
              const bubble = state.speechBubbles?.[player.id];
              const showBubble =
                bubble &&
                typeof bubble.shownAt === 'number' &&
                serverNow - bubble.shownAt < SPEECH_BUBBLE_VISIBLE_MS;

              return (
                <Flex
                  key={player.id}
                  align='center'
                  gap={{ base: 0, md: 2 }}
                  minWidth={0}
                  height={{ base: isCrowdedPlayerTiles ? '52px' : '42px', md: '56px' }}
                  flex={{ base: '1 1 0', md: '0 0 auto' }}
                  flexShrink={0}
                  position='relative'
                >
                  {showBubble && (
                    <Box
                      display={{ base: 'flex', md: 'none' }}
                      position='absolute'
                      left='50%'
                      bottom='calc(100% + 6px)'
                      transform='translateX(-50%)'
                      zIndex={3}
                      minWidth='32px'
                      maxWidth='72px'
                      minHeight='28px'
                      paddingX={2}
                      paddingY={1}
                      background='white'
                      opacity={0.94}
                      borderRadius='md'
                      boxShadow='md'
                      alignItems='center'
                      justifyContent='center'
                      fontWeight='bold'
                      fontSize={bubble.type === 'EMOJI' ? 'xl' : 'sm'}
                      lineHeight='1'
                      _after={{
                        content: '""',
                        position: 'absolute',
                        left: '50%',
                        bottom: '-6px',
                        transform: 'translateX(-50%)',
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '6px solid white',
                      }}
                    >
                      {bubble.type === 'EMOJI' ? (
                        <AnimatedEffect
                          key={`${player.id}-${bubble.shownAt}`}
                          effect={EMOJI_EFFECTS[bubble.value] ?? 'none'}
                        >
                          {bubble.value}
                        </AnimatedEffect>
                      ) : (
                        bubble.value
                      )}
                    </Box>
                  )}
                  <Box display={{ base: 'none', md: 'block' }} width='64px' flexShrink={0}>
                    {showBubble && (
                      <Box
                        position='relative'
                        background='white'
                        opacity={0.94}
                        borderRadius='md'
                        boxShadow='sm'
                        minHeight={{ base: '32px', md: '38px' }}
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                        fontWeight='bold'
                        fontSize={bubble.type === 'EMOJI' ? { base: 'lg', md: '2xl' } : { base: 'sm', md: 'lg' }}
                        _after={{
                          content: '""',
                          position: 'absolute',
                          right: '-6px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          borderTop: '6px solid transparent',
                          borderBottom: '6px solid transparent',
                          borderLeft: '6px solid white',
                        }}
                      >
                        {bubble.type === 'EMOJI' ? (
                          <AnimatedEffect
                            key={`${player.id}-${bubble.shownAt}`}
                            effect={EMOJI_EFFECTS[bubble.value] ?? 'none'}
                          >
                            {bubble.value}
                          </AnimatedEffect>
                        ) : (
                          bubble.value
                        )}
                      </Box>
                    )}
                  </Box>
                  <Flex
                    flex='1'
                    height='100%'
                    align='center'
                    justify={{ base: isCrowdedPlayerTiles ? 'center' : 'space-between', md: 'space-between' }}
                    direction={{ base: isCrowdedPlayerTiles ? 'column' : 'row', md: 'row' }}
                    gap={{ base: isCrowdedPlayerTiles ? 0 : 1, md: 2 }}
                    paddingX={{ base: 2, md: 3 }}
                    paddingY={{ base: isCrowdedPlayerTiles ? 1 : 0, md: 0 }}
                    background='white'
                    opacity={0.94}
                    borderRadius='md'
                    boxShadow='sm'
                    minWidth={0}
                    overflow='hidden'
                  >
                    <Text
                      fontWeight='bold'
                      noOfLines={1}
                      minWidth={0}
                      maxWidth='100%'
                      fontSize={{ base: isCrowdedPlayerTiles ? 'xs' : 'md', md: 'md' }}
                      lineHeight='1.1'
                    >
                      {player.name}
                    </Text>
                    <Flex
                      align='center'
                      justify='center'
                      gap={{ base: 1, md: 1.5 }}
                      flexShrink={0}
                      minWidth='fit-content'
                    >
                      {player.id === auth.id && <Badge colorScheme='pink'>You</Badge>}
                      {state.readyPlayerIds.includes(player.id) && (
                        <Badge colorScheme='green'>Ready</Badge>
                      )}
                      {state.starVotePlayerIds.includes(player.id) && (
                        <Badge colorScheme='yellow'>Star</Badge>
                      )}
                      <Text
                        color='gray.700'
                        fontWeight='bold'
                        whiteSpace='nowrap'
                        fontSize={{ base: isCrowdedPlayerTiles ? 'xs' : 'md', md: 'md' }}
                        lineHeight='1.1'
                      >
                        🃏×{handCount}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              );
            })}
          </Flex>
        </Grid>

        <Grid
          flexShrink={0}
          alignSelf='center'
          width='100%'
          maxWidth={{ base: '100%', lg: '980px', xl: '1080px' }}
          height='auto'
          minHeight={0}
          templateColumns={{ base: '48px 1fr 48px', md: '64px 1fr 64px' }}
          gap={{ base: 2, md: 3 }}
          alignItems='center'
        >
          <Button
            width='100%'
            height={{ base: '48px', md: '64px' }}
            padding={0}
            fontSize={{ base: '2xl', md: '4xl' }}
            colorScheme='yellow'
            isDisabled={state.phase !== 'PLAYING' || state.stars <= 0 || votedStar}
            onClick={onEvent.onClickStarButton}
          >
            ⭐
          </Button>

          <Flex justify='center' align='center' minWidth={0} height='100%'>
            {state.phase === 'READY' && (
              <Button
                onClick={onEvent.onClickReadyButton}
                colorScheme='pink'
                isDisabled={isReady}
                size={{ base: 'md', md: 'md' }}
              >
                {isReady ? '준비 완료' : '준비하기'}
              </Button>
            )}
            {state.phase === 'PLAYING' && (
              <Flex
                justify='center'
                align='flex-end'
                gap={`${handGap}px`}
                minWidth={0}
                width='100%'
                overflow='visible'
              >
                {visibleHandCards.map((card, index) => (
                  <Box
                    key={card}
                    position='relative'
                    width={`${handCardWidth}px`}
                    height={`${handCardHeight}px`}
                    flex='0 0 auto'
                  >
                    {index === 0 &&
                      hiddenHandCount > 0 &&
                      Array.from({ length: Math.min(hiddenHandCount, 6) }).map((_, stackIndex) => (
                        <Box
                          key={`hand-stack-${stackIndex}`}
                          position='absolute'
                          left={`${-(Math.min(hiddenHandCount, 6) - stackIndex) * 3}px`}
                          top='0'
                          width={`${handCardWidth}px`}
                          height={`${handCardHeight}px`}
                          border='1px solid'
                          borderColor='gray.300'
                          borderRadius='md'
                          background='white'
                          boxShadow='sm'
                        />
                      ))}
                    <Box position='relative' zIndex={2}>
                      {renderCard(card, card === myLowestCard)}
                    </Box>
                  </Box>
                ))}
                {myHand.length === 0 && <Text color='gray.500'>손에 카드가 없습니다.</Text>}
              </Flex>
            )}
            {state.phase === 'LEVEL_COMPLETE' && (
              <Button onClick={onEvent.onClickNextLevelButton} colorScheme='pink' size={{ base: 'md', md: 'lg' }}>
                다음 레벨 준비
              </Button>
            )}
            {isEnded && (
              <Flex gap={2}>
                {state.phase === 'GAME_LOST' && (
                  <Button onClick={onEvent.onClickRestartButton} colorScheme='pink'>
                    다시 시작
                  </Button>
                )}
                <Button onClick={onEvent.onClickExitButton} variant='outline' colorScheme='pink'>
                  나가기
                </Button>
              </Flex>
            )}
          </Flex>

          <Popover placement='top' isLazy>
            <PopoverTrigger>
              <Button
                width='100%'
                height={{ base: '48px', md: '64px' }}
                padding={0}
                fontSize={{ base: '2xl', md: '4xl' }}
                variant='outline'
              >
                😊
              </Button>
            </PopoverTrigger>
            <PopoverContent width='auto' borderRadius='md'>
              <PopoverBody padding='2'>
                <Flex gap={2}>
                  {EMOJIS.map((emoji) => (
                    <Button
                      key={emoji}
                      size='sm'
                      minWidth='40px'
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
        </Grid>
      </Flex>
    </Page>
  );
};
