import { Flex, FlexProps } from '@chakra-ui/react';
import { User, YachtDiceBoard } from 'entities';
import React from 'react';
import { PlayerList, YachtBoard, YachtDiceButtons, YachtDiceField, YachtDiceHandRanking } from 'widgets';

type IProps = FlexProps & {
  players: User[];
  boards: {
    [key: string]: YachtDiceBoard;
  };
  turn: User;
  dice: number[];
  keep: number[];
  rolls: number;
  rolling: boolean;
  onClickRollButton: () => void;
  onRollFinish: (values: number[]) => void;
  onAddDiceToKeep: (index: number) => void;
  onRemoveDiceToKeep: (index: number) => void;
  onClickSelectHandButton: (key: string, value: number) => void;
};

const YachtDiceBody: React.FC<IProps> = ({
  players,
  boards,
  turn,
  dice,
  keep,
  rolls,
  rolling,
  onClickRollButton,
  onRollFinish,
  onAddDiceToKeep,
  onRemoveDiceToKeep,
  onClickSelectHandButton,
  ...props
}) => {
  return (
    <Flex width='100%' gap='8' {...props}>
      <YachtBoard 
        player={turn} 
        board={boards[turn.id]} 
        score={Object.values(boards[turn.id]).reduce((acc, value: { value: number; marked: boolean }) => acc + value.value, 0)}
      />
      <Flex direction='column' gap='4' flex='2'>
        <YachtDiceField 
          dice={dice} 
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