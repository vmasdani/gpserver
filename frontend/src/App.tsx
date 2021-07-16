import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { AppContext } from "./AppContext";
import MainComponent from "./MainComponent";

function App() {
  const [baseUrl, setBaseUrl] = useState(
    process.env.REACT_APP_BASE_URL ?? null
  );

  const [apiKey, setApiKey] = useState(localStorage.getItem("apiKey"));

  return (
    <AppContext.Provider
      value={{
        baseUrl: baseUrl,
        setBaseUrl: setBaseUrl,

        apiKey: apiKey,
        setApiKey: setApiKey,
      }}
    >
      <MainComponent />
    </AppContext.Provider>
  );
}

export default App;
