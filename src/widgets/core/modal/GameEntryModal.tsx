import { Button, Flex, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react';
import { Game } from 'entities';
import React, { useState } from 'react';

type IProps = {
  loading: boolean;
  modal: { isOpen: boolean; onOpen: () => void; onClose: () => void };
  game: Game;
  onClickCreateLoungeButton: () => void;
  onClickJoinLoungeButton: (code: string) => void;
};

const GameEntryModal: React.FC<IProps> = ({
  loading,
  modal,
  game,
  onClickCreateLoungeButton,
  onClickJoinLoungeButton
}) => {
  const [code, setData] = useState('');

  return (
    <Modal isOpen={modal.isOpen} onClose={modal.onClose} size='xl' isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{game.name} 플레이</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction='row' width='100%' justify='Center' align='Center' gap='16'>
            <Flex direction='column' gap='4'>
              <Text>새로운 게임방을 생성하세요</Text>
              <Button onClick={onClickCreateLoungeButton} isDisabled={loading} colorScheme='blue'>게임방 생성</Button>
            </Flex>
            <Flex direction='column' gap='4'>
              <Text>또는 기존의 게임방에 참여하세요</Text>
              <Input
                placeholder='게임방 코드'
                value={code}
                onChange={(e) => setData(e.target.value)}
                isDisabled={loading}
              />
              <Button onClick={() => onClickJoinLoungeButton(code)} isDisabled={loading} colorScheme='blue'>게임방 참여</Button>
            </Flex>
          </Flex>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
};

export default GameEntryModal;