import styled from 'styled-components';
import { ReactComponent as PokeDollarSvg } from '../asset/poke-dollar.svg';

const StyledSvg = styled(PokeDollarSvg)`
  width: 1ex;
  height: auto;
  fill: currentColor;
`;

interface PokeDollarProps {
  className?: string;
}

const PokeDollar = ({ className }: PokeDollarProps) => (
  <StyledSvg className={className} />
);

export default PokeDollar;
