// src/components/ChatWindow.jsx
import { useState, useRef, useEffect } from "react";
import {
  Hash, Bell, Settings, Users, Paperclip, Smile, Send, Menu, X
} from "lucide-react";
import MessageBubble from "./MessageBubble";
import MembersPanel from "./MembersPanel";
import EmptyState from "./EmptyState";

export default function ChatWindow({ chat, onSendMessage, onNewChat, onMobileMenuOpen }) {
  const [input, setInput]         = useState("");
  const [showMembers, setShowMembers] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  function handleSend() {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  }

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border md:hidden flex-shrink-0">
          <button onClick={onMobileMenuOpen} className="text-muted hover:text-primary transition-colors">
            <Menu size={20} />
          </button>
          <span className="text-sm font-bold text-primary">ChatApp</span>
        </div>
        <EmptyState onNewChat={onNewChat} />
      </div>
    );
  }

  const showRightPanel = showMembers && chat.members.length > 0;

  return (
    <div className="flex-1 flex min-w-0 h-full overflow-hidden">
      {/* Main chat column */}
      <div className="flex-1 flex flex-col min-w-0 h-full">

        {/* Top bar */}
        <div className="h-14 border-b border-border/30 glass-sm flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Mobile menu toggle */}
            <button
              onClick={onMobileMenuOpen}
              className="text-muted hover:text-primary transition-colors mr-1 md:hidden"
            >
              <Menu size={18} />
            </button>
            <Hash size={15} className="text-muted" />
            <span className="text-sm font-bold text-primary">{chat.name}</span>
            <span className={`w-2 h-2 rounded-full ${chat.online ? "bg-online" : "bg-offline"}`} />
          </div>
          <div className="flex items-center gap-3 text-muted">
            <button className="hover:text-primary transition-colors hidden sm:block"><Bell size={16} /></button>
            <button className="hover:text-primary transition-colors hidden sm:block"><Settings size={16} /></button>
            {chat.members.length > 0 && (
              <button
                onClick={() => setShowMembers(!showMembers)}
                className={`p-1.5 rounded-lg transition-all ${
                  showMembers ? "glass-sm text-blue-light glow-effect" : "hover:text-primary"
                }`}
              >
                <Users size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
          {chat.messages.map((msg, i) => {
            const prev = chat.messages[i - 1];
            const showName = !msg.mine && prev?.sender !== msg.sender;

            return (
              <div key={msg.id}>
                {/* New messages divider */}
                {msg.isNewSection && (
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] text-muted font-semibold uppercase tracking-widest">
                      New Messages
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}
                <MessageBubble msg={msg} showName={showName} />
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="px-4 py-3 border-t border-border/30 bg-gradient-to-t from-sidebar via-sidebar/50 to-transparent flex-shrink-0">
          <div className="flex items-center gap-2 glass-sm rounded-xl px-3 py-2.5">
            <button className="text-muted hover:text-primary transition-colors flex-shrink-0">
              <Paperclip size={16} />
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={`Message #${chat.name}`}
              className="flex-1 bg-transparent border-none outline-none text-sm text-primary
                placeholder-muted min-w-0"
            />
            <button className="text-muted hover:text-primary transition-colors flex-shrink-0">
              <Smile size={16} />
            </button>
            <button
              onClick={handleSend}
              className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-light to-blue hover:from-blue hover:to-blue-hover flex items-center justify-center
                flex-shrink-0 transition-all glow-effect"
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Right members panel — hidden on mobile */}
      {showRightPanel && (
        <div className="hidden lg:flex">
          <MembersPanel members={chat.members} />
        </div>
      )}
    </div>
  );
}
