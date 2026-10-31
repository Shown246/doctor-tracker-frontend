export const listKeys = [
  'page',
  'limit',
  'search',
  'sort',
  'from',
  'to',
  'condition',
  'status',
  'doctorId',
  'specialization',
  'hospital',
  'role',
] as const;
export function listQuery(
  search: URLSearchParams,
  keys: readonly string[] = listKeys,
) {
  return Object.fromEntries(
    keys.flatMap((key) => {
      const value = search.get(key);
      return value ? [[key, value]] : [];
    }),
  );
}
export function updateListState(current: string, key: string, value: string) {
  const next = new URLSearchParams(current);
  if (value) next.set(key, value);
  else next.delete(key);
  if (key !== 'page') next.delete('page');
  return next.toString();
}
