// src/components/MessageBubble.jsx
import { FileText, Download } from "lucide-react";
import Avatar from "./Avatar";

export default function MessageBubble({ msg, showName }) {
  if (!msg) return null;
  
  const initials = (msg.sender || "U")
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`flex flex-col ${msg.mine ? "items-end" : "items-start"} mb-1.5`}>
      {/* Sender name for group chats */}
      {showName && !msg.mine && (
        <span className="text-xs font-semibold text-blue-light mb-1 pl-11">{msg.sender}</span>
      )}

      <div className={`flex items-end gap-2 ${msg.mine ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar (left side only, non-mine) */}
        {!msg.mine && showName  && <Avatar initials={initials} size="sm" />}
        {!msg.mine && !showName && <div className="w-7 flex-shrink-0" />}

        {/* Bubble */}
        <div className="max-w-sm md:max-w-md lg:max-w-lg">
          {msg.type === "file" ? (
            <div className="flex items-center gap-3 glass-sm rounded-xl px-4 py-3 glow-effect shadow-md">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-light to-blue flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary truncate">{msg.content}</p>
                <p className="text-xs text-muted">{msg.size}</p>
              </div>
              <button className="text-muted hover:text-primary transition-colors flex-shrink-0">
                <Download size={13} />
              </button>
            </div>
          ) : (
            <div
              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed text-primary shadow-md
                ${msg.mine
                  ? "bg-gradient-to-r from-blue-light to-blue rounded-br-sm glow-effect"
                  : "glass-sm rounded-bl-sm"
                }`}
            >
              {msg.content}
            </div>
          )}
          <p className={`text-[11px] text-muted mt-1 ${msg.mine ? "text-right" : "text-left"}`}>
            {msg.time}{msg.mine && " · You"}
          </p>
        </div>
      </div>
    </div>
  );
}
