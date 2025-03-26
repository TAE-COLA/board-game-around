export {};

declare global {
  interface Array<T> {
    first(): T;
    last(): T;

    remove(item: T): void;
    removeAll(item: T): void;

    mapToObject<K extends string | number, V>(
      callbackfn: (value: T, index: number, array: T[]) => [K, V]
    ): Record<K, V>;

    shuffle(): T[];
  }
}

export const declareGlobalArray = () => {
  Array.prototype.first = function () {
    if (this.length === 0) throw new Error('Array is empty');
    else return this[0];
  };

  Array.prototype.last = function () {
    if (this.length === 0) throw new Error('Array is empty');
    else return this[this.length - 1];
  };

  Array.prototype.remove = function (item) {
    const index = this.indexOf(item);
    if (index > -1) this.splice(index, 1);
  };

  Array.prototype.removeAll = function (item) {
    return this.filter((value) => value !== item);
  };

  Array.prototype.mapToObject = function (callbackfn) {
    return this.reduce((acc, value, index) => {
      const [key, val] = callbackfn(value, index, this);
      acc[key] = val;
      return acc;
    }, {});
  };

  Array.prototype.shuffle = function () {
    const newArray = [...this];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
};
