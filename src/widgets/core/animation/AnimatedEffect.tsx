import { BoxProps } from '@chakra-ui/react';
import React from 'react';
import { MotionBox } from './MotionBox';

export type MotionEffect = 'nudge-y' | 'nudge-x' | 'balloon' | 'none';

type IProps = BoxProps & {
  children: React.ReactNode;
  effect: MotionEffect;
};

const effectMotion = {
  'nudge-y': {
    y: [0, -4, 4, -2, 2, 0],
    transition: { duration: 0.42 },
  },
  'nudge-x': {
    x: [0, -4, 4, -2, 2, 0],
    transition: { duration: 0.42 },
  },
  balloon: {
    scale: [1, 1.2, 1],
    transition: { duration: 0.72, times: [0, 0.68, 1] },
  },
  none: {},
} as const;

export const AnimatedEffect: React.FC<IProps> = ({ children, effect, ...props }) => {
  return (
    <MotionBox transformOrigin='center' animate={effectMotion[effect]} {...props}>
      {children}
    </MotionBox>
  );
};
