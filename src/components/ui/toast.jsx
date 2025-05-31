"use client";

import { Toaster } from "react-hot-toast";

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          padding: "12px 16px",
          fontSize: "14px",
          background: "#fff",
          color: "#000",
          border: "1px solid #e0e0e0",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        },
        success: {
          iconTheme: {
            primary: "#4caf50",
            secondary: "#e8f5e9",
          },
        },
        error: {
          iconTheme: {
            primary: "#f44336",
            secondary: "#ffebee",
          },
        },
      }}
    />
  );
}
