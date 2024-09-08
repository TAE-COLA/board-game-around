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
  const boardOf = () => boards[turn.id];
  const scoreOf = (player: User) => 0;

  return (
    <Flex width='100%' gap='8' {...props}>
      <YachtBoard player={turn} board={boards[turn.id]} score={scoreOf(turn)}/>
      <Flex direction='column' gap='4' flex='2'>
        <YachtDiceField 
          dice={dice} 
          keep={keep} 
          rolling={rolling} 
          onResult={onRollFinish}
          onAddDiceToKeep={onAddDiceToKeep} 
          onRemoveDiceToKeep={onRemoveDiceToKeep}
        />
        <YachtDiceHandRanking board={boards[turn.id]} dice={dice} keep={keep} flex='1' />
      </Flex>
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