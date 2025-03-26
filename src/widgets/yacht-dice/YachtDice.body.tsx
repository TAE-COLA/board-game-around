import { Flex, FlexProps } from '@chakra-ui/react';
import { User, YachtDiceBoard } from 'models';
import React from 'react';
import {
  PlayerList,
  YachtBoard,
  YachtDiceButtons,
  YachtDiceField,
  YachtDiceHandRanking,
  YachtDiceRoundBox,
} from 'widgets';

type Props = FlexProps & {
  players: User[];
  round: number;
  boards: {
    [key: string]: YachtDiceBoard;
  };
  currentBoardPlayer: User;
  kept: number[];
  rolling: boolean;
  onClickPrevBoardButton: () => void;
  onClickNextBoardButton: () => void;
  onClickRollButton: () => void;
  onRollFinish: (values: number[]) => void;
  onAddDiceToKeep: (index: number) => void;
  onRemoveDiceToKeep: (index: number) => void;
  onClickSelectHandButton: (key: keyof YachtDiceBoard, value: number) => void;
};

export const YachtDiceBody: React.FC<Props> = ({
  players,
  round,
  boards,
  currentBoardPlayer,
  kept,
  rolling,
  onClickPrevBoardButton,
  onClickNextBoardButton,
  onClickRollButton,
  onRollFinish,
  onAddDiceToKeep,
  onRemoveDiceToKeep,
  onClickSelectHandButton,
  ...props
}) => {
  return (
    <Flex width='100%' gap={8} {...props}>
      <Flex direction='column' gap={4}>
        <YachtDiceRoundBox round={yachtDice.round} />
        <YachtBoard
          player={currentBoardPlayer}
          board={yachtDice.boards[currentBoardPlayer.id]}
          score={Object.values(yachtDice.boards[currentBoardPlayer.id]).reduce(
            (acc, value: { value: number; marked: boolean }) => acc + value.value,
            0
          )}
          isFirst={currentBoardPlayer.id === yachtDice.players.first().id}
          isLast={currentBoardPlayer.id === yachtDice.players.last().id}
          onClickPrevBoardButton={onClickPrevBoardButton}
          onClickNextBoardButton={onClickNextBoardButton}
          flex='1'
        />
      </Flex>
      <Flex direction='column' gap={4} flex={2}>
        <YachtDiceField
          dice={yachtDice.dice}
          kept={kept}
          keep={yachtDice.keep}
          rolls={yachtDice.rolls}
          rolling={rolling}
          onResult={onRollFinish}
          onAddDiceToKeep={onAddDiceToKeep}
          onRemoveDiceToKeep={onRemoveDiceToKeep}
        />
        {!rolling && yachtDice.rolls !== 3 && (
          <YachtDiceHandRanking
            board={yachtDice.boards[yachtDice.turn.id]}
            dice={yachtDice.dice}
            keep={yachtDice.keep}
            onClickSelectHandButton={onClickSelectHandButton}
            flex='1'
          />
        )}
      </Flex>
      <Flex direction='column' gap={4} flex={1}>
        <PlayerList players={yachtDice.players} turn={yachtDice.turn} flex={1} />
        <YachtDiceButtons
          rolls={yachtDice.rolls}
          rolling={rolling}
          onClickRollButton={onClickRollButton}
        />
      </Flex>
    </Flex>
  );
};
