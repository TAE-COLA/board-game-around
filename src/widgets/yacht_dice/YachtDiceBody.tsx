import { Flex, FlexProps } from '@chakra-ui/react';
import { User, YachtDiceBoard } from 'entities';
import React from 'react';
import { PlayerList, YachtBoard, YachtDiceButtons, YachtDiceField, YachtDiceHandRanking, YachtDiceRoundBox } from 'widgets';

type IProps = FlexProps & {
  players: User[];
  round: number;
  boards: {
    [key: string]: YachtDiceBoard;
  };
  currentBoardPlayer: User;
  turn: User;
  dice: number[];
  kept: number[];
  keep: number[];
  rolls: number;
  rolling: boolean;
  onClickPrevBoardButton: () => void;
  onClickNextBoardButton: () => void;
  onClickRollButton: () => void;
  onRollFinish: (values: number[]) => void;
  onAddDiceToKeep: (index: number) => void;
  onRemoveDiceToKeep: (index: number) => void;
  onClickSelectHandButton: (key: string, value: number) => void;
};

const YachtDiceBody: React.FC<IProps> = ({
  players,
  round,
  boards,
  currentBoardPlayer,
  turn,
  dice,
  kept,
  keep,
  rolls,
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
    <Flex width='100%' gap='8' {...props}>
      <Flex direction='column' gap='4'>
        <YachtDiceRoundBox round={round} />
        <YachtBoard 
          player={currentBoardPlayer} 
          board={boards[currentBoardPlayer.id]} 
          score={Object.values(boards[currentBoardPlayer.id]).reduce((acc, value: { value: number; marked: boolean }) => acc + value.value, 0)}
          isFirst={currentBoardPlayer.id === players[0].id}
          isLast={currentBoardPlayer.id === players[players.length - 1].id}
          onClickPrevBoardButton={onClickPrevBoardButton}
          onClickNextBoardButton={onClickNextBoardButton}
          flex='1'
        />
      </Flex>
      <Flex direction='column' gap='4' flex='2'>
        <YachtDiceField 
          dice={dice} 
          kept={kept}
          keep={keep} 
          rolls={rolls}
          rolling={rolling} 
          onResult={onRollFinish}
          onAddDiceToKeep={onAddDiceToKeep} 
          onRemoveDiceToKeep={onRemoveDiceToKeep}
        />
        {!rolling && rolls !== 3 && 
          <YachtDiceHandRanking 
            board={boards[turn.id]} 
            dice={dice} 
            keep={keep} 
            onClickSelectHandButton={onClickSelectHandButton}
            flex='1' 
          />
        }
      </Flex>
      <Flex direction='column' gap='4' flex='1'>
        <PlayerList players={players} turn={turn} flex='1' />
        <YachtDiceButtons 
          rolls={rolls} 
          rolling={rolling}
          onClickRollButton={onClickRollButton}
        />
      </Flex>
    </Flex>
  )
};

export default YachtDiceBody;