import DavinciCodeTile from "./DavinciCodeTile";

export default interface DavinciCode {
  loungeId: string;
  playerIds: string[];
  hands: {
    [key: string]: DavinciCodeTile[];
  };
  turn: string;
  finishedPlayerIds: string[];
  finishedAt?: object;
}