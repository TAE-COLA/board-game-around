import { Circle, Flex, FlexProps } from '@chakra-ui/react';
import React from 'react';
import { Align, BorderWidth, Colors, Direction, Size } from 'shared';

type Props = FlexProps & {
  value: number;
  fixed?: boolean;
  size?: Size.Sm | Size.Md | Size.Lg;
};

export const Die: React.FC<Props> = ({ value, fixed = false, size = Size.Md, ...props }) => {
  const flexProps = {
    width: size === Size.Sm ? 8 : size === Size.Md ? 16 : 32,
    height: size === Size.Sm ? 8 : size === Size.Md ? 16 : 32,
    padding: size === Size.Sm ? '3px' : size === Size.Md ? '7px' : '14px',
    background: Colors.Secondary100,
    border: BorderWidth.Medium,
    borderColor: fixed ? Colors.Error : '',
    borderRadius: Size.Md,
    ...props,
  };
  const circleSize = size === Size.Sm ? '6px' : size === Size.Md ? 3 : 4;

  switch (value) {
    case 1:
      return (
        <Flex justify={Align.Center} align={Align.Center} {...flexProps}>
          <Circle size={circleSize} background={Colors.Black} />
        </Flex>
      );
    case 2:
      return (
        <Flex justify={Align.SpaceBetween} {...flexProps}>
          <Flex direction={Direction.Column} justify={Align.SpaceBetween}>
            <Circle size={circleSize} background={Colors.Black} />
            <Circle size={circleSize} />
          </Flex>
          <Flex direction={Direction.Column} justify={Align.SpaceBetween}>
            <Circle size={circleSize} />
            <Circle size={circleSize} background={Colors.Black} />
          </Flex>
        </Flex>
      );
    case 3:
      return (
        <Flex justify={Align.SpaceBetween} {...flexProps}>
          <Flex direction={Direction.Column} justify={Align.SpaceBetween}>
            <Circle size={circleSize} background={Colors.Black} />
            <Circle size={circleSize} />
            <Circle size={circleSize} />
          </Flex>
          <Flex direction={Direction.Column} justify={Align.SpaceBetween}>
            <Circle size={circleSize} />
            <Circle size={circleSize} background={Colors.Black} />
            <Circle size={circleSize} />
          </Flex>
          <Flex direction={Direction.Column} justify={Align.SpaceBetween}>
            <Circle size={circleSize} />
            <Circle size={circleSize} />
            <Circle size={circleSize} background={Colors.Black} />
          </Flex>
        </Flex>
      );
    case 4:
      return (
        <Flex justify={Align.SpaceBetween} {...flexProps}>
          <Flex direction={Direction.Column} justify={Align.SpaceBetween}>
            <Circle size={circleSize} background={Colors.Black} />
            <Circle size={circleSize} background={Colors.Black} />
          </Flex>
          <Flex direction={Direction.Column} justify={Align.SpaceBetween}>
            <Circle size={circleSize} background={Colors.Black} />
            <Circle size={circleSize} background={Colors.Black} />
          </Flex>
        </Flex>
      );
    case 5:
      return (
        <Flex justify={Align.SpaceBetween} {...flexProps}>
          <Flex direction={Direction.Column} justify={Align.SpaceBetween}>
            <Circle size={circleSize} background={Colors.Black} />
            <Circle size={circleSize} />
            <Circle size={circleSize} background={Colors.Black} />
          </Flex>
          <Flex direction={Direction.Column} justify={Align.SpaceBetween}>
            <Circle size={circleSize} />
            <Circle size={circleSize} background={Colors.Black} />
            <Circle size={circleSize} />
          </Flex>
          <Flex direction={Direction.Column} justify={Align.SpaceBetween}>
            <Circle size={circleSize} background={Colors.Black} />
            <Circle size={circleSize} />
            <Circle size={circleSize} background={Colors.Black} />
          </Flex>
        </Flex>
      );
    case 6:
      return (
        <Flex justify={Align.SpaceBetween} {...flexProps}>
          <Flex direction={Direction.Column} justify={Align.SpaceBetween}>
            <Circle size={circleSize} background={Colors.Black} />
            <Circle size={circleSize} background={Colors.Black} />
            <Circle size={circleSize} background={Colors.Black} />
          </Flex>
          <Flex direction={Direction.Column} justify={Align.SpaceBetween}>
            <Circle size={circleSize} />
            <Circle size={circleSize} />
            <Circle size={circleSize} />
          </Flex>
          <Flex direction={Direction.Column} justify={Align.SpaceBetween}>
            <Circle size={circleSize} background={Colors.Black} />
            <Circle size={circleSize} background={Colors.Black} />
            <Circle size={circleSize} background={Colors.Black} />
          </Flex>
        </Flex>
      );
    default:
      return null;
  }
};
