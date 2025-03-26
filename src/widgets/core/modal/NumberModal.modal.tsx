import {
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
} from '@chakra-ui/react';
import React, { useState } from 'react';

type Props = {
  digits: (number | string)[];
  maxDigits: number;
  onConfirm: (number: number) => void;
  modal: { isOpen: boolean; onOpen: () => void; onClose: () => void };
};

export const NumberModal: React.FC<Props> = ({ digits, maxDigits, onConfirm, modal }) => {
  const [num, setNum] = useState<string>('');
  const [remainingPresses, setRemainingPresses] = useState<number>(maxDigits);

  const handleClose = () => {
    setNum('');
    setRemainingPresses(maxDigits);
    modal.onClose();
  };

  const handleConfirm = () => {
    onConfirm(Number(num));
    setNum('');
    setRemainingPresses(maxDigits);
    modal.onClose();
  };

  const handleButtonClick = (digit: number | string) => {
    if (remainingPresses > 0) {
      setNum((prev) => prev + digit.toString());
      setRemainingPresses((prev) => prev - 1);
    }
  };

  const handleDelete = () => {
    if (num.length > 0) {
      setNum((prev) => prev.slice(0, -1));
      setRemainingPresses((prev) => prev + 1);
    }
  };

  return (
    <Modal isOpen={modal.isOpen} onClose={modal.onClose} isCentered closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>숫자를 입력해주세요.</ModalHeader>
        <ModalBody>
          <Flex direction='column' alignItems='center'>
            <InputGroup mb={4}>
              <Input value={num} readOnly />
              <InputRightElement width='4.5rem'>
                <Button h='1.75rem' size='sm' onClick={handleDelete}>
                  지우기
                </Button>
              </InputRightElement>
            </InputGroup>
            <SimpleGrid columns={3} spacing={4}>
              {digits.map((digit) => (
                <Button
                  key={digit}
                  onClick={() => handleButtonClick(digit)}
                  size='lg'
                  height='50px'
                  width='50px'
                  isDisabled={remainingPresses === 0}
                >
                  {digit}
                </Button>
              ))}
            </SimpleGrid>
          </Flex>
        </ModalBody>
        <ModalFooter gap='4'>
          <Button onClick={handleClose}>취소</Button>
          <Button onClick={handleConfirm}>선택</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
