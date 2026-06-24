export class GameName {
  static readonly YatchDice = { korean: '요트다이스', path: '/yachtdice' };
  static readonly DavinciCode = { korean: '다빈치코드', path: '/davincicode' };
  static readonly TheMind = { korean: '더 마인드', path: '/themind' };
  static readonly TheMindIds = ['the-mind', 'The Mind', 'TheMind', 'themind'] as const;
  static readonly TheMindNames = ['The Mind', '더 마인드'] as const;

  private static normalize(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
  }

  static isTheMindId(id: string) {
    return GameName.normalize(id) === GameName.normalize(GameName.TheMindIds[0]);
  }

  static isTheMind(name: string) {
    const normalizedName = GameName.normalize(name);
    return GameName.TheMindNames.some((theMindName) => GameName.normalize(theMindName) === normalizedName);
  }
}
