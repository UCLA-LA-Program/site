"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedbackTable } from "@/app/feedback/view/FeedbackTable";
import { buildTables } from "@/app/feedback/view/FeedbackView";
import type { AnonFeedback } from "@/app/feedback/view/columns";
import type { Position } from "@/types/db";
import type { RosterUser } from "@/app/api/admin/roster/route";

function FeedbackTables({ userId }: { userId: string }) {
  const { data } = useSWR<{
    feedback: AnonFeedback[];
    positions: Position[];
  }>(`/api/admin/audit/feedback?userId=${encodeURIComponent(userId)}`, fetcher);

  if (!data) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (data.positions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This user has no course positions.
      </p>
    );
  }

  const tables = buildTables(data.positions);
  if (tables.length === 0) {
    return <p className="text-sm text-muted-foreground">No tables to show.</p>;
  }

  return (
    <Tabs defaultValue={tables[0].id}>
      <TabsList>
        {tables.map((t) => (
          <TabsTrigger key={t.id} value={t.id}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tables.map((t) => (
        <TabsContent key={t.id} value={t.id}>
          <FeedbackTable
            columns={t.columns}
            data={data.feedback.filter(t.filter)}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}

export function FeedbackAudit() {
  const { data: roster } = useSWR<RosterUser[]>("/api/admin/roster", fetcher);
  const [selectedId, setSelectedId] = useState<string>("");
  const items = roster ?? [];

  return (
    <div className="w-full max-w-6xl space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Combobox
            items={items}
            value={items.find((u) => u.id === selectedId) ?? null}
            onValueChange={(u: RosterUser | null) => setSelectedId(u?.id ?? "")}
            itemToStringLabel={(u: RosterUser) => u.name}
            itemToStringValue={(u: RosterUser) => u.id}
            filter={(item: RosterUser, query: string) => {
              const q = query.toLowerCase();
              return (
                item.name.toLowerCase().includes(q) ||
                item.email.toLowerCase().includes(q)
              );
            }}
          >
            <ComboboxInput placeholder="Pick a user…" className="w-96" />
            <ComboboxContent>
              <ComboboxEmpty>No users</ComboboxEmpty>
              <ComboboxList>
                <ComboboxCollection>
                  {(item: RosterUser) => (
                    <ComboboxItem key={item.id} value={item}>
                      {item.name}{" "}
                      <span className="text-muted-foreground">
                        {item.email}
                      </span>
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {selectedId && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedId("")}>
              Clear
            </Button>
          )}
        </div>
        {selectedId ? (
          <FeedbackTables key={selectedId} userId={selectedId} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a user to view their feedback.
          </p>
        )}
      </div>
    </div>
  );
}
