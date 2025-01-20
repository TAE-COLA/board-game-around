import DavinciCodeChip from "./DavinciCodeChip";

export default interface DavinciCode {
  loungeId: string;
  playerIds: string[];
  hands: {
    [key: string]: DavinciCodeChip[];
  };
  turn: string;
  finishedPlayerIds: string[];
  finishedAt?: object;
}