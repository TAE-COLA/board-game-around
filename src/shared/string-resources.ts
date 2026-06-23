export class GameName {
  static readonly YatchDice = { korean: '요트다이스', path: '/yachtdice' };
  static readonly DavinciCode = { korean: '다빈치코드', path: '/davincicode' };
  static readonly TheMind = { korean: '더 마인드', path: '/themind' };
  static readonly TheMindNames = ['The Mind', '더 마인드'] as const;

  static isTheMind(name: string) {
    return (GameName.TheMindNames as readonly string[]).includes(name);
  }
}
