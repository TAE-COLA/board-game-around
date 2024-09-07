import { Flex, FlexProps } from '@chakra-ui/react';
import { User, YachtDiceBoard } from 'entities';
import React from 'react';
import { PlayerList, YachtBoard, YachtDiceButtons, YachtDiceField } from 'widgets';

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
  onClickEndTurnButton: () => void;
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
  onClickEndTurnButton,
  ...props
}) => {
  const boardOf = (player: User) => boards[turn.id];
  const scoreOf = (player: User) => 0;

  return (
    <Flex width='100%' gap='8' {...props}>
      <YachtBoard player={turn} board={boardOf(turn)} score={scoreOf(turn)}/>
      <YachtDiceField 
        dice={dice} 
        keep={keep} 
        rolling={rolling} 
        onResult={onRollFinish}
        onAddDiceToKeep={onAddDiceToKeep} 
        onRemoveDiceToKeep={onRemoveDiceToKeep} 
        flex='2' 
      />
      <Flex direction='column' gap='4' flex='1'>
        <PlayerList players={players} flex='1' />
        <YachtDiceButtons 
          rolls={rolls} 
          rolling={rolling}
          onClickRollButton={onClickRollButton} 
          onClickEndTurnButton={onClickEndTurnButton} 
        />
      </Flex>
    </Flex>
  )
};

export default YachtDiceBody;