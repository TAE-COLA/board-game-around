import { Flex, FlexProps } from '@chakra-ui/react';
import React from 'react';
import { useDrag } from 'react-dnd';

type IProps = FlexProps & {
  children: React.ReactNode;
  type: string;
  index: number;
  isDisabled?: boolean;
  onDropOutside?: (index: number) => void;
};

const Draggable: React.FC<IProps> = ({
  children,
  type,
  index,
  isDisabled = false,
  onDropOutside = () => {},
  ...props
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: type,
    item: { index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        onDropOutside(item.index);
      }
    }
  }));

  return (
    <Flex ref={!isDisabled ? drag : null} opacity={isDragging ? 0.5 : 1} {...props}>
      {children}
    </Flex>
  )
}

export default Draggable;