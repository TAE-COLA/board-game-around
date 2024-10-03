import { Flex, FlexProps, Text } from '@chakra-ui/react';
import React from 'react';
import { useDrop } from 'react-dnd';
import { Die, Draggable } from 'widgets';

type IProps = FlexProps & {
  dice: number[];
  kept: number[];
  keep: number[];
  onAddDiceToKeep: (index: number) => void;
  onRemoveDiceToKeep: (index: number) => void;
};

const KeptDice: React.FC<IProps> = ({
  dice,
  kept,
  keep,
  onAddDiceToKeep,
  onRemoveDiceToKeep,
  ...props
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'DIE',
    drop: (item: { index: number }) => {
      onAddDiceToKeep(item.index);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const onRemove = (index: number) => {
    if (!kept.includes(index)) onRemoveDiceToKeep(index);
  }

  return (
    <Flex direction='column' align='center' gap='4' {...props}>
      <Flex ref={drop} width='384px' height='96px' padding='16px' gap='8px' border='2px' borderColor='black' borderRadius='md' borderStyle='dashed'>
        {dice.map((value, index) => (
          keep.includes(index) ? 
            <Draggable key={index} type='DIE' index={index} onDropOutside={onRemove} onClick={() => onRemove(index)} isDisabled={kept.includes(index)}>
              <Die value={value} />
            </Draggable> : null
        ))}
      </Flex>
      <Text>고정하고 싶은 주사위를 아래로 드래그해주세요.</Text>
    </Flex>
  );
}

export default KeptDice;