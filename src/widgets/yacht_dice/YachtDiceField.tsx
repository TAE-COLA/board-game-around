import { Flex, FlexProps } from '@chakra-ui/react';
import React from 'react';
import { KeptDice, RollableDice } from 'widgets';

type IProps = FlexProps & {
  dice: number[];
  kept: number[];
  keep: number[];
  rolls: number;
  rolling: boolean;
  onResult: (values: number[]) => void;
  onAddDiceToKeep: (index: number) => void;
  onRemoveDiceToKeep: (index: number) => void;
};

const YachtDiceField: React.FC<IProps> = ({
  dice,
  kept,
  keep,
  rolls,
  rolling,
  onResult,
  onAddDiceToKeep,
  onRemoveDiceToKeep,
  ...props
}) => {
  return (
    <Flex direction='column' align='center' gap='10' {...props}>
      <RollableDice 
        dice={dice} 
        keep={keep} 
        rolling={rolling} 
        isDisabled={rolls === 3}
        onResult={onResult}
        onAddDiceToKeep={onAddDiceToKeep}
      />
      <KeptDice 
        dice={dice}
        kept={kept} 
        keep={keep} 
        onAddDiceToKeep={onAddDiceToKeep} 
        onRemoveDiceToKeep={onRemoveDiceToKeep}
      />
    </Flex>
  );
}

export default YachtDiceField;