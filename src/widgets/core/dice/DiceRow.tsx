import { Flex, FlexProps } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Die } from 'widgets';

type IProps = FlexProps & {
  dice: number[];
  keep: boolean[];
  rolling: boolean;
  onResult: (values: number[]) => void;
};

const DiceRow: React.FC<IProps> = ({
  dice,
  keep,
  rolling,
  onResult,
  ...props
}) => {
  const [values, setValues] = useState<number[]>(dice);

  useEffect(() => {
    if (!rolling) return;

    const rollInterval = setInterval(() => {
      const newValues = values.map((value, index) => (keep[index] ? value : Math.floor(Math.random() * 6) + 1));
      setValues(newValues);
    }, 100);

    const timeoutId = setTimeout(() => {
      clearInterval(rollInterval);
      const newValues = values.map((value, index) => (keep[index] ? value : Math.floor(Math.random() * 6) + 1));
      setValues(newValues);
      onResult(newValues);
    }, 3000);

    return () => {
      clearInterval(rollInterval);
      clearTimeout(timeoutId);
    };
  }, [rolling, onResult]);

  return (
    <Flex gap='2' {...props}>
      {values.map((value, index) => (
        <Die key={index} value={value} {...props}/>
      ))}
    </Flex>
  );
}

export default DiceRow;