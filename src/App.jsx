import React, { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { JournalProvider } from "./context/JournalContext";
import { Navbar } from "./components/Navbar";
import { BookContainer } from "./components/Book/BookContainer";
import { Footer } from "./components/Footer";
import { PrivacyModal } from "./components/PrivacyModal";

function App() {
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <AuthProvider>
      <JournalProvider>
        <div
          className="min-h-screen flex flex-col font-body antialiased"
          style={{ background: "var(--bg)", color: "var(--text-primary)" }}
        >
          <Navbar />
          <div className="flex-grow relative flex flex-col justify-center">
            <BookContainer />
          </div>
          <Footer onOpenPrivacy={() => setShowPrivacy(true)} />
        </div>
        <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      </JournalProvider>
    </AuthProvider>
  );
}

export default App;
