import { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    const response = await fetch("https://api.laprogramucla.com/test");
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

export default App;
