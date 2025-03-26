import {
  Button,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { Game } from 'models';
import React, { useState } from 'react';
import { Align, Colors, Dimension, Direction, Size } from 'shared';

type Props = {
  modal: { isOpen: boolean; onOpen: () => void; onClose: () => void };
  game?: Game;
  onClickCreateLoungeButton: () => void;
  onClickJoinLoungeButton: (code: string) => void;
};

export const GameEntryModal: React.FC<Props> = ({
  modal,
  game,
  onClickCreateLoungeButton,
  onClickJoinLoungeButton,
}) => {
  const [code, setData] = useState('');

  return (
    <Modal isOpen={modal.isOpen} onClose={modal.onClose} size={Size.Xl} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{game?.name} 플레이</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex
            direction={Direction.Row}
            width={Dimension.Full}
            justify={Align.Center}
            align={Align.Center}
            gap={16}
          >
            <Flex direction={Direction.Column} gap={4}>
              <Text>새로운 게임방을 생성하세요</Text>
              <Button onClick={onClickCreateLoungeButton} colorScheme={Colors.Brand}>
                게임방 생성
              </Button>
            </Flex>
            <Flex direction={Direction.Column} gap={4}>
              <Text>또는 기존의 게임방에 참여하세요</Text>
              <Input
                placeholder='게임방 코드'
                value={code}
                onChange={(e) => setData(e.target.value)}
              />
              <Button onClick={() => onClickJoinLoungeButton(code)} colorScheme={Colors.Brand}>
                게임방 참여
              </Button>
            </Flex>
          </Flex>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
};
