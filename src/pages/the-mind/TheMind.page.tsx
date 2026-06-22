import { Badge, Button, Flex, Heading, SimpleGrid, Stat, StatLabel, StatNumber, Text } from '@chakra-ui/react';
import { PageProps, Paths, useAuthContext } from 'app';
import React, { useEffect } from 'react';
import { Header, Page } from 'widgets';
import { useTheMindIntent } from './useTheMindIntent';

export const TheMindPage: React.FC<PageProps> = ({ navigate, toast }) => {
  const auth = useAuthContext();
  const { state, loading, onEvent, sideEffect } = useTheMindIntent();
  const myHand = state.hands[auth.id] ?? [];

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
    <Page loading={loading} height='100vh'>
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
            <StatNumber fontSize='2xl'>{state.phase}</StatNumber>
          </Stat>
        </SimpleGrid>

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
                    {player.id === auth.id && <Badge colorScheme='pink'>You</Badge>}
                  </Flex>
                  <Text color='gray.600'>{state.hands[player.id]?.length ?? 0} cards</Text>
                </Flex>
              ))}
            </SimpleGrid>
          </Flex>

          <Flex direction='column' flex='1' gap={4}>
            <Heading size='md'>Your Hand</Heading>
            <Flex wrap='wrap' gap={3}>
              {myHand.map((card) => (
                <Flex
                  key={card}
                  width='64px'
                  height='96px'
                  align='center'
                  justify='center'
                  border='1px solid'
                  borderColor='gray.300'
                  borderRadius='md'
                  background='white'
                  fontWeight='bold'
                  fontSize='2xl'
                >
                  {card}
                </Flex>
              ))}
              {myHand.length === 0 && <Text color='gray.600'>No cards in hand.</Text>}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Page>
  );
};
