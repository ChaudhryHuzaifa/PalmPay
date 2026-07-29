import React from "react";

export default function App() {
  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
      textAlign: "center"
    }}>
      <div style={{ fontSize: "72px", marginBottom: "20px" }}>
        ???
      </div>
      <h1 style={{ fontSize: "48px", fontWeight: "bold", margin: "0 0 10px 0" }}>
        PalmPay Desktop
      </h1>
      <p style={{ fontSize: "20px", opacity: 0.9, marginBottom: "40px" }}>
        Biometric Payment System
      </p>
      <div style={{
        background: "rgba(255,255,255,0.1)",
        padding: "20px",
        borderRadius: "15px",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.2)"
      }}>
        <p style={{ margin: "10px 0", fontSize: "18px" }}>? React is working</p>
        <p style={{ margin: "10px 0", fontSize: "18px" }}>? Vite is running</p>
        <p style={{ margin: "10px 0", fontSize: "18px" }}>? Electron ready</p>
      </div>
    </div>
  );
}