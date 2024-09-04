import { FlexProps } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Die } from 'widgets';

type IProps = FlexProps & {
  initial?: number;
  rolling: boolean;
  seconds?: number;
  onResult: (value: number) => void;
};

const RollableDice: React.FC<IProps> = ({ 
  initial = 1,
  rolling,
  seconds = 3,
  onResult,
  ...props 
}) => {
  const [value, setValue] = useState<number>(initial);

  useEffect(() => {
    if (!rolling) return;

    let currentIndex = initial;
    const rollInterval = setInterval(() => {
      currentIndex = Math.floor(Math.random() * 6) + 1;
      setValue(currentIndex);
    }, 100);

    const timeoutId = setTimeout(() => {
      clearInterval(rollInterval);
      const finalValue = Math.floor(Math.random() * 6) + 1;
      setValue(finalValue);
      onResult(finalValue);
    }, seconds * 1000);

    return () => {
      clearInterval(rollInterval);
      clearTimeout(timeoutId);
    };
  }, [rolling, onResult]);

  return (
    <Die value={value} width='64px' height='64px' background='gray.100' borderRadius='md' {...props}/>
  );
};

export default RollableDice;