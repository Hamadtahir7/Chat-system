// src/components/EmptyState.jsx
import { MessageSquare, UserPlus, Compass } from "lucide-react";

export default function EmptyState({ onNewChat }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative">
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-blue-light rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-blue rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      <div className="w-20 h-20 rounded-full glass flex items-center justify-center mb-6 glow-effect shadow-lg relative z-10">
        <MessageSquare size={32} className="text-blue-light" />
      </div>
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-light to-blue bg-clip-text text-transparent mb-3 max-w-xs relative z-10">
        Select a conversation or start a new one
      </h2>
      <p className="text-sm text-muted max-w-sm leading-relaxed mb-8 relative z-10">
        Your direct messages and channel discussions will appear here once you select them from the sidebar.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm relative z-10">
        <div className="flex-1 glass rounded-xl p-5 text-center cursor-pointer
          hover:bg-card/30 transition-all glow-effect shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-light/40 to-blue/40 flex items-center justify-center mx-auto mb-3">
            <UserPlus size={18} className="text-blue-light" />
          </div>
          <p className="text-sm font-bold text-primary mb-1">Invite Team</p>
          <p className="text-xs text-muted leading-relaxed">Bring your colleagues to start collaborating.</p>
        </div>
        <div className="flex-1 glass rounded-xl p-5 text-center cursor-pointer
          hover:bg-card/30 transition-all glow-effect shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-online/40 to-online/40 flex items-center justify-center mx-auto mb-3">
            <Compass size={18} className="text-online" />
          </div>
          <p className="text-sm font-bold text-primary mb-1">Explore Channels</p>
          <p className="text-xs text-muted leading-relaxed">Find public communities and workspaces.</p>
        </div>
      </div>
    </div>
  );
}
