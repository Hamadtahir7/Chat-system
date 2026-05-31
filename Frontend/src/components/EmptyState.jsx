// src/components/EmptyState.jsx
import { MessageSquare, UserPlus, Compass } from "lucide-react";

export default function EmptyState({ onNewChat }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center mb-6">
        <MessageSquare size={32} className="text-muted" />
      </div>
      <h2 className="text-xl font-bold text-primary mb-3 max-w-xs">
        Select a conversation or start a new one
      </h2>
      <p className="text-sm text-muted max-w-sm leading-relaxed mb-8">
        Your direct messages and channel discussions will appear here once you select them from the sidebar.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <div className="flex-1 bg-card border border-border rounded-xl p-5 text-center cursor-pointer
          hover:border-blue/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue/20 flex items-center justify-center mx-auto mb-3">
            <UserPlus size={18} className="text-blue-light" />
          </div>
          <p className="text-sm font-bold text-primary mb-1">Invite Team</p>
          <p className="text-xs text-muted leading-relaxed">Bring your colleagues to start collaborating.</p>
        </div>
        <div className="flex-1 bg-card border border-border rounded-xl p-5 text-center cursor-pointer
          hover:border-online/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-green-900/40 flex items-center justify-center mx-auto mb-3">
            <Compass size={18} className="text-online" />
          </div>
          <p className="text-sm font-bold text-primary mb-1">Explore Channels</p>
          <p className="text-xs text-muted leading-relaxed">Find public communities and workspaces.</p>
        </div>
      </div>
    </div>
  );
}
