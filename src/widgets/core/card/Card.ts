import { Card } from '@chakra-ui/react';
import styled from '@emotion/styled';

type IProps = {
  imageSrc: string;
  title: string;
  description: string;
  imageAlt?: string;
  actions?: React.ReactNode;
}

const WCard = styled(Card)<IProps>`
  
`;

Card.defaultProps = {
  imageAlt: 'Card Image',
  actions: null
};