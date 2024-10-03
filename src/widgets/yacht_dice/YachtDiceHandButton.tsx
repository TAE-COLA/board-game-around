import { Card, CardBody, CardProps, Flex, Text } from '@chakra-ui/react';
import React from 'react';
import { Die } from 'widgets';

type IProps = CardProps & {
  dice?: number[];
  name: string;
  score: number;
  isDisabled?: boolean;
  onClick: () => void;
};

const YachtDiceHandButton: React.FC<IProps> = ({
  dice,
  name,
  score,
  isDisabled,
  onClick,
  ...props
}) => {
  const [variant, setVariant] = React.useState<'filled' | 'elevated'>(isDisabled ? 'filled' : 'elevated');


  return (
    <Card 
      variant={variant} 
      opacity={isDisabled ? 0.5 : 1} 
      onMouseEnter={() => setVariant('filled')} 
      onMouseLeave={() => !isDisabled ? setVariant('elevated') : null}
      onClick={() => !isDisabled ? onClick() : null}
      {...props}
    >
      <CardBody>
        <Flex align='center' gap='4'>
          {dice && 
            <Flex gap='1'>
              {dice.map((value, index) => (
                <Die key={index} value={value} size='sm' />
              ))}
            </Flex>
          }
          <Text fontSize='sm' as={isDisabled ? 's' : 'b'}>{name}</Text>
          <Text fontSize='sm' as={isDisabled ? 's' : 'b'}>{score}점</Text>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default YachtDiceHandButton;