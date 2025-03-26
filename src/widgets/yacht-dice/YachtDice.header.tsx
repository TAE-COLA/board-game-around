import { Button, Flex, FlexProps, Text } from '@chakra-ui/react';
import React from 'react';
import { GameName } from 'shared';

type Props = FlexProps & {
  onClickExitButton: () => void;
};

export const YachtDiceHeader: React.FC<Props> = ({ onClickExitButton, ...props }) => {
  return (
    <Flex width='100%' justify='space-between' align='center' {...props}>
      <Text fontSize='2xl' fontWeight='bold'>
        {GameName.YatchDice.korean}
      </Text>
      <Button onClick={onClickExitButton} height={12} paddingX={6}>
        게임방 나가기
      </Button>
    </Flex>
  );
};
