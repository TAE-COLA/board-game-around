import { Flex, FlexProps, Grid, GridItem, Text } from '@chakra-ui/react';
import { type YachtDiceBoard } from 'entities';
import React from 'react';
import { Divider, YachtDiceHandButton } from 'widgets';

type IProps = FlexProps & {
  board: YachtDiceBoard;
  dice: number[];
  keep: number[];
};

const YachtDiceHandRanking: React.FC<IProps> = ({
  board,
  dice,
  keep,
  ...props
}) => {
  const keptDice = dice.filter((_, index) => keep.includes(index));
  const handRankings = {
    ace: { name: 'Ace', check: checkAce(keptDice), marked: board.ace.marked },
    double: { name: 'Double', check: checkDouble(keptDice), marked: board.double.marked },
    triple: { name: 'Triple', check: checkTriple(keptDice), marked: board.triple.marked },
    quadra: { name: 'Quadra', check: checkQuadra(keptDice), marked: board.quadra.marked },
    penta: { name: 'Penta', check: checkPenta(keptDice), marked: board.penta.marked },
    hexa: { name: 'Hexa', check: checkHexa(keptDice), marked: board.hexa.marked },
    fourKind: { name: 'Four of a Kind', check: checkFourOfAKind(keptDice), marked: board.fourKind.marked },
    fullHouse: { name: 'Full House', check: checkFullHouse(keptDice), marked: board.fullHouse.marked },
    smStraight: { name: 'Small Straight', check: checkSmallStraight(keptDice), marked: board.smStraight.marked },
    lgStraight: { name: 'Large Straight', check: checkLargeStraight(keptDice), marked: board.lgStraight.marked },
    yacht: { name: 'Yacht', check: checkYacht(keptDice), marked: board.yacht.marked },
  };

  const availableHandRankings = Object.entries(handRankings).filter(([_, value]) => value.check.dice.length > 0);
  const unavailableHandRankings = Object.entries(handRankings).filter(([_, value]) => value.check.dice.length === 0);

  return (
    <Flex direction='column' justify='end' gap='4' {...props}>
      <Divider text='선택 가능한 족보' />
      {availableHandRankings.length > 0 ? 
        <Grid templateColumns='repeat(6, 1fr)' gap='4'>
          {availableHandRankings.map(([key, value]) => (
            <GridItem key={key} colSpan={value.check.dice.length >= 4 ? 3 : 2}>
              <YachtDiceHandButton 
                dice={value.check.dice} 
                name={value.name} 
                score={value.check.score}
                isDisabled={value.marked}
              />
            </GridItem>
          ))}
        </Grid> :
        <Flex justify='center'>
          <Text>선택할 수 있는 족보가 없습니다. 족보를 분석하려면 주사위를 고정하세요.</Text>
        </Flex>
      }
      <Divider text='또는' />
      <Grid templateColumns='repeat(4, 1fr)' gap='4'>
        {unavailableHandRankings.map(([key, value]) => (
          <GridItem key={key}>
            <YachtDiceHandButton 
              name={value.name} 
              score={0} 
              isDisabled={value.marked}
            />
          </GridItem>
        ))}
      </Grid>
      <Divider text='또는' />
      <YachtDiceHandButton 
        name='주사위 전부 선택하기'
        dice={dice}
        score={dice.reduce((acc, value) => acc + value, 0)} 
      />
    </Flex>
  );
}

export default YachtDiceHandRanking;

function checkAce(dice: number[]): { dice: number[]; score: number } {
  const available = dice.includes(1);
  if (available) {
    const values = dice.filter(value => value === 1);
    const score = values.length * 1
    return { dice: values, score };
  } else {
    return { dice: [], score: 0 };
  }
}

function checkDouble(dice: number[]): { dice: number[]; score: number } {
  const available = dice.includes(2);
  if (available) {
    const values = dice.filter(value => value === 2);
    const score = values.length * 2
    return { dice: values, score };
  } else {
    return { dice: [], score: 0 };
  }
}

