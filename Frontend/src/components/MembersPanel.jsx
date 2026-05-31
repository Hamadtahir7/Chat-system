// src/components/MembersPanel.jsx
import { PlusCircle } from "lucide-react";
import Avatar from "./Avatar";

function MemberGroup({ label, members }) {
  if (!members.length) return null;
  return (
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">
        {label} — {members.length}
      </p>
      {members.map(m => (
        <div
          key={m.id}
          className={`flex items-center gap-2.5 py-1.5 ${!m.online ? "opacity-50" : ""}`}
        >
          <Avatar
            initials={m.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
            online={m.online}
            size="sm"
          />
          <div className="min-w-0">
            <p className={`text-xs font-semibold truncate ${m.online ? "text-primary" : "text-muted"}`}>
              {m.name}
            </p>
            {m.subtitle && <p className="text-[10px] text-muted truncate">{m.subtitle}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MembersPanel({ members }) {
  const owners  = members.filter(m => m.role === "owner");
  const admins  = members.filter(m => m.role === "admin");
  const online  = members.filter(m => m.role === "member" && m.online);
  const offline = members.filter(m => m.role === "member" && !m.online);

  return (
    <aside className="w-56 bg-gradient-to-b from-sidebar via-sidebar to-sidebar border-l border-border/50 flex flex-col flex-shrink-0 h-full backdrop-blur-sm">
      <div className="px-4 py-4 border-b border-border/30 flex-shrink-0">
        <p className="text-sm font-bold bg-gradient-to-r from-blue-light to-blue bg-clip-text text-transparent">
          Members{" "}
          <span className="text-muted font-normal">({members.length})</span>
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
        <MemberGroup label="Owner"   members={owners}  />
        <MemberGroup label="Admin"   members={admins}  />
        <MemberGroup label="Online"  members={online}  />
        <MemberGroup label="Offline" members={offline} />
      </div>

      <div className="px-4 py-3 border-t border-border/30 flex-shrink-0">
        <button className="w-full flex items-center justify-center gap-2 py-2.5
          glass-sm rounded-lg text-xs font-semibold text-primary
          hover:bg-card/50 transition-all glow-effect">
          <PlusCircle size={14} /> Invite Members
        </button>
      </div>
    </aside>
  );
}
