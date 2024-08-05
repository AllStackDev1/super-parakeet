/* eslint-disable @typescript-eslint/no-explicit-any */
export function isEmpty(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0)
  );
}

export function exclude<T extends Record<any, any>>(
  data: T,
  keys: (keyof T)[],
) {
  const _data = JSON.parse(JSON.stringify(data)) as T;
  for (const key of keys) {
    delete _data[key];
  }

  return _data;
}

export function pick<T extends Record<any, any>>(data: T, keys: (keyof T)[]) {
  const _data = JSON.parse(JSON.stringify(data)) as T;
  let value: Record<keyof T, T[keyof T]> | undefined;
  for (const key of keys) {
    if (!value) {
      value = Object.create({
        [key]: _data[key],
      });
    } else {
      value[key] = _data[key];
    }
  }

  return value;
}
