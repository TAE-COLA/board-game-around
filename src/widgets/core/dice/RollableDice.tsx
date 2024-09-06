import { Flex, FlexProps } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Die, Draggable } from 'widgets';

type IProps = FlexProps & {
  dice: number[],
  keep: number[],
  rolling?: boolean;
  onResult?: (values: number[]) => void;
};

const RollableDice: React.FC<IProps> = ({
  dice,
  keep,
  rolling = false,
  onResult = () => {},
  ...props
}) => {
  const [values, setValues] = useState<number[]>(dice);
  function randomize(values: number[]): number[] {
    return values.map((value, index) => {
      const random = keep.includes(index) ? value : Math.floor(Math.random() * 6) + 1
      return random
    })
  }

  useEffect(() => {
    if (!rolling) return;

    const rollInterval = setInterval(() => {
      setValues(randomize(values));
    }, 100);

    const timeoutId = setTimeout(() => {
      clearInterval(rollInterval);
      onResult(randomize(values));
    }, 3000);

    return () => {
      clearInterval(rollInterval);
      clearTimeout(timeoutId);
    };
  }, [rolling, onResult]);

  return (
    <Flex gap='2' {...props}>
      {values.map((value, index) => (
        <Draggable type='DIE' index={index} isDisabled={keep.includes(index)}>
          <Die key={index} value={value} fixed={keep.includes(index)} {...props}/>
        </Draggable>
      ))}
    </Flex>
  );
}

export default RollableDice;