function checkTriple(dice: number[]): { dice: number[]; score: number } {
  const available = dice.includes(3);
  if (available) {
    const values = dice.filter(value => value === 3);
    const score = values.length * 3
    return { dice: values, score };
  } else {
    return { dice: [], score: 0 };
  }
}

function checkQuadra(dice: number[]): { dice: number[]; score: number } {
  const available = dice.includes(4);
  if (available) {
    const values = dice.filter(value => value === 4);
    const score = values.length * 4
    return { dice: values, score };
  } else {
    return { dice: [], score: 0 };
  }
}

function checkPenta(dice: number[]): { dice: number[]; score: number } {
  const available = dice.includes(5);
  if (available) {
    const values = dice.filter(value => value === 5);
    const score = values.length * 5
    return { dice: values, score };
  } else {
    return { dice: [], score: 0 };
  }
}

function checkHexa(dice: number[]): { dice: number[]; score: number } {
  const available = dice.includes(6);
  if (available) {
    const values = dice.filter(value => value === 6);
    const score = values.length * 6
    return { dice: values, score };
  } else {
    return { dice: [], score: 0 };
  }
}

function checkFourOfAKind(dice: number[]): { dice: number[]; score: number } {
  const counts = dice.reduce((acc: { [key: number]: number }, num) => {
    acc[num] = (acc[num] || 0) + 1;
    return acc;
  }, {});
  const num = Object.entries(counts).find(([_, value]) => value >= 4)?.[0];
  if (num) {
    const values = dice.filter(value => value === Number(num)).slice(0, 4);
    const score = values.reduce((acc, value) => acc + value, 0)
    return { dice: values, score };
  } else {
    return { dice: [], score: 0 };
  }
}

function checkFullHouse(dice: number[]): { dice: number[]; score: number } {
  const counts = dice.reduce((acc: { [key: number]: number }, num) => {
    acc[num] = (acc[num] || 0) + 1;
    return acc;
  }, {});
  const two = Object.entries(counts).find(([_, value]) => value === 2)?.[0];
  const three = Object.entries(counts).find(([_, value]) => value === 3)?.[0];
  if (two && three) {
    const values = [Number(two), Number(two), Number(three), Number(three), Number(three)].sort();
    const score = values.reduce((acc, value) => acc + value, 0)
    return { dice: values, score };
  } else {
    return { dice: [], score: 0 };
  }
}

function checkSmallStraight(dice: number[]): { dice: number[]; score: number } {
  const values = (dice.includes(1) && dice.includes(2) && dice.includes(3) && dice.includes(4)) ? [1, 2, 3, 4]
  : (dice.includes(2) && dice.includes(3) && dice.includes(4) && dice.includes(5)) ? [2, 3, 4, 5]
  : (dice.includes(3) && dice.includes(4) && dice.includes(5) && dice.includes(6)) ? [3, 4, 5, 6]
  : [];
  if (values.length > 0) {
    return { dice: values, score: 15 };
  } else {
    return { dice: [], score: 0 };
  }
}

function checkLargeStraight(dice: number[]): { dice: number[]; score: number } {
  const values = (dice.includes(1) && dice.includes(2) && dice.includes(3) && dice.includes(4) && dice.includes(5)) ? [1, 2, 3, 4, 5]
  : (dice.includes(2) && dice.includes(3) && dice.includes(4) && dice.includes(5) && dice.includes(6)) ? [2, 3, 4, 5, 6]
  : [];
  if (values.length > 0) {
    return { dice: values, score: 30 };
  } else {
    return { dice: [], score: 0 };
  }
}

function checkYacht(dice: number[]): { dice: number[]; score: number } {
  const available = dice.length === 5 && dice.every(value => value === dice[0]);
  if (available) {
    return { dice, score: 50 };
  } else {
    return { dice: [], score: 0 };
  }
}