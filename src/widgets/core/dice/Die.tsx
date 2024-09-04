import { Circle, Flex, FlexProps } from '@chakra-ui/react';
import React from 'react';

type IProps = FlexProps & {
  value: number;
};

const Die: React.FC<IProps> = ({
  value,
  ...props
}) => {
  switch (value) {
    case 1:
      return (
        <Flex justify='center' align='center' width='64px' height='64px' background='gray.100' borderRadius='md' {...props}>
          <Circle size='12px' background='black' />
        </Flex>
      );
    case 2:
      return (
        <Flex justify='space-between' padding='8px' width='64px' height='64px' background='gray.100' borderRadius='md' {...props}>
          <Flex direction='column' justify='space-between'>
            <Circle size='12px' background='black' />
            <Circle size='12px' />
          </Flex>
          <Flex direction='column' justify='space-between'>
            <Circle size='12px' />
            <Circle size='12px' background='black' />
          </Flex>
        </Flex>
      );
    case 3:
      return (
        <Flex justify='space-between' padding='8px' width='64px' height='64px' background='gray.100' borderRadius='md' {...props}>
          <Flex direction='column' justify='space-between'>
            <Circle size='12px' background='black' />
            <Circle size='12px' />
            <Circle size='12px' />
          </Flex>
          <Flex direction='column' justify='space-between'>
            <Circle size='12px' />
            <Circle size='12px' background='black' />
            <Circle size='12px' />
          </Flex>
          <Flex direction='column' justify='space-between'>
            <Circle size='12px' />
            <Circle size='12px' />
            <Circle size='12px' background='black' />
          </Flex>
        </Flex>
      );
    case 4:
      return (
        <Flex justify='space-between' padding='8px' width='64px' height='64px' background='gray.100' borderRadius='md' {...props}>
          <Flex direction='column' justify='space-between'>
            <Circle size='12px' background='black' />
            <Circle size='12px' background='black' />
          </Flex>
          <Flex direction='column' justify='space-between'>
            <Circle size='12px' background='black' />
            <Circle size='12px' background='black' />
          </Flex>
        </Flex>
      );
    case 5:
      return (
        <Flex justify='space-between' padding='8px' width='64px' height='64px' background='gray.100' borderRadius='md' {...props}>
          <Flex direction='column' justify='space-between'>
            <Circle size='12px' background='black' />
            <Circle size='12px' />
            <Circle size='12px' background='black' />
          </Flex>
          <Flex direction='column' justify='space-between'>
            <Circle size='12px' />
            <Circle size='12px' background='black' />
            <Circle size='12px' />
          </Flex>
          <Flex direction='column' justify='space-between'>
            <Circle size='12px' background='black' />
            <Circle size='12px' />
            <Circle size='12px' background='black' />
          </Flex>
        </Flex>
      );
    case 6:
      return (
        <Flex justify='space-between' padding='8px' width='64px' height='64px' background='gray.100' borderRadius='md' {...props}>
          <Flex direction='column' justify='space-between'>
            <Circle size='12px' background='black' />
            <Circle size='12px' background='black' />
            <Circle size='12px' background='black' />
          </Flex>
          <Flex direction='column' justify='space-between'>
            <Circle size='12px' />
            <Circle size='12px' />
            <Circle size='12px' />
          </Flex>
          <Flex direction='column' justify='space-between'>
            <Circle size='12px' background='black' />
            <Circle size='12px' background='black' />
            <Circle size='12px' background='black' />
          </Flex>
        </Flex>
      );
    default:
      return null;
    }
}

export default Die;