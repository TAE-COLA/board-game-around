import { Colors } from 'shared';

export enum DavinciCodeTileColor {
  White = Colors.White,
  Black = Colors.Black,
}

export interface DavinciCodeTileModel {
  color: DavinciCodeTileColor;
  value?: number | string;
  isRevealed: boolean;
}

/**
 *
 * @param left 왼쪽에 배치될 타일
 * @param right 오른쪽에 배치될 타일
 * @returns 오름차순으로 잘 배치되었다면 true를 반환합니다.
 */
export const compareTile = (left?: DavinciCodeTileModel, right?: DavinciCodeTileModel): boolean => {
  if (left === undefined || right === undefined) return true;

  if (left.value === '-' || right.value === '-') return true;
  if (left.value === undefined || right.value === undefined) return false;

  return (
    left.value < right.value ||
    (left.value === right.value && left.color == DavinciCodeTileColor.Black)
  );
};

export const isJoker = (tile: DavinciCodeTileModel): boolean => {
  return tile.value === '-';
};

export const isDummy = (tile: DavinciCodeTileModel): boolean => {
  return tile.value === undefined;
};

export const dummyDavinciCodeTile = {
  color: DavinciCodeTileColor.White,
  value: undefined,
  isRevealed: false,
} satisfies DavinciCodeTileModel;
