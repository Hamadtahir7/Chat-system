// src/App.jsx
import { useState } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ChatApp from "./components/ChatApp";

export default function App() {
  const [screen, setScreen] = useState("login"); // "login" | "signup" | "app"

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
        <ChatApp onLogout={() => setScreen("login")} />
      )}
    </>
  );
}
