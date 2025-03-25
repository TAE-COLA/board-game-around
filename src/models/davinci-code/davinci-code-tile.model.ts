export class DavinciCodeTileModel {
  isWhite: boolean;
  number: string;
  isRevealed: boolean;

  constructor(isWhite: boolean, number: string, isRevealed: boolean) {
    this.isWhite = isWhite;
    this.number = number;
    this.isRevealed = isRevealed;
  }

  isSmallerThan(other: DavinciCodeTileModel): boolean | null {
    if (this.number === '-' || other.number === '-') return true;
    return (
      Number(this.number) < Number(other.number) ||
      (Number(this.number) === Number(other.number) && other.isWhite)
    );
  }

  isBiggerThan(other: DavinciCodeTileModel): boolean | null {
    if (this.number === '-' || other.number === '-') return true;
    return (
      Number(this.number) > Number(other.number) ||
      (Number(this.number) === Number(other.number) && this.isWhite)
    );
  }

  isJoker(): boolean {
    return this.number === '-';
  }
}

export const dummyDavinciCodeTile = new DavinciCodeTileModel(false, '', false);
