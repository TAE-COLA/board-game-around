import { defaultFD, defaultTD, type FourDirections, type TwoDirections } from 'shared';
import styled from 'styled-components';

type IProps = {
  rows?: number | string;
  columns?: number | string;
  gap: TwoDirections;
  padding: FourDirections;
  margin: FourDirections;
}

const StyledGrid = styled.div<IProps>`
  display: grid;
  grid-template-rows: repeat(${ props => props.rows }, minmax(0, 1fr));
  grid-template-columns: repeat(${ props => props.columns }, minmax(0, 1fr));
  gap: ${ props => `${props.gap.x} ${props.gap.y}` };
  padding: ${ props => `${props.padding.top} ${props.padding.right} ${props.padding.bottom} ${props.padding.left}` };
  margin: ${ props => `${props.margin.top} ${props.margin.right} ${props.margin.bottom} ${props.margin.left}` };
`;

StyledGrid.defaultProps = {
  gap: defaultTD,
  padding: defaultFD,
  margin: defaultFD
};

export default StyledGrid;