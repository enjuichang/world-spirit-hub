export function withBasePath(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
