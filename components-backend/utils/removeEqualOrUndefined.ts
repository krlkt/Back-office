import { isEqual } from 'lodash';

export const removeEqualOrUndefined = <T extends object>(
  input: T,
  existing: T
): Partial<T> => {
  return Object.entries(input).reduce<Partial<T>>(
    (acc: Partial<T>, [key, value]) => {
      if (value === undefined) {
        return acc;
      }
      const keyOf = key as keyof T;
      if (isEqual(value, existing[keyOf])) {
        return acc;
      }
      return {
        ...acc,
        [key]: value,
      };
    },
    {}
  );
};
