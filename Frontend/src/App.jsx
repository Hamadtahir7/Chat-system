// src/App.jsx
import { useState, useEffect } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ChatApp from "./components/ChatApp";
import { authService } from "./services/authService";

export default function App() {
  const [screen, setScreen] = useState("login"); // "login" | "signup" | "app"
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      setScreen("app");
    }
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex h-screen bg-bg items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue/20 border-t-blue animate-spin mx-auto mb-3" />
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {screen === "login"  && (
        <Login
          onSwitch={() => setScreen("signup")}
          onLogin={() => setScreen("app")}
        />
      )}
      {screen === "signup" && (
        <Signup
          onSwitch={() => setScreen("login")}
          onSignup={() => setScreen("app")}
        />
      )}
      {screen === "app" && (
        <ChatApp onLogout={() => {
          authService.logout();
          setScreen("login");
        }} />
      )}
    </>
  );
}
