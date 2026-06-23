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
import { Game } from 'features/game';
import React, { useState } from 'react';

type IProps = {
  loading: boolean;
  createLoading?: boolean;
  joinLoading?: boolean;
  modal: { isOpen: boolean; onOpen: () => void; onClose: () => void };
  game: Game;
  onClickCreateLoungeButton: () => void;
  onClickJoinLoungeButton: (code: string) => void;
};

export const GameEntryModal: React.FC<IProps> = ({
  loading,
  createLoading = false,
  joinLoading = false,
  modal,
  game,
  onClickCreateLoungeButton,
  onClickJoinLoungeButton,
}) => {
  const [code, setData] = useState('');

  return (
    <Modal
      isOpen={modal.isOpen}
      onClose={modal.onClose}
      size={{ base: 'sm', md: 'xl' }}
      closeOnOverlayClick={!createLoading && !joinLoading}
      isCentered
    >
      <ModalOverlay />
      <ModalContent marginX={{ base: 4, md: 0 }}>
        <ModalHeader>{game.name} 플레이</ModalHeader>
        <ModalCloseButton isDisabled={createLoading || joinLoading} />
        <ModalBody>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            width='100%'
            justify='center'
            align='stretch'
            gap={{ base: 6, md: 16 }}
          >
            <Flex direction='column' gap='4' flex='1'>
              <Text>새로운 게임방을 생성하세요</Text>
              <Button
                onClick={onClickCreateLoungeButton}
                isDisabled={loading || createLoading || joinLoading}
                isLoading={createLoading}
                colorScheme='blue'
              >
                게임방 생성
              </Button>
            </Flex>
            <Flex direction='column' gap='4' flex='1'>
              <Text>또는 기존의 게임방에 참여하세요</Text>
              <Input
                placeholder='게임방 코드'
                value={code}
                onChange={(e) => setData(e.target.value)}
                isDisabled={loading || createLoading || joinLoading}
              />
              <Button
                onClick={() => onClickJoinLoungeButton(code)}
                isDisabled={loading || createLoading || joinLoading || !code.trim()}
                isLoading={joinLoading}
                colorScheme='blue'
              >
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
