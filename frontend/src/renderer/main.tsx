// src/renderer/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";

console.log("[React] Starting mount process...");

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Optional: force background so Electron never shows white
rootElement.style.cssText = `
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background: #0f172a;
  color: white;
`;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" />
  </React.StrictMode>
);

console.log("[React] ✅ React mounted successfully");
