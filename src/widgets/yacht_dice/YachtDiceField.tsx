import { Flex, FlexProps } from '@chakra-ui/react';
import React from 'react';
import { KeptDice, RollableDice } from 'widgets';

type IProps = FlexProps & {
  dice: number[];
  keep: number[];
  rolling: boolean;
  onResult: (values: number[]) => void;
  onAddDiceToKeep: (index: number) => void;
  onRemoveDiceToKeep: (index: number) => void;
};

const YachtDiceField: React.FC<IProps> = ({
  dice,
  keep,
  rolling,
  onResult,
  onAddDiceToKeep,
  onRemoveDiceToKeep,
  ...props
}) => {
  return (
    <Flex direction='column' align='center' gap='10' {...props}>
      <RollableDice 
        key={dice.join(',')} 
        dice={dice} 
        keep={keep} 
        rolling={rolling} 
        onResult={onResult}
      />
      <KeptDice 
        key={keep.join(',')} 
        dice={dice} 
        keep={keep} 
        onAddDiceToKeep={onAddDiceToKeep} 
        onRemoveDiceToKeep={onRemoveDiceToKeep}
      />
    </Flex>
  );
}

export default YachtDiceField;