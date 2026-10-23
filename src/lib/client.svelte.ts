export interface ErrorContext {
  _innerMsg: string | undefined;
  _show: boolean;
  message: string | undefined;
}

/**
 * Sets a field of a table row from a cell component.
 * Rows are deep `$state` owned by the page, which hands them to the cells
 * precisely so that they can edit them in place
 */
export function setField<T, K extends keyof T>(row: T, key: K, value: T[K]) {
  row[key] = value;
}
