import type { FeedbackFormValues } from "../schema";
import { DataTable } from "./table";
import {
  midQuarterColumns,
  endOfQuarterColumns,
  taColumns,
  observationColumns,
  pedHeadColumns,
  lccColumns,
} from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function getData(): Promise<FeedbackFormValues[]> {
  // TODO: fetch from D1
  return [];
}

const TABLES = [
  { id: "mid_quarter", label: "Mid-Quarter", columns: midQuarterColumns },
  { id: "end_of_quarter", label: "End-of-Quarter", columns: endOfQuarterColumns },
  { id: "observation", label: "Observation", columns: observationColumns },
  { id: "ta", label: "TA → LA", columns: taColumns },
  { id: "ped_head", label: "Ped Head", columns: pedHeadColumns },
  { id: "lcc", label: "LCC", columns: lccColumns },
] as const;

export default async function FeedbackViewPage() {
  const data = await getData();

  return (
    <div className="mx-auto w-full max-w-7xl px-8 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        Feedback Responses
      </h1>
      <Tabs defaultValue="mid_quarter">
        <TabsList>
          {TABLES.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABLES.map((t) => (
          <TabsContent key={t.id} value={t.id}>
            <DataTable columns={t.columns} data={data} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
