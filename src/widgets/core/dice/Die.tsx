import { Circle, Flex, FlexProps } from '@chakra-ui/react';
import React from 'react';

type IProps = FlexProps & {
  value: number;
  fixed?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

const Die: React.FC<IProps> = ({
  value,
  fixed = false,
  size = 'md',
  ...props
}) => {
  const flexProps = {
    width: size === 'sm' ? '32px' : size === 'md' ? '64px' : '128px',
    height: size === 'sm' ? '32px' : size === 'md' ? '64px' : '128px',
    padding: size === 'sm' ? '2px' : size === 'md' ? '6px' : '14px',
    background: 'gray.100',
    border: '2px',
    borderColor: fixed ? 'red' : '',
    borderRadius: 'md',
    ...props
  }
  const circleSize = size === 'sm' ? '8px' : size === 'md' ? '12px' : '16px';

  switch (value) {
    case 1:
      return (
        <Flex justify='center' align='center' {...flexProps}>
          <Circle size={circleSize} background='black' />
        </Flex>
      );
    case 2:
      return (
        <Flex justify='space-between' {...flexProps}>
          <Flex direction='column' justify='space-between'>
            <Circle size={circleSize} background='black' />
            <Circle size={circleSize} />
          </Flex>
          <Flex direction='column' justify='space-between'>
            <Circle size={circleSize} />
            <Circle size={circleSize} background='black' />
          </Flex>
        </Flex>
      );
    case 3:
      return (
        <Flex justify='space-between' {...flexProps}>
          <Flex direction='column' justify='space-between'>
            <Circle size={circleSize} background='black' />
            <Circle size={circleSize} />
            <Circle size={circleSize} />
          </Flex>
          <Flex direction='column' justify='space-between'>
            <Circle size={circleSize} />
            <Circle size={circleSize} background='black' />
            <Circle size={circleSize} />
          </Flex>
          <Flex direction='column' justify='space-between'>
            <Circle size={circleSize} />
            <Circle size={circleSize} />
            <Circle size={circleSize} background='black' />
          </Flex>
        </Flex>
      );
    case 4:
      return (
        <Flex justify='space-between' {...flexProps}>
          <Flex direction='column' justify='space-between'>
            <Circle size={circleSize} background='black' />
            <Circle size={circleSize} background='black' />
          </Flex>
          <Flex direction='column' justify='space-between'>
            <Circle size={circleSize} background='black' />
            <Circle size={circleSize} background='black' />
          </Flex>
        </Flex>
      );
    case 5:
      return (
        <Flex justify='space-between' {...flexProps}>
          <Flex direction='column' justify='space-between'>
            <Circle size={circleSize} background='black' />
            <Circle size={circleSize} />
            <Circle size={circleSize} background='black' />
          </Flex>
          <Flex direction='column' justify='space-between'>
            <Circle size={circleSize} />
            <Circle size={circleSize} background='black' />
            <Circle size={circleSize} />
          </Flex>
          <Flex direction='column' justify='space-between'>
            <Circle size={circleSize} background='black' />
            <Circle size={circleSize} />
            <Circle size={circleSize} background='black' />
          </Flex>
        </Flex>
      );
    case 6:
      return (
        <Flex justify='space-between' {...flexProps}>
          <Flex direction='column' justify='space-between'>
            <Circle size={circleSize} background='black' />
            <Circle size={circleSize} background='black' />
            <Circle size={circleSize} background='black' />
          </Flex>
          <Flex direction='column' justify='space-between'>
            <Circle size={circleSize} />
            <Circle size={circleSize} />
            <Circle size={circleSize} />
          </Flex>
          <Flex direction='column' justify='space-between'>
            <Circle size={circleSize} background='black' />
            <Circle size={circleSize} background='black' />
            <Circle size={circleSize} background='black' />
          </Flex>
        </Flex>
      );
    default:
      return null;
    }
}

export default Die;