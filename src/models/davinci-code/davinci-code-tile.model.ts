export class DavinciCodeTile {
  isWhite: boolean;
  number: string;
  isRevealed: boolean;

  constructor(isWhite: boolean, number: string, isRevealed: boolean) {
    this.isWhite = isWhite;
    this.number = number;
    this.isRevealed = isRevealed;
  }

  isSmallerThan(other: DavinciCodeTile): boolean | null {
    if (this.number === '-' || other.number === '-') return true;
    return (
      Number(this.number) < Number(other.number) ||
      (Number(this.number) === Number(other.number) && other.isWhite)
    );
  }

  isBiggerThan(other: DavinciCodeTile): boolean | null {
    if (this.number === '-' || other.number === '-') return true;
    return (
      Number(this.number) > Number(other.number) ||
      (Number(this.number) === Number(other.number) && this.isWhite)
    );
  }
}

export const dummyDavinciCodeTile = new DavinciCodeTile(false, '', false);
