export default interface YachtDiceBoard {
  aces: { value: number; marked: boolean };
  deuces: { value: number; marked: boolean };
  threes: { value: number; marked: boolean };
  fours: { value: number; marked: boolean };
  fives: { value: number; marked: boolean };
  sixes: { value: number; marked: boolean };
  bonus: { value: number; marked: boolean };
  choice: { value: number; marked: boolean };
  fourKind: { value: number; marked: boolean };
  fullHouse: { value: number; marked: boolean };
  smStraight: { value: number; marked: boolean };
  lgStraight: { value: number; marked: boolean };
  yacht: { value: number; marked: boolean };
}