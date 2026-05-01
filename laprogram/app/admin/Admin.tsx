"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ConfigTab } from "./components/ConfigTab";
import { RosterTab } from "./components/RosterTab";
import { AvailabilityAudit } from "./components/AvailabilityAudit";
import { ObservationAudit } from "./components/ObservationAudit";
import { FeedbackAudit } from "./components/FeedbackAudit";
import { SyncTab } from "./components/SyncTab";
import { ReportTab } from "./components/ReportTab";

export function Admin() {
  return (
    <div className="mx-auto w-full px-8 py-4">
      <Tabs defaultValue="roster">
        <div className="mb-3 flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <TabsList>
            <TabsTrigger value="roster">Roster</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="observations">Observations</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="sync">Airtable Sync</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="roster" className="flex justify-center">
          <RosterTab />
        </TabsContent>

        <TabsContent value="availability" className="flex justify-center">
          <AvailabilityAudit />
        </TabsContent>

        <TabsContent value="observations" className="flex justify-center">
          <ObservationAudit />
        </TabsContent>

        <TabsContent value="feedback" className="flex justify-center">
          <FeedbackAudit />
        </TabsContent>

        <TabsContent value="config" className="flex justify-center">
          <ConfigTab />
        </TabsContent>

        <TabsContent value="sync" className="flex justify-center">
          <SyncTab />
        </TabsContent>

        <TabsContent value="reports" className="flex justify-center">
          <ReportTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
