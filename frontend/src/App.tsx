import { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    const response = await fetch("https://api.laprogramucla.com/test"); // Replace with your API endpoint
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    setMessage((message) => message + response.text);
  };

  return (
    <div className="card">
      <button onClick={fetchData}>click me to test the api</button>
      <p>response: {message}</p>
    </div>
  );
}

export default App;
