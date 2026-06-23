import {
  Box,
  Button,
  Collapse,
  Flex,
  FlexProps,
  Heading,
  ListItem,
  OrderedList,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { useLoungeContext } from 'app';
import React, { useState } from 'react';
import { GameName } from 'shared';
import { GameMetadataTags } from '../core/game-metadata';

const theMindTutorial = `
## 게임 목표
모든 플레이어가 말이나 신호 없이 서로의 타이밍을 맞춰 카드를 **1부터 100까지 오름차순**으로 냅니다.

## 시작 조건
- 플레이 인원은 **2명 이상 4명 이하**입니다.
- 라운지 방장만 게임을 시작할 수 있습니다.
- 게임을 시작하면 각 플레이어에게 현재 레벨 수만큼 카드가 나뉩니다.

## 라운드 진행
1. 각 플레이어는 자기 손패만 볼 수 있습니다.
2. 화면에서 낼 수 있는 카드는 내 손패 중 **가장 낮은 카드**뿐입니다.
3. 카드를 내면 중앙의 Played 영역에 기록됩니다.
4. 누군가 더 낮은 카드를 손에 들고 있었다면 레벨에 실패하고, 해당 카드들은 Discarded 영역으로 이동합니다.

## 타이머 규칙
- 첫 카드가 나온 뒤부터 **30초 타이머**가 시작됩니다.
- 누군가 카드를 낼 때마다 타이머가 다시 30초로 초기화됩니다.
- 시간이 끝나면 현재 레벨을 다시 준비합니다.
- 남은 시간이 10초 이하가 되면 위험 상태로 표시됩니다.

## 생명과 별
- 실패하면 라이프가 1개 줄어듭니다.
- 라이프가 0인 상태에서 실패하면 게임이 종료됩니다.
- 레벨 2, 5, 8을 클리어하면 별이 1개 늘어납니다.
- 레벨 3, 6, 9를 클리어하면 라이프가 1개 늘어납니다.
- 별은 플레이 중 모든 플레이어가 동의하면 사용할 수 있습니다.

## 감정 표현
- 플레이어 목록의 🙂 버튼으로 짧은 감정 표현을 보낼 수 있습니다.
- 감정 표현은 잠깐 표시되며, 숫자나 구체적인 카드 정보를 전달하는 용도가 아닙니다.

## 승리와 패배
- 마지막 레벨까지 모두 클리어하면 팀이 승리합니다.
- 라이프가 없는 상태에서 레벨에 실패하면 패배합니다.
`;

const renderInlineMarkdown = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Box as='strong' key={`${part}-${index}`}>
          {part.slice(2, -2)}
        </Box>
      );
    }

    return part;
  });

const MarkdownText: React.FC<{ children: string }> = ({ children }) => {
  const lines = children.trim().split('\n');
  const blocks: React.ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (line.startsWith('## ')) {
      blocks.push(
        <Heading key={`heading-${index}`} size='sm' marginTop={blocks.length ? 2 : 0}>
          {line.slice(3)}
        </Heading>
      );
      index += 1;
      continue;
    }

    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith('- ')) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }
      blocks.push(
        <UnorderedList key={`ul-${index}`} paddingLeft={4} spacing={1}>
          {items.map((item, itemIndex) => (
            <ListItem key={`${item}-${itemIndex}`}>{renderInlineMarkdown(item)}</ListItem>
          ))}
        </UnorderedList>
      );
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s/, ''));
        index += 1;
      }
      blocks.push(
        <OrderedList key={`ol-${index}`} paddingLeft={4} spacing={1}>
          {items.map((item, itemIndex) => (
            <ListItem key={`${item}-${itemIndex}`}>{renderInlineMarkdown(item)}</ListItem>
          ))}
        </OrderedList>
      );
      continue;
    }

    blocks.push(
      <Text key={`p-${index}`} color='gray.700'>
        {renderInlineMarkdown(line)}
      </Text>
    );
    index += 1;
  }

  return (
    <Flex direction='column' gap={3}>
      {blocks}
    </Flex>
  );
};

export const RuleBox: React.FC<FlexProps> = ({ ...props }) => {
  const lounge = useLoungeContext();
  const [isOpen, setIsOpen] = useState(false);
  const description = GameName.isTheMind(lounge.game.name)
    ? `${lounge.game.description}\n${theMindTutorial}`
    : lounge.game.description;

  return (
    <Flex
      direction='column'
      paddingX={{ base: 4, md: 6 }}
      paddingY={{ base: 3, md: 4 }}
      gap={{ base: 3, md: 4 }}
      background='gray.100'
      borderRadius='md'
      minWidth={0}
      {...props}
    >
      <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight='bold'>
        {lounge.game.name} 게임이 곧 시작됩니다!
      </Text>
      <GameMetadataTags metadata={lounge.game.metadata} />
      <Button
        display={{ base: 'inline-flex', md: 'none' }}
        size='sm'
        variant='outline'
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? '튜토리얼 접기' : '튜토리얼 펼치기'}
      </Button>
      <Box>
        <Text fontWeight='bold' marginBottom={3}>
          게임 설명
        </Text>
        <Box display={{ base: 'none', md: 'block' }}>
          <MarkdownText>{description}</MarkdownText>
        </Box>
        <Collapse in={isOpen} animateOpacity>
          <Box display={{ md: 'none' }}>
            <MarkdownText>{description}</MarkdownText>
          </Box>
        </Collapse>
      </Box>
    </Flex>
  );
};
