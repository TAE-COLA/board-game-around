import { useToast } from '@chakra-ui/react';

type IProps = {
  title: string;
  body: string;
  type?: 'info' | 'warning' | 'success' | 'error';
}

export function showToast(props: IProps) {
  const toast = useToast();
  
  toast({
    title: props.title,
    description: props.body,
    status: props.type || 'info',
    duration: 9000,
    isClosable: true
  });
}