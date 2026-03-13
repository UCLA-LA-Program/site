"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Page() {
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "test");
    const text = await response.text();
    setMessage((message) => message + text);
  };

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <Button className="mt-2" onClick={fetchData}>
            Button
          </Button>
        </div>
        <div>{message}</div>
      </div>
    </div>
  );
}
