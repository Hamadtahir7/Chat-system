// src/components/ChatApp.jsx
import { useState } from "react";
import { MOCK_CHATS } from "../data/mockData";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import NewChatModal from "./NewChatModal";

export default function ChatApp({ onLogout }) {
  const [chats, setChats]       = useState(MOCK_CHATS);
  const [activeId, setActiveId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeChat = chats.find(c => c.id === activeId) || null;

  function handleSend(text) {
    if (!activeId) return;
    const newMsg = {
      id: Date.now(),
      sender: "You",
      mine: true,
      type: "text",
      content: text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChats(prev =>
      prev.map(c =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMsg], lastMsg: "You: " + text, time: newMsg.time }
          : c
      )
    );
  }

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {showModal && (
        <NewChatModal onClose={() => setShowModal(false)} onStart={() => setShowModal(false)} />
      )}

      <Sidebar
        chats={chats}
        activeId={activeId}
        onSelect={id => { setActiveId(id); setMobileOpen(false); }}
        onNewChat={() => setShowModal(true)}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="flex-1 flex min-w-0 h-full overflow-hidden">
        <ChatWindow
          chat={activeChat}
          onSendMessage={handleSend}
          onNewChat={() => setShowModal(true)}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />
      </main>
    </div>
  );
}
