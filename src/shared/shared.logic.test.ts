import { generateCode } from './generate-code';
import { getOrdinal } from './get-ordinal';
import { isPlaceholder, placeholder } from './placeholder';
import { shuffle } from './shuffle';
import { GameName } from './string-resources';

describe('shared logic', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('generates uppercase alphabetic codes with the requested length', () => {
    const randomSpy = jest.spyOn(Math, 'random');
    randomSpy.mockReturnValueOnce(0).mockReturnValueOnce(25 / 26).mockReturnValueOnce(0.5);

    expect(generateCode(3)).toBe('AZN');
  });

  it('formats ordinal numbers including teen exceptions', () => {
    expect(getOrdinal(1)).toBe('1st');
    expect(getOrdinal(2)).toBe('2nd');
    expect(getOrdinal(3)).toBe('3rd');
    expect(getOrdinal(4)).toBe('4th');
    expect(getOrdinal(11)).toBe('11th');
    expect(getOrdinal(12)).toBe('12th');
    expect(getOrdinal(13)).toBe('13th');
    expect(getOrdinal(21)).toBe('21st');
    expect(getOrdinal(112)).toBe('112th');
  });

  it('detects placeholder values only by explicit shape', () => {
    expect(isPlaceholder(placeholder)).toBe(true);
    expect(isPlaceholder({ placeholder: true })).toBe(true);
    expect(isPlaceholder({ placeholder: false })).toBe(false);
    expect(isPlaceholder(null)).toBeNull();
    expect(isPlaceholder(1)).toBeFalsy();
  });

  it('shuffles without mutating the input array', () => {
    const randomSpy = jest.spyOn(Math, 'random');
    randomSpy.mockReturnValueOnce(0.75).mockReturnValueOnce(0.25).mockReturnValueOnce(0.5);

    const source = [1, 2, 3, 4];
    const shuffled = shuffle(source);

    expect(source).toEqual([1, 2, 3, 4]);
    expect(shuffled).toEqual([3, 2, 1, 4]);
  });

  it('recognizes The Mind names and ids regardless of spacing or casing', () => {
    expect(GameName.isTheMindId('the-mind')).toBe(true);
    expect(GameName.isTheMindId('The Mind')).toBe(true);
    expect(GameName.isTheMindId('themind')).toBe(true);
    expect(GameName.isTheMind('The Mind')).toBe(true);
    expect(GameName.isTheMind('더 마인드')).toBe(true);
    expect(GameName.isTheMind('요트다이스')).toBe(false);
  });
});
