// src/components/NewChatModal.jsx
import { useState } from "react";
import { Search, X, ChevronRight, UserPlus } from "lucide-react";
import { SUGGESTED_CONTACTS } from "../data/mockData";
import Avatar from "./Avatar";

export default function NewChatModal({ onClose, onStart }) {
  const [query, setQuery]   = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = SUGGESTED_CONTACTS.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.username.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-md glass rounded-3xl p-7 glow-effect shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-light to-blue bg-clip-text text-transparent">New Chat</h3>
          <button onClick={onClose} className="text-muted hover:text-primary transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 glass-sm rounded-lg px-3 py-2 mb-4">
          <Search size={14} className="text-muted flex-shrink-0" />
          <input
            placeholder="Search by username or email..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-primary placeholder-muted flex-1"
          />
        </div>

        {/* New Group row */}
        <div className="flex items-center justify-between glass-sm rounded-xl
          px-4 py-3 mb-5 cursor-pointer hover:bg-card/30 transition-all glow-effect">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-900/40 flex items-center justify-center">
              <UserPlus size={16} className="text-online" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">New Group</p>
              <p className="text-xs text-muted">Create a space for your team to collaborate</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-muted" />
        </div>

        {/* Suggested */}
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted mb-3">Suggested Contacts</p>
        <div className="space-y-1">
          {filtered.map(u => (
            <div
              key={u.id}
              onClick={() => setSelected(u.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all
                ${selected === u.id
                  ? "glass-sm border border-blue-light/50 glow-effect"
                  : "hover:glass-sm border border-transparent"
                }`}
            >
              <Avatar initials={u.initials} online={u.online} size="md" />
              <div>
                <p className="text-sm font-semibold text-primary">{u.name}</p>
                <p className="text-xs text-muted">{u.username}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg glass-sm text-sm font-semibold
              text-primary hover:bg-card/30 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => { onStart(); onClose(); }}
            className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-blue-light to-blue hover:from-blue hover:to-blue-hover text-white
              text-sm font-semibold transition-all glow-effect"
          >
            Start Chat
          </button>
        </div>
      </div>
    </div>
  );
}
