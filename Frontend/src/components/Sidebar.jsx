// src/components/Sidebar.jsx
import { useState } from "react";
import { Search, Plus, HelpCircle, LogOut, MessageSquare } from "lucide-react";
import Avatar from "./Avatar";

export default function Sidebar({ chats, activeId, onSelect, onNewChat, onLogout, mobileOpen, onMobileClose }) {
  const [query, setQuery] = useState("");

  const filtered = chats.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-64 bg-gradient-to-b from-sidebar via-sidebar to-sidebar border-r border-border/50
          flex flex-col h-full
          transform transition-transform duration-200 ease-in-out
          backdrop-blur-sm
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border/30 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-light to-blue flex items-center justify-center flex-shrink-0 glow-effect shadow-lg">
            <MessageSquare size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-extrabold bg-gradient-to-r from-blue-light to-blue bg-clip-text text-transparent leading-tight">ChatApp</p>
            <p className="text-[9px] uppercase tracking-widest text-muted leading-tight">Precision Communication</p>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 pt-3 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2 glass-sm rounded-lg px-3 py-1.5">
            <Search size={13} className="text-muted flex-shrink-0" />
            <input
              placeholder="Search conversations..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-primary placeholder-muted flex-1 min-w-0"
            />
          </div>
        </div>

        {/* New Message */}
        <div className="px-3 pb-3 flex-shrink-0">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-light to-blue hover:from-blue hover:to-blue-hover
              text-white text-sm font-semibold rounded-lg transition-all duration-300 glow-effect shadow-lg"
          >
            <Plus size={15} /> New Message
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto px-2 min-h-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted px-2 pb-2">Messages</p>
          {filtered.map(c => (
            <button
              key={c.id}
              onClick={() => { onSelect(c.id); onMobileClose?.(); }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 text-left
                transition-all group
                ${activeId === c.id
                  ? "glass-sm border-l-2 border-blue-light glow-effect shadow-md"
                  : "hover:glass-sm border-l-2 border-transparent"
                }`}
            >
              <Avatar initials={c.initials} online={c.online} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className={`text-xs truncate max-w-[110px]
                    ${c.unread ? "font-bold text-primary" : "font-semibold text-primary"}`}>
                    {c.name}
                  </span>
                  <span className="text-[10px] text-muted flex-shrink-0 ml-1">{c.time}</span>
                </div>
                <p className="text-[11px] text-muted truncate">{c.lastMsg}</p>
              </div>
              {c.unread > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue text-white text-[10px] font-bold
                  flex items-center justify-center flex-shrink-0">
                  {c.unread}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom nav */}
        <div className="border-t border-border/30 px-2 py-3 flex-shrink-0">
          {[
            { icon: <HelpCircle size={15} />, label: "Help",   action: null     },
            { icon: <LogOut size={15} />,     label: "Logout", action: onLogout },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-muted
                hover:text-primary hover:glass-sm transition-all text-sm"
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
