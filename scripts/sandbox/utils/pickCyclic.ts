export function pickCyclic<T>(items: readonly T[], index: number): T {
  const item = items[index % items.length];
  if (item === undefined) {
    throw new Error("pickCyclic: items must not be empty");
  }
  return item;
}
