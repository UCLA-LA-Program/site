"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/test");
    const text = await response.text();
    setMessage((message) => message + text);
  };

  return (
    <div className="card">
      <button onClick={fetchData}>click me to test the api</button>
      <p>response: {message}</p>
    </div>
  );
}
