export default interface YachtDiceBoard {
  ace: { value: number; marked: boolean };
  double: { value: number; marked: boolean };
  triple: { value: number; marked: boolean };
  quadra: { value: number; marked: boolean };
  penta: { value: number; marked: boolean };
  hexa: { value: number; marked: boolean };
  bonus: { value: number; marked: boolean };
  choice: { value: number; marked: boolean };
  fourKind: { value: number; marked: boolean };
  fullHouse: { value: number; marked: boolean };
  smStraight: { value: number; marked: boolean };
  lgStraight: { value: number; marked: boolean };
  yacht: { value: number; marked: boolean };
}