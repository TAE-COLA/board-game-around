import { Button, Flex, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react';
import { User } from 'entities';
import React from 'react';
import { getOrdinal } from 'shared';

type IProps = {
  rank: { player: User; score: number; }[];
  modal: { isOpen: boolean; onOpen: () => void; onClose: () => void };
};

const YachtDiceResultModal: React.FC<IProps> = ({
  rank,
  modal
}) => {
  return (
    <Modal isOpen={modal.isOpen} onClose={modal.onClose} size='xl' isCentered closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>요트다이스 결과</ModalHeader>
        <ModalBody>
          <Flex direction='column' width='100%' justify='center' align='center' gap='4'>
            <Flex width='100%' align='center' gap='4' paddingX='6' paddingY='4' background='yellow.100' borderRadius='md'>
              <Text fontSize='xl' fontWeight='bold' color='yellow.800'>WINNER</Text>
              <Text fontSize='xl' flex='1'>{rank[0].player.name}</Text>
              <Text fontSize='xl'>{rank[0].score}점</Text>
            </Flex>
            {rank.slice(1).map(({ player, score }, index) => (
              <Flex width='100%' align='center' gap='4' paddingX='6'>
                <Text fontSize='lg' fontWeight='bold'>{getOrdinal(index + 2)}</Text>
                <Text fontSize='lg' flex='1'>{player.name}</Text>
                <Text fontSize='lg'>{score}점</Text>
              </Flex>
            ))}
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button onClick={modal.onClose}>메인 화면으로 돌아가기</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default YachtDiceResultModal;