export function mapKeys<K extends string | number | symbol, V>(
  obj: Record<K, V>,
  func: (key: K) => K
): Record<K, V> {
  const newObj = {} as Record<K, V>;
  for (const key of Object.keys(obj)) {
    newObj[func(key as K)] = obj[key as K];
  }
  return newObj;
}

export function mapValues<K extends string | number | symbol, V, V2>(
  obj: Record<K, V>,
  func: (value: V) => V2
): Record<K, V2> {
  const newObj = {} as Record<K, V2>;
  for (const key of Object.keys(obj)) {
    newObj[key as K] = func(obj[key as K]);
  }
  return newObj;
}

export function trimLowerCaseKeys<T>(
  headers: Record<string, T>
): Record<string, T> {
  return mapKeys(headers, (k) => k.toLocaleLowerCase().trim());
}

/**
 *
 * @param obj
 * @param existingKeys
 * @returns Name of the key that doesn't exist in obj
 */
export function keysExist(
  obj: object,
  ...existingKeys: string[]
): string | undefined {
  const objKeys = Object.keys(obj);
  for (const name of existingKeys) {
    if (!objKeys.includes(name)) {
      return name;
    }
  }
  return;
}
