import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Divider, Flex, FlexProps, Table, TableContainer, Tbody, Td, Text, Tfoot, Th, Thead, Tr } from '@chakra-ui/react';
import { User, type YachtDiceBoard } from 'entities';
import React from 'react';

type IProps = FlexProps & {
  player: User,
  board: YachtDiceBoard,
  score: number,
  isFirst: boolean,
  isLast: boolean,
  onClickPrevBoardButton: () => void,
  onClickNextBoardButton: () => void
};

const YachtBoard: React.FC<IProps> = ({
  player,
  board,
  score,
  isFirst,
  isLast,
  onClickPrevBoardButton,
  onClickNextBoardButton,
  ...props
}) => {
  const orderedBoard = {
    ace: { ...board.ace, name: 'Ace' },
    double: { ...board.double, name: 'Double' },
    triple: { ...board.triple, name: 'Triple' },
    quadra: { ...board.quadra, name: 'Quadra' },
    penta: { ...board.penta, name: 'Penta' },
    hexa: { ...board.hexa, name: 'Hexa' },
    bonus: { ...board.bonus, name: 'Bonus' },
    choice: { ...board.choice, name: 'Choice' },
    fourKind: { ...board.fourKind, name: 'Four of a Kind' },
    fullHouse: { ...board.fullHouse, name: 'Full House' },
    smStraight: { ...board.smStraight, name: 'Small Straight' },
    lgStraight: { ...board.lgStraight, name: 'Large Straight' },
    yacht: { ...board.yacht, name: 'Yacht' },
  };

  return (
    <Flex direction='column' align='center' gap='8' padding='4' background='gray.100' borderRadius='md' {...props}>
      <Flex width='100%' align='center'>
        <ChevronLeftIcon onClick={() => isFirst || onClickPrevBoardButton()} cursor={isFirst ? undefined : 'pointer'} opacity={isFirst ? 0 : 1} />
        <Text fontWeight='bold' textAlign='center' flex='1'>{player.name}</Text>
        <ChevronRightIcon onClick={() => isLast || onClickNextBoardButton()} cursor={isLast ? undefined : 'pointer'} opacity={isLast ? 0 : 1} />
      </Flex>
      <TableContainer>
        <Table size='sm'>
          <Thead>
            <Tr>
              <Th>이름</Th>
              <Th isNumeric>점수</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td colSpan={2}>
                <Divider borderColor="gray.400" />
              </Td>
            </Tr>
            {Object.values(orderedBoard).map(({ name, value, marked }) => (
              <React.Fragment key={name}>
                {name === 'Bonus' &&
                  <Tr>
                    <Td colSpan={2}>
                      <Divider borderColor="gray.400" />
                    </Td>
                  </Tr>
                }
                <Tr>
                  <Td>{name}</Td>
                  <Td isNumeric>{marked ? value : '-'}</Td>
                </Tr>
                {name === 'Bonus' &&
                  <Tr>
                    <Td colSpan={2}>
                      <Divider borderColor="gray.400" />
                    </Td>
                  </Tr>
                }
            </React.Fragment>
            ))}
            <Tr>
              <Td colSpan={2}>
                <Divider borderColor="gray.400" />
              </Td>
            </Tr>
          </Tbody>
          <Tfoot>
            <Tr>
              <Th>총점</Th>
              <Th isNumeric>{score}</Th>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
    </Flex>
  );
}

export default YachtBoard;