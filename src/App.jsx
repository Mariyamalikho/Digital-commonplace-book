import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { JournalProvider } from "./context/JournalContext";
import { Navbar } from "./components/Navbar";
import { BookContainer } from "./components/Book/BookContainer";

function App() {
  return (
    <AuthProvider>
      <JournalProvider>
        <div
          className="min-h-screen font-body antialiased"
          style={{ background: "var(--bg)", color: "var(--text-primary)" }}
        >
          <Navbar />
          <BookContainer />
        </div>
      </JournalProvider>
    </AuthProvider>
  );
}

export default App;
