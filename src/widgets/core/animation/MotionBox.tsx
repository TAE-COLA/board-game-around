import { Box, BoxProps } from '@chakra-ui/react';
import { HTMLMotionProps, motion } from 'framer-motion';

export const MotionBox = motion<BoxProps & HTMLMotionProps<'div'>>(Box);
