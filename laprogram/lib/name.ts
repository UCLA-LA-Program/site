export function getNamePart(name: string, part: "first" | "last"): string {
  const parts = name.trim().split(/\s+/);
  return part === "first"
    ? (parts[0] ?? "")
    : (parts[parts.length - 1] ?? "");
}

export function formatName(name: string, sortByLast: boolean): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  const last = parts[parts.length - 1];
  const first = parts.slice(0, -1).join(" ");
  return sortByLast ? `${last}, ${first}` : `${first} ${last}`;
}
