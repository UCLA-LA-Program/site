import type { ReactNode } from "react";

type NameKey = "first_name" | "last_name";

export function NameSortHeader({
  toggle,
  arrow,
  prefix,
}: {
  toggle: (key: NameKey) => void;
  arrow: (key: NameKey) => string;
  prefix?: ReactNode;
}) {
  return (
    <>
      {prefix && (
        <span className="mr-1 text-muted-foreground/70">{prefix}</span>
      )}
      <span
        className="cursor-pointer hover:text-foreground"
        onClick={() => toggle("first_name")}
      >
        First{arrow("first_name")}
      </span>
      <span className="mx-1 text-muted-foreground/50">/</span>
      <span
        className="cursor-pointer hover:text-foreground"
        onClick={() => toggle("last_name")}
      >
        Last{arrow("last_name")}
      </span>
    </>
  );
}
