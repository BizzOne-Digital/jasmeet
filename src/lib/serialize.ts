/** Convert Mongoose lean documents to plain JSON-serializable objects. */
export function serialize<T = unknown>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
