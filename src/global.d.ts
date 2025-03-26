export {};

declare global {
  interface Array<T> {
    first(): T | undefined;
    last(): T | undefined;

    min(): T | undefined;
    minBy(compareFn: (a: T, b: T) => boolean): T | undefined;
    max(): T | undefined;
    maxBy(compareFn: (a: T, b: T) => boolean): T | undefined;

    shuffle(): T[];

    insertAt(index: number, value: T): T[];
    insertBy(
      predicate: (prev?: T, next?: T, min?: T, max?: T) => boolean,
      value: T,
      compareFn?: (a: T, b: T) => boolean
    ): T[];
    removeAt(index: number): T[];
    remove(value: T): T[];

    mapToObject<K extends string | number, V>(
      callbackfn: (value: T, index: number, array: T[]) => [K, V]
    ): Record<K, V>;

    isEmpty(): boolean;
  }
}

export const declareArrayFunctions = () => {
  Array.prototype.first = function () {
    return this[0];
  };

  Array.prototype.last = function () {
    return this[this.length - 1];
  };

  Array.prototype.min = function () {
    return this.reduce<T | undefined>((min, item) => {
      if (min === undefined) return item;
      return item < min ? item : min;
    }, undefined);
  };

  Array.prototype.minBy = function (compareFn) {
    return items.reduce<T | undefined>((min, item) => {
      if (min === undefined) return item;
      return compareFn(item, min) ? item : min;
    }, undefined);
  };

  Array.prototype.max = function () {
    return this.reduce<T | undefined>((max, item) => {
      if (max === undefined) return item;
      return item > max ? item : max;
    }, undefined);
  };

  Array.prototype.maxBy = function (compareFn) {
    return items.reduce<T | undefined>((max, item) => {
      if (max === undefined) return item;
      return compareFn(max, item) ? max : item;
    }, undefined);
  };

  Array.prototype.shuffle = function () {
    const newArray = [...this];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  Array.prototype.insertAt = function (index, value) {
    return [...this.slice(0, index), value, ...this.slice(index)];
  };

  Array.prototype.insertBy = function (predicate, value, compareFn) {
    const result: T[] = [];
    for (let i = 0; i <= this.length; i++) {
      const prev = this[i - 1];
      const next = this[i];

      const min = compareFn ? this.slice(0, i).minBy(compareFn) : this.slice(0, i).min();
      const max = compareFn ? this.slice(0, i).maxBy(compareFn) : this.slice(0, i).max();

      if (predicate(prev, next, min, max)) {
        result.push(value);
      }

      if (i < this.length) {
        result.push(this[i]);
      }
    }

    return result;
  };

  Array.prototype.removeAt = function (index) {
    return [...this.slice(0, index), ...this.slice(index + 1)];
  };

  Array.prototype.remove = function (value) {
    return this.filter((v) => v !== value);
  };

  Array.prototype.mapToObject = function (callbackfn) {
    return this.reduce((acc, value, index) => {
      const [key, val] = callbackfn(value, index, this);
      acc[key] = val;
      return acc;
    }, {});

    Array.prototype.isEmpty = function () {
      return this.length === 0;
    };
  };
};
